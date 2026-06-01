import { ShieldCheck, Calendar, Sliders, History, Search, HelpCircle, Bell, LogIn, LogOut, User } from "lucide-react";

interface TopNavProps {
  onShowHistory: () => void;
  onShowTutorial: () => void;
  user: { id: string; email: string; name: string } | null;
  onAuthClick: () => void;
  onLogout: () => void;
}

export default function TopNav({ 
  onShowHistory, 
  onShowTutorial, 
  user, 
  onAuthClick, 
  onLogout 
}: TopNavProps) {
  
  // Extract user initials
  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    return parts.map(p => p[0]).join("").substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E4E8F0] bg-white px-6 py-3.5 flex items-center justify-between">
      {/* Brand Logo and Name */}
      <div className="flex items-center gap-2.5">
        <div className="bg-gradient-to-tr from-[#2563EB] to-[#7C3AED] p-2 rounded-xl text-white shadow-sm flex items-center justify-center">
          <ShieldCheck className="w-5 h-5" id="logo-icon" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-[#1D2433] tracking-tight">Manipulation Detector</h1>
          <p className="text-[10px] text-[#6B7280] font-mono leading-none tracking-wider uppercase mt-0.5">
            Evidence-Based Audio & Text Parser
          </p>
        </div>
      </div>

      {/* Navigation Utilities */}
      <div className="flex items-center gap-3">
        {/* Help Tutorial */}
        <button
          onClick={onShowTutorial}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E4E8F0] bg-[#F9FAFC] text-gray-500 hover:bg-[#F3F4F6] hover:text-[#1D2433] transition-colors cursor-pointer"
          title="Hilfe & Anleitung"
          id="btn-help"
        >
          <HelpCircle className="w-4.5 h-4.5" />
        </button>

        {/* Search */}
        <button
          onClick={onShowHistory}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E4E8F0] bg-[#F9FAFC] text-gray-500 hover:bg-[#F3F4F6] hover:text-[#1D2433] transition-colors cursor-pointer"
          title="Letzte Analysen"
          id="btn-history"
        >
          <History className="w-4.5 h-4.5" />
        </button>

        {/* Divider */}
        <div className="h-6 w-[1px] bg-[#E4E8F0]" />

        {/* User Info / Authentication state */}
        {user ? (
          <div className="flex items-center gap-2.5 pl-1">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-[#1D2433] truncate max-w-[124px]">{user.name}</p>
              <button 
                onClick={onLogout}
                className="text-[10px] text-red-500 font-bold hover:underline flex items-center gap-0.5 ml-auto cursor-pointer"
              >
                <LogOut className="w-2.5 h-2.5" />
                <span>Abmelden</span>
              </button>
            </div>
            <div 
              className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white text-xs font-bold shadow-xs cursor-pointer"
              title={`${user.name} (${user.email})`}
            >
              {getInitials(user.name)}
            </div>
          </div>
        ) : (
          <button
            onClick={onAuthClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#2563EB]/25 bg-blue-50/20 hover:bg-blue-50 text-[11px] font-bold text-[#2563EB] transition-all cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Konto verknüpfen</span>
          </button>
        )}
      </div>
    </header>
  );
}
