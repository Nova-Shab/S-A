import React, { useState, useEffect } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { Button } from "./Button";
import { useAudit } from "../context/AuditContext";
import auditService, { AuditVersion } from "../services/auditService";
import authService from "../services/authService";

interface AuditSaveBarProps {
  className?: string;
}

export const AuditSaveBar: React.FC<AuditSaveBarProps> = ({ className = "" }) => {
  const { state } = useAudit();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams();

  // auditId kann von URL-Param (/audit/:id) oder Query-Param (?auditId=) kommen
  const urlAuditId = params.id && params.id !== "new" ? params.id : null;
  const queryAuditId = searchParams.get("auditId");
  const linkedSystemId = searchParams.get("systemId"); // Reference to system in registry
  const [currentAuditId, setCurrentAuditId] = useState<string | null>(urlAuditId || queryAuditId);

  const isLoggedIn = authService.isAuthenticated();

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versionNotes, setVersionNotes] = useState("");
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [latestVersion, setLatestVersion] = useState<AuditVersion | null>(null);

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

  // Neues Audit erstellen oder existierendes finden
  const createNewAuditIfNeeded = async (): Promise<number | null> => {
    if (currentAuditId) {
      return parseInt(currentAuditId);
    }

    // Prüfe ob mindestens ein Systemname vorhanden ist
    if (!state.systemInfo?.systemName) {
      setSaveMessage({ type: "error", text: "Bitte geben Sie mindestens einen Systemnamen ein." });
      return null;
    }

    const systemName = state.systemInfo.systemName.trim();

    // Prüfe ob bereits ein aktives Audit für dieses System existiert (über systemId)
    if (linkedSystemId) {
      try {
        const { hasActiveAudit, audit: activeAudit } = await auditService.checkActiveAuditForSystem(linkedSystemId);
        if (hasActiveAudit && activeAudit) {
          // Verwende das existierende aktive Audit
          setCurrentAuditId(String(activeAudit.id));
          setSearchParams({ auditId: String(activeAudit.id), systemId: linkedSystemId });
          setSaveMessage({ type: "success", text: "Aktives Audit gefunden und wird aktualisiert." });
          return activeAudit.id;
        }
      } catch (error) {
        console.warn("Fehler bei der Prüfung auf aktives Audit:", error);
      }
    }

    // Fallback: Prüfe ob bereits ein Audit mit diesem Systemnamen existiert
    try {
      const { found, audit: existingAudit } = await auditService.findBySystemName(systemName);

      if (found && existingAudit) {
        // Existierendes Audit verwenden
        setCurrentAuditId(String(existingAudit.id));
        const params: Record<string, string> = { auditId: String(existingAudit.id) };
        if (linkedSystemId) params.systemId = linkedSystemId;
        setSearchParams(params);
        setSaveMessage({ type: "success", text: "Existierendes Audit gefunden und wird aktualisiert." });
        return existingAudit.id;
      }
    } catch (error) {
      // Ignoriere Fehler bei der Suche - erstelle einfach ein neues Audit
      console.warn("Fehler bei der Suche nach existierendem Audit:", error);
    }

    // Erstelle ein neues Audit
    const auditTitle = `Audit: ${systemName}`;

    // Erstelle vollständiges systemInfo mit Standardwerten
    const completeSystemInfo = {
      systemName: systemName,
      systemVersion: state.systemInfo.systemVersion || "",
      systemProvider: state.systemInfo.systemProvider || "",
      euAiActRole: state.systemInfo.euAiActRole || "DEPLOYER" as const,
      primaryPurpose: state.systemInfo.primaryPurpose || "",
      annexIIICategories: state.systemInfo.annexIIICategories || [],
      intendedUsers: state.systemInfo.intendedUsers || "",
      prohibitedUses: state.systemInfo.prohibitedUses || "",
      foreseenMisuse: state.systemInfo.foreseenMisuse || "",
      domain: state.systemInfo.domain || "",
      useCase: state.systemInfo.useCase || "",
      impactLevel: state.systemInfo.impactLevel || "low" as const,
      biometricOrSurveillance: state.systemInfo.biometricOrSurveillance || false,
      euImpact: state.systemInfo.euImpact ?? true,
      systemBoundaries: state.systemInfo.systemBoundaries || {
        includedComponents: [],
        excludedComponents: [],
        dataInputs: [],
        dataOutputs: [],
        humanOversight: "",
        integrationPoints: [],
      },
    };

    try {
      const { audit } = await auditService.createAudit({
        title: auditTitle,
        description: state.systemInfo.primaryPurpose || "",
        systemInfo: completeSystemInfo,
        // Verwende LIMITED_RISK als Standard wenn keine Risikoklasse gesetzt
        riskClass: state.riskClass || "LIMITED_RISK",
        // Link to system in registry if available
        systemId: linkedSystemId || undefined,
      });

      // Speichere die neue ID
      setCurrentAuditId(String(audit.id));

      // Update URL mit der neuen auditId
      const params: Record<string, string> = { auditId: String(audit.id) };
      if (linkedSystemId) params.systemId = linkedSystemId;
      setSearchParams(params);

      return audit.id;
    } catch (error: any) {
      console.error("Fehler beim Erstellen des Audits:", error);
      // Handle 409 Conflict - existing active audit
      if (error?.response?.status === 409) {
        const existingAuditId = error?.response?.data?.existingAuditId;
        if (existingAuditId) {
          setCurrentAuditId(String(existingAuditId));
          const params: Record<string, string> = { auditId: String(existingAuditId) };
          if (linkedSystemId) params.systemId = linkedSystemId;
          setSearchParams(params);
          setSaveMessage({ type: "success", text: "Aktives Audit gefunden - wird aktualisiert." });
          return existingAuditId;
        }
        setSaveMessage({ type: "error", text: error?.response?.data?.message || "Es existiert bereits ein aktives Audit für dieses System." });
        return null;
      }
      // Show actual error message from backend
      const errorMessage = error?.response?.data?.error || error?.message || "Unbekannter Fehler beim Erstellen";
      setSaveMessage({ type: "error", text: `Fehler beim Erstellen: ${errorMessage}` });
      return null;
    }
  };

  // Audit speichern (zur Datenbank)
  const handleSaveAudit = async () => {
    if (!isLoggedIn) {
      setSaveMessage({ type: "error", text: "Bitte melden Sie sich an, um zu speichern." });
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    setIsSaving(true);
    // Don't clear message here - createNewAuditIfNeeded might set an error

    try {
      // Erstelle Audit falls nötig
      const auditIdToUse = await createNewAuditIfNeeded();

      if (!auditIdToUse) {
        // If no specific error was set by createNewAuditIfNeeded, show generic error
        if (!saveMessage || saveMessage.type !== "error") {
          setSaveMessage({ type: "error", text: "Fehler beim Erstellen des Audits." });
        }
        return;
      }

      await auditService.saveCompleteAudit(auditIdToUse, {
        answers: state.auditAnswers,
        actionItems: state.actionItems,
        systemInfo: state.systemInfo,
        riskClass: state.riskClass,
      });
      setSaveMessage({ type: "success", text: "Gespeichert!" });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      console.error("Fehler beim Speichern:", error);
      const errorMessage = error?.response?.data?.error || error?.message || "Fehler beim Speichern.";
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
      setSaveMessage({ type: "success", text: `Version ${version.version} erstellt!` });
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
      setSaveMessage({ type: "error", text: "Bitte speichern Sie erst." });
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  // Nicht anzeigen wenn nicht eingeloggt
  if (!isLoggedIn) {
    return null;
  }

  return (
    <>
      {/* Header Buttons - Inline */}
      <div className={`flex items-center gap-2 print:hidden ${className}`}>
        {/* Status Info */}
        {saveMessage && (
          <span className={`text-sm font-medium mr-2 ${
            saveMessage.type === "success" ? "text-green-600" : "text-red-600"
          }`}>
            {saveMessage.text}
          </span>
        )}
        {latestVersion && !saveMessage && (
          <span className="text-xs text-gray-500 mr-2">
            v{latestVersion.version}
          </span>
        )}

        {/* Action Buttons */}
        <Button
          variant="primary"
          onClick={handleSaveAudit}
          disabled={isSaving}
          className="text-sm"
        >
          {isSaving ? "..." : "💾 Speichern"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => setShowVersionModal(true)}
          className="text-sm"
        >
          📸 Version
        </Button>
        <Button
          variant="secondary"
          onClick={handleViewHistory}
          className="text-sm"
        >
          📜 Historie
        </Button>
      </div>

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
                Erstellen Sie einen Snapshot des aktuellen Audit-Zustands.
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notizen zur Version (optional)
              </label>
              <textarea
                value={versionNotes}
                onChange={(e) => setVersionNotes(e.target.value)}
                placeholder="z.B. Erste Prüfung, Nach Korrektur..."
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
                {isCreatingVersion ? "Wird erstellt..." : "Erstellen"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AuditSaveBar;
