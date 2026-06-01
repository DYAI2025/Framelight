import React, { useState, useEffect } from "react";
import { AlertCircle, Copy, Share2, CornerDownRight, Check, Sparkles, MessageSquare, Volume2, Square } from "lucide-react";
import { AnalysisOutput, Segment, Finding, RiskLevel } from "../lib/types";
import { speakText, stopSpeaking } from "../lib/ttsUtils";

interface AnnotatedTranscriptProps {
  output: AnalysisOutput | null;
  activeSegmentId: string | null;
  setActiveSegmentId: (id: string | null) => void;
  activeFindingId: string | null;
  setActiveFindingId: (id: string | null) => void;
}

export default function AnnotatedTranscript({
  output,
  activeSegmentId,
  setActiveSegmentId,
  activeFindingId,
  setActiveFindingId,
}: AnnotatedTranscriptProps) {
  const [copied, setCopied] = useState(false);
  const [speakingSegmentId, setSpeakingSegmentId] = useState<string | null>(null);

  // Auto-stop any ongoing TTS when output changes or is unmounted
  useEffect(() => {
    stopSpeaking();
    setSpeakingSegmentId(null);
    return () => {
      stopSpeaking();
    };
  }, [output?.title]);

  if (!output) {
    return (
      <div className="bg-white rounded-2xl border border-[#E4E8F0] p-12 text-center text-gray-400 flex flex-col items-center justify-center space-y-4 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="bg-[#F5F7FB] p-5 rounded-full text-[#2563EB]/40">
          <MessageSquare className="w-12 h-12" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#1D2433]">Kein Analyse-Dokument geladen</h3>
          <p className="text-xs text-[#6B7280] mt-1 max-w-sm">
            Fügen Sie links einen Text ein und drücken Sie auf &quot;Analyse starten&quot; oder laden Sie ein Beispieldokument.
          </p>
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(output, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to resolve specific color codes for finding categories
  const getMarkerBadgeStyles = (category: string) => {
    const norm = category.toLowerCase();
    if (norm.includes("abwertung") || norm.includes("kritisch") || norm.includes("macht") || norm.includes("ad-hominem")) {
      return "bg-[#FF5A5F]/10 border-[#FF5A5F]/20 text-[#FF5A5F] hover:bg-[#FF5A5F]/25";
    }
    if (norm.includes("druck") || norm.includes("drohung") || norm.includes("loyalität") || norm.includes("isolation")) {
      return "bg-[#F59E0B]/10 border-[#F59E0B]/20 text-[#F59E0B] hover:bg-[#F59E0B]/25";
    }
    if (norm.includes("framing") || norm.includes("deutung")) {
      return "bg-[#2563EB]/10 border-[#2563EB]/20 text-[#2563EB] hover:bg-[#2563EB]/25";
    }
    if (norm.includes("hoheit") || norm.includes("macht") || norm.includes("rang")) {
      return "bg-[#7C3AED]/10 border-[#7C3AED]/20 text-[#7C3AED] hover:bg-[#7C3AED]/25";
    }
    if (norm.includes("reparatur") || norm.includes("resonanz") || norm.includes("deeskalation")) {
      return "bg-[#10B981]/10 border-[#10B981]/20 text-[#10B981] hover:bg-[#10B981]/25";
    }
    return "bg-[#6B7280]/10 border-[#6B7280]/20 text-[#6B7280] hover:bg-[#6B7280]/25";
  };

  const getHighlightColor = (category: string, isActive: boolean) => {
    const norm = category.toLowerCase();
    if (norm.includes("abwertung") || norm.includes("kritisch") || norm.includes("ad-hominem")) {
      return isActive ? "bg-[#FF5A5F]/20 border-b-2 border-[#FF5A5F]" : "bg-[#FF5A5F]/10 border-b border-[#FF5A5F]/35";
    }
    if (norm.includes("druck") || norm.includes("drohung") || norm.includes("loyalität") || norm.includes("isolation")) {
      return isActive ? "bg-[#F59E0B]/25 border-b-2 border-[#F59E0B]" : "bg-[#F59E0B]/12 border-b border-[#F59E0B]/35";
    }
    if (norm.includes("framing") || norm.includes("deutung")) {
      return isActive ? "bg-[#2563EB]/20 border-b-2 border-[#2563EB]" : "bg-[#2563EB]/10 border-b border-[#2563EB]/35";
    }
    if (norm.includes("hoheit") || norm.includes("macht")) {
      return isActive ? "bg-[#7C3AED]/20 border-b-2 border-[#7C3AED]" : "bg-[#7C3AED]/10 border-b border-[#7C3AED]/35";
    }
    if (norm.includes("reparatur") || norm.includes("resonanz") || norm.includes("deeskalation")) {
      return isActive ? "bg-[#10B981]/20 border-b-2 border-[#10B981]" : "bg-[#10B981]/10 border-b border-[#10B981]/35";
    }
    return isActive ? "bg-[#6B7280]/20 border-b-2 border-[#6B7280]" : "bg-[#6B7280]/12 border-b border-[#6B7280]/35";
  };

  /**
   * Safe content highlighter. Split by quote and highlight occurrences
   */
  const renderTextWithHighlights = (text: string, segmentFindings: Finding[]) => {
    if (segmentFindings.length === 0) return <span>{text}</span>;

    // Use the first finding that has a valid quote
    const primaryFinding = segmentFindings.find(f => f.quote && text.includes(f.quote));
    if (!primaryFinding || !primaryFinding.quote) return <span>{text}</span>;

    const quote = primaryFinding.quote;
    const parts = text.split(quote);
    const isMarkerActive = activeFindingId === primaryFinding.id;

    return (
      <span>
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < parts.length - 1 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveFindingId(primaryFinding.id);
                  setActiveSegmentId(primaryFinding.segmentId);
                }}
                className={`px-1 rounded-sm font-medium transition-all duration-300 cursor-pointer ${getHighlightColor(
                  primaryFinding.category || primaryFinding.marker,
                  isMarkerActive
                )}`}
                title="Klicken zum Inspizieren"
              >
                {quote}
              </span>
            )}
          </span>
        ))}
      </span>
    );
  };

  const handlePlaySpeech = (e: React.MouseEvent, segId: string, text: string, primaryMarker?: string) => {
    e.stopPropagation();
    if (speakingSegmentId === segId) {
      stopSpeaking();
      setSpeakingSegmentId(null);
    } else {
      setSpeakingSegmentId(segId);
      speakText(
        text,
        primaryMarker,
        () => setSpeakingSegmentId(segId),
        () => setSpeakingSegmentId(null)
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E4E8F0] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between">
      {/* Case Header */}
      <div className="border-b border-[#E4E8F0] px-5 py-4 flex items-center justify-between bg-[#F9FAFC]">
        <div className="truncate space-y-0.5 max-w-[70%]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-[#10B981]/10 text-[#10B981] font-bold px-2 py-0.5 rounded-full border border-[#10B981]/20 uppercase">
              Analyse abgeschlossen
            </span>
            <span className="text-[10px] bg-sky-100 text-[#2563EB] font-bold px-2 py-0.5 rounded-full border border-sky-200 uppercase">
              S{output.segments.length} Segmente Auto-Parsing
            </span>
          </div>
          <h2 className="text-sm font-bold text-[#1D2433] truncate tracking-tight uppercase">
            Fall-ID: {output.title || "Kommunikationsprüfung"}
          </h2>
        </div>

        {/* Action triggers */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E4E8F0] rounded-lg text-[11px] font-semibold text-gray-500 hover:bg-[#F3F4F6] hover:text-[#1D2433] transition-all cursor-pointer bg-white"
            title="Kopiere JSON-Report"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? "Kopiert!" : "Exportieren"}</span>
          </button>
        </div>
      </div>

      {/* Annotated Transcript Content */}
      <div className="p-5 space-y-4 max-h-[500px] overflow-y-auto" id="evidence-segment-panel">
        {output.segments.map((seg) => {
          const isSelected = activeSegmentId === seg.id;
          const segmentFindings = output.findings.filter((f) => f.segmentId === seg.id);
          const hasFindings = segmentFindings.length > 0;

          const getSpeakerLabelClass = (spkId: string) => {
            switch (spkId) {
              case "A": return "bg-[#2563EB]/10 border-[#2563EB]/20 text-[#2563EB]";
              case "B": return "bg-[#7C3AED]/10 border-[#7C3AED]/20 text-[#7C3AED]";
              default: return "bg-gray-100 border-gray-200 text-[#6B7280]";
            }
          };

          return (
            <div
              key={seg.id}
              onClick={() => {
                setActiveSegmentId(seg.id);
                // Auto-select first matching finding of segment if any
                if (segmentFindings.length > 0) {
                  setActiveFindingId(segmentFindings[0].id);
                } else {
                  setActiveFindingId(null);
                }
              }}
              className={`p-3.5 border rounded-xl transition-all duration-300 cursor-pointer flex flex-col sm:flex-row sm:items-start gap-3 relative ${
                isSelected
                  ? "bg-white border-[#2563EB] shadow-xs ring-1 ring-[#2563EB]/10"
                  : "bg-[#F9FAFC] border-[#E4E8F0] hover:bg-[#F3F4F6]"
              }`}
            >
              {/* Segment Tag */}
              <div className="absolute right-3.5 top-3.5 text-[9px] font-mono text-gray-400 font-bold select-none p-1">
                {seg.id}
              </div>

              {/* Speaker Bubble Badge */}
              <div className="sm:w-28 flex-shrink-0 flex flex-col gap-1.5 items-start">
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${getSpeakerLabelClass(seg.speakerId)}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  Sprecher {seg.speakerId}
                </span>
                
                {seg.timestamp && (
                  <p className="text-[10px] text-gray-400 font-mono text-left pl-1 leading-none mt-0.5">
                    {seg.timestamp}
                  </p>
                )}

                {/* TTS Speak action trigger button */}
                <button
                  type="button"
                  onClick={(e) => {
                    const primaryMarker = segmentFindings.length > 0 ? segmentFindings[0].marker : undefined;
                    handlePlaySpeech(e, seg.id, seg.text, primaryMarker);
                  }}
                  className={`mt-1.5 inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[9px] font-bold transition-all cursor-pointer ${
                    speakingSegmentId === seg.id
                      ? "bg-red-50 text-red-500 border-red-200 animate-pulse"
                      : "bg-[#F1F4F9] text-gray-500 border-transparent hover:border-[#E4E8F0] hover:bg-gray-150"
                  }`}
                  title="Segment vorlesen lassen"
                >
                  {speakingSegmentId === seg.id ? (
                    <>
                      <Square className="w-2.5 h-2.5 fill-current text-red-500" />
                      <span>Stopp</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-2.5 h-2.5 text-gray-500" />
                      <span>Anhören</span>
                    </>
                  )}
                </button>
              </div>

              {/* Segment Content */}
              <div className="flex-1 space-y-2">
                <p className="text-xs text-[#1D2433] leading-relaxed font-sans pr-4">
                  {renderTextWithHighlights(seg.text, segmentFindings)}
                </p>

                {/* Detected findings chips row */}
                {hasFindings && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {segmentFindings.map((finding) => {
                      const isActiveFinding = activeFindingId === finding.id;
                      return (
                        <button
                          key={finding.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveFindingId(finding.id);
                            setActiveSegmentId(seg.id);
                          }}
                          className={`text-[10px] px-2 py-0.5 rounded-full border font-medium flex items-center gap-1 transition-all cursor-pointer ${getMarkerBadgeStyles(
                            finding.category || finding.marker
                          )} ${
                            isActiveFinding 
                              ? "ring-2 ring-indigo-500/20 font-bold scale-[1.02]" 
                              : "opacity-85"
                          }`}
                        >
                          <AlertCircle className="w-3 h-3 flex-shrink-0" />
                          <span>{finding.marker}</span>
                          <span className="text-[8px] opacity-70">i:{finding.finalIntensity}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
