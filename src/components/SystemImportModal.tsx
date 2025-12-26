import React, { useState, useRef } from "react";
import { Button } from "./Button";
import {
  AiSystemInfo,
  EuAiActRole,
  AnnexIIICategory,
  EU_AI_ACT_ROLES,
  ANNEX_III_CATEGORIES,
} from "../models/types";

interface SystemImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (systemInfo: Partial<AiSystemInfo>) => void;
}

type ImportFormat = "json" | "text" | "template";

// Template für JSON-Export
export const SYSTEM_INFO_TEMPLATE: Partial<AiSystemInfo> = {
  systemName: "Name des KI-Systems",
  systemVersion: "1.0.0",
  systemProvider: "Anbieter/Hersteller",
  euAiActRole: "PROVIDER",
  primaryPurpose: "Beschreibung des Hauptzwecks",
  annexIIICategories: ["OTHER"],
  intendedUsers: "Zielgruppe der Nutzer",
  prohibitedUses: "Verbotene Verwendungen",
  foreseenMisuse: "Mögliche Fehlanwendungen",
  domain: "Sonstiges",
  useCase: "Beschreibung des Anwendungsfalls",
  impactLevel: "low",
  biometricOrSurveillance: false,
  euImpact: true,
  systemBoundaries: {
    includedComponents: ["Komponente 1", "Komponente 2"],
    excludedComponents: ["Nicht enthaltene Komponente"],
    dataInputs: ["Eingabedaten"],
    dataOutputs: ["Ausgabedaten"],
    humanOversight: "Art der menschlichen Aufsicht",
    integrationPoints: ["Integration mit System X"],
  },
};

