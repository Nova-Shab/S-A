import { Requirement, RiskClass } from "../models/types";

/**
 * Beispielhafte Anforderungen aus dem EU AI Act
 * HINWEIS: Dies ist eine stark vereinfachte Liste für Prototyp-Zwecke.
 * Die echten Anforderungen sind detaillierter und komplexer.
 */
export const ALL_REQUIREMENTS: Requirement[] = [
  // ========== Risikomanagement ==========
  {
    id: "RM-01",
    category: "Risikomanagement",
    title: "Risikomanagement-System etabliert",
    description:
      "Ein kontinuierliches, iteratives Risikomanagementsystem muss eingerichtet sein, das während des gesamten Lebenszyklus des KI-Systems aktiv ist.",
    riskLevel: ["HIGH_RISK"],
  },
  {
    id: "RM-02",
    category: "Risikomanagement",
    title: "Risikoidentifikation und -analyse",
    description:
      "Bekannte und vorhersehbare Risiken müssen identifiziert, analysiert und bewertet werden, insbesondere im Hinblick auf Grundrechte und Diskriminierung.",
    riskLevel: ["HIGH_RISK"],
  },
  {
    id: "RM-03",
    category: "Risikomanagement",
    title: "Risikominimierungsmaßnahmen",
    description:
      "Geeignete Maßnahmen zur Risikominderung müssen implementiert und dokumentiert sein.",
    riskLevel: ["HIGH_RISK"],
  },

  // ========== Daten & Datenqualität ==========
  {
    id: "DQ-01",
    category: "Daten & Datenqualität",
    title: "Datenqualitäts-Governance",
    description:
      "Trainings-, Validierungs- und Testdatensätze müssen relevant, repräsentativ, fehlerfrei und vollständig sein. Bias muss minimiert werden.",
    riskLevel: ["HIGH_RISK"],
  },
  {
    id: "DQ-02",
    category: "Daten & Datenqualität",
    title: "Datenherkunft und -verwaltung",
    description:
      "Die Herkunft der Daten muss dokumentiert sein, sowie die verwendeten Datenverarbeitungsprozesse und -methoden.",
    riskLevel: ["HIGH_RISK"],
  },
  {
    id: "DQ-03",
    category: "Daten & Datenqualität",
    title: "Relevante Dateneigenschaften berücksichtigt",
    description:
      "Bei der Datenauswahl müssen relevante Eigenschaften berücksichtigt werden (z.B. geografische Herkunft, Verhaltens-/Funktionsmuster).",
    riskLevel: ["HIGH_RISK"],
  },

  // ========== Technische Dokumentation ==========
  {
    id: "TD-01",
    category: "Technische Dokumentation",
    title: "Vollständige technische Dokumentation erstellt",
    description:
      "Eine umfassende technische Dokumentation muss erstellt werden, bevor das System in Verkehr gebracht wird. Sie muss kontinuierlich aktualisiert werden.",
    riskLevel: ["HIGH_RISK"],
  },
  {
    id: "TD-02",
    category: "Technische Dokumentation",
    title: "Systemarchitektur und -design dokumentiert",
    description:
      "Die Architektur des KI-Systems, verwendete Algorithmen, Datenquellen und Designentscheidungen müssen dokumentiert sein.",
    riskLevel: ["HIGH_RISK"],
  },
  {
    id: "TD-03",
    category: "Technische Dokumentation",
    title: "Leistungsmetriken und -bewertung dokumentiert",
    description:
      "Erwartete Leistung, Testverfahren, Metriken und Validierungsergebnisse müssen dokumentiert sein.",
    riskLevel: ["HIGH_RISK"],
  },

  // ========== Transparenz & Nutzerinformation ==========
  {
    id: "TR-01",
    category: "Transparenz & Nutzerinformation",
    title: "Nutzerinformationen bereitgestellt",
    description:
      "Nutzer müssen klar, verständlich und in angemessener Form über die Funktionsweise, Fähigkeiten und Grenzen des KI-Systems informiert werden.",
    riskLevel: ["HIGH_RISK", "LIMITED_RISK"],
  },
  {
    id: "TR-02",
    category: "Transparenz & Nutzerinformation",
    title: "Transparenz über KI-Interaktion",
    description:
      "Nutzer müssen darüber informiert werden, dass sie mit einem KI-System interagieren (gilt besonders für Chatbots und Konversationssysteme).",
    riskLevel: ["HIGH_RISK", "LIMITED_RISK"],
  },
  {
    id: "TR-03",
    category: "Transparenz & Nutzerinformation",
    title: "Informationen zur Interpretierbarkeit",
    description:
      "Bereitstellung von Informationen, die es Nutzern ermöglichen, die Ausgaben des Systems zu verstehen und angemessen zu nutzen.",
    riskLevel: ["HIGH_RISK"],
  },

  // ========== Human Oversight (Menschliche Aufsicht) ==========
  {
    id: "HO-01",
    category: "Human Oversight",
    title: "Menschliche Aufsicht implementiert",
    description:
      "Hochrisiko-KI-Systeme müssen so gestaltet sein, dass sie während ihrer Nutzung von natürlichen Personen wirksam beaufsichtigt werden können.",
    riskLevel: ["HIGH_RISK"],
  },
  {
    id: "HO-02",
    category: "Human Oversight",
    title: "Eingriffsmöglichkeiten für Menschen",
    description:
      "Menschen müssen in der Lage sein, Entscheidungen des Systems zu übersteuern, abzulehnen oder zu korrigieren.",
    riskLevel: ["HIGH_RISK"],
  },
  {
    id: "HO-03",
    category: "Human Oversight",
    title: "Schulung der Aufsichtspersonen",
    description:
      "Personen, die das System überwachen, müssen angemessen geschult und kompetent sein.",
    riskLevel: ["HIGH_RISK"],
  },

  // ========== Robustheit, Genauigkeit & Cybersecurity ==========
  {
    id: "RC-01",
    category: "Robustheit, Genauigkeit & Cybersecurity",
    title: "Technische Robustheit gewährleistet",
    description:
      "Das System muss robust sein gegenüber Fehlern, Ausfällen und Anomalien während des Lebenszyklus.",
    riskLevel: ["HIGH_RISK"],
  },
  {
    id: "RC-02",
    category: "Robustheit, Genauigkeit & Cybersecurity",
    title: "Genauigkeit und Zuverlässigkeit getestet",
    description:
      "Die Genauigkeit, Zuverlässigkeit und Reproduzierbarkeit des Systems müssen angemessen getestet und validiert sein.",
    riskLevel: ["HIGH_RISK"],
  },
  {
    id: "RC-03",
    category: "Robustheit, Genauigkeit & Cybersecurity",
    title: "Cybersecurity-Maßnahmen implementiert",
    description:
      "Angemessene Maßnahmen zum Schutz gegen unbefugte Zugriffe, Cyberangriffe und Manipulation müssen implementiert sein.",
    riskLevel: ["HIGH_RISK"],
  },
  {
    id: "RC-04",
    category: "Robustheit, Genauigkeit & Cybersecurity",
    title: "Umgang mit Unsicherheiten definiert",
    description:
      "Das System muss mit Situationen der Unsicherheit umgehen können und entsprechende Mechanismen bereitstellen.",
    riskLevel: ["HIGH_RISK"],
  },

  // ========== Logging & Monitoring ==========
  {
    id: "LM-01",
    category: "Logging & Monitoring",
    title: "Automatische Protokollierung implementiert",
    description:
      "Das System muss automatisch Ereignisse protokollieren (Logs), um die Rückverfolgbarkeit während des Lebenszyklus zu gewährleisten.",
    riskLevel: ["HIGH_RISK"],
  },
  {
    id: "LM-02",
    category: "Logging & Monitoring",
    title: "Monitoring der Systemleistung",
    description:
      "Kontinuierliches Monitoring der Systemleistung und -ausgaben muss eingerichtet sein.",
    riskLevel: ["HIGH_RISK"],
  },

  // ========== Konformitätsbewertung ==========
  {
    id: "CA-01",
    category: "Konformitätsbewertung",
    title: "Konformitätsbewertung durchgeführt",
    description:
      "Eine Konformitätsbewertung gemäß Anhang VI oder VII des EU AI Act muss durchgeführt werden.",
    riskLevel: ["HIGH_RISK"],
  },
  {
    id: "CA-02",
    category: "Konformitätsbewertung",
    title: "CE-Kennzeichnung angebracht",
    description:
      "Nach erfolgreicher Konformitätsbewertung muss die CE-Kennzeichnung angebracht werden.",
    riskLevel: ["HIGH_RISK"],
  },
  {
    id: "CA-03",
    category: "Konformitätsbewertung",
    title: "Registrierung in EU-Datenbank",
    description:
      "Das Hochrisiko-KI-System muss in der EU-Datenbank registriert werden.",
    riskLevel: ["HIGH_RISK"],
  },

  // ========== LIMITED_RISK spezifisch (Art. 50 EU AI Act) ==========
  {
    id: "LR-01",
    category: "Transparenzpflichten",
    title: "Kennzeichnung von KI-generierten Inhalten",
    description:
      "Künstlich erzeugte oder manipulierte Inhalte (z.B. Deepfakes, synthetische Medien) müssen deutlich als solche gekennzeichnet sein.",
    riskLevel: ["LIMITED_RISK"],
  },
  {
    id: "LR-02",
    category: "Transparenzpflichten",
    title: "KI-Interaktion offenlegen",
    description:
      "Nutzer müssen informiert werden, dass sie mit einem KI-System interagieren, außer dies ist aus dem Kontext offensichtlich.",
    riskLevel: ["LIMITED_RISK"],
  },
  {
    id: "LR-03",
    category: "Transparenzpflichten",
    title: "Emotion Recognition Disclosure",
    description:
      "Bei Emotionserkennungssystemen oder biometrischer Kategorisierung müssen betroffene Personen über deren Einsatz informiert werden.",
    riskLevel: ["LIMITED_RISK"],
  },
  {
    id: "LR-04",
    category: "Transparenzpflichten",
    title: "Deep Fake Kennzeichnung",
    description:
      "KI-generierte oder manipulierte Bild-, Audio- oder Videoinhalte müssen maschinenlesbar als solche gekennzeichnet sein.",
    riskLevel: ["LIMITED_RISK"],
  },
  {
    id: "LR-05",
    category: "Transparenzpflichten",
    title: "Text-Generierungs-Offenlegung",
    description:
      "Öffentlich verbreitete, KI-generierte Texte zu Themen von öffentlichem Interesse müssen als KI-generiert gekennzeichnet sein.",
    riskLevel: ["LIMITED_RISK"],
  },
  {
    id: "LR-06",
    category: "Interne Dokumentation",
    title: "Verwendungszweck dokumentiert",
    description:
      "Der Zweck und die beabsichtigte Nutzung des KI-Systems sollten intern dokumentiert sein.",
    riskLevel: ["LIMITED_RISK"],
  },
  {
    id: "LR-07",
    category: "Interne Dokumentation",
    title: "Grundlegende Systembeschreibung",
    description:
      "Eine Beschreibung der grundlegenden Funktionsweise des Systems sollte für interne Zwecke verfügbar sein.",
    riskLevel: ["LIMITED_RISK"],
  },

  // ========== MINIMAL_RISK - Freiwillige Best Practices ==========
  {
    id: "MR-01",
    category: "Empfohlene Maßnahmen",
    title: "Freiwillige Verhaltenskodizes",
    description:
      "Erwägen Sie die Einhaltung freiwilliger Verhaltenskodizes gemäß Art. 95 EU AI Act für vertrauenswürdige KI.",
    riskLevel: ["MINIMAL_RISK"],
  },
  {
    id: "MR-02",
    category: "Empfohlene Maßnahmen",
    title: "Grundlegende Transparenz",
    description:
      "Auch ohne gesetzliche Verpflichtung wird empfohlen, Nutzer über den Einsatz von KI zu informieren.",
    riskLevel: ["MINIMAL_RISK"],
  },
  {
    id: "MR-03",
    category: "Empfohlene Maßnahmen",
    title: "Interne Dokumentation",
    description:
      "Führen Sie grundlegende interne Aufzeichnungen über KI-Systeme, deren Zweck und potenzielle Auswirkungen.",
    riskLevel: ["MINIMAL_RISK"],
  },
  {
    id: "MR-04",
    category: "Empfohlene Maßnahmen",
    title: "Feedback-Mechanismus",
    description:
      "Erwägen Sie die Einrichtung eines Mechanismus für Nutzerfeedback zu KI-Entscheidungen.",
    riskLevel: ["MINIMAL_RISK"],
  },
  {
    id: "MR-05",
    category: "Empfohlene Maßnahmen",
    title: "Regelmäßige Überprüfung",
    description:
      "Führen Sie regelmäßige Überprüfungen durch, ob sich die Risikoklasse des Systems geändert hat.",
    riskLevel: ["MINIMAL_RISK"],
  },
];

