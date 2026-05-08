"use client";
import { useState } from "react";
import { TrendingDown, ArrowRight, CheckCircle, AlertTriangle, RefreshCw, Zap, Info, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ToolRecommendation } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface Props { rec: ToolRecommendation; }

const SEVERITY_CONFIG = {
  savings: {
    border: "rgba(163,190,140,0.3)",
    bg: "rgba(163,190,140,0.04)",
    iconColor: "var(--accent-green)",
    tagClass: "tag-savings",
  },
  optimal: {
    border: "rgba(95,168,211,0.2)",
    bg: "transparent",
    iconColor: "var(--accent-blue)",
    tagClass: "tag-optimal",
  },
  warning: {
    border: "rgba(212,166,87,0.3)",
    bg: "rgba(212,166,87,0.04)",
    iconColor: "var(--accent-gold)",
    tagClass: "tag-warning",
  },
  info: {
    border: "var(--border)",
    bg: "transparent",
    iconColor: "var(--text-muted)",
    tagClass: "tag-optimal",
  },
};

const TYPE_ICON = {
  downgrade_plan: TrendingDown,
  switch_tool: RefreshCw,
  add_credits: Zap,
  already_optimal: CheckCircle,
  minor_opportunity: Info,
  potential_redundancy: AlertTriangle,
  slight_overprovision: TrendingDown,
  enterprise_overkill: TrendingDown,
  strong_roi: CheckCircle,
  upgrade_recommended: ArrowRight,
};

export default function RecommendationCard({ rec }: Props) {
  const cfg = SEVERITY_CONFIG[rec.severity];
  const Icon = TYPE_ICON[rec.recommendationType] ?? Info;
  const hasSavings = rec.monthlySavings > 0;
  const [expanded, setExpanded] = useState(false);

  // Truncate reasoning
  const shortReasoning = rec.reasoning.length > 140
    ? rec.reasoning.slice(0, 137) + "…"
    : rec.reasoning;
  const needsExpand = rec.reasoning.length > 140;

  return (
    <article
      className="rounded-xl p-5 transition-all duration-150"
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: "var(--radius)",
      }}
      aria-label={`${rec.toolName}: ${rec.statusLabel}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Left: info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              {rec.toolName}
            </span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {rec.currentPlanName}
            </span>
            <span className={cfg.tagClass}>
              <Icon size={10} aria-hidden="true" />
              {rec.statusLabel}
            </span>
            {rec.confidence === "low" && (
              <span className="text-xs italic" style={{ color: "var(--text-muted)" }}>
                estimate
              </span>
            )}
          </div>

          <p className="text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
            {rec.recommendedAction}
          </p>

          <div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {needsExpand && !expanded ? shortReasoning : rec.reasoning}
            </p>
            {needsExpand && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-1.5 flex items-center gap-1 text-xs font-medium transition-colors duration-150"
                style={{ color: "var(--accent-blue)" }}
                aria-expanded={expanded}
              >
                {expanded ? "Show less" : "Show more"}
                <ChevronDown
                  size={12}
                  style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                  aria-hidden="true"
                />
              </button>
            )}
          </div>
        </div>

        {/* Right: cost delta */}
        <div className="flex sm:flex-col items-start sm:items-end gap-4 sm:gap-2 flex-shrink-0 sm:min-w-[108px]">
          <div className="sm:text-right">
            <p className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Current</p>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {formatCurrency(rec.currentMonthlyCost)}/mo
            </p>
          </div>
          {hasSavings && (
            <>
              <div className="sm:text-right">
                <p className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Optimized</p>
                <p className="text-sm font-semibold" style={{ color: "var(--accent-green)" }}>
                  {formatCurrency(rec.recommendedMonthlyCost)}/mo
                </p>
              </div>
              <div
                className="sm:text-right pt-1.5 mt-0.5 w-full"
                style={{ borderTop: "1px solid var(--border-subtle)" }}
              >
                <p className="text-sm font-bold" style={{ color: "var(--accent-green)" }}>
                  −{formatCurrency(rec.monthlySavings)}/mo
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {formatCurrency(rec.annualSavings)}/yr
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
