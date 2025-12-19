import React, { useState } from 'react';
import { useAudit } from '../context/AuditContext';
import { LandingPage } from './LandingPage';
import { RiskAssessmentPage } from './RiskAssessmentPage';
import { AuditPage } from './AuditPage';
import { ActionPlanPage } from './ActionPlanPage';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

interface AuditToolsPageProps {
  onBack: () => void;
  demoLead?: {
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    expiresAt?: string;
  } | null;
}

export const AuditToolsPage: React.FC<AuditToolsPageProps> = ({
  onBack,
  demoLead,
}) => {
  const { state, setCurrentStep, resetAudit } = useAudit();
  const [showWelcome, setShowWelcome] = useState(true);

  const handleStartAudit = () => {
    resetAudit();
    setCurrentStep(0);
    setShowWelcome(false);
  };

  const formatExpiryDate = (dateStr?: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Welcome screen for demo users
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Zurück zur Übersicht
          </button>

          {/* Welcome Card */}
          <Card className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full mb-6">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Willkommen bei den Audit Tools
            </h1>

            {demoLead && (
              <p className="text-lg text-gray-600 mb-6">
                Hallo {demoLead.firstName}, Ihr Demo-Zugang ist aktiv!
              </p>
            )}

            {/* Demo Info Banner */}
            {demoLead?.expiresAt && (
              <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-center text-yellow-800">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    Demo-Zugang gültig bis: <strong>{formatExpiryDate(demoLead.expiresAt)}</strong>
                  </span>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="text-4xl mb-3">1️⃣</div>
                <h3 className="font-semibold text-gray-900 mb-2">Risikobewertung</h3>
                <p className="text-sm text-gray-600">
                  Ermitteln Sie die Risikoklasse Ihres KI-Systems nach EU AI Act
                </p>
              </div>

              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="text-4xl mb-3">2️⃣</div>
                <h3 className="font-semibold text-gray-900 mb-2">Audit-Checkliste</h3>
                <p className="text-sm text-gray-600">
                  Prüfen Sie alle relevanten Anforderungen systematisch
                </p>
              </div>

              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="text-4xl mb-3">3️⃣</div>
                <h3 className="font-semibold text-gray-900 mb-2">Aktionsplan</h3>
                <p className="text-sm text-gray-600">
                  Erhalten Sie konkrete Handlungsempfehlungen
                </p>
              </div>
            </div>

            <Button
              onClick={handleStartAudit}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-8 py-4 text-lg"
            >
              Audit starten
            </Button>

            <p className="mt-6 text-sm text-gray-500">
              Dieses Tool dient nur zur Orientierung und ersetzt keine rechtliche Beratung.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // Render audit flow based on current step
  const renderAuditStep = () => {
    switch (state.currentStep) {
      case 0:
        return <LandingPage />;
      case 1:
        return <RiskAssessmentPage />;
      case 2:
        return <AuditPage />;
      case 3:
        return <ActionPlanPage />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="relative">
      {/* Back to Dashboard floating button */}
      <button
        onClick={() => setShowWelcome(true)}
        className="fixed top-4 left-4 z-50 flex items-center px-4 py-2 bg-white shadow-lg rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
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
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        Zurück
      </button>

      {renderAuditStep()}
    </div>
  );
};
