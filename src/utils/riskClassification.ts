import { AiSystemInfo, RiskClass, AnnexIIICategory } from "../models/types";

/**
 * Risikoklassifizierung gemäß EU AI Act
 * Erweitert um Anhang III Kategorien (K-02)
 */
export function classifyRisk(systemInfo: AiSystemInfo): RiskClass {
  // 1. PROHIBITED: Verbotene Systeme (Art. 5)
  if (isProhibited(systemInfo)) {
    return "PROHIBITED";
  }

  // 2. HIGH_RISK: Anhang III Kategorien prüfen
  if (isHighRisk(systemInfo)) {
    return "HIGH_RISK";
  }

  // 3. LIMITED_RISK: Transparenzpflichten
  if (isLimitedRisk(systemInfo)) {
    return "LIMITED_RISK";
  }

  // 4. MINIMAL_RISK: Standard-Fall
  return "MINIMAL_RISK";
}

/**
 * Prüft auf verbotene KI-Praktiken nach Art. 5
 */
function isProhibited(systemInfo: AiSystemInfo): boolean {
  const useCase = systemInfo.useCase?.toLowerCase() || "";
  const purpose = systemInfo.primaryPurpose?.toLowerCase() || "";
  const combined = `${useCase} ${purpose}`;

  // Social Scoring durch Behörden
  if (
    combined.includes("social scoring") ||
    combined.includes("soziales bewertungssystem") ||
    combined.includes("sozialpunkte")
  ) {
    return true;
  }

  // Unterschwellige Manipulation
  if (
    combined.includes("unterschwellig") ||
    combined.includes("subliminal") ||
    combined.includes("manipulation")
  ) {
    return true;
  }

  // Echtzeit-Fernidentifikation im öffentlichen Raum für Strafverfolgung
  if (
    systemInfo.biometricOrSurveillance &&
    systemInfo.impactLevel === "high" &&
    systemInfo.annexIIICategories?.includes("LAW_ENFORCEMENT")
  ) {
    return true;
  }

  // Biometrische Kategorisierung nach sensiblen Merkmalen
  if (
    systemInfo.biometricOrSurveillance &&
    (combined.includes("rasse") ||
      combined.includes("ethnie") ||
      combined.includes("religion") ||
      combined.includes("politische überzeugung") ||
      combined.includes("sexuelle orientierung"))
  ) {
    return true;
  }

  return false;
}

/**
 * Prüft auf Hochrisiko-Klassifizierung nach Anhang III
 */
function isHighRisk(systemInfo: AiSystemInfo): boolean {
  // Hochrisiko-Kategorien nach Anhang III
  const highRiskCategories: AnnexIIICategory[] = [
    "BIOMETRIC_IDENTIFICATION",
    "CRITICAL_INFRASTRUCTURE",
    "EDUCATION_VOCATIONAL",
    "EMPLOYMENT_HR",
    "ESSENTIAL_SERVICES",
    "LAW_ENFORCEMENT",
    "MIGRATION_ASYLUM",
    "JUSTICE_DEMOCRACY",
  ];

  // Prüfe ob eine Hochrisiko-Kategorie ausgewählt wurde
  const hasHighRiskCategory = systemInfo.annexIIICategories?.some((cat) =>
    highRiskCategories.includes(cat)
  );

  if (hasHighRiskCategory && systemInfo.euImpact) {
    return true;
  }

  // Legacy-Logik: Domain-basierte Prüfung
  const highRiskDomains = [
    "Gesundheitswesen",
    "Personal/HR",
    "Kreditvergabe",
    "Kritische Infrastruktur",
    "Bildung",
    "Strafverfolgung",
    "Migration/Asyl",
    "Justiz",
  ];

  const isHighRiskDomain = highRiskDomains.some((domain) =>
    systemInfo.domain?.toLowerCase().includes(domain.toLowerCase())
  );

  if (
    isHighRiskDomain &&
    systemInfo.impactLevel === "high" &&
    systemInfo.euImpact
  ) {
    return true;
  }

  // Biometrische Systeme sind grundsätzlich Hochrisiko
  if (
    systemInfo.biometricOrSurveillance &&
    systemInfo.euImpact &&
    systemInfo.impactLevel !== "low"
  ) {
    return true;
  }

  // Entscheidungsunterstützungssysteme mit hohem Impact
  const useCase = systemInfo.useCase?.toLowerCase() || "";
  const purpose = systemInfo.primaryPurpose?.toLowerCase() || "";
  const combined = `${useCase} ${purpose}`;

  if (
    systemInfo.impactLevel === "high" &&
    systemInfo.euImpact &&
    (combined.includes("entscheidung") ||
      combined.includes("bewertung") ||
      combined.includes("scoring") ||
      combined.includes("auswahl") ||
      combined.includes("prüfung"))
  ) {
    return true;
  }

  return false;
}

/**
 * Prüft auf begrenzte Risiken (Transparenzpflichten)
 */
