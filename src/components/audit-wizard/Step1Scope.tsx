import React, { useState, useEffect } from 'react';
import { useAuditWizard, CompanyContext } from '../../context/AuditWizardContext';

const COMPANY_SIZES = [
  { value: 'micro', label: 'Kleinstunternehmen', description: '< 10 Mitarbeiter, < 2 Mio. EUR Umsatz' },
  { value: 'small', label: 'Kleinunternehmen', description: '< 50 Mitarbeiter, < 10 Mio. EUR Umsatz' },
  { value: 'medium', label: 'Mittleres Unternehmen', description: '< 250 Mitarbeiter, < 50 Mio. EUR Umsatz' },
  { value: 'large', label: 'Großunternehmen', description: '≥ 250 Mitarbeiter oder ≥ 50 Mio. EUR Umsatz' },
];

const LOCATIONS = [
  { value: 'eu', label: 'In der EU ansässig', description: 'Hauptsitz in einem EU-Mitgliedstaat' },
  { value: 'non_eu_with_eu_market', label: 'Außerhalb EU, aber EU-Markt', description: 'Produkte/Dienstleistungen werden in der EU angeboten' },
  { value: 'non_eu', label: 'Außerhalb EU, kein EU-Markt', description: 'Keine Geschäftstätigkeit in der EU' },
];

const INDUSTRIES = [
  'Gesundheitswesen',
  'Finanzdienstleistungen',
  'Öffentlicher Sektor',
  'Bildung',
  'Transport & Logistik',
  'Fertigung & Industrie',
  'Einzelhandel & E-Commerce',
  'Energie & Versorgung',
  'Telekommunikation',
  'Rechtswesen',
  'Personalwesen / HR',
  'Sicherheit & Überwachung',
  'Sonstige',
];

