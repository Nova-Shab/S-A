import React from 'react';
import { AuditWizardProvider, useAuditWizard, AUDIT_STEPS } from '../context/AuditWizardContext';
import { Step0Intro } from '../components/audit-wizard/Step0Intro';
import { Step1Scope } from '../components/audit-wizard/Step1Scope';
import { Step2AISystem } from '../components/audit-wizard/Step2AISystem';
import { Step3RiskClassification } from '../components/audit-wizard/Step3RiskClassification';
import { Step4Requirements } from '../components/audit-wizard/Step4Requirements';
import { Step5Evaluation } from '../components/audit-wizard/Step5Evaluation';
import { Step6Actions } from '../components/audit-wizard/Step6Actions';

// Step progress indicator
const StepIndicator: React.FC = () => {
  const { state, goToStep } = useAuditWizard();
  const currentStep = state.currentStep;

  return (
    <div className="bg-white border-b border-audit-light">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {AUDIT_STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <button
                onClick={() => index <= currentStep && goToStep(index)}
                disabled={index > currentStep}
                className={`flex flex-col items-center transition-all ${
                  index <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    index === currentStep
                      ? 'bg-audit-deep text-white'
                      : index < currentStep
                      ? 'bg-audit-steel text-white'
                      : 'bg-audit-light text-audit-cool'
                  }`}
                >
                  {index < currentStep ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="mt-2 text-center hidden sm:block">
                  <div className={`text-xs font-medium ${
                    index === currentStep ? 'text-audit-deep' : 'text-audit-cool'
                  }`}>
                    {step.title}
                  </div>
                </div>
              </button>
              {index < AUDIT_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    index < currentStep ? 'bg-audit-steel' : 'bg-audit-light'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

// Auto-save indicator
const AutoSaveIndicator: React.FC = () => {
  const { state } = useAuditWizard();
  const [showSaved, setShowSaved] = React.useState(false);

  React.useEffect(() => {
    setShowSaved(true);
    const timeout = setTimeout(() => setShowSaved(false), 2000);
    return () => clearTimeout(timeout);
  }, [state.updatedAt]);

  return (
    <div className={`text-meta text-audit-cool transition-opacity ${showSaved ? 'opacity-100' : 'opacity-0'}`}>
      <span className="flex items-center">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Automatisch gespeichert
      </span>
    </div>
  );
};

// Main wizard content
const WizardContent: React.FC = () => {
  const { state } = useAuditWizard();

  const renderStep = () => {
    switch (state.currentStep) {
      case 0:
        return <Step0Intro />;
      case 1:
        return <Step1Scope />;
      case 2:
        return <Step2AISystem />;
      case 3:
        return <Step3RiskClassification />;
      case 4:
        return <Step4Requirements />;
      case 5:
        return <Step5Evaluation />;
      case 6:
        return <Step6Actions />;
      default:
        return <Step0Intro />;
    }
  };

  return (
    <div className="min-h-screen bg-audit-bg">
      {/* Header */}
      <div className="bg-white shadow-audit">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src="/images/logo.svg" alt="Calmpliance Scanner" className="h-8 w-auto mr-4" />
              <div>
                <h1 className="text-h3 text-audit-deep">EU AI Act Audit</h1>
                <p className="text-meta text-audit-cool">
                  {AUDIT_STEPS[state.currentStep].description}
                </p>
              </div>
            </div>
            <AutoSaveIndicator />
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <StepIndicator />

      {/* Step content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {renderStep()}
      </div>
    </div>
  );
};

// Main page component with provider
export const AuditWizardPage: React.FC = () => {
  return (
    <AuditWizardProvider>
      <WizardContent />
    </AuditWizardProvider>
  );
};

export default AuditWizardPage;
