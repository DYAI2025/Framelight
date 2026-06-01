import React from "react";
import { 
  ShieldAlert, 
  CheckCircle, 
  Percent, 
  AlertCircle, 
  Info, 
  FileText, 
  Users, 
  Cpu, 
  Activity, 
  BarChart3, 
  TrendingUp, 
  CornerDownRight,
  ShieldCheck,
  AlertTriangle,
  Lightbulb
} from "lucide-react";
import { AnalysisOutput, RiskLevel, ConfidenceLevel } from "../lib/types";

interface SummaryCardsProps {
  output: AnalysisOutput | null;
  isLoading: boolean;
}

export default function SummaryCards({ output, isLoading }: SummaryCardsProps) {
  // Color resolve helpers
  const riskColor = (risk: RiskLevel) => {
    switch (risk) {
      case "high": return { 
        text: "text-[#FF5A5F]", 
        bg: "bg-[#FF5A5F]/10", 
        border: "border-[#FF5A5F]/20", 
        fill: "bg-gradient-to-r from-[#FF5A5F] to-[#FF7E82]",
        lightFill: "bg-[#FF5A5F]"
      };
      case "medium": return { 
        text: "text-[#F59E0B]", 
        bg: "bg-[#F59E0B]/10", 
        border: "border-[#F59E0B]/20", 
        fill: "bg-gradient-to-r from-[#F59E0B] to-[#FBBF24]",
        lightFill: "bg-[#F59E0B]"
      };
      default: return { 
        text: "text-[#10B981]", 
        bg: "bg-[#10B981]/10", 
        border: "border-[#10B981]/20", 
        fill: "bg-gradient-to-r from-[#10B981] to-[#34D399]",
        lightFill: "bg-[#10B981]"
      };
    }
  };

  const confidenceColor = (conf: ConfidenceLevel) => {
    switch (conf) {
      case "high": return { text: "text-[#10B981]", bg: "bg-[#10B981]/10", border: "border-[#10B981]/20" };
      case "medium": return { text: "text-[#2563EB]", bg: "bg-[#2563EB]/10", border: "border-[#2563EB]/20" };
      default: return { text: "text-[#6B7280]", bg: "bg-[#F1F4F9]", border: "border-[#E4E8F0]" };
    }
  };

  const getRiskLabel = (risk: RiskLevel) => {
    switch (risk) {
      case "high": return "ERHÖHT";
      case "medium": return "GEMÄSSIGT";
      default: return "MINIMAL";
    }
  };

  const getConfLabel = (conf: ConfidenceLevel) => {
    switch (conf) {
      case "high": return "HOCH";
      case "medium": return "MITTEL";
      default: return "GERING";
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 animate-pulse">
        {/* Skeleton Card 1 (Risk) */}
        <div className="md:col-span-12 lg:col-span-4 bg-white rounded-2xl border border-[#E4E8F0] p-5 h-[160px] flex flex-col justify-between" />
        {/* Skeleton Card 2 (Confidence) */}
        <div className="md:col-span-6 lg:col-span-3 bg-white rounded-2xl border border-[#E4E8F0] p-5 h-[160px] flex flex-col justify-between" />
        {/* Skeleton Card 3 (Density/Frequency) */}
        <div className="md:col-span-6 lg:col-span-5 bg-white rounded-2xl border border-[#E4E8F0] p-5 h-[160px] flex flex-col justify-between" />
        {/* Skeleton Card 4 (Dominant Pattern) */}
        <div className="md:col-span-12 lg:col-span-7 bg-white rounded-2xl border border-[#E4E8F0] p-5 h-[140px] flex flex-col justify-between" />
        {/* Skeleton Card 5 (Metadata synopsis) */}
        <div className="md:col-span-12 lg:col-span-5 bg-white rounded-2xl border border-[#E4E8F0] p-5 h-[140px] flex flex-col justify-between" />
      </div>
    );
  }

  const activeOutput = output;

  return (
    <div className="space-y-5">
      {/* Bento Grid Header */}
      <div className="flex items-center justify-between pb-1">
        <div className="space-y-1">
          <h2 className="text-xs font-bold text-[#6B7280] uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Verlaufs-Indikatoren & Metriken</span>
          </h2>
          <p className="text-[10px] text-[#6B7280]">
            Dynamisches bento-strukturiertes Dashboard mit automatischer statistischer Gewichtung.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Card 1: Manipulationsrisiko (Col span 4 - Tall Bento block) */}
        <div className="md:col-span-12 lg:col-span-4 bg-white rounded-2xl border border-[#E4E8F0] p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#2563EB]" />
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1D2433] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#2563EB]" />
              <span>Manipulationsrisiko</span>
            </span>
            {activeOutput ? (
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${riskColor(activeOutput.overall.manipulationRisk).bg} ${riskColor(activeOutput.overall.manipulationRisk).text} border ${riskColor(activeOutput.overall.manipulationRisk).border}`}>
                {getRiskLabel(activeOutput.overall.manipulationRisk)}
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-400 border border-gray-200">BEREIT</span>
            )}
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-[#1D2433] tracking-tight">
              {activeOutput ? activeOutput.overall.riskScore.toFixed(1) : "0.0"}
            </span>
            <span className="text-[#6B7280] text-sm font-medium">/ 5.0</span>
            {activeOutput && activeOutput.overall.riskScore > 3.5 && (
              <span className="text-[10px] text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-100 animate-pulse ml-2">Auffällig</span>
            )}
          </div>

          <div className="space-y-2 mt-2">
            {/* Multi-tiered progress range slider */}
            <div className="w-full bg-[#F1F4F9] h-2 rounded-full overflow-hidden relative">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  activeOutput ? riskColor(activeOutput.overall.manipulationRisk).fill : "bg-gray-300"
                }`}
                style={{ width: `${activeOutput ? (activeOutput.overall.riskScore / 5.0) * 100 : 0}%` }}
              />
            </div>
            
            {/* Visual labels under slider */}
            <div className="flex justify-between text-[9px] text-gray-400 font-semibold uppercase tracking-wider px-0.5">
              <span className={activeOutput && activeOutput.overall.riskScore <= 1.5 ? "text-[#10B981] font-bold" : ""}>Minimal</span>
              <span className={activeOutput && activeOutput.overall.riskScore > 1.5 && activeOutput.overall.riskScore <= 3.5 ? "text-[#F59E0B] font-bold" : ""}>Mittel</span>
              <span className={activeOutput && activeOutput.overall.riskScore > 3.5 ? "text-[#FF5A5F] font-bold" : ""}>Erhöht</span>
            </div>
          </div>
        </div>

        {/* Card 2: Confidence (Col span 3) */}
        <div className="md:col-span-6 lg:col-span-3 bg-white rounded-2xl border border-[#E4E8F0] p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1D2433] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <span>Konfidenz</span>
            </span>
            {activeOutput ? (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${confidenceColor(activeOutput.overall.confidence).bg} ${confidenceColor(activeOutput.overall.confidence).text} border ${confidenceColor(activeOutput.overall.confidence).border}`}>
                {getConfLabel(activeOutput.overall.confidence)}
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-400 border border-gray-200">BEREIT</span>
            )}
          </div>

          <div className="my-3 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-4xl font-extrabold text-[#1D2433] tracking-tight">
                {activeOutput ? `${activeOutput.overall.confidenceScore}%` : "0%"}
              </span>
              <span className="text-[9px] font-bold text-[#6B7280] tracking-wider uppercase mt-1">Eindeutigkeit</span>
            </div>
            
            {/* Circular HUD Gauge */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#F1F4F9]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`transition-all duration-1000 ${
                    activeOutput ? (activeOutput.overall.confidence === "high" ? "text-[#10B981]" : "text-[#2563EB]") : "text-gray-300"
                  }`}
                  strokeWidth="4"
                  strokeDasharray={`${activeOutput ? activeOutput.overall.confidenceScore : 0}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[10px] font-extrabold text-[#1D2433]">
                {activeOutput ? `${activeOutput.overall.confidenceScore}` : "—"}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-[#6B7280] font-medium leading-tight">
            {activeOutput ? "Ergebnissicherheit gestützt durch Textindizien." : "Wartet auf Analysekonfiguration."}
          </p>
        </div>

        {/* Card 3: Marker-Dichte & Frequenz-Spectrum (Col span 5 - Wide Bento grid block) */}
        <div className="md:col-span-6 lg:col-span-5 bg-white rounded-2xl border border-[#E4E8F0] p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1D2433] uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-violet-500" />
              <span>Marker-Dichte & Spektrum</span>
            </span>
            <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded border border-violet-100">
              {activeOutput ? `${activeOutput.findings.length} VORLAGEN` : "STATIK"}
            </span>
          </div>

          <div className="flex gap-4 items-end justify-between mt-2">
            <div className="flex flex-col">
              <span className="text-4xl font-extrabold text-[#1D2433] tracking-tight">
                {activeOutput ? `${activeOutput.findings.length}` : "—"}
              </span>
              <span className="text-[9px] font-bold text-[#6B7280] tracking-wider uppercase mt-1">Ermittelte Phänomene</span>
            </div>

            {/* Custom Spectral Visualizers Block */}
            <div className="flex gap-1 h-12 flex-1 items-end justify-end max-w-[150px]">
              {activeOutput ? (
                [...Array(12)].map((_, idx) => {
                  const threshold = (idx / 12) * 100;
                  const isActive = activeOutput.overall.markerDensity >= threshold;
                  return (
                    <div
                      key={idx}
                      className={`w-1.5 rounded-sm transition-all duration-500 ${
                        isActive 
                          ? activeOutput.overall.manipulationRisk === "high" 
                            ? "bg-[#FF5A5F]" 
                            : activeOutput.overall.manipulationRisk === "medium"
                              ? "bg-[#F59E0B]"
                              : "bg-[#10B981]"
                          : "bg-[#F1F4F9]"
                      }`}
                      style={{ height: `${25 + (idx % 4) * 25}%` }}
                    />
                  );
                })
              ) : (
                [...Array(12)].map((_, idx) => (
                  <div key={idx} className="w-1.5 bg-[#F1F4F9] rounded-sm" style={{ height: `${20 + (idx % 3) * 20}%` }} />
                ))
              )}
            </div>
          </div>

          <p className="text-[10px] text-[#6B7280] font-medium leading-tight mt-1.5 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-violet-500" />
            <span>Relative Häufigkeit im Verlauf: {activeOutput ? `${activeOutput.overall.markerDensity}%` : "Inaktiv"}</span>
          </p>
        </div>

        {/* Row 2: Card 4: Dominantes Erkennungsmuster (Asymmetric Card - Col span 7) */}
        <div className="md:col-span-12 lg:col-span-7 bg-white rounded-2xl border border-[#E4E8F0] p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500" />
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1D2433] uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Dominantes Taktik-Muster</span>
            </span>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
              PROMINENT
            </span>
          </div>

          <div className="my-3 flex items-start gap-3">
            <span className="p-3 bg-amber-500/10 text-amber-600 rounded-xl mt-1 shrink-0 border border-amber-500/20">
              <Cpu className="w-5 h-5 animate-pulse" />
            </span>
            <div className="space-y-1 overflow-hidden">
              <h4 className="text-md font-bold text-[#1D2433] truncate">
                {activeOutput ? activeOutput.overall.dominantPattern : "Wartet auf Scan-Ergebnis"}
              </h4>
              <p className="text-[11px] text-[#6B7280] leading-relaxed line-clamp-2">
                {activeOutput 
                  ? `Dieses Muster wurde am häufigsten im Dokumentverlauf registriert. Es signalisiert einen Fokus auf strategische Gesprächsführung.` 
                  : "Starten Sie eine Analyse auf der linken Seite, um Daten zu extrahieren."}
              </p>
            </div>
          </div>

          <div className="mt-1 pt-2 border-t border-[#F1F4F9] flex items-center justify-between text-[10px] text-gray-500">
            <span className="font-semibold">Sicherheitsberatung:</span>
            <span className="text-amber-600 font-bold flex items-center gap-1.5">
              <CornerDownRight className="w-3.5 h-3.5" />
              {activeOutput ? "Deeskalations-Modus & Ich-Botschaften empfohlen" : "Warten auf Belege"}
            </span>
          </div>
        </div>

        {/* Row 2: Card 5: Metadata Synopsis & Brief Summary (Asymmetric Card - Col span 5) */}
        <div className="md:col-span-12 lg:col-span-5 bg-white rounded-2xl border border-[#E4E8F0] p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl -mr-5 -mt-5" />
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1D2433] uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-blue-500" />
              <span>AI-Synopsis & Metadaten</span>
            </span>
            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
              LIVE ENGINE
            </span>
          </div>

          {activeOutput ? (
            <div className="my-2.5 space-y-2">
              <p className="text-xs text-[#6B7280] italic line-clamp-3 leading-relaxed">
                &quot;{activeOutput.summary || "Ergebnis-Dokumentation ohne Freitext-Zusammenfassung abgeschlossen."}&quot;
              </p>
            </div>
          ) : (
            <div className="my-3 flex items-center justify-center p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-[10px] text-gray-400 font-semibold text-center uppercase tracking-wider">
                Keine aktive Fallsynopsis
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-[#F1F4F9]">
            <div className="text-center p-1.5 bg-[#F9FAFC] rounded-lg border border-[#E4E8F0]">
              <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider block">Segmente</span>
              <span className="text-xs font-extrabold text-[#1D2433] mt-0.5 block">
                {activeOutput ? activeOutput.overall.segmentsAnalyzed : "—"}
              </span>
            </div>
            <div className="text-center p-1.5 bg-[#F9FAFC] rounded-lg border border-[#E4E8F0]">
              <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider block">Sprecher</span>
              <span className="text-xs font-extrabold text-[#1D2433] mt-0.5 block">
                {activeOutput ? activeOutput.overall.speakersDetected : "—"}
              </span>
            </div>
            <div className="text-center p-1.5 bg-[#F9FAFC] rounded-lg border border-[#E4E8F0]">
              <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider block">Engine</span>
              <span className="text-[10px] font-extrabold text-[#2563EB] mt-0.5 block truncate">
                {activeOutput ? "Gemini-3.5" : "—"}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
