import React from "react";

interface Step {
  number: number;
  title: string;
}

interface StepIndicatorProps {
  currentStep: number;
  steps: Step[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  steps,
}) => {
  return (
    <div className="w-full bg-white shadow-sm border-b border-gray-200 mb-8">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              {/* Step Circle */}
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold
                    ${
                      step.number === currentStep
                        ? "bg-blue-600 text-white"
                        : step.number < currentStep
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-gray-600"
                    }
                  `}
                >
                  {step.number < currentStep ? "✓" : step.number}
                </div>
                <div
                  className={`
                    mt-2 text-sm text-center
                    ${
                      step.number === currentStep
                        ? "text-blue-600 font-semibold"
                        : step.number < currentStep
                        ? "text-green-600"
                        : "text-gray-500"
                    }
                  `}
                >
                  {step.title}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-1 mx-2 mt-[-40px]
                    ${step.number < currentStep ? "bg-green-500" : "bg-gray-300"}
                  `}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
