import React, { useState, useEffect } from "react";
import { StepIndicator } from "../components/StepIndicator";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { AuditSaveBar } from "../components/AuditSaveBar";
import { useAudit } from "../context/AuditContext";
import { Requirement, RequirementStatus, RequirementDocument } from "../models/types";
import {
  getRequirementsForRisk,
  groupRequirementsByCategory,
} from "../utils/requirements";
import { RequirementDocumentUpload } from "../components/RequirementDocumentUpload";

const STEPS = [
  { number: 1, title: "Risiko einstufen" },
  { number: 2, title: "Anforderungen prüfen" },
  { number: 3, title: "Maßnahmenkatalog" },
];

export const AuditPage: React.FC = () => {
  const { state, updateAuditAnswer, setCurrentStep } = useAudit();

  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (!state.riskClass) {
      // Wenn keine Risikoklasse vorhanden, zurück zu Schritt 1
      setCurrentStep(1);
      return;
    }

    const reqs = getRequirementsForRisk(state.riskClass);
    setRequirements(reqs);

    // Alle Kategorien initial aufklappen
    const categories = new Set(reqs.map((r) => r.category));
    setExpandedCategories(categories);
  }, [state.riskClass, setCurrentStep]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const getAnswerForRequirement = (reqId: string) => {
    return state.auditAnswers.find((a) => a.requirementId === reqId);
  };

  const handleStatusChange = (reqId: string, status: RequirementStatus) => {
    const existing = getAnswerForRequirement(reqId);
    updateAuditAnswer({
      requirementId: reqId,
      status,
      notes: existing?.notes || "",
      documents: existing?.documents || [],
    });
  };

  const handleNotesChange = (reqId: string, notes: string) => {
    const existing = getAnswerForRequirement(reqId);
    updateAuditAnswer({
      requirementId: reqId,
      status: existing?.status || "non_compliant",
      notes,
      documents: existing?.documents || [],
    });
  };

  const handleDocumentsChange = (reqId: string, documents: RequirementDocument[]) => {
    const existing = getAnswerForRequirement(reqId);
    updateAuditAnswer({
      requirementId: reqId,
      status: existing?.status || "non_compliant",
      notes: existing?.notes || "",
      documents,
    });
  };

  const calculateProgress = () => {
    const answered = state.auditAnswers.length;
    const total = requirements.length;
    return { answered, total, percentage: total > 0 ? (answered / total) * 100 : 0 };
  };

  const canProceed = () => {
    // Prüfe ob mindestens eine Anforderung nicht erfüllt ist
    return state.auditAnswers.some(
      (a) => a.status === "non_compliant" || a.status === "partially_compliant"
    );
  };

  const handleGenerateActionPlan = () => {
    setCurrentStep(3);
  };

  const groupedRequirements = groupRequirementsByCategory(requirements);
  const progress = calculateProgress();

  if (requirements.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StepIndicator currentStep={2} steps={STEPS} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <p className="text-gray-600">
              Keine spezifischen Anforderungen für diese Risikoklasse. Bitte
              kehren Sie zu Schritt 1 zurück.
            </p>
            <Button onClick={() => setCurrentStep(1)} className="mt-4">
              Zurück zu Schritt 1
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StepIndicator currentStep={2} steps={STEPS} />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Schritt 2: Anforderungen prüfen
        </h1>
        <p className="text-gray-600 mb-6">
          Bewerten Sie den Erfüllungsgrad jeder Anforderung für Ihr{" "}
          <strong>{state.riskClass}</strong>-System.
        </p>

        {/* Progress Bar */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Fortschritt
            </span>
            <span className="text-sm font-medium text-gray-700">
              {progress.answered} / {progress.total} Anforderungen bewertet
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </Card>

        {/* Requirements by Category */}
        <div className="space-y-4 mb-6">
          {Array.from(groupedRequirements.entries()).map(
            ([category, categoryReqs]) => (
              <Card key={category} className="overflow-hidden">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors -m-6 mb-4"
                >
                  <h3 className="text-xl font-semibold text-gray-900">
                    {category}
                  </h3>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      {
                        categoryReqs.filter((r) =>
                          getAnswerForRequirement(r.id)
                        ).length
                      }{" "}
                      / {categoryReqs.length}
                    </span>
                    <svg
                      className={`w-6 h-6 transition-transform ${
                        expandedCategories.has(category) ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                {/* Category Requirements */}
                {expandedCategories.has(category) && (
                  <div className="space-y-6">
                    {categoryReqs.map((req) => {
                      const answer = getAnswerForRequirement(req.id);
                      return (
                        <div
                          key={req.id}
                          className="border-l-4 border-blue-500 pl-4 py-2"
                        >
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {req.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-4">
                            {req.description}
                          </p>

                          {/* Status Selection */}
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Status
                            </label>
                            <select
                              value={answer?.status || ""}
                              onChange={(e) =>
                                handleStatusChange(
                                  req.id,
                                  e.target.value as RequirementStatus
                                )
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Bitte wählen...</option>
                              <option value="compliant">✅ Erfüllt</option>
                              <option value="partially_compliant">
                                ⚠️ Teilweise erfüllt
                              </option>
                              <option value="non_compliant">
                                ❌ Nicht erfüllt
                              </option>
                              <option value="not_applicable">
                                ➖ Nicht zutreffend
                              </option>
                            </select>
                          </div>

                          {/* Notes */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Hinweise / Notizen
                            </label>
                            <textarea
                              value={answer?.notes || ""}
                              onChange={(e) =>
                                handleNotesChange(req.id, e.target.value)
                              }
                              placeholder="Zusätzliche Anmerkungen, Begründung, offene Fragen..."
                              rows={2}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </div>

                          {/* Document Upload with AI Analysis */}
                          <RequirementDocumentUpload
                            requirementId={req.id}
                            requirementTitle={req.title}
                            documents={answer?.documents || []}
                            onDocumentsChange={(docs) => handleDocumentsChange(req.id, docs)}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            )
          )}
        </div>

        {/* Action Buttons */}
        <Card>
          <div className="flex gap-4">
            <Button
              variant="secondary"
              onClick={() => setCurrentStep(1)}
              className="flex-1"
            >
              ← Zurück zu Schritt 1
            </Button>
            <Button
              onClick={handleGenerateActionPlan}
              disabled={!canProceed()}
              className="flex-1"
            >
              Maßnahmenkatalog generieren →
            </Button>
          </div>
          {!canProceed() && (
            <p className="text-sm text-gray-500 mt-3 text-center">
              Mindestens eine Anforderung muss "nicht erfüllt" oder "teilweise
              erfüllt" sein, um einen Maßnahmenkatalog zu generieren.
            </p>
          )}
        </Card>

        {/* Floating Save Bar */}
        <AuditSaveBar />
      </div>
    </div>
  );
};
