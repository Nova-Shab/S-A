import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

interface ScanFinding {
  category: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  description: string;
  recommendation: string;
  articleReference?: string;
}

interface ScanAnalysis {
  riskLevel: string;
  riskScore: number;
  findings: ScanFinding[];
  summary: string;
  detectedFeatures: string[];
  complianceGaps: string[];
  nextSteps: string[];
}

interface ScanResult {
  success: boolean;
  scanId: number;
  riskLevel: string;
  riskLevelLabel: string;
  riskScore: number;
  summary: string;
  findingsCount: number;
  criticalCount: number;
  highCount: number;
  analysis: ScanAnalysis;
}

interface ScannerPageProps {
  onBack?: () => void;
}

const SEVERITY_CONFIG = {
  critical: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', label: 'Kritisch' },
  high: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', label: 'Hoch' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', label: 'Mittel' },
  low: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', label: 'Niedrig' },
  info: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300', label: 'Info' },
};

const RISK_CONFIG: Record<string, { bg: string; text: string; gradient: string }> = {
  PROHIBITED: { bg: 'bg-red-600', text: 'text-white', gradient: 'from-red-600 to-red-800' },
  HIGH_RISK: { bg: 'bg-orange-500', text: 'text-white', gradient: 'from-orange-500 to-orange-700' },
  LIMITED_RISK: { bg: 'bg-yellow-500', text: 'text-white', gradient: 'from-yellow-500 to-yellow-600' },
  MINIMAL_RISK: { bg: 'bg-green-500', text: 'text-white', gradient: 'from-green-500 to-green-600' },
  UNKNOWN: { bg: 'bg-gray-500', text: 'text-white', gradient: 'from-gray-500 to-gray-600' },
};

