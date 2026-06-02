/**
 * wordthreat_API v1 Contracts (DTOs)
 * Isolated contract assumptions for the v1 standard endpoints.
 */

export interface WordthreatAnalyzeRequest {
  input: {
    type: "text"; // v1 is text-only
    text: string;
  };
  options?: {
    mode?: "quick" | "deep";
    marker_packs?: string[];
    evidence_report?: boolean;
  };
}

export interface WordthreatOverall {
  risk_level: "low" | "medium" | "high";
  risk_score: number; // 1.0 to 5.0
  confidence_score: number; // 1 to 100
  dominant_pattern: string;
  marker_density: number; // e.g. 33 or 0.33
  segments_analyzed: number;
  speakers_detected: number;
}

export interface WordthreatSegment {
  segment_id: string;
  speaker_id: string;
  text: string;
  timestamp: string | null;
}

export interface WordthreatMarkerFinding {
  finding_id: string;
  segment_id: string;
  speaker_id: string;
  quote: string;
  marker_name: string;
  category_name: string;
  intensity_score: number; // 1 to 5
  confidence: "low" | "medium" | "high";
  confidence_score: number; // 1 to 100
  risk_level: "low" | "medium" | "high";
  why_flagged: string;
  negative_reading: string;
  benign_interpretation: string;
  possible_function: string;
}

export interface WordthreatEvidenceItem {
  evidence_id: string;
  finding_id: string;
  description: string;
  type: string;
}

export interface WordthreatUiProjection {
  timeline?: {
    segmentId: string;
    maxIntensity: number;
    dominantMarker: string;
    risk: "low" | "medium" | "high";
    hasRepair: boolean;
    hasResonance: boolean;
  }[];
}

export interface WordthreatAnalyzeResponse {
  analysis_id: string;
  status: "completed" | "failed" | "processing";
  title?: string;
  summary?: string;
  overall: WordthreatOverall;
  segments: WordthreatSegment[];
  marker_findings: WordthreatMarkerFinding[];
  evidence_items: WordthreatEvidenceItem[];
  ui_projection?: WordthreatUiProjection;
}

export interface WordthreatHealthResponse {
  status: string;
  version: string;
  timestamp: string;
}

export interface WordthreatMarkerDefinition {
  name: string;
  category: string;
  description: string;
}

export interface WordthreatMarkersResponse {
  markers: WordthreatMarkerDefinition[];
}

export interface WordthreatMarkerPack {
  id: string;
  name: string;
  description: string;
  markers: string[];
}

export interface WordthreatMarkerPacksResponse {
  packs: WordthreatMarkerPack[];
}