/**
 * Filtert Anforderungen nach Risikoklasse
 */
export function getRequirementsForRisk(riskClass: RiskClass): Requirement[] {
  // Für PROHIBITED: Keine Anforderungen, da System nicht erlaubt ist
  if (riskClass === "PROHIBITED") {
    return [];
  }

  // Filtere Anforderungen, die für diese Risikoklasse gelten
  return ALL_REQUIREMENTS.filter((req) => req.riskLevel.includes(riskClass));
}

/**
 * Gibt Statistiken über Anforderungen pro Risikoklasse zurück
 */
export function getRequirementsStats(): Record<RiskClass, { count: number; categories: string[] }> {
  const stats: Record<RiskClass, { count: number; categories: string[] }> = {
    PROHIBITED: { count: 0, categories: [] },
    HIGH_RISK: { count: 0, categories: [] },
    LIMITED_RISK: { count: 0, categories: [] },
    MINIMAL_RISK: { count: 0, categories: [] },
  };

  ALL_REQUIREMENTS.forEach((req) => {
    req.riskLevel.forEach((level) => {
      stats[level].count++;
      if (!stats[level].categories.includes(req.category)) {
        stats[level].categories.push(req.category);
      }
    });
  });

  return stats;
}

/**
 * Gruppiert Anforderungen nach Kategorie
 */
export function groupRequirementsByCategory(
  requirements: Requirement[]
): Map<string, Requirement[]> {
  const grouped = new Map<string, Requirement[]>();

  requirements.forEach((req) => {
    const existing = grouped.get(req.category) || [];
    grouped.set(req.category, [...existing, req]);
  });

  return grouped;
}
