import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSystems } from "../context/SystemsContext";
import { useLanguage } from "../context/LanguageContext";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import {
  RegisteredAiSystem,
  SYSTEM_STATUS_CONFIG,
  SystemStatus,
  RiskClass
} from "../models/types";
import { getRiskClassLabel, getRiskClassColor } from "../utils/riskClassification";

// =============================================================================
// V-03: SystemsListPage - Multi-System-Verwaltung
// Zentrale Übersicht aller registrierten KI-Systeme
// =============================================================================

export const SystemsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const {
    filteredSystems,
    stats,
    filter,
    setFilter,
    sort,
    setSort,
    addSystem,
    deleteSystem,
    duplicateSystem,
    exportSystems
  } = useSystems();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Handler
  const handleCreateSystem = () => {
    const newSystem = addSystem();
    navigate(`/systems/${newSystem.id}/edit`);
  };

  const handleOpenSystem = (system: RegisteredAiSystem) => {
    navigate(`/systems/${system.id}`);
  };

  const handleEditSystem = (e: React.MouseEvent, system: RegisteredAiSystem) => {
    e.stopPropagation();
    navigate(`/systems/${system.id}/edit`);
  };

  const handleDuplicateSystem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const duplicated = duplicateSystem(id);
    if (duplicated) {
      navigate(`/systems/${duplicated.id}/edit`);
    }
  };

  const handleDeleteConfirm = (id: string) => {
    deleteSystem(id);
    setShowDeleteConfirm(null);
  };

  const handleExport = () => {
    const json = exportSystems(selectedIds.length > 0 ? selectedIds : undefined);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-systems-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleStartAudit = (e: React.MouseEvent, systemId: string) => {
    e.stopPropagation();
    // Navigate to audit with pre-selected system
    navigate(`/audit/new?systemId=${systemId}`);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredSystems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSystems.map(s => s.id));
    }
  };

  const toggleSelectOne = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Render Status Badge
  const renderStatusBadge = (status: SystemStatus) => {
    const config = SYSTEM_STATUS_CONFIG[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Render Risk Badge
  const renderRiskBadge = (riskClass: RiskClass | null) => {
    if (!riskClass) {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-500">
          {t('systems.notClassified')}
        </span>
      );
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskClassColor(riskClass)}`}>
        {getRiskClassLabel(riskClass)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('systems.title')}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {t('systems.subtitle')}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleExport}>
                {t('systems.export')}
              </Button>
              <Button onClick={handleCreateSystem}>
                {t('systems.registerSystem')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <Card className="text-center p-4">
            <div className="text-3xl font-bold text-gray-900">{stats.totalSystems}</div>
            <div className="text-xs text-gray-500 mt-1">{t('systems.totalSystems')}</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-3xl font-bold text-green-600">{stats.byStatus.COMPLIANT}</div>
            <div className="text-xs text-gray-500 mt-1">{t('systems.compliant')}</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-3xl font-bold text-red-600">{stats.byStatus.NON_COMPLIANT}</div>
            <div className="text-xs text-gray-500 mt-1">{t('systems.nonCompliant')}</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-3xl font-bold text-orange-600">{stats.byRiskClass.HIGH_RISK}</div>
            <div className="text-xs text-gray-500 mt-1">{t('systems.highRisk')}</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-3xl font-bold text-purple-600">{stats.systemsRequiringAction}</div>
            <div className="text-xs text-gray-500 mt-1">{t('systems.actionRequired')}</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-3xl font-bold text-blue-600">{stats.upcomingAudits}</div>
            <div className="text-xs text-gray-500 mt-1">{t('systems.upcomingAudits')}</div>
          </Card>
        </div>

        {/* Filters & Controls */}
        <Card className="mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder={t('systems.searchPlaceholder')}
                value={filter.searchTerm || ""}
                onChange={(e) => setFilter({ ...filter, searchTerm: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filter.status?.[0] || ""}
              onChange={(e) => setFilter({
                ...filter,
                status: e.target.value ? [e.target.value as SystemStatus] : undefined
              })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('systems.allStatus')}</option>
              {Object.entries(SYSTEM_STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>

            {/* Risk Class Filter */}
            <select
              value={filter.riskClass?.[0] || ""}
              onChange={(e) => setFilter({
                ...filter,
                riskClass: e.target.value ? [e.target.value as RiskClass] : undefined
              })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('systems.allRiskClasses')}</option>
              <option value="PROHIBITED">{language === 'de' ? 'Verboten' : 'Prohibited'}</option>
              <option value="HIGH_RISK">{language === 'de' ? 'Hochrisiko' : 'High Risk'}</option>
              <option value="LIMITED_RISK">{language === 'de' ? 'Begrenztes Risiko' : 'Limited Risk'}</option>
              <option value="MINIMAL_RISK">{language === 'de' ? 'Minimales Risiko' : 'Minimal Risk'}</option>
            </select>

            {/* Sort */}
            <select
              value={`${sort.field}-${sort.direction}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split("-") as [typeof sort.field, "asc" | "desc"];
                setSort({ field, direction });
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="updatedAt-desc">{t('systems.lastUpdated')}</option>
              <option value="createdAt-desc">{t('systems.newestFirst')}</option>
              <option value="createdAt-asc">{t('systems.oldestFirst')}</option>
              <option value="systemName-asc">{t('systems.nameAZ')}</option>
              <option value="systemName-desc">{t('systems.nameZA')}</option>
              <option value="riskClass-asc">{t('systems.riskHighestFirst')}</option>
              <option value="complianceScore-desc">{t('systems.complianceScore')}</option>
            </select>

            {/* View Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 ${viewMode === "grid" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedIds.length > 0 && (
            <div className="mt-4 pt-4 border-t flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {selectedIds.length} {t('systems.selected')}
              </span>
              <Button variant="secondary" onClick={() => setSelectedIds([])}>
                {t('systems.clearSelection')}
              </Button>
              <Button variant="secondary" onClick={handleExport}>
                {t('systems.exportSelected')}
              </Button>
            </div>
          )}
        </Card>

        {/* Systems List */}
        {filteredSystems.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                {t('systems.noSystems')}
              </h3>
              <p className="mt-1 text-gray-500">
                {t('systems.noSystemsDesc')}
              </p>
              <div className="mt-6">
                <Button onClick={handleCreateSystem}>
                  {t('systems.registerFirst')}
                </Button>
              </div>
            </div>
          </Card>
        ) : viewMode === "grid" ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSystems.map((system) => (
              <Card
                key={system.id}
                className="hover:shadow-lg transition-shadow cursor-pointer relative"
                onClick={() => handleOpenSystem(system)}
              >
                {/* Selection Checkbox */}
                <div
                  className="absolute top-3 left-3"
                  onClick={(e) => toggleSelectOne(e, system.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(system.id)}
                    onChange={() => {}}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </div>

                {/* Actions */}
                <div className="absolute top-3 right-3 flex gap-1">
                  <button
                    onClick={(e) => handleEditSystem(e, system)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title={t('systems.edit')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => handleDuplicateSystem(e, system.id)}
                    className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                    title={t('systems.duplicate')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(system.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title={t('systems.delete')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div className="pt-6">
                  {/* System Name */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 pr-20">
                    {system.systemInfo.systemName || t('systems.unnamedSystem')}
                  </h3>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {renderStatusBadge(system.status)}
                    {renderRiskBadge(system.riskClass)}
                  </div>

                  {/* Info */}
                  <div className="text-sm text-gray-600 space-y-1 mb-4">
                    {system.systemInfo.domain && (
                      <p>{t('systems.domain')}: {system.systemInfo.domain}</p>
                    )}
                    {system.department && (
                      <p>{t('systems.department')}: {system.department}</p>
                    )}
                    {system.responsiblePerson && (
                      <p>{t('systems.responsible')}: {system.responsiblePerson}</p>
                    )}
                  </div>

                  {/* Compliance Score */}
                  {typeof system.complianceScore === "number" && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Compliance</span>
                        <span>{system.complianceScore}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            system.complianceScore >= 80 ? "bg-green-500" :
                            system.complianceScore >= 50 ? "bg-yellow-500" : "bg-red-500"
                          }`}
                          style={{ width: `${system.complianceScore}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="pt-3 border-t flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {system.auditCount} {t('systems.auditsCompleted')}
                    </div>
                    <Button
                      variant="secondary"
                      onClick={(e) => handleStartAudit(e, system.id)}
                    >
                      {t('systems.startAudit')}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          // List View
          <Card className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredSystems.length && filteredSystems.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('systems.system')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('systems.status')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('systems.riskClass')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('systems.compliance')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('systems.department')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('systems.updated')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('systems.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSystems.map((system) => (
                  <tr
                    key={system.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleOpenSystem(system)}
                  >
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(system.id)}
                        onChange={() => toggleSelectOne({ stopPropagation: () => {} } as React.MouseEvent, system.id)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">
                        {system.systemInfo.systemName || t('systems.unnamedSystem')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {system.systemInfo.domain}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {renderStatusBadge(system.status)}
                    </td>
                    <td className="px-4 py-4">
                      {renderRiskBadge(system.riskClass)}
                    </td>
                    <td className="px-4 py-4">
                      {typeof system.complianceScore === "number" ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                system.complianceScore >= 80 ? "bg-green-500" :
                                system.complianceScore >= 50 ? "bg-yellow-500" : "bg-red-500"
                              }`}
                              style={{ width: `${system.complianceScore}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{system.complianceScore}%</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {system.department || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {new Date(system.updatedAt).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US')}
                    </td>
                    <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={(e) => handleStartAudit(e, system.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {t('systems.audit')}
                        </button>
                        <button
                          onClick={(e) => handleEditSystem(e, system)}
                          className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                        >
                          {t('systems.edit')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('systems.deleteConfirmTitle')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('systems.deleteConfirmText')}
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)}>
                  {t('systems.cancel')}
                </Button>
                <button
                  onClick={() => handleDeleteConfirm(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  {t('systems.delete')}
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
