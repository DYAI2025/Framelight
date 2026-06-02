import React, { useState } from "react";
import { 
  Users, 
  Share2, 
  MessageSquare, 
  Tag, 
  LogIn, 
  Sparkles, 
  CheckCircle, 
  Send,
  AlertTriangle,
  Radio,
  Clock,
  ShieldCheck
} from "lucide-react";

interface UserPresence {
  id: string;
  name: string;
  email: string;
  color: string;
}

interface LiveTag {
  id: string;
  speaker: string;
  text: string;
  marker: string;
  risk: "low" | "medium" | "high";
  author: string;
  timestamp: string;
}

interface ChatMessage {
  id: string;
  author: string;
  message: string;
  time: string;
  color: string;
}

interface CollaborativeSessionProps {
  roomId: string;
  setRoomId: (id: string) => void;
  onJoinRoom: (id: string) => void;
  onLeaveRoom: () => void;
  users: UserPresence[];
  liveTags: LiveTag[];
  chats: ChatMessage[];
  onSendChat: (message: string) => void;
  isConnected: boolean;
  user: { name: string; email: string } | null;
}

export default function CollaborativeSession({
  roomId,
  setRoomId,
  onJoinRoom,
  onLeaveRoom,
  users,
  liveTags,
  chats,
  onSendChat,
  isConnected,
  user
}: CollaborativeSessionProps) {
  const [inputRoomId, setInputRoomId] = useState("");
  const [chatInput, setChatInput] = useState("");

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputRoomId.trim()) return;
    onJoinRoom(inputRoomId.trim().toUpperCase());
  };

  const handleCreateRoom = () => {
    const randomId = "ROOM-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    onJoinRoom(randomId);
  };

  const handleSendChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendChat(chatInput.trim());
    setChatInput("");
  };

  // Color mapper helper for risk
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high": return "bg-red-50 text-red-500 border-red-200";
      case "medium": return "bg-amber-50 text-amber-500 border-amber-200";
      default: return "bg-emerald-50 text-emerald-500 border-emerald-200";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E4E8F0] p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
      
      {/* Session Title header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E4E8F0]">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#2563EB]" />
          <h2 className="text-xs font-bold text-[#1D2433] tracking-widest uppercase flex items-center gap-1.5">
            <span>Team-Echtzeit-Kollaboration</span>
            {isConnected && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </h2>
        </div>
        {isConnected && (
          <button 
            onClick={onLeaveRoom}
            className="text-[10px] text-red-500 font-bold hover:underline cursor-pointer"
          >
            Raum verlassen
          </button>
        )}
      </div>

      {!isConnected ? (
        <div className="space-y-4 my-auto py-4">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-blue-50 text-[#2563EB] rounded-2xl border border-blue-100">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-xs font-bold text-[#1D2433] uppercase tracking-wider">Multi-User Analysezentrum</h3>
            <p className="text-[11px] text-[#6B7280] max-w-sm mx-auto leading-relaxed">
              Arbeiten Sie mit mehreren Kollegen gleichzeitig im selben Raum. Textänderungen, Markierungen und Auswertungen synchronisieren sich live!
            </p>
          </div>

          <form onSubmit={handleJoinSubmit} className="space-y-2 max-w-xs mx-auto">
            <input
              type="text"
              value={inputRoomId}
              onChange={(e) => setInputRoomId(e.target.value)}
              placeholder="RAUM-CODE EINGEBEN..."
              className="w-full text-center py-2 px-3 text-xs font-mono font-bold tracking-wider text-[#1D2433] uppercase placeholder-gray-400 bg-[#F9FAFC] border border-[#E4E8F0] rounded-xl focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#2563EB]/40 transition-all uppercase"
            />
            <button
              type="submit"
              className="w-full py-2 bg-[#2563EB] hover:bg-[#1D2433] text-white font-bold text-[11px] uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Raum beitreten</span>
            </button>
          </form>

          <div className="relative flex py-2 items-center max-w-xs mx-auto">
            <div className="flex-grow border-t border-[#E4E8F0]"></div>
            <span className="flex-shrink mx-3 text-[9px] text-gray-400 font-bold uppercase tracking-widest">Oder</span>
            <div className="flex-grow border-t border-[#E4E8F0]"></div>
          </div>

          <button
            onClick={handleCreateRoom}
            type="button"
            className="w-full max-w-xs mx-auto py-2 border border-dashed border-[#2563EB]/40 hover:bg-blue-50/30 text-[#2563EB] font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Neuen Raum generieren</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-full">
          
          {/* Active Members & Presence List (col span 4) */}
          <div className="md:col-span-4 space-y-4 border-r border-[#F1F4F9] pr-4">
            <div>
              <span className="text-[10px] text-[#6B7280] uppercase tracking-widest font-bold block mb-2">
                Online ({users.length})
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center gap-2 p-1.5 rounded-lg bg-gray-50 border border-gray-100">
                    <div className={`h-6 w-6 rounded-lg ${u.color} text-white flex items-center justify-center text-[9px] font-bold uppercase`}>
                      {u.name.substring(0, 2)}
                    </div>
                    <div className="truncate shrink">
                      <p className="text-[11px] font-bold text-[#1D2433] truncate leading-tight">
                        {u.name} {u.id === user?.email || u.name === user?.name ? "(Du)" : ""}
                      </p>
                      <span className="text-[9px] text-[#6B7280] block truncate">{u.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[10px] text-[#6B7280] uppercase tracking-widest font-bold block mb-2">
                Raumfreigabe
              </span>
              <div className="p-2.5 bg-[#F9FAFC] border border-[#E4E8F0] rounded-xl flex items-center justify-between text-xs font-mono font-bold text-gray-700">
                <span className="text-[#2563EB] tracking-widest">{roomId}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(roomId);
                    alert(`Raum-Code "${roomId}" in Ihre Zwischenablage kopiert!`);
                  }}
                  className="p-1 text-gray-400 hover:text-[#2563EB] bg-white border border-[#E4E8F0] rounded transition-all cursor-pointer"
                  title="Raum-Code kopieren"
                >
                  <Share2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Chats & Live commentary board (col span 8) */}
          <div className="md:col-span-8 flex flex-col justify-between min-h-[220px]">
            
            {/* Conversations Feedback Streams */}
            <div className="space-y-3 flex-1 flex flex-col justify-between">
              
              <div className="grid grid-cols-2 gap-3 h-full">
                
                {/* Chat Panel Box */}
                <div className="flex flex-col h-[180px] border border-[#E4E8F0] rounded-xl overflow-hidden bg-[#F9FAFC]">
                  <div className="bg-white border-b border-[#E4E8F0] px-3 py-1.5 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-[#2563EB]" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-600">Diskussions-Kanal</span>
                  </div>
                  
                  <div className="p-2 space-y-2 overflow-y-auto flex-1 text-[11px]">
                    {chats.length === 0 ? (
                      <p className="text-gray-400 text-center italic py-6 text-[10px]">Noch keine Nachrichten. Schreiben Sie ein Feedback...</p>
                    ) : (
                      chats.map((c) => (
                        <div key={c.id} className="space-y-0.5">
                          <div className="flex items-baseline gap-1">
                            <span className="font-bold text-[#1D2433]">{c.author}</span>
                            <span className="text-[8px] text-gray-400">{c.time}</span>
                          </div>
                          <p className="bg-white p-1.5 border border-[#E4E8F0]/60 rounded-lg text-gray-700 leading-snug">
                            {c.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleSendChatSubmit} className="p-1 px-1.5 bg-white border-t border-[#E4E8F0] flex gap-1 items-center">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Feedback tippen..."
                      className="flex-1 bg-[#F9FAFC] border border-[#E4E8F0] px-2 py-1 rounded text-[11px] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#2563EB]/40 transition-all font-medium text-gray-700"
                    />
                    <button
                      type="submit"
                      className="p-1.5 bg-[#2563EB] text-white rounded hover:bg-indigo-600 transition-colors cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </form>
                </div>

                {/* Live Tagging patterns alert ticker */}
                <div className="flex flex-col h-[180px] border border-[#E4E8F0] rounded-xl overflow-hidden bg-[#F9FAFC]">
                  <div className="bg-white border-b border-[#E4E8F0] px-3 py-1.5 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-amber-500" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-600">Live-Musterüberwachung</span>
                  </div>

                  <div className="p-2 space-y-2 overflow-y-auto flex-1">
                    {liveTags.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-gray-400 italic text-[10px]">Keine Live-Tags.</p>
                        <p className="text-[9px] text-gray-400 mt-1">Sprecher-Segmente live markieren!</p>
                      </div>
                    ) : (
                      liveTags.map((t) => (
                        <div key={t.id} className={`p-2 border rounded-lg text-[10px] leading-snug bg-white ${getRiskColor(t.risk)}`}>
                          <div className="flex justify-between items-center font-bold mb-0.5">
                            <span>{t.speaker}: {t.marker}</span>
                            <span className="text-[8px] opacity-75">{t.timestamp}</span>
                          </div>
                          <p className="text-gray-600 italic font-medium line-clamp-2">
                            &quot;{t.text}&quot;
                          </p>
                          <span className="block text-[8px] text-[#2563EB] font-bold mt-1 uppercase">
                            Gekennzeichnet durch {t.author}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}
    </div>
  );
}
