"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, ChevronDown, AlertCircle, Loader2 } from "lucide-react";
import { useAuditStore } from "@/store/audit-store";
import { TOOLS } from "@/lib/pricing-data";
import type { ToolId, UseCase } from "@/types";

const USE_CASES: { value: UseCase; label: string }[] = [
  { value: "coding",   label: "Coding / Engineering" },
  { value: "writing",  label: "Writing / Content" },
  { value: "data",     label: "Data / Analytics" },
  { value: "research", label: "Research" },
  { value: "mixed",    label: "Mixed / General" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-label mb-3" style={{ color: "var(--text-muted)" }}>
      {children}
    </p>
  );
}

export default function AuditForm() {
  const {
    formData, addTool, removeTool, updateTool,
    setTeamSize, setUseCase, setCompanyName,
    setIsRunningAudit, setAuditResult, setAuditError, auditError,
  } = useAuditStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableTools = TOOLS.filter(
    (t) => !formData.tools.some((e) => e.toolId === t.id)
  );

  const handleAddTool = (toolId: ToolId) => {
    const tool = TOOLS.find((t) => t.id === toolId);
    if (!tool) return;
    const defaultPlan = tool.plans.find((p) => p.monthlyPricePerSeat > 0) ?? tool.plans[0];
    addTool(toolId, defaultPlan.id);
  };

  const handleSubmit = async () => {
    if (formData.tools.length === 0) {
      setAuditError("Add at least one AI tool to audit.");
      return;
    }
    if (formData.tools.every((t) => t.monthlySpend === 0)) {
      setAuditError("Enter your monthly spend for at least one tool.");
      return;
    }

    setIsSubmitting(true);
    setIsRunningAudit(true);
    setAuditError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData, _hp: "" }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error ?? "Audit failed");
      setAuditResult(data.data);
      setIsRunningAudit(false);
    } catch (err) {
      const msg =
        err instanceof Error && err.name === "AbortError"
          ? "Request timed out. Please try again."
          : err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setAuditError(msg);
      setIsRunningAudit(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12" role="main">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-heading text-3xl mb-2">Audit your AI spend</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Add each AI tool your team pays for. Enter your actual monthly bill — not what the
          plan says, what you actually pay.
        </p>
      </motion.div>

      {/* ── Team context ── */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="card-elevated mb-4"
        aria-labelledby="team-context-label"
      >
        <SectionLabel>
          <span id="team-context-label">Team context</span>
        </SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="team-size" className="text-label block mb-1.5">
              Total team size
            </label>
            <input
              id="team-size"
              type="number"
              min={1}
              max={10000}
              value={formData.teamSize}
              onChange={(e) => setTeamSize(Math.max(1, parseInt(e.target.value) || 1))}
              className="input"
              placeholder="e.g. 12"
              aria-describedby="team-size-hint"
            />
            <p id="team-size-hint" className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
              Headcount using AI tools
            </p>
          </div>
          <div>
            <label htmlFor="use-case" className="text-label block mb-1.5">
              Primary use case
            </label>
            <div className="relative">
              <select
                id="use-case"
                value={formData.useCase}
                onChange={(e) => setUseCase(e.target.value as UseCase)}
                className="input appearance-none pr-8"
              >
                {USE_CASES.map((uc) => (
                  <option key={uc.value} value={uc.value}>
                    {uc.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={13}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--text-muted)" }}
                aria-hidden="true"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="company-name" className="text-label block mb-1.5">
              Company name{" "}
              <span className="normal-case font-normal" style={{ color: "var(--text-muted)" }}>
                (optional)
              </span>
            </label>
            <input
              id="company-name"
              type="text"
              value={formData.companyName ?? ""}
              onChange={(e) => setCompanyName(e.target.value)}
              className="input"
              placeholder="Acme Inc."
              maxLength={100}
              autoComplete="organization"
            />
          </div>
        </div>
      </motion.section>

      {/* ── Tools ── */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        aria-labelledby="tools-label"
      >
        <div className="flex items-center justify-between mb-3">
          <SectionLabel>
            <span id="tools-label">AI tools &amp; plans</span>
          </SectionLabel>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {formData.tools.length} tool{formData.tools.length !== 1 ? "s" : ""} added
          </span>
        </div>

        {/* Tool rows */}
        <div className="space-y-2.5 mb-4" role="list" aria-label="Added AI tools">
          {formData.tools.map((entry) => {
            const tool = TOOLS.find((t) => t.id === entry.toolId);
            if (!tool) return null;
            const currentPlan = tool.plans.find((p) => p.id === entry.planId);
            const expectedCost = (currentPlan?.monthlyPricePerSeat ?? 0) * entry.seats;

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="card-elevated"
                role="listitem"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Tool name + category */}
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="font-semibold text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {tool.name}
                      </span>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded capitalize"
                        style={{
                          background: "var(--bg-highlight)",
                          color: "var(--text-muted)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {tool.category}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {/* Plan */}
                      <div>
                        <label
                          htmlFor={`plan-${entry.id}`}
                          className="text-label block mb-1"
                        >
                          Plan
                        </label>
                        <div className="relative">
                          <select
                            id={`plan-${entry.id}`}
                            value={entry.planId}
                            onChange={(e) => updateTool(entry.id, { planId: e.target.value })}
                            className="input appearance-none pr-6 text-xs"
                          >
                            {tool.plans.map((plan) => (
                              <option key={plan.id} value={plan.id}>
                                {plan.name}
                                {plan.monthlyPricePerSeat > 0
                                  ? ` · $${plan.monthlyPricePerSeat}`
                                  : " · Free"}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={11}
                            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ color: "var(--text-muted)" }}
                            aria-hidden="true"
                          />
                        </div>
                      </div>

                      {/* Seats */}
                      <div>
                        <label
                          htmlFor={`seats-${entry.id}`}
                          className="text-label block mb-1"
                        >
                          Seats
                        </label>
                        <input
                          id={`seats-${entry.id}`}
                          type="number"
                          min={1}
                          max={10000}
                          value={entry.seats}
                          onChange={(e) =>
                            updateTool(entry.id, {
                              seats: Math.max(1, parseInt(e.target.value) || 1),
                            })
                          }
                          className="input text-xs"
                        />
                      </div>

                      {/* Actual spend */}
                      <div>
                        <label
                          htmlFor={`spend-${entry.id}`}
                          className="text-label block mb-1"
                        >
                          $/mo actual
                        </label>
                        <div className="relative">
                          <span
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-xs"
                            style={{ color: "var(--text-muted)" }}
                            aria-hidden="true"
                          >
                            $
                          </span>
                          <input
                            id={`spend-${entry.id}`}
                            type="number"
                            min={0}
                            value={entry.monthlySpend || ""}
                            onChange={(e) =>
                              updateTool(entry.id, {
                                monthlySpend: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="input pl-5 text-xs"
                            placeholder="0"
                            aria-label={`Monthly spend for ${tool.name} in dollars`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Expected cost hint */}
                    {expectedCost > 0 && (
                      <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                        Standard rate: ${expectedCost.toFixed(0)}/mo · {entry.seats} seat
                        {entry.seats > 1 ? "s" : ""}
                        {entry.monthlySpend > expectedCost * 1.15 && (
                          <span className="ml-1" style={{ color: "var(--accent-gold)" }}>
                            ↑ above expected
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => removeTool(entry.id)}
                    aria-label={`Remove ${tool.name}`}
                    className="p-1.5 rounded mt-0.5 transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--accent-danger)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "var(--text-muted)")
                    }
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Add tool buttons */}
        {availableTools.length > 0 && (
          <div
            className="flex flex-wrap gap-2 mb-8"
            role="group"
            aria-label="Add AI tools"
          >
            {availableTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleAddTool(tool.id as ToolId)}
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-all duration-150"
                style={{
                  border: "1px dashed var(--border)",
                  color: "var(--text-secondary)",
                  background: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent-blue)";
                  e.currentTarget.style.color = "var(--text-primary)";
                  e.currentTarget.style.background = "var(--bg-highlight)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.background = "transparent";
                }}
                aria-label={`Add ${tool.name}`}
              >
                <Plus size={12} aria-hidden="true" /> {tool.name}
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {formData.tools.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-10 rounded-xl mb-6"
            style={{ border: "1px dashed var(--border)", background: "var(--bg-secondary)" }}
          >
            <p className="text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
              No tools added yet
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Select tools above to start your audit
            </p>
          </motion.div>
        )}

        {/* Error */}
        {auditError && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm px-4 py-3 rounded-lg mb-5"
            style={{
              background: "rgba(217,119,119,0.08)",
              border: "1px solid rgba(217,119,119,0.25)",
              color: "var(--accent-danger)",
            }}
            role="alert"
          >
            <AlertCircle size={14} className="flex-shrink-0" aria-hidden="true" />
            {auditError}
          </motion.div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || formData.tools.length === 0}
          className="btn-success w-full sm:w-auto text-base py-3.5 px-8 justify-center"
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              Running audit…
            </>
          ) : (
            "Run my audit →"
          )}
        </button>

        {formData.tools.length === 0 && (
          <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
            Add at least one tool above to run your audit.
          </p>
        )}
      </motion.section>
    </div>
  );
}
