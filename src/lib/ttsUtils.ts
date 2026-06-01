import { Finding } from "./types";

export interface TTSConfig {
  rate: number;
  pitch: number;
  modeName: string;
}

export function getTTSConfigForMarker(marker: string | undefined): TTSConfig {
  if (!marker) {
    return { rate: 1.0, pitch: 1.0, modeName: "Standard" };
  }
  
  const m = marker.toLowerCase();
  if (m.includes("modal pressure") || m.includes("druck")) {
    return { rate: 1.25, pitch: 1.15, modeName: "Eindringlich (Schneller & Angespannt)" };
  }
  if (m.includes("schuld") || m.includes("umkehr") || m.includes("projektion")) {
    return { rate: 0.85, pitch: 0.85, modeName: "Anklagend (Langsamer & Tief)" };
  }
  if (m.includes("gaslighting") || m.includes("strohmann") || m.includes("irrweg")) {
    return { rate: 1.05, pitch: 1.25, modeName: "Skeptisch / Instabil" };
  }
  if (m.includes("abwertung") || m.includes("ad-hominem") || m.includes("beleidigung")) {
    return { rate: 1.2, pitch: 0.9, modeName: "Scharf / Kalt" };
  }
  if (m.includes("reparatur") || m.includes("deeskalation") || m.includes("neutral")) {
    return { rate: 0.95, pitch: 1.05, modeName: "Deeskalierend (Sanft)" };
  }
  
  return { rate: 1.0, pitch: 1.0, modeName: "Standard" };
}

export function speakText(
  text: string, 
  marker?: string, 
  onStart?: () => void, 
  onEnd?: () => void
): void {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    console.warn("SpeechSynthesis is not supported in this environment");
    return;
  }
  
  // Clean up any ongoing speaking
  window.speechSynthesis.cancel();
  
  if (!text || text.trim().length === 0) return;
  
  // Format quote cleanly (removing outer quotes)
  const cleanText = text.replace(/^["'„“«»]/, "").replace(/["'„“«»]$/, "");
  
  const utterance = new SpeechSynthesisUtterance(cleanText);
  
  // Configure language and search for matching native voices
  const voices = window.speechSynthesis.getVoices();
  const deVoice = voices.find(v => v.lang.startsWith("de"));
  if (deVoice) {
    utterance.voice = deVoice;
    utterance.lang = deVoice.lang;
  } else {
    utterance.lang = "de-DE";
  }
  
  const config = getTTSConfigForMarker(marker);
  utterance.rate = config.rate;
  utterance.pitch = config.pitch;
  
  if (onStart) {
    utterance.onstart = onStart;
  }
  
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }
  
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
