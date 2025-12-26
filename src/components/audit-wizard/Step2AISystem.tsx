import React, { useState } from 'react';
import { useAuditWizard, AISystem } from '../../context/AuditWizardContext';

const DEPLOYMENT_AREAS = [
  { value: 'hr', label: 'Personalwesen / HR', examples: 'Recruiting, Leistungsbewertung, Talentmanagement' },
  { value: 'customer_service', label: 'Kundenservice', examples: 'Chatbots, Support-Automatisierung' },
  { value: 'finance', label: 'Finanz & Risiko', examples: 'Kreditprüfung, Betrugserkennung, Trading' },
  { value: 'healthcare', label: 'Gesundheit', examples: 'Diagnostik, Behandlungsempfehlungen' },
  { value: 'security', label: 'Sicherheit', examples: 'Überwachung, Biometrie, Zugangskontrollen' },
  { value: 'marketing', label: 'Marketing', examples: 'Personalisierung, Recommendation, Targeting' },
  { value: 'production', label: 'Produktion', examples: 'Qualitätskontrolle, Predictive Maintenance' },
  { value: 'legal', label: 'Rechtsberatung', examples: 'Vertragsanalyse, Rechtsrecherche' },
  { value: 'education', label: 'Bildung', examples: 'Lernplattformen, Prüfungsbewertung' },
  { value: 'other', label: 'Sonstiges', examples: 'Andere Einsatzbereiche' },
];

interface SystemFormData {
  name: string;
  description: string;
  deploymentArea: string;
  isThirdParty: boolean;
  vendor: string;
}

const initialFormData: SystemFormData = {
  name: '',
  description: '',
  deploymentArea: '',
  isThirdParty: false,
  vendor: '',
};

