import { AiSystemInfo, RiskClass } from "../models/types";

/**
 * Vereinfachte Risikoklassifizierung gemäß EU AI Act
 * HINWEIS: Dies ist eine stark vereinfachte Logik für Prototyp-Zwecke.
 * Eine echte Klassifizierung erfordert juristische Expertise und detaillierte Analyse.
 */
export function classifyRisk(systemInfo: AiSystemInfo): RiskClass {
  // 1. PROHIBITED: Verbotene Systeme
  // Beispiele: Echtzeit-Überwachung in öffentlichen Räumen, Social Scoring
  if (systemInfo.biometricOrSurveillance && systemInfo.impactLevel === "high") {
    return "PROHIBITED";
  }

  // 2. HIGH_RISK: Hochrisiko-Systeme in kritischen Bereichen
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
    systemInfo.domain.toLowerCase().includes(domain.toLowerCase())
  );

  if (
    isHighRiskDomain &&
    systemInfo.impactLevel === "high" &&
    systemInfo.euImpact
  ) {
    return "HIGH_RISK";
  }

  // Weitere High-Risk Kriterien
  if (
    systemInfo.impactLevel === "high" &&
    systemInfo.euImpact &&
    (systemInfo.biometricOrSurveillance ||
      systemInfo.useCase.toLowerCase().includes("entscheidung") ||
      systemInfo.useCase.toLowerCase().includes("bewertung"))
  ) {
    return "HIGH_RISK";
  }

  // 3. LIMITED_RISK: Begrenzte Risiken (z.B. Chatbots, Deepfakes)
  // Hauptsächlich Transparenzpflichten
  if (
    systemInfo.impactLevel === "medium" ||
    systemInfo.useCase.toLowerCase().includes("chatbot") ||
    systemInfo.useCase.toLowerCase().includes("interaktion")
  ) {
    return "LIMITED_RISK";
  }

  // 4. MINIMAL_RISK: Standard-Fall
  return "MINIMAL_RISK";
}

/**
 * Gibt eine erklärende Beschreibung zur Risikoklasse zurück
 */
export function getRiskClassDescription(riskClass: RiskClass): string {
  switch (riskClass) {
    case "PROHIBITED":
      return "Dieses System fällt in die Kategorie **verbotene KI-Systeme**. Solche Systeme dürfen in der EU grundsätzlich nicht eingesetzt werden. Beispiele: Social Scoring, Echtzeit-Fernidentifikation in öffentlichen Räumen zu Strafverfolgungszwecken (mit Ausnahmen).";

    case "HIGH_RISK":
      return "Dieses System wird als **Hochrisiko-KI-System** klassifiziert. Es unterliegt strengen Anforderungen gemäß EU AI Act: Risikomanagement, Datenqualität, Dokumentation, Transparenz, menschliche Aufsicht, Robustheit und Cybersicherheit. Eine Konformitätsbewertung ist erforderlich.";

    case "LIMITED_RISK":
      return "Dieses System fällt in die Kategorie **begrenzte Risiken**. Die Hauptanforderung ist **Transparenz**: Nutzer müssen darüber informiert werden, dass sie mit einem KI-System interagieren (z.B. Chatbots) oder dass Inhalte künstlich erzeugt wurden (z.B. Deepfakes).";

    case "MINIMAL_RISK":
      return "Dieses System wird als **minimales Risiko** eingestuft. Es gibt keine spezifischen gesetzlichen Verpflichtungen aus dem EU AI Act. Dennoch empfiehlt sich die Einhaltung von Best Practices und ethischen Richtlinien.";
  }
}

/**
 * Gibt Empfehlungen für nächste Schritte basierend auf Risikoklasse
 */
export function getNextStepsForRisk(riskClass: RiskClass): string[] {
  switch (riskClass) {
    case "PROHIBITED":
      return [
        "Prüfen Sie rechtliche Beratung, ob das System tatsächlich unter die Verbotskategorie fällt",
        "Erwägen Sie alternative Lösungsansätze, die nicht verboten sind",
        "Dokumentieren Sie die Entscheidung und Begründung",
      ];

    case "HIGH_RISK":
      return [
        "Führen Sie ein vollständiges Audit der Anforderungen durch",
        "Implementieren Sie ein Risikomanagementsystem",
        "Erstellen Sie technische Dokumentation und Nutzerinformationen",
        "Planen Sie eine Konformitätsbewertung",
        "Registrieren Sie das System in der EU-Datenbank",
      ];

    case "LIMITED_RISK":
      return [
        "Implementieren Sie Transparenzmaßnahmen",
        "Informieren Sie Nutzer über die KI-Nutzung",
        "Dokumentieren Sie Ihre Maßnahmen",
      ];

    case "MINIMAL_RISK":
      return [
        "Halten Sie Best Practices ein",
        "Dokumentieren Sie freiwillig Ihr System",
        "Beobachten Sie zukünftige Entwicklungen im EU AI Act",
      ];
  }
}
