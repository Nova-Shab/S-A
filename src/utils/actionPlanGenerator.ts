import {
  ActionItem,
  AuditAnswer,
  Requirement,
  RequirementStatus,
} from "../models/types";

/**
 * Generiert Maßnahmenempfehlungen basierend auf Audit-Ergebnissen
 */
export function generateActionPlan(
  requirements: Requirement[],
  answers: AuditAnswer[]
): ActionItem[] {
  const actions: ActionItem[] = [];

  // Erstelle eine Map für schnellen Zugriff
  const answerMap = new Map<string, AuditAnswer>();
  answers.forEach((answer) => {
    answerMap.set(answer.requirementId, answer);
  });

  requirements.forEach((req) => {
    const answer = answerMap.get(req.id);
    if (!answer) return;

    // Nur für nicht-erfüllte und teilweise-erfüllte Anforderungen Maßnahmen erstellen
    if (
      answer.status === "non_compliant" ||
      answer.status === "partially_compliant"
    ) {
      const severity: "hoch" | "mittel" | "niedrig" =
        answer.status === "non_compliant" ? "hoch" : "mittel";

      const action = createActionForRequirement(req, answer.status, severity);
      actions.push(action);
    }
  });

  return actions;
}

/**
 * Erstellt eine konkrete Maßnahme für eine Anforderung
 */
function createActionForRequirement(
  requirement: Requirement,
  status: RequirementStatus,
  severity: "hoch" | "mittel" | "niedrig"
): ActionItem {
  const recommendedAction = getRecommendedActionText(requirement, status);

  return {
    id: `action-${requirement.id}`,
    category: requirement.category,
    requirementTitle: requirement.title,
    severity,
    recommendedAction,
    responsible: "",
    targetDate: "",
  };
}

/**
 * Gibt spezifische Handlungsempfehlungen basierend auf Anforderung und Status
 */
