import React, { useState, useRef } from 'react';
import { useAuditWizard, RequirementAssessment, EvidenceDocument } from '../../context/AuditWizardContext';
import api from '../../services/api';

// High-risk system requirements (Art. 9-15)
const HIGH_RISK_REQUIREMENTS = [
  {
    id: 'risk_management',
    article: 'Art. 9',
    title: 'Risikomanagementsystem',
    description: 'Einrichtung, Implementierung, Dokumentation und Aufrechterhaltung eines Risikomanagementsystems.',
    checkpoints: [
      'Risiken für Gesundheit, Sicherheit und Grundrechte identifiziert',
      'Risikobewertung vor und nach Inbetriebnahme durchgeführt',
      'Risikominderungsmaßnahmen dokumentiert',
      'Restrisiken für akzeptabel befunden und dokumentiert',
    ],
  },
  {
    id: 'data_governance',
    article: 'Art. 10',
    title: 'Daten-Governance',
    description: 'Qualitätskriterien für Trainings-, Validierungs- und Testdatensätze.',
    checkpoints: [
      'Datensätze relevant, repräsentativ und fehlerfrei',
      'Statistische Eigenschaften dokumentiert',
      'Mögliche Verzerrungen identifiziert und adressiert',
      'Datenherkunft und -verarbeitung dokumentiert',
    ],
  },
  {
    id: 'technical_documentation',
    article: 'Art. 11',
    title: 'Technische Dokumentation',
    description: 'Erstellung und Aktualisierung technischer Dokumentation vor Inverkehrbringen.',
    checkpoints: [
      'Allgemeine Systembeschreibung vorhanden',
      'Detaillierte Beschreibung der Systemelemente',
      'Entwicklungsprozess dokumentiert',
      'Überwachungs- und Testverfahren beschrieben',
    ],
  },
  {
    id: 'record_keeping',
    article: 'Art. 12',
    title: 'Aufzeichnungspflichten',
    description: 'Automatische Protokollierung von Ereignissen (Logs) während des Betriebs.',
    checkpoints: [
      'Logging-Funktionalität implementiert',
      'Relevante Ereignisse werden erfasst',
      'Rückverfolgbarkeit gewährleistet',
      'Aufbewahrungsfristen eingehalten',
    ],
  },
  {
    id: 'transparency',
    article: 'Art. 13',
    title: 'Transparenz und Information',
    description: 'Transparente Gestaltung für Betreiber zur Interpretation von Outputs.',
    checkpoints: [
      'Gebrauchsanweisung verfügbar',
      'Leistungsmerkmale dokumentiert',
      'Bekannte Einschränkungen kommuniziert',
      'Erforderliche menschliche Aufsicht beschrieben',
    ],
  },
  {
    id: 'human_oversight',
    article: 'Art. 14',
    title: 'Menschliche Aufsicht',
    description: 'Konzeption für wirksame menschliche Aufsicht während der Nutzung.',
    checkpoints: [
      'Aufsichtspersonal benannt und qualifiziert',
      'Eingriffssmöglichkeiten vorhanden',
      'System kann gestoppt werden',
      'Aufsicht kann Outputs überstimmen',
    ],
  },
  {
    id: 'accuracy',
    article: 'Art. 15',
    title: 'Genauigkeit, Robustheit, Cybersicherheit',
    description: 'Angemessenes Maß an Genauigkeit, Robustheit und Cybersicherheit.',
    checkpoints: [
      'Genauigkeitsmetriken definiert und gemessen',
      'Robustheit gegen Fehler und Inkonsistenzen',
      'Schutz gegen unbefugte Manipulation',
      'Cybersicherheitsmaßnahmen implementiert',
    ],
  },
];

const STATUS_OPTIONS = [
  { value: 'fulfilled', label: 'Erfüllt', color: 'bg-audit-steel' },
  { value: 'partially_fulfilled', label: 'Teilweise erfüllt', color: 'bg-audit-cool' },
  { value: 'not_fulfilled', label: 'Nicht erfüllt', color: 'bg-audit-deep' },
  { value: 'not_applicable', label: 'Nicht anwendbar', color: 'bg-audit-light' },
  { value: 'not_assessed', label: 'Noch nicht bewertet', color: 'bg-audit-bg' },
];

interface RequirementCardProps {
  requirement: typeof HIGH_RISK_REQUIREMENTS[0];
  assessment: RequirementAssessment | undefined;
  onUpdate: (assessment: Partial<RequirementAssessment>) => void;
  onUploadDocument: (file: File) => Promise<void>;
  isUploading: boolean;
}

