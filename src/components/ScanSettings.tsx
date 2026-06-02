import React, { useState, useEffect } from "react";
import { 
  Sliders, 
  Settings, 
  Play, 
  RefreshCw, 
  FileText, 
  FileAudio, 
  FileVideo, 
  Sparkles, 
  HelpCircle, 
  AlertCircle,
  Mic,
  MicOff,
  Video,
  Volume2,
  Gauge,
  Upload,
  Check,
  Radio,
  Tv
} from "lucide-react";
import { SAMPLE_TEXT } from "../lib/sampleData";
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
  const [isRecording, setIsRecording] = useState(false);
  const [recordingText, setRecordingText] = useState("");
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [activeAudioSource, setActiveAudioSource] = useState<"upload" | "dictate" | "sample">("sample");

  // Telemetry indicators for video scanning
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [facialStress, setFacialStress] = useState(15);
  const [vocalJitter, setVocalJitter] = useState(25);
  const [postureDefense, setPostureDefense] = useState(10);
  const [videoLink, setVideoLink] = useState("");
  const [activeTelemetryStatus, setActiveTelemetryStatus] = useState("Inaktiv - Bereit für Scan-Sequenz");

  // Speech to Text trigger (Web Speech API)
  const startSpeechToText = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Sprachaufgabe im Browser nicht unterstützt. Verwende die Audio-Demoszenarien für eine voll funktionsfähige STT-Demonstration.");
      loadAudioSample("Szenario A");
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "de-DE";
    rec.continuous = true;
    rec.interimResults = true;

    rec.onstart = () => {
      setIsRecording(true);
      setRecordingText("Höre zu... fangen Sie an zu sprechen.");
    };

    rec.onresult = (e: any) => {
      let finalTranscript = "";
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) {
          finalTranscript += e.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setRecordingText(finalTranscript);
        setText((text ? text + "\n" : "") + "Sprecher A: " + finalTranscript.trim());
      }
    };

    rec.onerror = (evt: any) => {
      console.error("STT error", evt);
      setIsRecording(false);
    };

    rec.onend = () => {
      setIsRecording(false);
    };

    try {
      rec.start();
    } catch (err) {
      setIsRecording(false);
    }
  };

  // Simulating an Audio scenario transcription (Speech-to-text separation)
  const loadAudioSample = (scenarioName: string) => {
    setIsProcessingAudio(true);
    setRecordingText("Lese Audio-Datei ein...");
    
    setTimeout(() => {
      setRecordingText("Speech-To-Text Engine initialisiert...");
      
      setTimeout(() => {
        setRecordingText("Transkribiere Segmente mit biometrischen Sprechersignaturen...");
        
        setTimeout(() => {
          let transcript = "";
          if (scenarioName === "Szenario A") {
            transcript = `A: Sie haben die Deadline für das Projekt wieder verpasst. Das ist sehr unprofessionell.
B: Es tut mir leid, das war keine Absicht, wir hatten massive Serverausfälle.
A: Sie finden immer Ausreden. Wenn Sie das Projekt nicht schätzen, sagen Sie es einfach klar.
B: Nein, das stimmt nicht! Ich schätze meine Arbeit sehr wohl. Aber ohne Server kann ich nicht zaubern.
A: Ich verlange einfach nur grundlegende Professionalität, aber vielleicht ist das zu viel verlangt.`;
          } else {
            transcript = `Kunde: Ich bin absolut unzufrieden mit Ihrem Service. Der Fehler liegt ganz klar bei Ihrer Software!
Support: Ich verstehe Ihren Ärger. Lassen Sie uns die Logdaten gemeinsam prüfen, um die Ursache zu ermitteln.
Kunde: Wenn Sie kompetent wären, bräuchten wir keine Logs prüfen. Tun Sie einfach Ihren Job!
Support: Ich bemühe mich um eine schnelle Lösung. Wir können das Problem sofort beheben, wenn wir den Fehlercode auslesen.
Kunde: Sie versuchen nur, sich aus der Verantwortung zu ziehen!`;
          }
          setText(transcript);
          setIsProcessingAudio(false);
          setRecordingText(`Transkription abgeschlossen! ${transcript.split("\n").length} Segmente importiert.`);
        }, 1200);
      }, 1000);
    }, 800);
  };

  // Video scanner telemetry ticker
  useEffect(() => {
    let timer: any;
    if (isPlayingVideo) {
      timer = setInterval(() => {
        setVideoProgress(prev => {
          if (prev >= 100) {
            setIsPlayingVideo(false);
            setActiveTelemetryStatus("Analyse abgeschlossen - Bereit zur Text-Auswertung");
            return 0;
          }
          
          // Mimic non-verbal metrics shifting dynamically based on playback timestamp
          const nextVal = prev + 4;
          
          if (nextVal > 15 && nextVal < 40) {
            setFacialStress(prevF => Math.min(prevF + 5, 78));
            setVocalJitter(prevV => Math.min(prevV + 8, 85));
            setPostureDefense(prevP => Math.min(prevP + 3, 50));
            setActiveTelemetryStatus("Warnung: Stimmfrequenz-Ausfälligkeit (Pitch-Anstieg) @ S2");
          } else if (nextVal > 55 && nextVal < 80) {
            setFacialStress(prevF => Math.max(prevF - 4, 30));
            setVocalJitter(prevV => Math.max(prevV - 6, 20));
            setPostureDefense(prevP => Math.min(prevP + 8, 82));
            setActiveTelemetryStatus("Gaze-avoidance (Blickkontakt-Bruch) & Armverschleierung detektiert @ S4");
          } else {
            setFacialStress(prevF => Math.max(prevF - 3, 20));
            setVocalJitter(prevV => Math.max(prevV - 4, 15));
            setPostureDefense(prevP => Math.max(prevP - 5, 25));
            setActiveTelemetryStatus("Linguistische & visuelle Sequenz-Synchronisation aktiv...");
          }

          if (prev === 0) {
            // Seed a smart sample text representing the dialog being analyzed
            setText(`Sprecher A: Sie müssen mir jetzt gar nicht erst so kommen. Ich habe das Formular ordnungsgemäß weggeschickt.
Sprecher B: Das mag sein, aber bei uns ist nichts im System verbucht. Sind Sie ganz sicher?
Sprecher A: Wollen Sie mir unterstellen, dass ich lüge? Das ist eine absolute Frechheit!
Sprecher B: Nein, überhaupt nicht. Ich wollte nur die Sendebestätigung abgleichen.
Sprecher A: Wenn Ihre Abteilung überfordert ist, schieben Sie nicht mir die Schuld in die Schuhe.`);
          }

          return nextVal;
        });
      }, 500);
    }
    return () => clearInterval(timer);
  }, [isPlayingVideo]);

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
              <span className="line-through">Audio</span>
              <span className="text-[7px] bg-gray-100 text-gray-500 px-1 py-0.5 rounded">v2</span>
            </button>
            <button
              type="button"
              disabled
              title="Video-Biomarker-Analyse ist in v1 standardmäßig deaktiviert (Coming Soon in v2)"
              className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold text-[#1D2433]/30 cursor-not-allowed transition-all"
            >
              <FileVideo className="w-3.5 h-3.5 opacity-40" />
              <span className="line-through">Video</span>
              <span className="text-[7px] bg-gray-100 text-gray-500 px-1 py-0.5 rounded">v2</span>
            </button>
          </div>
        </div>

        {/* Dynamic Modality Controls Area */}
        {activeMediaType === "audio" && (
          <div className="mb-4 p-4 border border-violet-100 bg-violet-50/20 rounded-xl text-center space-y-1">
            <span className="text-[10px] font-bold text-violet-700 uppercase tracking-widest flex items-center justify-center gap-1">
              <Volume2 className="w-3.5 h-3.5" /> Speech-To-Text & Audio-Scan (Coming Soon)
            </span>
            <p className="text-[10px] text-gray-500">Audio-Analysen, Tonhöhen-Prosodien und Diktier-Scans sind für die standardisierte wordthreat_API v1 text-only dekonstruiert.</p>
          </div>
        )}

        {activeMediaType === "video" && (
          <div className="mb-4 p-4 border border-rose-100 bg-rose-50/20 rounded-xl text-center space-y-1">
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest flex items-center justify-center gap-1">
              <Tv className="w-3.5 h-3.5" /> Video-Uploader & Verhaltenssensorik (Coming Soon)
            </span>
            <p className="text-[10px] text-gray-500">MIMIK-STRESS, VOICE-JITTER und verhaltenstypologische Biomarker-Flüsse sind im v1 Text-Fokus standardmäßig deaktiviert.</p>
          </div>
        )}

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
