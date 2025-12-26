import React, { useState, useEffect } from 'react';
import { useAuditWizard, RiskClassification } from '../../context/AuditWizardContext';

// Prohibited practices (Art. 5)
const PROHIBITED_PRACTICES = [
  {
    id: 'subliminal',
    title: 'Unterschwellige Manipulation',
    description: 'Einsatz von unterschwelligen Techniken, die das Bewusstsein einer Person umgehen, um ihr Verhalten wesentlich zu beeinflussen.',
  },
  {
    id: 'vulnerability',
    title: 'Ausnutzung von Schwachstellen',
    description: 'Ausnutzung von Schwachstellen bestimmter Personengruppen (Alter, Behinderung, soziale/wirtschaftliche Situation).',
  },
  {
    id: 'social_scoring',
    title: 'Social Scoring durch Behörden',
    description: 'Bewertung/Klassifizierung von Personen durch Behörden basierend auf Sozialverhalten oder persönlichen Eigenschaften.',
  },
  {
    id: 'realtime_biometric',
    title: 'Echtzeit-Biometrie im öffentlichen Raum',
    description: 'Echtzeit-biometrische Fernidentifikation in öffentlich zugänglichen Räumen für Strafverfolgung (mit Ausnahmen).',
  },
  {
    id: 'emotion_recognition',
    title: 'Emotionserkennung am Arbeitsplatz/Bildung',
    description: 'Emotionserkennung am Arbeitsplatz oder in Bildungseinrichtungen (außer bei Sicherheitsgründen).',
  },
  {
    id: 'biometric_categorization',
    title: 'Biometrische Kategorisierung',
    description: 'Biometrische Kategorisierung zur Ableitung sensibler Kategorien (Rasse, politische Meinung, Religion, etc.).',
  },
  {
    id: 'facial_scraping',
    title: 'Ungezielte Gesichtserkennung',
    description: 'Ungezielte Sammlung von Gesichtsbildern aus Internet/Überwachung für Gesichtserkennungsdatenbanken.',
  },
];

// High-risk categories (Annex III)
const HIGH_RISK_CATEGORIES = [
  {
    id: 'biometric',
    title: 'Biometrische Identifizierung',
    description: 'Biometrische Fernidentifizierungssysteme (nicht in Echtzeit).',
    examples: 'Gesichtserkennung, Fingerabdruck-Identifikation',
  },
  {
    id: 'critical_infrastructure',
    title: 'Kritische Infrastrukturen',
    description: 'Sicherheitskomponenten für kritische Infrastrukturen.',
    examples: 'Wasser-, Gas-, Stromversorgung, Verkehrsmanagement',
  },
  {
    id: 'education',
    title: 'Bildung und Berufsausbildung',
    description: 'Zugang zu Bildung, Bewertung von Prüfungen, Feststellung des Bildungsniveaus.',
    examples: 'Zulassungssysteme, automatische Prüfungsbewertung',
  },
  {
    id: 'employment',
    title: 'Beschäftigung und HR',
    description: 'Rekrutierung, Auswahl, Beförderung, Kündigung, Leistungsüberwachung.',
    examples: 'CV-Screening, Interview-Analyse, Mitarbeiterüberwachung',
  },
  {
    id: 'essential_services',
    title: 'Wesentliche Dienstleistungen',
    description: 'Zugang zu wesentlichen privaten/öffentlichen Diensten und Leistungen.',
    examples: 'Kreditwürdigkeit, Sozialleistungen, Versicherungen',
  },
  {
    id: 'law_enforcement',
    title: 'Strafverfolgung',
    description: 'Risikobewertung, Beweismittelzuverlässigkeit, Lügendetektoren, Profiling.',
    examples: 'Predictive Policing, Kriminalitätsprognose',
  },
  {
    id: 'migration',
    title: 'Migration und Grenzkontrolle',
    description: 'Prüfung von Asylanträgen, Risikobewertung, Dokumentenechtheit.',
    examples: 'Visa-Prüfung, Grenzkontrollsysteme',
  },
  {
    id: 'justice',
    title: 'Rechtspflege und Demokratie',
    description: 'Unterstützung bei Rechtsprechung, Beeinflussung von Wahlergebnissen.',
    examples: 'Richterliche Entscheidungshilfen, Wahlkampf-Targeting',
  },
];

