"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { AuditFormData, AuditResult, ToolEntry, UseCase, ToolId } from "@/types";

interface AuditStore {
  // Form state
  formData: AuditFormData;
  addTool: (toolId: ToolId, planId: string) => void;
  removeTool: (entryId: string) => void;
  updateTool: (entryId: string, updates: Partial<Omit<ToolEntry, "id">>) => void;
  setTeamSize: (size: number) => void;
  setUseCase: (useCase: UseCase) => void;
  setCompanyName: (name: string) => void;
  resetForm: () => void;

  // Audit result
  auditResult: AuditResult | null;
  setAuditResult: (result: AuditResult | null) => void;

  // UI state
  isRunningAudit: boolean;
  setIsRunningAudit: (v: boolean) => void;
  auditError: string | null;
  setAuditError: (err: string | null) => void;

  // Lead capture
  leadCaptured: boolean;
  setLeadCaptured: (v: boolean) => void;
}

const defaultFormData: AuditFormData = {
  tools: [],
  teamSize: 5,
  useCase: "mixed",
  companyName: "",
};

export const useAuditStore = create<AuditStore>()(
  persist(
    (set) => ({
      formData: defaultFormData,
      auditResult: null,
      isRunningAudit: false,
      auditError: null,
      leadCaptured: false,

      addTool: (toolId, planId) =>
        set((state) => ({
          formData: {
            ...state.formData,
            tools: [
              ...state.formData.tools,
              { id: uuidv4(), toolId, planId, seats: 1, monthlySpend: 0 },
            ],
          },
        })),

      removeTool: (entryId) =>
        set((state) => ({
          formData: {
            ...state.formData,
            tools: state.formData.tools.filter((t) => t.id !== entryId),
          },
        })),

      updateTool: (entryId, updates) =>
        set((state) => ({
          formData: {
            ...state.formData,
            tools: state.formData.tools.map((t) =>
              t.id === entryId ? { ...t, ...updates } : t
            ),
          },
        })),

      setTeamSize: (teamSize) =>
        set((state) => ({ formData: { ...state.formData, teamSize } })),

      setUseCase: (useCase) =>
        set((state) => ({ formData: { ...state.formData, useCase } })),

      setCompanyName: (companyName) =>
        set((state) => ({ formData: { ...state.formData, companyName } })),

      resetForm: () =>
        set({ formData: defaultFormData, auditResult: null, leadCaptured: false }),

      setAuditResult: (auditResult) => set({ auditResult }),
      setIsRunningAudit: (isRunningAudit) => set({ isRunningAudit }),
      setAuditError: (auditError) => set({ auditError }),
      setLeadCaptured: (leadCaptured) => set({ leadCaptured }),
    }),
    {
      name: "spendlens-audit-store",
      partialize: (state) => ({
        formData: state.formData,
        auditResult: state.auditResult,
        leadCaptured: state.leadCaptured,
      }),
    }
  )
);
