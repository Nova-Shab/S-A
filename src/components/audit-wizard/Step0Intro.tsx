import React from 'react';
import { useAuditWizard } from '../../context/AuditWizardContext';

export const Step0Intro: React.FC = () => {
  const { nextStep } = useAuditWizard();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="audit-panel">
        <div className="audit-panel-header">
          <h2 className="text-h2 text-audit-deep mb-0">
            Willkommen zum EU AI Act Audit
          </h2>
        </div>
        <div className="audit-panel-body">
          <p className="text-body text-audit-cool mb-6">
            Dieses Tool unterstützt Sie bei der strukturierten Prüfung Ihrer KI-Systeme
            nach den Anforderungen der EU KI-Verordnung (AI Act).
          </p>

          {/* What this tool does */}
          <div className="space-y-4 mb-8">
            <h3 className="text-h4 text-audit-deep">Was Sie erwartet:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start p-4 bg-audit-bg rounded-audit">
                <div className="w-8 h-8 rounded-full bg-audit-steel text-white flex items-center justify-center flex-shrink-0 mr-3">
                  1
                </div>
                <div>
                  <h4 className="text-label text-audit-deep">Scope-Klärung</h4>
                  <p className="text-meta text-audit-cool">
                    Prüfung der grundsätzlichen Anwendbarkeit des EU AI Act
                  </p>
                </div>
              </div>

              <div className="flex items-start p-4 bg-audit-bg rounded-audit">
                <div className="w-8 h-8 rounded-full bg-audit-steel text-white flex items-center justify-center flex-shrink-0 mr-3">
                  2
                </div>
                <div>
                  <h4 className="text-label text-audit-deep">System-Erfassung</h4>
                  <p className="text-meta text-audit-cool">
                    Dokumentation Ihrer KI-Systeme und deren Einsatzbereiche
                  </p>
                </div>
              </div>

              <div className="flex items-start p-4 bg-audit-bg rounded-audit">
                <div className="w-8 h-8 rounded-full bg-audit-steel text-white flex items-center justify-center flex-shrink-0 mr-3">
                  3
                </div>
                <div>
                  <h4 className="text-label text-audit-deep">Risikoklassifizierung</h4>
                  <p className="text-meta text-audit-cool">
                    Bestimmung der Risikostufe nach EU AI Act Kriterien
                  </p>
                </div>
              </div>

              <div className="flex items-start p-4 bg-audit-bg rounded-audit">
                <div className="w-8 h-8 rounded-full bg-audit-steel text-white flex items-center justify-center flex-shrink-0 mr-3">
                  4
                </div>
                <div>
                  <h4 className="text-label text-audit-deep">Pflichten-Prüfung</h4>
                  <p className="text-meta text-audit-cool">
                    Systematische Bewertung der Anforderungserfüllung mit Evidenz
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Important Disclaimer */}
      <div className="audit-alert-info">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-audit-steel mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-label text-audit-steel mb-2">Wichtiger Hinweis</h3>
            <ul className="text-body text-audit-deep space-y-2">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Dieses Tool ersetzt <strong>keine Rechtsberatung</strong>. Es dient der strukturierten Dokumentation und Erstbewertung.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Alle Eingaben werden <strong>lokal in Ihrem Browser</strong> gespeichert (Auto-Save alle 30 Sekunden).</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Die finale Bewertung sollte durch <strong>qualifizierte Fachpersonen</strong> validiert werden.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Prerequisites */}
      <div className="audit-panel">
        <div className="audit-panel-header">
          <h3 className="text-h4 text-audit-deep mb-0">Vorbereitung: Was Sie bereithalten sollten</h3>
        </div>
        <div className="audit-panel-body">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-label text-audit-steel mb-3">Unternehmensinfos</h4>
              <ul className="space-y-2 text-body text-audit-cool">
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-audit-light" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Unternehmensgröße (Mitarbeiter, Umsatz)
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-audit-light" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Standorte und Marktregionen
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-audit-light" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Branche und Tätigkeitsfeld
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-label text-audit-steel mb-3">KI-System Dokumentation</h4>
              <ul className="space-y-2 text-body text-audit-cool">
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-audit-light" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Systembeschreibungen
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-audit-light" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Technische Dokumentation
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-audit-light" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Einsatzbereiche und Anwendungsfälle
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Time Estimate */}
      <div className="flex items-center justify-between p-4 bg-audit-bg rounded-audit">
        <div className="flex items-center text-audit-cool">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-body">
            Geschätzte Bearbeitungszeit: <strong className="text-audit-deep">15-30 Minuten</strong> pro KI-System
          </span>
        </div>
        <span className="text-meta text-audit-cool">
          Sie können jederzeit unterbrechen und fortsetzen
        </span>
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        <button
          onClick={nextStep}
          className="audit-btn-primary flex items-center"
        >
          Audit starten
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Step0Intro;
