import api from './api';

export interface DemoLead {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  expiresAt?: string;
}

export interface DemoStatus {
  enabled: boolean;
  autoGrant: boolean;
}

export interface DemoRequestData {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  role: string;
  phone?: string;
  privacyAccepted: boolean;
}

export interface DemoRequestResponse {
  success: boolean;
  message: string;
  demoToken?: string;
  expiresAt?: string;
  pending?: boolean;
}

export interface DemoVerifyResponse {
  valid: boolean;
  lead?: DemoLead;
  error?: string;
}

class DemoService {
  private DEMO_TOKEN_KEY = 'demoToken';
  private DEMO_LEAD_KEY = 'demoLead';

  async getStatus(): Promise<DemoStatus> {
    try {
      const response = await api.get<DemoStatus>('/demo/status');
      return response.data;
    } catch {
      // Default to enabled if can't reach server
      return { enabled: true, autoGrant: true };
    }
  }

  async requestAccess(data: DemoRequestData): Promise<DemoRequestResponse> {
    const response = await api.post<DemoRequestResponse>('/demo/request', data);

    if (response.data.success && response.data.demoToken) {
      this.setDemoToken(response.data.demoToken);
    }

    return response.data;
  }

  async verifyAccess(): Promise<DemoVerifyResponse> {
    const token = this.getDemoToken();

    if (!token) {
      return { valid: false, error: 'Kein Demo-Token vorhanden' };
    }

    try {
      const response = await api.get<DemoVerifyResponse>('/demo/verify', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.valid && response.data.lead) {
        this.setDemoLead(response.data.lead);
      }

      return response.data;
    } catch {
      // Token is invalid or expired
      this.clearDemoAccess();
      return { valid: false, error: 'Demo-Token ungültig oder abgelaufen' };
    }
  }

  setDemoToken(token: string): void {
    localStorage.setItem(this.DEMO_TOKEN_KEY, token);
  }

  getDemoToken(): string | null {
    return localStorage.getItem(this.DEMO_TOKEN_KEY);
  }

  setDemoLead(lead: DemoLead): void {
    localStorage.setItem(this.DEMO_LEAD_KEY, JSON.stringify(lead));
  }

  getDemoLead(): DemoLead | null {
    const leadStr = localStorage.getItem(this.DEMO_LEAD_KEY);
    if (leadStr) {
      try {
        return JSON.parse(leadStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  hasDemoAccess(): boolean {
    return !!this.getDemoToken();
  }

  clearDemoAccess(): void {
    localStorage.removeItem(this.DEMO_TOKEN_KEY);
    localStorage.removeItem(this.DEMO_LEAD_KEY);
  }
}

export default new DemoService();
