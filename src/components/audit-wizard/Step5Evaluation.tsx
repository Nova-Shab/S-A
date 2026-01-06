import React from 'react';
import { useAuditWizard } from '../../context/AuditWizardContext';

// HIGH_RISK requirement titles (Art. 9-15)
const HIGH_RISK_TITLES: Record<string, string> = {
  risk_management: 'Risikomanagementsystem',
  data_governance: 'Daten-Governance',
  technical_documentation: 'Technische Dokumentation',
  record_keeping: 'Aufzeichnungspflichten',
  transparency: 'Transparenz und Information',
  human_oversight: 'Menschliche Aufsicht',
  accuracy: 'Genauigkeit, Robustheit, Cybersicherheit',
};

// LIMITED_RISK requirement titles (Art. 50)
const LIMITED_RISK_TITLES: Record<string, string> = {
  transparency_interaction: 'Transparenz bei KI-Interaktion',
  transparency_emotion: 'Emotionserkennung / Biometrische Kategorisierung',
  transparency_synthetic: 'Synthetische Inhalte kennzeichnen',
};

// MINIMAL_RISK voluntary best practices (Art. 95)
const MINIMAL_RISK_TITLES: Record<string, string> = {
  voluntary_ethics: 'Freiwillige Verhaltenskodizes',
  voluntary_documentation: 'Freiwillige Dokumentation',
  voluntary_fairness: 'Fairness & Nicht-Diskriminierung',
  voluntary_security: 'Sicherheit & Datenschutz',
  voluntary_oversight: 'Menschliche Aufsicht',
};

// Get requirement titles based on risk level
function getRequirementTitlesForRisk(riskLevel: 'HIGH_RISK' | 'LIMITED_RISK' | 'MINIMAL_RISK' | null | undefined): Record<string, string> {
  switch (riskLevel) {
    case 'HIGH_RISK':
      return HIGH_RISK_TITLES;
    case 'LIMITED_RISK':
      return LIMITED_RISK_TITLES;
    case 'MINIMAL_RISK':
      return MINIMAL_RISK_TITLES;
    default:
      return {};
  }
}

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
  const applicableRequirementTitles = getRequirementTitlesForRisk(riskLevel);
  const totalRequirementCount = Object.keys(applicableRequirementTitles).length;

  // Filter requirements to only those applicable to this risk level
  const applicableRequirements = requirements.filter(r =>
    applicableRequirementTitles[r.requirementId] !== undefined
  );

  // Calculate statistics based on applicable requirements
  const stats = {
    fulfilled: applicableRequirements.filter(r => r.status === 'fulfilled').length,
    partiallyFulfilled: applicableRequirements.filter(r => r.status === 'partially_fulfilled').length,
    notFulfilled: applicableRequirements.filter(r => r.status === 'not_fulfilled').length,
    notApplicable: applicableRequirements.filter(r => r.status === 'not_applicable').length,
    notAssessed: totalRequirementCount - applicableRequirements.filter(r => r.status !== 'not_assessed').length,
    documentsUploaded: applicableRequirements.reduce((acc, r) => acc + (r.documents?.length || 0), 0),
    withAiAnalysis: applicableRequirements.reduce(
      (acc, r) => acc + (r.documents?.filter(d => d.aiAnalysis).length || 0),
      0
    ),
  };

  const totalApplicable = totalRequirementCount - stats.notApplicable;
  const fulfillmentRate = totalApplicable > 0
    ? Math.round(((stats.fulfilled + stats.partiallyFulfilled * 0.5) / totalApplicable) * 100)
    : 0;

  const hasRequirements = totalRequirementCount > 0;

  // Identify gaps (only for applicable requirements)
  const gaps = applicableRequirements
    .filter(r => r.status === 'not_fulfilled' || r.status === 'partially_fulfilled')
    .map(r => ({
      requirementId: r.requirementId,
      title: applicableRequirementTitles[r.requirementId] || r.requirementId,
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

          {/* Statistics Grid - show for all risk levels with requirements */}
          {hasRequirements && (
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

      {/* Requirements Summary Table - show for all risk levels with requirements */}
      {hasRequirements && (
        <div className="audit-panel">
          <div className="audit-panel-header">
            <div className="flex items-center justify-between">
              <h3 className="text-h4 text-audit-deep mb-0">
                {riskLevel === 'HIGH_RISK' && 'Hochrisiko-Anforderungen (Art. 9-15)'}
                {riskLevel === 'LIMITED_RISK' && 'Transparenzpflichten (Art. 50)'}
                {riskLevel === 'MINIMAL_RISK' && 'Freiwillige Best Practices (Art. 95)'}
              </h3>
              {riskLevel === 'MINIMAL_RISK' && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-meta">
                  Freiwillig
                </span>
              )}
            </div>
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
                  {Object.entries(applicableRequirementTitles).map(([id, title]) => {
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

      {/* No Gaps Message - show for all risk levels with requirements */}
      {hasRequirements && gaps.length === 0 && stats.notAssessed === 0 && (
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

      {/* Open Assessments Warning - only show if there are requirements */}
      {hasRequirements && stats.notAssessed > 0 && (
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

      {/* PROHIBITED system warning */}
      {currentSystem.riskClassification?.isProhibited && (
        <div className="audit-panel border-2 border-red-500">
          <div className="audit-panel-body">
            <div className="bg-red-50 rounded-audit p-6">
              <div className="flex items-start">
                <svg className="w-8 h-8 text-red-600 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="text-h4 text-red-800 mb-2">Verbotene KI-Praktik</h3>
                  <p className="text-body text-red-700">
                    Dieses System wurde als verboten nach Art. 5 EU AI Act klassifiziert.
                    Ein Compliance-Audit ist nicht durchführbar. Das System darf in der EU nicht betrieben werden.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No requirements message for MINIMAL_RISK without voluntary audit */}
      {riskLevel === 'MINIMAL_RISK' && !hasRequirements && (
        <div className="audit-panel">
          <div className="audit-panel-body">
            <div className="bg-green-50 rounded-audit p-6">
              <div className="flex items-start">
                <svg className="w-8 h-8 text-green-600 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-h4 text-green-800 mb-2">Keine Pflichtanforderungen</h3>
                  <p className="text-body text-green-700">
                    Für Systeme mit minimalem Risiko bestehen keine spezifischen Pflichtanforderungen nach EU AI Act.
                    Das freiwillige Audit wurde nicht durchgeführt.
                  </p>
                </div>
              </div>
            </div>
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
