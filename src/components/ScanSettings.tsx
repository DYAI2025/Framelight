import React from "react";
import { 
  Sliders, 
  Play, 
  RefreshCw, 
  FileText, 
  FileAudio, 
  FileVideo, 
  Sparkles, 
  AlertCircle
} from "lucide-react";
import { HistoryItem } from "../lib/types";

interface ScanSettingsProps {
  text: string;
  setText: (txt: string) => void;
  mode: "quick" | "deep";
  setMode: (m: "quick" | "deep") => void;
  evidenceReport: boolean;
  setEvidenceReport: (val: boolean) => void;
  onAnalyze: () => void;
  onLoadSample: () => void;
  isLoading: boolean;
  validationError: string | null;
  history: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  activeMediaType: "text" | "audio" | "video";
  setActiveMediaType: (type: "text" | "audio" | "video") => void;
}

export default function ScanSettings({
  text,
  setText,
  mode,
  setMode,
  evidenceReport,
  setEvidenceReport,
  onAnalyze,
  onLoadSample,
  isLoading,
  validationError,
  history,
  onSelectHistoryItem,
  activeMediaType,
  setActiveMediaType,
}: ScanSettingsProps) {

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Configuration Box */}
      <div className="bg-white rounded-2xl border border-[#E4E8F0] p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-[#E4E8F0]">
          <Sliders className="w-4 h-4 text-[#2563EB]" />
          <h2 className="text-sm font-bold text-[#1D2433] tracking-tight uppercase">Scan-Einstellungen</h2>
        </div>

        {/* Media Type Tabs */}
        <div className="space-y-2 mb-4">
          <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">Modalität</label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F5F7FB] rounded-xl border border-[#E4E8F0]">
            <button
              onClick={() => setActiveMediaType("text")}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeMediaType === "text"
                  ? "bg-white text-[#2563EB] shadow-xs"
                  : "text-[#6B7280] hover:text-[#1D2433]"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Text</span>
            </button>
            <button
              type="button"
              disabled
              title="Audio-Analyse ist in v1 standardmäßig deaktiviert (Coming Soon in v2)"
              className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold text-[#1D2433]/30 cursor-not-allowed transition-all"
            >
              <FileAudio className="w-3.5 h-3.5 opacity-40" />
              <span className="line-through">Audio (Coming Soon)</span>
              <span className="text-[7px] bg-[#E4E8F0] text-gray-500 px-1 py-0.5 rounded font-bold">v2</span>
            </button>
            <button
              type="button"
              disabled
              title="Video-Biomarker-Analyse ist in v1 standardmäßig deaktiviert (Coming Soon in v2)"
              className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold text-[#1D2433]/30 cursor-not-allowed transition-all"
            >
              <FileVideo className="w-3.5 h-3.5 opacity-40" />
              <span className="line-through">Video (Coming Soon)</span>
              <span className="text-[7px] bg-[#E4E8F0] text-gray-500 px-1 py-0.5 rounded font-bold">v2</span>
            </button>
          </div>
        </div>

        {/* Text Area Input */}
        <div className="space-y-2.5 mb-4">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Untersuchungstext</label>
            <div className="text-[10px] text-[#6B7280] font-mono">
              {wordCount} Wörter · {charCount} Zeichen
            </div>
          </div>
          
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Fügen Sie hier den Chat-Verlauf, E-Mail-Inhalt, ein Audio-Transkript oder ein Video-Transkript ein."
              className={`w-full h-64 p-3.5 text-xs text-[#1D2433] placeholder-gray-400 border rounded-xl bg-[#F9FAFC] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#2563EB]/40 resize-none transition-all ${
                validationError ? "border-red-400 focus:ring-red-400" : "border-[#E4E8F0]"
              }`}
              id="interaction-text-input"
            />
            
            {validationError && (
              <div className="absolute right-3.5 bottom-3.5 flex items-center gap-1.5 bg-red-50 text-[10px] text-[#FF5A5F] px-2 py-1 rounded-md border border-red-200">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{validationError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Scan-Modus Tabs */}
        <div className="space-y-2 mb-4">
          <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">Scan-Modus</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMode("quick")}
              className={`flex flex-col text-left p-3.5 border rounded-xl transition-all cursor-pointer ${
                mode === "quick"
                  ? "bg-[#2563EB]/5 border-[#2563EB] ring-1 ring-[#2563EB]/25"
                  : "bg-white border-[#E4E8F0] hover:bg-[#F9FAFC]"
              }`}
            >
              <div className="text-xs font-bold text-[#1D2433] flex items-center gap-1.5">
                <span>⚡ Quick Scan</span>
              </div>
              <p className="text-[10px] text-[#6B7280] mt-1 leading-snug">
                Schneller Entwurf, ideal für erste Erkennung.
              </p>
            </button>

            <button
              onClick={() => setMode("deep")}
              className={`flex flex-col text-left p-3.5 border rounded-xl transition-all cursor-pointer ${
                mode === "deep"
                  ? "bg-[#7C3AED]/5 border-[#7C3AED] ring-1 ring-[#7C3AED]/25"
                  : "bg-white border-[#E4E8F0] hover:bg-[#F9FAFC]"
              }`}
            >
              <div className="text-xs font-bold text-[#1D2433] flex items-center gap-1.5">
                <span>🧠 Deep Scan</span>
              </div>
              <p className="text-[10px] text-[#6B7280] mt-1 leading-snug">
                Umfassende, detaillierte Evidenzanalyse.
              </p>
            </button>
          </div>
        </div>

        {/* Evidence Report Toggle */}
        <div className="flex items-center justify-between p-3 border border-[#E4E8F0] rounded-xl bg-[#F9FAFC] mb-5">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#1D2433]">Evidence-Report generieren</span>
            <span className="text-[9px] text-[#6B7280]">Vertiefte linguistische Begründungen erzeugen</span>
          </div>
          <button
            onClick={() => setEvidenceReport(!evidenceReport)}
            className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              evidenceReport ? "bg-[#2563EB]" : "bg-[#E4E8F0]"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                evidenceReport ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Form Actions Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onAnalyze}
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm ${
              isLoading
                ? "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-tr from-[#2563EB] to-[#7C3AED] text-white hover:opacity-95 active:scale-[0.98]"
            }`}
            id="btn-trigger-analysis"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analysiere Gespräch ...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Analyse starten</span>
              </>
            )}
          </button>

          <button
            onClick={onLoadSample}
            disabled={isLoading}
            className="w-full py-2 px-3 border border-[#E4E8F0] rounded-xl font-semibold text-xs text-[#1D2433] bg-white hover:bg-[#F9FAFC] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            id="btn-load-sample"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>Beispiel laden (9 Segmente)</span>
          </button>
        </div>
      </div>

      {/* Recent Cases Desk / History Panel */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E4E8F0] p-5 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#E4E8F0]">
            <h3 className="text-xs font-bold text-[#1D2433] uppercase tracking-wider">Letzte Analysen</h3>
            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-mono">
              {history.length}
            </span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectHistoryItem(item)}
                className="w-full text-left p-3 border border-transparent rounded-xl bg-[#F9FAFC] hover:bg-[#F3F4F6] transition-all flex items-center justify-between gap-1.5 cursor-pointer group"
              >
                <div className="truncate space-y-0.5 max-w-[80%]">
                  <p className="text-xs font-bold text-[#1D2433] truncate group-hover:text-[#2563EB] transition-colors">
                    {item.title}
                  </p>
                  <span className="text-[10px] text-[#6B7280]">
                    {item.date} · {item.dominantPattern}
                  </span>
                </div>
                {/* Score badge / dot */}
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    item.risk === "high" 
                      ? "bg-[#FF5A5F]" 
                      : item.risk === "medium" 
                        ? "bg-[#F59E0B]" 
                        : "bg-[#10B981]"
                  }`} />
                  <span className="text-[11px] font-bold text-gray-700 font-mono">
                    {item.riskScore.toFixed(1)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
