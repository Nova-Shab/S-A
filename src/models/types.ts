/**
 * Datenmodelle für das EU AI Act Audit-Tool
 * Erweitert um K-01 bis K-04 Korrekturmaßnahmen
 */

// Risikoklassen gemäß EU AI Act
export type RiskClass =
  | "PROHIBITED"      // Verbotene Systeme
  | "HIGH_RISK"       // Hochrisiko-Systeme mit strengen Anforderungen
  | "LIMITED_RISK"    // Begrenzte Risiken, hauptsächlich Transparenzpflichten
  | "MINIMAL_RISK";   // Minimale Risiken, wenige Anforderungen

// K-01: Rolle nach EU AI Act Art. 3
export type EuAiActRole =
  | "PROVIDER"              // Anbieter (Art. 3 Nr. 3) - Entwickelt/trainiert KI-System
  | "DEPLOYER"              // Betreiber (Art. 3 Nr. 4) - Setzt KI-System ein
  | "IMPORTER"              // Importeur (Art. 3 Nr. 6) - Importiert aus Drittland
  | "DISTRIBUTOR"           // Händler (Art. 3 Nr. 7) - Vertreibt KI-System
  | "AUTHORIZED_REP"        // Bevollmächtigter (Art. 3 Nr. 5)
  | "PRODUCT_MANUFACTURER"; // Produkthersteller (bei eingebetteter KI)

export const EU_AI_ACT_ROLES: { value: EuAiActRole; label: string; description: string; article: string }[] = [
  {
    value: "PROVIDER",
    label: "Anbieter",
    description: "Entwickelt oder entwickeln lässt ein KI-System und bringt es unter eigenem Namen in Verkehr oder in Betrieb",
    article: "Art. 3 Nr. 3"
  },
  {
    value: "DEPLOYER",
    label: "Betreiber",
    description: "Verwendet ein KI-System in eigener Verantwortung (außer persönliche, nicht-berufliche Nutzung)",
    article: "Art. 3 Nr. 4"
  },
  {
    value: "IMPORTER",
    label: "Importeur",
    description: "Bringt ein KI-System aus einem Drittland in den EU-Markt",
    article: "Art. 3 Nr. 6"
  },
  {
    value: "DISTRIBUTOR",
    label: "Händler",
    description: "Stellt ein KI-System auf dem Markt bereit (außer Anbieter/Importeur)",
    article: "Art. 3 Nr. 7"
  },
  {
    value: "AUTHORIZED_REP",
    label: "Bevollmächtigter",
    description: "In der EU niedergelassene Person, die vom Anbieter beauftragt wurde",
    article: "Art. 3 Nr. 5"
  },
  {
    value: "PRODUCT_MANUFACTURER",
    label: "Produkthersteller",
    description: "Hersteller eines Produkts, in das ein KI-System eingebettet ist",
    article: "Art. 25"
  }
];

// K-02: Zweckbestimmung nach Anhang III Kategorien
export type AnnexIIICategory =
  | "BIOMETRIC_IDENTIFICATION"      // Biometrische Identifizierung
  | "CRITICAL_INFRASTRUCTURE"       // Kritische Infrastruktur
  | "EDUCATION_VOCATIONAL"          // Bildung und Berufsausbildung
  | "EMPLOYMENT_HR"                 // Beschäftigung, Personalmanagement
  | "ESSENTIAL_SERVICES"            // Zugang zu wesentlichen Diensten
  | "LAW_ENFORCEMENT"               // Strafverfolgung
  | "MIGRATION_ASYLUM"              // Migration, Asyl, Grenzkontrolle
  | "JUSTICE_DEMOCRACY"             // Justiz und demokratische Prozesse
  | "OTHER";                        // Sonstiges