const RequirementCard: React.FC<RequirementCardProps> = ({
  requirement,
  assessment,
  onUpdate,
  onUploadDocument,
  isUploading,
}) => {
  const [expanded, setExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentStatus = assessment?.status || 'not_assessed';
  const documents = assessment?.documents || [];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onUploadDocument(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="audit-card">
      {/* Header */}
      <div
        className="flex items-start justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span className="text-meta text-audit-cool font-mono mr-3">{requirement.article}</span>
            <h4 className="text-h4 text-audit-deep">{requirement.title}</h4>
          </div>
          <p className="text-body text-audit-cool">{requirement.description}</p>
        </div>
        <div className="flex items-center ml-4">
          <div className={`px-3 py-1 rounded-full text-sm text-white ${
            STATUS_OPTIONS.find(s => s.value === currentStatus)?.color || 'bg-audit-bg'
          }`}>
            {STATUS_OPTIONS.find(s => s.value === currentStatus)?.label}
          </div>
          <svg
            className={`w-5 h-5 ml-2 text-audit-cool transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="mt-6 pt-6 border-t border-audit-light">
          {/* Checkpoints */}
          <div className="mb-6">
            <h5 className="text-label text-audit-steel mb-3">Prüfpunkte:</h5>
            <ul className="space-y-2">
              {requirement.checkpoints.map((checkpoint, idx) => (
                <li key={idx} className="flex items-start text-body text-audit-cool">
                  <svg className="w-4 h-4 mr-2 mt-1 text-audit-light flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {checkpoint}
                </li>
              ))}
            </ul>
          </div>

          {/* Status Selection */}
          <div className="mb-6">
            <h5 className="text-label text-audit-steel mb-3">Bewertung:</h5>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate({ status: option.value as RequirementAssessment['status'] });
                  }}
                  className={`px-4 py-2 rounded-audit text-sm transition-colors ${
                    currentStatus === option.value
                      ? `${option.color} text-white`
                      : 'bg-audit-bg text-audit-cool hover:bg-audit-light'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <h5 className="text-label text-audit-steel mb-3">Anmerkungen:</h5>
            <textarea
              value={assessment?.comment || ''}
              onChange={(e) => onUpdate({ comment: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              placeholder="Notizen zur Bewertung, identifizierte Lücken, nächste Schritte..."
              rows={3}
              className="audit-input w-full resize-none"
            />
          </div>

          {/* Document Upload */}
          <div>
            <h5 className="text-label text-audit-steel mb-3">Evidenz-Dokumente:</h5>

            {/* Existing Documents */}
            {documents.length > 0 && (
              <div className="space-y-2 mb-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-audit-bg rounded-audit"
                  >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-3 text-audit-steel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p className="text-body text-audit-deep">{doc.fileName}</p>
                        <p className="text-meta text-audit-cool">
                          {(doc.fileSize / 1024).toFixed(1)} KB | {new Date(doc.uploadedAt).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    </div>
                    {doc.aiAnalysis && (
                      <div className="flex items-center text-sm">
                        <span className="text-audit-cool mr-2">Relevanz:</span>
                        <span className="font-medium text-audit-steel">
                          {Math.round(doc.aiAnalysis.relevanceScore * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            <div className="flex items-center">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                onClick={(e) => e.stopPropagation()}
                accept=".pdf,.doc,.docx,.txt,.md"
                className="hidden"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                disabled={isUploading}
                className="audit-btn-secondary flex items-center"
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Wird analysiert...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Dokument hochladen
                  </>
                )}
              </button>
              <span className="text-meta text-audit-cool ml-3">
                PDF, Word, Text (max. 10 MB)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const Step4Requirements: React.FC = () => {
  const { state, updateAISystem, nextStep, prevStep } = useAuditWizard();
  const currentSystem = state.aiSystems[state.currentSystemIndex];
  const [uploadingReq, setUploadingReq] = useState<string | null>(null);

  const requirements = currentSystem?.requirements || [];

  const getOrCreateAssessment = (reqId: string): RequirementAssessment => {
    const existing = requirements.find(r => r.requirementId === reqId);
    if (existing) return existing;
    return {
      requirementId: reqId,
      status: 'not_assessed',
      comment: '',
      documents: [],
      gaps: [],
      lastUpdated: new Date().toISOString(),
    };
  };

  const handleUpdateAssessment = (reqId: string, updates: Partial<RequirementAssessment>) => {
    const assessment = getOrCreateAssessment(reqId);
    const updatedAssessment = {
      ...assessment,
      ...updates,
      lastUpdated: new Date().toISOString(),
    };

    const newRequirements = requirements.some(r => r.requirementId === reqId)
      ? requirements.map(r => r.requirementId === reqId ? updatedAssessment : r)
      : [...requirements, updatedAssessment];

    updateAISystem(currentSystem.id, { requirements: newRequirements });
  };

  const handleUploadDocument = async (reqId: string, file: File) => {
    setUploadingReq(reqId);

    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('requirementId', reqId);
      formData.append('systemId', currentSystem.id);
      formData.append('auditId', state.id);

      // Upload and analyze document
      const response = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newDocument: EvidenceDocument = {
        id: `doc-${Date.now()}`,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        aiAnalysis: response.data.analysis || undefined,
      };

      const assessment = getOrCreateAssessment(reqId);
      handleUpdateAssessment(reqId, {
        documents: [...assessment.documents, newDocument],
      });
    } catch (error) {
      console.error('Document upload failed:', error);
      // Still add document even if analysis fails
      const newDocument: EvidenceDocument = {
        id: `doc-${Date.now()}`,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
      };

      const assessment = getOrCreateAssessment(reqId);
      handleUpdateAssessment(reqId, {
        documents: [...assessment.documents, newDocument],
      });
    } finally {
      setUploadingReq(null);
    }
  };

  // Calculate progress
  const assessedCount = requirements.filter(r => r.status !== 'not_assessed').length;
  const totalCount = HIGH_RISK_REQUIREMENTS.length;
  const progress = Math.round((assessedCount / totalCount) * 100);

  if (!currentSystem) {
    return (
      <div className="audit-alert-info">
        <p>Kein KI-System ausgewählt.</p>
      </div>
    );
  }

  // Skip if not high-risk
  if (currentSystem.riskClassification?.riskLevel !== 'HIGH_RISK') {
    return (
      <div className="space-y-8">
        <div className="audit-panel">
          <div className="audit-panel-header">
            <h2 className="text-h3 text-audit-deep mb-0">Anforderungsprüfung</h2>
          </div>
          <div className="audit-panel-body">
            <div className="audit-alert-info">
              <p className="text-body text-audit-deep">
                Da "{currentSystem.name}" als <strong>{
                  currentSystem.riskClassification?.riskLevel === 'LIMITED_RISK' ? 'System mit begrenztem Risiko' : 'System mit minimalem Risiko'
                }</strong> klassifiziert wurde, gelten die umfangreichen Anforderungen für Hochrisiko-Systeme (Art. 9-15) nicht.
              </p>
              {currentSystem.riskClassification?.riskLevel === 'LIMITED_RISK' && (
                <p className="text-body text-audit-cool mt-2">
                  Es gelten jedoch Transparenzpflichten nach Art. 50 EU AI Act.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <button onClick={prevStep} className="audit-btn-secondary flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Zurück
          </button>
          <button onClick={nextStep} className="audit-btn-primary flex items-center">
            Weiter zur Bewertung
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="audit-panel">
        <div className="audit-panel-header">
          <div className="flex items-center justify-between">
            <h2 className="text-h3 text-audit-deep mb-0">Anforderungen prüfen & Evidenz</h2>
            <span className="px-3 py-1 bg-audit-bg text-audit-steel rounded-full text-meta">
              {currentSystem.name}
            </span>
          </div>
        </div>
        <div className="audit-panel-body">
          <p className="text-body text-audit-cool mb-4">
            Bewerten Sie die Erfüllung jeder Anforderung und laden Sie Nachweisdokumente hoch.
            Die KI-gestützte Dokumentenanalyse unterstützt Sie bei der Bewertung.
          </p>

          {/* Progress Bar */}
          <div className="bg-audit-bg rounded-full h-2 mb-2">
            <div
              className="bg-audit-steel rounded-full h-2 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-meta text-audit-cool">
            {assessedCount} von {totalCount} Anforderungen bewertet ({progress}%)
          </p>
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-4">
        {HIGH_RISK_REQUIREMENTS.map((req) => (
          <RequirementCard
            key={req.id}
            requirement={req}
            assessment={requirements.find(r => r.requirementId === req.id)}
            onUpdate={(updates) => handleUpdateAssessment(req.id, updates)}
            onUploadDocument={(file) => handleUploadDocument(req.id, file)}
            isUploading={uploadingReq === req.id}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={prevStep}
          className="audit-btn-secondary flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Zurück
        </button>
        <button
          onClick={nextStep}
          className="audit-btn-primary flex items-center"
        >
          Weiter zur Bewertung
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Step4Requirements;