export const Step3RiskClassification: React.FC = () => {
  const { state, updateAISystem, nextStep, prevStep } = useAuditWizard();
  const currentSystem = state.aiSystems[state.currentSystemIndex];

  const [prohibitedAnswers, setProhibitedAnswers] = useState<Record<string, boolean | null>>({});
  const [highRiskAnswers, setHighRiskAnswers] = useState<Record<string, boolean | null>>({});
  const [hasTransparency, setHasTransparency] = useState<boolean | null>(null);
  const [classification, setClassification] = useState<RiskClassification | null>(
    currentSystem?.riskClassification || null
  );
  const [showResult, setShowResult] = useState(false);

  // Initialize answers from existing classification
  useEffect(() => {
    if (currentSystem?.riskClassification) {
      setClassification(currentSystem.riskClassification);
      setShowResult(true);
    }
  }, [currentSystem]);

  const checkProhibited = () => {
    const prohibited = Object.entries(prohibitedAnswers).find(([_, value]) => value === true);
    return prohibited ? prohibited[0] : null;
  };

  const checkHighRisk = () => {
    return Object.entries(highRiskAnswers).some(([_, value]) => value === true);
  };

  const determineRiskLevel = (): RiskClassification => {
    const prohibitedId = checkProhibited();
    const isHighRisk = checkHighRisk();

    if (prohibitedId) {
      const practice = PROHIBITED_PRACTICES.find(p => p.id === prohibitedId);
      return {
        isProhibited: true,
        prohibitedReason: practice?.title || 'Verbotene Praktik identifiziert',
        riskLevel: null,
        criteria: [prohibitedId],
        assumptions: [],
        uncertainties: [],
        assessedAt: new Date().toISOString(),
      };
    }

    if (isHighRisk) {
      const matchedCategories = Object.entries(highRiskAnswers)
        .filter(([_, value]) => value === true)
        .map(([id]) => id);

      return {
        isProhibited: false,
        riskLevel: 'HIGH_RISK',
        criteria: matchedCategories,
        assumptions: [],
        uncertainties: [],
        assessedAt: new Date().toISOString(),
      };
    }

    if (hasTransparency === true) {
      return {
        isProhibited: false,
        riskLevel: 'LIMITED_RISK',
        criteria: ['transparency_required'],
        assumptions: ['System interagiert direkt mit Personen oder generiert synthetische Inhalte'],
        uncertainties: [],
        assessedAt: new Date().toISOString(),
      };
    }

    return {
      isProhibited: false,
      riskLevel: 'MINIMAL_RISK',
      criteria: [],
      assumptions: ['Keine Hochrisiko-Kriterien erfüllt', 'Keine Transparenzpflichten identifiziert'],
      uncertainties: [],
      assessedAt: new Date().toISOString(),
    };
  };

  const handleClassify = () => {
    const result = determineRiskLevel();
    setClassification(result);
    setShowResult(true);

    // Save to the AI system
    updateAISystem(currentSystem.id, {
      riskClassification: result,
    });
  };

  const handleProceed = () => {
    if (classification?.isProhibited) {
      // Skip to end for prohibited systems
      // In a real app, you might want to handle this differently
    }
    nextStep();
  };

  const getRiskColor = (level: string | null) => {
    switch (level) {
      case 'HIGH_RISK':
        return 'border-audit-steel bg-audit-bg';
      case 'LIMITED_RISK':
        return 'border-audit-cool bg-audit-bg';
      case 'MINIMAL_RISK':
        return 'border-audit-light bg-white';
      default:
        return 'border-audit-deep bg-audit-bg';
    }
  };

  if (!currentSystem) {
    return (
      <div className="audit-alert-info">
        <p>Kein KI-System ausgewählt. Bitte gehen Sie zurück und erfassen Sie ein System.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Current System Info */}
      <div className="audit-panel">
        <div className="audit-panel-header">
          <div className="flex items-center justify-between">
            <h2 className="text-h3 text-audit-deep mb-0">Risikoklassifizierung</h2>
            <span className="px-3 py-1 bg-audit-bg text-audit-steel rounded-full text-meta">
              System {state.currentSystemIndex + 1} von {state.aiSystems.length}
            </span>
          </div>
        </div>
        <div className="audit-panel-body">
          <div className="flex items-start">
            <div className="w-10 h-10 rounded-full bg-audit-steel text-white flex items-center justify-center mr-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-h4 text-audit-deep">{currentSystem.name}</h3>
              <p className="text-body text-audit-cool">{currentSystem.description}</p>
            </div>
          </div>
        </div>
      </div>

      {!showResult ? (
        <>
          {/* Step 1: Prohibited Practices */}
          <div className="audit-panel">
            <div className="audit-panel-header">
              <h3 className="text-h4 text-audit-deep mb-0">
                Schritt 1: Prüfung verbotener Praktiken (Art. 5)
              </h3>
            </div>
            <div className="audit-panel-body">
              <div className="audit-alert-info mb-6">
                <p className="text-body text-audit-deep">
                  Bestimmte KI-Praktiken sind nach EU AI Act vollständig verboten.
                  Bitte prüfen Sie, ob Ihr System eine der folgenden Praktiken beinhaltet.
                </p>
              </div>

              <div className="space-y-4">
                {PROHIBITED_PRACTICES.map((practice) => (
                  <div key={practice.id} className="p-4 border border-audit-light rounded-audit">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 mr-4">
                        <h4 className="text-label text-audit-deep">{practice.title}</h4>
                        <p className="text-meta text-audit-cool mt-1">{practice.description}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setProhibitedAnswers({ ...prohibitedAnswers, [practice.id]: true })}
                          className={`px-4 py-2 text-sm rounded-audit transition-colors ${
                            prohibitedAnswers[practice.id] === true
                              ? 'bg-audit-steel text-white'
                              : 'bg-audit-bg text-audit-cool hover:bg-audit-light'
                          }`}
                        >
                          Ja
                        </button>
                        <button
                          onClick={() => setProhibitedAnswers({ ...prohibitedAnswers, [practice.id]: false })}
                          className={`px-4 py-2 text-sm rounded-audit transition-colors ${
                            prohibitedAnswers[practice.id] === false
                              ? 'bg-audit-steel text-white'
                              : 'bg-audit-bg text-audit-cool hover:bg-audit-light'
                          }`}
                        >
                          Nein
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step 2: High-Risk Categories */}
          <div className="audit-panel">
            <div className="audit-panel-header">
              <h3 className="text-h4 text-audit-deep mb-0">
                Schritt 2: Hochrisiko-Kategorien (Anhang III)
              </h3>
            </div>
            <div className="audit-panel-body">
              <p className="text-body text-audit-cool mb-6">
                Prüfen Sie, ob Ihr System in eine der folgenden Hochrisiko-Kategorien fällt.
              </p>

              <div className="space-y-4">
                {HIGH_RISK_CATEGORIES.map((category) => (
                  <div key={category.id} className="p-4 border border-audit-light rounded-audit">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 mr-4">
                        <h4 className="text-label text-audit-deep">{category.title}</h4>
                        <p className="text-meta text-audit-cool mt-1">{category.description}</p>
                        <p className="text-meta text-audit-light mt-1">
                          <span className="font-medium">Beispiele:</span> {category.examples}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setHighRiskAnswers({ ...highRiskAnswers, [category.id]: true })}
                          className={`px-4 py-2 text-sm rounded-audit transition-colors ${
                            highRiskAnswers[category.id] === true
                              ? 'bg-audit-steel text-white'
                              : 'bg-audit-bg text-audit-cool hover:bg-audit-light'
                          }`}
                        >
                          Ja
                        </button>
                        <button
                          onClick={() => setHighRiskAnswers({ ...highRiskAnswers, [category.id]: false })}
                          className={`px-4 py-2 text-sm rounded-audit transition-colors ${
                            highRiskAnswers[category.id] === false
                              ? 'bg-audit-steel text-white'
                              : 'bg-audit-bg text-audit-cool hover:bg-audit-light'
                          }`}
                        >
                          Nein
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3: Transparency Requirements */}
          <div className="audit-panel">
            <div className="audit-panel-header">
              <h3 className="text-h4 text-audit-deep mb-0">
                Schritt 3: Transparenzpflichten
              </h3>
            </div>
            <div className="audit-panel-body">
              <p className="text-body text-audit-cool mb-4">
                Unterliegt Ihr System besonderen Transparenzpflichten?
              </p>
              <div className="p-4 bg-audit-bg rounded-audit">
                <p className="text-body text-audit-deep mb-4">
                  Trifft mindestens eines der folgenden Kriterien zu?
                </p>
                <ul className="space-y-2 text-body text-audit-cool mb-4">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Das System interagiert direkt mit Personen (z.B. Chatbot)
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Das System generiert synthetische Inhalte (Text, Bild, Audio, Video)
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Das System erkennt Emotionen oder ordnet biometrische Kategorien zu
                  </li>
                </ul>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setHasTransparency(true)}
                    className={`px-6 py-2 rounded-audit transition-colors ${
                      hasTransparency === true
                        ? 'bg-audit-steel text-white'
                        : 'bg-white border border-audit-light text-audit-cool hover:border-audit-steel'
                    }`}
                  >
                    Ja, mindestens eines trifft zu
                  </button>
                  <button
                    onClick={() => setHasTransparency(false)}
                    className={`px-6 py-2 rounded-audit transition-colors ${
                      hasTransparency === false
                        ? 'bg-audit-steel text-white'
                        : 'bg-white border border-audit-light text-audit-cool hover:border-audit-steel'
                    }`}
                  >
                    Nein, keines trifft zu
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Classify Button */}
          <div className="flex justify-center">
            <button
              onClick={handleClassify}
              className="audit-btn-primary px-8 py-3 text-lg"
            >
              Risikostufe ermitteln
            </button>
          </div>
        </>
      ) : (
        /* Classification Result */
        <div className={`p-6 rounded-audit border-l-4 ${getRiskColor(classification?.riskLevel || null)}`}>
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-4">
              {classification?.isProhibited ? (
                <div className="w-12 h-12 rounded-full bg-audit-deep text-white flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-audit-steel text-white flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-h3 text-audit-deep mb-2">
                {classification?.isProhibited
                  ? 'Verbotene Praktik'
                  : classification?.riskLevel === 'HIGH_RISK'
                  ? 'Hochrisiko-System'
                  : classification?.riskLevel === 'LIMITED_RISK'
                  ? 'Begrenztes Risiko'
                  : 'Minimales Risiko'}
              </h3>

              {classification?.isProhibited ? (
                <div className="space-y-4">
                  <p className="text-body text-audit-deep">
                    Das System fällt unter eine verbotene Praktik nach Art. 5 EU AI Act:
                  </p>
                  <p className="text-body text-audit-steel font-medium">
                    {classification.prohibitedReason}
                  </p>
                  <div className="audit-alert-info">
                    <p className="text-body text-audit-deep">
                      Verbotene KI-Systeme dürfen nicht in Verkehr gebracht oder betrieben werden.
                      Wenden Sie sich an Ihre Rechtsabteilung für weitere Schritte.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-body text-audit-cool">
                    {classification?.riskLevel === 'HIGH_RISK' && (
                      'Dieses System unterliegt umfassenden Anforderungen nach Kapitel 2 des EU AI Act.'
                    )}
                    {classification?.riskLevel === 'LIMITED_RISK' && (
                      'Für dieses System gelten Transparenzpflichten nach Art. 50 EU AI Act.'
                    )}
                    {classification?.riskLevel === 'MINIMAL_RISK' && (
                      'Für dieses System gelten keine besonderen Anforderungen. Freiwillige Verhaltenskodizes werden empfohlen.'
                    )}
                  </p>

                  {classification?.criteria && classification.criteria.length > 0 && (
                    <div>
                      <h4 className="text-label text-audit-steel mb-2">Ermittelte Kriterien:</h4>
                      <ul className="space-y-1">
                        {classification.criteria.map((criterion) => (
                          <li key={criterion} className="flex items-center text-body text-audit-cool">
                            <svg className="w-4 h-4 mr-2 text-audit-steel" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {HIGH_RISK_CATEGORIES.find(c => c.id === criterion)?.title || criterion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-audit-light">
                <button
                  onClick={() => {
                    setShowResult(false);
                    setProhibitedAnswers({});
                    setHighRiskAnswers({});
                    setHasTransparency(null);
                  }}
                  className="text-audit-steel hover:text-audit-deep underline text-sm"
                >
                  Klassifizierung erneut durchführen
                </button>
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
          Zurück
        </button>
        {showResult && (
          <button
            onClick={handleProceed}
            className="audit-btn-primary flex items-center"
          >
            {classification?.riskLevel === 'HIGH_RISK'
              ? 'Weiter zu Pflichten & Evidenz'
              : 'Weiter zur Bewertung'}
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Step3RiskClassification;
