# Framelight: wordthreat_API v1 Reference Client

Dieses Repository implementiert den offiziellen textbasierten Reference Client für das **wordthreat_API v1** Spezifikationsmodell. Die Anwendung wurde von direkten LLM/Gemini Kopplungen migriert und arbeitet nun ausschließlich über eine dedizierte Client-Schnittstelle (`WordthreatClient`).

## 🛠 Features (v1 Standard)

- **Vollständige Entkopplung**: Keine direkten API-Aufrufe an Drittanbieter-LLMs aus der Benutzeroberfläche heraus. Sämtliche Scans laufen über standardisierte API-Endpunkte.
- **Fehler-Normalisierung**: Konsistente Konvertierung von Netzwerkfehlern, Authentifizierungsproblemen (401/403), Ratelimits (429) und Serverstörungen (5xx) über einen zentralen Normalizer (`normalizeApiError`).
- **Standardisierte Endpunkte**:
  - `GET /v1/health` - Integritäts- und Bereitschaftsprüfung der API.
  - `POST /v1/analyze` - Text-Analyse und Segmentierung sprachlicher Beeinflussungsversuche.
  - `GET /v1/analyses/{analysis_id}` - Abfrage historischer Analyseberichte.
  - `GET /v1/markers` - Katalog aller vordefinierten manipulativen Textmerkmale.
  - `GET /v1/marker-packs` - Thematische Merkmalsbündel zur gezielten Diskus-Erkennung.
- **Offline-Demomodus**: Vollwertiger systemischer Fallback mit dynamischer Texteigen-Segmentierung und Risikoverteilung, wenn keine API-Endpunkt-URL konfiguriert ist.
- **Text-Only Modality Gating**: Audio- und Videomodalitäten sind in der standardisierten v1-Spezifikation deaktiviert. Physische Verhaltens-Biomarker (z.B. Mimik-Stress, Voice-Jitter) wurden zur Wahrung der wissenschaftlichen Redlichkeit und Regulierungstreue dekonstruiert.

## 📁 Architektur-Struktur

```
src/lib/api/
├── contracts.ts      # V1 Standard DTOs (Data Transfer Objects)
├── errors.ts         # Einheitliche Fehlerbehandlung & Duck-Typing-Parser
├── fixtures.ts       # Validierte Mockup-Ergebnisse für Offline-Scans
├── mappers.ts        # UI-Adapter (Konvertiert API-DTOs in Dashboard-Sichten)
├── wordthreatClient.ts # Zentraler HTTP-Verbindungshandler
└── runTests.ts       # Lokales Assert-Testskript (Ausführbar über tsx)
```

## ⚙️ Umgebungs-Konfiguration (`.env`)

Kopieren Sie die `.env.example` Datei und passen Sie die Werte an:

```bash
# Basis-URL des wordthreat_API v1 Endpunktes
VITE_WORDTHREAT_API_BASE_URL="https://api.your-wordthreat-service.com"

# Schaltet den Offline-Demomodus ein. Ist "true", wenn kein API_BASE_URL konfiguriert wird.
VITE_WORDTHREAT_DEMO_MODE="false"
```

## 🧪 Tests ausführen

Das Repository verfügt über ein robustes, integriertes Unit-Test-Skript zur Verifikation von Mappern, Normalisierungen und Datenkonsistenz.

Führen Sie die Tests mit folgendem Befehl aus:

```bash
npx tsx src/lib/api/runTests.ts
```
