import { AnalysisOutput, HistoryItem } from './types';

export const SAMPLE_TEXT = `A: Ich verstehe nicht, warum du das jetzt wieder zum Thema machst.
B: Ich möchte nur klären, warum die Entscheidung ohne Rücksprache gefallen ist.
A: Wenn du mir vertrauen würdest, würdest du nicht ständig alles infrage stellen.
B: Es geht nicht um Vertrauen, sondern um Abstimmung.
A: Genau das meine ich. Du machst aus jeder Kleinigkeit ein Problem.
B: Ich hätte mir gewünscht, dass wir vorher kurz darüber sprechen.
A: Okay, vielleicht hätte ich dich früher einbeziehen sollen. Aber du musst auch sehen, dass ich unter Druck stand.
B: Danke, das hilft mir. Mir geht es darum, dass wir das nächstes Mal gemeinsam abstimmen.
A: Einverstanden. Lass uns dafür einen kurzen Prozess festlegen.`;

export const SAMPLE_ANALYSIS: AnalysisOutput = {
  title: "Entscheidungsdiskurs & Vertrauensfrage",
  summary: "Die Konversation zeigt zu Beginn deutliche Abwehrtendenzen und Versuche der Schuldumkehr durch Sprecher A, der berechtigte organisatorische Rückfragen von Sprecher B als mangelndes Vertrauen oder Problem-Aufbauschung umzudeuten versucht. Im weiteren Verlauf zeigt Sprecher A jedoch deutliche Signale von Selbstreflexion, Selbstkorrektur (Reparatur) und geht konstruktiv auf die Wünsche von Sprecher B ein (Resonanz). Sprecher B kommuniziert durchgehend klar, sachlich und grenzziehend.",
  overall: {
    manipulationRisk: "medium",
    riskScore: 2.8,
    confidence: "high",
    confidenceScore: 92,
    markerDensity: 33, // 3 of 9 segments have notable markers
    dominantPattern: "Schuldumkehr",
    segmentsAnalyzed: 9,
    speakersDetected: 2
  },
  speakers: [
    {
      id: "A",
      label: "Sprecher A",
      overallRisk: "medium",
      dominantTechniques: ["Schuldumkehr", "Abwertung / Minimierung", "Deutungsversuch (Vertrauen)"],
      markerCount: 3,
      summary: "Nutzt anfangs defensive rhetorische Muster, um von der Sachfrage (mangelnde Rücksprache) abzulenken. Geht am Ende jedoch auf Klärung ein, zeigt Reparaturverhalten und akzeptiert die Grenzziehung von B."
    },
    {
      id: "B",
      label: "Sprecher B",
      overallRisk: "low",
      dominantTechniques: ["Grenzziehung & Sachorientierung", "Bedürfnisäußerung"],
      markerCount: 0,
      summary: "Bleibt sachorientiert, widersteht der Umlenkung auf die Vertrauensebene, wiederholt das sachliche Anliegen ruhig und nimmt das Reparaturangebot konstruktiv an."
    }
  ],
  segments: [
    {
      id: "S1",
      speakerId: "A",
      text: "Ich verstehe nicht, warum du das jetzt wieder zum Thema machst.",
      timestamp: null,
      findings: ["F1"]
    },
    {
      id: "S2",
      speakerId: "B",
      text: "Ich möchte nur klären, warum die Entscheidung ohne Rücksprache gefallen ist.",
      timestamp: null,
      findings: []
    },
    {
      id: "S3",
      speakerId: "A",
      text: "Wenn du mir vertrauen würdest, würdest du nicht ständig alles infrage stellen.",
      timestamp: null,
      findings: ["F2"]
    },
    {
      id: "S4",
      speakerId: "B",
      text: "Es geht nicht um Vertrauen, sondern um Abstimmung.",
      timestamp: null,
      findings: []
    },
    {
      id: "S5",
      speakerId: "A",
      text: "Genau das meine ich. Du machst aus jeder Kleinigkeit ein Problem.",
      timestamp: null,
      findings: ["F3"]
    },
    {
      id: "S6",
      speakerId: "B",
      text: "Ich hätte mir gewünscht, dass wir vorher kurz darüber sprechen.",
      timestamp: null,
      findings: []
    },
    {
      id: "S7",
      speakerId: "A",
      text: "Okay, vielleicht hätte ich dich früher einbeziehen sollen. Aber du musst auch sehen, dass ich unter Druck stand.",
      timestamp: null,
      findings: ["F4"]
    },
    {
      id: "S8",
      speakerId: "B",
      text: "Danke, das hilft mir. Mir geht es darum, dass wir das nächstes Mal gemeinsam abstimmen.",
      timestamp: null,
      findings: []
    },
    {
      id: "S9",
      speakerId: "A",
      text: "Einverstanden. Lass uns dafür einen kurzen Prozess festlegen.",
      timestamp: null,
      findings: []
    }
  ],
  findings: [
    {
      id: "F1",
      segmentId: "S1",
      speakerId: "A",
      quote: "warum du das jetzt wieder zum Thema machst",
      marker: "Abwertung / Minimierung",
      category: "Abwertung",
      baseIntensity: 2,
      finalIntensity: 2.2,
      confidence: "high",
      confidenceScore: 90,
      risk: "low",
      evidence: ["Verwendung von 'wieder' (Signalwort für Generalisierung)", "Framing des Themas als unnötige Wiederholung"],
      whyFlagged: "Die sachliche Anfrage wird vorab diskreditiert, indem sie als unangebrachte oder redundante Wiederholung dargestellt wird. Dies verlagert den Fokus von der inhaltlichen Kritik auf die angebliche Aufdringlichkeit des Gegenübers.",
      negativeReading: "Versuch, die berechtigte Nachfrage im Keim zu ersticken, indem dem Gegenüber Nörgelei oder ein Beharren auf unnötigen Themen vorgeworfen wird.",
      benignReading: "Sprecher A könnte sich überfordert oder erschöpft fühlen und die erneute Ansprache eines Konfliktthemas als anstrengend empfinden.",
      possibleFunction: "Diskreditierung des Gesprächsanlasses, Abwehr einer sachlichen Diskussion.",
      missingEvidence: ["Tonfall", "Gemeinsame Vorgeschichte (gab es dieses Thema wirklich schon sehr oft?)"],
      repairBefore: false,
      repairAfter: false,
      resonanceBefore: false,
      resonanceAfter: false,
      repetitionCount: 1,
      convergenceMarkers: []
    },
    {
      id: "F2",
      segmentId: "S3",
      speakerId: "A",
      quote: "Wenn du mir vertrauen würdest, würdest du nicht ständig alles infrage stellen.",
      marker: "Schuldumkehr & Framing",
      category: "Druck",
      baseIntensity: 4,
      finalIntensity: 3.5,
      confidence: "high",
      confidenceScore: 95,
      risk: "medium",
      evidence: ["Kopplung von Sachkritik an Beziehungs-Vertrauen", "Verzerrung: 'ständig alles' (Quantifier Escalation)"],
      whyFlagged: "Delegierung der Ursachenverantwortung an das Gegenüber. Die sachbezogene Kritik bezüglich einer fehlenden Absprache wird blockiert, indem sie zu einem moralischen Defizit des Gegenübers (mangelndes Vertrauen) deklariert wird.",
      negativeReading: "Durch das Errichten eines Loyalitätsdilemmas ('Wenn du mich magst/vertraust, schweigst du') wird das Gegenüber emotional unter Druck gesetzt und mundtot gemacht.",
      benignReading: "Sprecher A fühlt sich durch die Nachfrage in seiner Kompetenz oder Integrität tief verunsichert und reagiert verletzlich, indem er die Frage auf die Vertrauensebene zieht.",
      possibleFunction: "Verschiebung des Diskurses von Sachebene auf moralische Beziehungsebene, um sich nicht rechtfertigen zu müssen.",
      missingEvidence: ["Beziehungskontext", "Kommunikationsvergangenheit"],
      repairBefore: false,
      repairAfter: true, // S7 is repair!
      resonanceBefore: false,
      resonanceAfter: true, // S7-S9 have resonance
      repetitionCount: 1,
      convergenceMarkers: ["Generalisierung", "Schuldzuweisung"]
    },
    {
      id: "F3",
      segmentId: "S5",
      speakerId: "A",
      quote: "Du machst aus jeder Kleinigkeit ein Problem.",
      marker: "Minimierung / Framing",
      category: "Abwertung",
      baseIntensity: 3,
      finalIntensity: 2.5,
      confidence: "high",
      confidenceScore: 90,
      risk: "medium",
      evidence: ["Verwendung von 'jeder Kleinigkeit' (Minimierung)", "Framing des Verhaltens als 'Problem-Machen'"],
      whyFlagged: "Die inhaltliche Berechtigung des Gegenübers wird entwertet, indem das Thema willkürlich als 'Kleinigkeit' abgetan wird. Das Gegenüber wird pathologisiert bzw. als überempfindlich dargestellt.",
      negativeReading: "Taktische Entwertung der Kritik, um den eigenen Fehler nicht eingestehen zu müssen und das Gegenüber als irrational zu delegitimieren.",
      benignReading: "Sprecher A empfindet die Situation subjektiv tatsächlich als unwichtiges Detail und versteht die Aufregung darum aufrichtig nicht.",
      possibleFunction: "Herabstufen der inhaltlichen Relevanz des Themas, Entlastung von Rechtfertigungsdruck.",
      missingEvidence: ["Absprachevereinbarungen im Team", "Schwere der Entscheidung"],
      repairBefore: false,
      repairAfter: true,
      resonanceBefore: false,
      resonanceAfter: true,
      repetitionCount: 2,
      convergenceMarkers: []
    },
    {
      id: "F4",
      segmentId: "S7",
      speakerId: "A",
      quote: "Okay, vielleicht hätte ich dich früher einbeziehen sollen. Aber...",
      marker: "Teilweise Reparatur & Relativierung",
      category: "Reparatur",
      baseIntensity: 2,
      finalIntensity: 1.8,
      confidence: "high",
      confidenceScore: 92,
      risk: "low",
      evidence: ["Eingeständnis: 'hätte ich dich früher einbeziehen sollen'", "Einschränkung durch 'Aber du musst auch sehen' (Erklärungslast)"],
      whyFlagged: "Echtes Teil-Eingeständnis eines eigenen Fehlers (Reparatur), das jedoch im selben Atemzug relativiert wird ('Aber... unter Druck'). Trotz Einschränkung überwiegt hier die Deeskalationsleistung gegenüber den vorherigen Segmenten.",
      negativeReading: "Eine Pseudo-Entschuldigung, die sofort entlastet wird, indem die Schuld an die äußeren Umstände (Druck) abgegeben wird.",
      benignReading: "Ein ehrliches, verletzliches Zugeben des Fehlers, kombiniert mit dem menschlichen Bedürfnis, die eigene Überlastung verständlich zu machen.",
      possibleFunction: "Deeskalation und Brückenbau für eine gemeinsame Lösung, während das Selbstbild geschützt wird.",
      missingEvidence: ["Arbeitsbelastung von A", "Dringlichkeit der Entscheidung"],
      repairBefore: true,
      repairAfter: true,
      resonanceBefore: true,
      resonanceAfter: true,
      repetitionCount: 1,
      convergenceMarkers: ["Selbstkorrektur", "Erklärung"]
    }
  ],
  timeline: [
    { segmentId: "S1", maxIntensity: 2.2, dominantMarker: "Abwertung", risk: "low", hasRepair: false, hasResonance: false },
    { segmentId: "S2", maxIntensity: 0, dominantMarker: "-", risk: "low", hasRepair: false, hasResonance: false },
    { segmentId: "S3", maxIntensity: 3.5, dominantMarker: "Schuldumkehr", risk: "medium", hasRepair: false, hasResonance: false },
    { segmentId: "S4", maxIntensity: 0, dominantMarker: "-", risk: "low", hasRepair: false, hasResonance: false },
    { segmentId: "S5", maxIntensity: 2.5, dominantMarker: "Minimierung", risk: "medium", hasRepair: false, hasResonance: false },
    { segmentId: "S6", maxIntensity: 0, dominantMarker: "-", risk: "low", hasRepair: false, hasResonance: false },
    { segmentId: "S7", maxIntensity: 1.8, dominantMarker: "Reparatur", risk: "low", hasRepair: true, hasResonance: true },
    { segmentId: "S8", maxIntensity: 0, dominantMarker: "-", risk: "low", hasRepair: true, hasResonance: true },
    { segmentId: "S9", maxIntensity: 0, dominantMarker: "-", risk: "low", hasRepair: true, hasResonance: true }
  ]
};

