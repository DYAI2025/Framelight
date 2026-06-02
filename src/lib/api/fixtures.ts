import { WordthreatAnalyzeResponse } from "./contracts";

export const WORDTHREAT_MOCK_SUCCESS_FIXTURE: WordthreatAnalyzeResponse = {
  analysis_id: "wt-case-001",
  status: "completed",
  title: "Entscheidungsdiskurs & Vertrauensfrage (v1 API)",
  summary: "Die Konversation zeigt zu Beginn deutliche Abwehrtendenzen und Versuche der Schuldumkehr durch Sprecher A, der berechtigte organisatorische Rückfragen von Sprecher B als mangelndes Vertrauen oder Problem-Aufbauschung umzudeuten versucht. Im weiteren Verlauf zeigt Sprecher A jedoch deutliche Signale von Selbstreflexion, Selbstkorrektur (Reparatur) und geht konstruktiv auf die Wünsche von Sprecher B ein (Resonanz). Sprecher B kommuniziert durchgehend klar, sachlich und grenzziehend.",
  overall: {
    risk_level: "medium",
    risk_score: 2.8,
    confidence_score: 92,
    dominant_pattern: "Schuldumkehr",
    marker_density: 33,
    segments_analyzed: 9,
    speakers_detected: 2
  },
  segments: [
    {
      segment_id: "S1",
      speaker_id: "A",
      text: "Ich verstehe nicht, warum du das jetzt wieder zum Thema machst.",
      timestamp: null
    },
    {
      segment_id: "S2",
      speaker_id: "B",
      text: "Ich möchte nur klären, warum die Entscheidung ohne Rücksprache gefallen ist.",
      timestamp: null
    },
    {
      segment_id: "S3",
      speaker_id: "A",
      text: "Wenn du mir vertrauen würdest, würdest du nicht ständig alles infrage stellen.",
      timestamp: null
    },
    {
      segment_id: "S4",
      speaker_id: "B",
      text: "Es geht nicht um Vertrauen, sondern um Abstimmung.",
      timestamp: null
    },
    {
      segment_id: "S5",
      speaker_id: "A",
      text: "Genau das meine ich. Du machst aus jeder Kleinigkeit ein Problem.",
      timestamp: null
    },
    {
      segment_id: "S6",
      speaker_id: "B",
      text: "Ich hätte mir gewünscht, dass wir vorher kurz darüber sprechen.",
      timestamp: null
    },
    {
      segment_id: "S7",
      speaker_id: "A",
      text: "Okay, vielleicht hätte ich dich früher einbeziehen sollen. Aber du musst auch sehen, dass ich unter Druck stand.",
      timestamp: null
    },
    {
      segment_id: "S8",
      speaker_id: "B",
      text: "Danke, das hilft mir. Mir geht es darum, dass wir das nächstes Mal gemeinsam abstimmen.",
      timestamp: null
    },
    {
      segment_id: "S9",
      speaker_id: "A",
      text: "Einverstanden. Lass uns dafür einen kurzen Prozess festlegen.",
      timestamp: null
    }
  ],
  marker_findings: [
    {
      finding_id: "F1",
      segment_id: "S1",
      speaker_id: "A",
      quote: "warum du das jetzt wieder zum Thema machst",
      marker_name: "Abwertung / Minimierung",
      category_name: "Abwertung",
      intensity_score: 2,
      confidence: "high",
      confidence_score: 90,
      risk_level: "low",
      why_flagged: "Die sachliche Anfrage wird vorab diskreditiert, indem sie als unangebrachte oder redundante Wiederholung dargestellt wird. Dies verlagert den Fokus von der inhaltlichen Kritik auf die angebliche Aufdringlichkeit des Gegenübers.",
      negative_reading: "Versuch, die berechtigte Nachfrage im Keim zu ersticken, indem dem Gegenüber Nörgelei oder ein Beharren auf unnötigen Themen vorgeworfen wird.",
      benign_interpretation: "Sprecher A könnte sich überfordert oder erschöpft fühlen und die erneute Ansprache eines Konfliktthemas als anstrengend empfinden.",
      possible_function: "Diskreditierung des Gesprächsanlasses, Abwehr einer sachlichen Diskussion."
    },
    {
      finding_id: "F2",
      segment_id: "S3",
      speaker_id: "A",
      quote: "Wenn du mir vertrauen würdest, würdest du nicht ständig alles infrage stellen.",
      marker_name: "Schuldumkehr & Framing",
      category_name: "Druck",
      intensity_score: 4,
      confidence: "high",
      confidence_score: 95,
      risk_level: "medium",
      why_flagged: "Delegierung der Ursachenverantwortung an das Gegenüber. Die sachbezogene Kritik bezüglich einer fehlenden Absprache wird blockiert, indem sie zu einem moralischen Defizit des Gegenübers (mangelndes Vertrauen) deklariert wird.",
      negative_reading: "Durch das Errichten eines Loyalitätsdilemmas ('Wenn du mich magst/vertraust, schweigst du') wird das Gegenüber emotional unter Druck gesetzt und mundtot gemacht.",
      benign_interpretation: "Sprecher A fühlt sich durch die Nachfrage in seiner Kompetenz oder Integrität tief verunsichert und reagiert verletzlich, indem er die Frage auf die Vertrauensebene zieht.",
      possible_function: "Verschiebung des Diskurses von Sachebene auf moralische Beziehungsebene, um sich nicht rechtfertigen zu müssen."
    },
    {
      finding_id: "F3",
      segment_id: "S5",
      speaker_id: "A",
      quote: "Du machst aus jeder Kleinigkeit ein Problem.",
      marker_name: "Abwertung / Minimierung",
      category_name: "Abwertung",
      intensity_score: 3,
      confidence: "high",
      confidence_score: 88,
      risk_level: "medium",
      why_flagged: "Sprecher A verharmlost die mangelnde Abstimmung als 'Kleinigkeit' und diskreditiert die Kritik von B als überreagierendes Verhalten ('Problem machen').",
      negative_reading: "Minimierung eines realen organisatorischen Missstandes durch Herabsetzen der Urteilsfähigkeit des Gegenübers.",
      benign_interpretation: "Versuch, die eigene Anspannung und Fehlerhaftigkeit durch Entdramatisierung herunterzuspielen.",
      possible_function: "Entlastung von Verantwortung, Eskalationsvermeidung zu eigenen Gunsten."
    },
    {
      finding_id: "F4",
      segment_id: "S7",
      speaker_id: "A",
      quote: "vielleicht hätte ich dich früher einbeziehen sollen. Aber du musst auch sehen, dass ich unter Druck stand.",
      marker_name: "Mitleidsappell",
      category_name: "Druck",
      intensity_score: 2,
      confidence: "high",
      confidence_score: 91,
      risk_level: "low",
      why_flagged: "Sprecher A räumt zwar ein Versäumnis ein, rechtfertigt dieses aber sogleich durch Verweis auf äußeren 'Druck'. Dies dient als bedingtes Schuldeingeständnis mit Entlastungsanspruch.",
      negative_reading: "Verwässerung der Verantwortung durch Einforderung von Mitleid oder Nachsicht für das eigene Fehlverhalten.",
      benign_interpretation: "Ehrliche Offenlegung einer Belastungssituation bei gleichzeitigem Versuch der Entschuldigung (Reparaturverhalten).",
      possible_function: "Deeskalationsversuch bei gleichzeitiger Minderung der eigenen Schuldhaftigkeit."
    }
  ],
  evidence_items: [
    {
      evidence_id: "E1_F1",
      finding_id: "F1",
      description: "Verwendung von 'wieder' (Signalwort für Generalisierung)",
      type: "linguistic"
    },
    {
      evidence_id: "E2_F1",
      finding_id: "F1",
      description: "Framing des Themas als unnötige Wiederholung",
      type: "linguistic"
    },
    {
      evidence_id: "E1_F2",
      finding_id: "F2",
      description: "Kopplung von Sachkritik an Beziehungs-Vertrauen",
      type: "linguistic"
    },
    {
      evidence_id: "E2_F2",
      finding_id: "F2",
      description: "Verzerrung: 'ständig alles' (Quantifier Escalation)",
      type: "linguistic"
    },
    {
      evidence_id: "E1_F3",
      finding_id: "F3",
      description: "Minimierungs-Phrase 'Kleinigkeit'",
      type: "linguistic"
    },
    {
      evidence_id: "E1_F4",
      finding_id: "F4",
      description: "Rechtfertigender Konjunktiv ('hätte... einbeziehen sollen')",
      type: "linguistic"
    },
    {
      evidence_id: "E2_F4",
      finding_id: "F4",
      description: "Kausale Verknüpfung mit persönlichem Druckzustand",
      type: "linguistic"
    }
  ],
  ui_projection: {
    timeline: [
      {
        segmentId: "S1",
        maxIntensity: 2,
        dominantMarker: "Abwertung / Minimierung",
        risk: "low",
        hasRepair: false,
        hasResonance: false
      },
      {
        segmentId: "S2",
        maxIntensity: 0,
        dominantMarker: "",
        risk: "low",
        hasRepair: false,
        hasResonance: false
      },
      {
        segmentId: "S3",
        maxIntensity: 4,
        dominantMarker: "Schuldumkehr & Framing",
        risk: "medium",
        hasRepair: false,
        hasResonance: false
      },
      {
        segmentId: "S4",
        maxIntensity: 0,
        dominantMarker: "",
        risk: "low",
        hasRepair: false,
        hasResonance: false
      },
      {
        segmentId: "S5",
        maxIntensity: 3,
        dominantMarker: "Abwertung / Minimierung",
        risk: "medium",
        hasRepair: false,
        hasResonance: false
      },
      {
        segmentId: "S6",
        maxIntensity: 0,
        dominantMarker: "",
        risk: "low",
        hasRepair: false,
        hasResonance: false
      },
      {
        segmentId: "S7",
        maxIntensity: 2,
        dominantMarker: "Mitleidsappell",
        risk: "low",
        hasRepair: true,
        hasResonance: true
      },
      {
        segmentId: "S8",
        maxIntensity: 0,
        dominantMarker: "",
        risk: "low",
        hasRepair: false,
        hasResonance: true
      },
      {
        segmentId: "S9",
        maxIntensity: 0,
        dominantMarker: "",
        risk: "low",
        hasRepair: false,
        hasResonance: true
      }
    ]
  }
};
