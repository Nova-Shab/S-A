/**
 * Datenmodelle für das EU AI Act Audit-Tool
 * Diese Definitionen sind vereinfacht und dienen nur als Prototyp
 */

// Risikoklassen gemäß EU AI Act
export type RiskClass =
  | "PROHIBITED"      // Verbotene Systeme
  | "HIGH_RISK"       // Hochrisiko-Systeme mit strengen Anforderungen
  | "LIMITED_RISK"    // Begrenzte Risiken, hauptsächlich Transparenzpflichten
  | "MINIMAL_RISK";   // Minimale Risiken, wenige Anforderungen

// Informationen zum KI-System
export interface AiSystemInfo {
  domain: string;                          // Anwendungsbereich
  useCase: string;                         // Beschreibung des Anwendungsfalls
  impactLevel: "low" | "medium" | "high";  // Auswirkungsgrad
  biometricOrSurveillance: boolean;        // Biometrie/Überwachung?
  euImpact: boolean;                       // EU-Auswirkung?
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
