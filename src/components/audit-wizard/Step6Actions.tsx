import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuditWizard, AuditVersion } from '../../context/AuditWizardContext';

const REQUIREMENT_TITLES: Record<string, string> = {
  risk_management: 'Risikomanagementsystem',
  data_governance: 'Daten-Governance',
  technical_documentation: 'Technische Dokumentation',
  record_keeping: 'Aufzeichnungspflichten',
  transparency: 'Transparenz und Information',
  human_oversight: 'Menschliche Aufsicht',
  accuracy: 'Genauigkeit, Robustheit, Cybersicherheit',
};

const ACTION_RECOMMENDATIONS: Record<string, string[]> = {
  risk_management: [
    'Risikomanagement-Framework etablieren oder erweitern',
    'Risikoregister für KI-Systeme anlegen',
    'Regelmäßige Risikobewertungen einplanen',
    'Risikominderungsmaßnahmen dokumentieren',
  ],
  data_governance: [
    'Datenqualitätsrichtlinien definieren',
    'Datendokumentation vervollständigen',
    'Bias-Analyse durchführen',
    'Datenherkunft dokumentieren',
  ],
  technical_documentation: [
    'Technische Dokumentation erstellen/aktualisieren',
    'Systembeschreibung vervollständigen',
    'Entwicklungsprozess dokumentieren',
    'Änderungshistorie führen',
  ],
  record_keeping: [
    'Logging-Konzept erstellen',
    'Log-Aufbewahrungsrichtlinien definieren',
    'Automatische Protokollierung implementieren',
    'Audit-Trail sicherstellen',
  ],
  transparency: [
    'Gebrauchsanweisung erstellen',
    'Nutzerdokumentation vervollständigen',
    'Leistungsgrenzen kommunizieren',
    'Transparenzhinweise implementieren',
  ],
  human_oversight: [
    'Aufsichtspersonal benennen und schulen',
    'Eingriffsmöglichkeiten definieren',
    'Notfall-Stopp-Mechanismen implementieren',
    'Eskalationsprozesse etablieren',
  ],
  accuracy: [
    'Genauigkeitsmetriken definieren und messen',
    'Robustheitstests durchführen',
    'Cybersicherheitsaudit durchführen',
    'Penetrationstests planen',
  ],
};