export const ANNEX_III_CATEGORIES: { value: AnnexIIICategory; label: string; description: string; examples: string[] }[] = [
  {
    value: "BIOMETRIC_IDENTIFICATION",
    label: "Biometrische Identifizierung",
    description: "Biometrische Fernidentifizierung und Kategorisierung natürlicher Personen",
    examples: ["Gesichtserkennung", "Fingerabdruckanalyse", "Stimmbiometrie", "Ganganalyse"]
  },
  {
    value: "CRITICAL_INFRASTRUCTURE",
    label: "Kritische Infrastruktur",
    description: "Verwaltung und Betrieb kritischer Infrastrukturen",
    examples: ["Energieversorgung", "Wasserversorgung", "Verkehrsleitsysteme", "Telekommunikation"]
  },
  {
    value: "EDUCATION_VOCATIONAL",
    label: "Bildung und Berufsausbildung",
    description: "Zugang zu Bildung und Bewertung von Lernenden",
    examples: ["Prüfungsbewertung", "Zulassungsentscheidungen", "Lernstandsanalyse", "Plagiatserkennung"]
  },
  {
    value: "EMPLOYMENT_HR",
    label: "Beschäftigung und Personalmanagement",
    description: "Einstellung, Beförderung, Kündigung und Arbeitsplatzzuweisung",
    examples: ["CV-Screening", "Bewerberauswahl", "Leistungsbewertung", "Mitarbeiterüberwachung"]
  },
  {
    value: "ESSENTIAL_SERVICES",
    label: "Zugang zu wesentlichen Diensten",
    description: "Kreditwürdigkeit, Versicherung, Sozialleistungen, Notdienste",
    examples: ["Kreditscoring", "Versicherungsprämien", "Sozialleistungsansprüche", "Notrufpriorisierung"]
  },
  {
    value: "LAW_ENFORCEMENT",
    label: "Strafverfolgung",
    description: "Risikobewertung, Beweismittelanalyse, Vorhersage von Straftaten",
    examples: ["Rückfallprognose", "Lügendetektion", "Predictive Policing", "Gesichtserkennung für Polizei"]
  },
  {
    value: "MIGRATION_ASYLUM",
    label: "Migration, Asyl und Grenzkontrolle",
    description: "Visumsanträge, Asylverfahren, Grenzkontrollsysteme",
    examples: ["Visumsrisikobewertung", "Asylantragsprüfung", "Dokumentenprüfung", "Grenzkontrolle"]
  },
  {
    value: "JUSTICE_DEMOCRACY",
    label: "Justiz und demokratische Prozesse",
    description: "Rechtsprechung und Beeinflussung demokratischer Prozesse",
    examples: ["Strafzumessung", "Rechtsrecherche", "Wahlbeeinflussung", "Richterliche Entscheidungshilfe"]
  },
  {
    value: "OTHER",
    label: "Sonstiges",
    description: "Andere Anwendungsbereiche, die nicht in Anhang III aufgeführt sind",
    examples: ["Chatbots", "Empfehlungssysteme", "Content-Generierung", "Übersetzung"]
  }
];

// K-04: Systemabgrenzung
export interface SystemBoundaries {
  includedComponents: string[];    // Komponenten, die zum KI-System gehören
  excludedComponents: string[];    // Komponenten, die NICHT zum KI-System gehören
  dataInputs: string[];            // Dateneingaben ins System
  dataOutputs: string[];           // Datenausgaben des Systems
  humanOversight: string;          // Art der menschlichen Aufsicht
  integrationPoints: string[];     // Integrationspunkte mit anderen Systemen
}

// Erweiterte Informationen zum KI-System (K-01 bis K-04)
export interface AiSystemInfo {
  // Basisdaten (bestehend)
  domain: string;                          // Anwendungsbereich
  useCase: string;                         // Beschreibung des Anwendungsfalls
  impactLevel: "low" | "medium" | "high";  // Auswirkungsgrad
  biometricOrSurveillance: boolean;        // Biometrie/Überwachung?
  euImpact: boolean;                       // EU-Auswirkung?

  // K-01: Pflichtfelder für System-Identifikation
  systemName: string;                      // Name des KI-Systems (Pflicht)
  systemVersion?: string;                  // Version des Systems
  systemProvider?: string;                 // Anbieter/Hersteller des Systems

  // K-01: Rolle nach EU AI Act
  euAiActRole: EuAiActRole;                // Rolle des Unternehmens (Pflicht)

  // K-02: Strukturierte Zweckbestimmung
  primaryPurpose: string;                  // Hauptzweck (Freitext, Pflicht)
  annexIIICategories: AnnexIIICategory[];  // Anhang III Kategorien (Pflicht)
  intendedUsers: string;                   // Vorgesehene Nutzer
  prohibitedUses?: string;                 // Verbotene Verwendungen
  foreseenMisuse?: string;                 // Vorhersehbare Fehlanwendungen

