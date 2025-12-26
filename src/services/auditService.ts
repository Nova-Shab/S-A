import api from './api';
import { AiSystemInfo, RiskClass, AuditAnswer, ActionItem } from '../models/types';

export interface AuditData {
  id: number;
  userId: number;
  title: string;
  description?: string;
  systemInfo: AiSystemInfo;
  riskClass: RiskClass;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  completionPercentage: number;
  createdAt: string;
  updatedAt: string;
  permission?: 'viewer' | 'editor' | 'admin';
  isOwner?: boolean;
  owner?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Audit-Version (Snapshot)
export interface AuditVersion {
  id: number;
  auditId: number;
  version: number;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  riskClass: RiskClass;
  completionPercentage: number;
  snapshot: {
    systemInfo: AiSystemInfo | null;
    answers: AuditAnswer[];
    actionItems: ActionItem[];
    documents: any[];
    summary?: {
      totalRequirements: number;
      compliant: number;
      partiallyCompliant: number;
      nonCompliant: number;
      notApplicable: number;
      openActionItems: number;
    };
  };
  notes?: string;
  createdAt: string;
}

// Audit-History Eintrag
export interface AuditHistoryEntry {
  id: number;
  auditId: number;
  action: 'created' | 'updated' | 'answer_changed' | 'action_item_updated' | 'version_created' | 'status_changed';
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  description: string;
  userId: number;
  userName?: string;
  createdAt: string;
}

// Daten für komplettes Audit-Speichern
export interface SaveCompleteAuditData {
  answers: AuditAnswer[];
  actionItems: ActionItem[];
  systemInfo?: AiSystemInfo | null;
  riskClass?: RiskClass | null;
}

export interface CreateAuditData {
  title: string;
  description?: string;
  systemInfo: AiSystemInfo;
  riskClass: RiskClass;
}

export interface ShareAuditData {
  userEmail: string;
  permission: 'viewer' | 'editor' | 'admin';
}

class AuditService {
  async getAudits(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ audits: AuditData[]; pagination: any }> {
    const response = await api.get('/audits', { params });
    return response.data;
  }

  async getAudit(id: number): Promise<{ audit: AuditData }> {
    const response = await api.get(`/audits/${id}`);
    return response.data;
  }

  // Existierendes Audit nach Systemname finden
  async findBySystemName(systemName: string): Promise<{ found: boolean; audit: AuditData | null }> {
    const response = await api.get('/audits/find-by-system', { params: { systemName } });
    return response.data;
  }

  async createAudit(data: CreateAuditData): Promise<{ audit: AuditData; message: string }> {
    const response = await api.post('/audits', data);
    return response.data;
  }

  async updateAudit(
    id: number,
    data: Partial<CreateAuditData> & { status?: AuditData['status'] }
  ): Promise<{ audit: AuditData; message: string }> {
    const response = await api.put(`/audits/${id}`, data);
    return response.data;
  }

  async deleteAudit(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/audits/${id}`);
    return response.data;
  }

  async updateAnswer(
    auditId: number,
    answer: AuditAnswer
  ): Promise<{ answer: any; completionPercentage: number; message: string }> {
    const response = await api.put(`/audits/${auditId}/answers`, answer);
    return response.data;
  }

  async shareAudit(
    auditId: number,
    data: ShareAuditData
  ): Promise<{ share: any; message: string }> {
    const response = await api.post(`/audits/${auditId}/share`, data);
    return response.data;
  }

  async getShares(auditId: number): Promise<{ shares: any[] }> {
    const response = await api.get(`/audits/${auditId}/shares`);
    return response.data;
  }

  async removeShare(auditId: number, shareId: number): Promise<{ message: string }> {
    const response = await api.delete(`/audits/${auditId}/shares/${shareId}`);
    return response.data;
  }

  // ============================================
  // Neue Methoden für Versionierung und History
  // ============================================

  // Komplettes Audit speichern (Antworten + Maßnahmen)
  async saveCompleteAudit(
    auditId: number,
    data: SaveCompleteAuditData
  ): Promise<{ message: string; completionPercentage: number }> {
    const response = await api.put(`/audits/${auditId}/save`, data);
    return response.data;
  }

  // Neue Audit-Version erstellen (Snapshot)
  async createVersion(
    auditId: number,
    notes?: string
  ): Promise<{ version: AuditVersion; message: string }> {
    const response = await api.post(`/audits/${auditId}/versions`, { notes });
    return response.data;
  }

  // Alle Versionen eines Audits abrufen
  async getVersions(auditId: number): Promise<{ versions: AuditVersion[] }> {
    const response = await api.get(`/audits/${auditId}/versions`);
    return response.data;
  }

  // Einzelne Version abrufen
  async getVersion(auditId: number, versionId: number): Promise<{ version: AuditVersion }> {
    const response = await api.get(`/audits/${auditId}/versions/${versionId}`);
    return response.data;
  }

  // Maßnahmen (Action Items) abrufen
  async getActionItems(auditId: number): Promise<{ actionItems: ActionItem[] }> {
    const response = await api.get(`/audits/${auditId}/action-items`);
    return response.data;
  }

  // Maßnahmen speichern
  async updateActionItems(
    auditId: number,
    items: ActionItem[]
  ): Promise<{ message: string }> {
    const response = await api.put(`/audits/${auditId}/action-items`, { actionItems: items });
    return response.data;
  }

  // Audit-History (Änderungsprotokoll) abrufen
  async getHistory(auditId: number): Promise<{ history: AuditHistoryEntry[] }> {
    const response = await api.get(`/audits/${auditId}/history`);
    return response.data;
  }
}

export default new AuditService();
