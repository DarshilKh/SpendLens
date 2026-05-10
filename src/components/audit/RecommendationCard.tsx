"use client";
import { useState } from "react";
import {
  TrendingDown, ArrowRight, CheckCircle2, AlertTriangle,
  RefreshCw, Zap, Info, ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ToolRecommendation } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface Props { rec: ToolRecommendation; }

const SEVERITY = {
  savings: { accent: "var(--accent-green)", accentRgb: "21,128,61", tag: "tag-savings" },
  optimal: { accent: "var(--text-tertiary)", accentRgb: "107,107,107", tag: "tag-optimal" },
  warning: { accent: "var(--accent-gold)",  accentRgb: "180,83,9",   tag: "tag-warning" },
  info:    { accent: "var(--text-tertiary)", accentRgb: "107,107,107", tag: "tag-optimal" },
} as const;

const TYPE_ICON: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  downgrade_plan: TrendingDown,
  switch_tool: RefreshCw,
  add_credits: Zap,
  already_optimal: CheckCircle2,
  minor_opportunity: Info,
  potential_redundancy: AlertTriangle,
  slight_overprovision: TrendingDown,
  enterprise_overkill: TrendingDown,
  strong_roi: CheckCircle2,
  upgrade_recommended: ArrowRight,
};

export default function RecommendationCard({ rec }: Props) {
  const cfg = SEVERITY[rec.severity] ?? SEVERITY.info;
  const Icon = TYPE_ICON[rec.recommendationType] ?? Info;
  const hasSavings = rec.monthlySavings > 0;
  const [expanded, setExpanded] = useState(false);

  const SHORT_LEN = 130;
  const shortReasoning =
    rec.reasoning.length > SHORT_LEN
      ? rec.reasoning.slice(0, SHORT_LEN - 1).replace(/\s+\S*$/, "") + "…"
      : rec.reasoning;
  const needsExpand = rec.reasoning.length > SHORT_LEN;

  return (
    <article
      className="group rounded-xl transition-all duration-200"
      style={{
        background: "var(--bg-secondary)",
        border: `1px solid var(--border)`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)";
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
      }}
      aria-label={`${rec.toolName}: ${rec.statusLabel}`}
    >
      <div className="px-5 py-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: `rgba(${cfg.accentRgb},0.08)` }}
            aria-hidden="true"
          >
            <Icon size={13} style={{ color: cfg.accent }} />
          </div>

          {/* Center */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5 mb-1.5">
              <span
                className="font-semibold text-[0.9375rem] leading-snug"
                style={{ color: "var(--text-primary)" }}
              >
                {rec.toolName}
              </span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {rec.currentPlanName}
              </span>
              <span className={cfg.tag}>{rec.statusLabel}</span>
              {rec.confidence === "low" && (
                <span
                  className="text-[10px] italic"
                  style={{ color: "var(--text-faint)" }}
                >
                  estimate
                </span>
              )}
            </div>

            {/* Action */}
            <p
              className="text-[0.875rem] font-medium leading-snug mb-1.5"
              style={{ color: "var(--text-primary)", letterSpacing: "-0.01em" }}
            >
              {rec.recommendedAction}
            </p>

            {/* Reasoning */}
            <div
              className="text-[0.8125rem] leading-relaxed"
              style={{ color: "var(--text-tertiary)" }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={expanded ? "full" : "short"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {needsExpand && !expanded ? shortReasoning : rec.reasoning}
                </motion.p>
              </AnimatePresence>

              {needsExpand && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="mt-2 inline-flex items-center gap-1 text-[0.75rem] font-medium transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                  }}
                  aria-expanded={expanded}
                >
                  {expanded ? "Show less" : "Read more"}
                  <ChevronDown
                    size={11}
                    style={{
                      transform: expanded ? "rotate(180deg)" : "rotate(0)",
                      transition: "transform 0.2s",
                    }}
                    aria-hidden="true"
                  />
                </button>
              )}
            </div>
          </div>

          {/* Right column */}
          {hasSavings ? (
            <div className="flex-shrink-0 text-right pl-2 min-w-[112px]">
              <p
                className="text-[10px] font-medium uppercase mb-0.5"
                style={{ color: "var(--text-faint)", letterSpacing: "0.08em" }}
              >
                Save
              </p>
              <p
                className="text-[1.5rem] font-semibold leading-none tabular tracking-tight"
                style={{ color: "var(--accent-green)", letterSpacing: "-0.035em" }}
              >
                −{formatCurrency(rec.monthlySavings)}
              </p>
              <p
                className="text-[11px] mt-1 tabular"
                style={{ color: "var(--text-muted)" }}
              >
                /mo · {formatCurrency(rec.annualSavings)}/yr
              </p>
            </div>
          ) : (
            <div className="flex-shrink-0 text-right pl-2 min-w-[88px]">
              <p
                className="text-[10px] font-medium uppercase mb-0.5"
                style={{ color: "var(--text-faint)", letterSpacing: "0.08em" }}
              >
                Current
              </p>
              <p
                className="text-[0.9375rem] font-semibold tabular"
                style={{ color: "var(--text-primary)" }}
              >
                {formatCurrency(rec.currentMonthlyCost)}
                <span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>/mo</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cost flow footer — only when there are savings */}
      {hasSavings && (
        <div
          className="flex items-center px-5 py-2 text-[11px] tabular border-t"
          style={{
            borderColor: "var(--hairline)",
            background: "var(--bg-elevated)",
            borderBottomLeftRadius: "var(--radius-lg)",
            borderBottomRightRadius: "var(--radius-lg)",
          }}
        >
          <span style={{ color: "var(--text-muted)" }}>
            {formatCurrency(rec.currentMonthlyCost)}/mo
          </span>
          <span className="mx-2" style={{ color: "var(--text-faint)" }}>→</span>
          <span className="font-medium" style={{ color: "var(--text-primary)" }}>
            {formatCurrency(rec.recommendedMonthlyCost)}/mo
          </span>
          <span
            className="ml-auto text-[10px] uppercase font-medium"
            style={{ color: "var(--text-faint)", letterSpacing: "0.08em" }}
          >
            {rec.recommendationType.replace(/_/g, " ")}
          </span>
        </div>
      )}
    </article>
  );
}