  // K-04: Systemabgrenzung
  systemBoundaries: SystemBoundaries;      // Technische Abgrenzung (Pflicht)
}

// Validierung für K-03
export interface SystemInfoValidation {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
  }[];
}

export function validateSystemInfo(info: Partial<AiSystemInfo>): SystemInfoValidation {
  const errors: { field: string; message: string }[] = [];

  // K-01: Pflichtfelder prüfen
  if (!info.systemName?.trim()) {
    errors.push({ field: "systemName", message: "Name des KI-Systems ist erforderlich" });
  }

  if (!info.euAiActRole) {
    errors.push({ field: "euAiActRole", message: "Rolle nach EU AI Act ist erforderlich" });
  }

  // K-02: Zweckbestimmung prüfen
  if (!info.primaryPurpose?.trim()) {
    errors.push({ field: "primaryPurpose", message: "Hauptzweck ist erforderlich" });
  }

  if (!info.annexIIICategories || info.annexIIICategories.length === 0) {
    errors.push({ field: "annexIIICategories", message: "Mindestens eine Kategorie nach Anhang III ist erforderlich" });
  }

  // K-04: Systemabgrenzung prüfen
  if (!info.systemBoundaries) {
    errors.push({ field: "systemBoundaries", message: "Systemabgrenzung ist erforderlich" });
  } else {
    if (!info.systemBoundaries.includedComponents || info.systemBoundaries.includedComponents.length === 0) {
      errors.push({ field: "systemBoundaries.includedComponents", message: "Mindestens eine Systemkomponente muss definiert sein" });
    }
    if (!info.systemBoundaries.humanOversight?.trim()) {
      errors.push({ field: "systemBoundaries.humanOversight", message: "Art der menschlichen Aufsicht ist erforderlich" });
    }
  }

  // Bestehende Validierungen
  if (!info.domain?.trim()) {
    errors.push({ field: "domain", message: "Anwendungsbereich ist erforderlich" });
  }

  if (!info.useCase?.trim()) {
    errors.push({ field: "useCase", message: "Beschreibung des Anwendungsfalls ist erforderlich" });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Status einer Anforderung im Audit
export type RequirementStatus =
  | "compliant"           // Erfüllt
  | "partially_compliant" // Teilweise erfüllt
  | "non_compliant"       // Nicht erfüllt
  | "not_applicable";     // Nicht zutreffend

// Einzelne Anforderung aus dem EU AI Act
export interface Requirement {
  id: string;
  category: string;           // z.B. "Risikomanagement", "Datenqualität"
  title: string;
  description: string;
  riskLevel: RiskClass[];     // Für welche Risikoklassen gilt diese Anforderung
}

// Antwort/Bewertung einer Anforderung
export interface AuditAnswer {
  requirementId: string;
  status: RequirementStatus;
  notes: string;
}

// Maßnahme/Empfehlung
export interface ActionItem {
  id: string;
  category: string;
  requirementTitle: string;
  severity: "hoch" | "mittel" | "niedrig";
  recommendedAction: string;
  responsible: string;        // Verantwortliche Rolle
  targetDate: string;         // Zieltermin
}

// Gesamter Audit-Zustand (für localStorage)
export interface AuditState {
  systemInfo: AiSystemInfo | null;
  riskClass: RiskClass | null;
  auditAnswers: AuditAnswer[];
  actionItems: ActionItem[];
  currentStep: number;
}

// Default-Werte für neue SystemBoundaries
export const defaultSystemBoundaries: SystemBoundaries = {
  includedComponents: [],
  excludedComponents: [],
  dataInputs: [],
  dataOutputs: [],
  humanOversight: "",
  integrationPoints: []
};

// Default-Werte für neues AiSystemInfo
export const defaultAiSystemInfo: Partial<AiSystemInfo> = {
  systemName: "",
  systemVersion: "",
  systemProvider: "",
  domain: "",
  useCase: "",
  impactLevel: "low",
  biometricOrSurveillance: false,
  euImpact: true,
  euAiActRole: undefined,
  primaryPurpose: "",
  annexIIICategories: [],
  intendedUsers: "",
  prohibitedUses: "",
  foreseenMisuse: "",
  systemBoundaries: defaultSystemBoundaries
};
