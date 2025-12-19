import React, { createContext, useContext, useState, useEffect } from "react";
import {
  AuditState,
  AiSystemInfo,
  RiskClass,
  AuditAnswer,
  ActionItem,
} from "../models/types";

interface AuditContextType {
  state: AuditState;
  setSystemInfo: (info: AiSystemInfo) => void;
  setRiskClass: (riskClass: RiskClass) => void;
  setAuditAnswers: (answers: AuditAnswer[]) => void;
  updateAuditAnswer: (answer: AuditAnswer) => void;
  setActionItems: (items: ActionItem[]) => void;
  updateActionItem: (item: ActionItem) => void;
  setCurrentStep: (step: number) => void;
  resetAudit: () => void;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

const STORAGE_KEY = "eu-ai-act-audit-state";

// Initialer Zustand
const initialState: AuditState = {
  systemInfo: null,
  riskClass: null,
  auditAnswers: [],
  actionItems: [],
  currentStep: 0,
};

export const AuditProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuditState>(() => {
    // Lade Zustand aus localStorage beim Start
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Fehler beim Laden des Zustands:", error);
    }
    return initialState;
  });

  // Speichere Zustand in localStorage bei Änderungen
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Fehler beim Speichern des Zustands:", error);
    }
  }, [state]);

  const setSystemInfo = (info: AiSystemInfo) => {
    setState((prev) => ({ ...prev, systemInfo: info }));
  };

  const setRiskClass = (riskClass: RiskClass) => {
    setState((prev) => ({ ...prev, riskClass }));
  };

  const setAuditAnswers = (answers: AuditAnswer[]) => {
    setState((prev) => ({ ...prev, auditAnswers: answers }));
  };

  const updateAuditAnswer = (answer: AuditAnswer) => {
    setState((prev) => {
      const existing = prev.auditAnswers.findIndex(
        (a) => a.requirementId === answer.requirementId
      );

      if (existing >= 0) {
        // Update existing
        const updated = [...prev.auditAnswers];
        updated[existing] = answer;
        return { ...prev, auditAnswers: updated };
      } else {
        // Add new
        return {
          ...prev,
          auditAnswers: [...prev.auditAnswers, answer],
        };
      }
    });
  };

  const setActionItems = (items: ActionItem[]) => {
    setState((prev) => ({ ...prev, actionItems: items }));
  };

  const updateActionItem = (item: ActionItem) => {
    setState((prev) => {
      const existing = prev.actionItems.findIndex((a) => a.id === item.id);

      if (existing >= 0) {
        const updated = [...prev.actionItems];
        updated[existing] = item;
        return { ...prev, actionItems: updated };
      } else {
        return {
          ...prev,
          actionItems: [...prev.actionItems, item],
        };
      }
    });
  };

  const setCurrentStep = (step: number) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  };

  const resetAudit = () => {
    setState(initialState);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuditContext.Provider
      value={{
        state,
        setSystemInfo,
        setRiskClass,
        setAuditAnswers,
        updateAuditAnswer,
        setActionItems,
        updateActionItem,
        setCurrentStep,
        resetAudit,
      }}
    >
      {children}
    </AuditContext.Provider>
  );
};

export const useAudit = () => {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error("useAudit must be used within AuditProvider");
  }
  return context;
};