export const Step1Scope: React.FC = () => {
  const { state, updateCompanyContext, nextStep, prevStep } = useAuditWizard();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showRelevanceResult, setShowRelevanceResult] = useState(false);

  const context = state.companyContext;

  // Check EU AI Act relevance based on context
  useEffect(() => {
    if (context.companySize && context.location) {
      const isRelevant = context.location !== 'non_eu';
      let reason = '';

      if (context.location === 'eu') {
        reason = 'Als in der EU ansässiges Unternehmen unterliegen Sie dem EU AI Act.';
      } else if (context.location === 'non_eu_with_eu_market') {
        reason = 'Da Sie KI-Systeme in der EU anbieten oder deren Outputs in der EU nutzen, unterliegen Sie dem EU AI Act.';
      } else {
        reason = 'Ohne EU-Bezug unterliegen Sie nicht dem EU AI Act. Beachten Sie jedoch mögliche zukünftige Änderungen.';
      }

      updateCompanyContext({
        euAiActRelevant: isRelevant,
        relevanceReason: reason,
      });
      setShowRelevanceResult(true);
    }
  }, [context.companySize, context.location]);

  const validateAndProceed = () => {
    const newErrors: Record<string, string> = {};

    if (!context.companySize) {
      newErrors.companySize = 'Bitte wählen Sie die Unternehmensgröße aus.';
    }
    if (!context.location) {
      newErrors.location = 'Bitte wählen Sie den Standort aus.';
    }
    if (!context.industry) {
      newErrors.industry = 'Bitte wählen Sie die Branche aus.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      nextStep();
    }
  };

  return (
    <div className="space-y-8">
      {/* Company Size */}
      <div className="audit-panel">
        <div className="audit-panel-header">
          <h2 className="text-h3 text-audit-deep mb-0">Unternehmensgröße</h2>
        </div>
        <div className="audit-panel-body">
          <p className="text-body text-audit-cool mb-4">
            Die Unternehmensgröße kann bestimmte Ausnahmen oder Erleichterungen beeinflussen.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {COMPANY_SIZES.map((size) => (
              <label
                key={size.value}
                className={`flex items-start p-4 border rounded-audit cursor-pointer transition-all ${
                  context.companySize === size.value
                    ? 'border-audit-steel bg-audit-bg'
                    : 'border-audit-light hover:border-audit-cool'
                }`}
              >
                <input
                  type="radio"
                  name="companySize"
                  value={size.value}
                  checked={context.companySize === size.value}
                  onChange={(e) => updateCompanyContext({ companySize: e.target.value as CompanyContext['companySize'] })}
                  className="mt-1 mr-3"
                />
                <div>
                  <span className="text-label text-audit-deep">{size.label}</span>
                  <p className="text-meta text-audit-cool mt-1">{size.description}</p>
                </div>
              </label>
            ))}
          </div>
          {errors.companySize && (
            <p className="text-meta text-audit-steel mt-2">{errors.companySize}</p>
          )}
        </div>
      </div>

      {/* Location */}
      <div className="audit-panel">
        <div className="audit-panel-header">
          <h2 className="text-h3 text-audit-deep mb-0">Standort & EU-Bezug</h2>
        </div>
        <div className="audit-panel-body">
          <p className="text-body text-audit-cool mb-4">
            Der EU AI Act gilt für Unternehmen mit Sitz in der EU oder mit EU-Marktbezug.
          </p>
          <div className="space-y-3">
            {LOCATIONS.map((loc) => (
              <label
                key={loc.value}
                className={`flex items-start p-4 border rounded-audit cursor-pointer transition-all ${
                  context.location === loc.value
                    ? 'border-audit-steel bg-audit-bg'
                    : 'border-audit-light hover:border-audit-cool'
                }`}
              >
                <input
                  type="radio"
                  name="location"
                  value={loc.value}
                  checked={context.location === loc.value}
                  onChange={(e) => updateCompanyContext({ location: e.target.value as CompanyContext['location'] })}
                  className="mt-1 mr-3"
                />
                <div>
                  <span className="text-label text-audit-deep">{loc.label}</span>
                  <p className="text-meta text-audit-cool mt-1">{loc.description}</p>
                </div>
              </label>
            ))}
          </div>
          {errors.location && (
            <p className="text-meta text-audit-steel mt-2">{errors.location}</p>
          )}
        </div>
      </div>

      {/* Industry */}
      <div className="audit-panel">
        <div className="audit-panel-header">
          <h2 className="text-h3 text-audit-deep mb-0">Branche</h2>
        </div>
        <div className="audit-panel-body">
          <p className="text-body text-audit-cool mb-4">
            Bestimmte Branchen haben spezifische Anforderungen im EU AI Act (z.B. Hochrisiko-Bereiche).
          </p>
          <select
            value={context.industry}
            onChange={(e) => updateCompanyContext({ industry: e.target.value })}
            className="audit-input w-full md:w-1/2"
          >
            <option value="">Branche auswählen...</option>
            {INDUSTRIES.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
          {errors.industry && (
            <p className="text-meta text-audit-steel mt-2">{errors.industry}</p>
          )}
        </div>
      </div>

      {/* EU AI Act Relevance Result */}
      {showRelevanceResult && context.euAiActRelevant !== null && (
        <div className={`p-6 rounded-audit border-l-4 ${
          context.euAiActRelevant
            ? 'bg-audit-bg border-audit-steel'
            : 'bg-audit-bg border-audit-cool'
        }`}>
          <div className="flex items-start">
            <svg
              className={`w-6 h-6 mr-3 flex-shrink-0 ${
                context.euAiActRelevant ? 'text-audit-steel' : 'text-audit-cool'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {context.euAiActRelevant ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
            <div>
              <h3 className="text-h4 text-audit-deep mb-2">
                {context.euAiActRelevant
                  ? 'EU AI Act ist anwendbar'
                  : 'EU AI Act nicht direkt anwendbar'}
              </h3>
              <p className="text-body text-audit-cool">
                {context.relevanceReason}
              </p>
              {context.euAiActRelevant && (
                <p className="text-meta text-audit-cool mt-2">
                  Im nächsten Schritt erfassen Sie die zu prüfenden KI-Systeme.
                </p>
              )}
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
          Zurück
        </button>
        <button
          onClick={validateAndProceed}
          className="audit-btn-primary flex items-center"
          disabled={!context.euAiActRelevant}
        >
          Weiter zu KI-Systemen
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Step1Scope;
