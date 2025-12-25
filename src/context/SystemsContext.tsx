import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  RegisteredAiSystem,
  SystemStatus,
  SystemRegistryStats,
  SystemListFilter,
  SystemListSort,
  createNewSystem,
  calculateRegistryStats,
  AiSystemInfo,
  RiskClass
} from "../models/types";

// =============================================================================
// V-03: SystemsContext - Multi-System-Verwaltung
// Ermöglicht zentrale Verwaltung mehrerer KI-Systeme für Unternehmen
// =============================================================================

interface SystemsContextType {
  // State
  systems: RegisteredAiSystem[];
  selectedSystem: RegisteredAiSystem | null;
  stats: SystemRegistryStats;
  isLoading: boolean;

  // CRUD Operations
  addSystem: (partialInfo?: Partial<AiSystemInfo>) => RegisteredAiSystem;
  updateSystem: (id: string, updates: Partial<RegisteredAiSystem>) => void;
  deleteSystem: (id: string) => void;
  duplicateSystem: (id: string) => RegisteredAiSystem | null;

  // Selection
  selectSystem: (id: string | null) => void;
  getSystemById: (id: string) => RegisteredAiSystem | undefined;

  // Status Management
  updateSystemStatus: (id: string, status: SystemStatus) => void;
  updateSystemRiskClass: (id: string, riskClass: RiskClass) => void;
  updateSystemComplianceScore: (id: string, score: number) => void;

  // Filtering & Sorting
  filter: SystemListFilter;
  setFilter: (filter: SystemListFilter) => void;
  sort: SystemListSort;
  setSort: (sort: SystemListSort) => void;
  filteredSystems: RegisteredAiSystem[];

  // Bulk Operations
  archiveMultiple: (ids: string[]) => void;
  exportSystems: (ids?: string[]) => string;
  importSystems: (jsonData: string) => number;
}

const SystemsContext = createContext<SystemsContextType | undefined>(undefined);

const STORAGE_KEY = "eu-ai-act-systems-registry";

