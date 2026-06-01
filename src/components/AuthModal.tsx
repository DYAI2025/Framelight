import React, { useState } from "react";
import { X, Lock, Mail, User, ShieldCheck, Sparkles } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: { id: string; email: string; name: string }) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  // Handle Form Submission (Sign in or Sign up)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Bitte füllen Sie alle erforderlichen Felder aus.");
      return;
    }

    if (password.length < 6) {
      setError("Das Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = activeTab === "signin" ? "/api/auth/signin" : "/api/auth/signup";
      const payload = activeTab === "signin" 
        ? { email, password } 
        : { email, password, name };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentifizierungsfehler.");
      }

      setSuccess(true);
      setTimeout(() => {
        onAuthSuccess(data.user);
        setSuccess(false);
        onClose();
      }, 1200);

    } catch (err: any) {
      setError(err.message || "Verbindung zum Server fehlgeschlagen.");
    } finally {
      setIsLoading(false);
    }
  };

  // Google Social Sign-In Simulated Integration
  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);

    try {
      // Simulate real Google Auth Popup interaction
      await new Promise((resolve) => setTimeout(resolve, 800));

      const res = await fetch("/api/auth/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "ben.poersch@gmail.com",
          name: "Ben Pörsch",
          provider: "google"
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Social Login fehlgeschlagen.");
      }

      setSuccess(true);
      setTimeout(() => {
        onAuthSuccess(data.user);
        setSuccess(false);
        onClose();
      }, 1200);

    } catch (err: any) {
      setError(err.message || "Integrierter Google-Dienst nicht verfügbar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#1D2433]/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-md rounded-2xl border border-[#E4E8F0] shadow-2xl p-6 md:p-8 overflow-hidden z-10 animate-fade-in">
        {/* Head */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg border border-transparent hover:border-[#E4E8F0] hover:bg-gray-50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto w-14 h-14 bg-green-50 text-green-500 rounded-full flex items-center justify-center border border-green-200 shadow-xs">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-md font-bold text-[#1D2433]">Erfolgreich eingeloggt!</h3>
              <p className="text-xs text-[#6B7280]">Ihre Analysen werden jetzt sicher mit Ihrem Konto synchronisiert.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-10 h-10 bg-gradient-to-tr from-[#2563EB] to-[#7C3AED] rounded-xl flex items-center justify-center text-white mb-3 shadow-md shadow-blue-100">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-[#1D2433] tracking-tight">Konto-Sicherheitszentrum</h2>
              <p className="text-xs text-[#6B7280] mt-1">Verwalten Sie Ihre Fallanalysen und synchronisieren Sie Scans.</p>
            </div>

            {/* Auth Tab Buttons */}
            <div className="flex bg-[#F1F4F9] p-1 rounded-xl">
              <button
                type="button"
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "signin"
                    ? "bg-white text-[#1D2433] shadow-xs"
                    : "text-[#6B7280] hover:text-[#1D2433]"
                }`}
                onClick={() => {
                  setActiveTab("signin");
                  setError(null);
                }}
              >
                Anmelden
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "signup"
                    ? "bg-white text-[#1D2433] shadow-xs"
                    : "text-[#6B7280] hover:text-[#1D2433]"
                }`}
                onClick={() => {
                  setActiveTab("signup");
                  setError(null);
                }}
              >
                Registrieren
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 text-xs px-3 py-2.5 rounded-lg border border-red-100 font-semibold">
                  {error}
                </div>
              )}

              {activeTab === "signup" && (
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider block">Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      className="w-full bg-[#F9FAFC] border border-[#E4E8F0] rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-1 focus:ring-[#2563EB] transition-all"
                      placeholder="z.B. Ben Pörsch"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider block">E-Mail Adresse</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    className="w-full bg-[#F9FAFC] border border-[#E4E8F0] rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-1 focus:ring-[#2563EB] transition-all"
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider block">Passwort</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    className="w-full bg-[#F9FAFC] border border-[#E4E8F0] rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-1 focus:ring-[#2563EB] transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:opacity-95 text-white py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-100 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : activeTab === "signin" ? (
                  "Anmelden"
                ) : (
                  "Konto erstellen"
                )}
              </button>
            </form>

            {/* Social Divider */}
            <div className="relative flex items-center justify-center py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E4E8F0]" />
              </div>
              <span className="relative bg-white px-3 text-[10px] text-[#6B7280] uppercase font-bold tracking-wider">oder</span>
            </div>

            {/* Google Authentication Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white border border-[#E4E8F0] hover:bg-gray-50 text-sm font-semibold text-[#1D2433] py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              {/* Google Colored Logo */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.3 1.51-1.14 2.78-2.4 3.63v3.01h3.86c2.26-2.08 3.56-5.14 3.56-8.7c0-.58-.04-1.12-.11-1.68z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3.01c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.11C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.28a7.22 7.22 0 0 1 0-4.56V6.61H1.29a11.94 11.94 0 0 0 0 10.78l3.98-3.11z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.93 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.98 3.11c.95-2.85 3.6-4.97 6.73-4.97z"
                />
              </svg>
              <span className="text-xs font-bold text-[#1D2433]">Mit Google anmelden</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
