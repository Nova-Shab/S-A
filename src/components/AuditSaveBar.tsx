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
      setSaveMessage({ type: "error", text: "Bitte melden Sie sich an, um zu speichern." });
      setTimeout(() => setSaveMessage(null), 3000);
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
      setSaveMessage({ type: "success", text: "Gespeichert!" });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      setSaveMessage({ type: "error", text: "Fehler beim Speichern." });
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
    } catch (error) {
      console.error("Fehler beim Erstellen der Version:", error);
      setSaveMessage({ type: "error", text: "Fehler beim Erstellen der Version." });
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