export const SystemsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [systems, setSystems] = useState<RegisteredAiSystem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Fehler beim Laden der Systeme:", error);
    }
    return [];
  });

  const [selectedSystem, setSelectedSystem] = useState<RegisteredAiSystem | null>(null);
  const [isLoading] = useState(false);
  const [filter, setFilter] = useState<SystemListFilter>({});
  const [sort, setSort] = useState<SystemListSort>({ field: "updatedAt", direction: "desc" });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(systems));
    } catch (error) {
      console.error("Fehler beim Speichern der Systeme:", error);
    }
  }, [systems]);

  // Calculate stats
  const stats = calculateRegistryStats(systems);

  // CRUD Operations
  const addSystem = useCallback((partialInfo?: Partial<AiSystemInfo>): RegisteredAiSystem => {
    const newSystem = createNewSystem(partialInfo);
    setSystems(prev => [...prev, newSystem]);
    return newSystem;
  }, []);

  const updateSystem = useCallback((id: string, updates: Partial<RegisteredAiSystem>) => {
    setSystems(prev => prev.map(sys => {
      if (sys.id === id) {
        return {
          ...sys,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return sys;
    }));

    // Update selected if it's the same system
    setSelectedSystem(prev => {
      if (prev?.id === id) {
        return { ...prev, ...updates, updatedAt: new Date().toISOString() };
      }
      return prev;
    });
  }, []);

  const deleteSystem = useCallback((id: string) => {
    setSystems(prev => prev.filter(sys => sys.id !== id));
    setSelectedSystem(prev => prev?.id === id ? null : prev);
  }, []);

  const duplicateSystem = useCallback((id: string): RegisteredAiSystem | null => {
    const original = systems.find(sys => sys.id === id);
    if (!original) return null;

    const duplicate = createNewSystem(original.systemInfo);
    duplicate.systemInfo.systemName = `${original.systemInfo.systemName} (Kopie)`;
    duplicate.tags = [...original.tags];
    duplicate.department = original.department;
    duplicate.responsiblePerson = original.responsiblePerson;

    setSystems(prev => [...prev, duplicate]);
    return duplicate;
  }, [systems]);

  // Selection
  const selectSystem = useCallback((id: string | null) => {
    if (id === null) {
      setSelectedSystem(null);
    } else {
      const system = systems.find(sys => sys.id === id);
      setSelectedSystem(system || null);
    }
  }, [systems]);

  const getSystemById = useCallback((id: string): RegisteredAiSystem | undefined => {
    return systems.find(sys => sys.id === id);
  }, [systems]);

  // Status Management
  const updateSystemStatus = useCallback((id: string, status: SystemStatus) => {
    updateSystem(id, { status });
  }, [updateSystem]);

  const updateSystemRiskClass = useCallback((id: string, riskClass: RiskClass) => {
    updateSystem(id, { riskClass });
  }, [updateSystem]);

  const updateSystemComplianceScore = useCallback((id: string, score: number) => {
    updateSystem(id, { complianceScore: Math.max(0, Math.min(100, score)) });
  }, [updateSystem]);

  // Filtering & Sorting
  const filteredSystems = React.useMemo(() => {
    let result = [...systems];

    // Apply filters
    if (filter.status && filter.status.length > 0) {
      result = result.filter(sys => filter.status!.includes(sys.status));
    }

    if (filter.riskClass && filter.riskClass.length > 0) {
      result = result.filter(sys => sys.riskClass && filter.riskClass!.includes(sys.riskClass));
    }

    if (filter.department) {
      result = result.filter(sys => sys.department === filter.department);
    }

    if (filter.tags && filter.tags.length > 0) {
      result = result.filter(sys =>
        filter.tags!.some(tag => sys.tags.includes(tag))
      );
    }

    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      result = result.filter(sys =>
        sys.systemInfo.systemName.toLowerCase().includes(term) ||
        sys.systemInfo.useCase.toLowerCase().includes(term) ||
        sys.systemInfo.domain.toLowerCase().includes(term) ||
        sys.department?.toLowerCase().includes(term) ||
        sys.responsiblePerson?.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sort.field) {
        case "systemName":
          comparison = a.systemInfo.systemName.localeCompare(b.systemInfo.systemName);
          break;
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "updatedAt":
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case "riskClass":
          const riskOrder = { PROHIBITED: 0, HIGH_RISK: 1, LIMITED_RISK: 2, MINIMAL_RISK: 3 };
          const aRisk = a.riskClass ? riskOrder[a.riskClass] : 99;
          const bRisk = b.riskClass ? riskOrder[b.riskClass] : 99;
          comparison = aRisk - bRisk;
          break;
        case "complianceScore":
          comparison = (a.complianceScore || 0) - (b.complianceScore || 0);
          break;
        case "nextAuditDue":
          const aDate = a.nextAuditDue ? new Date(a.nextAuditDue).getTime() : Infinity;
          const bDate = b.nextAuditDue ? new Date(b.nextAuditDue).getTime() : Infinity;
          comparison = aDate - bDate;
          break;
      }

      return sort.direction === "asc" ? comparison : -comparison;
    });

    return result;
  }, [systems, filter, sort]);

  // Bulk Operations
  const archiveMultiple = useCallback((ids: string[]) => {
    setSystems(prev => prev.map(sys => {
      if (ids.includes(sys.id)) {
        return { ...sys, status: "DEPRECATED" as SystemStatus, updatedAt: new Date().toISOString() };
      }
      return sys;
    }));
  }, []);

  const exportSystems = useCallback((ids?: string[]): string => {
    const toExport = ids
      ? systems.filter(sys => ids.includes(sys.id))
      : systems;

    return JSON.stringify({
      exportDate: new Date().toISOString(),
      version: "1.0",
      systems: toExport
    }, null, 2);
  }, [systems]);

  const importSystems = useCallback((jsonData: string): number => {
    try {
      const data = JSON.parse(jsonData);
      const importedSystems: RegisteredAiSystem[] = data.systems || [];

      // Generiere neue IDs für importierte Systeme
      const now = new Date().toISOString();
      const newSystems = importedSystems.map(sys => ({
        ...sys,
        id: `sys_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        createdAt: now,
        updatedAt: now,
        status: "DRAFT" as SystemStatus,
        auditCount: 0
      }));

      setSystems(prev => [...prev, ...newSystems]);
      return newSystems.length;
    } catch (error) {
      console.error("Fehler beim Import:", error);
      return 0;
    }
  }, []);

  const contextValue: SystemsContextType = {
    systems,
    selectedSystem,
    stats,
    isLoading,
    addSystem,
    updateSystem,
    deleteSystem,
    duplicateSystem,
    selectSystem,
    getSystemById,
    updateSystemStatus,
    updateSystemRiskClass,
    updateSystemComplianceScore,
    filter,
    setFilter,
    sort,
    setSort,
    filteredSystems,
    archiveMultiple,
    exportSystems,
    importSystems
  };

  return (
    <SystemsContext.Provider value={contextValue}>
      {children}
    </SystemsContext.Provider>
  );
};

export const useSystems = () => {
  const context = useContext(SystemsContext);
  if (!context) {
    throw new Error("useSystems must be used within SystemsProvider");
  }
  return context;
};
