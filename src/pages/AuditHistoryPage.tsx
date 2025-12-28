import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { RiskBadge } from "../components/RiskBadge";
import auditService, { AuditVersion, AuditHistoryEntry } from "../services/auditService";

export const AuditHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const auditId = searchParams.get("auditId");

  const [versions, setVersions] = useState<AuditVersion[]>([]);
  const [historyEntries, setHistoryEntries] = useState<AuditHistoryEntry[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<AuditVersion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"versions" | "history">("versions");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auditId) {
      setError("Keine Audit-ID angegeben");
      setIsLoading(false);
      return;
    }

    loadData();
  }, [auditId]);

  const loadData = async () => {
    if (!auditId) return;

    setIsLoading(true);
    setError(null);

    try {
      const [versionsResult, historyResult] = await Promise.all([
        auditService.getVersions(parseInt(auditId)),
        auditService.getHistory(parseInt(auditId)),
      ]);

      setVersions(versionsResult.versions || []);
      setHistoryEntries(historyResult.history || []);
    } catch (err) {
      console.error("Fehler beim Laden der Daten:", err);
      setError("Fehler beim Laden der Audit-Historie");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: "bg-gray-100 text-gray-700",
      in_progress: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      archived: "bg-purple-100 text-purple-700",
    };
    const labels: Record<string, string> = {
      draft: "Entwurf",
      in_progress: "In Bearbeitung",
      completed: "Abgeschlossen",
      archived: "Archiviert",
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.draft}`}>
        {labels[status] || status}
      </span>
    );
  };

  // Unified Risk Badge using central design tokens
  const getRiskClassBadge = (riskClass: string | null) => {
    if (!riskClass) return null;
    return <RiskBadge riskClass={riskClass} size="sm" variant="pill" />;
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "created":
        return "🆕";
      case "updated":
        return "✏️";
      case "answer_changed":
        return "📝";
      case "action_item_updated":
        return "📋";
      case "version_created":
        return "📸";
      case "status_changed":
        return "🔄";
      default:
        return "📌";
    }
  };

  if (!auditId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Keine Audit-ID</h1>
          <p className="text-gray-600 mb-4">
            Bitte wählen Sie ein Audit aus, um die Historie anzuzeigen.
          </p>
          <Button onClick={() => navigate("/dashboard")}>Zum Dashboard</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Audit-Historie</h1>
            <p className="text-gray-600">
              Versionen und Änderungsprotokoll für Rückverfolgbarkeit
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            ← Zurück
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab("versions")}
                  className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "versions"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  📸 Versionen ({versions.length})
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "history"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  📜 Änderungsprotokoll ({historyEntries.length})
                </button>
              </nav>
            </div>

            {/* Versions Tab */}
            {activeTab === "versions" && (
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Versions List */}
                <div className="lg:col-span-1 space-y-4">
                  {versions.length === 0 ? (
                    <Card className="text-center py-8">
                      <p className="text-gray-500">Noch keine Versionen erstellt</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Erstellen Sie im Maßnahmenkatalog eine Version
                      </p>
                    </Card>
                  ) : (
                    versions.map((version) => (
                      <Card
                        key={version.id}
                        className={`cursor-pointer transition-all ${
                          selectedVersion?.id === version.id
                            ? "ring-2 ring-blue-500"
                            : "hover:shadow-md"
                        }`}
                        onClick={() => setSelectedVersion(version)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold text-blue-600">
                            Version {version.version}
                          </span>
                          {getStatusBadge(version.status)}
                        </div>
                        <p className="text-sm text-gray-500 mb-2">
                          {formatDate(version.createdAt)}
                        </p>
                        <div className="flex items-center gap-2">
                          {getRiskClassBadge(version.riskClass)}
                          <span className="text-sm text-gray-600">
                            {version.completionPercentage}% abgeschlossen
                          </span>
                        </div>
                        {version.notes && (
                          <p className="mt-2 text-sm text-gray-600 italic">
                            "{version.notes}"
                          </p>
                        )}
                      </Card>
                    ))
                  )}
                </div>

                {/* Version Details */}
                <div className="lg:col-span-2">
                  {selectedVersion ? (
                    <Card>
                      <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Version {selectedVersion.version} - Details
                      </h2>

                      {/* Version Summary */}
                      {selectedVersion.snapshot.summary && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {selectedVersion.snapshot.summary.totalRequirements}
                            </div>
                            <div className="text-xs text-gray-600">Anforderungen</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {selectedVersion.snapshot.summary.compliant}
                            </div>
                            <div className="text-xs text-gray-600">Erfüllt</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">
                              {selectedVersion.snapshot.summary.partiallyCompliant}
                            </div>
                            <div className="text-xs text-gray-600">Teilweise</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                              {selectedVersion.snapshot.summary.nonCompliant}
                            </div>
                            <div className="text-xs text-gray-600">Nicht erfüllt</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-600">
                              {selectedVersion.snapshot.summary.notApplicable}
                            </div>
                            <div className="text-xs text-gray-600">N/A</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                              {selectedVersion.snapshot.summary.openActionItems}
                            </div>
                            <div className="text-xs text-gray-600">Offene Maßnahmen</div>
                          </div>
                        </div>
                      )}

                      {/* System Info */}
                      {selectedVersion.snapshot.systemInfo && (
                        <div className="mb-6">
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">
                            System-Informationen
                          </h3>
                          <div className="p-3 bg-gray-50 rounded-lg text-sm">
                            <p><strong>Name:</strong> {selectedVersion.snapshot.systemInfo.systemName || "—"}</p>
                            <p><strong>Zweck:</strong> {selectedVersion.snapshot.systemInfo.primaryPurpose || "—"}</p>
                            <p><strong>Domäne:</strong> {selectedVersion.snapshot.systemInfo.domain || "—"}</p>
                          </div>
                        </div>
                      )}

                      {/* Action Items */}
                      {selectedVersion.snapshot.actionItems?.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">
                            Maßnahmen ({selectedVersion.snapshot.actionItems.length})
                          </h3>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {selectedVersion.snapshot.actionItems.map((item, idx) => (
                              <div
                                key={idx}
                                className={`p-2 rounded border-l-4 ${
                                  item.severity === "hoch"
                                    ? "border-red-500 bg-red-50"
                                    : item.severity === "mittel"
                                    ? "border-orange-500 bg-orange-50"
                                    : "border-yellow-500 bg-yellow-50"
                                }`}
                              >
                                <p className="text-sm font-medium">{item.requirementTitle}</p>
                                <p className="text-xs text-gray-600">
                                  {item.responsible || "Nicht zugewiesen"} • {item.targetDate || "Kein Termin"}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  ) : (
                    <Card className="text-center py-12">
                      <p className="text-gray-500">
                        Wählen Sie eine Version aus, um Details anzuzeigen
                      </p>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <Card>
                {historyEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Noch keine Änderungen protokolliert</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {historyEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="text-2xl">{getActionIcon(entry.action)}</div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{entry.description}</p>
                          {entry.fieldChanged && (
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">Feld:</span> {entry.fieldChanged}
                              {entry.oldValue && entry.newValue && (
                                <span>
                                  {" "}• <span className="line-through text-red-600">{entry.oldValue}</span>
                                  {" → "}
                                  <span className="text-green-600">{entry.newValue}</span>
                                </span>
                              )}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(entry.createdAt)}
                            {entry.userName && ` • ${entry.userName}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuditHistoryPage;
