import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

interface ScannerPageProps {
  onBack?: () => void;
}

interface AnalysisResult {
  riskLevel: string;
  nonConformitiesCount: number;
  reportId: string;
  details?: string[];
}

export const ScannerPage: React.FC<ScannerPageProps> = ({ onBack }) => {
  const [inputType, setInputType] = useState<'url' | 'description'>('url');
  const [inputValue, setInputValue] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    // Load saved API URL from localStorage
    const savedApiUrl = localStorage.getItem('scannerApiUrl');
    if (savedApiUrl) {
      setApiUrl(savedApiUrl);
    }
  }, []);

  const handleApiUrlChange = (url: string) => {
    setApiUrl(url);
    localStorage.setItem('scannerApiUrl', url);
  };

  const getRiskBadgeClass = (riskLevel: string) => {
    const level = riskLevel.toLowerCase();
    if (level.includes('unacceptable') || level.includes('prohibited')) {
      return 'bg-red-600 text-white';
    }
    if (level.includes('high')) {
      return 'bg-orange-500 text-white';
    }
    if (level.includes('limited')) {
      return 'bg-yellow-500 text-white';
    }
    return 'bg-green-500 text-white';
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!inputValue.trim()) {
      setError('Bitte geben Sie eine URL oder Beschreibung ein.');
      return;
    }

    if (!apiUrl.trim()) {
      setError('Bitte konfigurieren Sie zuerst die n8n Webhook URL.');
      setShowConfig(true);
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch(`${apiUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputType,
          [inputType]: inputValue,
        }),
      });

      if (!response.ok) {
        throw new Error('Analyse fehlgeschlagen. Bitte überprüfen Sie die API-Konfiguration.');
      }

      const data = await response.json();

      if (data.success) {
        setResult({
          riskLevel: data.riskLevel || 'Unbekannt',
          nonConformitiesCount: data.nonConformitiesCount || 0,
          reportId: data.reportId || `RPT-${Date.now()}`,
          details: data.details,
        });
      } else {
        throw new Error(data.message || 'Analyse fehlgeschlagen');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!result?.reportId || !apiUrl) return;

    try {
      const response = await fetch(`${apiUrl}/download/${result.reportId}`);

      if (!response.ok) {
        throw new Error('Download fehlgeschlagen');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eu-ai-act-report-${result.reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Report-Download fehlgeschlagen. Bitte versuchen Sie es später erneut.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <span className="mr-2">🇪🇺</span>
                  EU AI Act Compliance Scanner
                </h1>
                <p className="text-gray-600 mt-1">
                  Automatisierte KI-System-Analyse auf EU AI Act Konformität
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Konfiguration
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Configuration Panel */}
        {showConfig && (
          <Card className="mb-6 bg-yellow-50 border border-yellow-200">
            <div className="flex items-start space-x-3">
              <svg
                className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  API Konfiguration
                </h3>
                <p className="text-sm text-yellow-700 mb-4">
                  Geben Sie die URL Ihres n8n Webhook-Endpoints ein, um die Analyse-Funktion zu nutzen.
                </p>
                <div className="flex space-x-4">
                  <input
                    type="url"
                    value={apiUrl}
                    onChange={(e) => handleApiUrlChange(e.target.value)}
                    placeholder="http://localhost:5678/webhook"
                    className="flex-1 px-4 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => setShowConfig(false)}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Speichern
                  </button>
                </div>
                <p className="text-xs text-yellow-600 mt-2">
                  Standard: http://localhost:5678/webhook oder Ihre ngrok URL
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Main Analysis Card */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            KI-System analysieren
          </h2>

          {/* Input Type Selection */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setInputType('url')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                inputType === 'url'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                <span className="font-medium">Website URL</span>
              </div>
            </button>

            <button
              onClick={() => setInputType('description')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                inputType === 'description'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg
                  className="w-5 h-5"
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
                <span className="font-medium">Beschreibung</span>
              </div>
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleAnalyze}>
            {inputType === 'url' ? (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL des KI-Systems
                </label>
                <input
                  type="url"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="https://example.com/ki-produkt"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="mt-2 text-sm text-gray-500">
                  URL zur Website oder App mit integriertem KI-System
                </p>
              </div>
            ) : (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  KI-System Beschreibung
                </label>
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Beschreiben Sie Ihr KI-System, z.B.: 'Unser KI-System nutzt Gesichtserkennung zur automatischen Zugangsgewährung in Gebäuden. Es verarbeitet biometrische Daten in Echtzeit und trifft Zugriffsentscheidungen ohne menschliche Aufsicht.'"
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Je detaillierter die Beschreibung, desto genauer die Analyse
                </p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-red-700">
                  <svg
                    className="w-5 h-5 mr-2 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isAnalyzing}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Analysiere... (30-60 Sekunden)
                </span>
              ) : (
                'Analyse starten'
              )}
            </Button>
          </form>

          {/* Results */}
          {result && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Analyse abgeschlossen
                </h3>
                <span className="text-green-600">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <span className="text-gray-600">Risikostufe:</span>
                  <span className={`px-4 py-1 rounded-full font-semibold ${getRiskBadgeClass(result.riskLevel)}`}>
                    {result.riskLevel}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <span className="text-gray-600">Non-Konformitäten:</span>
                  <span className="font-semibold text-gray-900">
                    {result.nonConformitiesCount} gefunden
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <span className="text-gray-600">Report ID:</span>
                  <span className="font-mono text-sm text-gray-700">
                    {result.reportId}
                  </span>
                </div>
              </div>

              <button
                onClick={handleDownloadReport}
                className="mt-6 w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                PDF Report herunterladen
              </button>
            </div>
          )}
        </Card>

        {/* Info Card */}
        <Card className="mt-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <svg
                className="w-8 h-8 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Powered by n8n & OpenAI GPT-4
              </h3>
              <p className="text-gray-600">
                Die Analyse basiert auf der EU AI Act Regulation (EU) 2024/1689.
                Sie ersetzt keine rechtliche Beratung, bietet jedoch eine erste
                Orientierung zur Konformität Ihres KI-Systems.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
