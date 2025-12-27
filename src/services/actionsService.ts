import api from './api';

export interface ActionItem {
  id: number;
  auditId: number;
  requirementId: string;
  category: string;
  requirementTitle: string;
  severity: 'hoch' | 'mittel' | 'niedrig';
  recommendedAction: string;
  responsible: string;
  targetDate?: string;
  status: 'open' | 'in_progress' | 'completed' | 'deferred';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Enriched fields
  systemName?: string;
  systemRiskClass?: string;
  auditStatus?: string;
  isOverdue?: boolean;
  lastModifiedBy?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface ActionStats {
  total: number;
  open: number;
  inProgress: number;
  completed: number;
  deferred: number;
  overdue: number;
  dueThisWeek: number;
  bySeverity: {
    hoch: number;
    mittel: number;
    niedrig: number;
  };
}

export interface ActionFilters {
  status?: string;
  severity?: string;
  responsible?: string;
  systemId?: number;
  dueWithinDays?: number;
  overdue?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface ActionStatsData {
  byStatus: { status: string; count: number; label: string }[];
  bySystem: { systemId: number; systemName: string; total: number; completed: number; pending: number }[];
  timeline: { weekStart: string; due: number; completed: number }[];
}

const actionsService = {
  /**
   * Get all actions with filters
   */
  async getActions(filters: ActionFilters = {}) {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.severity) params.append('severity', filters.severity);
    if (filters.responsible) params.append('responsible', filters.responsible);
    if (filters.systemId) params.append('systemId', String(filters.systemId));
    if (filters.dueWithinDays) params.append('dueWithinDays', String(filters.dueWithinDays));
    if (filters.overdue) params.append('overdue', 'true');
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get(`/actions?${params.toString()}`);
    return response.data as {
      actions: ActionItem[];
      stats: ActionStats;
      pagination: { page: number; limit: number; total: number; pages: number };
    };
  },

  /**
   * Get a single action by ID
   */
  async getAction(id: number) {
    const response = await api.get(`/actions/${id}`);
    return response.data as {
      action: ActionItem & { history?: any[] };
      permission: string;
    };
  },

  /**
   * Update an action
   */
  async updateAction(id: number, data: Partial<Pick<ActionItem, 'status' | 'responsible' | 'targetDate' | 'notes'>>) {
    const response = await api.put(`/actions/${id}`, data);
    return response.data;
  },

  /**
   * Get statistics for charts
   */
  async getStats() {
    const response = await api.get('/actions/stats');
    return response.data as ActionStatsData;
  },

  /**
   * Get list of responsible persons for filter
   */
  async getResponsiblePersons() {
    const response = await api.get('/actions/filters/responsible');
    return response.data.responsiblePersons as string[];
  },

  /**
   * Get list of systems for filter
   */
  async getSystems() {
    const response = await api.get('/actions/filters/systems');
    return response.data.systems as { id: number; name: string }[];
  },
};

export default actionsService;