export const Step2AISystem: React.FC = () => {
  const { state, addAISystem, updateAISystem, nextStep, prevStep, updateState } = useAuditWizard();
  const [formData, setFormData] = useState<SystemFormData>(initialFormData);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(state.aiSystems.length === 0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Bitte geben Sie einen Namen für das KI-System ein.';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Bitte beschreiben Sie das KI-System.';
    }
    if (formData.description.trim().length < 30) {
      newErrors.description = 'Die Beschreibung sollte mindestens 30 Zeichen umfassen.';
    }
    if (!formData.deploymentArea) {
      newErrors.deploymentArea = 'Bitte wählen Sie einen Einsatzbereich.';
    }
    if (formData.isThirdParty && !formData.vendor.trim()) {
      newErrors.vendor = 'Bitte geben Sie den Anbieter an.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (isEditing) {
      updateAISystem(isEditing, {
        name: formData.name,
        description: formData.description,
        deploymentArea: formData.deploymentArea,
        isThirdParty: formData.isThirdParty,
        vendor: formData.vendor,
      });
      setIsEditing(null);
    } else {
      addAISystem({
        name: formData.name,
        description: formData.description,
        deploymentArea: formData.deploymentArea,
        isThirdParty: formData.isThirdParty,
        vendor: formData.vendor,
      });
    }

    setFormData(initialFormData);
    setShowForm(false);
  };

  const handleEdit = (system: AISystem) => {
    setFormData({
      name: system.name,
      description: system.description,
      deploymentArea: system.deploymentArea,
      isThirdParty: system.isThirdParty,
      vendor: system.vendor || '',
    });
    setIsEditing(system.id);
    setShowForm(true);
  };

  const handleDelete = (systemId: string) => {
    updateState({
      aiSystems: state.aiSystems.filter(s => s.id !== systemId),
    });
  };

  const handleProceed = () => {
    if (state.aiSystems.length === 0) {
      setErrors({ general: 'Bitte erfassen Sie mindestens ein KI-System.' });
      return;
    }
    nextStep();
  };

  return (
    <div className="space-y-8">
      {/* Intro */}
      <div className="audit-panel">
        <div className="audit-panel-header">
          <h2 className="text-h3 text-audit-deep mb-0">KI-Systeme erfassen</h2>
        </div>
        <div className="audit-panel-body">
          <p className="text-body text-audit-cool">
            Erfassen Sie alle KI-Systeme, die Sie im Rahmen dieses Audits prüfen möchten.
            Für jedes System wird eine separate Risikoklassifizierung und Anforderungsprüfung durchgeführt.
          </p>
        </div>
      </div>

      {/* Existing Systems List */}
      {state.aiSystems.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-h4 text-audit-deep">Erfasste Systeme ({state.aiSystems.length})</h3>
          {state.aiSystems.map((system, index) => (
            <div
              key={system.id}
              className={`audit-card ${
                state.currentSystemIndex === index ? 'border-audit-steel' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="w-6 h-6 rounded-full bg-audit-steel text-white text-sm flex items-center justify-center mr-3">
                      {index + 1}
                    </span>
                    <h4 className="text-h4 text-audit-deep">{system.name}</h4>
                    {system.isThirdParty && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-audit-bg text-audit-cool rounded-full">
                        Drittanbieter
                      </span>
                    )}
                  </div>
                  <p className="text-body text-audit-cool mb-2 ml-9">
                    {system.description}
                  </p>
                  <div className="ml-9 flex items-center text-meta text-audit-cool">
                    <span className="font-medium">Einsatzbereich:</span>
                    <span className="ml-2">
                      {DEPLOYMENT_AREAS.find(d => d.value === system.deploymentArea)?.label || system.deploymentArea}
                    </span>
                    {system.vendor && (
                      <>
                        <span className="mx-2">|</span>
                        <span>Anbieter: {system.vendor}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(system)}
                    className="p-2 text-audit-cool hover:text-audit-deep hover:bg-audit-bg rounded-audit transition-colors"
                    title="Bearbeiten"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(system.id)}
                    className="p-2 text-audit-cool hover:text-audit-steel hover:bg-audit-bg rounded-audit transition-colors"
                    title="Löschen"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add System Form */}
      {showForm ? (
        <div className="audit-panel">
          <div className="audit-panel-header">
            <h3 className="text-h4 text-audit-deep mb-0">
              {isEditing ? 'KI-System bearbeiten' : 'Neues KI-System hinzufügen'}
            </h3>
          </div>
          <div className="audit-panel-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* System Name */}
              <div>
                <label className="block text-label text-audit-deep mb-2">
                  Systemname *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="z.B. HR-Recruiting-KI, Chatbot Support"
                  className="audit-input w-full"
                />
                {errors.name && <p className="text-meta text-audit-steel mt-1">{errors.name}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-label text-audit-deep mb-2">
                  Beschreibung *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Beschreiben Sie kurz, was das System tut, welche Daten es verarbeitet und welche Entscheidungen es unterstützt oder trifft..."
                  rows={4}
                  className="audit-input w-full resize-none"
                />
                <p className="text-meta text-audit-cool mt-1">
                  {formData.description.length}/30 Zeichen (Minimum)
                </p>
                {errors.description && <p className="text-meta text-audit-steel mt-1">{errors.description}</p>}
              </div>

              {/* Deployment Area */}
              <div>
                <label className="block text-label text-audit-deep mb-2">
                  Einsatzbereich *
                </label>
                <div className="grid md:grid-cols-2 gap-3">
                  {DEPLOYMENT_AREAS.map((area) => (
                    <label
                      key={area.value}
                      className={`flex items-start p-3 border rounded-audit cursor-pointer transition-all ${
                        formData.deploymentArea === area.value
                          ? 'border-audit-steel bg-audit-bg'
                          : 'border-audit-light hover:border-audit-cool'
                      }`}
                    >
                      <input
                        type="radio"
                        name="deploymentArea"
                        value={area.value}
                        checked={formData.deploymentArea === area.value}
                        onChange={(e) => setFormData({ ...formData, deploymentArea: e.target.value })}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <span className="text-label text-audit-deep">{area.label}</span>
                        <p className="text-meta text-audit-cool">{area.examples}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.deploymentArea && <p className="text-meta text-audit-steel mt-1">{errors.deploymentArea}</p>}
              </div>

              {/* Third Party */}
              <div className="p-4 bg-audit-bg rounded-audit">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isThirdParty}
                    onChange={(e) => setFormData({ ...formData, isThirdParty: e.target.checked })}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <span className="text-label text-audit-deep">Drittanbieter-System</span>
                    <p className="text-meta text-audit-cool">
                      Das System wurde von einem externen Anbieter entwickelt oder bereitgestellt.
                    </p>
                  </div>
                </label>

                {formData.isThirdParty && (
                  <div className="mt-4">
                    <label className="block text-label text-audit-deep mb-2">
                      Anbieter / Hersteller *
                    </label>
                    <input
                      type="text"
                      value={formData.vendor}
                      onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                      placeholder="z.B. Microsoft, OpenAI, SAP..."
                      className="audit-input w-full"
                    />
                    {errors.vendor && <p className="text-meta text-audit-steel mt-1">{errors.vendor}</p>}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-audit-light">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setIsEditing(null);
                    setFormData(initialFormData);
                    setErrors({});
                  }}
                  className="audit-btn-secondary"
                >
                  Abbrechen
                </button>
                <button type="submit" className="audit-btn-primary">
                  {isEditing ? 'Speichern' : 'System hinzufügen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full p-4 border-2 border-dashed border-audit-light rounded-audit text-audit-cool hover:border-audit-steel hover:text-audit-deep transition-colors flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Weiteres KI-System hinzufügen
        </button>
      )}

      {/* Error Message */}
      {errors.general && (
        <div className="audit-alert-info">
          <p className="text-body text-audit-deep">{errors.general}</p>
        </div>
      )}

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
          onClick={handleProceed}
          className="audit-btn-primary flex items-center"
          disabled={state.aiSystems.length === 0}
        >
          Weiter zur Risikoklassifizierung
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Step2AISystem;
