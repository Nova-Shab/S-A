/**
 * Vollständiger EU AI Act Anforderungskatalog
 * Basierend auf Verordnung (EU) 2024/1689
 *
 * Struktur:
 * - Kategorien (Categories) gruppieren thematisch zusammenhängende Anforderungen
 * - Jede Anforderung hat eine eindeutige ID, Beschreibung und Artikel-Referenz
 * - Anforderungen sind nach Risikoklasse gefiltert
 */

export type RiskClass = 'PROHIBITED' | 'HIGH_RISK' | 'LIMITED_RISK' | 'MINIMAL_RISK' | 'ALL';

export interface Requirement {
  id: string;
  category: string;
  subcategory?: string;
  title: string;
  description: string;
  explanation: string; // Verständliche Erklärung für Nicht-Juristen
  articleReference: string;
  applicableRiskClasses: RiskClass[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  evidenceTypes: string[]; // Welche Dokumente als Nachweis akzeptiert werden
  checklistItems?: string[]; // Konkrete Prüfpunkte
}

export interface RequirementCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirements: Requirement[];
}

export const EU_AI_ACT_REQUIREMENTS: RequirementCategory[] = [
  // ============================================
  // KATEGORIE 1: VERBOTENE PRAKTIKEN (Art. 5)
  // ============================================
  {
    id: 'prohibited_practices',
    name: 'Verbotene KI-Praktiken',
    description: 'Prüfung auf verbotene KI-Anwendungen gemäß Art. 5 EU AI Act',
    icon: '🚫',
    requirements: [
      {
        id: 'PROB-001',
        category: 'prohibited_practices',
        title: 'Kein Social Scoring',
        description: 'Wird das System zur sozialen Bewertung (Social Scoring) von natürlichen Personen durch Behörden eingesetzt?',
        explanation: 'Social Scoring bedeutet die Bewertung von Personen basierend auf ihrem sozialen Verhalten, was zu ungerechtfertigter Diskriminierung führen kann. Solche Systeme sind in der EU verboten.',
        articleReference: 'Art. 5(1)(c) EU AI Act',
        applicableRiskClasses: ['ALL'],
        priority: 'critical',
        evidenceTypes: ['Systemdokumentation', 'Zweckbestimmung'],
        checklistItems: [
          'Keine Bewertung von Personen basierend auf sozialem Verhalten',
          'Keine Aggregation von Daten aus verschiedenen Lebensbereichen zur Bewertung',
          'Keine nachteiligen Konsequenzen basierend auf Scoring-Ergebnissen',
        ],
      },
      {
        id: 'PROB-002',
        category: 'prohibited_practices',
        title: 'Keine unterschwellige Manipulation',
        description: 'Setzt das System unterschwellige Techniken ein, die das Bewusstsein einer Person umgehen?',
        explanation: 'Unterschwellige Manipulation bedeutet die Beeinflussung von Menschen ohne deren Bewusstsein, z.B. durch nicht wahrnehmbare Stimuli. Dies ist verboten, wenn es zu Schäden führen kann.',
        articleReference: 'Art. 5(1)(a) EU AI Act',
        applicableRiskClasses: ['ALL'],
        priority: 'critical',
        evidenceTypes: ['Technische Dokumentation', 'UX-Analyse'],
        checklistItems: [
          'Keine versteckten persuasiven Techniken',
          'Keine unterschwelligen akustischen oder visuellen Stimuli',
          'Transparente Interaktionsgestaltung',
        ],
      },
      {
        id: 'PROB-003',
        category: 'prohibited_practices',
        title: 'Keine Ausnutzung von Schutzbedürftigen',
        description: 'Nutzt das System Schwächen von Personen (Alter, Behinderung, soziale/wirtschaftliche Situation) aus?',
        explanation: 'KI-Systeme dürfen nicht gezielt Kinder, Menschen mit Behinderungen oder wirtschaftlich schwache Personen ausnutzen, um deren Verhalten zu beeinflussen.',
        articleReference: 'Art. 5(1)(b) EU AI Act',
        applicableRiskClasses: ['ALL'],
        priority: 'critical',
        evidenceTypes: ['Risikoanalyse', 'Zielgruppenanalyse'],
        checklistItems: [
          'Identifikation schutzbedürftiger Nutzergruppen',
          'Keine gezielte Ausnutzung von Vulnerabilitäten',
          'Schutzmaßnahmen für vulnerable Nutzer',
        ],
      },
      {
        id: 'PROB-004',
        category: 'prohibited_practices',
        title: 'Keine biometrische Echtzeit-Fernidentifikation',
        description: 'Wird das System zur biometrischen Echtzeit-Fernidentifikation in öffentlich zugänglichen Räumen eingesetzt?',
        explanation: 'Biometrische Echtzeit-Identifikation (z.B. Gesichtserkennung in Echtzeit) in öffentlichen Räumen ist grundsätzlich verboten, mit eng begrenzten Ausnahmen für die Strafverfolgung.',
        articleReference: 'Art. 5(1)(h) EU AI Act',
        applicableRiskClasses: ['ALL'],
        priority: 'critical',
        evidenceTypes: ['Systemdokumentation', 'Einsatzkonzept'],
        checklistItems: [
          'Keine Echtzeit-Gesichtserkennung im öffentlichen Raum',
          'Keine kontinuierliche biometrische Überwachung',
          'Falls Ausnahme beansprucht: Dokumentation der rechtlichen Grundlage',
        ],
      },
      {
        id: 'PROB-005',
        category: 'prohibited_practices',
        title: 'Keine Emotionserkennung am Arbeitsplatz/in Bildung',
        description: 'Wird das System zur Emotionserkennung am Arbeitsplatz oder in Bildungseinrichtungen eingesetzt?',
        explanation: 'Die Nutzung von KI zur Erkennung von Emotionen von Mitarbeitern oder Schülern ist verboten, außer aus medizinischen oder sicherheitsrelevanten Gründen.',
        articleReference: 'Art. 5(1)(f) EU AI Act',
        applicableRiskClasses: ['ALL'],
        priority: 'critical',
        evidenceTypes: ['Einsatzkonzept', 'Datenschutz-Folgenabschätzung'],
        checklistItems: [
          'Keine Gesichtsanalyse zur Emotionserkennung',
          'Keine Stimmungsanalyse von Mitarbeitern/Schülern',
          'Keine Produktivitätsüberwachung basierend auf emotionalen Zuständen',
        ],
      },
      {
        id: 'PROB-006',
        category: 'prohibited_practices',
        title: 'Keine biometrische Kategorisierung nach sensiblen Merkmalen',
        description: 'Kategorisiert das System Personen anhand biometrischer Daten nach Rasse, Religion, sexueller Orientierung etc.?',
        explanation: 'KI-Systeme, die Menschen basierend auf biometrischen Daten nach sensiblen Merkmalen wie ethnischer Herkunft oder Religion kategorisieren, sind verboten.',
        articleReference: 'Art. 5(1)(g) EU AI Act',
        applicableRiskClasses: ['ALL'],
        priority: 'critical',
        evidenceTypes: ['Technische Dokumentation', 'Algorithmenbeschreibung'],
        checklistItems: [
          'Keine Ableitung sensibler Merkmale aus biometrischen Daten',
          'Keine Kategorisierung nach ethnischer Herkunft',
          'Keine Kategorisierung nach religiösen/politischen Überzeugungen',
        ],
      },
      {
        id: 'PROB-007',
        category: 'prohibited_practices',
        title: 'Keine ungezielten Gesichtsbilddatenbanken',
        description: 'Werden Gesichtsbilder ungezielt aus dem Internet oder Überwachungskameras gesammelt?',
        explanation: 'Das massenhafte Sammeln von Gesichtsbildern (Scraping) aus dem Internet oder von Überwachungsaufnahmen zum Aufbau von Datenbanken ist verboten.',
        articleReference: 'Art. 5(1)(e) EU AI Act',
        applicableRiskClasses: ['ALL'],
        priority: 'critical',
        evidenceTypes: ['Datenherkunftsnachweis', 'Datenbeschaffungskonzept'],
        checklistItems: [
          'Keine Verwendung von gescrapten Gesichtsbildern',
          'Dokumentierte und legitime Datenquellen',
          'Einwilligung für alle biometrischen Daten',
        ],
      },
      {
        id: 'PROB-008',
        category: 'prohibited_practices',
        title: 'Keine prädiktive Polizeiarbeit auf Einzelpersonen',
        description: 'Wird das System zur Vorhersage von Straftaten einzelner Personen basierend auf Profiling verwendet?',
        explanation: 'KI-Systeme, die vorhersagen, ob eine bestimmte Person eine Straftat begehen wird (basierend auf Persönlichkeitsmerkmalen oder Profiling), sind verboten.',
        articleReference: 'Art. 5(1)(d) EU AI Act',
        applicableRiskClasses: ['ALL'],
        priority: 'critical',
        evidenceTypes: ['Systemdokumentation', 'Algorithmenbeschreibung'],
        checklistItems: [
          'Keine individuelle Kriminalitätsprognose',
          'Keine Risikobewertung einzelner Personen für Straftaten',
          'Keine Profilierung zur Straftatvorhersage',
        ],
      },
    ],
  },

  // ============================================
  // KATEGORIE 2: RISIKOMANAGEMENT (Art. 9)
  // ============================================
  {
    id: 'risk_management',
    name: 'Risikomanagement',
    description: 'Anforderungen an das Risikomanagementsystem für Hochrisiko-KI',
    icon: '⚠️',
    requirements: [
      {
        id: 'RISK-001',
        category: 'risk_management',
        title: 'Risikomanagementsystem etabliert',
        description: 'Ist ein kontinuierliches Risikomanagementsystem für das KI-System eingerichtet?',
        explanation: 'Hochrisiko-KI-Systeme müssen über ein dokumentiertes Risikomanagementsystem verfügen, das während des gesamten Lebenszyklus betrieben wird.',
        articleReference: 'Art. 9(1) EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'critical',
        evidenceTypes: ['Risikomanagement-Richtlinie', 'Risikomanagement-Plan'],
        checklistItems: [
          'Dokumentiertes Risikomanagementsystem vorhanden',
          'Verantwortlichkeiten für Risikomanagement definiert',
          'Regelmäßige Überprüfung des Systems',
        ],
      },
      {
        id: 'RISK-002',
        category: 'risk_management',
        title: 'Risikoidentifikation durchgeführt',
        description: 'Wurden alle bekannten und vorhersehbaren Risiken für Gesundheit, Sicherheit und Grundrechte identifiziert?',
        explanation: 'Es müssen systematisch alle Risiken erfasst werden, die das KI-System für die Gesundheit, Sicherheit oder Grundrechte von Personen darstellen könnte.',
        articleReference: 'Art. 9(2)(a) EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'critical',
        evidenceTypes: ['Risikoregister', 'Risikoanalyse-Bericht'],
        checklistItems: [
          'Systematische Risikoidentifikation durchgeführt',
          'Risiken für Gesundheit identifiziert',
          'Risiken für Sicherheit identifiziert',
          'Risiken für Grundrechte identifiziert',
        ],
      },
      {
        id: 'RISK-003',
        category: 'risk_management',
        title: 'Risikobewertung und -minderung',
        description: 'Wurden identifizierte Risiken bewertet und Maßnahmen zur Minderung festgelegt?',
        explanation: 'Jedes identifizierte Risiko muss nach Eintrittswahrscheinlichkeit und Schwere bewertet werden. Angemessene Maßnahmen zur Risikominderung müssen implementiert werden.',
        articleReference: 'Art. 9(2)(b-c) EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'critical',
        evidenceTypes: ['Risikobewertungsmatrix', 'Maßnahmenplan'],
        checklistItems: [
          'Risiken nach Schwere bewertet',
          'Risiken nach Eintrittswahrscheinlichkeit bewertet',
          'Risikominderungsmaßnahmen definiert',
          'Maßnahmen implementiert und dokumentiert',
        ],
      },
      {
        id: 'RISK-004',
        category: 'risk_management',
        title: 'Restrisiken akzeptabel',
        description: 'Sind die verbleibenden Restrisiken nach Implementierung von Maßnahmen akzeptabel?',
        explanation: 'Nach Umsetzung aller Maßnahmen müssen die verbleibenden Risiken dokumentiert und als akzeptabel bewertet sein.',
        articleReference: 'Art. 9(4) EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'high',
        evidenceTypes: ['Restrisikoanalyse', 'Akzeptanzentscheidung'],
        checklistItems: [
          'Restrisiken identifiziert',
          'Restrisiken dokumentiert',
          'Akzeptanzentscheidung getroffen',
          'Akzeptanzkriterien definiert',
        ],
      },
      {
        id: 'RISK-005',
        category: 'risk_management',
        title: 'Tests zur Risikominderung',
        description: 'Wurden Tests durchgeführt, um die Wirksamkeit der Risikominderungsmaßnahmen zu überprüfen?',
        explanation: 'Die implementierten Maßnahmen müssen durch geeignete Tests validiert werden, um ihre Wirksamkeit nachzuweisen.',
        articleReference: 'Art. 9(7) EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'high',
        evidenceTypes: ['Testberichte', 'Validierungsnachweise'],
        checklistItems: [
          'Testplan für Risikominderungsmaßnahmen',
          'Tests durchgeführt',
          'Wirksamkeit nachgewiesen',
          'Ergebnisse dokumentiert',
        ],
      },
      {
        id: 'RISK-006',
        category: 'risk_management',
        title: 'Berücksichtigung besonderer Nutzergruppen',
        description: 'Wurden Risiken für Kinder und andere vulnerable Gruppen besonders berücksichtigt?',
        explanation: 'Bei der Risikoanalyse müssen besonders schutzbedürftige Nutzergruppen wie Kinder oder Menschen mit Behinderungen berücksichtigt werden.',
        articleReference: 'Art. 9(9) EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'high',
        evidenceTypes: ['Nutzergruppen-Analyse', 'Schutzmaßnahmen-Dokumentation'],
        checklistItems: [
          'Vulnerable Nutzergruppen identifiziert',
          'Spezifische Risiken für Kinder analysiert',
          'Spezifische Risiken für behinderte Personen analysiert',
          'Angemessene Schutzmaßnahmen implementiert',
        ],
      },
    ],
  },

  // ============================================
  // KATEGORIE 3: DATENQUALITÄT (Art. 10)
  // ============================================
  {
    id: 'data_governance',
    name: 'Daten und Datenqualität',
    description: 'Anforderungen an Trainingsdaten, Validierungsdaten und Daten-Governance',
    icon: '📊',
    requirements: [
      {
        id: 'DATA-001',
        category: 'data_governance',
        title: 'Daten-Governance etabliert',
        description: 'Sind angemessene Daten-Governance- und Datenmanagement-Praktiken implementiert?',
        explanation: 'Es müssen klare Prozesse für die Verwaltung, Qualitätssicherung und Kontrolle der für das KI-System verwendeten Daten existieren.',
        articleReference: 'Art. 10(1) EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'critical',
        evidenceTypes: ['Daten-Governance-Richtlinie', 'Datenmanagement-Plan'],
        checklistItems: [
          'Daten-Governance-Framework vorhanden',
          'Verantwortlichkeiten für Datenmanagement definiert',
          'Prozesse für Datenqualitätssicherung implementiert',
        ],
      },
      {
        id: 'DATA-002',
        category: 'data_governance',
        title: 'Trainingsdaten-Dokumentation',
        description: 'Sind die Trainingsdatensätze vollständig dokumentiert?',
        explanation: 'Alle für Training, Validierung und Test verwendeten Datensätze müssen dokumentiert sein, einschließlich Herkunft, Umfang und Eigenschaften.',
        articleReference: 'Art. 10(2) EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'critical',
        evidenceTypes: ['Datensatz-Dokumentation', 'Data Dictionary'],
        checklistItems: [
          'Datenquellen dokumentiert',
          'Datenumfang beschrieben',
          'Datenmerkmale definiert',
          'Datenerhebungsmethoden dokumentiert',
        ],
      },
      {
        id: 'DATA-003',
        category: 'data_governance',
        title: 'Datenqualitätskriterien erfüllt',
        description: 'Erfüllen die Datensätze angemessene Qualitätskriterien (Relevanz, Repräsentativität, Fehlerfreiheit)?',
        explanation: 'Trainingsdaten müssen relevant, repräsentativ und möglichst fehlerfrei sein, um ein zuverlässiges KI-System zu gewährleisten.',
        articleReference: 'Art. 10(3) EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'critical',
        evidenceTypes: ['Datenqualitätsbericht', 'Validierungsprotokolle'],
        checklistItems: [
          'Relevanz der Daten geprüft',
          'Repräsentativität sichergestellt',
          'Daten auf Fehler geprüft',
          'Qualitätsmetriken definiert und gemessen',
        ],
      },
      {
        id: 'DATA-004',
        category: 'data_governance',
        title: 'Bias-Prüfung durchgeführt',
        description: 'Wurden die Datensätze auf mögliche Verzerrungen (Bias) untersucht?',
        explanation: 'Systematische Verzerrungen in Trainingsdaten können zu diskriminierenden Ergebnissen führen und müssen identifiziert und adressiert werden.',
        articleReference: 'Art. 10(2)(f) EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'critical',
        evidenceTypes: ['Bias-Analyse', 'Fairness-Report'],
        checklistItems: [
          'Bias-Analyse durchgeführt',
          'Demografische Verzerrungen geprüft',
          'Maßnahmen zur Bias-Reduktion implementiert',
          'Regelmäßige Überprüfung geplant',
        ],
      },
      {
        id: 'DATA-005',
        category: 'data_governance',
        title: 'Statistische Eigenschaften analysiert',
        description: 'Wurden die statistischen Eigenschaften der Datensätze analysiert?',
        explanation: 'Die statistischen Merkmale der Daten (Verteilungen, Korrelationen, Lücken) müssen verstanden und dokumentiert sein.',
        articleReference: 'Art. 10(2)(e) EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'medium',
        evidenceTypes: ['Statistische Analyse', 'Explorative Datenanalyse'],
        checklistItems: [
          'Datenverteilungen analysiert',
          'Datenlücken identifiziert',
          'Korrelationen untersucht',
          'Anomalien erkannt und behandelt',
        ],
      },
      {
        id: 'DATA-006',
        category: 'data_governance',
        title: 'Besondere Datenkategorien rechtmäßig',
        description: 'Falls besondere Kategorien personenbezogener Daten verarbeitet werden: Ist dies rechtlich zulässig?',
        explanation: 'Die Verarbeitung sensibler Daten (Gesundheit, Biometrie, ethnische Herkunft etc.) erfordert eine besondere Rechtsgrundlage.',
        articleReference: 'Art. 10(5) EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'critical',
        evidenceTypes: ['Rechtsgrundlage-Dokumentation', 'DSFA'],
        checklistItems: [
          'Besondere Datenkategorien identifiziert',
          'Rechtsgrundlage für Verarbeitung dokumentiert',
          'DSFA durchgeführt (falls erforderlich)',
          'Zusätzliche Schutzmaßnahmen implementiert',
        ],
      },
    ],
  },

  // ============================================
  // KATEGORIE 4: TECHNISCHE DOKUMENTATION (Art. 11)
  // ============================================
  {
    id: 'technical_documentation',
    name: 'Technische Dokumentation',
    description: 'Anforderungen an die technische Dokumentation des KI-Systems',
    icon: '📄',
    requirements: [
      {
        id: 'DOC-001',
        category: 'technical_documentation',
        title: 'Technische Dokumentation vorhanden',
        description: 'Existiert eine umfassende technische Dokumentation des KI-Systems?',
        explanation: 'Vor dem Inverkehrbringen muss eine technische Dokumentation erstellt werden, die alle relevanten Informationen zum System enthält.',
        articleReference: 'Art. 11(1), Anhang IV EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'critical',
        evidenceTypes: ['Technische Dokumentation', 'Systemarchitektur'],
        checklistItems: [
          'Dokumentation gemäß Anhang IV erstellt',
          'Dokumentation vollständig',
          'Dokumentation aktuell',
        ],
      },
      {
        id: 'DOC-002',
        category: 'technical_documentation',
        title: 'Allgemeine Beschreibung',
        description: 'Enthält die Dokumentation eine allgemeine Beschreibung des KI-Systems?',
        explanation: 'Eine verständliche Beschreibung der Funktionsweise, des Zwecks und der vorgesehenen Nutzung muss dokumentiert sein.',
        articleReference: 'Anhang IV Nr. 1 EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'high',
        evidenceTypes: ['Systemübersicht', 'Zweckbestimmung'],
        checklistItems: [
          'Zweckbestimmung definiert',
          'Vorgesehene Nutzung beschrieben',
          'Zielgruppe/Nutzer definiert',
          'Funktionsweise erklärt',
        ],
      },
      {
        id: 'DOC-003',
        category: 'technical_documentation',
        title: 'Detaillierte Systembeschreibung',
        description: 'Sind die Elemente des KI-Systems und der Entwicklungsprozess detailliert beschrieben?',
        explanation: 'Die technischen Komponenten, verwendeten Algorithmen und der Entwicklungsprozess müssen nachvollziehbar dokumentiert sein.',
        articleReference: 'Anhang IV Nr. 2 EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'high',
        evidenceTypes: ['Systemarchitektur', 'Entwicklungsdokumentation'],
        checklistItems: [
          'Systemarchitektur dokumentiert',
          'Algorithmen beschrieben',
          'Entwicklungsprozess dokumentiert',
          'Verwendete Tools und Frameworks aufgelistet',
        ],
      },
      {
        id: 'DOC-004',
        category: 'technical_documentation',
        title: 'Überwachungs- und Testverfahren',
        description: 'Sind die Überwachungs-, Funktions- und Kontrolltestverfahren dokumentiert?',
        explanation: 'Die Methoden zur Überwachung und Prüfung des Systems während der Entwicklung und im Betrieb müssen beschrieben sein.',
        articleReference: 'Anhang IV Nr. 3 EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'high',
        evidenceTypes: ['Testplan', 'Testberichte', 'Monitoring-Konzept'],
        checklistItems: [
          'Testverfahren definiert',
          'Testmetriken festgelegt',
          'Monitoring-Strategie dokumentiert',
          'Testergebnisse archiviert',
        ],
      },
      {
        id: 'DOC-005',
        category: 'technical_documentation',
        title: 'Änderungsmanagement',
        description: 'Sind Prozesse für das Management von Änderungen am KI-System dokumentiert?',
        explanation: 'Änderungen am System müssen nachvollziehbar sein und dürfen die Konformität nicht gefährden.',
        articleReference: 'Anhang IV Nr. 4 EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'medium',
        evidenceTypes: ['Änderungsmanagement-Prozess', 'Änderungshistorie'],
        checklistItems: [
          'Änderungsmanagement-Prozess definiert',
          'Versionierung implementiert',
          'Änderungen dokumentiert',
          'Impact-Analyse bei Änderungen',
        ],
      },
    ],
  },

  // ============================================
  // KATEGORIE 5: AUFZEICHNUNGSPFLICHTEN (Art. 12)
  // ============================================
  {
    id: 'record_keeping',
    name: 'Aufzeichnung und Protokollierung',
    description: 'Anforderungen an automatische Aufzeichnung und Logging',
    icon: '📝',
    requirements: [
      {
        id: 'LOG-001',
        category: 'record_keeping',
        title: 'Automatische Protokollierung',
        description: 'Verfügt das KI-System über automatische Protokollierungsfunktionen (Logging)?',
        explanation: 'Hochrisiko-KI-Systeme müssen automatisch Ereignisse protokollieren, um die Nachvollziehbarkeit während des Betriebs zu gewährleisten.',
        articleReference: 'Art. 12(1) EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'critical',
        evidenceTypes: ['Logging-Konzept', 'Technische Spezifikation'],
        checklistItems: [
          'Logging-System implementiert',
          'Automatische Protokollierung aktiv',
          'Logs nachvollziehbar und vollständig',
        ],
      },
      {
        id: 'LOG-002',
        category: 'record_keeping',
        title: 'Rückverfolgbarkeit gewährleistet',
        description: 'Ermöglichen die Logs die Rückverfolgbarkeit der Funktionsweise während des Lebenszyklus?',
        explanation: 'Die Protokolle müssen ausreichend Details enthalten, um Entscheidungen und Ereignisse nachvollziehen zu können.',
        articleReference: 'Art. 12(2) EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'high',
        evidenceTypes: ['Log-Beispiele', 'Traceability-Dokumentation'],
        checklistItems: [
          'Entscheidungen nachvollziehbar',
          'Eingaben protokolliert',
          'Ausgaben protokolliert',
          'Zeitstempel vorhanden',
        ],
      },
      {
        id: 'LOG-003',
        category: 'record_keeping',
        title: 'Aufbewahrungsfristen eingehalten',
        description: 'Werden die Protokolle für die erforderliche Dauer aufbewahrt?',
        explanation: 'Logs müssen für einen angemessenen Zeitraum aufbewahrt werden, um Audits und Untersuchungen zu ermöglichen.',
        articleReference: 'Art. 12(3) EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'high',
        evidenceTypes: ['Aufbewahrungsrichtlinie', 'Archivierungskonzept'],
        checklistItems: [
          'Aufbewahrungsfristen definiert',
          'Archivierung implementiert',
          'Löschkonzept vorhanden',
          'Compliance mit DSGVO sichergestellt',
        ],
      },
    ],
  },

  // ============================================
  // KATEGORIE 6: TRANSPARENZ (Art. 13 + Art. 50)
  // ============================================
  {
    id: 'transparency',
    name: 'Transparenz und Information',
    description: 'Transparenzanforderungen für Hochrisiko- und Limited-Risk-Systeme',
    icon: '👁️',
    requirements: [
      {
        id: 'TRANS-001',
        category: 'transparency',
        title: 'Gebrauchsanweisung bereitgestellt',
        description: 'Wird den Betreibern eine verständliche Gebrauchsanweisung zur Verfügung gestellt?',
        explanation: 'Betreiber müssen klare Anweisungen erhalten, wie das KI-System bestimmungsgemäß und sicher zu verwenden ist.',
        articleReference: 'Art. 13(1) EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'critical',
        evidenceTypes: ['Gebrauchsanweisung', 'Bedienungsanleitung'],
        checklistItems: [
          'Gebrauchsanweisung vorhanden',
          'Für Zielgruppe verständlich',
          'Bestimmungsgemäße Verwendung beschrieben',
          'Einschränkungen genannt',
        ],
      },
      {
        id: 'TRANS-002',
        category: 'transparency',
        title: 'Leistungsmerkmale dokumentiert',
        description: 'Sind die Leistungsmerkmale, Fähigkeiten und Grenzen des Systems dokumentiert?',
        explanation: 'Nutzer müssen über die Leistungsfähigkeit und Grenzen des Systems informiert werden, um es richtig einsetzen zu können.',
        articleReference: 'Art. 13(3)(b) EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'high',
        evidenceTypes: ['Leistungsdokumentation', 'Spezifikationen'],
        checklistItems: [
          'Genauigkeitsmetriken dokumentiert',
          'Bekannte Einschränkungen genannt',
          'Anwendungsgrenzen definiert',
          'Fehlerraten kommuniziert',
        ],
      },
      {
        id: 'TRANS-003',
        category: 'transparency',
        title: 'KI-Interaktion kenntlich gemacht',
        description: 'Werden Nutzer darüber informiert, dass sie mit einem KI-System interagieren?',
        explanation: 'Personen müssen wissen, wenn sie mit einer KI (z.B. Chatbot) interagieren, außer dies ist offensichtlich.',
        articleReference: 'Art. 50(1) EU AI Act',
        applicableRiskClasses: ['LIMITED_RISK', 'HIGH_RISK'],
        priority: 'high',
        evidenceTypes: ['UI-Screenshots', 'Hinweistexte'],
        checklistItems: [
          'KI-Hinweis sichtbar',
          'Hinweis vor oder bei Interaktion',
          'Kontaktmöglichkeit zu Menschen vorhanden',
        ],
      },
      {
        id: 'TRANS-004',
        category: 'transparency',
        title: 'Synthetische Inhalte gekennzeichnet',
        description: 'Werden KI-generierte oder manipulierte Inhalte (Deepfakes, synthetische Medien) gekennzeichnet?',
        explanation: 'KI-generierte Bilder, Videos, Audio oder Texte müssen als solche erkennbar sein.',
        articleReference: 'Art. 50(4) EU AI Act',
        applicableRiskClasses: ['LIMITED_RISK'],
        priority: 'high',
        evidenceTypes: ['Kennzeichnungskonzept', 'Beispiele'],
        checklistItems: [
          'Maschinenlesbare Kennzeichnung implementiert',
          'Für Nutzer erkennbare Hinweise',
          'Kennzeichnung manipulationssicher',
        ],
      },
      {
        id: 'TRANS-005',
        category: 'transparency',
        title: 'Emotionserkennung offengelegt',
        description: 'Werden Personen über den Einsatz von Emotionserkennung oder biometrischer Kategorisierung informiert?',
        explanation: 'Wenn das System Emotionen erkennt oder biometrische Kategorisierung vornimmt, müssen betroffene Personen informiert werden.',
        articleReference: 'Art. 50(3) EU AI Act',
        applicableRiskClasses: ['LIMITED_RISK', 'HIGH_RISK'],
        priority: 'high',
        evidenceTypes: ['Datenschutzerklärung', 'Hinweistexte'],
        checklistItems: [
          'Information über Emotionserkennung',
          'Information vor Verarbeitung',
          'Opt-out-Möglichkeit geprüft',
        ],
      },
    ],
  },

  // ============================================
  // KATEGORIE 7: MENSCHLICHE AUFSICHT (Art. 14)
  // ============================================
  {
    id: 'human_oversight',
    name: 'Menschliche Aufsicht',
    description: 'Anforderungen an Human-in-the-Loop und menschliche Kontrolle',
    icon: '👤',
    requirements: [
      {
        id: 'HUMAN-001',
        category: 'human_oversight',
        title: 'Menschliche Aufsicht implementiert',
        description: 'Ist das KI-System so konzipiert, dass es von Menschen wirksam beaufsichtigt werden kann?',
        explanation: 'Hochrisiko-KI-Systeme müssen so gestaltet sein, dass Menschen die Kontrolle behalten und eingreifen können.',
        articleReference: 'Art. 14(1) EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'critical',
        evidenceTypes: ['Human-Oversight-Konzept', 'Systemdesign'],
        checklistItems: [
          'Aufsichtsmechanismen implementiert',
          'Menschen können System überwachen',
          'Menschen können Entscheidungen verstehen',
        ],
      },
      {
        id: 'HUMAN-002',
        category: 'human_oversight',
        title: 'Eingriffsmöglichkeit vorhanden',
        description: 'Können Menschen in die Entscheidungen des KI-Systems eingreifen oder diese korrigieren?',
        explanation: 'Es muss möglich sein, KI-Entscheidungen zu überstimmen, zu korrigieren oder das System zu stoppen.',
        articleReference: 'Art. 14(4) EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'critical',
        evidenceTypes: ['Interventionskonzept', 'Notfall-Prozeduren'],
        checklistItems: [
          'Override-Funktion vorhanden',
          'Stopp-Mechanismus implementiert',
          'Korrekturfunktion verfügbar',
          'Eskalationsprozess definiert',
        ],
      },
      {
        id: 'HUMAN-003',
        category: 'human_oversight',
        title: 'Automatisierungsverzerrung adressiert',
        description: 'Wurden Maßnahmen gegen Automatisierungsverzerrung (Automation Bias) getroffen?',
        explanation: 'Menschen neigen dazu, KI-Empfehlungen unkritisch zu übernehmen. Dies muss durch geeignete Maßnahmen adressiert werden.',
        articleReference: 'Art. 14(4)(b) EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'high',
        evidenceTypes: ['Schulungskonzept', 'UI-Design-Dokumentation'],
        checklistItems: [
          'Awareness für Automation Bias',
          'Training für Aufsichtspersonen',
          'UI fördert kritische Prüfung',
          'Konfidenzwerte angezeigt',
        ],
      },
      {
        id: 'HUMAN-004',
        category: 'human_oversight',
        title: 'Kompetente Aufsichtspersonen',
        description: 'Sind die für die Aufsicht verantwortlichen Personen ausreichend qualifiziert?',
        explanation: 'Aufsichtspersonen müssen das System verstehen und in der Lage sein, angemessen einzugreifen.',
        articleReference: 'Art. 14(2) EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'high',
        evidenceTypes: ['Stellenbeschreibungen', 'Schulungsnachweise'],
        checklistItems: [
          'Anforderungsprofil definiert',
          'Aufsichtspersonen geschult',
          'Kompetenzen dokumentiert',
          'Regelmäßige Auffrischung',
        ],
      },
    ],
  },

  // ============================================
  // KATEGORIE 8: GENAUIGKEIT & ROBUSTHEIT (Art. 15)
  // ============================================
  {
    id: 'accuracy_robustness',
    name: 'Genauigkeit, Robustheit und Cybersicherheit',
    description: 'Technische Qualitätsanforderungen an das KI-System',
    icon: '🎯',
    requirements: [
      {
        id: 'TECH-001',
        category: 'accuracy_robustness',
        title: 'Genauigkeitsniveau angemessen',
        description: 'Erreicht das KI-System ein für den Verwendungszweck angemessenes Genauigkeitsniveau?',
        explanation: 'Die Genauigkeit des Systems muss für den vorgesehenen Einsatzzweck ausreichend sein und in der Gebrauchsanweisung angegeben werden.',
        articleReference: 'Art. 15(1) EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'critical',
        evidenceTypes: ['Leistungsmetriken', 'Benchmark-Ergebnisse'],
        checklistItems: [
          'Genauigkeitsmetriken definiert',
          'Metriken gemessen und dokumentiert',
          'Genauigkeit für Zweck angemessen',
          'Metriken in Dokumentation angegeben',
        ],
      },
      {
        id: 'TECH-002',
        category: 'accuracy_robustness',
        title: 'Robustheit sichergestellt',
        description: 'Ist das System robust gegenüber Fehlern, Störungen und widrigen Bedingungen?',
        explanation: 'Das System muss auch unter nicht-idealen Bedingungen zuverlässig funktionieren und fehlertolerant sein.',
        articleReference: 'Art. 15(4) EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'high',
        evidenceTypes: ['Robustheitstests', 'Stresstests'],
        checklistItems: [
          'Robustheitstests durchgeführt',
          'Verhalten bei Eingabefehlern geprüft',
          'Graceful Degradation implementiert',
          'Fehlerbehandlung robust',
        ],
      },
      {
        id: 'TECH-003',
        category: 'accuracy_robustness',
        title: 'Cybersicherheit gewährleistet',
        description: 'Ist das KI-System angemessen gegen Cybersicherheitsbedrohungen geschützt?',
        explanation: 'Das System muss gegen Angriffe geschützt sein, die seine Funktionsweise manipulieren oder kompromittieren könnten.',
        articleReference: 'Art. 15(5) EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'critical',
        evidenceTypes: ['Sicherheitskonzept', 'Penetrationstest'],
        checklistItems: [
          'Sicherheitskonzept vorhanden',
          'Schutz gegen Datenvergiftung',
          'Schutz gegen adversariale Angriffe',
          'Regelmäßige Sicherheitstests',
        ],
      },
      {
        id: 'TECH-004',
        category: 'accuracy_robustness',
        title: 'Kontinuierliche Überwachung',
        description: 'Wird die Leistung des KI-Systems kontinuierlich überwacht?',
        explanation: 'Nach dem Deployment muss das System überwacht werden, um Leistungsabfälle oder unerwartetes Verhalten zu erkennen.',
        articleReference: 'Art. 15(3) EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'high',
        evidenceTypes: ['Monitoring-Konzept', 'Alerting-Konfiguration'],
        checklistItems: [
          'Monitoring implementiert',
          'KPIs definiert',
          'Alerting eingerichtet',
          'Eskalationsprozess definiert',
        ],
      },
    ],
  },

  // ============================================
  // KATEGORIE 9: KONFORMITÄTSBEWERTUNG (Art. 43)
  // ============================================
  {
    id: 'conformity_assessment',
    name: 'Konformitätsbewertung',
    description: 'Anforderungen an die Konformitätsbewertung vor dem Inverkehrbringen',
    icon: '✅',
    requirements: [
      {
        id: 'CONF-001',
        category: 'conformity_assessment',
        title: 'Konformitätsbewertung durchgeführt',
        description: 'Wurde eine Konformitätsbewertung vor dem Inverkehrbringen durchgeführt?',
        explanation: 'Hochrisiko-KI-Systeme müssen einer Konformitätsbewertung unterzogen werden, bevor sie in der EU verfügbar gemacht werden.',
        articleReference: 'Art. 43 EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'critical',
        evidenceTypes: ['Konformitätsbewertungsbericht', 'Zertifikate'],
        checklistItems: [
          'Bewertungsverfahren identifiziert',
          'Bewertung durchgeführt',
          'Ergebnisse dokumentiert',
          'Mängel behoben',
        ],
      },
      {
        id: 'CONF-002',
        category: 'conformity_assessment',
        title: 'EU-Konformitätserklärung erstellt',
        description: 'Wurde eine EU-Konformitätserklärung gemäß Art. 47 erstellt?',
        explanation: 'Der Anbieter muss schriftlich erklären, dass das System alle Anforderungen erfüllt.',
        articleReference: 'Art. 47, Anhang V EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'critical',
        evidenceTypes: ['EU-Konformitätserklärung'],
        checklistItems: [
          'Konformitätserklärung erstellt',
          'Alle erforderlichen Angaben enthalten',
          'Von Verantwortlichem unterzeichnet',
          'Aktuell gehalten',
        ],
      },
      {
        id: 'CONF-003',
        category: 'conformity_assessment',
        title: 'CE-Kennzeichnung angebracht',
        description: 'Wurde die CE-Kennzeichnung korrekt angebracht?',
        explanation: 'Hochrisiko-KI-Systeme müssen die CE-Kennzeichnung tragen, um ihre Konformität anzuzeigen.',
        articleReference: 'Art. 48 EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'high',
        evidenceTypes: ['CE-Kennzeichnung', 'Produktabbildung'],
        checklistItems: [
          'CE-Kennzeichnung vorhanden',
          'Sichtbar und lesbar',
          'Korrekt angebracht',
        ],
      },
      {
        id: 'CONF-004',
        category: 'conformity_assessment',
        title: 'EU-Datenbank-Registrierung',
        description: 'Wurde das Hochrisiko-KI-System in der EU-Datenbank registriert?',
        explanation: 'Hochrisiko-KI-Systeme müssen vor dem Inverkehrbringen in der EU-Datenbank registriert werden.',
        articleReference: 'Art. 49 EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'critical',
        evidenceTypes: ['Registrierungsbestätigung'],
        checklistItems: [
          'Registrierung durchgeführt',
          'Alle erforderlichen Informationen eingegeben',
          'Registrierung vor Inverkehrbringen',
        ],
      },
    ],
  },

  // ============================================
  // KATEGORIE 10: GRUNDRECHTE-FOLGENABSCHÄTZUNG (Art. 27)
  // ============================================
  {
    id: 'fundamental_rights',
    name: 'Grundrechte-Folgenabschätzung',
    description: 'Bewertung der Auswirkungen auf Grundrechte',
    icon: '⚖️',
    requirements: [
      {
        id: 'FRIA-001',
        category: 'fundamental_rights',
        title: 'Grundrechte-Folgenabschätzung (FRIA) durchgeführt',
        description: 'Wurde eine Folgenabschätzung für Grundrechte durchgeführt?',
        explanation: 'Bestimmte Betreiber (öffentliche Stellen, kritische Infrastruktur) müssen vor dem Einsatz eine FRIA durchführen.',
        articleReference: 'Art. 27 EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'critical',
        evidenceTypes: ['FRIA-Bericht', 'Grundrechte-Analyse'],
        checklistItems: [
          'FRIA-Pflicht geprüft',
          'FRIA durchgeführt (falls erforderlich)',
          'Betroffene Grundrechte identifiziert',
          'Maßnahmen zur Minderung definiert',
        ],
      },
      {
        id: 'FRIA-002',
        category: 'fundamental_rights',
        title: 'Betroffene Gruppen identifiziert',
        description: 'Wurden die von dem KI-System betroffenen Personengruppen identifiziert?',
        explanation: 'Es muss klar sein, welche Personen oder Gruppen von den Entscheidungen des KI-Systems betroffen sind.',
        articleReference: 'Art. 27(1)(b) EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'high',
        evidenceTypes: ['Stakeholder-Analyse', 'Impact Assessment'],
        checklistItems: [
          'Direkt betroffene Gruppen identifiziert',
          'Indirekt betroffene Gruppen berücksichtigt',
          'Vulnerable Gruppen besonders berücksichtigt',
        ],
      },
      {
        id: 'FRIA-003',
        category: 'fundamental_rights',
        title: 'Auswirkungen auf Gleichstellung bewertet',
        description: 'Wurden potenzielle diskriminierende Auswirkungen analysiert?',
        explanation: 'Das System muss auf mögliche Diskriminierung verschiedener Gruppen hin untersucht werden.',
        articleReference: 'Art. 27(1)(c) EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'critical',
        evidenceTypes: ['Fairness-Analyse', 'Diskriminierungsprüfung'],
        checklistItems: [
          'Diskriminierungspotenzial analysiert',
          'Geschlechtergerechtigkeit geprüft',
          'Ethnische Diskriminierung geprüft',
          'Alters-Diskriminierung geprüft',
        ],
      },
    ],
  },

  // ============================================
  // KATEGORIE 11: GOVERNANCE & VERANTWORTLICHKEIT
  // ============================================
  {
    id: 'governance',
    name: 'Governance und Verantwortlichkeit',
    description: 'Organisatorische Anforderungen und Verantwortlichkeiten',
    icon: '🏛️',
    requirements: [
      {
        id: 'GOV-001',
        category: 'governance',
        title: 'Verantwortlichkeiten definiert',
        description: 'Sind klare Verantwortlichkeiten für das KI-System definiert?',
        explanation: 'Es muss klar sein, wer für Entwicklung, Betrieb und Compliance des Systems verantwortlich ist.',
        articleReference: 'Art. 16 EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'critical',
        evidenceTypes: ['Organigramm', 'Verantwortlichkeitsmatrix'],
        checklistItems: [
          'Anbieter-Verantwortlichkeiten definiert',
          'Betreiber-Verantwortlichkeiten definiert',
          'Kontaktperson benannt',
          'Eskalationswege definiert',
        ],
      },
      {
        id: 'GOV-002',
        category: 'governance',
        title: 'Qualitätsmanagementsystem',
        description: 'Ist ein Qualitätsmanagementsystem für das KI-System implementiert?',
        explanation: 'Anbieter von Hochrisiko-KI müssen ein dokumentiertes QMS führen.',
        articleReference: 'Art. 17 EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'critical',
        evidenceTypes: ['QMS-Dokumentation', 'ISO 9001-Zertifikat'],
        checklistItems: [
          'QMS vorhanden',
          'QMS dokumentiert',
          'Regelmäßige Reviews',
          'Kontinuierliche Verbesserung',
        ],
      },
      {
        id: 'GOV-003',
        category: 'governance',
        title: 'Marktüberwachungspflichten',
        description: 'Sind Prozesse für die Zusammenarbeit mit Marktüberwachungsbehörden etabliert?',
        explanation: 'Anbieter und Betreiber müssen mit Aufsichtsbehörden kooperieren und Informationen bereitstellen.',
        articleReference: 'Art. 20, Art. 26 EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'high',
        evidenceTypes: ['Kooperationsverfahren', 'Kontaktinformationen'],
        checklistItems: [
          'Kontakt zu Behörden etabliert',
          'Kooperationsprozesse definiert',
          'Informationsbereitstellung gewährleistet',
        ],
      },
      {
        id: 'GOV-004',
        category: 'governance',
        title: 'Korrekturmaßnahmen-Prozess',
        description: 'Existiert ein Prozess für Korrekturmaßnahmen bei Non-Compliance?',
        explanation: 'Bei Feststellung von Mängeln müssen unverzüglich Korrekturmaßnahmen ergriffen werden.',
        articleReference: 'Art. 20 EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'high',
        evidenceTypes: ['Korrekturmaßnahmen-Prozess', 'CAPA-System'],
        checklistItems: [
          'CAPA-Prozess definiert',
          'Verantwortlichkeiten klar',
          'Zeitrahmen festgelegt',
          'Nachverfolgung gewährleistet',
        ],
      },
    ],
  },

  // ============================================
  // KATEGORIE 12: POST-MARKET MONITORING (Art. 72)
  // ============================================
  {
    id: 'post_market',
    name: 'Post-Market Monitoring',
    description: 'Überwachung nach dem Inverkehrbringen',
    icon: '📡',
    requirements: [
      {
        id: 'PMM-001',
        category: 'post_market',
        title: 'Post-Market-Monitoring-System',
        description: 'Ist ein System zur Überwachung nach dem Inverkehrbringen eingerichtet?',
        explanation: 'Anbieter müssen das System nach dem Inverkehrbringen aktiv überwachen, um Probleme frühzeitig zu erkennen.',
        articleReference: 'Art. 72 EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'critical',
        evidenceTypes: ['PMM-Plan', 'Monitoring-System'],
        checklistItems: [
          'PMM-System etabliert',
          'Datenquellen definiert',
          'Analyseverfahren implementiert',
          'Berichtswesen eingerichtet',
        ],
      },
      {
        id: 'PMM-002',
        category: 'post_market',
        title: 'Schwerwiegende Vorfälle melden',
        description: 'Existiert ein Prozess zur Meldung schwerwiegender Vorfälle?',
        explanation: 'Vorfälle, die zu Tod, Gesundheitsschäden oder Grundrechtsverletzungen führen, müssen gemeldet werden.',
        articleReference: 'Art. 73 EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'critical',
        evidenceTypes: ['Incident-Response-Plan', 'Meldeverfahren'],
        checklistItems: [
          'Vorfallsdefinition klar',
          'Meldeprozess definiert',
          'Meldefristen bekannt',
          'Verantwortliche benannt',
        ],
      },
      {
        id: 'PMM-003',
        category: 'post_market',
        title: 'Feedback von Nutzern erfassen',
        description: 'Werden Rückmeldungen von Nutzern und Betroffenen systematisch erfasst?',
        explanation: 'Nutzerfeedback ist wichtig, um Probleme zu identifizieren und das System zu verbessern.',
        articleReference: 'Art. 72(2) EU AI Act',
        applicableRiskClasses: ['HIGH_RISK'],
        priority: 'medium',
        evidenceTypes: ['Feedback-System', 'Beschwerdemanagement'],
        checklistItems: [
          'Feedback-Kanäle vorhanden',
          'Feedback systematisch erfasst',
          'Feedback analysiert',
          'Verbesserungen abgeleitet',
        ],
      },
    ],
  },
];

// Helper function to get requirements by risk class
export function getRequirementsForRiskClass(riskClass: RiskClass): RequirementCategory[] {
  return EU_AI_ACT_REQUIREMENTS.map(category => ({
    ...category,
    requirements: category.requirements.filter(
      req => req.applicableRiskClasses.includes(riskClass) || req.applicableRiskClasses.includes('ALL')
    ),
  })).filter(category => category.requirements.length > 0);
}

// Helper function to get total requirement count
export function getTotalRequirementCount(): number {
  return EU_AI_ACT_REQUIREMENTS.reduce((sum, cat) => sum + cat.requirements.length, 0);
}

// Helper function to get requirement by ID
export function getRequirementById(id: string): Requirement | undefined {
  for (const category of EU_AI_ACT_REQUIREMENTS) {
    const req = category.requirements.find(r => r.id === id);
    if (req) return req;
  }
  return undefined;
}

// Export all requirement IDs
export function getAllRequirementIds(): string[] {
  return EU_AI_ACT_REQUIREMENTS.flatMap(cat => cat.requirements.map(r => r.id));
}
