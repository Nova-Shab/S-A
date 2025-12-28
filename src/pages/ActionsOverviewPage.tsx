import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import actionsService, {
  ActionItem,
  ActionStats,
  ActionFilters,
  ActionStatsData,
} from '../services/actionsService';
import { ActionDetailPanel } from '../components/ActionDetailPanel';
import { ActionCharts } from '../components/ActionCharts';

type StatusFilter = '' | 'open' | 'in_progress' | 'completed' | 'deferred';
type SeverityFilter = '' | 'hoch' | 'mittel' | 'niedrig';

export const ActionsOverviewPage: React.FC = () => {
  const { language } = useLanguage();

  // Data state
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [stats, setStats] = useState<ActionStats | null>(null);
  const [chartData, setChartData] = useState<ActionStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('');
  const [responsibleFilter, setResponsibleFilter] = useState('');
  const [systemFilter, setSystemFilter] = useState<number | ''>('');
  const [showOverdue, setShowOverdue] = useState(false);

  // Filter options
  const [responsiblePersons, setResponsiblePersons] = useState<string[]>([]);
  const [systems, setSystems] = useState<{ id: number; name: string }[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Detail panel
  const [selectedAction, setSelectedAction] = useState<ActionItem | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);

  // View mode
  const [viewMode, setViewMode] = useState<'table' | 'charts'>('table');

  // Load filter options on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [responsibleData, systemsData] = await Promise.all([
          actionsService.getResponsiblePersons(),
          actionsService.getSystems(),
        ]);
        setResponsiblePersons(responsibleData);
        setSystems(systemsData);
      } catch (err) {
        console.error('Error loading filter options:', err);
      }
    };
    loadFilterOptions();
  }, []);

  // Load actions
  const loadActions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filters: ActionFilters = {
        page,
        limit: 20,
        sortBy: 'targetDate',
        sortOrder: 'ASC',
      };

      if (statusFilter) filters.status = statusFilter;
      if (severityFilter) filters.severity = severityFilter;
      if (responsibleFilter) filters.responsible = responsibleFilter;
      if (systemFilter) filters.systemId = systemFilter;
      if (showOverdue) filters.overdue = true;

      const data = await actionsService.getActions(filters);
      setActions(data.actions);
      setStats(data.stats);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      console.error('Error loading actions:', err);
      setError(language === 'de'
        ? 'Fehler beim Laden der Maßnahmen'
        : 'Error loading actions');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, severityFilter, responsibleFilter, systemFilter, showOverdue, language]);

  // Load chart data
  const loadChartData = useCallback(async () => {
    try {
      const data = await actionsService.getStats();
      setChartData(data);
    } catch (err) {
      console.error('Error loading chart data:', err);
    }
  }, []);

  useEffect(() => {
    loadActions();
  }, [loadActions]);

  useEffect(() => {
    if (viewMode === 'charts') {
      loadChartData();
    }
  }, [viewMode, loadChartData]);

  // Handle action update
  const handleActionUpdate = async (id: number, updates: Partial<ActionItem>) => {
    try {
      await actionsService.updateAction(id, updates);
      loadActions();
      if (selectedAction?.id === id) {
        setSelectedAction({ ...selectedAction, ...updates });
      }
    } catch (err) {
      console.error('Error updating action:', err);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter('');
    setSeverityFilter('');
    setResponsibleFilter('');
    setSystemFilter('');
    setShowOverdue(false);
    setPage(1);
  };

  // Status badge styling
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      open: 'bg-audit-bg text-audit-steel border border-audit-light',
      in_progress: 'bg-blue-50 text-blue-700 border border-blue-200',
      completed: 'bg-green-50 text-green-700 border border-green-200',
      deferred: 'bg-gray-100 text-gray-600 border border-gray-200',
    };
    const labels: Record<string, Record<string, string>> = {
      de: { open: 'Offen', in_progress: 'In Bearbeitung', completed: 'Abgeschlossen', deferred: 'Zurückgestellt' },
      en: { open: 'Open', in_progress: 'In Progress', completed: 'Completed', deferred: 'Deferred' },
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.open}`}>
        {labels[language]?.[status] || status}
      </span>
    );
  };

  // Severity badge styling
  const getSeverityBadge = (severity: string) => {
    const styles: Record<string, string> = {
      hoch: 'bg-red-50 text-red-700 border border-red-200',
      mittel: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      niedrig: 'bg-green-50 text-green-700 border border-green-200',
    };
    const labels: Record<string, Record<string, string>> = {
      de: { hoch: 'Hoch', mittel: 'Mittel', niedrig: 'Niedrig' },
      en: { hoch: 'High', mittel: 'Medium', niedrig: 'Low' },
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[severity] || ''}`}>
        {labels[language]?.[severity] || severity}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-audit-bg">
      {/* Header - Responsive */}
      <div className="audit-page-header">
        <div className="audit-container">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-h1 text-audit-deep">
                {language === 'de' ? 'Maßnahmenübersicht' : 'Actions Overview'}
              </h1>
              <p className="text-body text-audit-cool mt-1">
                {language === 'de'
                  ? 'Alle offenen und laufenden Maßnahmen aus Ihren Audits'
                  : 'All open and ongoing actions from your audits'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex rounded-audit border border-audit-light overflow-hidden">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 sm:px-4 py-2 text-sm font-medium transition-colors ${
                    viewMode === 'table'
                      ? 'bg-audit-steel text-white'
                      : 'bg-white text-audit-cool hover:bg-audit-bg'
                  }`}
                >
                  {language === 'de' ? 'Liste' : 'List'}
                </button>
                <button
                  onClick={() => setViewMode('charts')}
                  className={`px-3 sm:px-4 py-2 text-sm font-medium transition-colors ${
                    viewMode === 'charts'
                      ? 'bg-audit-steel text-white'
                      : 'bg-white text-audit-cool hover:bg-audit-bg'
                  }`}
                >
                  {language === 'de' ? 'Diagramme' : 'Charts'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="audit-container py-6 lg:py-8">
        {/* Stats Cards - Design consistent with Dashboard System Overview */}
        {stats && (
          <div className="audit-panel mb-6">
            <div className="audit-panel-body">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <div className="bg-audit-bg rounded-audit p-4 text-center">
                  <div className="text-2xl font-semibold text-audit-deep">{stats.total}</div>
                  <div className="text-meta text-audit-cool">
                    {language === 'de' ? 'Gesamt' : 'Total'}
                  </div>
                </div>
                <div className="bg-audit-bg rounded-audit p-4 text-center">
                  <div className="text-2xl font-semibold text-audit-deep">{stats.open}</div>
                  <div className="text-meta text-audit-cool">
                    {language === 'de' ? 'Offen' : 'Open'}
                  </div>
                </div>
                <div className="bg-audit-bg rounded-audit p-4 text-center">
                  <div className="text-2xl font-semibold text-blue-600">{stats.inProgress}</div>
                  <div className="text-meta text-audit-cool">
                    {language === 'de' ? 'In Bearbeitung' : 'In Progress'}
                  </div>
                </div>
                <div className="bg-audit-bg rounded-audit p-4 text-center">
                  <div className="text-2xl font-semibold text-green-600">{stats.completed}</div>
                  <div className="text-meta text-audit-cool">
                    {language === 'de' ? 'Abgeschlossen' : 'Completed'}
                  </div>
                </div>
                <div
                  className={`rounded-audit p-4 text-center cursor-pointer transition-colors ${
                    showOverdue ? 'bg-red-50' : 'bg-audit-bg hover:bg-red-50/50'
                  }`}
                  onClick={() => {
                    setShowOverdue(!showOverdue);
                    setPage(1);
                  }}
                >
                  <div className={`text-2xl font-semibold ${stats.overdue > 0 ? 'text-red-600' : 'text-audit-deep'}`}>
                    {stats.overdue}
                  </div>
                  <div className="text-meta text-audit-cool">
                    {language === 'de' ? 'Überfällig' : 'Overdue'}
                  </div>
                </div>
                <div className="bg-audit-bg rounded-audit p-4 text-center">
                  <div className="text-2xl font-semibold text-amber-600">{stats.dueThisWeek}</div>
                  <div className="text-meta text-audit-cool">
                    {language === 'de' ? 'Diese Woche' : 'This Week'}
                  </div>
                </div>
                <div className="bg-audit-bg rounded-audit p-4 text-center">
                  <div className="flex gap-1 items-center justify-center">
                    <span className="text-2xl font-semibold text-red-600">{stats.bySeverity.hoch}</span>
                    <span className="text-2xl font-semibold text-yellow-500">{stats.bySeverity.mittel}</span>
                    <span className="text-2xl font-semibold text-green-600">{stats.bySeverity.niedrig}</span>
                  </div>
                  <div className="text-meta text-audit-cool">
                    {language === 'de' ? 'Nach Priorität' : 'By Priority'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters - Responsive */}
        <div className="audit-card mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
            {/* Status Filter */}
            <div>
              <label className="audit-label text-audit-cool">
                {language === 'de' ? 'Status' : 'Status'}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as StatusFilter);
                  setPage(1);
                }}
                className="audit-input"
              >
                <option value="">{language === 'de' ? 'Alle Status' : 'All Status'}</option>
                <option value="open">{language === 'de' ? 'Offen' : 'Open'}</option>
                <option value="in_progress">{language === 'de' ? 'In Bearbeitung' : 'In Progress'}</option>
                <option value="completed">{language === 'de' ? 'Abgeschlossen' : 'Completed'}</option>
                <option value="deferred">{language === 'de' ? 'Zurückgestellt' : 'Deferred'}</option>
              </select>
            </div>

            {/* Severity Filter */}
            <div>
              <label className="audit-label text-audit-cool">
                {language === 'de' ? 'Priorität' : 'Priority'}
              </label>
              <select
                value={severityFilter}
                onChange={(e) => {
                  setSeverityFilter(e.target.value as SeverityFilter);
                  setPage(1);
                }}
                className="audit-input"
              >
                <option value="">{language === 'de' ? 'Alle Prioritäten' : 'All Priorities'}</option>
                <option value="hoch">{language === 'de' ? 'Hoch' : 'High'}</option>
                <option value="mittel">{language === 'de' ? 'Mittel' : 'Medium'}</option>
                <option value="niedrig">{language === 'de' ? 'Niedrig' : 'Low'}</option>
              </select>
            </div>

            {/* System Filter */}
            <div>
              <label className="audit-label text-audit-cool">
                {language === 'de' ? 'System' : 'System'}
              </label>
              <select
                value={systemFilter}
                onChange={(e) => {
                  setSystemFilter(e.target.value ? Number(e.target.value) : '');
                  setPage(1);
                }}
                className="audit-input"
              >
                <option value="">{language === 'de' ? 'Alle Systeme' : 'All Systems'}</option>
                {systems.map((system) => (
                  <option key={system.id} value={system.id}>
                    {system.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Responsible Filter */}
            <div>
              <label className="audit-label text-audit-cool">
                {language === 'de' ? 'Verantwortlich' : 'Responsible'}
              </label>
              <select
                value={responsibleFilter}
                onChange={(e) => {
                  setResponsibleFilter(e.target.value);
                  setPage(1);
                }}
                className="audit-input"
              >
                <option value="">{language === 'de' ? 'Alle Personen' : 'All Persons'}</option>
                {responsiblePersons.map((person) => (
                  <option key={person} value={person}>
                    {person}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="audit-btn-ghost w-full sm:w-auto"
              >
                {language === 'de' ? 'Filter zurücksetzen' : 'Clear Filters'}
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {viewMode === 'table' ? (
          <>
            {/* Actions Table */}
            {loading ? (
              <div className="bg-white rounded-audit p-12 shadow-audit border border-audit-light text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-audit-steel border-r-transparent"></div>
                <p className="mt-4 text-audit-cool">
                  {language === 'de' ? 'Lade Maßnahmen...' : 'Loading actions...'}
                </p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-audit p-12 shadow-audit border border-audit-light text-center">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={loadActions}
                  className="mt-4 px-4 py-2 bg-audit-steel text-white rounded-audit hover:bg-audit-deep transition-colors"
                >
                  {language === 'de' ? 'Erneut versuchen' : 'Retry'}
                </button>
              </div>
            ) : actions.length === 0 ? (
              <div className="bg-white rounded-audit p-12 shadow-audit border border-audit-light text-center">
                <svg
                  className="mx-auto h-12 w-12 text-audit-light"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-audit-deep">
                  {language === 'de' ? 'Keine Maßnahmen gefunden' : 'No actions found'}
                </h3>
                <p className="mt-2 text-sm text-audit-cool">
                  {language === 'de'
                    ? 'Es gibt keine Maßnahmen, die den aktuellen Filtern entsprechen.'
                    : 'There are no actions matching the current filters.'}
                </p>
              </div>
            ) : (
              <div className="audit-panel">
                <div className="audit-table-wrapper">
                  <table className="audit-table">
                    <thead>
                      <tr>
                        <th>
                          {language === 'de' ? 'Maßnahme' : 'Action'}
                        </th>
                        <th className="hidden md:table-cell">
                          {language === 'de' ? 'System' : 'System'}
                        </th>
                        <th className="hidden lg:table-cell">
                          {language === 'de' ? 'Verantwortlich' : 'Responsible'}
                        </th>
                        <th>
                          {language === 'de' ? 'Fälligkeit' : 'Due Date'}
                        </th>
                        <th>
                          {language === 'de' ? 'Status' : 'Status'}
                        </th>
                        <th className="hidden sm:table-cell">
                          {language === 'de' ? 'Priorität' : 'Priority'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {actions.map((action) => (
                        <tr
                          key={action.id}
                          className="hover:bg-audit-bg cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedAction(action);
                            setShowDetailPanel(true);
                          }}
                        >
                          <td>
                            <div className="flex items-start gap-2">
                              {action.isOverdue && (
                                <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-red-500" title={language === 'de' ? 'Überfällig' : 'Overdue'}></span>
                              )}
                              <div>
                                <div className="font-medium text-audit-deep line-clamp-2">
                                  {action.requirementTitle}
                                </div>
                                <div className="text-sm text-audit-cool line-clamp-1 mt-0.5">
                                  {action.category}
                                </div>
                                {/* Show system on mobile */}
                                <div className="text-sm text-audit-cool md:hidden mt-1">
                                  {action.systemName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="hidden md:table-cell">
                            <div className="text-audit-deep">{action.systemName}</div>
                          </td>
                          <td className="hidden lg:table-cell">
                            <div className="text-audit-deep">{action.responsible || '-'}</div>
                          </td>
                          <td>
                            <div className={`${action.isOverdue ? 'text-red-600 font-medium' : 'text-audit-deep'}`}>
                              {formatDate(action.targetDate)}
                            </div>
                          </td>
                          <td>
                            {getStatusBadge(action.status)}
                          </td>
                          <td className="hidden sm:table-cell">
                            {getSeverityBadge(action.severity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-4 py-3 border-t border-audit-light flex items-center justify-between">
                    <div className="text-sm text-audit-cool">
                      {language === 'de' ? `Seite ${page} von ${totalPages}` : `Page ${page} of ${totalPages}`}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 text-sm font-medium text-audit-cool hover:text-audit-deep hover:bg-audit-bg rounded-audit disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {language === 'de' ? 'Zurück' : 'Previous'}
                      </button>
                      <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1 text-sm font-medium text-audit-cool hover:text-audit-deep hover:bg-audit-bg rounded-audit disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {language === 'de' ? 'Weiter' : 'Next'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* Charts View */
          chartData && <ActionCharts data={chartData} language={language} />
        )}
      </div>

      {/* Detail Panel */}
      {showDetailPanel && selectedAction && (
        <ActionDetailPanel
          action={selectedAction}
          language={language}
          onClose={() => {
            setShowDetailPanel(false);
            setSelectedAction(null);
          }}
          onUpdate={handleActionUpdate}
        />
      )}
    </div>
  );
};
