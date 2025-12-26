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

// Dokument mit KI-Analyse
export interface RequirementDocument {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  aiAnalysis?: DocumentAIAnalysis;
}

// KI-Analyse-Ergebnis für ein Dokument
export interface DocumentAIAnalysis {
  relevanceScore: number;           // 0-100: Relevanz für die Anforderung
  completenessScore: number;        // 0-100: Vollständigkeit der Abdeckung
  status: 'analyzing' | 'completed' | 'failed';
  findings: string[];               // Gefundene relevante Inhalte
  gaps: string[];                   // Identifizierte Lücken
  recommendations: string[];        // Empfehlungen
  analyzedAt: string;
  summary?: string;                 // Kurze Zusammenfassung
}

// Antwort/Bewertung einer Anforderung
export interface AuditAnswer {
  requirementId: string;
  status: RequirementStatus;
  notes: string;
  documents?: RequirementDocument[];  // Hochgeladene Evidenz-Dokumente
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

// =============================================================================
// V-03: Multi-System-Registry
// Ermöglicht zentrale Verwaltung mehrerer KI-Systeme für Unternehmen
// =============================================================================

// Status eines registrierten KI-Systems
export type SystemStatus =
  | "DRAFT"              // System in Erfassung
  | "ACTIVE"             // Aktives System
  | "UNDER_REVIEW"       // Wird geprüft
  | "COMPLIANT"          // EU AI Act konform
  | "NON_COMPLIANT"      // Nicht konform, Maßnahmen erforderlich
  | "DEPRECATED";        // Außer Betrieb

// Registriertes KI-System in der Unternehmensverwaltung
export interface RegisteredAiSystem {
  id: string;                            // Eindeutige ID
  createdAt: string;                     // Erstellungsdatum (ISO)
  updatedAt: string;                     // Letzte Aktualisierung (ISO)
  status: SystemStatus;                  // Aktueller Status
  systemInfo: AiSystemInfo;              // Vollständige System-Informationen
  riskClass: RiskClass | null;           // Ermittelte Risikoklasse
  complianceScore?: number;              // Compliance-Score (0-100)
  lastAuditDate?: string;                // Letztes Audit-Datum
  nextAuditDue?: string;                 // Nächstes geplantes Audit
  auditCount: number;                    // Anzahl durchgeführter Audits
  tags: string[];                        // Kategorisierungs-Tags
  department?: string;                   // Zuständige Abteilung
  responsiblePerson?: string;            // Verantwortliche Person
  notes?: string;                        // Interne Notizen
  changeHistory?: ChangeHistoryEntry[];  // V-04: Änderungshistorie
}

// =============================================================================
// V-04: Änderungshistorie
// Protokolliert alle Änderungen an Systemdefinitionen
// =============================================================================

// Art der Änderung
export type ChangeAction =
  | "CREATE"      // System erstellt
  | "UPDATE"      // Feld aktualisiert
  | "STATUS"      // Status geändert
  | "RISK_CLASS"  // Risikoklasse geändert
  | "AUDIT"       // Audit durchgeführt
  | "DELETE";     // System gelöscht (für Archiv)

// Einzelner Änderungseintrag
export interface ChangeHistoryEntry {
  id: string;                    // Eindeutige ID des Eintrags
  timestamp: string;             // Zeitpunkt der Änderung (ISO)
  action: ChangeAction;          // Art der Änderung
  userId?: string;               // Benutzer-ID (falls verfügbar)
  userName?: string;             // Benutzername für Anzeige
  field?: string;                // Geändertes Feld (bei UPDATE)
  fieldLabel?: string;           // Anzeigename des Feldes
  oldValue?: string;             // Vorheriger Wert (serialisiert)
  newValue?: string;             // Neuer Wert (serialisiert)
  description?: string;          // Optionale Beschreibung der Änderung
}

// Konfiguration für Feld-Labels
export const FIELD_LABELS: Record<string, string> = {
  "systemInfo.systemName": "Systemname",
  "systemInfo.systemVersion": "Version",
  "systemInfo.systemProvider": "Anbieter",
  "systemInfo.domain": "Domäne",
  "systemInfo.useCase": "Anwendungsfall",
  "systemInfo.euAiActRole": "EU AI Act Rolle",
  "systemInfo.primaryPurpose": "Primärer Zweck",
  "systemInfo.annexIIICategories": "Annex III Kategorien",
  "systemInfo.intendedUsers": "Zielgruppe",
  "systemInfo.prohibitedUses": "Verbotene Nutzungen",
  "systemInfo.foreseenMisuse": "Vorhersehbarer Missbrauch",
  "systemInfo.biometricOrSurveillance": "Biometrie/Überwachung",
  "systemInfo.impactLevel": "Auswirkungsstufe",
  "status": "Status",
  "riskClass": "Risikoklasse",
  "complianceScore": "Compliance-Score",
  "department": "Abteilung",
  "responsiblePerson": "Verantwortliche Person",
  "tags": "Tags",
  "notes": "Notizen",
  "nextAuditDue": "Nächstes Audit"
};

// Helper: Änderungseintrag erstellen
export function createChangeEntry(
  action: ChangeAction,
  field?: string,
  oldValue?: unknown,
  newValue?: unknown,
  userName?: string
): ChangeHistoryEntry {
  return {
    id: `chg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    timestamp: new Date().toISOString(),
    action,
    userName: userName || "System",
    field,
    fieldLabel: field ? FIELD_LABELS[field] || field : undefined,
    oldValue: oldValue !== undefined ? JSON.stringify(oldValue) : undefined,
    newValue: newValue !== undefined ? JSON.stringify(newValue) : undefined
  };
}

// Helper: Wert für Anzeige formatieren
export function formatHistoryValue(value: string | undefined, field?: string): string {
  if (!value) return "-";

  try {
    const parsed = JSON.parse(value);

    // Arrays formatieren
    if (Array.isArray(parsed)) {
      if (parsed.length === 0) return "(leer)";
      return parsed.join(", ");
    }

    // Booleans formatieren
    if (typeof parsed === "boolean") {
      return parsed ? "Ja" : "Nein";
    }

    // Status formatieren
    if (field === "status" && SYSTEM_STATUS_CONFIG[parsed as SystemStatus]) {
      return SYSTEM_STATUS_CONFIG[parsed as SystemStatus].label;
    }

    // Risikoklasse formatieren
    if (field === "riskClass") {
      const riskLabels: Record<string, string> = {
        PROHIBITED: "Verboten",
        HIGH_RISK: "Hochrisiko",
        LIMITED_RISK: "Begrenztes Risiko",
        MINIMAL_RISK: "Minimales Risiko"
      };
      return riskLabels[parsed] || parsed;
    }

    // EU AI Act Rolle formatieren
    if (field === "systemInfo.euAiActRole") {
      const roleLabels: Record<string, string> = {
        PROVIDER: "Anbieter",
        DEPLOYER: "Betreiber",
        IMPORTER: "Importeur",
        DISTRIBUTOR: "Händler",
        AUTHORIZED_REP: "Bevollmächtigter",
        PRODUCT_MANUFACTURER: "Produkthersteller"
      };
      return roleLabels[parsed] || parsed;
    }

    return String(parsed);
  } catch {
    return value;
  }
}

// Action Labels für Anzeige
export const CHANGE_ACTION_LABELS: Record<ChangeAction, { label: string; icon: string; color: string }> = {
  CREATE: { label: "Erstellt", icon: "plus", color: "text-green-600 bg-green-100" },
  UPDATE: { label: "Aktualisiert", icon: "pencil", color: "text-blue-600 bg-blue-100" },
  STATUS: { label: "Status geändert", icon: "refresh", color: "text-purple-600 bg-purple-100" },
  RISK_CLASS: { label: "Risikoklasse geändert", icon: "exclamation", color: "text-orange-600 bg-orange-100" },
  AUDIT: { label: "Audit durchgeführt", icon: "clipboard-check", color: "text-indigo-600 bg-indigo-100" },
  DELETE: { label: "Gelöscht", icon: "trash", color: "text-red-600 bg-red-100" }
};

// Statistiken für das Multi-System-Dashboard
export interface SystemRegistryStats {
  totalSystems: number;
  byStatus: Record<SystemStatus, number>;
  byRiskClass: Record<RiskClass | "UNCLASSIFIED", number>;
  averageComplianceScore: number;
  systemsRequiringAction: number;
  upcomingAudits: number;
}

// Filter für die System-Liste
export interface SystemListFilter {
  status?: SystemStatus[];
  riskClass?: RiskClass[];
  department?: string;
  tags?: string[];
  searchTerm?: string;
}

// Sortierung für die System-Liste
export type SystemSortField =
  | "systemName"
  | "createdAt"
  | "updatedAt"
  | "riskClass"
  | "complianceScore"
  | "nextAuditDue";

export interface SystemListSort {
  field: SystemSortField;
  direction: "asc" | "desc";
}

// Status-Label und Farben
export const SYSTEM_STATUS_CONFIG: Record<SystemStatus, { label: string; color: string; bgColor: string }> = {
  DRAFT: { label: "Entwurf", color: "text-gray-600", bgColor: "bg-gray-100" },
  ACTIVE: { label: "Aktiv", color: "text-blue-600", bgColor: "bg-blue-100" },
  UNDER_REVIEW: { label: "In Prüfung", color: "text-purple-600", bgColor: "bg-purple-100" },
  COMPLIANT: { label: "Konform", color: "text-green-600", bgColor: "bg-green-100" },
  NON_COMPLIANT: { label: "Nicht konform", color: "text-red-600", bgColor: "bg-red-100" },
  DEPRECATED: { label: "Außer Betrieb", color: "text-gray-400", bgColor: "bg-gray-50" }
};

// Helper: Neues System erstellen
export function createNewSystem(partialInfo?: Partial<AiSystemInfo>, userName?: string): RegisteredAiSystem {
  const now = new Date().toISOString();
  const initialEntry = createChangeEntry("CREATE", undefined, undefined, undefined, userName);
  initialEntry.description = "System wurde erstellt";

  return {
    id: `sys_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    createdAt: now,
    updatedAt: now,
    status: "DRAFT",
    systemInfo: {
      systemName: partialInfo?.systemName || "",
      systemVersion: partialInfo?.systemVersion || "",
      systemProvider: partialInfo?.systemProvider || "",
      domain: partialInfo?.domain || "",
      useCase: partialInfo?.useCase || "",
      impactLevel: partialInfo?.impactLevel || "low",
      biometricOrSurveillance: partialInfo?.biometricOrSurveillance || false,
      euImpact: partialInfo?.euImpact ?? true,
      euAiActRole: partialInfo?.euAiActRole || "DEPLOYER",
      primaryPurpose: partialInfo?.primaryPurpose || "",
      annexIIICategories: partialInfo?.annexIIICategories || [],
      intendedUsers: partialInfo?.intendedUsers || "",
      prohibitedUses: partialInfo?.prohibitedUses || "",
      foreseenMisuse: partialInfo?.foreseenMisuse || "",
      systemBoundaries: partialInfo?.systemBoundaries || defaultSystemBoundaries
    },
    riskClass: null,
    auditCount: 0,
    tags: [],
    complianceScore: undefined,
    lastAuditDate: undefined,
    nextAuditDue: undefined,
    department: undefined,
    responsiblePerson: undefined,
    notes: undefined,
    changeHistory: [initialEntry]
  };
}

// Helper: Statistiken berechnen
export function calculateRegistryStats(systems: RegisteredAiSystem[]): SystemRegistryStats {
  const stats: SystemRegistryStats = {
    totalSystems: systems.length,
    byStatus: {
      DRAFT: 0,
      ACTIVE: 0,
      UNDER_REVIEW: 0,
      COMPLIANT: 0,
      NON_COMPLIANT: 0,
      DEPRECATED: 0
    },
    byRiskClass: {
      PROHIBITED: 0,
      HIGH_RISK: 0,
      LIMITED_RISK: 0,
      MINIMAL_RISK: 0,
      UNCLASSIFIED: 0
    },
    averageComplianceScore: 0,
    systemsRequiringAction: 0,
    upcomingAudits: 0
  };

  let scoreSum = 0;
  let scoreCount = 0;
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  for (const sys of systems) {
    // Status zählen
    stats.byStatus[sys.status]++;

    // Risikoklasse zählen
    if (sys.riskClass) {
      stats.byRiskClass[sys.riskClass]++;
    } else {
      stats.byRiskClass.UNCLASSIFIED++;
    }

    // Compliance-Score summieren
    if (typeof sys.complianceScore === "number") {
      scoreSum += sys.complianceScore;
      scoreCount++;
    }

    // Systeme mit Handlungsbedarf
    if (sys.status === "NON_COMPLIANT" || sys.status === "UNDER_REVIEW") {
      stats.systemsRequiringAction++;
    }

    // Anstehende Audits (nächste 30 Tage)
    if (sys.nextAuditDue) {
      const auditDate = new Date(sys.nextAuditDue);
      if (auditDate <= thirtyDaysFromNow && auditDate >= now) {
        stats.upcomingAudits++;
      }
    }
  }

  stats.averageComplianceScore = scoreCount > 0 ? Math.round(scoreSum / scoreCount) : 0;

  return stats;
}