export const ScannerPage: React.FC<ScannerPageProps> = ({ onBack }) => {
  const location = useLocation();
  const { t } = useLanguage();
  const [inputType, setInputType] = useState<'url' | 'description'>('description');
  const [inputValue, setInputValue] = useState('');
  const [systemName, setSystemName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedFindings, setExpandedFindings] = useState<Set<number>>(new Set());

  // Dynamic severity labels based on language
  const severityLabels: Record<string, string> = {
    critical: t('scanner.critical'),
    high: t('scanner.high'),
    medium: t('scanner.medium'),
    low: t('scanner.low'),
    info: t('scanner.info'),
  };

  // Handle incoming scan result from landing page quick-scan
  useEffect(() => {
    const state = location.state as { scanResult?: ScanResult } | null;
    if (state?.scanResult) {
      setResult(state.scanResult);
      // Expand critical and high findings by default
      const toExpand = new Set<number>();
      state.scanResult.analysis.findings.forEach((f, idx) => {
        if (f.severity === 'critical' || f.severity === 'high') {
          toExpand.add(idx);
        }
      });
      setExpandedFindings(toExpand);
      // Clear the state to prevent re-rendering on navigation
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!inputValue.trim()) {
      setError(t('scanner.emptyError'));
      return;
    }

    if (inputValue.trim().length < 50) {
      setError(t('scanner.minCharsError'));
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await api.post<ScanResult>('/scanner/analyze', {
        inputType,
        inputValue,
        systemName: systemName || undefined,
      });

      if (response.data.success) {
        setResult(response.data);
        // Expand critical and high findings by default
        const toExpand = new Set<number>();
        response.data.analysis.findings.forEach((f, idx) => {
          if (f.severity === 'critical' || f.severity === 'high') {
            toExpand.add(idx);
          }
        });
        setExpandedFindings(toExpand);
      } else {
        throw new Error('Analyse fehlgeschlagen');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      setError(error.response?.data?.error || error.message || 'Ein unbekannter Fehler ist aufgetreten.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleFinding = (idx: number) => {
    const newExpanded = new Set(expandedFindings);
    if (newExpanded.has(idx)) {
      newExpanded.delete(idx);
    } else {
      newExpanded.add(idx);
    }
    setExpandedFindings(newExpanded);
  };

  const handleNewScan = () => {
    setResult(null);
    setInputValue('');
    setSystemName('');
    setError(null);
  };

  const riskConfig = result ? RISK_CONFIG[result.riskLevel] || RISK_CONFIG.UNKNOWN : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <span className="mr-3">🇪🇺</span>
                  {t('scanner.title')}
                </h1>
                <p className="text-gray-600 mt-1">
                  {t('scanner.subtitle')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {!result ? (
          // Input Form
          <>
            <Card className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {t('scanner.analyzeTitle')}
              </h2>

              {/* Input Type Selection */}
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setInputType('description')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                    inputType === 'description'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-medium">{t('scanner.description')}</span>
                  </div>
                </button>

                <button
                  onClick={() => setInputType('url')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                    inputType === 'url'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span className="font-medium">{t('scanner.websiteUrl')}</span>
                  </div>
                </button>
              </div>

              {/* Input Form */}
              <form onSubmit={handleAnalyze}>
                {/* System Name (optional) */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('scanner.systemName')} <span className="text-gray-400">{t('scanner.optional')}</span>
                  </label>
                  <input
                    type="text"
                    value={systemName}
                    onChange={(e) => setSystemName(e.target.value)}
                    placeholder={t('scanner.systemNamePlaceholder')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Main Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {inputType === 'description' ? t('scanner.descriptionLabel') : t('scanner.urlLabel')}
                  </label>
                  {inputType === 'description' ? (
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={`Beschreiben Sie Ihr KI-System detailliert:

• Welchen Zweck erfüllt das System?
• Welche Daten werden verarbeitet?
• In welchem Bereich wird es eingesetzt? (z.B. HR, Finanzen, Gesundheit)
• Werden automatisierte Entscheidungen getroffen?
• Werden biometrische Daten verwendet?

Beispiel: "Unser KI-System nutzt maschinelles Lernen zur Bewertung von Bewerbungen. Es analysiert Lebensläufe und erstellt ein Ranking basierend auf Qualifikationen, Berufserfahrung und Soft Skills. Die Enderstellung obliegt dem HR-Team, aber die Top-10 Kandidaten werden automatisch vorselektiert."`}
                      rows={8}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    />
                  ) : (
                    <input
                      type="url"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="https://example.com/ki-system"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    {inputType === 'description'
                      ? t('scanner.descriptionHint')
                      : t('scanner.urlHint')}
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center text-red-700">
                      <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t('scanner.analyzingSystem')}
                    </span>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      {t('scanner.startAnalysis')}
                    </>
                  )}
                </Button>
              </form>
            </Card>

            {/* Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: '🔍', title: t('scanner.autoAnalysis'), desc: t('scanner.autoAnalysisDesc') },
                { icon: '📊', title: t('scanner.euAiActCompliant'), desc: t('scanner.euAiActCompliantDesc') },
                { icon: '📋', title: t('scanner.detailedReport'), desc: t('scanner.detailedReportDesc') },
              ].map((item, idx) => (
                <Card key={idx} className="text-center">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </Card>
              ))}
            </div>
          </>
        ) : (
          // Results View
          <>
            {/* Risk Level Header */}
            <Card className={`mb-6 bg-gradient-to-r ${riskConfig?.gradient} text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80 mb-1">{t('scanner.riskClassification')}</p>
                  <h2 className="text-3xl font-bold">{result.riskLevelLabel}</h2>
                  <p className="mt-2 opacity-90">{result.summary}</p>
                </div>
                <div className="text-right">
                  <div className="text-6xl font-bold opacity-90">{result.riskScore}</div>
                  <div className="text-sm opacity-80">{t('scanner.riskScore')}</div>
                </div>
              </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card className="text-center">
                <div className="text-3xl font-bold text-gray-900">{result.findingsCount}</div>
                <div className="text-sm text-gray-500">{t('scanner.findingsTotal')}</div>
              </Card>
              <Card className="text-center">
                <div className="text-3xl font-bold text-red-600">{result.criticalCount}</div>
                <div className="text-sm text-gray-500">{t('scanner.critical')}</div>
              </Card>
              <Card className="text-center">
                <div className="text-3xl font-bold text-orange-600">{result.highCount}</div>
                <div className="text-sm text-gray-500">{t('scanner.high')}</div>
              </Card>
            </div>

            {/* Findings */}
            <Card className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('scanner.findings')}</h3>
              <div className="space-y-3">
                {result.analysis.findings.map((finding, idx) => {
                  const severityConfig = SEVERITY_CONFIG[finding.severity];
                  const isExpanded = expandedFindings.has(idx);

                  return (
                    <div
                      key={idx}
                      className={`border rounded-lg overflow-hidden ${severityConfig.border}`}
                    >
                      <button
                        onClick={() => toggleFinding(idx)}
                        className={`w-full px-4 py-3 flex items-center justify-between ${severityConfig.bg} hover:opacity-90 transition-opacity`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${severityConfig.bg} ${severityConfig.text}`}>
                            {severityLabels[finding.severity]}
                          </span>
                          <span className="font-medium text-gray-900">{finding.title}</span>
                        </div>
                        <svg
                          className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isExpanded && (
                        <div className="px-4 py-4 bg-white space-y-4">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-500 mb-1">{t('scanner.category')}</h4>
                            <p className="text-gray-900">{finding.category}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-500 mb-1">{t('scanner.descriptionLabel2')}</h4>
                            <p className="text-gray-700">{finding.description}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-500 mb-1">{t('scanner.recommendation')}</h4>
                            <p className="text-gray-700">{finding.recommendation}</p>
                          </div>
                          {finding.articleReference && (
                            <div className="pt-2 border-t">
                              <span className="text-xs text-indigo-600 font-medium">
                                📖 {finding.articleReference}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Next Steps */}
            <Card className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('scanner.nextSteps')}</h3>
              <div className="space-y-2">
                {result.analysis.nextSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {idx + 1}
                    </span>
                    <span className="text-gray-700">{step}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Detected Features */}
            {result.analysis.detectedFeatures.length > 0 && (
              <Card className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('scanner.detectedFeatures')}</h3>
                <div className="flex flex-wrap gap-2">
                  {result.analysis.detectedFeatures.map((feature, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <Button onClick={handleNewScan} variant="secondary" className="flex-1">
                {t('scanner.newAnalysis')}
              </Button>
              <Button
                onClick={() => {
                  // Download PDF report
                  const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/scanner/report/${result.scanId}`;
                  window.open(url, '_blank');
                }}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {t('scanner.downloadPdf')}
              </Button>
            </div>

            {/* Disclaimer */}
            <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm text-gray-600 text-center">
              {t('scanner.disclaimer')}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
