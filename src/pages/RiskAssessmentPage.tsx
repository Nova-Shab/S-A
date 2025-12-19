import React, { useState } from "react";
import { StepIndicator } from "../components/StepIndicator";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { useAudit } from "../context/AuditContext";
import { AiSystemInfo } from "../models/types";
import {
  classifyRisk,
  getRiskClassDescription,
  getNextStepsForRisk,
} from "../utils/riskClassification";

const STEPS = [
  { number: 1, title: "Risiko einstufen" },
  { number: 2, title: "Anforderungen prüfen" },
  { number: 3, title: "Maßnahmenkatalog" },
];

export const RiskAssessmentPage: React.FC = () => {
  const { state, setSystemInfo, setRiskClass, setCurrentStep } = useAudit();

  // Formular-State
  const [domain, setDomain] = useState(state.systemInfo?.domain || "");
  const [useCase, setUseCase] = useState(state.systemInfo?.useCase || "");
  const [impactLevel, setImpactLevel] = useState<"low" | "medium" | "high">(
    state.systemInfo?.impactLevel || "low"
  );
  const [biometricOrSurveillance, setBiometricOrSurveillance] = useState(
    state.systemInfo?.biometricOrSurveillance || false
  );
  const [euImpact, setEuImpact] = useState(
    state.systemInfo?.euImpact || false
  );

  const [showResult, setShowResult] = useState(false);

  const handleCalculateRisk = () => {
    const systemInfo: AiSystemInfo = {
      domain,
      useCase,
      impactLevel,
      biometricOrSurveillance,
      euImpact,
    };

    const riskClass = classifyRisk(systemInfo);

    setSystemInfo(systemInfo);
    setRiskClass(riskClass);
    setShowResult(true);
  };

  const handleContinue = () => {
    if (state.riskClass === "PROHIBITED") {
      alert(
        "Ihr System fällt in die Kategorie verbotener KI-Systeme. Ein Audit ist nicht anwendbar. Bitte konsultieren Sie Rechtsberater:innen."
      );
      return;
    }

    if (state.riskClass === "MINIMAL_RISK") {
      alert(
        "Ihr System hat minimale Risiken und unterliegt keinen spezifischen Anforderungen des EU AI Act. Ein detailliertes Audit ist nicht erforderlich."
      );
      return;
    }

    setCurrentStep(2);
  };

  const isFormValid = () => {
    return domain.trim() !== "" && useCase.trim() !== "" && euImpact !== null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StepIndicator currentStep={1} steps={STEPS} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Schritt 1: Risikostufe bestimmen
        </h1>
        <p className="text-gray-600 mb-8">
          Beantworten Sie die folgenden Fragen, um die Risikoklasse Ihres
          KI-Systems zu ermitteln.
        </p>

        {!showResult ? (
          <Card>
            <div className="space-y-6">
              {/* Domain */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  1. In welchem Bereich wird das System eingesetzt? *
                </label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Bitte wählen...</option>
                  <option value="Gesundheitswesen">Gesundheitswesen</option>
                  <option value="Personal/HR">Personal/HR</option>
                  <option value="Kreditvergabe">
                    Kreditvergabe / Finanzdienstleistungen
                  </option>
                  <option value="Kritische Infrastruktur">
                    Kritische Infrastruktur
                  </option>
                  <option value="Bildung">Bildung</option>
                  <option value="Strafverfolgung">Strafverfolgung</option>
                  <option value="Migration/Asyl">Migration/Asyl</option>
                  <option value="Justiz">Justiz</option>
                  <option value="Sonstiges">Sonstiges</option>
                </select>
              </div>

              {/* Use Case */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2. Wofür wird die KI genutzt? *
                </label>
                <textarea
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  placeholder="z.B. Automatisierte Bewerbungsselektion, Kreditwürdigkeitsprüfung, medizinische Diagnoseunterstützung..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Impact Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  3. Hat die Entscheidung des Systems erhebliche Auswirkungen auf
                  Menschen? *
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  z.B. auf Rechte, Freiheiten, Chancen, Zugang zu
                  Dienstleistungen
                </p>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="low"
                      checked={impactLevel === "low"}
                      onChange={(e) =>
                        setImpactLevel(e.target.value as "low" | "medium" | "high")
                      }
                      className="mr-2"
                    />
                    <span>
                      Gering - Minimale oder keine direkten Auswirkungen
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="medium"
                      checked={impactLevel === "medium"}
                      onChange={(e) =>
                        setImpactLevel(e.target.value as "low" | "medium" | "high")
                      }
                      className="mr-2"
                    />
                    <span>Mittel - Moderate Auswirkungen möglich</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="high"
                      checked={impactLevel === "high"}
                      onChange={(e) =>
                        setImpactLevel(e.target.value as "low" | "medium" | "high")
                      }
                      className="mr-2"
                    />
                    <span>
                      Hoch - Erhebliche Auswirkungen auf Grundrechte, Zugang zu
                      Leistungen oder Chancen
                    </span>
                  </label>
                </div>
              </div>

              {/* Biometric or Surveillance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  4. Ist das System für biometrische Identifikation, Überwachung
                  oder Bewertung von Personen gedacht? *
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  z.B. Gesichtserkennung, Emotionserkennung, Social Scoring
                </p>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={biometricOrSurveillance === true}
                      onChange={() => setBiometricOrSurveillance(true)}
                      className="mr-2"
                    />
                    <span>Ja</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={biometricOrSurveillance === false}
                      onChange={() => setBiometricOrSurveillance(false)}
                      className="mr-2"
                    />
                    <span>Nein</span>
                  </label>
                </div>
              </div>

              {/* EU Impact */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  5. Wird das System in der EU eingesetzt oder hat es
                  Auswirkungen auf Personen in der EU? *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={euImpact === true}
                      onChange={() => setEuImpact(true)}
                      className="mr-2"
                    />
                    <span>Ja</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={euImpact === false}
                      onChange={() => setEuImpact(false)}
                      className="mr-2"
                    />
                    <span>Nein</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  onClick={handleCalculateRisk}
                  disabled={!isFormValid()}
                  className="w-full"
                >
                  Risikostufe berechnen
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          // Result Display
          <div className="space-y-6">
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ergebnis: Risikoklasse
              </h2>

              <div
                className={`
                p-6 rounded-lg mb-6
                ${
                  state.riskClass === "PROHIBITED"
                    ? "bg-red-100 border-2 border-red-500"
                    : state.riskClass === "HIGH_RISK"
                    ? "bg-orange-100 border-2 border-orange-500"
                    : state.riskClass === "LIMITED_RISK"
                    ? "bg-yellow-100 border-2 border-yellow-500"
                    : "bg-green-100 border-2 border-green-500"
                }
              `}
              >
                <h3 className="text-2xl font-bold mb-2">
                  {state.riskClass === "PROHIBITED" && "🚫 PROHIBITED"}
                  {state.riskClass === "HIGH_RISK" && "⚠️ HIGH RISK"}
                  {state.riskClass === "LIMITED_RISK" && "⚡ LIMITED RISK"}
                  {state.riskClass === "MINIMAL_RISK" && "✅ MINIMAL RISK"}
                </h3>
                <p className="text-gray-800">
                  {state.riskClass &&
                    getRiskClassDescription(state.riskClass)
                      .split("**")
                      .map((part, i) =>
                        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                      )}
                </p>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Empfohlene nächste Schritte:
                </h4>
                <ul className="space-y-2">
                  {state.riskClass &&
                    getNextStepsForRisk(state.riskClass).map((step, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                variant="secondary"
                onClick={() => setShowResult(false)}
                className="flex-1"
              >
                ← Zurück bearbeiten
              </Button>
              {state.riskClass !== "PROHIBITED" &&
                state.riskClass !== "MINIMAL_RISK" && (
                  <Button onClick={handleContinue} className="flex-1">
                    Zum Audit fortfahren →
                  </Button>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