function getRecommendedActionText(
  requirement: Requirement,
  status: RequirementStatus
): string {
  const isNonCompliant = status === "non_compliant";
  const prefix = isNonCompliant
    ? "**Dringend erforderlich:**"
    : "**Verbesserung empfohlen:**";

  // Spezifische Empfehlungen basierend auf Anforderungs-ID
  switch (requirement.id) {
    case "RM-01":
      return `${prefix} Implementieren Sie ein formales Risikomanagement-System mit definierten Prozessen, Verantwortlichkeiten und regelmäßigen Reviews. Nutzen Sie etablierte Frameworks wie ISO 31000.`;

    case "RM-02":
      return `${prefix} Führen Sie eine systematische Risikoanalyse durch. Identifizieren Sie potenzielle Risiken in Bezug auf Grundrechte, Diskriminierung und Sicherheit. Dokumentieren Sie alle identifizierten Risiken.`;

    case "RM-03":
      return `${prefix} Entwickeln Sie konkrete Maßnahmen zur Risikominderung für jedes identifizierte Risiko. Implementieren Sie diese Maßnahmen und überwachen Sie deren Wirksamkeit.`;

    case "DQ-01":
      return `${prefix} Etablieren Sie ein Data-Governance-Framework. Überprüfen Sie Ihre Datensätze auf Vollständigkeit, Repräsentativität und Bias. Implementieren Sie Prozesse zur kontinuierlichen Datenqualitätssicherung.`;

    case "DQ-02":
      return `${prefix} Dokumentieren Sie die Herkunft aller Trainings-, Validierungs- und Testdaten. Erstellen Sie ein Data Lineage Diagramm und dokumentieren Sie alle Datenverarbeitungsschritte.`;

    case "DQ-03":
      return `${prefix} Analysieren Sie, welche Dateneigenschaften für Ihren Anwendungsfall relevant sind. Stellen Sie sicher, dass Ihre Datensätze diese Eigenschaften angemessen abdecken.`;

    case "TD-01":
      return `${prefix} Erstellen Sie eine umfassende technische Dokumentation gemäß Anhang IV des EU AI Act. Diese sollte Systemübersicht, Architektur, Datenflüsse, Algorithmen und Risikobewertung enthalten.`;

    case "TD-02":
      return `${prefix} Dokumentieren Sie detailliert die Systemarchitektur, verwendete Modelle, Algorithmen, APIs und alle Designentscheidungen mit deren Begründung.`;

    case "TD-03":
      return `${prefix} Dokumentieren Sie alle Leistungsmetriken (Accuracy, Precision, Recall, etc.), Testverfahren und Validierungsergebnisse. Definieren Sie akzeptable Leistungsschwellenwerte.`;

    case "TR-01":
      return `${prefix} Erstellen Sie verständliche Nutzerinformationen, die die Funktionsweise, Fähigkeiten und Grenzen des Systems erklären. Stellen Sie diese in geeigneter Form bereit (z.B. Benutzerhandbuch, UI-Hinweise).`;

    case "TR-02":
      return `${prefix} Implementieren Sie klare Hinweise in der Benutzeroberfläche, die Nutzer darüber informieren, dass sie mit einem KI-System interagieren. Dies ist besonders wichtig für Chatbots.`;

    case "TR-03":
      return `${prefix} Stellen Sie Informationen bereit, die es Nutzern ermöglichen, die Ausgaben des Systems zu verstehen und zu interpretieren (z.B. Erklärungen, Confidence Scores).`;

    case "HO-01":
      return `${prefix} Gestalten Sie das System so, dass menschliche Aufsicht möglich ist. Implementieren Sie Schnittstellen und Prozesse für effektive menschliche Überwachung.`;

    case "HO-02":
      return `${prefix} Implementieren Sie Mechanismen, die es Menschen ermöglichen, Systementscheidungen zu übersteuern, abzulehnen oder zu korrigieren. Dokumentieren Sie die Prozesse dafür.`;

    case "HO-03":
      return `${prefix} Entwickeln Sie Schulungsmaterialien für Personen, die das System überwachen. Stellen Sie sicher, dass diese Personen die Funktionsweise und Grenzen des Systems verstehen.`;

    case "RC-01":
      return `${prefix} Implementieren Sie Fehlerbehandlung, Fallback-Mechanismen und Robustheitstests. Testen Sie das System unter verschiedenen Bedingungen und Edge Cases.`;

    case "RC-02":
      return `${prefix} Führen Sie umfassende Tests zur Validierung der Genauigkeit und Zuverlässigkeit durch. Nutzen Sie separate Test-Datensätze und dokumentieren Sie die Ergebnisse.`;

    case "RC-03":
      return `${prefix} Implementieren Sie Cybersecurity-Maßnahmen: Zugriffskontrollen, Verschlüsselung, Intrusion Detection, regelmäßige Security Audits. Folgen Sie etablierten Security Standards.`;

    case "RC-04":
      return `${prefix} Implementieren Sie Mechanismen zum Umgang mit Unsicherheiten (z.B. Confidence Thresholds, Rejection Options). Definieren Sie, wie das System bei unsicheren Vorhersagen reagiert.`;

    case "LM-01":
      return `${prefix} Implementieren Sie automatische Protokollierung aller relevanten Ereignisse (Input, Output, Entscheidungen, Fehler). Stellen Sie sicher, dass Logs sicher gespeichert und archiviert werden.`;

    case "LM-02":
      return `${prefix} Richten Sie ein kontinuierliches Monitoring-System ein, das Leistungsmetriken, Anomalien und Fehler überwacht. Implementieren Sie Alerting bei kritischen Abweichungen.`;

    case "CA-01":
      return `${prefix} Planen und führen Sie die Konformitätsbewertung gemäß den Anforderungen des EU AI Act durch. Ziehen Sie bei Bedarf eine notifizierte Stelle hinzu.`;

    case "CA-02":
      return `${prefix} Nach erfolgreicher Konformitätsbewertung bringen Sie die CE-Kennzeichnung an und erstellen Sie die EU-Konformitätserklärung.`;

    case "CA-03":
      return `${prefix} Registrieren Sie Ihr Hochrisiko-KI-System in der EU-Datenbank für Hochrisiko-KI-Systeme vor dem Inverkehrbringen.`;

    case "LR-01":
      return `${prefix} Implementieren Sie deutliche Kennzeichnungen für alle KI-generierten oder manipulierten Inhalte. Dies muss für Nutzer leicht erkennbar sein.`;

    default:
      return `${prefix} Überprüfen und implementieren Sie die Anforderung "${requirement.title}". Konsultieren Sie die technische Dokumentation und relevante Leitfäden.`;
  }
}

/**
 * Exportiert den Maßnahmenkatalog als Markdown
 */
export function exportActionPlanAsMarkdown(actions: ActionItem[]): string {
  let markdown = "# EU AI Act – Maßnahmenkatalog\n\n";
  markdown += `*Generiert am: ${new Date().toLocaleDateString("de-DE")}*\n\n`;
  markdown +=
    "**Hinweis:** Dieser Maßnahmenkatalog wurde automatisch generiert und ersetzt keine Rechtsberatung.\n\n";
  markdown += "---\n\n";

  // Gruppiere nach Kategorie
  const actionsByCategory = new Map<string, ActionItem[]>();
  actions.forEach((action) => {
    const existing = actionsByCategory.get(action.category) || [];
    actionsByCategory.set(action.category, [...existing, action]);
  });

  // Sortiere nach Severity
  const sortBySeverity = (a: ActionItem, b: ActionItem) => {
    const severityOrder = { hoch: 0, mittel: 1, niedrig: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  };

  actionsByCategory.forEach((categoryActions, category) => {
    markdown += `## ${category}\n\n`;

    categoryActions.sort(sortBySeverity).forEach((action, index) => {
      markdown += `### ${index + 1}. ${action.requirementTitle}\n\n`;
      markdown += `**Priorität:** ${action.severity.toUpperCase()}\n\n`;
      markdown += `${action.recommendedAction}\n\n`;

      if (action.responsible) {
        markdown += `**Verantwortlich:** ${action.responsible}\n\n`;
      }

      if (action.targetDate) {
        markdown += `**Zieltermin:** ${action.targetDate}\n\n`;
      }

      markdown += "---\n\n";
    });
  });

  return markdown;
}
