import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { StepIndicator } from "../components/StepIndicator";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { AuditSystemHeader } from "../components/AuditSystemHeader";
import { useAudit } from "../context/AuditContext";
import { ActionItem } from "../models/types";
import {
  generateActionPlan,
  exportActionPlanAsMarkdown,
} from "../utils/actionPlanGenerator";
import { getRequirementsForRisk } from "../utils/requirements";
import auditService, { AuditVersion } from "../services/auditService";
import authService from "../services/authService";

const STEPS = [
  { number: 1, title: "Risiko einstufen" },
  { number: 2, title: "Anforderungen prüfen" },
  { number: 3, title: "Maßnahmenkatalog" },
];

export const ActionPlanPage: React.FC = () => {
  const { state, setActionItems, updateActionItem, setCurrentStep, resetAudit } =
    useAudit();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams();

  // auditId kann von URL-Param (/audit/:id) oder Query-Param (?auditId=) kommen
  const urlAuditId = params.id && params.id !== "new" ? params.id : null;
  const queryAuditId = searchParams.get("auditId");
  const [currentAuditId, setCurrentAuditId] = useState<string | null>(urlAuditId || queryAuditId);

  const isLoggedIn = authService.isAuthenticated();

  const [showMarkdown, setShowMarkdown] = useState(false);
  const [markdown, setMarkdown] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versionNotes, setVersionNotes] = useState("");
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [latestVersion, setLatestVersion] = useState<AuditVersion | null>(null);

  useEffect(() => {
    if (!state.riskClass) {
      setCurrentStep(1);
      return;
    }

    // Generiere Maßnahmenplan, falls noch nicht vorhanden
    if (state.actionItems.length === 0) {
      const requirements = getRequirementsForRisk(state.riskClass);
      const actions = generateActionPlan(requirements, state.auditAnswers);
      setActionItems(actions);
    }
  }, [state.riskClass, state.auditAnswers, state.actionItems.length, setActionItems, setCurrentStep]);

  // Lade letzte Version wenn currentAuditId vorhanden
  useEffect(() => {
    if (currentAuditId) {
      auditService.getVersions(parseInt(currentAuditId))
        .then(({ versions }) => {
          if (versions && versions.length > 0) {
            setLatestVersion(versions[0]);
          }
        })
        .catch(console.error);
    }
  }, [currentAuditId]);

  // Neues Audit erstellen falls noch keine ID vorhanden
  const createNewAuditIfNeeded = async (): Promise<number | null> => {
    if (currentAuditId) {
      return parseInt(currentAuditId);
    }

    // Erstelle ein neues Audit
    const auditTitle = state.systemInfo?.systemName
      ? `Audit: ${state.systemInfo.systemName}`
      : `Audit vom ${new Date().toLocaleDateString("de-DE")}`;

    try {
      const { audit } = await auditService.createAudit({
        title: auditTitle,
        description: state.systemInfo?.primaryPurpose || "",
        systemInfo: state.systemInfo!,
        riskClass: state.riskClass!,
      });

      // Speichere die neue ID
      setCurrentAuditId(String(audit.id));

      // Update URL mit der neuen auditId
      setSearchParams({ auditId: String(audit.id) });

      return audit.id;
    } catch (error) {
      console.error("Fehler beim Erstellen des Audits:", error);
      return null;
    }
  };

  // Audit speichern (zur Datenbank)
  const handleSaveAudit = async () => {
    if (!isLoggedIn) {
      setSaveMessage({ type: "error", text: "Bitte melden Sie sich an, um das Audit zu speichern." });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Erstelle Audit falls nötig
      const auditIdToUse = await createNewAuditIfNeeded();

      if (!auditIdToUse) {
        setSaveMessage({ type: "error", text: "Fehler beim Erstellen des Audits." });
        return;
      }

      await auditService.saveCompleteAudit(auditIdToUse, {
        answers: state.auditAnswers,
        actionItems: state.actionItems,
        systemInfo: state.systemInfo,
        riskClass: state.riskClass,
      });
      setSaveMessage({ type: "success", text: "Audit erfolgreich gespeichert!" });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      console.error("Fehler beim Speichern:", error);
      const errorMessage = error?.response?.data?.error || error?.message || "Fehler beim Speichern. Bitte versuchen Sie es erneut.";
      setSaveMessage({ type: "error", text: errorMessage });
    } finally {
      setIsSaving(false);
    }
  };

  // Version erstellen
  const handleCreateVersion = async () => {
    if (!isLoggedIn) {
      setSaveMessage({ type: "error", text: "Bitte melden Sie sich an." });
      return;
    }

    setIsCreatingVersion(true);

    try {
      // Erstelle Audit falls nötig
      const auditIdToUse = await createNewAuditIfNeeded();

      if (!auditIdToUse) {
        setSaveMessage({ type: "error", text: "Fehler beim Erstellen des Audits." });
        return;
      }

      // Erst speichern, dann Version erstellen
      await auditService.saveCompleteAudit(auditIdToUse, {
        answers: state.auditAnswers,
        actionItems: state.actionItems,
        systemInfo: state.systemInfo,
        riskClass: state.riskClass,
      });

      const { version } = await auditService.createVersion(auditIdToUse, versionNotes);
      setLatestVersion(version);
      setShowVersionModal(false);
      setVersionNotes("");
      setSaveMessage({ type: "success", text: `Version ${version.version} erfolgreich erstellt!` });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      console.error("Fehler beim Erstellen der Version:", error);
      const errorMessage = error?.response?.data?.error || error?.message || "Fehler beim Erstellen der Version.";
      setSaveMessage({ type: "error", text: errorMessage });
    } finally {
      setIsCreatingVersion(false);
    }
  };

  const handleViewHistory = () => {
    if (currentAuditId) {
      navigate(`/audit-history?auditId=${currentAuditId}`);
    } else {
      setSaveMessage({ type: "error", text: "Bitte speichern Sie das Audit zuerst." });
    }
  };

  const handleExportMarkdown = () => {
    const md = exportActionPlanAsMarkdown(state.actionItems);
    setMarkdown(md);
    setShowMarkdown(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleStartNew = () => {
    if (
      window.confirm(
        "Möchten Sie wirklich ein neues Audit beginnen? Alle aktuellen Daten gehen verloren."
      )
    ) {
      resetAudit();
      setCurrentStep(0);
    }
  };

  // Gruppiere Actions nach Kategorie
  const actionsByCategory = new Map<string, ActionItem[]>();
  state.actionItems.forEach((action) => {
    const existing = actionsByCategory.get(action.category) || [];
    actionsByCategory.set(action.category, [...existing, action]);
  });

  // Sortiere nach Severity
  const sortBySeverity = (a: ActionItem, b: ActionItem) => {
    const severityOrder = { hoch: 0, mittel: 1, niedrig: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StepIndicator currentStep={3} steps={STEPS} />

      <div className="max-w-5xl mx-auto px-4 py-8 print:py-4">
        {/* System Header (wenn mit System verknüpft) */}
        <AuditSystemHeader />

        <div className="flex items-center justify-between mb-6 print:mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Maßnahmenkatalog
            </h1>
            <p className="text-gray-600">
              EU AI Act Audit – Empfohlene Maßnahmen
            </p>
            {latestVersion && (
              <p className="text-sm text-blue-600 mt-1">
                Letzte Version: v{latestVersion.version} ({new Date(latestVersion.createdAt).toLocaleDateString("de-DE")})
              </p>
            )}
          </div>
          <div className="print:hidden flex flex-wrap gap-2">
            {isLoggedIn && (
              <>
                <Button
                  variant="primary"
                  onClick={handleSaveAudit}
                  disabled={isSaving}
                >
                  {isSaving ? "Speichert..." : "💾 Speichern"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowVersionModal(true)}
                >
                  📸 Version erstellen
                </Button>
                <Button variant="secondary" onClick={handleViewHistory}>
                  📜 Historie
                </Button>
              </>
            )}
            <Button variant="secondary" onClick={handleExportMarkdown}>
              Als Markdown
            </Button>
            <Button variant="secondary" onClick={handlePrint}>
              🖨️ Drucken
            </Button>
          </div>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div
            className={`mb-4 p-3 rounded-lg ${
              saveMessage.type === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {saveMessage.text}
          </div>
        )}

        {/* Markdown Modal */}
        {showMarkdown && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-semibold">Markdown Export</h2>
                <button
                  onClick={() => setShowMarkdown(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <textarea
                  value={markdown}
                  readOnly
                  className="w-full h-full min-h-[400px] font-mono text-sm border border-gray-300 rounded p-4"
                />
              </div>
              <div className="p-4 border-t flex gap-2">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(markdown);
                    alert("Markdown in Zwischenablage kopiert!");
                  }}
                >
                  In Zwischenablage kopieren
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowMarkdown(false)}
                >
                  Schließen
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Version Modal */}
        {showVersionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-semibold">Version erstellen</h2>
                <button
                  onClick={() => setShowVersionModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">
                <p className="text-gray-600 mb-4">
                  Erstellen Sie einen Snapshot des aktuellen Audit-Zustands für die Rückverfolgbarkeit.
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notizen zur Version (optional)
                </label>
                <textarea
                  value={versionNotes}
                  onChange={(e) => setVersionNotes(e.target.value)}
                  placeholder="z.B. Erste vollständige Prüfung, Nach Korrekturmaßnahmen..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
                {latestVersion && (
                  <p className="mt-2 text-sm text-gray-500">
                    Aktuelle Version: v{latestVersion.version}
                  </p>
                )}
              </div>
              <div className="p-4 border-t flex gap-2 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setShowVersionModal(false)}
                  disabled={isCreatingVersion}
                >
                  Abbrechen
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCreateVersion}
                  disabled={isCreatingVersion}
                >
                  {isCreatingVersion ? "Wird erstellt..." : "Version erstellen"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Summary Card */}
        <Card className="mb-6 print:mb-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {state.actionItems.length}
              </div>
              <div className="text-sm text-gray-600">Gesamte Maßnahmen</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {
                  state.actionItems.filter((a) => a.severity === "hoch").length
                }
              </div>
              <div className="text-sm text-gray-600">Hohe Priorität</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {
                  state.actionItems.filter((a) => a.severity === "mittel")
                    .length
                }
              </div>
              <div className="text-sm text-gray-600">Mittlere Priorität</div>
            </div>
          </div>
        </Card>

        {/* Actions by Category */}
        <div className="space-y-6 mb-6">
          {Array.from(actionsByCategory.entries()).map(
            ([category, actions]) => (
              <Card key={category}>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 print:mb-4">
                  {category}
                </h2>

                <div className="space-y-6 print:space-y-4">
                  {actions.sort(sortBySeverity).map((action, index) => (
                    <div
                      key={action.id}
                      className={`border-l-4 pl-4 py-2 ${
                        action.severity === "hoch"
                          ? "border-red-500"
                          : action.severity === "mittel"
                          ? "border-orange-500"
                          : "border-yellow-500"
                      }`}
                    >
                      {/* Action Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {index + 1}. {action.requirementTitle}
                          </h3>
                          <span
                            className={`inline-block text-xs font-medium px-2 py-1 rounded ${
                              action.severity === "hoch"
                                ? "bg-red-100 text-red-800"
                                : action.severity === "mittel"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            Priorität: {action.severity.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Action Description */}
                      <div className="mb-4 text-gray-700 text-sm">
                        {action.recommendedAction.split("**").map((part, i) =>
                          i % 2 === 1 ? (
                            <strong key={i}>{part}</strong>
                          ) : (
                            part
                          )
                        )}
                      </div>

                      {/* Editable Fields */}
                      <div className="grid grid-cols-2 gap-4 print:gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Verantwortlich (Rolle)
                          </label>
                          <input
                            type="text"
                            value={action.responsible}
                            onChange={(e) =>
                              updateActionItem({
                                ...action,
                                responsible: e.target.value,
                              })
                            }
                            placeholder="z.B. CTO, Data Protection Officer"
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent print:border-gray-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Zieltermin
                          </label>
                          <input
                            type="date"
                            value={action.targetDate}
                            onChange={(e) =>
                              updateActionItem({
                                ...action,
                                targetDate: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent print:border-gray-400"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )
          )}
        </div>

        {/* Action Buttons */}
        <Card className="print:hidden">
          <div className="flex gap-4">
            <Button
              variant="secondary"
              onClick={() => setCurrentStep(2)}
              className="flex-1"
            >
              ← Zurück zum Audit
            </Button>
            <Button variant="danger" onClick={handleStartNew} className="flex-1">
              Neues Audit beginnen
            </Button>
          </div>
        </Card>

        {/* Print Footer */}
        <div className="hidden print:block mt-8 pt-4 border-t text-sm text-gray-600">
          <p>
            <strong>Hinweis:</strong> Dieser Maßnahmenkatalog wurde automatisch
            generiert und ersetzt keine Rechtsberatung.
          </p>
          <p className="mt-2">
            Generiert am: {new Date().toLocaleDateString("de-DE")} | EU AI Act
            Audit-Assistent (Prototyp v0.0.1)
          </p>
        </div>
      </div>
    </div>
  );
};
