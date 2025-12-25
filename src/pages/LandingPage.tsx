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
        // Navigate to scanner page with result
        navigate("/scanner", { state: { scanResult: response.data } });
      }
    } catch {
      setScanError("Fehler bei der Analyse. Bitte versuchen Sie es erneut.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            EU AI Act Audit-Assistent
          </h1>
          <p className="text-xl text-gray-600">
            Prototyp zur Unterstützung bei der Prüfung von KI-Systemen
          </p>
        </div>

        {/* Disclaimer */}
        <Disclaimer />

        {/* Quick Scanner Widget */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">🔍</span>
            <div>
              <h2 className="text-2xl font-semibold">Schnell-Scan</h2>
              <p className="text-indigo-200">
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
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-200 focus:ring-2 focus:ring-white focus:border-transparent resize-none"
              />
            </div>

            {scanError && (
              <div className="p-3 bg-red-500/20 border border-red-300/30 rounded-lg text-red-100 text-sm">
                {scanError}
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={isScanning}
                className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
                className="text-indigo-200 hover:text-white underline text-sm"
              >
                Erweiterte Analyse →
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-white/20">
            <div className="flex items-center justify-center space-x-6 text-sm text-indigo-200">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                GPT-gestützte Analyse
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                EU AI Act konform
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Sofortige Ergebnisse
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Was macht dieses Tool?
          </h2>

          <div className="space-y-4 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-blue-600 font-semibold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Risikostufe bestimmen
                </h3>
                <p className="text-gray-600">
                  Beantworten Sie Fragen zu Ihrem KI-System, um die Risikoklasse
                  nach EU AI Act zu ermitteln (Prohibited, High Risk, Limited
                  Risk, Minimal Risk).
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-blue-600 font-semibold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Anforderungen prüfen
                </h3>
                <p className="text-gray-600">
                  Durchlaufen Sie ein strukturiertes Audit der relevanten
                  Anforderungen basierend auf der Risikoklasse. Bewerten Sie den
                  Erfüllungsgrad jeder Anforderung.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-blue-600 font-semibold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Maßnahmenkatalog generieren
                </h3>
                <p className="text-gray-600">
                  Erhalten Sie konkrete Handlungsempfehlungen für alle nicht oder
                  nur teilweise erfüllten Anforderungen. Exportieren Sie den
                  Maßnahmenkatalog als Markdown.
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">
              Features des Prototyps:
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-2"
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
                  className="w-5 h-5 text-green-500 mr-2"
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
                  className="w-5 h-5 text-green-500 mr-2"
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
                  className="w-5 h-5 text-green-500 mr-2"
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
            <Button onClick={handleStart} className="text-lg px-8 py-4">
              Zur Risikobewertung starten →
            </Button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-600">
          <p>
            Entwickelt als Prototyp zur Unterstützung von Auditor:innen bei der
            Prüfung von KI-Systemen nach EU AI Act.
          </p>
          <p className="mt-2">
            Version 0.0.1 | Prototyp | Keine Rechtsverbindlichkeit
          </p>
        </div>
      </div>
    </div>
  );
};
