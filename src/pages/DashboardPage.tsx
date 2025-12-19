import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import auditService, { AuditData } from '../services/auditService';
import authService from '../services/authService';

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
  const [audits, setAudits] = useState<AuditData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const user = authService.getCurrentUser();

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

  const getRiskClassColor = (riskClass: string) => {
    switch (riskClass) {
      case 'PROHIBITED':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH_RISK':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'LIMITED_RISK':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'MINIMAL_RISK':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700',
      in_progress: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      archived: 'bg-purple-100 text-purple-700',
    };
    const labels = {
      draft: 'Entwurf',
      in_progress: 'In Bearbeitung',
      completed: 'Abgeschlossen',
      archived: 'Archiviert',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                EU AI Act Audit Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Willkommen, {user?.firstName} {user?.lastName}
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={onCreateAudit}>
                + Neues Audit erstellen
              </Button>
              <Button variant="secondary" onClick={onLogout}>
                Abmelden
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suche
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nach Titel oder Beschreibung suchen..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status filtern
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Alle Status</option>
                <option value="draft">Entwurf</option>
                <option value="in_progress">In Bearbeitung</option>
                <option value="completed">Abgeschlossen</option>
                <option value="archived">Archiviert</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Audits List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Audits werden geladen...</p>
          </div>
        ) : audits.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                Keine Audits gefunden
              </h3>
              <p className="mt-1 text-gray-500">
                Erstellen Sie Ihr erstes Audit, um loszulegen.
              </p>
              <div className="mt-6">
                <Button onClick={onCreateAudit}>+ Neues Audit erstellen</Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {audits.map((audit) => (
              <Card
                key={audit.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onOpenAudit(audit.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {audit.title}
                      </h3>
                      {getStatusBadge(audit.status)}
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getRiskClassColor(audit.riskClass)}`}>
                        {audit.riskClass.replace('_', ' ')}
                      </span>
                    </div>

                    {audit.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {audit.description}
                      </p>
                    )}

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                        <span>{audit.systemInfo.domain}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <span>
                          {audit.isOwner ? 'Erstellt von Ihnen' : `Geteilt von ${audit.owner?.firstName} ${audit.owner?.lastName}`}
                        </span>
                      </div>

                      {!audit.isOwner && audit.permission && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          <span className="capitalize">{audit.permission}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-6 text-right">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {audit.completionPercentage}%
                    </div>
                    <div className="text-xs text-gray-500">Fortschritt</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Erstellt: {new Date(audit.createdAt).toLocaleDateString('de-DE')}</span>
                    <span>Aktualisiert: {new Date(audit.updatedAt).toLocaleDateString('de-DE')}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
