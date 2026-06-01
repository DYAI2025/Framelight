import { AlertCircle, HelpCircle, HeartHandshake, ShieldAlert, Sparkles } from "lucide-react";
import { TimelinePoint, RiskLevel } from "../lib/types";

interface EvidenceTimelineProps {
  timeline: TimelinePoint[];
  activeSegmentId: string | null;
  setActiveSegmentId: (id: string | null) => void;
  outputFindings: any[];
}

export default function EvidenceTimeline({
  timeline,
  activeSegmentId,
  setActiveSegmentId,
  outputFindings,
}: EvidenceTimelineProps) {
  if (timeline.length === 0) {
    return null;
  }

  // Map risk level to color utilities
  const getPointColorClass = (risk: RiskLevel, maxIntensity: number) => {
    if (maxIntensity === 0) return "bg-gray-300 border-gray-400 text-gray-400";
    switch (risk) {
      case "high": return "bg-[#FF5A5F] border-[#FF5A5F] text-white";
      case "medium": return "bg-[#F59E0B] border-[#F59E0B] text-white";
      default: return "bg-[#10B981] border-[#10B981] text-white";
    }
  };

  const getPointBorderClass = (risk: RiskLevel, maxIntensity: number, isActive: boolean) => {
    if (!isActive) return "border-2 border-transparent";
    if (maxIntensity === 0) return "ring-2 ring-gray-400 ring-offset-2";
    switch (risk) {
      case "high": return "ring-2 ring-[#FF5A5F] ring-offset-2";
      case "medium": return "ring-2 ring-[#F59E0B] ring-offset-2";
      default: return "ring-2 ring-[#10B981] ring-offset-2";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E4E8F0] p-5 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-[#E4E8F0]">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#2563EB]" />
          <h3 className="text-xs font-bold text-[#1D2433] uppercase tracking-wider">
            Evidence Timeline & Kommunikationsverlauf
          </h3>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-[#6B7280]">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5A5F]" />
            <span>Kritisch (Risk &gt; 3.5)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            <span>Sicherheitszone</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <span>Reparatur & Deeskalation</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
            <span>Neutral / Kontext</span>
          </div>
        </div>
      </div>

      {/* Horizontal Timeline Container */}
      <div className="relative pt-6 pb-4 overflow-x-auto">
        <div className="absolute top-[52px] left-0 right-0 h-0.5 bg-gray-200" style={{ minWidth: `${timeline.length * 60}px` }} />

        <div className="relative flex items-end justify-between min-w-max gap-4 px-4 h-24" style={{ minWidth: `${timeline.length * 90}px` }}>
          {timeline.map((point) => {
            const isActive = activeSegmentId === point.segmentId;
            const sizeMultiplier = 8 + (point.maxIntensity * 6); // size linked to finalIntensity (e.g. 8px up to 38px)
            const resolvedFindings = outputFindings.filter(f => f.segmentId === point.segmentId);
            
            // Check structural boosts
            const targetFinding = resolvedFindings[0];
            const hasMultipleTypes = resolvedFindings.length > 1;
            const hasRepetition = targetFinding ? targetFinding.repetitionCount > 1 : false;
            const missingPartnerRepair = targetFinding ? (!targetFinding.repairBefore && !targetFinding.repairAfter) : false;

            return (
              <div
                key={point.segmentId}
                onClick={() => setActiveSegmentId(point.segmentId)}
                className="flex flex-col items-center cursor-pointer group flex-1"
                style={{ width: "80px" }}
              >
                {/* Visual Indicators & Boost flags above point */}
                <div className="h-10 flex items-center justify-center gap-1 mb-1 relative">
                  {/* Alert symbols for specific negative combinations */}
                  {point.maxIntensity > 3.5 && missingPartnerRepair && (
                    <span className="text-[9px] bg-red-100 text-[#FF5A5F] px-1 rounded-sm font-bold border border-red-200 uppercase leading-none" title="Keine Reparatur nach Vorfall">
                      ⚠️ NR
                    </span>
                  )}
                  {hasRepetition && (
                    <span className="text-[9px] bg-[#F59E0B]/10 text-[#F59E0B] px-1 rounded-sm font-bold border border-[#F59E0B]/20 uppercase leading-none" title="Repetitives Muster">
                      🔄 R
                    </span>
                  )}
                  {hasMultipleTypes && (
                    <span className="text-[9px] bg-[#7C3AED]/10 text-[#7C3AED] px-1 rounded-sm font-bold border border-[#7C3AED]/20 uppercase leading-none" title="Multiple Muster-Konvergenz">
                      ⚡ M
                    </span>
                  )}
                </div>

                {/* Timeline Node Point representing segment */}
                <div className="h-11 flex items-center justify-center relative">
                  <div
                    className={`rounded-full shadow-xs flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 ${getPointColorClass(
                      point.risk,
                      point.maxIntensity
                    )} ${getPointBorderClass(point.risk, point.maxIntensity, isActive)}`}
                    style={{
                      width: `${sizeMultiplier}px`,
                      height: `${sizeMultiplier}px`,
                      minHeight: "16px",
                      minWidth: "16px",
                    }}
                  >
                    {/* Display intensity number if sized appropriately */}
                    {point.maxIntensity > 0 && sizeMultiplier > 24 && (
                      <span className="text-[10px] font-bold font-mono">
                        {point.maxIntensity.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Info Text debajo del punto */}
                <div className="mt-2.5 text-center">
                  <span className={`text-[10px] font-bold block ${isActive ? "text-[#2563EB] pr-0.5" : "text-[#1D2433]"}`}>
                    {point.segmentId}
                  </span>
                  <span className="text-[9px] text-[#6B7280] block truncate max-w-[85px]" title={point.dominantMarker}>
                    {point.dominantMarker === "-" ? "Neutral" : point.dominantMarker}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Legend Information block */}
      <div className="mt-3.5 bg-[#F9FAFC] border border-[#E4E8F0] p-3 rounded-xl flex items-center gap-2.5 text-[10px] text-[#6B7280]">
        <HelpCircle className="w-5 h-5 text-[#2563EB] flex-shrink-0" />
        <div>
          <p className="font-semibold text-gray-700">Verstärkungsindikatoren auf der Timeline:</p>
          <p>
            <span className="font-bold bg-red-100 text-[#FF5A5F] px-1 rounded-xs">NR</span> = Keine Reparatur vorhanden (kein Brückenbau) ·{" "}
            <span className="font-bold bg-[#F59E0B]/10 text-[#F59E0B] px-1 rounded-xs">R</span> = Repetitives Muster (Wiederholung stärkt Wirkung) ·{" "}
            <span className="font-bold bg-[#7C3AED]/10 text-[#7C3AED] px-1 rounded-xs">M</span> = Multiple Konvergenz (Mehrere Taktiken überlagert)
          </p>
        </div>
      </div>
    </div>
  );
}