export const INSTANT_SAMPLE_CASES: HistoryItem[] = [
  {
    id: "case-1",
    title: "Entscheidungsdiskurs (Muster-Beispiel)",
    date: "01. Juni 2026",
    risk: "medium",
    riskScore: 2.8,
    dominantPattern: "Schuldumkehr",
    text: SAMPLE_TEXT,
    output: SAMPLE_ANALYSIS
  },
  {
    id: "case-2",
    title: "Projektmeeting: Kompetenz-Konflikt",
    date: "28. Mai 2026",
    risk: "high",
    riskScore: 4.1,
    dominantPattern: "Deutungshoheit & Isolation",
    text: `Chef: Wir müssen die Struktur ändern. Wenn Sie das nicht verstehen, sind Sie vielleicht nicht fit genug für die Führungsrolle.\nMitarbeiter: Ich verstehe die Notwendigkeit, sehe aber Probleme im Kundenservice.\nChef: Es geht hier nicht ums Diskutieren. Wer bei der Restrukturierung zweifelt, sabotiert das gesamte Team. Ich erwarte absolute Loyalität.`,
    output: {
      title: "Kompetenz-Konflikt im Team",
      summary: "Der Gesprächsausschnitt weist extreme manipulative Muster auf. Der Vorgesetzte nutzt seine hierarchische Position aus, um sachliche Bedenken als persönliche Inkompetenz darzustellen ('nicht fit genug'), droht implizit mit Statusverlust und verknüpft sachlichen Zweifel direkt mit 'Sabotage'. Es finden keinerlei Reparatur- oder Resonanzangebote statt.",
      overall: {
        manipulationRisk: "high",
        riskScore: 4.2,
        confidence: "high",
        confidenceScore: 95,
        markerDensity: 66,
        dominantPattern: "Deutungshoheit & Isolation",
        segmentsAnalyzed: 3,
        speakersDetected: 2
      },
      speakers: [
        {
          id: "Chef",
          label: "Chef",
          overallRisk: "high",
          dominantTechniques: ["Drohung / Konsequenzdruck", "Abwertung / Inkompetenz-Framing", "Loyalitätsdruck / Isolierung"],
          markerCount: 2,
          summary: "Nutzt strukturelle Macht, um durch Drohungen und Entwertungen Gehorsam einzufordern. Weicht inhaltlicher Kritik komplett aus."
        },
        {
          id: "Mitarbeiter",
          label: "Mitarbeiter",
          overallRisk: "low",
          dominantTechniques: ["Sachargumentation"],
          markerCount: 0,
          summary: "Formuliert sachlich fundierten Gegeneinwand und bleibt professionell."
        }
      ],
      segments: [
        {
          id: "S1",
          speakerId: "Chef",
          text: "Wir müssen die Struktur ändern. Wenn Sie das nicht verstehen, sind Sie vielleicht nicht fit genug für die Führungsrolle.",
          timestamp: null,
          findings: ["FC1"]
        },
        {
          id: "S2",
          speakerId: "Mitarbeiter",
          text: "Ich verstehe die Notwendigkeit, sehe aber Probleme im Kundenservice.",
          timestamp: null,
          findings: []
        },
        {
          id: "S3",
          speakerId: "Chef",
          text: "Es geht hier nicht ums Diskutieren. Wer bei der Restrukturierung zweifelt, sabotiert das gesamte Team. Ich erwarte absolute Loyalität.",
          timestamp: null,
          findings: ["FC2"]
        }
      ],
      findings: [
        {
          id: "FC1",
          segmentId: "S1",
          speakerId: "Chef",
          quote: "Wenn Sie das nicht verstehen, sind Sie vielleicht nicht fit genug für die Führungsrolle.",
          marker: "Abwertung / Inkompetenz-Framing",
          category: "Abwertung",
          baseIntensity: 4,
          finalIntensity: 4.2,
          confidence: "high",
          confidenceScore: 94,
          risk: "high",
          evidence: ["Inkompetenz-Unterstellung", "Androhung von Kompetenzverlust"],
          whyFlagged: "Zweifel an einer Entscheidung werden auf die persönliche Kompetenz des Mitarbeiters projiziert, um ihn einzuschüchtern.",
          negativeReading: "Autoritärer Versuch, Widerspruch durch die Androhung von Degradierung oder Karriereauswirkungen zu blockieren.",
          benignReading: "Der Vorgesetzte könnte unter extremem Druck der Geschäftsführung stehen und überreagieren, weil er schnelle Ergebnisse liefern muss.",
          possibleFunction: "Etablierung absoluter Deutungshoheit, Brechen von sachlichem Widerstand.",
          missingEvidence: ["Vorgeschichte der Zielvereinbarungen", "Tonfall"],
          repairBefore: false,
          repairAfter: false,
          resonanceBefore: false,
          resonanceAfter: false,
          repetitionCount: 1,
          convergenceMarkers: ["Machtasymmetrie"]
        },
        {
          id: "FC2",
          segmentId: "S3",
          speakerId: "Chef",
          quote: "Wer bei der Restrukturierung zweifelt, sabotiert das gesamte Team. Ich erwarte absolute Loyalität.",
          marker: "Loyalitätsdruck & Isolierung",
          category: "Druck",
          baseIntensity: 5,
          finalIntensity: 4.8,
          confidence: "high",
          confidenceScore: 96,
          risk: "high",
          evidence: ["Gleichsetzung von Zweifel mit 'Sabotage'", "Forderung nach 'absoluter Loyalität'"],
          whyFlagged: "Kritik wird als böswilliger Angriff auf die Gemeinschaft geframed, wodurch die Person sozial isoliert wird ('sabotiert das gesamte Team').",
          negativeReading: "Klassisches Schwarz-Weiß-Szenario zur Erzwingung bedingungslosen Gehorsams unter Androhung des Teamausschlusses.",
          benignReading: "Der Vorgesetzte glaubt fälschlicherweise, dass eine geschlossene Front im Team im Moment überlebenswichtig ist.",
          possibleFunction: "Unterdrücken jeglicher Abweichung, emotionale Einschüchterung.",
          missingEvidence: ["Unternehmenskultur"],
          repairBefore: false,
          repairAfter: false,
          resonanceBefore: false,
          resonanceAfter: false,
          repetitionCount: 2,
          convergenceMarkers: ["Schuldumkehr", "Isolierung"]
        }
      ],
      timeline: [
        { segmentId: "S1", maxIntensity: 4.2, dominantMarker: "Abwertung", risk: "high", hasRepair: false, hasResonance: false },
        { segmentId: "S2", maxIntensity: 0, dominantMarker: "-", risk: "low", hasRepair: false, hasResonance: false },
        { segmentId: "S3", maxIntensity: 4.8, dominantMarker: "Loyalitätsdruck", risk: "high", hasRepair: false, hasResonance: false }
      ]
    }
  },
  {
    id: "case-3",
    title: "E-Mail: Klärungsversuch",
    date: "15. Mai 2026",
    risk: "low",
    riskScore: 1.5,
    dominantPattern: "Neutraler Austausch",
    text: `Hallo, mir ist aufgefallen, dass im Bericht noch ein Fehler ist. Können wir uns das kurz anschauen?\nAntwort: Danke für den Hinweis! Ich habe es korrigiert. Lass uns morgen kurz abstimmen, ob alles passt.`,
    output: {
      title: "Neutraler Austausch",
      summary: "Der Mailverkehr verläuft völlig neutral und sachorientiert. Auf den Hinweis eines Fehlers folgt sofortige Annahme (Resonanz) und Berichtigung (Reparatur) ohne defensive Rechtfertigung oder Gegenangriffe.",
      overall: {
        manipulationRisk: "low",
        riskScore: 1.2,
        confidence: "high",
        confidenceScore: 98,
        markerDensity: 0,
        dominantPattern: "Keine",
        segmentsAnalyzed: 2,
        speakersDetected: 2
      },
      speakers: [
        {
          id: "A",
          label: "Sender",
          overallRisk: "low",
          dominantTechniques: [],
          markerCount: 0,
          summary: "Kommuniziert sachlich, höflich und konstruktiv."
        },
        {
          id: "B",
          label: "Empfänger",
          overallRisk: "low",
          dominantTechniques: [],
          markerCount: 0,
          summary: "Nimmt Kritik dankbar an und korrigiert den Fehler sofort (hohe Resonanz und Reparatur)."
        }
      ],
      segments: [
        {
          id: "S1",
          speakerId: "A",
          text: "Hallo, mir ist aufgefallen, dass im Bericht noch ein Fehler ist. Können wir uns das kurz anschauen?",
          timestamp: null,
          findings: []
        },
        {
          id: "S2",
          speakerId: "B",
          text: "Danke für den Hinweis! Ich habe es korrigiert. Lass uns morgen kurz abstimmen, ob alles passt.",
          timestamp: null,
          findings: []
        }
      ],
      findings: [],
      timeline: [
        { segmentId: "S1", maxIntensity: 0.0, dominantMarker: "Neutral", risk: "low", hasRepair: false, hasResonance: false },
        { segmentId: "S2", maxIntensity: 0.0, dominantMarker: "Neutral", risk: "low", hasRepair: true, hasResonance: true }
      ]
    }
  }
];
