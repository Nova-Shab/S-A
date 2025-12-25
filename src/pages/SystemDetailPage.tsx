import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSystems } from "../context/SystemsContext";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import {
  RegisteredAiSystem,
  SYSTEM_STATUS_CONFIG,
  SystemStatus,
  EU_AI_ACT_ROLES,
  ANNEX_III_CATEGORIES,
  EuAiActRole,
  AnnexIIICategory
} from "../models/types";
import { getRiskClassLabel, getRiskClassColor } from "../utils/riskClassification";

// =============================================================================
// V-03: SystemDetailPage - Einzelansicht und Bearbeitung eines KI-Systems
// =============================================================================

export const SystemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSystemById, updateSystem, deleteSystem } = useSystems();

  const [system, setSystem] = useState<RegisteredAiSystem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form state for editing
  const [formData, setFormData] = useState<Partial<RegisteredAiSystem>>({});

  useEffect(() => {
    if (id) {
      const found = getSystemById(id);
      if (found) {
        setSystem(found);
        setFormData(found);
      } else {
        navigate("/systems");
      }
    }
  }, [id, getSystemById, navigate]);

  // Check if URL ends with /edit
  useEffect(() => {
    if (window.location.pathname.endsWith("/edit")) {
      setIsEditing(true);
    }
  }, []);

  const handleSave = () => {
    if (id && formData) {
      updateSystem(id, formData);
      const updated = getSystemById(id);
      setSystem(updated || null);
      setIsEditing(false);
      navigate(`/systems/${id}`);
    }
  };

  const handleDelete = () => {
    if (id) {
      deleteSystem(id);
      navigate("/systems");
    }
  };

  const handleStartAudit = () => {
    navigate(`/audit/new?systemId=${id}`);
  };

  if (!system) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/systems")}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditing ? "System bearbeiten" : system.systemInfo.systemName || "Unbenanntes System"}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${SYSTEM_STATUS_CONFIG[system.status].bgColor} ${SYSTEM_STATUS_CONFIG[system.status].color}`}>
                    {SYSTEM_STATUS_CONFIG[system.status].label}
                  </span>
                  {system.riskClass && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskClassColor(system.riskClass)}`}>
                      {getRiskClassLabel(system.riskClass)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <Button variant="secondary" onClick={() => {
                    setFormData(system);
                    setIsEditing(false);
                    navigate(`/systems/${id}`);
                  }}>
                    Abbrechen
                  </Button>
                  <Button onClick={handleSave}>
                    Speichern
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="secondary" onClick={() => setShowDeleteConfirm(true)}>
                    Löschen
                  </Button>
                  <Button variant="secondary" onClick={() => {
                    setIsEditing(true);
                    navigate(`/systems/${id}/edit`);
                  }}>
                    Bearbeiten
                  </Button>
                  <Button onClick={handleStartAudit}>
                    Audit starten
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {isEditing ? (
          // Edit Mode
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Grundinformationen</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Systemname *</label>
                  <input
                    type="text"
                    value={formData.systemInfo?.systemName || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      systemInfo: { ...formData.systemInfo!, systemName: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="z.B. Chatbot für Kundenservice"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                  <input
                    type="text"
                    value={formData.systemInfo?.systemVersion || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      systemInfo: { ...formData.systemInfo!, systemVersion: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="z.B. 2.1.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Anbieter/Hersteller</label>
                  <input
                    type="text"
                    value={formData.systemInfo?.systemProvider || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      systemInfo: { ...formData.systemInfo!, systemProvider: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="z.B. OpenAI, Microsoft, intern"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Domäne/Branche</label>
                  <input
                    type="text"
                    value={formData.systemInfo?.domain || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      systemInfo: { ...formData.systemInfo!, domain: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="z.B. Finanzwesen, Gesundheit, E-Commerce"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Anwendungsfall</label>
                  <textarea
                    value={formData.systemInfo?.useCase || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      systemInfo: { ...formData.systemInfo!, useCase: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Beschreiben Sie den Hauptanwendungsfall des Systems..."
                  />
                </div>
              </div>
            </Card>

            {/* EU AI Act Role */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">EU AI Act Rolle</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {EU_AI_ACT_ROLES.map((role) => (
                  <label
                    key={role.value}
                    className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.systemInfo?.euAiActRole === role.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="euAiActRole"
                      value={role.value}
                      checked={formData.systemInfo?.euAiActRole === role.value}
                      onChange={() => setFormData({
                        ...formData,
                        systemInfo: { ...formData.systemInfo!, euAiActRole: role.value as EuAiActRole }
                      })}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{role.label}</div>
                      <div className="text-xs text-gray-500">{role.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </Card>

            {/* Annex III Categories */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Annex III Kategorien</h2>
              <p className="text-sm text-gray-600 mb-4">
                Wählen Sie alle zutreffenden Hochrisiko-Kategorien gemäß Annex III des EU AI Act:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ANNEX_III_CATEGORIES.map((cat) => (
                  <label
                    key={cat.value}
                    className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.systemInfo?.annexIIICategories?.includes(cat.value as AnnexIIICategory)
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.systemInfo?.annexIIICategories?.includes(cat.value as AnnexIIICategory) || false}
                      onChange={(e) => {
                        const current = formData.systemInfo?.annexIIICategories || [];
                        const updated = e.target.checked
                          ? [...current, cat.value as AnnexIIICategory]
                          : current.filter(c => c !== cat.value);
                        setFormData({
                          ...formData,
                          systemInfo: { ...formData.systemInfo!, annexIIICategories: updated }
                        });
                      }}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{cat.label}</div>
                      <div className="text-xs text-gray-500">{cat.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </Card>

            {/* Organization Info */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Organisatorische Zuordnung</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as SystemStatus })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(SYSTEM_STATUS_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Abteilung</label>
                  <input
                    type="text"
                    value={formData.department || ""}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="z.B. IT, Marketing, HR"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verantwortliche Person</label>
                  <input
                    type="text"
                    value={formData.responsiblePerson || ""}
                    onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Name der verantwortlichen Person"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nächstes Audit fällig</label>
                  <input
                    type="date"
                    value={formData.nextAuditDue?.split("T")[0] || ""}
                    onChange={(e) => setFormData({ ...formData, nextAuditDue: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (kommagetrennt)</label>
                  <input
                    type="text"
                    value={formData.tags?.join(", ") || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      tags: e.target.value.split(",").map(t => t.trim()).filter(t => t)
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="z.B. Produktion, Kritisch, Phase-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interne Notizen</label>
                  <textarea
                    value={formData.notes || ""}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Interne Notizen zum System..."
                  />
                </div>
              </div>
            </Card>
          </div>
        ) : (
          // View Mode
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="text-center">
                <div className="text-3xl font-bold text-blue-600">{system.auditCount}</div>
                <div className="text-sm text-gray-500">Audits durchgeführt</div>
              </Card>
              <Card className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {typeof system.complianceScore === "number" ? `${system.complianceScore}%` : "-"}
                </div>
                <div className="text-sm text-gray-500">Compliance-Score</div>
              </Card>
              <Card className="text-center">
                <div className="text-sm font-medium text-gray-900">
                  {system.lastAuditDate ? new Date(system.lastAuditDate).toLocaleDateString("de-DE") : "-"}
                </div>
                <div className="text-sm text-gray-500">Letztes Audit</div>
              </Card>
              <Card className="text-center">
                <div className="text-sm font-medium text-gray-900">
                  {system.nextAuditDue ? new Date(system.nextAuditDue).toLocaleDateString("de-DE") : "-"}
                </div>
                <div className="text-sm text-gray-500">Nächstes Audit</div>
              </Card>
            </div>

            {/* System Details */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Systeminformationen</h2>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Systemname</dt>
                  <dd className="text-gray-900">{system.systemInfo.systemName || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Version</dt>
                  <dd className="text-gray-900">{system.systemInfo.systemVersion || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Anbieter</dt>
                  <dd className="text-gray-900">{system.systemInfo.systemProvider || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Domäne</dt>
                  <dd className="text-gray-900">{system.systemInfo.domain || "-"}</dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Anwendungsfall</dt>
                  <dd className="text-gray-900">{system.systemInfo.useCase || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">EU AI Act Rolle</dt>
                  <dd className="text-gray-900">
                    {EU_AI_ACT_ROLES.find(r => r.value === system.systemInfo.euAiActRole)?.label || "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Annex III Kategorien</dt>
                  <dd className="text-gray-900">
                    {system.systemInfo.annexIIICategories?.length > 0
                      ? system.systemInfo.annexIIICategories.map(c =>
                          ANNEX_III_CATEGORIES.find(cat => cat.value === c)?.label
                        ).join(", ")
                      : "-"
                    }
                  </dd>
                </div>
              </dl>
            </Card>

            {/* Organization */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Organisation</h2>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Abteilung</dt>
                  <dd className="text-gray-900">{system.department || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Verantwortlich</dt>
                  <dd className="text-gray-900">{system.responsiblePerson || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tags</dt>
                  <dd className="flex flex-wrap gap-1">
                    {system.tags.length > 0 ? system.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {tag}
                      </span>
                    )) : "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Erstellt</dt>
                  <dd className="text-gray-900">
                    {new Date(system.createdAt).toLocaleDateString("de-DE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </dd>
                </div>
                {system.notes && (
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Notizen</dt>
                    <dd className="text-gray-900 whitespace-pre-wrap">{system.notes}</dd>
                  </div>
                )}
              </dl>
            </Card>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              System löschen?
            </h3>
            <p className="text-gray-600 mb-4">
              Möchten Sie "{system.systemInfo.systemName}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                Abbrechen
              </Button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Löschen
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
