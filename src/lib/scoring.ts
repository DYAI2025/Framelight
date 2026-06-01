import { Finding, RiskLevel } from './types';

/**
 * Clamps a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Returns RiskLevel based on numerical score (1.0 - 5.0)
 */
export function scoreToRiskLevel(score: number): RiskLevel {
  if (score <= 2.0) return 'low';
  if (score <= 3.5) return 'medium';
  return 'high';
}

/**
 * Computes the final intensity score for an individual finding
 */
export function computeFindingIntensity(finding: Partial<Finding>): {
  finalIntensity: number;
  risk: RiskLevel;
  repetitionBoost: number;
  convergenceBoost: number;
  noRepairBoost: number;
  noResonanceBoost: number;
  contextPenalty: number;
  benignReadingPenalty: number;
} {
  const baseIntensity = finding.baseIntensity || 3;

  // 1. Repetition Boost: Boosts if the finding has repetitions (e.g. 0 to 2 max)
  const repetitionCount = finding.repetitionCount || 0;
  const repetitionBoost = clamp(repetitionCount * 0.5, 0, 2);

  // 2. Convergence Boost: Boosts if multiple markers overlap in the same segment
  const convergenceMarkersCount = finding.convergenceMarkers?.length || 0;
  const convergenceBoost = clamp(convergenceMarkersCount * 0.5, 0, 2);

  // 3. No-Repair Boost: Boosts (+0.5 to +1.0) if no repair exists before/after
  let noRepairBoost = 0;
  if (!finding.repairBefore && !finding.repairAfter) {
    noRepairBoost = 1.0;
  } else if (!finding.repairAfter) {
    noRepairBoost = 0.5; // repair before but not after
  }

  // 4. No-Resonance Boost: Boosts (+0.5 to +1.0) if no resonance exists before/after
  let noResonanceBoost = 0;
  if (!finding.resonanceBefore && !finding.resonanceAfter) {
    noResonanceBoost = 1.0;
  } else if (!finding.resonanceAfter) {
    noResonanceBoost = 0.5;
  }

  // 5. Context Penalty: Reduces if context is low or missing evidence is noted
  const missingEvidenceCount = finding.missingEvidence?.length || 0;
  const contextPenalty = clamp(missingEvidenceCount * 0.25, 0, 1.0);

  // 6. Benign Reading Penalty: Reduces if benign reading is quite plausible half-hearted
  // We can simulate this based on length or specific tags, or default to a subtle penalty if benign reading is provided
  const hasBenignReading = !!finding.benignReading && finding.benignReading.trim().length > 10;
  const benignReadingPenalty = hasBenignReading ? 0.5 : 0;

  // Calculate final Intensity
  const rawFinal = baseIntensity +
    repetitionBoost +
    convergenceBoost +
    noRepairBoost +
    noResonanceBoost -
    contextPenalty -
    benignReadingPenalty;

  const finalIntensity = parseFloat(clamp(rawFinal, 1, 5).toFixed(1));
  const risk = scoreToRiskLevel(finalIntensity);

  return {
    finalIntensity,
    risk,
    repetitionBoost,
    convergenceBoost,
    noRepairBoost,
    noResonanceBoost,
    contextPenalty,
    benignReadingPenalty,
  };
}

/**
 * Aggregates all individual finding intensities to compute the overall manipulation risk and score.
 * If there are no findings, the scores are computed based on clean baseline.
 */
export function computeOverallScores(
  findings: Finding[],
  segmentsCount: number
): {
  riskScore: number;
  manipulationRisk: RiskLevel;
  dominantPattern: string;
} {
  if (findings.length === 0) {
    return {
      riskScore: 1.0,
      manipulationRisk: 'low',
      dominantPattern: 'Keine auffälligen Muster erkannt',
    };
  }

  // Average of final intensities
  const totalIntensity = findings.reduce((sum, f) => sum + f.finalIntensity, 0);
  let averageIntensity = totalIntensity / findings.length;

  // Density factor: if findings are highly dense relative to segments, we lightly boost
  const density = findings.length / Math.max(1, segmentsCount);
  if (density > 0.5) {
    averageIntensity += 0.3;
  }

  // Clamp overall score between 1 and 5
  const riskScore = parseFloat(clamp(averageIntensity, 1.0, 5.0).toFixed(1));
  const manipulationRisk = scoreToRiskLevel(riskScore);

  // Determine dominant pattern
  const patternCounts: Record<string, number> = {};
  findings.forEach((f) => {
    patternCounts[f.marker] = (patternCounts[f.marker] || 0) + 1;
  });

  let dominantPattern = 'Keine dominanten Muster';
  let maxCount = 0;
  Object.entries(patternCounts).forEach(([marker, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominantPattern = marker;
    }
  });

  return {
    riskScore,
    manipulationRisk,
    dominantPattern,
  };
}
