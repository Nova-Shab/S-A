import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Types for the audit flow
export interface CompanyContext {
  companySize: 'micro' | 'small' | 'medium' | 'large' | '';
  location: 'eu' | 'non_eu_with_eu_market' | 'non_eu' | '';
  industry: string;
  euAiActRelevant: boolean | null;
  relevanceReason: string;
}

export interface AISystem {
  id: string;
  name: string;
  description: string;
  deploymentArea: string;
  isThirdParty: boolean;
  vendor?: string;
  createdAt: string;
  riskClassification?: RiskClassification;
  requirements?: RequirementAssessment[];
  auditHistory: AuditVersion[];
}

export interface RiskClassification {
  isProhibited: boolean;
  prohibitedReason?: string;
  riskLevel: 'HIGH_RISK' | 'LIMITED_RISK' | 'MINIMAL_RISK' | null;
  criteria: string[];
  assumptions: string[];
  uncertainties: string[];
  assessedAt: string;
}

export interface RequirementAssessment {
  requirementId: string;
  status: 'fulfilled' | 'partially_fulfilled' | 'not_fulfilled' | 'not_applicable' | 'not_assessed';
  comment: string;
  documents: EvidenceDocument[];
  gaps: Gap[];
  lastUpdated: string;
}

export interface EvidenceDocument {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  aiAnalysis?: DocumentAnalysis;
}

export interface DocumentAnalysis {
  relevanceScore: number;
  completenessScore: number;
  findings: string[];
  gaps: string[];
  recommendations: string[];
  analyzedAt: string;
}

export interface Gap {
  id: string;
  type: string;
  description: string;
  source: 'system' | 'user';
  status: 'open' | 'accepted' | 'resolved';
  linkedRequirementId: string;
  linkedDocumentId?: string;
}

export interface AuditVersion {
  version: number;
  createdAt: string;
  status: 'in_progress' | 'completed';
  fulfillmentRate: number;
  openGaps: number;
  snapshot: object;
}

export interface AuditState {
  id: string;
  currentStep: number;
  companyContext: CompanyContext;
  aiSystems: AISystem[];
  currentSystemIndex: number;
  createdAt: string;
  updatedAt: string;
  status: 'in_progress' | 'completed';
}

// Step definitions
export const AUDIT_STEPS = [
  { id: 0, title: 'Einstieg', description: 'Erwartungsmanagement' },
  { id: 1, title: 'Scope', description: 'Anwendungsbereich klären' },
  { id: 2, title: 'KI-System', description: 'System erfassen' },
  { id: 3, title: 'Risiko', description: 'Klassifizierung' },
  { id: 4, title: 'Pflichten', description: 'Anforderungen & Evidenz' },
  { id: 5, title: 'Bewertung', description: 'Ergebnis & Lücken' },
  { id: 6, title: 'Maßnahmen', description: 'Abschluss & Export' },
];

// Initial state factory
export const createInitialAuditState = (): AuditState => ({
  id: `audit-${Date.now()}`,
  currentStep: 0,
  companyContext: {
    companySize: '',
    location: '',
    industry: '',
    euAiActRelevant: null,
    relevanceReason: '',
  },
  aiSystems: [],
  currentSystemIndex: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: 'in_progress',
});

// Context for audit state management
interface AuditWizardContextType {
  state: AuditState;
  updateState: (updates: Partial<AuditState>) => void;
  updateCompanyContext: (updates: Partial<CompanyContext>) => void;
  addAISystem: (system: Omit<AISystem, 'id' | 'createdAt' | 'auditHistory'>) => void;
  updateAISystem: (systemId: string, updates: Partial<AISystem>) => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  saveAudit: () => Promise<void>;
}

export const AuditWizardContext = React.createContext<AuditWizardContextType | null>(null);

export const useAuditWizard = () => {
  const context = React.useContext(AuditWizardContext);
  if (!context) {
    throw new Error('useAuditWizard must be used within AuditWizardProvider');
  }
  return context;
};

// Provider component
interface AuditWizardProviderProps {
  children: React.ReactNode;
  initialState?: AuditState;
}

export const AuditWizardProvider: React.FC<AuditWizardProviderProps> = ({
  children,
  initialState,
}) => {
  const [state, setState] = useState<AuditState>(initialState || createInitialAuditState());

  const updateState = useCallback((updates: Partial<AuditState>) => {
    setState(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const updateCompanyContext = useCallback((updates: Partial<CompanyContext>) => {
    setState(prev => ({
      ...prev,
      companyContext: { ...prev.companyContext, ...updates },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const addAISystem = useCallback((system: Omit<AISystem, 'id' | 'createdAt' | 'auditHistory'>) => {
    const newSystem: AISystem = {
      ...system,
      id: `sys-${Date.now()}`,
      createdAt: new Date().toISOString(),
      auditHistory: [],
    };
    setState(prev => ({
      ...prev,
      aiSystems: [...prev.aiSystems, newSystem],
      currentSystemIndex: prev.aiSystems.length,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const updateAISystem = useCallback((systemId: string, updates: Partial<AISystem>) => {
    setState(prev => ({
      ...prev,
      aiSystems: prev.aiSystems.map(sys =>
        sys.id === systemId ? { ...sys, ...updates } : sys
      ),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(0, Math.min(step, AUDIT_STEPS.length - 1)),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, AUDIT_STEPS.length - 1),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const prevStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const saveAudit = useCallback(async () => {
    // Auto-save to localStorage for now
    localStorage.setItem(`audit-${state.id}`, JSON.stringify(state));
    // TODO: Save to backend
  }, [state]);

  // Auto-save on state change
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem(`audit-${state.id}`, JSON.stringify(state));
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [state]);

  const value: AuditWizardContextType = {
    state,
    updateState,
    updateCompanyContext,
    addAISystem,
    updateAISystem,
    goToStep,
    nextStep,
    prevStep,
    saveAudit,
  };

  return (
    <AuditWizardContext.Provider value={value}>
      {children}
    </AuditWizardContext.Provider>
  );
};

export default AuditWizardProvider;