function isLimitedRisk(systemInfo: AiSystemInfo): boolean {
  const useCase = systemInfo.useCase?.toLowerCase() || "";
  const purpose = systemInfo.primaryPurpose?.toLowerCase() || "";
  const combined = `${useCase} ${purpose}`;

  // Chatbots und Konversationssysteme
  if (
    combined.includes("chatbot") ||
    combined.includes("konversation") ||
    combined.includes("dialog") ||
    combined.includes("assistent")
  ) {
    return true;
  }

  // Emotionserkennung
  if (
    combined.includes("emotion") ||
    combined.includes("gefühl") ||
    combined.includes("stimmung")
  ) {
    return true;
  }

  // Deepfakes / Synthetische Inhalte
  if (
    combined.includes("deepfake") ||
    combined.includes("synthetisch") ||
    combined.includes("generiert") ||
    combined.includes("generation")
  ) {
    return true;
  }

  // "Sonstiges" Kategorie mit mittlerem Impact
  if (
    systemInfo.annexIIICategories?.includes("OTHER") &&
    systemInfo.impactLevel === "medium"
  ) {
    return true;
  }

  // Mittleres Risiko allgemein
  if (systemInfo.impactLevel === "medium") {
    return true;
  }

  return false;
}

/**
 * Gibt eine erklärende Beschreibung zur Risikoklasse zurück
 */
export function getRiskClassDescription(riskClass: RiskClass): string {
  switch (riskClass) {
    case "PROHIBITED":
      return "Dieses System fällt in die Kategorie **verbotene KI-Systeme** nach Art. 5 EU AI Act. Solche Systeme dürfen in der EU grundsätzlich nicht entwickelt, in Verkehr gebracht oder eingesetzt werden. Beispiele: Social Scoring durch Behörden, unterschwellige Manipulation, Echtzeit-Fernidentifikation in öffentlichen Räumen zu Strafverfolgungszwecken (mit eng begrenzten Ausnahmen).";

    case "HIGH_RISK":
      return "Dieses System wird als **Hochrisiko-KI-System** nach Anhang III EU AI Act klassifiziert. Es unterliegt strengen Anforderungen: Risikomanagement (Art. 9), Datenqualität (Art. 10), technische Dokumentation (Art. 11), Aufzeichnungspflichten (Art. 12), Transparenz (Art. 13), menschliche Aufsicht (Art. 14), Genauigkeit und Robustheit (Art. 15). Eine Konformitätsbewertung und CE-Kennzeichnung sind vor Inverkehrbringen erforderlich.";

    case "LIMITED_RISK":
      return "Dieses System fällt in die Kategorie **begrenzte Risiken** nach Art. 50 EU AI Act. Die Hauptanforderung sind **Transparenzpflichten**: Nutzer müssen darüber informiert werden, dass sie mit einem KI-System interagieren (z.B. bei Chatbots) oder dass Inhalte künstlich erzeugt oder manipuliert wurden (z.B. Deepfakes).";

    case "MINIMAL_RISK":
      return "Dieses System wird als **minimales Risiko** eingestuft. Es unterliegt keinen spezifischen gesetzlichen Verpflichtungen aus dem EU AI Act. Die Entwicklung freiwilliger Verhaltenskodizes wird gefördert (Art. 95). Dennoch empfiehlt sich die Einhaltung von Best Practices und ethischen KI-Grundsätzen.";
  }
}

/**
 * Gibt Empfehlungen für nächste Schritte basierend auf Risikoklasse und Rolle
 */
export function getNextStepsForRisk(riskClass: RiskClass): string[] {
  switch (riskClass) {
    case "PROHIBITED":
      return [
        "Entwicklung/Einsatz des Systems sofort stoppen",
        "Rechtliche Beratung einholen zur Prüfung möglicher Ausnahmen",
        "Alternative Lösungsansätze evaluieren, die nicht verboten sind",
        "Entscheidung und Begründung dokumentieren",
        "Ggf. zuständige Marktüberwachungsbehörde kontaktieren",
      ];

    case "HIGH_RISK":
      return [
        "Vollständiges Audit der Anforderungen durchführen (Art. 8-15)",
        "Risikomanagement-System implementieren (Art. 9)",
        "Datenqualitätsanforderungen sicherstellen (Art. 10)",
        "Technische Dokumentation erstellen (Art. 11, Anhang IV)",
        "Aufzeichnungspflichten einrichten (Art. 12)",
        "Transparenzinformationen für Betreiber bereitstellen (Art. 13)",
        "Menschliche Aufsicht gewährleisten (Art. 14)",
        "Genauigkeit, Robustheit und Cybersicherheit nachweisen (Art. 15)",
        "Konformitätsbewertung durchführen (Art. 43)",
        "EU-Konformitätserklärung erstellen (Art. 47)",
        "CE-Kennzeichnung anbringen (Art. 48)",
        "In EU-Datenbank registrieren (Art. 49, 71)",
      ];

    case "LIMITED_RISK":
      return [
        "Transparenzpflichten nach Art. 50 implementieren",
        "Nutzer über KI-Interaktion informieren (bei Chatbots etc.)",
        "Synthetische Inhalte als solche kennzeichnen",
        "Maschinenlesbare Kennzeichnung implementieren",
        "Dokumentation der Transparenzmaßnahmen",
      ];

    case "MINIMAL_RISK":
      return [
        "Freiwillige Verhaltenskodizes prüfen (Art. 95)",
        "Ethische KI-Grundsätze dokumentieren",
        "Best Practices für Entwicklung und Einsatz einhalten",
        "Regelmäßige Überprüfung der Risikoklassifizierung planen",
        "Zukünftige Entwicklungen im EU AI Act beobachten",
      ];
  }
}
