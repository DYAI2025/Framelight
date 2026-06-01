import React, { useState, useEffect } from "react";
import TopNav from "./components/TopNav";
import SummaryCards from "./components/SummaryCards";
import ScanSettings from "./components/ScanSettings";
import AnnotatedTranscript from "./components/AnnotatedTranscript";
import EvidenceTimeline from "./components/EvidenceTimeline";
import IntelligenceInspector from "./components/IntelligenceInspector";
import AuthModal from "./components/AuthModal";
import { SAMPLE_TEXT, SAMPLE_ANALYSIS, INSTANT_SAMPLE_CASES } from "./lib/sampleData";
import { AnalysisOutput, HistoryItem, Finding } from "./lib/types";
import { ShieldAlert, Sparkles, X, Lightbulb, Check, AlertCircle, RefreshCw, KeyRound } from "lucide-react";

export default function App() {
  const [text, setText] = useState<string>("");
  const [mode, setMode] = useState<"quick" | "deep">("quick");
  const [evidenceReport, setEvidenceReport] = useState<boolean>(true);
  
  const [output, setOutput] = useState<AnalysisOutput | null>(null);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [activeFindingId, setActiveFindingId] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<{ message: string; isConfigError?: boolean } | null>(null);
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showTutorial, setShowTutorial] = useState<boolean>(true);

  // Authentication & session synchronization states
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Initialize: Load user session from localStorage and pull their saved analysis cases
  useEffect(() => {
    const initSession = async () => {
      try {
        const savedUser = localStorage.getItem("detector_user");
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          if (parsedUser && parsedUser.id) {
            setUser(parsedUser);
            // Sync with backend history for user
            fetchUserHistory(parsedUser.id);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to restore user auth session", err);
      }

      // Guest mode fallback load
      try {
        const persisted = localStorage.getItem("manipulation_detector_history");
        if (persisted) {
          const parsed = JSON.parse(persisted);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setHistory(parsed);
            setOutput(parsed[0].output || null);
            setText(parsed[0].text);
            return;
          }
        }
      } catch (e) {
        console.error("Failed to load local history", e);
      }

      // Default pre-fill if local is empty
      setHistory(INSTANT_SAMPLE_CASES);
      setOutput(INSTANT_SAMPLE_CASES[0].output || null);
      setText(INSTANT_SAMPLE_CASES[0].text);
    };

    initSession();
  }, []);

  const fetchUserHistory = async (userId: string) => {
    try {
      const res = await fetch(`/api/auth/history?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.history) && data.history.length > 0) {
          setHistory(data.history);
          setOutput(data.history[0].output || null);
          setText(data.history[0].text);
          localStorage.setItem("manipulation_detector_history", JSON.stringify(data.history));
          return;
        }
      }
    } catch (err) {
      console.error("Failed to pull server history", err);
    }
  };

  // Save history to localstorage & sync securely to backend user profile if active
  const saveToHistory = async (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem("manipulation_detector_history", JSON.stringify(newHistory));
      
      // Auto-sync history list to backend securely
      const savedUser = localStorage.getItem("detector_user");
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && parsedUser.id) {
          await fetch("/api/auth/sync-history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: parsedUser.id, history: newHistory })
          });
        }
      }
    } catch (e) {
      console.error("Failed to persist and sync history", e);
    }
  };

  // Auth Success Handlers
  const handleAuthSuccess = async (userData: { id: string; email: string; name: string }) => {
    setUser(userData);
    localStorage.setItem("detector_user", JSON.stringify(userData));

    try {
      // Pull history from backend for user
      const res = await fetch(`/api/auth/history?userId=${userData.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.history) && data.history.length > 0) {
          setHistory(data.history);
          setOutput(data.history[0].output || null);
          setText(data.history[0].text);
          localStorage.setItem("manipulation_detector_history", JSON.stringify(data.history));
          return;
        }
      }

      // No history on server yet, upload the current guest workspace as seed
      await fetch("/api/auth/sync-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userData.id, history })
      });
    } catch (err) {
      console.error("Failed to complete double-sided auth history sync", err);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("detector_user");
    // Clear cases and load standard starter deck
    setHistory(INSTANT_SAMPLE_CASES);
    setOutput(INSTANT_SAMPLE_CASES[0].output || null);
    setText(INSTANT_SAMPLE_CASES[0].text);
    try {
      localStorage.removeItem("manipulation_detector_history");
    } catch (e) {}
  };

  // Click handler "Beispiel laden"
  const handleLoadSample = () => {
    setText(SAMPLE_TEXT);
    setValidationError(null);
    setApiError(null);
  };

  // Focus a case from history
  const handleSelectHistoryItem = (item: HistoryItem) => {
    setText(item.text);
    if (item.output) {
      setOutput(item.output);
      
      // Auto-focus strongest finding
      if (item.output.findings.length > 0) {
        const sorted = [...item.output.findings].sort((a, b) => b.finalIntensity - a.finalIntensity);
        setActiveFindingId(sorted[0].id);
        setActiveSegmentId(sorted[0].segmentId);
      } else {
        setActiveFindingId(null);
        setActiveSegmentId(null);
      }
    }
    setApiError(null);
    setValidationError(null);
  };

  // Perform Analysis API query
  const handleAnalyze = async () => {
    // 1. Initial Validation
    if (!text.trim()) {
      setValidationError("Bitte fügen Sie einen Text oder Verlauf zur Analyse ein.");
      return;
    }
    setValidationError(null);
    setApiError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          mode,
          evidenceReport,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific server-side errors (e.g., missing API keys)
        if (data.isConfigError) {
          throw { isConfig: true, message: data.message };
        }
        throw new Error(data.error || "Unerwarteter Fehler im Analyse-Backend.");
      }

      // Successful analysis completion!
      const finalOutput: AnalysisOutput = data;
      setOutput(finalOutput);

      // Create history item for user
      const newHistoryItem: HistoryItem = {
        id: `case-${Date.now()}`,
        title: finalOutput.title || `Scan ${new Date().toLocaleTimeString()}`,
        date: new Date().toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        risk: finalOutput.overall.manipulationRisk,
        riskScore: finalOutput.overall.riskScore,
        dominantPattern: finalOutput.overall.dominantPattern,
        text,
        output: finalOutput,
      };

      const updatedHistory = [newHistoryItem, ...history.filter(h => h.text !== text)].slice(0, 8);
      saveToHistory(updatedHistory);

      // Auto-focus the strongest finding in our workspace
      if (finalOutput.findings.length > 0) {
        const sorted = [...finalOutput.findings].sort((a, b) => b.finalIntensity - a.finalIntensity);
        setActiveFindingId(sorted[0].id);
        setActiveSegmentId(sorted[0].segmentId);
      } else {
        setActiveFindingId(null);
        setActiveSegmentId(null);
      }

    } catch (err: any) {
      console.error("API error:", err);
      if (err.isConfig) {
        setApiError({
          message: err.message,
          isConfigError: true,
        });
      } else {
        setApiError({
          message: err.message || "Der Server konnte nicht erreicht werden. Stellen Sie sicher, dass Ihre Internetverbindung besteht.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback demo-toggle when API key is not present
  const handleActivateDemoMode = () => {
    setApiError(null);
    setIsLoading(true);
    
    // Simulate brief processing latency
    setTimeout(() => {
      setIsLoading(false);
      
      // Seed with sample output
      const finalOutput = SAMPLE_ANALYSIS;
      setOutput(finalOutput);
      
      // Auto-set focus
      if (finalOutput.findings.length > 0) {
        const sorted = [...finalOutput.findings].sort((a, b) => b.finalIntensity - a.finalIntensity);
        setActiveFindingId(sorted[0].id);
        setActiveSegmentId(sorted[0].segmentId);
      }
      
      // Prefix text
      setText(SAMPLE_TEXT);

      // Save into history list
      const mockHistory: HistoryItem = {
        id: "case-demo-1",
        title: "Beispiel-Analyse (Demo-Modus aktiv)",
        date: "01. Juni 2026",
        risk: "medium",
        riskScore: 2.8,
        dominantPattern: "Schuldumkehr & Framing",
        text: SAMPLE_TEXT,
        output: SAMPLE_ANALYSIS,
      };
      
      const updatedHistory = [mockHistory, ...history.filter(h => h.id !== "case-demo-1")];
      saveToHistory(updatedHistory);
    }, 1500);
  };

  // Find currently active finding in standard list
  const activeFinding = output?.findings.find((f) => f.id === activeFindingId) || null;

  // Sorted findings list for inspector quick-jump
  const topFindings = output 
    ? [...output.findings].sort((a, b) => b.finalIntensity - a.finalIntensity) 
    : [];

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-[#1D2433] font-sans antialiased flex flex-col selection:bg-indigo-150">
      {/* Top Header Section */}
      <TopNav
        onShowHistory={() => {
          const element = document.getElementById("recent-history-panel");
          if (element) element.scrollIntoView({ behavior: "smooth" });
        }}
        onShowTutorial={() => setShowTutorial(true)}
        user={user}
        onAuthClick={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Grid App Wrapper */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-6">
        
        {/* Tutorial / Onboarding Help Component */}
        {showTutorial && (
          <div className="bg-gradient-to-r from-indigo-50 to-[#2563EB]/5 border border-indigo-100 p-5 rounded-2xl flex items-start gap-4 relative shadow-xs animate-fade-in">
            <button
              onClick={() => setShowTutorial(false)}
              className="absolute right-4 top-4 text-[#6B7280] hover:text-[#1D2433] bg-white border border-[#E4E8F0] p-1 rounded-lg transition-colors cursor-pointer"
              title="Schließen"
              id="tutorial-close-btn"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="bg-white p-3 rounded-xl border border-indigo-200 shadow-xs hidden md:block">
              <Lightbulb className="w-6 h-6 text-[#2563EB] animate-pulse" />
            </div>
            <div className="space-y-2 pr-6">
              <h3 className="text-xs font-bold text-[#1D2433] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Einführung: So funktioniert der Manipulation Detector</span>
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed max-w-4xl">
                Willkommen bei unserem evidenzbasierten Scanner für Kommunikationstaktiken. Unser Ziel ist es, sprachliche Phänomene in geschriebenen Unterhaltungen objektiv aufzuschlüsseln, <strong>ohne Individuen pauschal zu brandmarken oder zu pathologisieren</strong>. Die künstliche Intelligenz identifiziert rhetorische Ausweichmanöver, emotionalen Druck oder verengtes Framing, wägt diese aber stets mit einer wohlwollenden Lesart (z.B. Stress oder unglückliche Formulierungen) und der Reaktion des Gesprächspartners (Reparatur und Resonanz) ab.
              </p>
              <div className="flex gap-4 pt-1 text-[11px] font-semibold text-[#2563EB]">
                <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Keine Täter-Opfer-Zuschreibungen</span>
                <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Wissenschaftliche Einordnungen</span>
                <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Abgleich alternativer Absichten</span>
              </div>
            </div>
          </div>
        )}

        {/* Global Key-Failure or Connection Error Card Block */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className="bg-white p-2.5 rounded-xl border border-red-300 text-[#FF5A5F] shadow-xs">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1D2433] uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-[#FF5A5F]" />
                  <span>Schnittstellenfehler: {apiError.isConfigError ? "API-Key fehlt" : "Analyse nicht möglich"}</span>
                </h4>
                <p className="text-xs text-[#6B7280] mt-1 max-w-3xl leading-relaxed">
                  {apiError.message}
                </p>
              </div>
            </div>

            {/* Quick Demo Recovery Actions */}
            <div className="flex gap-2.5 self-stretch md:self-auto justify-end">
              <button
                onClick={handleActivateDemoMode}
                className="px-4 py-2 bg-gradient-to-tr from-amber-500 to-[#F59E0B] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                id="btn-recover-demo-mode"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Demo-Modus starten (Lokal)</span>
              </button>
              <button
                onClick={() => setApiError(null)}
                className="px-3.5 py-2 border border-[#E4E8F0] bg-white hover:bg-gray-150 text-xs font-semibold rounded-xl text-gray-500 cursor-pointer"
              >
                Ignorieren
              </button>
            </div>
          </div>
        )}

        {/* Top Summarizers Dashboard */}
        <SummaryCards output={output} isLoading={isLoading} />

        {/* Primary Three-Column Desktop Frame */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Column A: Scan Settings (Span 4) */}
          <div className="lg:col-span-4 space-y-5">
            <ScanSettings
              text={text}
              setText={setText}
              mode={mode}
              setMode={setMode}
              evidenceReport={evidenceReport}
              setEvidenceReport={setEvidenceReport}
              onAnalyze={handleAnalyze}
              onLoadSample={handleLoadSample}
              isLoading={isLoading}
              validationError={validationError}
              history={history}
              onSelectHistoryItem={handleSelectHistoryItem}
            />
          </div>

          {/* Column B: Evidence Workspace Center (Span 5) */}
          <div className="lg:col-span-5 space-y-5">
            <AnnotatedTranscript
              output={output}
              activeSegmentId={activeSegmentId}
              setActiveSegmentId={setActiveSegmentId}
              activeFindingId={activeFindingId}
              setActiveFindingId={setActiveFindingId}
            />

            {output && (
              <EvidenceTimeline
                timeline={output.timeline}
                activeSegmentId={activeSegmentId}
                setActiveSegmentId={setActiveSegmentId}
                outputFindings={output.findings}
              />
            )}
          </div>

          {/* Column C: Intelligence Inspector Right (Span 3) */}
          <div className="lg:col-span-3 h-full">
            <IntelligenceInspector
              activeFinding={activeFinding}
              topFindings={topFindings}
              onSelectFinding={(f) => {
                setActiveFindingId(f.id);
                setActiveSegmentId(f.segmentId);
              }}
            />
          </div>

        </div>

        {/* Underlay Info Dashboard footer */}
        <div className="border-t border-[#E4E8F0] pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#6B7280] gap-4">
          <div>
            <span className="font-bold text-[#1D2433]">Manipulation Detector © 2026</span> · Alle Rechte vorbehalten. 
            Modelliert zur deeskalierenden Kommunikations-Begleitung.
          </div>
          <div className="flex gap-4">
            <button onClick={() => setShowTutorial(true)} className="hover:text-[#2563EB] cursor-pointer">Nutzungsbedingungen</button>
            <span>·</span>
            <a href="https://ai.studio" target="_blank" rel="noreferrer" className="hover:text-[#2563EB]">Google AI Studio API Docs</a>
          </div>
        </div>

      </main>

      {/* Interactive Authorization and Social Sign-In Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
