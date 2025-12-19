import api from './api';
import { AiSystemInfo, RiskClass, AuditAnswer } from '../models/types';

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
}

export default new AuditService();
