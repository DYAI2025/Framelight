import React, { useState, useEffect } from "react";
import { Info, ShieldAlert, HeartHandshake, Eye, AlertTriangle, Scale, Award, ArrowUpRight, HelpCircle, Volume2, Square, Sparkles } from "lucide-react";
import { Finding, RiskLevel, ConfidenceLevel } from "../lib/types";
import { speakText, stopSpeaking, getTTSConfigForMarker } from "../lib/ttsUtils";

interface IntelligenceInspectorProps {
  activeFinding: Finding | null;
  topFindings: Finding[];
  onSelectFinding: (finding: Finding) => void;
}

export default function IntelligenceInspector({
  activeFinding,
  topFindings,
  onSelectFinding,
}: IntelligenceInspectorProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Stop speech synthesis if the inspected highlight changes
  useEffect(() => {
    stopSpeaking();
    setIsSpeaking(false);
  }, [activeFinding?.id]);

  const toggleSpeech = () => {
    if (!activeFinding) return;
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(
        activeFinding.quote,
        activeFinding.marker,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }
  };
  // Color resolve helpers
  const getRiskLabel = (risk: RiskLevel) => {
    switch (risk) {
      case "high": return "HOCH";
      case "medium": return "MITTEL";
      default: return "NIEDRIG";
    }
  };

  const getRiskBgClass = (risk: RiskLevel) => {
    switch (risk) {
      case "high": return "bg-[#FF5A5F]/10 text-[#FF5A5F] border-[#FF5A5F]/20";
      case "medium": return "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20";
      default: return "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20";
    }
  };

  const getConfLabel = (conf: ConfidenceLevel) => {
    switch (conf) {
      case "high": return "Hoch";
      case "medium": return "Mittel";
      default: return "Niedrig";
    }
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 3.6) return "bg-[#FF5A5F]";
    if (intensity >= 2.1) return "bg-[#F59E0B]";
    return "bg-[#10B981]";
  };

  // State: Default view when no finding is loaded or selected
  if (!activeFinding) {
    return (
      <div className="bg-white rounded-2xl border border-[#E4E8F0] p-5 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 pb-3.5 mb-4 border-b border-[#E4E8F0]">
            <Info className="w-4 h-4 text-[#2563EB]" />
            <h3 className="text-xs font-bold text-[#1D2433] uppercase tracking-wider">
              Intelligence Inspector
            </h3>
          </div>

          <div className="text-center py-6">
            <Scale className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h4 className="text-xs font-bold text-[#1D2433]">Kein Detailblick aktiv</h4>
            <p className="text-[11px] text-[#6B7280] mt-1 max-w-xs mx-auto">
              Wählen Sie ein Segment oder einen Marker im Chat-Protokoll aus, um linguistische Analysen und alternative Deutungen einzusehen.
            </p>
          </div>

          {topFindings.length > 0 && (
            <div className="mt-4 space-y-3">
              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
                Top 3 auffälligste Befunde:
              </span>
              <div className="space-y-2">
                {topFindings.slice(0, 3).map((finding) => (
                  <button
                    key={finding.id}
                    onClick={() => onSelectFinding(finding)}
                    className="w-full text-left p-3 border border-[#E4E8F0] bg-[#F9FAFC] rounded-xl hover:bg-[#F3F4F6] transition-all flex items-center justify-between gap-2.5 cursor-pointer group"
                  >
                    <div className="truncate max-w-[70%]">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#2563EB] font-mono">
                          {finding.segmentId}
                        </span>
                        <span className="text-xs font-bold text-[#1D2433] truncate group-hover:text-[#2563EB]">
                          {finding.marker}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#6B7280] truncate italic mt-1">
                        &quot;{finding.quote}&quot;
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-md ${getRiskBgClass(finding.risk)}`}>
                        i:{finding.finalIntensity.toFixed(1)}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#6B7280] opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Disclaimer statement protecting people from branding or pathologizing */}
        <div className="mt-5 pt-3.5 border-t border-[#E4E8F0] bg-[#F9FAFC] p-3 rounded-xl border">
          <div className="flex gap-2 text-[10px] text-[#6B7280] leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-gray-700">Wichtiger Schutzhinweis:</span> Diese App bewertet ausschließlich beobachtete Taktiken im Text und labelt keine Menschen dauerhaft als Manipulatoren. Kommunikationsfehler entstehen oft aus Stress oder Missverständnissen.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active Finding Screen
  const hasConvergence = activeFinding.convergenceMarkers && activeFinding.convergenceMarkers.length > 0;
  const hasMissingEvidence = activeFinding.missingEvidence && activeFinding.missingEvidence.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-[#E4E8F0] p-5 shadow-sm hover:shadow-md transition-all duration-300 space-y-4 max-h-[850px] overflow-y-auto">
      {/* Header Info */}
      <div className="pb-3 border-b border-[#E4E8F0] flex justify-between items-start gap-2">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
            <span className="font-mono text-[#2563EB] bg-sky-50 px-1.5 py-0.5 rounded-md border border-sky-100">
              {activeFinding.segmentId}
            </span>
            <span>· SPRECHER {activeFinding.speakerId}</span>
          </div>
          <h3 className="text-md font-bold text-[#1D2433] leading-tight mt-1.5">
            {activeFinding.marker}
          </h3>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getRiskBgClass(activeFinding.risk)}`}>
          {getRiskLabel(activeFinding.risk)}
        </span>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-2 gap-3 bg-[#F9FAFC] p-3 rounded-xl border border-[#E4E8F0] text-xs">
        <div>
          <span className="text-[10px] text-[#6B7280] block font-medium uppercase tracking-wider">Linguist. Intensität</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-full bg-[#E4E8F0] h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${getIntensityColor(activeFinding.finalIntensity)}`}
                style={{ width: `${(activeFinding.finalIntensity / 5) * 100}%` }}
              />
            </div>
            <span className="font-bold font-mono">{activeFinding.finalIntensity.toFixed(1)}</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] text-[#6B7280] block font-medium uppercase tracking-wider">Konfidenz (Beweisstärke)</span>
          <span className="font-bold text-gray-800 flex items-center gap-1.5 mt-1">
            <Award className="w-3.5 h-3.5 text-[#2563EB]" />
            {getConfLabel(activeFinding.confidence)} ({activeFinding.confidenceScore || 90}%)
          </span>
        </div>

        <div className="border-t border-[#E4E8F0]/80 pt-2 col-span-2 grid grid-cols-2 gap-2 mt-1">
          <div>
            <span className="text-[9px] text-[#6B7280] block uppercase">Muster-Überlagerung</span>
            <span className="font-semibold text-gray-700 block mt-0.5">
              {hasConvergence ? "Hoch (Konvergent)" : "Niedrig (Isoliert)"}
            </span>
          </div>
          <div>
            <span className="text-[9px] text-[#6B7280] block uppercase">Gegen-Resonanz danach</span>
            <span className={`font-semibold block mt-0.5 ${activeFinding.resonanceAfter ? "text-[#10B981]" : "text-[#FF5A5F]"}`}>
              {activeFinding.resonanceAfter ? "Vorhanden" : "Fehlt (Abwehr)"}
            </span>
          </div>
        </div>
      </div>

      {/* Literale Zitat mit TTS-Sprachausgabe */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#6B7280] uppercase tracking-wider block font-bold">Wörtlicher Beleg:</span>
          
          <button
            onClick={toggleSpeech}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
              isSpeaking
                ? "bg-red-50 text-red-500 border-red-200 animate-pulse"
                : "bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20 hover:bg-[#2563EB]/20"
            }`}
            title="Schnittstellen-Beleg anhören"
          >
            {isSpeaking ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stoppen</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Anhören</span>
              </>
            )}
          </button>
        </div>

        {/* Dynamic Waveform or Speech style meter */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#F9FAFC] border border-[#E4E8F0] rounded-lg text-[9px] font-mono text-gray-500">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Tonfall: {getTTSConfigForMarker(activeFinding.marker).modeName}</span>
          </span>
          {isSpeaking && (
            <div className="flex gap-0.5 items-end h-2.5 w-6">
              <span className="w-0.5 h-full bg-red-400 rounded-xs animate-bounce" style={{ animationDelay: "0.1s" }} />
              <span className="w-0.5 h-full bg-red-500 rounded-xs animate-bounce" style={{ animationDelay: "0.3s" }} />
              <span className="w-0.5 h-full bg-red-400 rounded-xs animate-bounce" style={{ animationDelay: "0.5s" }} />
            </div>
          )}
        </div>

        <blockquote className="border-l-4 border-[#2563EB] bg-[#2563EB]/5 p-3 rounded-r-xl text-xs text-[#1D2433] italic leading-relaxed relative">
          &quot;{activeFinding.quote}&quot;
        </blockquote>
      </div>

      {/* Warum auffällig */}
      <div className="space-y-1">
        <span className="text-[10px] text-[#6B7280] uppercase tracking-wider block font-bold">Analyse & Erklärung:</span>
        <p className="text-xs text-[#1D2433] leading-relaxed">
          {activeFinding.whyFlagged}
        </p>
      </div>

      {/* Juxtaposed Dual-Readings (The Golden Core of Neutrality) */}
      <div className="grid grid-cols-1 gap-3.5 pt-1.5">
        {/* Negative / Critical Reading */}
        <div className="border border-red-100 bg-red-50/20 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF5A5F]">
            <ShieldAlert className="w-4 h-4" />
            <span>Reguläre / Kritische Lesart (Wirkung)</span>
          </div>
          <p className="text-xs text-[#1D2433] leading-relaxed">
            {activeFinding.negativeReading}
          </p>
        </div>

        {/* Positive / Benign Reading */}
        <div className="border border-[#10B981]/20 bg-[#10B981]/5 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#10B981]">
            <HeartHandshake className="w-4 h-4" />
            <span>Wohlwollende / Deeskalierende Lesart (Minderlast)</span>
          </div>
          <p className="text-xs text-[#1D2433] leading-relaxed italic">
            {activeFinding.benignReading}
          </p>
        </div>
      </div>

      {/* Mögliche Funktion */}
      <div>
        <span className="text-[10px] text-[#6B7280] uppercase tracking-wider block font-bold">Mögliche Kommunikative Funktion:</span>
        <p className="text-xs text-[#1D2433] mt-1 p-2.5 bg-[#F9FAFC] border border-[#E4E8F0] rounded-lg">
          {activeFinding.possibleFunction}
        </p>
      </div>

      {/* Missing Context */}
      {hasMissingEvidence && (
        <div className="space-y-1.5">
          <span className="text-[10px] text-[#6B7280] uppercase tracking-wider block font-bold">Fehlende Kriterien für Absicherung:</span>
          <ul className="text-xs text-[#6B7280] list-disc list-inside space-y-1 pl-1">
            {activeFinding.missingEvidence.map((item, index) => (
              <li key={index} className="leading-tight">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Repair & Resonance Verification card */}
      <div className="border-t border-[#E4E8F0] pt-3.5 mt-2 space-y-2 text-xs">
        <span className="text-[10px] text-[#6B7280] uppercase tracking-wider block font-bold">
          Verbindendes Verhalten (Schadensminderung)
        </span>
        <div className="grid grid-cols-2 gap-2">
          <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
            activeFinding.repairAfter 
              ? "bg-[#10B981]/10 border-[#10B981]/20 text-[#10B981]" 
              : "bg-gray-50 border-gray-100 text-gray-500"
          }`}>
            <span className="w-2 h-2 rounded-full bg-current" />
            <div className="leading-tight text-[10px]">
              <p className="font-bold">Reparatur-Aktion</p>
              <p className="text-[9px] opacity-80">{activeFinding.repairAfter ? "Erfolgt im Verlauf" : "Keine Korrektur"}</p>
            </div>
          </div>

          <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
            activeFinding.resonanceAfter 
              ? "bg-[#10B981]/10 border-[#10B981]/20 text-[#10B981]" 
              : "bg-gray-50 border-gray-100 text-gray-500"
          }`}>
            <span className="w-2 h-2 rounded-full bg-current" />
            <div className="leading-tight text-[10px]">
              <p className="font-bold">Resonanz-Aktion</p>
              <p className="text-[9px] opacity-80">{activeFinding.resonanceAfter ? "Gegenseitig verankert" : "Fehlende Perspektive"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
