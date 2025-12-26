import React from 'react';
import { useAuditWizard } from '../../context/AuditWizardContext';

const REQUIREMENT_TITLES: Record<string, string> = {
  risk_management: 'Risikomanagementsystem',
  data_governance: 'Daten-Governance',
  technical_documentation: 'Technische Dokumentation',
  record_keeping: 'Aufzeichnungspflichten',
  transparency: 'Transparenz und Information',
  human_oversight: 'Menschliche Aufsicht',
  accuracy: 'Genauigkeit, Robustheit, Cybersicherheit',
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  fulfilled: { label: 'Erfüllt', color: 'text-audit-steel' },
  partially_fulfilled: { label: 'Teilweise', color: 'text-audit-cool' },
  not_fulfilled: { label: 'Nicht erfüllt', color: 'text-audit-deep' },
  not_applicable: { label: 'N/A', color: 'text-audit-light' },
  not_assessed: { label: 'Offen', color: 'text-audit-cool' },
};

export const Step5Evaluation: React.FC = () => {
  const { state, nextStep, prevStep } = useAuditWizard();
  const currentSystem = state.aiSystems[state.currentSystemIndex];

  if (!currentSystem) {
    return (
      <div className="audit-alert-info">
        <p>Kein KI-System ausgewählt.</p>
      </div>
    );
  }

  const requirements = currentSystem.requirements || [];
  const riskLevel = currentSystem.riskClassification?.riskLevel;

  // Calculate statistics
  const stats = {
    fulfilled: requirements.filter(r => r.status === 'fulfilled').length,
    partiallyFulfilled: requirements.filter(r => r.status === 'partially_fulfilled').length,
    notFulfilled: requirements.filter(r => r.status === 'not_fulfilled').length,
    notApplicable: requirements.filter(r => r.status === 'not_applicable').length,
    notAssessed: requirements.filter(r => r.status === 'not_assessed').length,
    documentsUploaded: requirements.reduce((acc, r) => acc + (r.documents?.length || 0), 0),
    withAiAnalysis: requirements.reduce(
      (acc, r) => acc + (r.documents?.filter(d => d.aiAnalysis).length || 0),
      0
    ),
  };

  const totalApplicable = 7 - stats.notApplicable;
  const fulfillmentRate = totalApplicable > 0
    ? Math.round(((stats.fulfilled + stats.partiallyFulfilled * 0.5) / totalApplicable) * 100)
    : 0;

  // Identify gaps
  const gaps = requirements
    .filter(r => r.status === 'not_fulfilled' || r.status === 'partially_fulfilled')
    .map(r => ({
      requirementId: r.requirementId,
      title: REQUIREMENT_TITLES[r.requirementId] || r.requirementId,
      status: r.status,
      comment: r.comment,
      documentCount: r.documents?.length || 0,
    }));

  return (
    <div className="space-y-8">
      {/* System Overview */}
      <div className="audit-panel">
        <div className="audit-panel-header">
          <div className="flex items-center justify-between">
            <h2 className="text-h3 text-audit-deep mb-0">Bewertungsergebnis</h2>
            <span className="px-3 py-1 bg-audit-bg text-audit-steel rounded-full text-meta">
              {currentSystem.name}
            </span>
          </div>
        </div>
        <div className="audit-panel-body">
          {/* Risk Classification Summary */}
          <div className="flex items-center mb-6 p-4 bg-audit-bg rounded-audit">
            <div className="w-12 h-12 rounded-full bg-audit-steel text-white flex items-center justify-center mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-meta text-audit-cool">Risikoklassifizierung</p>
              <p className="text-h4 text-audit-deep">
                {riskLevel === 'HIGH_RISK' && 'Hochrisiko-System'}
                {riskLevel === 'LIMITED_RISK' && 'Begrenztes Risiko'}
                {riskLevel === 'MINIMAL_RISK' && 'Minimales Risiko'}
                {currentSystem.riskClassification?.isProhibited && 'Verbotene Praktik'}
              </p>
            </div>
          </div>

          {/* Statistics Grid */}
          {riskLevel === 'HIGH_RISK' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-audit-bg rounded-audit text-center">
                <p className="text-h2 text-audit-steel">{fulfillmentRate}%</p>
                <p className="text-meta text-audit-cool">Erfüllungsgrad</p>
              </div>
              <div className="p-4 bg-audit-bg rounded-audit text-center">
                <p className="text-h2 text-audit-deep">{stats.fulfilled}</p>
                <p className="text-meta text-audit-cool">Erfüllt</p>
              </div>
              <div className="p-4 bg-audit-bg rounded-audit text-center">
                <p className="text-h2 text-audit-cool">{stats.partiallyFulfilled + stats.notFulfilled}</p>
                <p className="text-meta text-audit-cool">Mit Lücken</p>
              </div>
              <div className="p-4 bg-audit-bg rounded-audit text-center">
                <p className="text-h2 text-audit-steel">{stats.documentsUploaded}</p>
                <p className="text-meta text-audit-cool">Dokumente</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Requirements Summary Table */}
      {riskLevel === 'HIGH_RISK' && (
        <div className="audit-panel">
          <div className="audit-panel-header">
            <h3 className="text-h4 text-audit-deep mb-0">Anforderungsübersicht</h3>
          </div>
          <div className="audit-panel-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-audit-bg">
                  <tr>
                    <th className="px-4 py-3 text-left text-label text-audit-steel">Anforderung</th>
                    <th className="px-4 py-3 text-center text-label text-audit-steel">Status</th>
                    <th className="px-4 py-3 text-center text-label text-audit-steel">Dokumente</th>
                    <th className="px-4 py-3 text-left text-label text-audit-steel">Anmerkung</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-audit-light">
                  {Object.entries(REQUIREMENT_TITLES).map(([id, title]) => {
                    const req = requirements.find(r => r.requirementId === id);
                    const status = req?.status || 'not_assessed';
                    const statusInfo = STATUS_LABELS[status];

                    return (
                      <tr key={id} className="hover:bg-audit-bg/50">
                        <td className="px-4 py-3 text-body text-audit-deep">{title}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-body text-audit-cool">
                          {req?.documents?.length || 0}
                        </td>
                        <td className="px-4 py-3 text-meta text-audit-cool max-w-xs truncate">
                          {req?.comment || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Identified Gaps */}
      {gaps.length > 0 && (
        <div className="audit-panel">
          <div className="audit-panel-header">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-audit-steel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-h4 text-audit-deep mb-0">Identifizierte Lücken ({gaps.length})</h3>
            </div>
          </div>
          <div className="audit-panel-body">
            <div className="space-y-4">
              {gaps.map((gap) => (
                <div
                  key={gap.requirementId}
                  className={`p-4 rounded-audit border-l-4 ${
                    gap.status === 'not_fulfilled'
                      ? 'bg-audit-bg border-audit-deep'
                      : 'bg-audit-bg border-audit-cool'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-label text-audit-deep">{gap.title}</h4>
                      <p className="text-meta text-audit-cool mt-1">
                        Status: {STATUS_LABELS[gap.status].label}
                        {gap.documentCount > 0 && ` | ${gap.documentCount} Dokument(e)`}
                      </p>
                      {gap.comment && (
                        <p className="text-body text-audit-cool mt-2">{gap.comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No Gaps Message */}
      {riskLevel === 'HIGH_RISK' && gaps.length === 0 && stats.notAssessed === 0 && (
        <div className="p-6 bg-audit-bg rounded-audit border-l-4 border-audit-steel">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-audit-steel mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-h4 text-audit-deep">Alle Anforderungen erfüllt</h4>
              <p className="text-body text-audit-cool">
                Alle geprüften Anforderungen wurden als erfüllt oder nicht anwendbar bewertet.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Open Assessments Warning */}
      {stats.notAssessed > 0 && (
        <div className="audit-alert-info">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-audit-steel mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-body text-audit-deep">
                <strong>{stats.notAssessed} Anforderung(en)</strong> wurden noch nicht bewertet.
              </p>
              <p className="text-body text-audit-cool mt-1">
                Sie können fortfahren, aber für einen vollständigen Bericht sollten alle Anforderungen bewertet werden.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Limited/Minimal Risk Summary */}
      {(riskLevel === 'LIMITED_RISK' || riskLevel === 'MINIMAL_RISK') && (
        <div className="audit-panel">
          <div className="audit-panel-body">
            {riskLevel === 'LIMITED_RISK' ? (
              <div className="space-y-4">
                <h3 className="text-h4 text-audit-deep">Transparenzpflichten (Art. 50)</h3>
                <p className="text-body text-audit-cool">
                  Für Systeme mit begrenztem Risiko gelten folgende Transparenzpflichten:
                </p>
                <ul className="space-y-2 text-body text-audit-cool">
                  <li className="flex items-start">
                    <svg className="w-4 h-4 mr-2 mt-1 text-audit-steel" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Personen müssen informiert werden, wenn sie mit einem KI-System interagieren
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 mr-2 mt-1 text-audit-steel" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    KI-generierte Inhalte müssen als solche gekennzeichnet werden
                  </li>
                </ul>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-h4 text-audit-deep">Minimales Risiko</h3>
                <p className="text-body text-audit-cool">
                  Für Systeme mit minimalem Risiko bestehen keine spezifischen Anforderungen nach EU AI Act.
                  Es wird jedoch empfohlen, freiwillige Verhaltenskodizes zu befolgen.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={prevStep}
          className="audit-btn-secondary flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Zurück zur Prüfung
        </button>
        <button
          onClick={nextStep}
          className="audit-btn-primary flex items-center"
        >
          Weiter zu Maßnahmen
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Step5Evaluation;