export const SystemImportModal: React.FC<SystemImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [importFormat, setImportFormat] = useState<ImportFormat>("json");
  const [textInput, setTextInput] = useState("");
  const [parseResult, setParseResult] = useState<Partial<AiSystemInfo> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setTextInput(content);
      // Auto-detect format based on content
      autoParseContent(content);
    };
    reader.readAsText(file);
  };

  // Versucht automatisch das Format zu erkennen und zu parsen
  const autoParseContent = (content: string) => {
    setError(null);
    setParseResult(null);

    const trimmed = content.trim();

    // Versuche zuerst JSON zu parsen (auch wenn Format auf "text" steht)
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        const validated = validateAndMapJson(parsed);
        setParseResult(validated);
        setImportFormat("json"); // Update Format-Anzeige
        return;
      } catch {
        // Kein gültiges JSON, weiter mit Textextraktion
      }
    }

    // Fallback: Als Text parsen
    try {
      const extracted = extractFromText(content);
      setParseResult(extracted);
      setImportFormat("text");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Parsen");
    }
  };

  const parseContent = (content: string, format: ImportFormat) => {
    setError(null);
    setParseResult(null);

    try {
      if (format === "json") {
        // Versuche JSON zu parsen, auch wenn es in einem Text-File war
        const trimmed = content.trim();
        const parsed = JSON.parse(trimmed);
        const validated = validateAndMapJson(parsed);
        setParseResult(validated);
      } else if (format === "text") {
        // Versuche zuerst JSON, falls es wie JSON aussieht
        const trimmed = content.trim();
        if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
          try {
            const parsed = JSON.parse(trimmed);
            const validated = validateAndMapJson(parsed);
            setParseResult(validated);
            return;
          } catch {
            // Kein JSON, weiter mit Text-Extraktion
          }
        }
        const extracted = extractFromText(content);
        setParseResult(extracted);
      } else if (format === "template") {
        setParseResult(SYSTEM_INFO_TEMPLATE);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Parsen. Stellen Sie sicher, dass das JSON-Format korrekt ist.");
    }
  };

  const validateAndMapJson = (data: Record<string, unknown>): Partial<AiSystemInfo> => {
    const result: Partial<AiSystemInfo> = {};

    // System-Identifikation
    if (typeof data.systemName === "string") result.systemName = data.systemName;
    if (typeof data.name === "string") result.systemName = data.name;
    if (typeof data.systemVersion === "string") result.systemVersion = data.systemVersion;
    if (typeof data.version === "string") result.systemVersion = data.version;
    if (typeof data.systemProvider === "string") result.systemProvider = data.systemProvider;
    if (typeof data.provider === "string") result.systemProvider = data.provider;
    if (typeof data.vendor === "string") result.systemProvider = data.vendor;

    // EU AI Act Rolle
    if (typeof data.euAiActRole === "string") {
      const validRoles = EU_AI_ACT_ROLES.map(r => r.value);
      if (validRoles.includes(data.euAiActRole as EuAiActRole)) {
        result.euAiActRole = data.euAiActRole as EuAiActRole;
      }
    }
    if (typeof data.role === "string") {
      const roleMap: Record<string, EuAiActRole> = {
        "anbieter": "PROVIDER",
        "provider": "PROVIDER",
        "betreiber": "DEPLOYER",
        "deployer": "DEPLOYER",
        "operator": "DEPLOYER",
        "importeur": "IMPORTER",
        "importer": "IMPORTER",
        "händler": "DISTRIBUTOR",
        "distributor": "DISTRIBUTOR",
      };
      const mapped = roleMap[data.role.toLowerCase()];
      if (mapped) result.euAiActRole = mapped;
    }

    // Zweckbestimmung
    if (typeof data.primaryPurpose === "string") result.primaryPurpose = data.primaryPurpose;
    if (typeof data.purpose === "string") result.primaryPurpose = data.purpose;
    if (typeof data.description === "string" && !result.primaryPurpose) {
      result.primaryPurpose = data.description;
    }

    // Anhang III Kategorien
    if (Array.isArray(data.annexIIICategories)) {
      const validCategories = ANNEX_III_CATEGORIES.map(c => c.value);
      result.annexIIICategories = data.annexIIICategories.filter(
        (c): c is AnnexIIICategory => validCategories.includes(c as AnnexIIICategory)
      );
    }
    if (typeof data.category === "string" || Array.isArray(data.categories)) {
      const cats = Array.isArray(data.categories) ? data.categories : [data.category];
      result.annexIIICategories = mapCategoriesToAnnexIII(cats as string[]);
    }

    // Weitere Felder
    if (typeof data.intendedUsers === "string") result.intendedUsers = data.intendedUsers;
    if (typeof data.users === "string") result.intendedUsers = data.users;
    if (typeof data.prohibitedUses === "string") result.prohibitedUses = data.prohibitedUses;
    if (typeof data.foreseenMisuse === "string") result.foreseenMisuse = data.foreseenMisuse;

    // Domain und Use Case
    if (typeof data.domain === "string") result.domain = data.domain;
    if (typeof data.sector === "string") result.domain = data.sector;
    if (typeof data.useCase === "string") result.useCase = data.useCase;

    // Impact und Flags
    if (typeof data.impactLevel === "string") {
      if (["low", "medium", "high"].includes(data.impactLevel)) {
        result.impactLevel = data.impactLevel as "low" | "medium" | "high";
      }
    }
    if (typeof data.biometricOrSurveillance === "boolean") {
      result.biometricOrSurveillance = data.biometricOrSurveillance;
    }
    if (typeof data.biometric === "boolean") {
      result.biometricOrSurveillance = data.biometric;
    }
    if (typeof data.euImpact === "boolean") result.euImpact = data.euImpact;

    // System Boundaries
    if (typeof data.systemBoundaries === "object" && data.systemBoundaries !== null) {
      const sb = data.systemBoundaries as Record<string, unknown>;
      result.systemBoundaries = {
        includedComponents: Array.isArray(sb.includedComponents) ? sb.includedComponents : [],
        excludedComponents: Array.isArray(sb.excludedComponents) ? sb.excludedComponents : [],
        dataInputs: Array.isArray(sb.dataInputs) ? sb.dataInputs : [],
        dataOutputs: Array.isArray(sb.dataOutputs) ? sb.dataOutputs : [],
        humanOversight: typeof sb.humanOversight === "string" ? sb.humanOversight : "",
        integrationPoints: Array.isArray(sb.integrationPoints) ? sb.integrationPoints : [],
      };
    }

    return result;
  };

  const mapCategoriesToAnnexIII = (categories: string[]): AnnexIIICategory[] => {
    const categoryMap: Record<string, AnnexIIICategory> = {
      "biometrie": "BIOMETRIC_IDENTIFICATION",
      "biometric": "BIOMETRIC_IDENTIFICATION",
      "gesichtserkennung": "BIOMETRIC_IDENTIFICATION",
      "facial recognition": "BIOMETRIC_IDENTIFICATION",
      "infrastruktur": "CRITICAL_INFRASTRUCTURE",
      "infrastructure": "CRITICAL_INFRASTRUCTURE",
      "energie": "CRITICAL_INFRASTRUCTURE",
      "bildung": "EDUCATION_VOCATIONAL",
      "education": "EDUCATION_VOCATIONAL",
      "schule": "EDUCATION_VOCATIONAL",
      "hr": "EMPLOYMENT_HR",
      "personal": "EMPLOYMENT_HR",
      "employment": "EMPLOYMENT_HR",
      "recruiting": "EMPLOYMENT_HR",
      "kredit": "ESSENTIAL_SERVICES",
      "credit": "ESSENTIAL_SERVICES",
      "versicherung": "ESSENTIAL_SERVICES",
      "insurance": "ESSENTIAL_SERVICES",
      "strafverfolgung": "LAW_ENFORCEMENT",
      "polizei": "LAW_ENFORCEMENT",
      "law enforcement": "LAW_ENFORCEMENT",
      "migration": "MIGRATION_ASYLUM",
      "asyl": "MIGRATION_ASYLUM",
      "grenze": "MIGRATION_ASYLUM",
      "justiz": "JUSTICE_DEMOCRACY",
      "justice": "JUSTICE_DEMOCRACY",
      "gericht": "JUSTICE_DEMOCRACY",
    };

    const result: AnnexIIICategory[] = [];
    for (const cat of categories) {
      const lower = cat.toLowerCase();
      for (const [keyword, annexCat] of Object.entries(categoryMap)) {
        if (lower.includes(keyword) && !result.includes(annexCat)) {
          result.push(annexCat);
        }
      }
    }

    if (result.length === 0) {
      result.push("OTHER");
    }

    return result;
  };

  const extractFromText = (text: string): Partial<AiSystemInfo> => {
    const result: Partial<AiSystemInfo> = {};
    const lower = text.toLowerCase();

    // Versuche System-Name zu extrahieren
    const namePatterns = [
      /system(?:name)?[:\s]+([^\n,]+)/i,
      /ki-system[:\s]+([^\n,]+)/i,
      /name[:\s]+([^\n,]+)/i,
    ];
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match) {
        result.systemName = match[1].trim();
        break;
      }
    }

    // Versuche Version zu extrahieren
    const versionMatch = text.match(/version[:\s]+([0-9.]+)/i);
    if (versionMatch) {
      result.systemVersion = versionMatch[1];
    }

    // Zweck extrahieren
    const purposePatterns = [
      /zweck[:\s]+([^\n]+)/i,
      /purpose[:\s]+([^\n]+)/i,
      /einsatzzweck[:\s]+([^\n]+)/i,
    ];
    for (const pattern of purposePatterns) {
      const match = text.match(pattern);
      if (match) {
        result.primaryPurpose = match[1].trim();
        break;
      }
    }

    // Kategorien basierend auf Keywords
    const detectedCategories: AnnexIIICategory[] = [];

    if (lower.includes("biometri") || lower.includes("gesichtserkennung") || lower.includes("fingerabdruck")) {
      detectedCategories.push("BIOMETRIC_IDENTIFICATION");
    }
    if (lower.includes("infrastruktur") || lower.includes("energie") || lower.includes("wasser")) {
      detectedCategories.push("CRITICAL_INFRASTRUCTURE");
    }
    if (lower.includes("bildung") || lower.includes("schule") || lower.includes("prüfung")) {
      detectedCategories.push("EDUCATION_VOCATIONAL");
    }
    if (lower.includes("personal") || lower.includes("hr") || lower.includes("bewerbung") || lower.includes("recruiting")) {
      detectedCategories.push("EMPLOYMENT_HR");
    }
    if (lower.includes("kredit") || lower.includes("versicherung") || lower.includes("scoring")) {
      detectedCategories.push("ESSENTIAL_SERVICES");
    }
    if (lower.includes("polizei") || lower.includes("strafverfolgung")) {
      detectedCategories.push("LAW_ENFORCEMENT");
    }
    if (lower.includes("migration") || lower.includes("asyl") || lower.includes("grenz")) {
      detectedCategories.push("MIGRATION_ASYLUM");
    }
    if (lower.includes("justiz") || lower.includes("gericht") || lower.includes("urteil")) {
      detectedCategories.push("JUSTICE_DEMOCRACY");
    }

    if (detectedCategories.length > 0) {
      result.annexIIICategories = detectedCategories;
    }

    // Biometrie-Flag
    if (lower.includes("biometri") || lower.includes("überwachung") || lower.includes("surveillance")) {
      result.biometricOrSurveillance = true;
    }

    // Domain erkennen
    const domainKeywords: Record<string, string> = {
      "gesundheit": "Gesundheitswesen",
      "medizin": "Gesundheitswesen",
      "personal": "Personal/HR",
      "hr": "Personal/HR",
      "kredit": "Kreditvergabe",
      "finanz": "Kreditvergabe",
      "infrastruktur": "Kritische Infrastruktur",
      "bildung": "Bildung",
      "schule": "Bildung",
      "polizei": "Strafverfolgung",
      "migration": "Migration/Asyl",
      "justiz": "Justiz",
    };

    for (const [keyword, domain] of Object.entries(domainKeywords)) {
      if (lower.includes(keyword)) {
        result.domain = domain;
        break;
      }
    }

    // Use Case aus dem gesamten Text nehmen (gekürzt)
    if (!result.primaryPurpose && text.length > 50) {
      result.useCase = text.substring(0, 500).trim();
    }

    return result;
  };

  const handleParse = () => {
    parseContent(textInput, importFormat);
  };

  const handleImport = () => {
    if (parseResult) {
      onImport(parseResult);
      onClose();
    }
  };

  const handleDownloadTemplate = () => {
    const json = JSON.stringify(SYSTEM_INFO_TEMPLATE, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ki-system-vorlage.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUseTemplate = () => {
    setParseResult(SYSTEM_INFO_TEMPLATE);
    setImportFormat("template");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Systemdokumentation importieren
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Format-Auswahl */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Import-Format
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setImportFormat("json")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  importFormat === "json"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                JSON
              </button>
              <button
                onClick={() => setImportFormat("text")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  importFormat === "text"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Freitext
              </button>
              <button
                onClick={handleUseTemplate}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  importFormat === "template"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Vorlage nutzen
              </button>
            </div>
          </div>

          {importFormat !== "template" && (
            <>
              {/* Datei-Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Datei hochladen (JSON, TXT, MD)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.txt,.md,.text,application/json,text/plain"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  JSON-Dateien werden automatisch erkannt, auch mit .txt Endung
                </p>
              </div>

              {/* Text-Eingabe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Oder Text einfügen
                </label>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={
                    importFormat === "json"
                      ? '{\n  "systemName": "Mein KI-System",\n  "purpose": "...",\n  ...\n}'
                      : "Fügen Sie hier Ihre Systemdokumentation ein...\n\nBeispiel:\nSystemname: HR-Screening AI\nVersion: 2.0\nZweck: Automatisierte Vorauswahl von Bewerbungen\n..."
                  }
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleParse} disabled={!textInput.trim()}>
                  Analysieren
                </Button>
                <Button variant="secondary" onClick={handleDownloadTemplate}>
                  JSON-Vorlage herunterladen
                </Button>
              </div>
            </>
          )}

          {/* Fehler */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Vorschau */}
          {parseResult && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">Erkannte Daten</h3>
              </div>
              <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                {parseResult.systemName && (
                  <PreviewField label="Systemname" value={parseResult.systemName} />
                )}
                {parseResult.systemVersion && (
                  <PreviewField label="Version" value={parseResult.systemVersion} />
                )}
                {parseResult.systemProvider && (
                  <PreviewField label="Anbieter" value={parseResult.systemProvider} />
                )}
                {parseResult.euAiActRole && (
                  <PreviewField
                    label="EU AI Act Rolle"
                    value={EU_AI_ACT_ROLES.find(r => r.value === parseResult.euAiActRole)?.label || parseResult.euAiActRole}
                  />
                )}
                {parseResult.primaryPurpose && (
                  <PreviewField label="Hauptzweck" value={parseResult.primaryPurpose} />
                )}
                {parseResult.annexIIICategories && parseResult.annexIIICategories.length > 0 && (
                  <PreviewField
                    label="Anhang III Kategorien"
                    value={parseResult.annexIIICategories
                      .map(c => ANNEX_III_CATEGORIES.find(cat => cat.value === c)?.label || c)
                      .join(", ")}
                  />
                )}
                {parseResult.domain && (
                  <PreviewField label="Domain" value={parseResult.domain} />
                )}
                {parseResult.useCase && (
                  <PreviewField label="Use Case" value={parseResult.useCase.substring(0, 100) + (parseResult.useCase.length > 100 ? "..." : "")} />
                )}
                {parseResult.biometricOrSurveillance !== undefined && (
                  <PreviewField label="Biometrie/Überwachung" value={parseResult.biometricOrSurveillance ? "Ja" : "Nein"} />
                )}
                {parseResult.systemBoundaries && (
                  <PreviewField
                    label="Komponenten"
                    value={parseResult.systemBoundaries.includedComponents?.join(", ") || "-"}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Abbrechen
          </Button>
          <Button onClick={handleImport} disabled={!parseResult}>
            Daten übernehmen
          </Button>
        </div>
      </div>
    </div>
  );
};

const PreviewField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex">
    <span className="text-sm font-medium text-gray-500 w-40 flex-shrink-0">{label}:</span>
    <span className="text-sm text-gray-900">{value}</span>
  </div>
);

export default SystemImportModal;
