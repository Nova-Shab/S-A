import React from "react";
import {
  RiskSuggestion,
  getRiskClassLabel,
  getRiskClassColor,
} from "../utils/riskClassification";
import { RiskClass } from "../models/types";

interface RiskSuggestionCardProps {
  suggestion: RiskSuggestion;
}

export const RiskSuggestionCard: React.FC<RiskSuggestionCardProps> = ({
  suggestion,
}) => {
  if (!suggestion.suggestedRisk) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center text-gray-500">
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm">{suggestion.reasons[0]}</span>
        </div>
      </div>
    );
  }

  const colors = getRiskClassColor(suggestion.suggestedRisk);
  const label = getRiskClassLabel(suggestion.suggestedRisk);

  const confidenceLabel = {
    low: "Vorläufig",
    medium: "Wahrscheinlich",
    high: "Sehr wahrscheinlich",
  };

  const confidenceIcon = {
    low: "○○○",
    medium: "●○○",
    high: "●●●",
  };

  return (
    <div className={`p-4 ${colors.bg} border-2 ${colors.border} rounded-lg`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <RiskIcon riskClass={suggestion.suggestedRisk} />
          <div className="ml-3">
            <h4 className={`font-semibold ${colors.text}`}>
              Voraussichtliche Risikoklasse
            </h4>
            <p className={`text-lg font-bold ${colors.text}`}>{label}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500">
            {confidenceIcon[suggestion.confidence]}
          </span>
          <p className="text-xs text-gray-600">
            {confidenceLabel[suggestion.confidence]}
          </p>
        </div>
      </div>

      {/* Gründe */}
      {suggestion.reasons.length > 0 && (
        <div className="mb-2">
          <ul className="text-sm text-gray-700 space-y-1">
            {suggestion.reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnungen */}
      {suggestion.warnings.length > 0 && (
        <div className="mt-3 p-2 bg-white/50 rounded border border-current/20">
          {suggestion.warnings.map((warning, idx) => (
            <div key={idx} className="flex items-start text-sm">
              <svg
                className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-amber-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-amber-800">{warning}</span>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-3 italic">
        Dies ist eine vorläufige Einschätzung basierend auf Ihren bisherigen Eingaben.
        Die finale Klassifizierung erfolgt nach Abschluss aller Schritte.
      </p>
    </div>
  );
};

// Icon für Risikoklasse
const RiskIcon: React.FC<{ riskClass: RiskClass }> = ({ riskClass }) => {
  const iconClass = "w-10 h-10";

  switch (riskClass) {
    case "PROHIBITED":
      return (
        <div className="p-2 bg-red-200 rounded-full">
          <svg className={`${iconClass} text-red-700`} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    case "HIGH_RISK":
      return (
        <div className="p-2 bg-orange-200 rounded-full">
          <svg className={`${iconClass} text-orange-700`} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    case "LIMITED_RISK":
      return (
        <div className="p-2 bg-yellow-200 rounded-full">
          <svg className={`${iconClass} text-yellow-700`} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    case "MINIMAL_RISK":
      return (
        <div className="p-2 bg-green-200 rounded-full">
          <svg className={`${iconClass} text-green-700`} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
  }
};

export default RiskSuggestionCard;
