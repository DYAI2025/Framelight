export interface AnalysisInput {
  text: string;
  mode: 'quick' | 'deep';
  evidenceReport: boolean;
}

export type RiskLevel = 'low' | 'medium' | 'high';
export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface SpeakerDetail {
  id: string; // "A", "B", etc.
  label: string; // "Sprecher A", "Sprecher B", etc.
  overallRisk: RiskLevel;
  dominantTechniques: string[];
  markerCount: number;
  summary: string;
}

export interface Segment {
  id: string; // "S1", "S2", etc.
  speakerId: string; // "A", "B", "unknown", etc.
  text: string;
  timestamp: string | null;
  findings: string[]; // IDs of findings in this segment
}

export interface Finding {
  id: string; // "F1", "F2", etc.
  segmentId: string;
  speakerId: string;
  quote: string; // literal excerpt
  marker: string; // e.g., "Schuldumkehr", "Framing"
  category: string; // e.g., "Manipulation", "Druck", "Framing", "Empowerment", "Deeskalation"
  baseIntensity: number; // 1 to 5
  finalIntensity: number; // 1 to 5, computed
  confidence: ConfidenceLevel;
  confidenceScore: number; // e.g., 0 to 1 or 0 to 100
  risk: RiskLevel;
  evidence: string[];
  whyFlagged: string;
  negativeReading: string;
  benignReading: string;
  possibleFunction: string;
  missingEvidence: string[];
  repairBefore: boolean;
  repairAfter: boolean;
  resonanceBefore: boolean;
  resonanceAfter: boolean;
  repetitionCount: number;
  convergenceMarkers: string[];
}

export interface TimelinePoint {
  segmentId: string;
  maxIntensity: number;
  dominantMarker: string;
  risk: RiskLevel;
  hasRepair: boolean;
  hasResonance: boolean;
}

export interface AnalysisOutput {
  title: string;
  summary: string;
  overall: {
    manipulationRisk: RiskLevel;
    riskScore: number; // e.g., 1.0 to 5.0
    confidence: ConfidenceLevel;
    confidenceScore: number; // 1 to 100
    markerDensity: number; // e.g. number of markers or percentage
    dominantPattern: string;
    segmentsAnalyzed: number;
    speakersDetected: number;
  };
  speakers: SpeakerDetail[];
  segments: Segment[];
  findings: Finding[];
  timeline: TimelinePoint[];
}

export interface HistoryItem {
  id: string;
  title: string;
  date: string;
  risk: RiskLevel;
  riskScore: number;
  dominantPattern: string;
  text: string;
  output?: AnalysisOutput;
}
