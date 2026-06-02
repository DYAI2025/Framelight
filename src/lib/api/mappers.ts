import { AnalysisOutput, Finding, Segment, SpeakerDetail, TimelinePoint, RiskLevel, ConfidenceLevel } from "../types";
import { WordthreatAnalyzeResponse, WordthreatMarkerFinding } from "./contracts";

/**
 * Maps standard Wordthreat v1 Response DTO to the legacy/current view-model AnalysisOutput.
 * This guarantees existing UI components render correctly.
 */
export function mapWordthreatResponseToAnalysisOutput(response: WordthreatAnalyzeResponse): AnalysisOutput {
  const title = response.title || "Analyseergebnis";
  const summary = response.summary || "Keine Zusammenfassung verfügbar.";

  // Determine Overall Info
  const inputOverall = response.overall;
  const overallRisk = inputOverall.risk_level || "low";
  const confidence: ConfidenceLevel = 
    inputOverall.confidence_score >= 75 ? "high" : 
    inputOverall.confidence_score >= 45 ? "medium" : "low";

  // Build segments & pre-cache segment-to-findings association
  const findingsBySegment = new Map<string, string[]>();
  response.marker_findings.forEach((f) => {
    const arr = findingsBySegment.get(f.segment_id) || [];
    arr.push(f.finding_id);
    findingsBySegment.set(f.segment_id, arr);
  });

  const segments: Segment[] = response.segments.map((seg) => ({
    id: seg.segment_id,
    speakerId: seg.speaker_id || "unknown",
    text: seg.text,
    timestamp: seg.timestamp || null,
    findings: findingsBySegment.get(seg.segment_id) || []
  }));

  // Map Findings
  const findings: Finding[] = response.marker_findings.map((f) => {
    // Collect specific evidence item descriptions
    const evidence = response.evidence_items
      .filter((ev) => ev.finding_id === f.finding_id)
      .map((ev) => ev.description);

    // Look up Timeline point flags for repair and resonance if projection exists
    const timelineMatch = response.ui_projection?.timeline?.find(
      (pt) => pt.segmentId === f.segment_id
    );

    return {
      id: f.finding_id,
      segmentId: f.segment_id,
      speakerId: f.speaker_id || "unknown",
      quote: f.quote || "",
      marker: f.marker_name || "Unbekanntes Muster",
      category: f.category_name || "Allgemein",
      baseIntensity: f.intensity_score || 1,
      finalIntensity: f.intensity_score || 1, // Adapt/normalize values
      confidence: f.confidence || "medium",
      confidenceScore: f.confidence_score || 50,
      risk: f.risk_level || "low",
      evidence: evidence.length > 0 ? evidence : ["Keine spezifischen linguistischen Indikatoren erfasst."],
      whyFlagged: f.why_flagged || "Kommunikationsanomalie identifiziert.",
      negativeReading: f.negative_reading || "Potenziell ausweichende Absicht.",
      benignReading: f.benign_interpretation || "Möglicherweise ungeschickter Selbstausdruck unter Stress.",
      possibleFunction: f.possible_function || "Entlastung von Verantwortung.",
      missingEvidence: [],
      repairBefore: timelineMatch?.hasRepair ?? false,
      repairAfter: timelineMatch?.hasRepair ?? false,
      resonanceBefore: timelineMatch?.hasResonance ?? false,
      resonanceAfter: timelineMatch?.hasResonance ?? false,
      repetitionCount: 1,
      convergenceMarkers: []
    };
  });

  // Calculate timelines
  let timeline: TimelinePoint[] = [];
  if (response.ui_projection?.timeline) {
    timeline = response.ui_projection.timeline.map((pt) => ({
      segmentId: pt.segmentId,
      maxIntensity: pt.maxIntensity,
      dominantMarker: pt.dominantMarker,
      risk: pt.risk as RiskLevel,
      hasRepair: pt.hasRepair,
      hasResonance: pt.hasResonance
    }));
  } else {
    // Dynamically calculate timeline if missing
    timeline = segments.map((seg) => {
      const segFindings = findings.filter((f) => f.segmentId === seg.id);
      let maxIntensity = 0;
      let dominantMarker = "";
      let risk: RiskLevel = "low";

      if (segFindings.length > 0) {
        maxIntensity = Math.max(...segFindings.map((f) => f.baseIntensity));
        const firstWithMax = segFindings.find((f) => f.baseIntensity === maxIntensity);
        dominantMarker = firstWithMax?.marker || "";
        // If any has high or medium, scale risk
        if (segFindings.some((f) => f.risk === "high")) risk = "high";
        else if (segFindings.some((f) => f.risk === "medium")) risk = "medium";
      }

      return {
        segmentId: seg.id,
        maxIntensity,
        dominantMarker,
        risk,
        hasRepair: false,
        hasResonance: false
      };
    });
  }

  // Calculate speaker profiles dynamically from segments and findings
  const speakerIds = Array.from(new Set(segments.map((s) => s.speakerId)));
  const speakers: SpeakerDetail[] = speakerIds.map((spId) => {
    const spFindings = findings.filter((f) => f.speakerId === spId);
    
    // Determine overall risk
    let overallRisk: RiskLevel = "low";
    if (spFindings.some((f) => f.risk === "high")) {
      overallRisk = "high";
    } else if (spFindings.some((f) => f.risk === "medium")) {
      overallRisk = "medium";
    }

    // Determine dominant techniques (markers used)
    const uniqueTechniques = Array.from(new Set(spFindings.map((f) => f.marker)));

    const label = spId === "unknown" ? "Unbekannter Sprecher" : `Sprecher ${spId}`;
    const markerCount = spFindings.length;
    
    const summaryText = markerCount > 0
      ? `Nutzt rhetorische Muster wie ${uniqueTechniques.slice(0, 3).join(", ")}. zeigt Handlungsbedarf.`
      : `Bleibt sachorientiert und unauffällig. Keine signifikanten Manipulationsmuster detektiert.`;

    return {
      id: spId,
      label,
      overallRisk,
      dominantTechniques: uniqueTechniques,
      markerCount,
      summary: summaryText
    };
  });

  return {
    title,
    summary,
    overall: {
      manipulationRisk: overallRisk,
      riskScore: inputOverall.risk_score || 1.0,
      confidence,
      confidenceScore: inputOverall.confidence_score || 50,
      markerDensity: inputOverall.marker_density || 0,
      dominantPattern: inputOverall.dominant_pattern || "Keine Auffälligkeiten",
      segmentsAnalyzed: inputOverall.segments_analyzed || segments.length,
      speakersDetected: inputOverall.speakers_detected || speakers.length
    },
    speakers,
    segments,
    findings,
    timeline
  };
}
