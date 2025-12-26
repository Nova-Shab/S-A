import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Disclaimer } from "../components/Disclaimer";
import { useAudit } from "../context/AuditContext";
import api from "../services/api";

export const LandingPage: React.FC = () => {
  const { setCurrentStep } = useAudit();
  const navigate = useNavigate();
  const [quickScanText, setQuickScanText] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const handleStart = () => {
    setCurrentStep(1);
  };

  const handleQuickScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setScanError(null);

    if (!quickScanText.trim()) {
      setScanError("Bitte geben Sie eine Beschreibung ein.");
      return;
    }

    if (quickScanText.trim().length < 50) {
      setScanError("Die Beschreibung sollte mindestens 50 Zeichen lang sein.");
      return;
    }

    setIsScanning(true);

    try {
      const response = await api.post("/scanner/analyze", {
        inputType: "description",
        inputValue: quickScanText,
        systemName: "Schnell-Scan",
      });

      if (response.data.success) {
        navigate("/scanner", { state: { scanResult: response.data } });
      }
    } catch {
      setScanError("Fehler bei der Analyse. Bitte versuchen Sie es erneut.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-audit-bg">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <img
            src="/images/logo.svg"
            alt="EU AI Act Audit Platform"
            className="h-24 w-auto mx-auto mb-6"
          />
          <p className="text-body text-audit-cool max-w-2xl mx-auto">
            Prototyp zur Unterstützung bei der Prüfung von KI-Systemen
          </p>
        </div>

        {/* Disclaimer */}
        <Disclaimer />

        {/* Quick Scanner Widget - Design System */}
        <div className="audit-scanner-widget mb-8">
          <div className="flex items-center mb-6">
            <svg className="w-10 h-10 mr-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <div>
              <h2 className="text-xl font-semibold text-white">Schnell-Scan</h2>
              <p className="text-white/70 text-sm">
                Sofortige Risikoanalyse Ihres KI-Systems
              </p>
            </div>
          </div>

          <form onSubmit={handleQuickScan} className="space-y-4">
            <div>
              <textarea
                value={quickScanText}
                onChange={(e) => setQuickScanText(e.target.value)}
                placeholder="Beschreiben Sie kurz Ihr KI-System: Was macht es? Welche Daten verarbeitet es? In welchem Bereich wird es eingesetzt?"
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-audit text-white placeholder-white/50 focus:ring-2 focus:ring-white/30 focus:border-white/30 resize-none"
              />
            </div>

            {scanError && (
              <div className="p-3 bg-white/10 border-l-4 border-white/40 rounded-audit text-white/90 text-sm">
                {scanError}
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={isScanning}
                className="audit-scanner-btn disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
                  <>
                    Schnell-Analyse starten
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/scanner")}
                className="text-white/70 hover:text-white underline text-sm transition-colors"
              >
                Erweiterte Analyse
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-white/20">
            <div className="flex items-center justify-center space-x-6 text-sm text-white/60">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                KI-gestützte Analyse
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                EU AI Act konform
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Sofortige Ergebnisse
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Card - Design System */}
        <div className="audit-panel mb-8">
          <div className="audit-panel-header">
            <h2 className="text-h2 text-audit-deep mb-0">
              Was macht dieses Tool?
            </h2>
          </div>
          <div className="audit-panel-body">
            <div className="space-y-6 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-audit-bg rounded-full flex items-center justify-center mr-4">
                  <span className="text-audit-steel font-semibold">1</span>
                </div>
                <div>
                  <h3 className="text-h4 text-audit-deep mb-1">
                    Risikostufe bestimmen
                  </h3>
                  <p className="text-body text-audit-cool mb-0">
                    Beantworten Sie Fragen zu Ihrem KI-System, um die Risikoklasse
                    nach EU AI Act zu ermitteln (Prohibited, High Risk, Limited
                    Risk, Minimal Risk).
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-audit-bg rounded-full flex items-center justify-center mr-4">
                  <span className="text-audit-steel font-semibold">2</span>
                </div>
                <div>
                  <h3 className="text-h4 text-audit-deep mb-1">
                    Anforderungen prüfen
                  </h3>
                  <p className="text-body text-audit-cool mb-0">
                    Durchlaufen Sie ein strukturiertes Audit der relevanten
                    Anforderungen basierend auf der Risikoklasse. Bewerten Sie den
                    Erfüllungsgrad jeder Anforderung.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-audit-bg rounded-full flex items-center justify-center mr-4">
                  <span className="text-audit-steel font-semibold">3</span>
                </div>
                <div>
                  <h3 className="text-h4 text-audit-deep mb-1">
                    Maßnahmenkatalog generieren
                  </h3>
                  <p className="text-body text-audit-cool mb-0">
                    Erhalten Sie konkrete Handlungsempfehlungen für alle nicht oder
                    nur teilweise erfüllten Anforderungen. Exportieren Sie den
                    Maßnahmenkatalog als Markdown.
                  </p>
                </div>
              </div>
            </div>

            {/* Features - Design System */}
            <div className="audit-alert-info mb-8">
              <h3 className="text-label text-audit-steel mb-3">
                Features des Prototyps
              </h3>
              <ul className="space-y-2 text-body text-audit-deep">
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-audit-steel mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Schrittweise Führung durch den Audit-Prozess
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-audit-steel mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Automatische Speicherung im Browser (localStorage)
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-audit-steel mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Individuelle Handlungsempfehlungen pro Anforderung
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-audit-steel mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Export als Markdown und Druckfunktion
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <button onClick={handleStart} className="audit-btn-primary text-lg px-8 py-4">
                Zur Risikobewertung starten
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-meta text-audit-cool">
          <p className="mb-2">
            Entwickelt als Prototyp zur Unterstützung von Auditor:innen bei der
            Prüfung von KI-Systemen nach EU AI Act.
          </p>
          <p className="audit-ref">
            Version 0.0.1 | Prototyp | Keine Rechtsverbindlichkeit
          </p>
        </div>
      </div>
    </div>
  );
};
