import { 
  WordthreatAnalyzeRequest, 
  WordthreatAnalyzeResponse, 
  WordthreatHealthResponse,
  WordthreatMarkersResponse,
  WordthreatMarkerPacksResponse
} from "./contracts";
import { normalizeApiError } from "./errors";
import { WORDTHREAT_MOCK_SUCCESS_FIXTURE } from "./fixtures";

export class WordthreatClient {
  private baseUrl: string;
  private isDemoMode: boolean;

  constructor() {
    const metaEnv = (import.meta as any).env || {};
    this.baseUrl = metaEnv.VITE_WORDTHREAT_API_BASE_URL || "/api";
    this.isDemoMode = metaEnv.VITE_WORDTHREAT_DEMO_MODE === "true" || !metaEnv.VITE_WORDTHREAT_API_BASE_URL;
  }

  /**
   * Helper utility to dispatch fetch requests to the wordthreat API
   */
  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    try {
      const url = `${this.baseUrl.replace(/\/$/, "")}${path}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options?.headers || {})
        }
      });
      if (!response.ok) {
        throw response;
      }
      return await response.json();
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  /**
   * GET /v1/health
   */
  async getHealth(): Promise<WordthreatHealthResponse> {
    if (this.isDemoMode) {
      return {
        status: "healthy",
        version: "1.0.0-demo",
        timestamp: new Date().toISOString()
      };
    }
    return this.request<WordthreatHealthResponse>("/v1/health");
  }

  /**
   * POST /v1/analyze (Text only)
   */
  async analyzeText(
    text: string, 
    options?: { mode?: "quick" | "deep"; evidence_report?: boolean; marker_packs?: string[] }
  ): Promise<WordthreatAnalyzeResponse> {
    if (this.isDemoMode) {
      // Simulate real-world network transmission latency
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockResponse = JSON.parse(JSON.stringify(WORDTHREAT_MOCK_SUCCESS_FIXTURE)) as WordthreatAnalyzeResponse;

      // Real-time custom text parser/segmenter: allows reviewing arbitrary texts in demo mode.
      if (text && text.trim() !== "") {
        const lines = text.split("\n").filter((l) => l.trim() !== "");
        if (lines.length > 0) {
          const customSegments = lines.map((line, idx) => {
            let speaker_id = "A";
            let plainText = line;
            // Match typical conversation prefix like "A: Hallo" or "Sprecher B: ..."
            const match = line.match(/^([^:]+):\s*(.*)$/);
            if (match) {
              const speakerLabel = match[1].trim();
              speaker_id = speakerLabel.match(/B$|Sprecher\s*B$/i) ? "B" : "A";
              plainText = match[2].trim();
            }
            return {
              segment_id: `S${idx + 1}`,
              speaker_id,
              text: plainText,
              timestamp: null
            };
          });

          mockResponse.segments = customSegments;

          // Dynamically map existing findings mock templates to mapped segments index-modulo
          mockResponse.marker_findings = WORDTHREAT_MOCK_SUCCESS_FIXTURE.marker_findings.map((f, findIdx) => {
            const mappedSegIdx = findIdx % lines.length;
            const targetSegId = `S${mappedSegIdx + 1}`;
            const currentSegText = customSegments[mappedSegIdx]?.text || "test";

            return {
              ...f,
              segment_id: targetSegId,
              quote: currentSegText.length > 30 ? currentSegText.substring(0, 30) + "..." : currentSegText,
              speaker_id: customSegments[mappedSegIdx]?.speaker_id || "A"
            };
          }).slice(0, lines.length);

          // Correct evidence references to point securely to mock findings
          mockResponse.evidence_items = WORDTHREAT_MOCK_SUCCESS_FIXTURE.evidence_items.map((ev, evIdx) => {
            const matchingFinding = mockResponse.marker_findings[evIdx % mockResponse.marker_findings.length];
            return {
              ...ev,
              finding_id: matchingFinding ? matchingFinding.finding_id : "F1"
            };
          });

          // Compute matching timeline projections
          mockResponse.ui_projection = {
            timeline: customSegments.map((seg, idx) => {
              const segFindings = mockResponse.marker_findings.filter((f) => f.segment_id === seg.segment_id);
              const hasFindings = segFindings.length > 0;
              const maxIntensity = hasFindings ? Math.max(...segFindings.map((f) => f.intensity_score)) : 0;
              const markerMatch = segFindings[0]?.marker_name || "";
              const risk_level: "low" | "medium" | "high" = maxIntensity >= 4 ? "high" : maxIntensity >= 2 ? "medium" : "low";

              return {
                segmentId: seg.segment_id,
                maxIntensity,
                dominantMarker: markerMatch,
                risk: risk_level,
                // Add repair behavior on last segment
                hasRepair: idx === lines.length - 1 && lines.length > 3,
                hasResonance: idx === lines.length - 1 && lines.length > 3
              };
            })
          };

          // Re-calculate mock statistics metadata
          mockResponse.overall = {
            ...mockResponse.overall,
            segments_analyzed: customSegments.length,
            marker_density: Math.round((mockResponse.marker_findings.length / customSegments.length) * 100)
          };
        }
      }

      return mockResponse;
    }

    const payload: WordthreatAnalyzeRequest = {
      input: {
        type: "text",
        text
      },
      options: {
        mode: options?.mode,
        marker_packs: options?.marker_packs,
        evidence_report: options?.evidence_report
      }
    };

    return this.request<WordthreatAnalyzeResponse>("/v1/analyze", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  /**
   * GET /v1/analyses/{analysis_id}
   */
  async getAnalysis(analysisId: string): Promise<WordthreatAnalyzeResponse> {
    if (this.isDemoMode) {
      return WORDTHREAT_MOCK_SUCCESS_FIXTURE;
    }
    return this.request<WordthreatAnalyzeResponse>(`/v1/analyses/${analysisId}`);
  }

  /**
   * GET /v1/markers
   */
  async getMarkers(): Promise<WordthreatMarkersResponse> {
    if (this.isDemoMode) {
      return {
        markers: [
          { name: "Abwertung / Minimierung", category: "Abwertung", description: "Rhetorische Herabsetzung des Gegenübers." },
          { name: "Schuldumkehr & Framing", category: "Druck", description: "Verschiebung der Schuldzuweisung auf sachliche Kritiker." },
          { name: "Mitleidsappell", category: "Druck", description: "Erschleichung von Nachsicht durch Klagen über Stress." },
          { name: "Whataboutism", category: "Diversion", description: "Umlenken auf ablenkende Nebenschauplätze." }
        ]
      };
    }
    return this.request<WordthreatMarkersResponse>("/v1/markers");
  }

  /**
   * GET /v1/marker-packs
   */
  async getMarkerPacks(): Promise<WordthreatMarkerPacksResponse> {
    if (this.isDemoMode) {
      return {
        packs: [
          { id: "pack-default", name: "Standard-Taktiken", description: "Standardmuster für Deeskalation & Analyse", markers: ["Abwertung / Minimierung", "Schuldumkehr & Framing"] }
        ]
      };
    }
    return this.request<WordthreatMarkerPacksResponse>("/v1/marker-packs");
  }
}

export const wordthreatClient = new WordthreatClient();
