import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { RiskBadge, RiskDot } from '../components/RiskBadge';
import { getRiskLabel, getRiskChartColor, RISK_DESIGN_TOKENS } from '../utils/riskDesignTokens';
import auditService, { AuditData } from '../services/auditService';
import authService from '../services/authService';
import { useSystems } from '../context/SystemsContext';
import { SYSTEM_STATUS_CONFIG } from '../models/types';
import api from '../services/api';

interface DashboardPageProps {
  onCreateAudit: () => void;
  onOpenAudit: (auditId: number) => void;
  onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onCreateAudit,
  onOpenAudit,
  onLogout,
}) => {
  const navigate = useNavigate();
  const [audits, setAudits] = useState<AuditData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [quickScanText, setQuickScanText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const user = authService.getCurrentUser();
  const { systems, stats } = useSystems();

  const handleQuickScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setScanError(null);

    if (!quickScanText.trim()) {
      setScanError('Bitte geben Sie eine Beschreibung ein.');
      return;
    }

    if (quickScanText.trim().length < 50) {
      setScanError('Die Beschreibung sollte mindestens 50 Zeichen lang sein.');
      return;
    }

    setIsScanning(true);

    try {
      const response = await api.post('/scanner/analyze', {
        inputType: 'description',
        inputValue: quickScanText,
        systemName: 'Schnell-Scan',
      });

      if (response.data.success) {
        navigate('/scanner', { state: { scanResult: response.data } });
      }
    } catch {
      setScanError('Fehler bei der Analyse. Bitte versuchen Sie es erneut.');
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    loadAudits();
  }, [statusFilter, searchTerm]);

  const loadAudits = async () => {
    try {
      setLoading(true);
      const response = await auditService.getAudits({
        status: statusFilter || undefined,
        search: searchTerm || undefined,
      });
      setAudits(response.audits);
    } catch (error) {
      console.error('Fehler beim Laden der Audits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAudit = async (id: number | null) => {
    if (id === null) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await auditService.deleteAudit(id);
      // Optimistic update - remove from list immediately
      setAudits(prev => prev.filter(audit => audit.id !== id));
      setDeleteConfirmId(null);
      setSuccessMessage('Audit wurde erfolgreich gelöscht.');
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Fehler beim Löschen des Audits:', error);
      const errorMessage = error?.response?.data?.error ||
                          error?.message ||
                          'Fehler beim Löschen des Audits. Bitte versuchen Sie es erneut.';
      setDeleteError(errorMessage);
      // Keep modal open on error so user can retry
    } finally {
      setIsDeleting(false);
    }
  };

  // Design system: Neutral status badges
  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'audit-badge',
      in_progress: 'audit-badge border-audit-steel',
      completed: 'audit-badge border-audit-deep',
      archived: 'audit-badge border-audit-cool',
    };
    const labels = {
      draft: 'Entwurf',
      in_progress: 'In Bearbeitung',
      completed: 'Abgeschlossen',
      archived: 'Archiviert',
    };
    return (
      <span className={styles[status as keyof typeof styles] || 'audit-badge'}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-audit-bg">
      {/* Toast Notifications */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="audit-page-header">
        <div className="audit-container">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-h1 text-audit-deep">
                EU AI Act Audit Dashboard
              </h1>
              <p className="text-body text-audit-cool mt-1">
                Willkommen, {user?.firstName} {user?.lastName}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="audit-container py-6 lg:py-8">
        {/* Scanner Quick Access Widget - Design System */}
        <div className="audit-scanner-widget mb-6">
          <div className="flex flex-col gap-4">
            {/* Header Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-8 h-8 mr-3 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <div>
                  <h2 className="text-h3 text-white">KI-System Scanner</h2>
                  <p className="text-white/70 text-meta">
                    EU AI Act Risikoanalyse
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/scanner')}
                className="audit-btn bg-white/10 border border-white/30 text-white hover:bg-white/20"
              >
                Erweiterte Analyse
              </button>
            </div>

            {/* Input Row - Full Width */}
            <form onSubmit={handleQuickScan} className="w-full">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={quickScanText}
                    onChange={(e) => setQuickScanText(e.target.value)}
                    placeholder="Beschreiben Sie Ihr KI-System kurz, z.B.: Chatbot für Kundenservice mit automatischer Antwortgenerierung..."
                    className="audit-scanner-input w-full"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isScanning}
                  className="audit-btn bg-white text-audit-deep hover:bg-audit-bg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isScanning ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Analysiere...
                    </>
                  ) : (
                    'Schnell-Scan'
                  )}
                </button>
              </div>
              {scanError && (
                <div className="mt-2 p-3 bg-white/10 border-l-4 border-white/40 rounded-audit text-white/90 text-sm">
                  {scanError}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Create Audit - Prominent Hero Section */}
        <div className="mb-6 p-6 bg-white rounded-audit shadow-audit border border-audit-light">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-audit-steel/10 rounded-audit flex items-center justify-center">
                  <svg className="w-5 h-5 text-audit-steel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h2 className="text-h2 text-audit-deep">
                  Neues Audit erstellen
                </h2>
              </div>
              <p className="text-body text-audit-cool max-w-2xl">
                Starten Sie eine EU AI Act Compliance-Prüfung für Ihr KI-System.
              </p>
              <div className="flex flex-wrap gap-4 mt-3 text-meta text-audit-steel">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Risikoklassifizierung
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Compliance-Checkliste
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Maßnahmenplan
                </span>
              </div>
            </div>

            <div className="flex-shrink-0">
              <button
                onClick={onCreateAudit}
                className="audit-btn-primary audit-btn-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Audit starten
              </button>
            </div>
          </div>
        </div>

        {/* Systems Overview - Design System */}
        {systems.length > 0 && (
          <div className="audit-panel mb-6">
            <div className="audit-panel-header">
              <div className="flex items-center justify-between">
                <h2 className="text-h3 text-audit-deep mb-0">
                  KI-Systeme Übersicht
                </h2>
                <button onClick={() => navigate('/systems')} className="audit-btn-secondary">
                  Alle Systeme verwalten
                </button>
              </div>
            </div>
            <div className="audit-panel-body">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                <div className="bg-audit-bg rounded-audit p-4 text-center">
                  <div className="text-2xl font-semibold text-audit-deep">{stats.totalSystems}</div>
                  <div className="text-meta text-audit-cool">Systeme</div>
                </div>
                <div className="bg-audit-bg rounded-audit p-4 text-center">
                  <div className="text-2xl font-semibold text-audit-deep">{stats.byStatus.COMPLIANT}</div>
                  <div className="text-meta text-audit-cool">Konform</div>
                </div>
                <div className="bg-audit-bg rounded-audit p-4 text-center">
                  <div className="text-2xl font-semibold text-audit-steel">{stats.byStatus.NON_COMPLIANT}</div>
                  <div className="text-meta text-audit-cool">Nicht konform</div>
                </div>
                <div className="bg-audit-bg rounded-audit p-4 text-center">
                  <div className="text-2xl font-semibold text-audit-steel">{stats.byRiskClass.HIGH_RISK}</div>
                  <div className="text-meta text-audit-cool">Hochrisiko</div>
                </div>
                <div className="bg-audit-bg rounded-audit p-4 text-center">
                  <div className="text-2xl font-semibold text-audit-steel">{stats.systemsRequiringAction}</div>
                  <div className="text-meta text-audit-cool">Handlungsbedarf</div>
                </div>
                <div className="bg-audit-bg rounded-audit p-4 text-center">
                  <div className="text-2xl font-semibold text-audit-deep">{stats.upcomingAudits}</div>
                  <div className="text-meta text-audit-cool">Audits fällig</div>
                </div>
              </div>

              {/* Systems requiring attention - neutral styling */}
              {stats.systemsRequiringAction > 0 && (
                <div className="audit-alert-info">
                  <h3 className="text-label text-audit-steel mb-2">
                    Systeme mit Handlungsbedarf
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {systems
                      .filter(s => s.status === 'NON_COMPLIANT' || s.status === 'UNDER_REVIEW')
                      .slice(0, 5)
                      .map(s => (
                        <button
                          key={s.id}
                          onClick={() => navigate(`/systems/${s.id}`)}
                          className="inline-flex items-center px-3 py-1.5 bg-white border border-audit-light rounded-audit text-sm text-audit-deep hover:bg-audit-bg transition-colors"
                        >
                          <span className={`w-2 h-2 rounded-full mr-2 ${SYSTEM_STATUS_CONFIG[s.status].bgColor}`}></span>
                          {s.systemInfo.systemName || 'Unbenannt'}
                          {s.riskClass && (
                            <RiskBadge riskClass={s.riskClass} size="xs" className="ml-2" />
                          )}
                        </button>
                      ))
                    }
                    {stats.systemsRequiringAction > 5 && (
                      <button
                        onClick={() => navigate('/systems')}
                        className="text-sm text-audit-steel hover:text-audit-deep underline"
                      >
                        +{stats.systemsRequiringAction - 5} weitere
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty state for no systems */}
        {systems.length === 0 && (
          <div className="audit-panel mb-6">
            <div className="audit-panel-body">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-h3 text-audit-deep mb-1">
                    KI-Systeme Verwaltung
                  </h2>
                  <p className="text-body text-audit-cool">
                    Registrieren Sie Ihre KI-Systeme für eine zentrale EU AI Act Compliance-Verwaltung.
                  </p>
                </div>
                <button onClick={() => navigate('/systems')} className="audit-btn-primary">
                  System registrieren
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================
            SECTION: Aktive Audit-Prozesse
            ================================================ */}
        <div className="mt-10 pt-8 border-t border-audit-light">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-h2 text-audit-deep">Aktive Audit-Prozesse</h2>
              <p className="text-body text-audit-cool mt-1">
                Übersicht aller laufenden und abgeschlossenen Compliance-Prüfungen
              </p>
            </div>
            <div className="text-meta text-audit-cool">
              {audits.length} {audits.length === 1 ? 'Audit' : 'Audits'} gefunden
            </div>
          </div>

          {/* Filters */}
          <div className="audit-card mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="audit-label">
                  Suche
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nach Titel oder Beschreibung suchen..."
                  className="audit-input"
                />
              </div>
              <div>
                <label className="audit-label">
                  Status filtern
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="audit-input"
                >
                  <option value="">Alle Status</option>
                  <option value="draft">Entwurf</option>
                  <option value="in_progress">In Bearbeitung</option>
                  <option value="completed">Abgeschlossen</option>
                  <option value="archived">Archiviert</option>
                </select>
              </div>
            </div>
          </div>

          {/* Audits List */}
          {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-audit-steel border-r-transparent"></div>
            <p className="mt-4 text-audit-cool">Audits werden geladen...</p>
          </div>
        ) : audits.length === 0 ? (
          <div className="audit-card">
            <div className="text-center py-8">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-4 text-h3 text-audit-deep">
                Noch keine Audits vorhanden
              </h3>
              <p className="mt-2 text-body text-audit-cool">
                Nutzen Sie den Bereich oben, um Ihr erstes Audit zu starten.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {audits.map((audit) => (
              <div
                key={audit.id}
                className="audit-card hover:shadow-audit-lg transition-shadow cursor-pointer"
                onClick={() => onOpenAudit(audit.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-h4 text-audit-deep">
                        {audit.title}
                      </h3>
                      {getStatusBadge(audit.status)}
                      <RiskBadge riskClass={audit.riskClass} size="sm" />
                    </div>

                    {audit.description && (
                      <p className="text-body text-audit-cool mb-3 line-clamp-2">
                        {audit.description}
                      </p>
                    )}

                    <div className="audit-meta">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                        <span>{audit.systemInfo.domain}</span>
                      </div>

                      <span className="text-audit-light">•</span>

                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <span>
                          {audit.isOwner ? 'Erstellt von Ihnen' : `Geteilt von ${audit.owner?.firstName} ${audit.owner?.lastName}`}
                        </span>
                      </div>

                      {!audit.isOwner && audit.permission && (
                        <>
                          <span className="text-audit-light">•</span>
                          <span className="capitalize">{audit.permission}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="ml-6 text-right">
                    <div className="text-3xl font-semibold text-audit-deep mb-1">
                      {audit.completionPercentage}%
                    </div>
                    <div className="text-meta text-audit-cool">Fortschritt</div>
                    {/* Progress bar */}
                    <div className="audit-progress mt-2 w-20">
                      <div
                        className="audit-progress-bar"
                        style={{ width: `${audit.completionPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="audit-divider"></div>
                <div className="flex items-center justify-between text-meta text-audit-cool">
                  <div className="flex items-center gap-4">
                    <span>Erstellt: {new Date(audit.createdAt).toLocaleDateString('de-DE')}</span>
                    <span>Aktualisiert: {new Date(audit.updatedAt).toLocaleDateString('de-DE')}</span>
                  </div>
                  {audit.isOwner && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(audit.id);
                      }}
                      className="p-2 text-audit-cool hover:text-red-600 hover:bg-red-50 rounded-audit transition-colors"
                      title="Audit löschen"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
        {/* End: Aktive Audit-Prozesse Section */}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Audit löschen?
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Möchten Sie dieses Audit wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {deleteError}
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setDeleteConfirmId(null);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
              >
                Abbrechen
              </Button>
              <button
                onClick={() => handleDeleteAudit(deleteConfirmId)}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Löschen...
                  </>
                ) : (
                  'Löschen'
                )}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
