"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ChevronDown, AlertCircle, Loader2, ArrowRight, Info } from "lucide-react";
import { useAuditStore } from "@/store/audit-store";
import { TOOLS } from "@/lib/pricing-data";
import type { ToolId, UseCase, PricingPlan } from "@/types";

const USE_CASES: { value: UseCase; label: string }[] = [
  { value: "coding",   label: "Coding / Engineering" },
  { value: "writing",  label: "Writing / Content" },
  { value: "data",     label: "Data / Analytics" },
  { value: "research", label: "Research" },
  { value: "mixed",    label: "Mixed / General" },
];

// ─── Format the price label shown next to a plan name ────────────────────────
function formatPlanPriceLabel(plan: PricingPlan): string {
  if (plan.priceType === "usage") {
    return " · Usage-based";
  }
  if (plan.priceType === "custom") {
    return plan.monthlyPricePerSeat > 0
      ? ` · From $${plan.monthlyPricePerSeat}`
      : " · Custom";
  }
  return plan.monthlyPricePerSeat > 0
    ? ` · $${plan.monthlyPricePerSeat}`
    : " · Free";
}

// ─── Clean number input — no native spinners, real placeholder support ───────
function NumberField({
  id,
  value,
  onChange,
  placeholder,
  min = 0,
  max = 100000,
  prefix,
  ariaLabel,
  className = "",
}: {
  id: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  prefix?: string;
  ariaLabel?: string;
  className?: string;
}) {
  // Internal string state lets the field be truly empty — not stuck at "1"
  const [str, setStr] = useState<string>(
    value === undefined || value === null || Number.isNaN(value) ? "" : String(value)
  );

  // Keep in sync if parent updates value externally (e.g. autofill)
  useEffect(() => {
    const next = value === undefined || value === null || Number.isNaN(value) ? "" : String(value);
    if (next !== str) setStr(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const commit = (raw: string) => {
    if (raw === "" || raw === "-") {
      onChange(undefined);
      return;
    }
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    const clamped = Math.max(min, Math.min(max, n));
    onChange(clamped);
  };

  return (
    <div className="relative">
      {prefix && (
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] tabular pointer-events-none"
          style={{ color: "var(--text-muted)" }}
          aria-hidden="true"
        >
          {prefix}
        </span>
      )}
      <input
        id={id}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={str}
        onChange={(e) => {
          // Strip everything except digits and dot
          const cleaned = e.target.value.replace(/[^\d.]/g, "");
          setStr(cleaned);
        }}
        onBlur={() => commit(str)}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
        }}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={`input tabular ${prefix ? "pl-7" : ""} ${className}`}
        style={{
          appearance: "textfield",
          MozAppearance: "textfield",
        }}
      />
      <style jsx>{`
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </div>
  );
}

export default function AuditForm() {
  const {
    formData, addTool, removeTool, updateTool,
    setTeamSize, setUseCase, setCompanyName,
    setIsRunningAudit, setAuditResult, setAuditError, auditError,
  } = useAuditStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  // Track which tool entries the user has manually edited the spend on —
  // we only auto-fill if they haven't touched it yet
  const userEditedSpend = useRef<Set<string>>(new Set());

  const availableTools = TOOLS.filter(
    (t) => !formData.tools.some((e) => e.toolId === t.id)
  );

  const handleAddTool = (toolId: ToolId) => {
    const tool = TOOLS.find((t) => t.id === toolId);
    if (!tool) return;
    // Pick the first standard-priced plan as default; fall back to first plan
    const defaultPlan =
      tool.plans.find(
        (p) => p.monthlyPricePerSeat > 0 && !p.priceType
      ) ?? tool.plans[0];
    addTool(toolId, defaultPlan.id);
  };

  // ─── Auto-fill spend whenever plan or seat count changes ──────────────────
  // Only fires for STANDARD per-seat plans. Usage-based and custom-quoted
  // plans are user-entered because they have no predictable seat × price
  // relationship.
  const recalcSpend = (entryId: string, planId: string, seats: number | undefined) => {
    if (userEditedSpend.current.has(entryId)) return;
    if (!seats) return;
    const entry = formData.tools.find((t) => t.id === entryId);
    if (!entry) return;
    const tool = TOOLS.find((t) => t.id === entry.toolId);
    if (!tool) return;
    const plan = tool.plans.find((p) => p.id === planId);
    if (!plan) return;

    // Don't auto-fill for usage-based or custom plans
    if (plan.priceType === "usage" || plan.priceType === "custom") {
      return;
    }

    const expected = plan.monthlyPricePerSeat * seats;
    updateTool(entryId, { monthlySpend: expected });
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
    <div className="max-w-3xl mx-auto px-6 py-12" role="main">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <p
          className="text-[10px] font-semibold uppercase mb-3"
          style={{ color: "var(--text-tertiary)", letterSpacing: "0.12em" }}
        >
          Step 1 of 1 · Audit input
        </p>
        <h1
          className="text-display text-3xl sm:text-4xl mb-2"
          style={{ color: "var(--text-primary)", letterSpacing: "-0.04em" }}
        >
          Tell us about your stack.
        </h1>
        <p
          className="text-[15px] leading-relaxed max-w-xl"
          style={{ color: "var(--text-tertiary)" }}
        >
          Enter the AI tools your team pays for. We&apos;ll auto-calculate the standard rate
          based on plan and seats — adjust the actual amount if your invoice differs.
        </p>
      </motion.div>

      {/* ══ TEAM CONTEXT ════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-xl mb-5 overflow-hidden"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
        }}
        aria-labelledby="team-context-label"
      >
        <div
          className="px-5 py-3 border-b"
          style={{ borderColor: "var(--hairline)" }}
        >
          <p
            id="team-context-label"
            className="text-[10px] font-semibold uppercase"
            style={{ color: "var(--text-tertiary)", letterSpacing: "0.1em" }}
          >
            Team context
          </p>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="team-size"
                className="block mb-1.5 text-[12px] font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Total team size
              </label>
              <NumberField
                id="team-size"
                value={formData.teamSize || undefined}
                onChange={(v) => setTeamSize(v ?? 1)}
                placeholder="e.g. 12"
                min={1}
                max={10000}
                ariaLabel="Total team size"
              />
              <p
                className="text-[11px] mt-1.5"
                style={{ color: "var(--text-muted)" }}
              >
                Engineers + AI users company-wide
              </p>
            </div>

            <div>
              <label
                htmlFor="use-case"
                className="block mb-1.5 text-[12px] font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
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
              <label
                htmlFor="company-name"
                className="block mb-1.5 text-[12px] font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Company name
                <span
                  className="font-normal ml-1.5"
                  style={{ color: "var(--text-faint)" }}
                >
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
        </div>
      </motion.section>

      {/* ══ TOOLS ═══════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        aria-labelledby="tools-label"
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <p
            id="tools-label"
            className="text-[10px] font-semibold uppercase"
            style={{ color: "var(--text-tertiary)", letterSpacing: "0.1em" }}
          >
            AI tools & plans
          </p>
          <span
            className="text-[11px] tabular"
            style={{ color: "var(--text-muted)" }}
          >
            {formData.tools.length} {formData.tools.length === 1 ? "tool" : "tools"}
          </span>
        </div>

        {/* ── Tool rows ───────────────────────────────────────────────────── */}
        <div className="space-y-2.5 mb-4" role="list" aria-label="Added AI tools">
          <AnimatePresence initial={false}>
            {formData.tools.map((entry) => {
              const tool = TOOLS.find((t) => t.id === entry.toolId);
              if (!tool) return null;
              const currentPlan = tool.plans.find((p) => p.id === entry.planId);

              const isVariablePlan =
                currentPlan?.priceType === "usage" || currentPlan?.priceType === "custom";

              const expectedCost = isVariablePlan
                ? 0
                : (currentPlan?.monthlyPricePerSeat ?? 0) * (entry.seats || 0);

              const userOverride = userEditedSpend.current.has(entry.id);
              const overspending =
                expectedCost > 0 && entry.monthlySpend > expectedCost * 1.15;

              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                  }}
                  role="listitem"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">

                        {/* Tool header */}
                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className="font-semibold text-[14px]"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {tool.name}
                          </span>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-medium uppercase"
                            style={{
                              background: "var(--bg-elevated)",
                              color: "var(--text-tertiary)",
                              letterSpacing: "0.04em",
                            }}
                          >
                            {tool.category}
                          </span>
                        </div>

                        {/* 3-col grid: Plan / Seats / Spend */}
                        <div className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr_1.2fr] gap-3">
                          {/* Plan */}
                          <div>
                            <label
                              htmlFor={`plan-${entry.id}`}
                              className="block mb-1 text-[10px] font-semibold uppercase"
                              style={{ color: "var(--text-tertiary)", letterSpacing: "0.06em" }}
                            >
                              Plan
                            </label>
                            <div className="relative">
                              <select
                                id={`plan-${entry.id}`}
                                value={entry.planId}
                                onChange={(e) => {
                                  const newPlanId = e.target.value;
                                  updateTool(entry.id, { planId: newPlanId });
                                  // Auto-recalc spend on plan change
                                  recalcSpend(entry.id, newPlanId, entry.seats);
                                }}
                                className="input appearance-none pr-7 text-[13px]"
                              >
                                {tool.plans.map((plan) => (
                                  <option key={plan.id} value={plan.id}>
                                    {plan.name}
                                    {formatPlanPriceLabel(plan)}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown
                                size={11}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                style={{ color: "var(--text-muted)" }}
                                aria-hidden="true"
                              />
                            </div>
                          </div>

                          {/* Seats */}
                          <div>
                            <label
                              htmlFor={`seats-${entry.id}`}
                              className="block mb-1 text-[10px] font-semibold uppercase"
                              style={{ color: "var(--text-tertiary)", letterSpacing: "0.06em" }}
                            >
                              Seats
                            </label>
                            <NumberField
                              id={`seats-${entry.id}`}
                              value={entry.seats || undefined}
                              onChange={(v) => {
                                const next = v ?? 1;
                                updateTool(entry.id, { seats: next });
                                recalcSpend(entry.id, entry.planId, next);
                              }}
                              placeholder="1"
                              min={1}
                              max={10000}
                              ariaLabel={`Seats for ${tool.name}`}
                            />
                          </div>

                          {/* Actual spend */}
                          <div>
                            <label
                              htmlFor={`spend-${entry.id}`}
                              className="flex items-center gap-1.5 mb-1 text-[10px] font-semibold uppercase"
                              style={{ color: "var(--text-tertiary)", letterSpacing: "0.06em" }}
                            >
                              Actual / mo
                              {!isVariablePlan && !userOverride && expectedCost > 0 && (
                                <span
                                  className="normal-case font-normal text-[9px] px-1 rounded"
                                  style={{
                                    background: "var(--accent-blue-a10)",
                                    color: "var(--accent-blue)",
                                    letterSpacing: "0",
                                  }}
                                >
                                  auto
                                </span>
                              )}
                              {isVariablePlan && (
                                <span
                                  className="normal-case font-normal text-[9px] px-1 rounded"
                                  style={{
                                    background: "var(--accent-gold-a10)",
                                    color: "var(--accent-gold)",
                                    letterSpacing: "0",
                                  }}
                                >
                                  manual
                                </span>
                              )}
                            </label>
                            <NumberField
                              id={`spend-${entry.id}`}
                              value={entry.monthlySpend > 0 ? entry.monthlySpend : undefined}
                              onChange={(v) => {
                                userEditedSpend.current.add(entry.id);
                                updateTool(entry.id, { monthlySpend: v ?? 0 });
                              }}
                              placeholder={
                                isVariablePlan
                                  ? "Enter your bill"
                                  : expectedCost > 0
                                    ? String(expectedCost)
                                    : "0"
                              }
                              min={0}
                              max={1000000}
                              prefix="$"
                              ariaLabel={`Monthly spend for ${tool.name}`}
                            />
                          </div>
                        </div>

                        {/* ── Inline status hint ──────────────────────────── */}
                        {/* Standard plan: show expected cost + override controls */}
                        {!isVariablePlan && expectedCost > 0 && (
                          <div className="flex items-center gap-2 mt-2.5 text-[11px] tabular flex-wrap">
                            <span style={{ color: "var(--text-muted)" }}>
                              Standard: ${expectedCost.toLocaleString()}/mo
                            </span>
                            {overspending && (
                              <span
                                className="inline-flex items-center gap-1 font-medium"
                                style={{ color: "var(--accent-gold)" }}
                              >
                                <Info size={10} aria-hidden="true" />
                                ${(entry.monthlySpend - expectedCost).toLocaleString()}/mo above expected
                              </span>
                            )}
                            {userOverride && (
                              <button
                                type="button"
                                onClick={() => {
                                  userEditedSpend.current.delete(entry.id);
                                  updateTool(entry.id, { monthlySpend: expectedCost });
                                }}
                                className="text-[11px] underline transition-colors"
                                style={{ color: "var(--text-tertiary)" }}
                              >
                                Reset to standard rate
                              </button>
                            )}
                          </div>
                        )}

                        {/* Usage-based plan hint */}
                        {currentPlan?.priceType === "usage" && (
                          <p
                            className="mt-2.5 text-[11px] leading-relaxed"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Usage-based pricing — enter your actual monthly invoice amount from the vendor.
                          </p>
                        )}

                        {/* Custom-quoted plan hint */}
                        {currentPlan?.priceType === "custom" && (
                          <p
                            className="mt-2.5 text-[11px] leading-relaxed"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Custom-priced contract — enter your contracted monthly amount
                            {currentPlan.monthlyPricePerSeat > 0 && (
                              <>
                                {" "}(typically starts around{" "}
                                <span className="tabular">${currentPlan.monthlyPricePerSeat}/seat</span>)
                              </>
                            )}
                            .
                          </p>
                        )}
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => {
                          userEditedSpend.current.delete(entry.id);
                          removeTool(entry.id);
                        }}
                        aria-label={`Remove ${tool.name}`}
                        className="p-1.5 rounded-md transition-colors"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "var(--accent-danger)";
                          e.currentTarget.style.background = "rgba(185,28,28,0.06)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "var(--text-muted)";
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* ── Empty state ─────────────────────────────────────────────────── */}
        {formData.tools.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 rounded-xl mb-4"
            style={{
              border: "1.5px dashed var(--border)",
              background: "var(--bg-secondary)",
            }}
          >
            <div
              className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{ background: "var(--bg-elevated)" }}
              aria-hidden="true"
            >
              <Plus size={16} style={{ color: "var(--text-muted)" }} />
            </div>
            <p
              className="text-[14px] font-medium mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              No tools added yet
            </p>
            <p
              className="text-[12px]"
              style={{ color: "var(--text-muted)" }}
            >
              Choose a tool from below to start your audit
            </p>
          </motion.div>
        )}

        {/* ── Add tool buttons ────────────────────────────────────────────── */}
        {availableTools.length > 0 && (
          <div className="mb-7">
            <p
              className="text-[10px] font-semibold uppercase mb-2.5 px-1"
              style={{ color: "var(--text-faint)", letterSpacing: "0.1em" }}
            >
              {formData.tools.length === 0 ? "Available tools" : "Add another"}
            </p>
            <div
              className="flex flex-wrap gap-1.5"
              role="group"
              aria-label="Add AI tools"
            >
              {availableTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleAddTool(tool.id as ToolId)}
                  className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-md transition-all duration-150 font-medium"
                  style={{
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                    background: "var(--bg-secondary)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--text-primary)";
                    e.currentTarget.style.color = "var(--text-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }}
                  aria-label={`Add ${tool.name}`}
                >
                  <Plus size={11} aria-hidden="true" />
                  {tool.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Error ───────────────────────────────────────────────────────── */}
        {auditError && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 text-[13px] px-4 py-3 rounded-lg mb-5"
            style={{
              background: "rgba(185,28,28,0.06)",
              border: "1px solid rgba(185,28,28,0.18)",
              color: "var(--accent-danger)",
            }}
            role="alert"
          >
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span>{auditError}</span>
          </motion.div>
        )}

        {/* ── Submit ──────────────────────────────────────────────────────── */}
        <div
          className="flex flex-col sm:flex-row sm:items-center gap-3 pt-5 border-t"
          style={{ borderColor: "var(--hairline)" }}
        >
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || formData.tools.length === 0}
            className="btn-primary text-[15px] py-3 px-6 justify-center"
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                Running audit…
              </>
            ) : (
              <>
                Run audit
                <ArrowRight size={14} aria-hidden="true" />
              </>
            )}
          </button>

          <p
            className="text-[12px]"
            style={{ color: "var(--text-muted)" }}
          >
            {formData.tools.length === 0
              ? "Add at least one tool to continue."
              : "Audit completes in under 10 seconds. Free, no account required."}
          </p>
        </div>
      </motion.section>
    </div>
  );
}