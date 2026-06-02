import React, { useState, useEffect } from "react";
import TopNav from "./components/TopNav";
import SummaryCards from "./components/SummaryCards";
import ScanSettings from "./components/ScanSettings";
import AnnotatedTranscript from "./components/AnnotatedTranscript";
import EvidenceTimeline from "./components/EvidenceTimeline";
import IntelligenceInspector from "./components/IntelligenceInspector";
import CollaborativeSession from "./components/CollaborativeSession";
import AuthModal from "./components/AuthModal";
import { SAMPLE_TEXT, SAMPLE_ANALYSIS, INSTANT_SAMPLE_CASES } from "./lib/sampleData";
import { AnalysisOutput, HistoryItem, Finding } from "./lib/types";
import { 
  ShieldAlert, 
  Sparkles, 
  X, 
  Lightbulb, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  KeyRound,
  Tag,
  MessageSquare,
  AlertTriangle,
  Play,
  Volume2,
  Tv,
  HelpCircle,
  Clock,
  VolumeX
} from "lucide-react";

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

  // Active Media Type Tab
  const [activeMediaType, setActiveMediaType] = useState<"text" | "audio" | "video">("text");

  // Real-time Collaboration States
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [collabRoomId, setCollabRoomId] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [roomUsers, setRoomUsers] = useState<any[]>([]);
  const [liveTags, setLiveTags] = useState<any[]>([]);
  const [roomChats, setRoomChats] = useState<any[]>([]);

  // Local state for the custom tagging station form
  const [taggingForm, setTaggingForm] = useState({
    segmentId: "S1",
    pattern: "Schuldumkehr",
    risk: "medium" as "low" | "medium" | "high",
    quote: ""
  });
  const [recentDesktopNotifications, setRecentDesktopNotifications] = useState<string[]>([]);

  // Text-To-Speech (TTS) Engine that speaks segments aloud with tones based on tactics
  const speakSegmentText = (textToSpeak: string, pattern?: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop playing current spoken phrases

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "de-DE";

    // Convey different vocal tones and pitch states based on detected manipulation
    if (pattern) {
      const p = pattern.toLowerCase();
      if (p.includes("drohung") || p.includes("konsequenz") || p.includes("druck")) {
        utterance.rate = 0.85; // Pressured, slower rates
        utterance.pitch = 0.8;  // Deeper voice
      } else if (p.includes("escalation") || p.includes("schuld") || p.includes("abwertung")) {
        utterance.rate = 1.15;  // Rapid, anxious tempo
        utterance.pitch = 1.2;  // High pitching
      } else if (p.includes("gaslighting") || p.includes("framing")) {
        utterance.rate = 1.0;
        utterance.pitch = 0.9;  // Soft, manipulative monotone tone
      }
    }

    window.speechSynthesis.speak(utterance);
  };

  // Listen to active finding details changes to execute Text-to-Speech triggers automatically
  useEffect(() => {
    if (activeFindingId && output) {
      const fd = output.findings.find(f => f.id === activeFindingId);
      if (fd && fd.quote) {
        speakSegmentText(fd.quote, fd.marker);
      }
    }
  }, [activeFindingId, output]);

  // Synchronise edits with other room users in real-time
  useEffect(() => {
    if (socket && isConnected && collabRoomId) {
      socket.send(JSON.stringify({
        type: "text-update",
        roomId: collabRoomId,
        text,
        mode,
        evidenceReport
      }));
    }
  }, [text, mode, evidenceReport]);

  // WebSocket connection & room joining handles
  const joinCollabRoom = (rId: string) => {
    if (socket) {
      socket.close();
    }

    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const socketUrl = `${wsProtocol}//${window.location.host}`;
    const ws = new WebSocket(socketUrl);

    ws.onopen = () => {
      setCollabRoomId(rId);
      setIsConnected(true);
      
      const identityObj = {
        type: "join",
        roomId: rId,
        userId: user?.id || `anon-${Date.now()}`,
        name: user?.name || "Anonymer Gast",
        email: user?.email || "gast@analyselab.de"
      };
      ws.send(JSON.stringify(identityObj));
    };

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);

        if (msg.type === "sync") {
          if (msg.text) setText(msg.text);
          if (msg.mode) setMode(msg.mode);
          setEvidenceReport(msg.evidenceReport !== false);
          if (msg.output) setOutput(msg.output);
          setLiveTags(msg.liveTags || []);
          setRoomChats(msg.chats || []);
        }

        else if (msg.type === "text-sync") {
          if (msg.text !== undefined) setText(msg.text);
          if (msg.mode) setMode(msg.mode);
          if (msg.evidenceReport !== undefined) setEvidenceReport(msg.evidenceReport);
        }

        else if (msg.type === "analysis-sync") {
          setOutput(msg.output);
          
          // Auto focus strongest finding
          if (msg.output.findings.length > 0) {
            const sorted = [...msg.output.findings].sort((a: any, b: any) => b.finalIntensity - a.finalIntensity);
            setActiveFindingId(sorted[0].id);
            setActiveSegmentId(sorted[0].segmentId);
          }
        }

        else if (msg.type === "live-tag-sync") {
          setLiveTags(prev => {
            if (prev.some(t => t.id === msg.tag.id)) return prev;
            return [msg.tag, ...prev];
          });
          // Desktop alert trigger simulation
          setRecentDesktopNotifications(prev => [
            `Echtzeit-Meldung: Sprecher ${msg.tag.speaker} markiert mit "${msg.tag.marker}" (${msg.tag.risk.toUpperCase()}) von ${msg.tag.author}`,
            ...prev.slice(0, 4)
          ]);
        }

        else if (msg.type === "chat-sync") {
          setRoomChats(prev => [...prev, msg.chat]);
        }

        else if (msg.type === "presence") {
          setRoomUsers(msg.users || []);
        }
      } catch (err) {
        console.error("Failed to process WebSocket incoming broadcast message:", err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setSocket(null);
    };

    setSocket(ws);
  };

  const leaveCollabRoom = () => {
    if (socket) {
      socket.close();
    }
    setIsConnected(false);
    setCollabRoomId("");
    setRoomUsers([]);
    setLiveTags([]);
    setRoomChats([]);
  };

  const sendCollaborativeComment = (messageContent: string) => {
    if (!socket || !isConnected) return;
    const authorName = user?.name || "Anonymer Gast";
    const newChatObj = {
      id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      author: authorName,
      message: messageContent,
      time: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
      color: "text-blue-500"
    };

    socket.send(JSON.stringify({
      type: "add-chat",
      roomId: collabRoomId,
      chat: newChatObj
    }));
  };

  const sendPatternLiveTag = (speaker: string, wordExcerpt: string, patternMarker: string, riskLevel: "low" | "medium" | "high") => {
    const authorName = user?.name || "Anonymer Gast";
    const newTagObj = {
      id: `tag-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      speaker: speaker,
      text: wordExcerpt,
      marker: patternMarker,
      risk: riskLevel,
      author: authorName,
      timestamp: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    };

    if (socket && isConnected) {
      socket.send(JSON.stringify({
        type: "add-live-tag",
        roomId: collabRoomId,
        tag: newTagObj
      }));
    } else {
      // Local addition fallback if not connected to collaboration room
      setLiveTags(prev => [newTagObj, ...prev]);
      setRecentDesktopNotifications(prev => [
        `Lokaler Feedback-Tag: "${patternMarker}" auf segmentiertes Zitat durch ${authorName}`,
        ...prev.slice(0, 4)
      ]);
    }
  };

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
          mediaType: activeMediaType,
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

      // If active WebSocket collaboration exists, broadcast the completed analysis so other browsers sync live
      if (socket && isConnected) {
        socket.send(JSON.stringify({
          type: "analysis-update",
          roomId: collabRoomId,
          output: finalOutput
        }));
      }

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

        {/* Bento Grid Top Row: Visual Scorecards */}
        <SummaryCards output={output} isLoading={isLoading} />

        {/* Real-time Desktop Toast Overlay Alerts */}
        {recentDesktopNotifications.length > 0 && (
          <div className="space-y-1.5 p-3.5 bg-[#1D2433] text-white rounded-xl border border-gray-700 shadow-lg animate-fade-in max-w-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-amber-400">
                <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                <span>Echtzeit-Musterüberwachung</span>
              </div>
              <button onClick={() => setRecentDesktopNotifications([])} className="text-gray-400 hover:text-white text-[10px] font-bold">X</button>
            </div>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {recentDesktopNotifications.map((notif, index) => (
                <p key={index} className="text-[10px] font-mono border-l-2 border-amber-400 pl-2 leading-tight">
                  {notif}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* PRIMARY ASYMMETRIC BENTO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* BENTO BLOCK 1: SCAN SETTINGS VIEWPORT (lg:col-span-4) */}
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
              activeMediaType={activeMediaType}
              setActiveMediaType={setActiveMediaType}
            />
          </div>

          {/* BENTO BLOCK 2: TEAM REAL-TIME COLAB & LIVE FEEDBACK TAGGER (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Real-time sync portal */}
            <CollaborativeSession
              roomId={collabRoomId}
              setRoomId={setCollabRoomId}
              onJoinRoom={joinCollabRoom}
              onLeaveRoom={leaveCollabRoom}
              users={roomUsers}
              liveTags={liveTags}
              chats={roomChats}
              onSendChat={sendCollaborativeComment}
              isConnected={isConnected}
              user={user}
            />

            {/* Live pattern Tagging Station Console */}
            <div className="bg-white rounded-2xl border border-[#E4E8F0] p-5 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-[#E4E8F0]">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-violet-600" />
                  <span className="text-xs font-bold text-[#1D2433] tracking-wider uppercase">Live-Dauer-Tagging & Gesprächsmarkierungsstation</span>
                </div>
                <div className="text-[9px] bg-violet-50 text-violet-600 font-bold uppercase py-0.5 px-2 rounded-full border border-violet-100">
                  {isConnected ? "Aktiviert für Raum " + collabRoomId : "Stand-alone Modus"}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                
                {/* Visual form choices (col-span-7) */}
                <div className="md:col-span-7 space-y-2 mt-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Muster-Taktik</label>
                      <select
                        value={taggingForm.pattern}
                        onChange={(e) => setTaggingForm(prev => ({ ...prev, pattern: e.target.value }))}
                        className="w-full bg-[#F9FAFC] border border-[#E4E8F0] p-1.5 rounded-lg text-[11px] font-medium text-gray-700 focus:outline-hidden"
                      >
                        <option value="Schuldumkehr">Schuldumkehr / Gaslighting</option>
                        <option value="Framing">Subtiles Framing (Erzählung)</option>
                        <option value="Whataboutism">Whataboutism (Themenschwenk)</option>
                        <option value="Modal Pressure">Modal Pressure (Zwangszustand)</option>
                        <option value="Ad-hominem">Ad-hominem / Abwertung</option>
                        <option value="Mitleidsappell">Mitleid- o. Loyalitätsappell</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Intensität</label>
                      <select
                        value={taggingForm.risk}
                        onChange={(e) => setTaggingForm(prev => ({ ...prev, risk: e.target.value as any }))}
                        className="w-full bg-[#F9FAFC] border border-[#E4E8F0] p-1.5 rounded-lg text-[11px] font-medium text-gray-700 focus:outline-hidden"
                      >
                        <option value="low">Subtil (Gering)</option>
                        <option value="medium">Moderat (Spürbar)</option>
                        <option value="high">Manifest (Hochwertig)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Passage / Zitat-Auszug</label>
                    <input
                      type="text"
                      value={taggingForm.quote}
                      onChange={(e) => setTaggingForm(prev => ({ ...prev, quote: e.target.value }))}
                      placeholder="z.B. 'Sie schieben immer alles auf uns'..."
                      className="w-full bg-[#F9FAFC] border border-[#E4E8F0] px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-gray-700 placeholder-gray-400 focus:outline-hidden focus:bg-white"
                    />
                  </div>
                </div>

                {/* Submit actions (col-span-5) */}
                <div className="md:col-span-5 text-center flex flex-col gap-2 self-end">
                  <button
                    onClick={() => {
                      if (!taggingForm.quote.trim()) {
                        alert("Bitte geben Sie zuerst eine Textpassage/Zitat ein, das Sie taggen möchten.");
                        return;
                      }
                      sendPatternLiveTag("Sprecher A", taggingForm.quote, taggingForm.pattern, taggingForm.risk);
                      setTaggingForm(prev => ({ ...prev, quote: "" }));
                    }}
                    type="button"
                    className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
                  >
                    🚩 Taktik live erfassen
                  </button>
                  <p className="text-[9px] text-[#6B7280] leading-snug px-2">
                    Dieses Tag wird in Echtzeit an alle verbundenen Browser übertragen und overlayed die Liveübersicht.
                  </p>
                </div>

              </div>
            </div>

          </div>

        </div>

        {/* WORKSPACE & GRAPH TIMELINES BENTO BOXES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-4">
          
          {/* Column A (lg:col-span-8) - Core Annotated Workspace */}
          <div className="lg:col-span-8 space-y-6">
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

          {/* Column B (lg:col-span-4) - Advanced Core AI Inspector */}
          <div className="lg:col-span-4 h-full">
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
