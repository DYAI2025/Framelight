import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { computeFindingIntensity, computeOverallScores } from "./src/lib/scoring.ts";
import { AnalysisOutput, Finding, RiskLevel, ConfidenceLevel } from "./src/lib/types.ts";

// Load environment variables from .env file
dotenv.config();

import fs from "fs";
import crypto from "crypto";

interface UserAccount {
  id: string;
  email: string;
  passwordHash?: string;
  name?: string;
  provider?: string;
  history: any[];
}

const DB_FILE = path.join(process.cwd(), "users_database.json");

function readDb(): UserAccount[] {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return [];
    }
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to read auth db file", err);
    return [];
  }
}

function writeDb(data: UserAccount[]): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write auth db file", err);
  }
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "salt129_detector").digest("hex");
}

const app = express();
const PORT = 3000;

// Enable JSON middleware with a generous body limit for large transcripts
app.use(express.json({ limit: "5mb" }));

// API: Auth Signup
app.post("/api/auth/signup", (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "E-Mail und Passwort sind erforderlich." });
  }

  const db = readDb();
  const normalizedEmail = email.toLowerCase().trim();
  if (db.some(u => u.email === normalizedEmail)) {
    return res.status(400).json({ error: "Ein Konto mit dieser E-Mail existiert bereits." });
  }

  const newUser: UserAccount = {
    id: `u-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    name: name || email.split("@")[0],
    history: []
  };

  db.push(newUser);
  writeDb(db);

  return res.json({
    success: true,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    }
  });
});

// API: Auth Signin
app.post("/api/auth/signin", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "E-Mail und Passwort sind erforderlich." });
  }

  const db = readDb();
  const normalizedEmail = email.toLowerCase().trim();
  const user = db.find(u => u.email === normalizedEmail);

  if (!user || !user.passwordHash || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: "Ungültige E-Mail-Adresse oder Passwort." });
  }

  return res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    history: user.history || []
  });
});

// API: Social Google / Auth Connect
app.post("/api/auth/social", (req, res) => {
  const { email, name, provider } = req.body;
  if (!email) {
    return res.status(400).json({ error: "E-Mail ist für Social Login erforderlich." });
  }

  const db = readDb();
  const normalizedEmail = email.toLowerCase().trim();
  let user = db.find(u => u.email === normalizedEmail);

  if (!user) {
    user = {
      id: `u-social-${Date.now()}`,
      email: normalizedEmail,
      name: name || email.split("@")[0],
      provider: provider || "google",
      history: []
    };
    db.push(user);
    writeDb(db);
  }

  return res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      provider: user.provider
    },
    history: user.history || []
  });
});

// API: Sync history
app.post("/api/auth/sync-history", (req, res) => {
  const { userId, history } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "userId ist erforderlich." });
  }

  const db = readDb();
  const userIndex = db.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: "Benutzer nicht gefunden." });
  }

  db[userIndex].history = history || [];
  writeDb(db);

  return res.json({
    success: true,
    history: db[userIndex].history
  });
});

// API: Get history for a specific logged-in user
app.get("/api/auth/history", (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: "userId ist erforderlich." });
  }

  const db = readDb();
  const user = db.find(u => u.id === (userId as string));
  if (!user) {
    return res.status(404).json({ error: "Benutzer nicht gefunden." });
  }

  return res.json({
    success: true,
    history: user.history || []
  });
});

// Initialize the Google GenAI SDK if the API key is present
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API: Health probe
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// API: Analyze Text endpoint
app.post("/api/analyze", async (req, res) => {
  try {
    const { text, mode, evidenceReport } = req.body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "Bitte geben Sie einen Text ein, der analysiert werden soll." });
    }

    // Verify if API key is present
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({
        error: "GEMINI_API_KEY fehlt.",
        isConfigError: true,
        message: "Der Gemini API-Schlüssel wurde auf dem Server nicht gefunden. Sie können den Schlüssel in den AI Studio-Einstellungen unter 'Secrets' hinzufügen oder die App im 'Demo-Modus' mit lokalen Beispieldaten testen.",
      });
    }

    const ai = getGenAI();

    // Prepare system instructions and prompt
    const scanDepthText = mode === "deep" 
      ? `Führe eine detaillierte und tiefgehende psychologisch-kommunikatve Analyse (Deep Scan) durch.
Konzentriere dich explizit auf anspruchsvollere, hochgradig subtile und komplexe Interaktionsdynamiken:
1. Micro-Aggressions & subtile Seitenhiebe: Erkenne scheinbar höfliche oder banale Formulierungen, die passiv-aggressive Vorwürfe, subtile Entwertungen oder feine Nadelstiche bergen (z.B. condescending phrasing, ironischer Spott, übertriebener Formalismus).
2. Subtile Framing-Shifts über mehrere Runden hinweg: Analysiere, ob ein Sprecher schleichend das Thema verlagert oder die Diskussionsgrundlage unbemerkt verzerrt (z.B. wenn von einem sachlichen Problem unbemerkt zu einem angeblichen Charaktermangel des anderen gewechselt wird).
3. Sequenzielle Kombinationen (Sequences of Techniques): Identifiziere Ketten von Mustern, die strategisch aufeinander aufbauen (z.B. erst demonstratives Einschmeicheln o. Loyalitätsappell, dann Isolation/Kritikverbot, gefolgt von einer Schuldumkehr, wenn der Gesprächspartner sich wehrt).
Verfasse für JEDEN Befund im Deep-Scan-Modus extrem detaillierte und fundierte Erklärungen im Feld "possibleFunction" (welchen strategischen Nutzen, z.B. Machtasymmetrie herstellen, die Taktik in der Gesprächsdynamik hat) und "missingEvidence" (welche spezifischen Kontext-Variablen genau fehlen, wie z.B. historische Beziehungsdynamik, Stimmlage, vorherige Absprachen).`
      : "Führe einen schnellen Quick-Scan durch. Fokussiere dich auf die offensichtlichsten rhetorischen Taktiken.";

    const systemInstruction = `Du bist ein neutraler und evidenzbasierter Kommunikationsanalyse-Parser für "Manipulation Detector".
Deine Aufgabe ist es, Gesprächstranskripte, Chats oder E-Mails auf manipulative Kommunikationsmuster zu analysieren.

WICHTIGE DIKTATE:
1. Label oder pathologisiere NIEMALS Personen (z.B. betitelt niemanden als "Manipulator", "Narzisst" oder "toxisch"). Analysiere ausschließlich sprachliche Verhaltensweisen/Phänomene in den Textabschnitten.
2. Bleibe absolut wissenschaftlich, distanziert, sachlich und wohlwollend.
3. Für JEDEN Befund (Finding) musst du eine nachvollziehbare negative (kritische) Auslegung UND eine aufrichtige wohlwollende (harmlosere/alternative) Lesart angeben.
4. Identifiziere proaktiv Reparatur-Versuche (Entschuldigung, Selbstkorrektur, Deeskalation) und Resonanz-Signale (Eingehen auf den anderen, Validierung, echtes Beantworten einer Frage) im Verlauf.
5. Teile den übermittelten Text in Segmente ein. Jedes Segment repräsentiert einen Sprecherwechsel, einen Absatz oder einen markanten Satzteil und erhält eine fortlaufende ID (S1, S2, S3, etc.).
6. Wenn Sprecher wie "A:", "B:", "Person 1:", "Ich:" o.ä. im Text vorkommen, ordne sie konsequent den Sprecher-IDs zu (z.B. "A", "B").
7. Gib die Ergebnisse im exakten JSON-Format zurück, das nachfolgend beschrieben ist.

${scanDepthText}
Liefere das Ergebnis AUSSCHLIESSLICH als valides JSON entsprechend dem Schema. Keine Markdown-Formatierungen außerhalb des JSONs!`;

    const prompt = `Analysiere folgenden Text auf manipulative Kommunikationsmuster:

--- BEGINN DES TEXTES ---
${text}
--- ENDE DES TEXTES ---

Gib das Ergebnis als valides JSON-Objekt mit folgender Struktur zurück:
{
  "title": "Kurzer, neutraler, automatisch generierter Titel für diesen Fall",
  "summary": "Nüchterne, zusammenfassende Einordnung der Kommunikationsdynamik (2-3 Sätze)",
  "overall": {
    "manipulationRisk": "low" | "medium" | "high",
    "riskScore": 1.0 bis 5.0 (Vorschlag),
    "confidence": "low" | "medium" | "high",
    "confidenceScore": 1 bis 100,
    "markerDensity": Prozentwert (wie viel Prozent der Segmente auffällig sind),
    "dominantPattern": "z.B. Schuldumkehr, Framing, Appell an Loyalität",
    "segmentsAnalyzed": Anzahl der Segmente,
    "speakersDetected": Anzahl der Sprecher
  },
  "speakers": [
    {
      "id": "A", // ID des Sprechers z.B. "A", "B", "unknown"
      "label": "Name oder Label z.B. Sprecher A",
      "overallRisk": "low" | "medium" | "high",
      "dominantTechniques": ["Liste von 1-3 Mustern"],
      "markerCount": Anzahl gefundener Muster,
      "summary": "Kurze, wertfreie Beschreibung des Kommunikationsstils dieses Sprechers"
    }
  ],
  "segments": [
    {
      "id": "S1", // Fortlaufend
      "speakerId": "A" | "B" | "unknown",
      "text": "Wortlaut des Segment-Abschnitts",
      "timestamp": null,
      "findings": ["F1"] // Referenz ID aus findings, leer falls unauffällig
    }
  ],
  "findings": [
    {
      "id": "F1",
      "segmentId": "S1",
      "speakerId": "A",
      "quote": "die konkret beanstandete Textpassage",
      "marker": "Name des Musters (z.B. Schuldumkehr, Framing, Modal Pressure, Abwertung, Whataboutism, Strohmann, Ad-hominem, Gaslighting-ähnliches Muster, Quantifier Escalation, Isolation / Loyalitätsdruck, Drohung / Konsequenzdruck)",
      "category": "Kategorie (z.B. Manipulation, Druck, Framing, Abwertung)",
      "baseIntensity": 1 bis 5, // Erste Einschätzung auf einer Skala von 1 (sehr mild/subtil) bis 5 (massiv/bedrohlich)
      "confidence": "low" | "medium" | "high",
      "confidenceScore": 1 bis 100,
      "evidence": ["Beleg-Symptom 1", "Beleg-Symptom 2"],
      "whyFlagged": "Kommunikationstheoretische Erklärung, warum dies auffällt",
      "negativeReading": "Kritische Deutung des Musters (negative Lesart)",
      "benignReading": "Möglichst wohlwollende, alternative Deutung (z.B. Unsicherheit, Überlastung, ungeschickter Selbstausdruck)",
      "possibleFunction": "Welche Wirkung oder Funktion erfüllt diese Taktik im Gespräch?",
      "missingEvidence": ["Was fehlt uns zur Absicherung? z.B. Vorgeschichte, Tonfall, Mimik"],
      "repairBefore": true / false, // kam reparierendes Verhalten unmittelbar davor vor?
      "repairAfter": true / false, // folgt reparierendes Verhalten danach?
      "resonanceBefore": true / false,
      "resonanceAfter": true / false,
      "repetitionCount": Anzahl wie oft dieser Sprecher das Muster bereits verwendet hat,
      "convergenceMarkers": ["Muster, die zeitgleich im selben Segment auftreten"]
    }
  ]
}`;

    // Query Gemini
    const geminiResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.1, // low temperature for precise JSON construction which matches our guidelines
      }
    });

    const jsonText = geminiResponse.text;
    if (!jsonText) {
      throw new Error("Das Analyse-Modell hat keine Antwort geliefert.");
    }

    // Parse the JSON securely
    let result: any;
    try {
      // Remove possible markdown formatting wrapper in case Gemini ignored responseMimeType
      let cleanJson = jsonText.trim();
      if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      }
      result = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("Gemini raw response parsing error. Raw content was:\n", jsonText);
      throw new Error("Fehler beim Verarbeiten des Analyse-Ergebnisses. Bitte versuchen Sie es erneut.");
    }

    // Now, run the comprehensive scoring correction on the server-side to enforce absolute formula alignment with our scoring logic
    if (result && Array.isArray(result.findings)) {
      result.findings = result.findings.map((finding: any) => {
        // Enforce scoring math
        const corrected = computeFindingIntensity(finding);
        return {
          ...finding,
          finalIntensity: corrected.finalIntensity,
          risk: corrected.risk,
        };
      });

      // Recalculate overall scores
      const segmentsCount = Array.isArray(result.segments) ? result.segments.length : 1;
      const overallScores = computeOverallScores(result.findings, segmentsCount);

      result.overall = {
        ...result.overall,
        manipulationRisk: overallScores.manipulationRisk,
        riskScore: overallScores.riskScore,
        dominantPattern: overallScores.dominantPattern,
        segmentsAnalyzed: segmentsCount,
        speakersDetected: Array.isArray(result.speakers) ? result.speakers.length : 1,
      };

      // Populate timeline based on segments and recalculated findings
      const timelinePoints: any[] = [];
      if (Array.isArray(result.segments)) {
        result.segments.forEach((seg: any) => {
          const segFindings = result.findings.filter((f: any) => f.segmentId === seg.id);
          const maxIntensity = segFindings.length > 0 
            ? Math.max(...segFindings.map((f: any) => f.finalIntensity)) 
            : 0;
          
          const maxFinding = segFindings.find((f: any) => f.finalIntensity === maxIntensity);
          const dominantMarker = maxFinding ? maxFinding.marker : "-";
          const risk = maxIntensity > 0 ? scoreToRiskLevel(maxIntensity) : "low";

          const hasRepair = segFindings.some((f: any) => f.category === "Reparatur" || f.marker.toLowerCase().includes("reparatur") || f.repairBefore || f.repairAfter);
          const hasResonance = segFindings.some((f: any) => f.resonanceBefore || f.resonanceAfter);

          timelinePoints.push({
            segmentId: seg.id,
            maxIntensity,
            dominantMarker,
            risk,
            hasRepair,
            hasResonance,
          });
        });
      }
      result.timeline = timelinePoints;
    }

    return res.json(result);

  } catch (error: any) {
    console.error("Analysis route error:", error);
    return res.status(500).json({ error: error.message || "Interner Server-Fehler bei der Analyse." });
  }
});

// Setup Vite Dev Middleware in Development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode (Vite middleware integration)...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static files
    app.use(express.static(distPath));
    
    // SPA routing fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}

// Global scoreToRiskHelper
function scoreToRiskLevel(score: number): RiskLevel {
  if (score <= 2.0) return "low";
  if (score <= 3.5) return "medium";
  return "high";
}

startServer().catch((err) => {
  console.error("Failed to start the Express full-stack server:", err);
});
