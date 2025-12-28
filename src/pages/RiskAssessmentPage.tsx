import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { StepIndicator } from "../components/StepIndicator";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { RiskSuggestionCard } from "../components/RiskSuggestionCard";
import { SystemImportModal } from "../components/SystemImportModal";
import { AuditSaveBar } from "../components/AuditSaveBar";
import { useAudit } from "../context/AuditContext";
import { useSystems } from "../context/SystemsContext";
import {
  AiSystemInfo,
  EuAiActRole,
  AnnexIIICategory,
  SystemBoundaries,
  EU_AI_ACT_ROLES,
  ANNEX_III_CATEGORIES,
  validateSystemInfo,
  defaultSystemBoundaries,
} from "../models/types";
import {
  classifyRisk,
  getRiskClassDescription,
  getNextStepsForRisk,
  suggestRiskClass,
} from "../utils/riskClassification";

const STEPS = [
  { number: 1, title: "Risiko einstufen" },
  { number: 2, title: "Anforderungen prüfen" },
  { number: 3, title: "Maßnahmenkatalog" },
];

// Formular-Schritte für bessere UX
type FormStep = "system" | "purpose" | "boundaries" | "risk" | "result";

export const RiskAssessmentPage: React.FC = () => {
  const { state, setSystemInfo, setRiskClass, setCurrentStep } = useAudit();
  const { getSystemById, updateSystemWithHistory } = useSystems();
  const [searchParams] = useSearchParams();
  const linkedSystemId = searchParams.get('systemId');

  // Formular-Schritt
  const [formStep, setFormStep] = useState<FormStep>("system");

  // K-01: System-Identifikation
  const [systemName, setSystemName] = useState(state.systemInfo?.systemName || "");
  const [systemVersion, setSystemVersion] = useState(state.systemInfo?.systemVersion || "");
  const [systemProvider, setSystemProvider] = useState(state.systemInfo?.systemProvider || "");
  const [euAiActRole, setEuAiActRole] = useState<EuAiActRole | "">(state.systemInfo?.euAiActRole || "");

  // K-02: Zweckbestimmung
  const [primaryPurpose, setPrimaryPurpose] = useState(state.systemInfo?.primaryPurpose || "");
  const [annexIIICategories, setAnnexIIICategories] = useState<AnnexIIICategory[]>(
    state.systemInfo?.annexIIICategories || []
  );
  const [intendedUsers, setIntendedUsers] = useState(state.systemInfo?.intendedUsers || "");
  const [prohibitedUses, setProhibitedUses] = useState(state.systemInfo?.prohibitedUses || "");
  const [foreseenMisuse, setForeseenMisuse] = useState(state.systemInfo?.foreseenMisuse || "");

  // K-04: Systemabgrenzung
  const [systemBoundaries, setSystemBoundaries] = useState<SystemBoundaries>(
    state.systemInfo?.systemBoundaries || defaultSystemBoundaries
  );
  const [newComponent, setNewComponent] = useState("");
  const [newExcludedComponent, setNewExcludedComponent] = useState("");
  const [newDataInput, setNewDataInput] = useState("");
  const [newDataOutput, setNewDataOutput] = useState("");
  const [newIntegrationPoint, setNewIntegrationPoint] = useState("");

  // Bestehende Felder für Risikobewertung
  const [domain, setDomain] = useState(state.systemInfo?.domain || "");
  const [useCase, setUseCase] = useState(state.systemInfo?.useCase || "");
  const [impactLevel, setImpactLevel] = useState<"low" | "medium" | "high">(
    state.systemInfo?.impactLevel || "low"
  );
  const [biometricOrSurveillance, setBiometricOrSurveillance] = useState(
    state.systemInfo?.biometricOrSurveillance || false
  );
  const [euImpact, setEuImpact] = useState(
    state.systemInfo?.euImpact ?? true
  );

  const [showResult, setShowResult] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ field: string; message: string }[]>([]);

  // V-02: Import-Modal
  const [showImportModal, setShowImportModal] = useState(false);

  // Load data from linked system on mount
  useEffect(() => {
    if (linkedSystemId && !state.systemInfo) {
      const linkedSystem = getSystemById(linkedSystemId);
      if (linkedSystem?.systemInfo) {
        const info = linkedSystem.systemInfo;
        // Pre-fill form with linked system data
        if (info.systemName) setSystemName(info.systemName);
        if (info.systemVersion) setSystemVersion(info.systemVersion);
        if (info.systemProvider) setSystemProvider(info.systemProvider);
        if (info.euAiActRole) setEuAiActRole(info.euAiActRole);
        if (info.primaryPurpose) setPrimaryPurpose(info.primaryPurpose);
        if (info.annexIIICategories) setAnnexIIICategories(info.annexIIICategories);
        if (info.intendedUsers) setIntendedUsers(info.intendedUsers);
        if (info.prohibitedUses) setProhibitedUses(info.prohibitedUses);
        if (info.foreseenMisuse) setForeseenMisuse(info.foreseenMisuse);
        if (info.systemBoundaries) setSystemBoundaries(info.systemBoundaries);
        if (info.domain) setDomain(info.domain);
        if (info.useCase) setUseCase(info.useCase);
        if (info.impactLevel) setImpactLevel(info.impactLevel);
        if (info.biometricOrSurveillance !== undefined) setBiometricOrSurveillance(info.biometricOrSurveillance);
        if (info.euImpact !== undefined) setEuImpact(info.euImpact);
      }
    }
  }, [linkedSystemId, getSystemById, state.systemInfo]);

  // V-02: Import-Handler
  const handleImport = (imported: Partial<AiSystemInfo>) => {
    // System-Identifikation
    if (imported.systemName) setSystemName(imported.systemName);
    if (imported.systemVersion) setSystemVersion(imported.systemVersion);
    if (imported.systemProvider) setSystemProvider(imported.systemProvider);
    if (imported.euAiActRole) setEuAiActRole(imported.euAiActRole);

    // Zweckbestimmung
    if (imported.primaryPurpose) setPrimaryPurpose(imported.primaryPurpose);
    if (imported.annexIIICategories) setAnnexIIICategories(imported.annexIIICategories);
    if (imported.intendedUsers) setIntendedUsers(imported.intendedUsers);
    if (imported.prohibitedUses) setProhibitedUses(imported.prohibitedUses);
    if (imported.foreseenMisuse) setForeseenMisuse(imported.foreseenMisuse);

    // Systemabgrenzung
    if (imported.systemBoundaries) setSystemBoundaries(imported.systemBoundaries);

    // Risikobewertung
    if (imported.domain) setDomain(imported.domain);
    if (imported.useCase) setUseCase(imported.useCase);
    if (imported.impactLevel) setImpactLevel(imported.impactLevel);
    if (imported.biometricOrSurveillance !== undefined) setBiometricOrSurveillance(imported.biometricOrSurveillance);
    if (imported.euImpact !== undefined) setEuImpact(imported.euImpact);

    // Auch im Context speichern für AuditSaveBar
    const partialSystemInfo: AiSystemInfo = {
      systemName: imported.systemName || "",
      systemVersion: imported.systemVersion || "",
      systemProvider: imported.systemProvider || "",
      euAiActRole: imported.euAiActRole || "DEPLOYER",
      primaryPurpose: imported.primaryPurpose || "",
      annexIIICategories: imported.annexIIICategories || [],
      intendedUsers: imported.intendedUsers || "",
      prohibitedUses: imported.prohibitedUses || "",
      foreseenMisuse: imported.foreseenMisuse || "",
      domain: imported.domain || "",
      useCase: imported.useCase || "",
      impactLevel: imported.impactLevel || "low",
      biometricOrSurveillance: imported.biometricOrSurveillance || false,
      euImpact: imported.euImpact ?? true,
      systemBoundaries: imported.systemBoundaries || defaultSystemBoundaries,
    };
    setSystemInfo(partialSystemInfo);
  };

  // V-01: Automatische Risikovorschau berechnen
  const riskSuggestion = useMemo(() => {
    return suggestRiskClass(
      annexIIICategories,
      euAiActRole,
      primaryPurpose,
      biometricOrSurveillance
    );
  }, [annexIIICategories, euAiActRole, primaryPurpose, biometricOrSurveillance]);

  // Toggle Kategorie-Auswahl
  const toggleCategory = (category: AnnexIIICategory) => {
    setAnnexIIICategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Array-Helfer für Systemabgrenzung
  const addToArray = (
    field: keyof SystemBoundaries,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (value.trim()) {
      setSystemBoundaries((prev) => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()],
      }));
      setter("");
    }
  };

  const removeFromArray = (field: keyof SystemBoundaries, index: number) => {
    setSystemBoundaries((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }));
  };

  // K-03: Validierung
  const validateAndProceed = () => {
    const systemInfo: Partial<AiSystemInfo> = {
      systemName,
      systemVersion,
      systemProvider,
      euAiActRole: euAiActRole as EuAiActRole,
      primaryPurpose,
      annexIIICategories,
      intendedUsers,
      prohibitedUses,
      foreseenMisuse,
      systemBoundaries,
      domain,
      useCase,
      impactLevel,
      biometricOrSurveillance,
      euImpact,
    };

    const validation = validateSystemInfo(systemInfo);

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      // Springe zum ersten fehlerhaften Schritt
      const firstError = validation.errors[0];
      if (firstError.field.startsWith("systemName") || firstError.field === "euAiActRole") {
        setFormStep("system");
      } else if (firstError.field.startsWith("primary") || firstError.field.startsWith("annex")) {
        setFormStep("purpose");
      } else if (firstError.field.startsWith("system")) {
        setFormStep("boundaries");
      } else {
        setFormStep("risk");
      }
      return;
    }

    setValidationErrors([]);
    handleCalculateRisk();
  };

  const handleCalculateRisk = () => {
    const systemInfo: AiSystemInfo = {
      systemName,
      systemVersion,
      systemProvider,
      euAiActRole: euAiActRole as EuAiActRole,
      primaryPurpose,
      annexIIICategories,
      intendedUsers,
      prohibitedUses,
      foreseenMisuse,
      systemBoundaries,
      domain,
      useCase,
      impactLevel,
      biometricOrSurveillance,
      euImpact,
    };

    const riskClass = classifyRisk(systemInfo);

    setSystemInfo(systemInfo);
    setRiskClass(riskClass);

    // Sync with linked system in Systems registry
    if (linkedSystemId) {
      const linkedSystem = getSystemById(linkedSystemId);
      if (linkedSystem) {
        updateSystemWithHistory(linkedSystemId, {
          systemInfo,
          riskClass,
          status: 'UNDER_REVIEW'
        });
      }
    }

    setFormStep("result");
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

  const getFieldError = (field: string) => {
    return validationErrors.find((e) => e.field === field)?.message;
  };

  const renderFormStep = () => {
    switch (formStep) {
      case "system":
        return renderSystemStep();
      case "purpose":
        return renderPurposeStep();
      case "boundaries":
        return renderBoundariesStep();
      case "risk":
        return renderRiskStep();
      case "result":
        return renderResultStep();
      default:
        return null;
    }
  };

  // Schritt 1: System-Identifikation (K-01)
  const renderSystemStep = () => (
    <Card>
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              1. KI-System identifizieren
            </h2>
            <p className="text-gray-600 text-sm">
              Definieren Sie das zu prüfende KI-System eindeutig.
            </p>
          </div>
          {/* V-02: Import-Button */}
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Importieren
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* System-Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name des KI-Systems *
          </label>
          <input
            type="text"
            value={systemName}
            onChange={(e) => setSystemName(e.target.value)}
            placeholder="z.B. HR-Screening AI v2.0"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              getFieldError("systemName") ? "border-red-500" : "border-gray-300"
            }`}
          />
          {getFieldError("systemName") && (
            <p className="text-red-500 text-sm mt-1">{getFieldError("systemName")}</p>
          )}
        </div>

        {/* Version */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Version
          </label>
          <input
            type="text"
            value={systemVersion}
            onChange={(e) => setSystemVersion(e.target.value)}
            placeholder="z.B. 2.0.1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Anbieter/Hersteller */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Anbieter/Hersteller des Systems
          </label>
          <input
            type="text"
            value={systemProvider}
            onChange={(e) => setSystemProvider(e.target.value)}
            placeholder="z.B. TechCorp GmbH oder Eigenentwicklung"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Rolle nach EU AI Act */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ihre Rolle nach EU AI Act *
          </label>
          <p className="text-sm text-gray-500 mb-3">
            Welche Rolle nimmt Ihr Unternehmen in Bezug auf dieses KI-System ein?
          </p>
          <div className="space-y-3">
            {EU_AI_ACT_ROLES.map((role) => (
              <label
                key={role.value}
                className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                  euAiActRole === role.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="euAiActRole"
                  value={role.value}
                  checked={euAiActRole === role.value}
                  onChange={() => setEuAiActRole(role.value)}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">
                    {role.label}
                    <span className="text-xs text-gray-500 ml-2">({role.article})</span>
                  </div>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </div>
              </label>
            ))}
          </div>
          {getFieldError("euAiActRole") && (
            <p className="text-red-500 text-sm mt-2">{getFieldError("euAiActRole")}</p>
          )}
        </div>

        <div className="pt-4 flex justify-end">
          <Button onClick={() => setFormStep("purpose")}>
            Weiter: Zweckbestimmung →
          </Button>
        </div>
      </div>
    </Card>
  );

  // Schritt 2: Zweckbestimmung (K-02)
  const renderPurposeStep = () => (
    <Card>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          2. Zweckbestimmung definieren
        </h2>
        <p className="text-gray-600 text-sm">
          Beschreiben Sie den Zweck und die Einsatzbereiche des KI-Systems.
        </p>
      </div>

      <div className="space-y-6">
        {/* Hauptzweck */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hauptzweck des KI-Systems *
          </label>
          <textarea
            value={primaryPurpose}
            onChange={(e) => setPrimaryPurpose(e.target.value)}
            placeholder="Beschreiben Sie, wofür das System eingesetzt wird..."
            rows={3}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              getFieldError("primaryPurpose") ? "border-red-500" : "border-gray-300"
            }`}
          />
          {getFieldError("primaryPurpose") && (
            <p className="text-red-500 text-sm mt-1">{getFieldError("primaryPurpose")}</p>
          )}
        </div>

        {/* Anhang III Kategorien */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Anwendungsbereich nach Anhang III EU AI Act *
          </label>
          <p className="text-sm text-gray-500 mb-3">
            Wählen Sie alle zutreffenden Kategorien aus.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ANNEX_III_CATEGORIES.map((category) => (
              <label
                key={category.value}
                className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                  annexIIICategories.includes(category.value)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={annexIIICategories.includes(category.value)}
                  onChange={() => toggleCategory(category.value)}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900 text-sm">{category.label}</div>
                  <p className="text-xs text-gray-500">{category.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Beispiele: {category.examples.join(", ")}
                  </p>
                </div>
              </label>
            ))}
          </div>
          {getFieldError("annexIIICategories") && (
            <p className="text-red-500 text-sm mt-2">{getFieldError("annexIIICategories")}</p>
          )}
        </div>

        {/* V-01: Risikovorschau */}
        <div className="my-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vorläufige Risikoeinschätzung
          </label>
          <RiskSuggestionCard suggestion={riskSuggestion} />
        </div>

        {/* Vorgesehene Nutzer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vorgesehene Nutzer
          </label>
          <input
            type="text"
            value={intendedUsers}
            onChange={(e) => setIntendedUsers(e.target.value)}
            placeholder="z.B. HR-Manager, medizinisches Fachpersonal..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Verbotene Verwendungen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ausdrücklich verbotene Verwendungen
          </label>
          <textarea
            value={prohibitedUses}
            onChange={(e) => setProhibitedUses(e.target.value)}
            placeholder="Beschreiben Sie Verwendungen, für die das System NICHT eingesetzt werden darf..."
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Vorhersehbare Fehlanwendungen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vorhersehbare Fehlanwendungen (Art. 9 Abs. 2 lit. a)
          </label>
          <textarea
            value={foreseenMisuse}
            onChange={(e) => setForeseenMisuse(e.target.value)}
            placeholder="Welche Fehlanwendungen sind vernünftigerweise vorhersehbar?"
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="pt-4 flex justify-between">
          <Button variant="secondary" onClick={() => setFormStep("system")}>
            ← Zurück
          </Button>
          <Button onClick={() => setFormStep("boundaries")}>
            Weiter: Systemabgrenzung →
          </Button>
        </div>
      </div>
    </Card>
  );

  // Schritt 3: Systemabgrenzung (K-04)
  const renderBoundariesStep = () => (
    <Card>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          3. Systemabgrenzung definieren
        </h2>
        <p className="text-gray-600 text-sm">
          Definieren Sie die technischen Grenzen des KI-Systems.
        </p>
      </div>

      <div className="space-y-6">
        {/* Enthaltene Komponenten */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Komponenten des KI-Systems *
          </label>
          <p className="text-sm text-gray-500 mb-2">
            Welche technischen Komponenten gehören zum KI-System?
          </p>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newComponent}
              onChange={(e) => setNewComponent(e.target.value)}
              placeholder="z.B. ML-Modell, Preprocessing-Pipeline..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === "Enter" && addToArray("includedComponents", newComponent, setNewComponent)}
            />
            <Button onClick={() => addToArray("includedComponents", newComponent, setNewComponent)}>
              Hinzufügen
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {systemBoundaries.includedComponents.map((comp, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {comp}
                <button
                  onClick={() => removeFromArray("includedComponents", idx)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          {getFieldError("systemBoundaries.includedComponents") && (
            <p className="text-red-500 text-sm mt-1">{getFieldError("systemBoundaries.includedComponents")}</p>
          )}
        </div>

        {/* Ausgeschlossene Komponenten */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            NICHT zum KI-System gehörende Komponenten
          </label>
          <p className="text-sm text-gray-500 mb-2">
            Welche Komponenten sind ausdrücklich nicht Teil des KI-Systems?
          </p>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newExcludedComponent}
              onChange={(e) => setNewExcludedComponent(e.target.value)}
              placeholder="z.B. Datenbank, UI-Frontend..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === "Enter" && addToArray("excludedComponents", newExcludedComponent, setNewExcludedComponent)}
            />
            <Button variant="secondary" onClick={() => addToArray("excludedComponents", newExcludedComponent, setNewExcludedComponent)}>
              Hinzufügen
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {systemBoundaries.excludedComponents.map((comp, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {comp}
                <button
                  onClick={() => removeFromArray("excludedComponents", idx)}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Dateneingaben */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dateneingaben
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newDataInput}
              onChange={(e) => setNewDataInput(e.target.value)}
              placeholder="z.B. Lebenslaufdaten, Bilddaten..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === "Enter" && addToArray("dataInputs", newDataInput, setNewDataInput)}
            />
            <Button variant="secondary" onClick={() => addToArray("dataInputs", newDataInput, setNewDataInput)}>
              +
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {systemBoundaries.dataInputs.map((input, idx) => (
              <span key={idx} className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                → {input}
                <button onClick={() => removeFromArray("dataInputs", idx)} className="ml-2">×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Datenausgaben */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Datenausgaben/Entscheidungen
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newDataOutput}
              onChange={(e) => setNewDataOutput(e.target.value)}
              placeholder="z.B. Ranking-Score, Empfehlung..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === "Enter" && addToArray("dataOutputs", newDataOutput, setNewDataOutput)}
            />
            <Button variant="secondary" onClick={() => addToArray("dataOutputs", newDataOutput, setNewDataOutput)}>
              +
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {systemBoundaries.dataOutputs.map((output, idx) => (
              <span key={idx} className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                ← {output}
                <button onClick={() => removeFromArray("dataOutputs", idx)} className="ml-2">×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Menschliche Aufsicht */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Art der menschlichen Aufsicht (Art. 14) *
          </label>
          <textarea
            value={systemBoundaries.humanOversight}
            onChange={(e) => setSystemBoundaries((prev) => ({ ...prev, humanOversight: e.target.value }))}
            placeholder="Beschreiben Sie, wie menschliche Aufsicht gewährleistet wird..."
            rows={2}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              getFieldError("systemBoundaries.humanOversight") ? "border-red-500" : "border-gray-300"
            }`}
          />
          {getFieldError("systemBoundaries.humanOversight") && (
            <p className="text-red-500 text-sm mt-1">{getFieldError("systemBoundaries.humanOversight")}</p>
          )}
        </div>

        {/* Integrationspunkte */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Integrationspunkte mit anderen Systemen
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newIntegrationPoint}
              onChange={(e) => setNewIntegrationPoint(e.target.value)}
              placeholder="z.B. SAP HR, Bewerber-Portal..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === "Enter" && addToArray("integrationPoints", newIntegrationPoint, setNewIntegrationPoint)}
            />
            <Button variant="secondary" onClick={() => addToArray("integrationPoints", newIntegrationPoint, setNewIntegrationPoint)}>
              +
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {systemBoundaries.integrationPoints.map((point, idx) => (
              <span key={idx} className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                ↔ {point}
                <button onClick={() => removeFromArray("integrationPoints", idx)} className="ml-2">×</button>
              </span>
            ))}
          </div>
        </div>

        <div className="pt-4 flex justify-between">
          <Button variant="secondary" onClick={() => setFormStep("purpose")}>
            ← Zurück
          </Button>
          <Button onClick={() => setFormStep("risk")}>
            Weiter: Risikobewertung →
          </Button>
        </div>
      </div>
    </Card>
  );

  // Schritt 4: Risikobewertung (bestehend)
  const renderRiskStep = () => (
    <Card>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          4. Risikobewertung
        </h2>
        <p className="text-gray-600 text-sm">
          Beantworten Sie die folgenden Fragen zur Risikoklassifizierung.
        </p>
      </div>

      <div className="space-y-6">
        {/* Domain */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            In welchem Bereich wird das System eingesetzt? *
          </label>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              getFieldError("domain") ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Bitte wählen...</option>
            <option value="Gesundheitswesen">Gesundheitswesen</option>
            <option value="Personal/HR">Personal/HR</option>
            <option value="Kreditvergabe">Kreditvergabe / Finanzdienstleistungen</option>
            <option value="Kritische Infrastruktur">Kritische Infrastruktur</option>
            <option value="Bildung">Bildung</option>
            <option value="Strafverfolgung">Strafverfolgung</option>
            <option value="Migration/Asyl">Migration/Asyl</option>
            <option value="Justiz">Justiz</option>
            <option value="Sonstiges">Sonstiges</option>
          </select>
          {getFieldError("domain") && (
            <p className="text-red-500 text-sm mt-1">{getFieldError("domain")}</p>
          )}
        </div>

        {/* Use Case */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wofür wird die KI genutzt? *
          </label>
          <textarea
            value={useCase}
            onChange={(e) => setUseCase(e.target.value)}
            placeholder="z.B. Automatisierte Bewerbungsselektion, Kreditwürdigkeitsprüfung, medizinische Diagnoseunterstützung..."
            rows={3}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              getFieldError("useCase") ? "border-red-500" : "border-gray-300"
            }`}
          />
          {getFieldError("useCase") && (
            <p className="text-red-500 text-sm mt-1">{getFieldError("useCase")}</p>
          )}
        </div>

        {/* Impact Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hat die Entscheidung des Systems erhebliche Auswirkungen auf Menschen? *
          </label>
          <p className="text-sm text-gray-500 mb-3">
            z.B. auf Rechte, Freiheiten, Chancen, Zugang zu Dienstleistungen
          </p>
          <div className="space-y-2">
            {[
              { value: "low", label: "Gering - Minimale oder keine direkten Auswirkungen" },
              { value: "medium", label: "Mittel - Moderate Auswirkungen möglich" },
              { value: "high", label: "Hoch - Erhebliche Auswirkungen auf Grundrechte, Zugang zu Leistungen oder Chancen" },
            ].map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  value={option.value}
                  checked={impactLevel === option.value}
                  onChange={(e) => setImpactLevel(e.target.value as "low" | "medium" | "high")}
                  className="mr-2"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Biometric or Surveillance */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ist das System für biometrische Identifikation, Überwachung oder Bewertung von Personen gedacht? *
          </label>
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
            Wird das System in der EU eingesetzt oder hat es Auswirkungen auf Personen in der EU? *
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

        {/* Validierungsfehler anzeigen */}
        {validationErrors.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">
              Bitte korrigieren Sie folgende Fehler:
            </h4>
            <ul className="list-disc list-inside text-sm text-red-600">
              {validationErrors.map((error, idx) => (
                <li key={idx}>{error.message}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-4 flex justify-between">
          <Button variant="secondary" onClick={() => setFormStep("boundaries")}>
            ← Zurück
          </Button>
          <Button onClick={validateAndProceed}>
            Risikostufe berechnen
          </Button>
        </div>
      </div>
    </Card>
  );

  // Ergebnis
  const renderResultStep = () => (
    <div className="space-y-6">
      {/* Zusammenfassung der Eingaben */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Systemübersicht
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">System:</span>
            <span className="ml-2 text-gray-900">{systemName} {systemVersion && `(${systemVersion})`}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Rolle:</span>
            <span className="ml-2 text-gray-900">
              {EU_AI_ACT_ROLES.find((r) => r.value === euAiActRole)?.label || "-"}
            </span>
          </div>
          <div className="md:col-span-2">
            <span className="font-medium text-gray-700">Zweck:</span>
            <span className="ml-2 text-gray-900">{primaryPurpose}</span>
          </div>
          <div className="md:col-span-2">
            <span className="font-medium text-gray-700">Kategorien:</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {annexIIICategories.map((cat) => (
                <span key={cat} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                  {ANNEX_III_CATEGORIES.find((c) => c.value === cat)?.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

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
          onClick={() => {
            setShowResult(false);
            setFormStep("system");
          }}
          className="flex-1"
        >
          ← Zurück bearbeiten
        </Button>
        {state.riskClass !== "PROHIBITED" && state.riskClass !== "MINIMAL_RISK" && (
          <Button onClick={handleContinue} className="flex-1">
            Zum Audit fortfahren →
          </Button>
        )}
      </div>
    </div>
  );

  // Schritt-Anzeige
  const getStepNumber = (): number => {
    switch (formStep) {
      case "system": return 1;
      case "purpose": return 2;
      case "boundaries": return 3;
      case "risk": return 4;
      case "result": return 4;
      default: return 1;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StepIndicator currentStep={1} steps={STEPS} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header mit Save-Buttons */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Schritt 1: Risikostufe bestimmen
            </h1>
            <p className="text-gray-600">
              Definieren Sie das KI-System und ermitteln Sie die Risikoklasse.
            </p>
          </div>
          <AuditSaveBar />
        </div>

        {/* Progress-Anzeige */}
        {!showResult && (
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Fortschritt</span>
              <span>Schritt {getStepNumber()} von 4</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(getStepNumber() / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {renderFormStep()}
      </div>

      {/* V-02: Import-Modal */}
      <SystemImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
      />
    </div>
  );
};