export const Step6Actions: React.FC = () => {
  const navigate = useNavigate();
  const { state, updateAISystem, updateState } = useAuditWizard();
  const currentSystem = state.aiSystems[state.currentSystemIndex];
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!currentSystem) {
    return (
      <div className="audit-alert-info">
        <p>Kein KI-System ausgewählt.</p>
      </div>
    );
  }

  const requirements = currentSystem.requirements || [];
  const gaps = requirements.filter(
    r => r.status === 'not_fulfilled' || r.status === 'partially_fulfilled'
  );

  // Calculate fulfillment rate
  const totalApplicable = requirements.filter(r => r.status !== 'not_applicable').length || 7;
  const fulfilled = requirements.filter(r => r.status === 'fulfilled').length;
  const partial = requirements.filter(r => r.status === 'partially_fulfilled').length;
  const fulfillmentRate = Math.round(((fulfilled + partial * 0.5) / totalApplicable) * 100);

  const handleSaveVersion = async () => {
    setIsSaving(true);

    const newVersion: AuditVersion = {
      version: (currentSystem.auditHistory?.length || 0) + 1,
      createdAt: new Date().toISOString(),
      status: 'completed',
      fulfillmentRate,
      openGaps: gaps.length,
      snapshot: {
        requirements: currentSystem.requirements,
        riskClassification: currentSystem.riskClassification,
      },
    };

    updateAISystem(currentSystem.id, {
      auditHistory: [...(currentSystem.auditHistory || []), newVersion],
    });

    // Mark audit as completed if all systems are done
    const allSystemsComplete = state.aiSystems.every(
      sys => sys.auditHistory && sys.auditHistory.length > 0
    );

    if (allSystemsComplete) {
      updateState({ status: 'completed' });
    }

    // Save to localStorage
    localStorage.setItem(`audit-${state.id}`, JSON.stringify(state));

    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
    }, 1000);
  };

  const generateMarkdownReport = (): string => {
    const now = new Date().toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let md = `# EU AI Act Audit-Bericht\n\n`;
    md += `**Erstellt am:** ${now}\n\n`;
    md += `---\n\n`;

    // Company Context
    md += `## 1. Unternehmenskontext\n\n`;
    md += `- **Unternehmensgröße:** ${state.companyContext.companySize || 'Nicht angegeben'}\n`;
    md += `- **Standort:** ${state.companyContext.location || 'Nicht angegeben'}\n`;
    md += `- **Branche:** ${state.companyContext.industry || 'Nicht angegeben'}\n`;
    md += `- **EU AI Act anwendbar:** ${state.companyContext.euAiActRelevant ? 'Ja' : 'Nein'}\n\n`;

    // AI System
    md += `## 2. KI-System: ${currentSystem.name}\n\n`;
    md += `**Beschreibung:** ${currentSystem.description}\n\n`;
    md += `**Einsatzbereich:** ${currentSystem.deploymentArea}\n\n`;
    if (currentSystem.isThirdParty) {
      md += `**Drittanbieter:** ${currentSystem.vendor}\n\n`;
    }

    // Risk Classification
    md += `## 3. Risikoklassifizierung\n\n`;
    if (currentSystem.riskClassification?.isProhibited) {
      md += `**Ergebnis:** ⛔ VERBOTENE PRAKTIK\n\n`;
      md += `**Grund:** ${currentSystem.riskClassification.prohibitedReason}\n\n`;
    } else {
      const riskLabels: Record<string, string> = {
        HIGH_RISK: 'Hochrisiko-System',
        LIMITED_RISK: 'Begrenztes Risiko',
        MINIMAL_RISK: 'Minimales Risiko',
      };
      const riskLabel = riskLabels[currentSystem.riskClassification?.riskLevel || ''] || 'Nicht klassifiziert';

      md += `**Ergebnis:** ${riskLabel}\n\n`;
    }

    // Requirements Assessment (for high-risk)
    if (currentSystem.riskClassification?.riskLevel === 'HIGH_RISK') {
      md += `## 4. Anforderungsprüfung\n\n`;
      md += `**Erfüllungsgrad:** ${fulfillmentRate}%\n\n`;
      md += `| Anforderung | Status | Dokumente |\n`;
      md += `|-------------|--------|----------|\n`;

      Object.entries(REQUIREMENT_TITLES).forEach(([id, title]) => {
        const req = requirements.find(r => r.requirementId === id);
        const statusLabel = {
          fulfilled: '✓ Erfüllt',
          partially_fulfilled: '◐ Teilweise',
          not_fulfilled: '✗ Nicht erfüllt',
          not_applicable: '- N/A',
          not_assessed: '○ Offen',
        }[req?.status || 'not_assessed'];
        const docCount = req?.documents?.length || 0;
        md += `| ${title} | ${statusLabel} | ${docCount} |\n`;
      });
      md += `\n`;

      // Gaps and Actions
      if (gaps.length > 0) {
        md += `## 5. Identifizierte Lücken & Maßnahmen\n\n`;
        gaps.forEach((gap, idx) => {
          const title = REQUIREMENT_TITLES[gap.requirementId] || gap.requirementId;
          const actions = ACTION_RECOMMENDATIONS[gap.requirementId] || [];

          md += `### ${idx + 1}. ${title}\n\n`;
          md += `**Status:** ${gap.status === 'not_fulfilled' ? 'Nicht erfüllt' : 'Teilweise erfüllt'}\n\n`;
          if (gap.comment) {
            md += `**Anmerkung:** ${gap.comment}\n\n`;
          }
          md += `**Empfohlene Maßnahmen:**\n\n`;
          actions.forEach(action => {
            md += `- [ ] ${action}\n`;
          });
          md += `\n`;
        });
      }
    }

    md += `---\n\n`;
    md += `*Dieser Bericht wurde automatisch generiert und ersetzt keine Rechtsberatung.*\n`;
    md += `*Audit-ID: ${state.id}*\n`;

    return md;
  };

  const handleExportMarkdown = () => {
    const markdown = generateMarkdownReport();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eu-ai-act-audit-${currentSystem.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNewAudit = () => {
    navigate('/audit-wizard');
  };

  const handleBackToDashboard = () => {
    navigate('/');
  };

  return (
    <div className="space-y-8">
      {/* Summary Header */}
      <div className="audit-panel">
        <div className="audit-panel-header">
          <h2 className="text-h3 text-audit-deep mb-0">Maßnahmen & Abschluss</h2>
        </div>
        <div className="audit-panel-body">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-audit-steel text-white flex items-center justify-center mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-meta text-audit-cool">Audit für</p>
                <h3 className="text-h4 text-audit-deep">{currentSystem.name}</h3>
              </div>
            </div>
            {currentSystem.riskClassification?.riskLevel === 'HIGH_RISK' && (
              <div className="text-right">
                <p className="text-h2 text-audit-steel">{fulfillmentRate}%</p>
                <p className="text-meta text-audit-cool">Erfüllungsgrad</p>
              </div>
            )}
          </div>

          {saveSuccess && (
            <div className="p-4 bg-audit-bg border-l-4 border-audit-steel rounded-audit mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-audit-steel mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-body text-audit-deep font-medium">
                    Audit-Version erfolgreich gespeichert
                  </p>
                  <p className="text-meta text-audit-cool">
                    Version {(currentSystem.auditHistory?.length || 0)} | {new Date().toLocaleDateString('de-DE')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Plan */}
      {gaps.length > 0 && currentSystem.riskClassification?.riskLevel === 'HIGH_RISK' && (
        <div className="audit-panel">
          <div className="audit-panel-header">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-audit-steel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <h3 className="text-h4 text-audit-deep mb-0">Maßnahmenkatalog ({gaps.length} Lücken)</h3>
            </div>
          </div>
          <div className="audit-panel-body">
            <div className="space-y-6">
              {gaps.map((gap, idx) => {
                const title = REQUIREMENT_TITLES[gap.requirementId] || gap.requirementId;
                const actions = ACTION_RECOMMENDATIONS[gap.requirementId] || [];

                return (
                  <div key={gap.requirementId} className="pb-6 border-b border-audit-light last:border-0 last:pb-0">
                    <div className="flex items-start">
                      <span className="w-6 h-6 rounded-full bg-audit-steel text-white text-sm flex items-center justify-center mr-3 flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <h4 className="text-label text-audit-deep">{title}</h4>
                        <p className="text-meta text-audit-cool mb-3">
                          {gap.status === 'not_fulfilled' ? 'Nicht erfüllt' : 'Teilweise erfüllt'}
                          {gap.comment && ` – ${gap.comment}`}
                        </p>

                        <div className="bg-audit-bg p-4 rounded-audit">
                          <p className="text-meta text-audit-steel font-medium mb-2">
                            Empfohlene Maßnahmen:
                          </p>
                          <ul className="space-y-2">
                            {actions.map((action, actionIdx) => (
                              <li key={actionIdx} className="flex items-start text-body text-audit-cool">
                                <input
                                  type="checkbox"
                                  className="mt-1 mr-3"
                                  id={`action-${gap.requirementId}-${actionIdx}`}
                                />
                                <label htmlFor={`action-${gap.requirementId}-${actionIdx}`}>
                                  {action}
                                </label>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* No Gaps Message */}
      {gaps.length === 0 && currentSystem.riskClassification?.riskLevel === 'HIGH_RISK' && (
        <div className="p-6 bg-audit-bg rounded-audit border-l-4 border-audit-steel">
          <div className="flex items-center">
            <svg className="w-8 h-8 text-audit-steel mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-h4 text-audit-deep">Keine Maßnahmen erforderlich</h4>
              <p className="text-body text-audit-cool">
                Alle geprüften Anforderungen wurden als erfüllt oder nicht anwendbar bewertet.
                Es sind keine weiteren Maßnahmen notwendig.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Audit History */}
      {currentSystem.auditHistory && currentSystem.auditHistory.length > 0 && (
        <div className="audit-panel">
          <div className="audit-panel-header">
            <h3 className="text-h4 text-audit-deep mb-0">Audit-Versionen</h3>
          </div>
          <div className="audit-panel-body">
            <div className="space-y-3">
              {currentSystem.auditHistory.map((version) => (
                <div key={version.version} className="flex items-center justify-between p-3 bg-audit-bg rounded-audit">
                  <div className="flex items-center">
                    <span className="w-8 h-8 rounded-full bg-audit-steel text-white text-sm flex items-center justify-center mr-3">
                      v{version.version}
                    </span>
                    <div>
                      <p className="text-body text-audit-deep">
                        {new Date(version.createdAt).toLocaleDateString('de-DE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-meta text-audit-cool">
                        {version.fulfillmentRate}% Erfüllung | {version.openGaps} offene Lücken
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    version.status === 'completed'
                      ? 'bg-audit-steel text-white'
                      : 'bg-audit-light text-audit-cool'
                  }`}>
                    {version.status === 'completed' ? 'Abgeschlossen' : 'In Bearbeitung'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="audit-panel">
        <div className="audit-panel-header">
          <h3 className="text-h4 text-audit-deep mb-0">Export & Speichern</h3>
        </div>
        <div className="audit-panel-body">
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={handleSaveVersion}
              disabled={isSaving}
              className="audit-btn-primary flex items-center justify-center"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Speichern...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Version speichern
                </>
              )}
            </button>

            <button
              onClick={handleExportMarkdown}
              className="audit-btn-secondary flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Als Markdown exportieren
            </button>

            <button
              onClick={handlePrint}
              className="audit-btn-secondary flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Drucken
            </button>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="flex justify-between pt-4">
        <button
          onClick={handleBackToDashboard}
          className="audit-btn-secondary flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Zum Dashboard
        </button>
        <button
          onClick={handleNewAudit}
          className="audit-btn-primary flex items-center"
        >
          Neues Audit starten
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Step6Actions;
