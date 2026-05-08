"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  RotateCcw, Copy, CheckCheck, Download, Sparkles,
  ArrowRight, TrendingDown, FileDown,
} from "lucide-react";
import type { AuditResult } from "@/types";
import { useAuditStore } from "@/store/audit-store";
import { formatCurrency, getBaseUrl } from "@/lib/utils";
import LeadCaptureModal from "@/components/audit/LeadCaptureModal";
import CredexCTA from "@/components/audit/CredexCTA";
import RecommendationCard from "@/components/audit/RecommendationCard";
import BenchmarkWidget from "@/components/audit/BenchmarkWidget";

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimatedNumber({
  value,
  prefix = "$",
  suffix = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const duration = 1000;
    const raf = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [value]);
  return (
    <>
      {prefix}
      {displayed.toLocaleString()}
      {suffix}
    </>
  );
}

interface Props {
  result: AuditResult;
  isPublicView?: boolean;
}

export default function AuditResults({ result, isPublicView = false }: Props) {
  const { resetForm, leadCaptured } = useAuditStore();
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const shareUrl = `${getBaseUrl()}/share/${result.shareSlug}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = useCallback(async () => {
    if (pdfLoading) return;
    setPdfLoading(true);
    try {
      const { default: jsPDF } = await import("jspdf");

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const W = 210;
      const margin = 18;
      const contentW = W - margin * 2;

      // ── Helpers ──────────────────────────────────────────────────────────
      const col = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
      };

      let y = 0;

      const addPage = () => {
        pdf.addPage();
        y = margin;
      };

      const checkPage = (needed: number) => {
        if (y + needed > 280) addPage();
      };

      // ── Cover ─────────────────────────────────────────────────────────────
      // Dark background
      pdf.setFillColor(7, 17, 26);
      pdf.rect(0, 0, W, 297, "F");

      // Accent stripe
      pdf.setFillColor(95, 168, 211);
      pdf.rect(0, 0, 4, 297, "F");

      // Header area
      y = 32;

      // Logo / brand
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(22);
      pdf.setTextColor(241, 245, 249);
      pdf.text("SpendLens", margin, y);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);
      pdf.text(
        `AI Spend Audit Report · ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`,
        margin,
        y + 6
      );

      y += 28;

      // Hero metric box
      if (!result.isAlreadyOptimal && result.totalMonthlySavings > 0) {
        pdf.setFillColor(22, 36, 52);
        pdf.roundedRect(margin, y, contentW, 46, 3, 3, "F");

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(148, 163, 184);
        pdf.text("Potential monthly savings identified", margin + 8, y + 10);

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(32);
        pdf.setTextColor(163, 190, 140);
        pdf.text(
          formatCurrency(result.totalMonthlySavings) + "/mo",
          margin + 8,
          y + 28
        );

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(100, 116, 139);
        pdf.text(
          `${formatCurrency(result.totalAnnualSavings)} annually · ${result.savingsPercentage}% reduction`,
          margin + 8,
          y + 38
        );

        y += 54;
      } else {
        pdf.setFillColor(22, 36, 52);
        pdf.roundedRect(margin, y, contentW, 30, 3, 3, "F");

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.setTextColor(163, 190, 140);
        pdf.text("Your AI stack is well-optimized.", margin + 8, y + 16);

        y += 38;
      }

      // Spend overview row
      pdf.setFillColor(15, 27, 42);
      pdf.roundedRect(margin, y, contentW / 2 - 3, 24, 2, 2, "F");
      pdf.setFillColor(15, 27, 42);
      pdf.roundedRect(margin + contentW / 2 + 3, y, contentW / 2 - 3, 24, 2, 2, "F");

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text("Current monthly spend", margin + 5, y + 8);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.setTextColor(241, 245, 249);
      pdf.text(
        formatCurrency(result.totalCurrentMonthlySpend) + "/mo",
        margin + 5,
        y + 18
      );

      const col2 = margin + contentW / 2 + 8;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text("Optimized monthly spend", col2, y + 8);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.setTextColor(
        result.isAlreadyOptimal ? 95 : 163,
        result.isAlreadyOptimal ? 168 : 190,
        result.isAlreadyOptimal ? 211 : 140
      );
      pdf.text(
        formatCurrency(result.totalRecommendedMonthlySpend) + "/mo",
        col2,
        y + 18
      );

      y += 32;

      // Context: team info
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text(
        `Team size: ${result.formData.teamSize} · Use case: ${result.formData.useCase} · Tools audited: ${result.recommendations.length}`,
        margin,
        y
      );
      y += 10;

      // ── AI Summary ────────────────────────────────────────────────────────
      if (result.aiSummary) {
        checkPage(40);
        y += 4;
        pdf.setFillColor(22, 36, 52);
        pdf.roundedRect(margin, y, contentW, 4, 1, 1, "F"); // dummy to get page check

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.setTextColor(95, 168, 211);
        pdf.text("AI EXECUTIVE SUMMARY", margin, y + 4);
        y += 10;

        pdf.setFillColor(15, 27, 42);
        const summaryLines = pdf.splitTextToSize(result.aiSummary, contentW - 16);
        const summaryH = summaryLines.length * 5 + 14;
        pdf.roundedRect(margin, y, contentW, summaryH, 2, 2, "F");

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(148, 163, 184);
        pdf.text(summaryLines, margin + 8, y + 10);
        y += summaryH + 6;
      }

      // ── Benchmark ─────────────────────────────────────────────────────────
      checkPage(36);
      y += 4;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(95, 168, 211);
      pdf.text("SPEND BENCHMARK", margin, y);
      y += 8;

      pdf.setFillColor(15, 27, 42);
      pdf.roundedRect(margin, y, contentW, 28, 2, 2, "F");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(241, 245, 249);
      pdf.text(
        formatCurrency(result.benchmark.spendPerDeveloper) + "/dev/mo",
        margin + 8,
        y + 12
      );

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text(
        `Industry avg: ${formatCurrency(result.benchmark.industryAveragePerDeveloper)}/dev/mo · ${result.benchmark.label}`,
        margin + 8,
        y + 22
      );
      y += 34;

      // ── Recommendations ────────────────────────────────────────────────────
      const sorted = [...result.recommendations].sort(
        (a, b) => b.monthlySavings - a.monthlySavings
      );

      checkPage(20);
      y += 4;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(95, 168, 211);
      pdf.text(`TOOL-BY-TOOL BREAKDOWN  (${sorted.length} tools audited)`, margin, y);
      y += 8;

      for (const rec of sorted) {
        const hasSavings = rec.monthlySavings > 0;
        const actionLines = pdf.splitTextToSize(rec.recommendedAction, contentW - 16);
        const reasonLines = pdf.splitTextToSize(rec.reasoning, contentW - 16);
        const cardH = 8 + actionLines.length * 5 + reasonLines.length * 4.5 + (hasSavings ? 14 : 0) + 14;

        checkPage(cardH + 6);

        // Card background
        const bgR = hasSavings ? 163 : rec.severity === "warning" ? 212 : 95;
        const bgG = hasSavings ? 190 : rec.severity === "warning" ? 166 : 168;
        const bgB = hasSavings ? 140 : rec.severity === "warning" ? 87 : 211;
        pdf.setFillColor(15, 27, 42);
        pdf.roundedRect(margin, y, contentW, cardH, 2, 2, "F");

        // Left accent bar
        pdf.setFillColor(bgR, bgG, bgB);
        pdf.rect(margin, y, 2, cardH, "F");

        let cy = y + 8;

        // Tool name + plan
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(241, 245, 249);
        pdf.text(rec.toolName, margin + 8, cy);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`  ${rec.currentPlanName} · ${rec.statusLabel}`, margin + 8 + pdf.getTextWidth(rec.toolName) + 1, cy);

        cy += 6;

        // Recommended action
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.setTextColor(241, 245, 249);
        pdf.text(actionLines, margin + 8, cy);
        cy += actionLines.length * 5 + 2;

        // Reasoning
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184);
        pdf.text(reasonLines, margin + 8, cy);
        cy += reasonLines.length * 4.5 + 4;

        // Savings row
        if (hasSavings) {
          pdf.setFillColor(22, 36, 52);
          pdf.roundedRect(margin + 8, cy, contentW - 16, 10, 1, 1, "F");
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(9);
          pdf.setTextColor(163, 190, 140);
          pdf.text(`Saves ${formatCurrency(rec.monthlySavings)}/mo`, margin + 12, cy + 6.5);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8);
          pdf.setTextColor(100, 116, 139);
          pdf.text(
            `${formatCurrency(rec.annualSavings)}/yr  ·  ${formatCurrency(rec.currentMonthlyCost)}/mo → ${formatCurrency(rec.recommendedMonthlyCost)}/mo`,
            margin + 60,
            cy + 6.5
          );
        }

        y += cardH + 4;
      }

      // ── Footer ────────────────────────────────────────────────────────────
      checkPage(20);
      y += 8;
      pdf.setFillColor(15, 27, 42);
      pdf.rect(0, 280, W, 17, "F");
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 116, 139);
      pdf.text(
        "SpendLens by Credex · spendlens.co · Pricing from official vendor pages, updated weekly. Not financial advice.",
        margin,
        287
      );
      pdf.text(`${shareUrl}`, W - margin, 287, { align: "right" });

      pdf.save(`spendlens-audit-${result.shareSlug}.pdf`);
    } catch (err) {
      console.error("[PDF] Generation failed:", err);
    } finally {
      setPdfLoading(false);
    }
  }, [pdfLoading, result, shareUrl]);

  const sorted = [...result.recommendations].sort(
    (a, b) => b.monthlySavings - a.monthlySavings
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 pb-20">
      {/* ══ HERO ════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-hero p-8 mb-5 relative overflow-hidden"
        aria-label="Audit summary"
      >
        {/* BG glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl" aria-hidden="true">
          <div
            className="absolute -top-24 -right-24 w-64 h-64 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(163,190,140,0.12) 0%, transparent 70%)" }}
          />
          <div
            className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(95,168,211,0.1) 0%, transparent 70%)" }}
          />
        </div>

        <div className="relative">
          {/* Status badge */}
          <div className="flex items-center gap-2 mb-5">
            <span className="dot-pulse" aria-hidden="true" />
            <span className="text-label" style={{ color: "var(--accent-green)" }}>
              {result.isAlreadyOptimal
                ? "Audit complete · No action needed"
                : "Audit complete · Savings identified"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-7">
            <div>
              {result.isAlreadyOptimal ? (
                <h1
                  className="text-heading text-4xl sm:text-5xl mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Your stack is optimized.
                </h1>
              ) : (
                <>
                  <p className="text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                    Potential monthly savings
                  </p>
                  <h1 className="text-heading text-6xl sm:text-7xl mb-1 text-savings" aria-live="polite">
                    <AnimatedNumber value={result.totalMonthlySavings} />
                    <span
                      className="text-2xl font-normal"
                      style={{ color: "var(--text-muted)" }}
                    >
                      /mo
                    </span>
                  </h1>
                  <p className="text-base" style={{ color: "var(--text-secondary)" }}>
                    <span
                      className="font-semibold"
                      style={{ color: "var(--accent-green)" }}
                    >
                      {formatCurrency(result.totalAnnualSavings)} annually
                    </span>
                    {" "}· {result.savingsPercentage}% reduction
                  </p>
                </>
              )}
            </div>

            {/* Spend delta */}
            <div className="flex sm:flex-col gap-5 sm:gap-2 sm:items-end flex-shrink-0">
              <div className="sm:text-right">
                <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                  Current spend
                </p>
                <p className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
                  {formatCurrency(result.totalCurrentMonthlySpend)}/mo
                </p>
              </div>
              {!result.isAlreadyOptimal && (
                <>
                  <div
                    className="hidden sm:flex items-center justify-end"
                    aria-hidden="true"
                  >
                    <TrendingDown size={14} style={{ color: "var(--accent-green)" }} />
                  </div>
                  <div className="sm:text-right">
                    <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                      After optimization
                    </p>
                    <p
                      className="text-xl font-semibold"
                      style={{ color: "var(--accent-green)" }}
                    >
                      {formatCurrency(result.totalRecommendedMonthlySpend)}/mo
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Tool chips */}
          <div
            className="flex flex-wrap gap-2 mb-7"
            aria-label="Tools audited"
            role="list"
          >
            {result.recommendations.map((r) => (
              <span
                key={r.toolEntryId}
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                role="listitem"
                style={{
                  background:
                    r.monthlySavings > 0
                      ? "rgba(163,190,140,0.1)"
                      : "var(--bg-highlight)",
                  border: `1px solid ${r.monthlySavings > 0 ? "rgba(163,190,140,0.25)" : "var(--border)"}`,
                  color:
                    r.monthlySavings > 0
                      ? "var(--accent-green)"
                      : "var(--text-secondary)",
                }}
              >
                {r.toolName}
                {r.monthlySavings > 0 && ` −${formatCurrency(r.monthlySavings)}`}
              </span>
            ))}
          </div>

          {/* Action bar */}
          {!isPublicView ? (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Audit actions">
              <button
                onClick={() => setShowLeadModal(true)}
                disabled={leadCaptured}
                className="btn-success text-sm py-2 px-4"
                aria-label={leadCaptured ? "Report already captured" : "Capture report by email"}
              >
                <Download size={13} aria-hidden="true" />
                {leadCaptured ? "Report captured" : "Capture report"}
              </button>
              <button
                onClick={handleCopyLink}
                className="btn-ghost"
                aria-label={copied ? "Link copied" : "Copy share link"}
              >
                {copied ? (
                  <CheckCheck size={13} aria-hidden="true" />
                ) : (
                  <Copy size={13} aria-hidden="true" />
                )}
                {copied ? "Copied!" : "Copy link"}
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                className="btn-ghost"
                aria-label="Download PDF report"
              >
                <FileDown size={13} aria-hidden="true" />
                {pdfLoading ? "Generating…" : "PDF"}
              </button>
              <button
                onClick={resetForm}
                className="btn-ghost"
                aria-label="Start a new audit"
              >
                <RotateCcw size={13} aria-hidden="true" /> New audit
              </button>
            </div>
          ) : (
            <a
              href="/audit"
              className="btn-success text-sm py-2.5 px-5 inline-flex items-center gap-2"
            >
              Run your own audit <ArrowRight size={13} aria-hidden="true" />
            </a>
          )}
        </div>
      </motion.section>

      {/* ══ HIGH SAVINGS CTA ═════════════════════════════════════════════════ */}
      {result.highSavingsCase && !isPublicView && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mb-5"
        >
          <CredexCTA monthlySavings={result.totalMonthlySavings} />
        </motion.div>
      )}

      {/* ══ AI SUMMARY ═══════════════════════════════════════════════════════ */}
      {result.aiSummary && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="card-elevated mb-5"
          aria-label="AI analysis"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={13} style={{ color: "var(--accent-blue)" }} aria-hidden="true" />
            <span className="text-label">AI Spend Analysis</span>
            {result.aiSummaryFallback && (
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{
                  background: "var(--bg-highlight)",
                  color: "var(--text-muted)",
                  border: "1px solid var(--border)",
                }}
              >
                rule-based
              </span>
            )}
          </div>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {result.aiSummary}
          </p>
        </motion.section>
      )}

      {/* ══ BENCHMARK ════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
        className="mb-5"
      >
        <BenchmarkWidget
          benchmark={result.benchmark}
          teamSize={result.formData.teamSize}
        />
      </motion.div>

      {/* ══ TOOL BREAKDOWN ═══════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        aria-label="Tool-by-tool breakdown"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-label">Tool-by-tool breakdown</span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {result.recommendations.length} tool
            {result.recommendations.length !== 1 ? "s" : ""} audited
          </span>
        </div>
        <div className="space-y-2.5">
          {sorted.map((rec, idx) => (
            <motion.div
              key={rec.toolEntryId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 + idx * 0.06 }}
            >
              <RecommendationCard rec={rec} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ══ BOTTOM NUDGE ═════════════════════════════════════════════════════ */}
      {!result.highSavingsCase && !isPublicView && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center py-6 rounded-xl"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
          }}
        >
          <p
            className="text-sm font-medium mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            {result.isAlreadyOptimal
              ? "Your AI stack is well-optimized."
              : "Limited savings opportunity at current spend levels."}
          </p>
          <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
            Want to be notified when new optimizations apply to your stack?
          </p>
          <button
            onClick={() => setShowLeadModal(true)}
            disabled={leadCaptured}
            className="btn-ghost text-sm"
          >
            {leadCaptured
              ? "You're on the list ✓"
              : "Notify me of savings opportunities"}
          </button>
        </motion.div>
      )}

      {showLeadModal && (
        <LeadCaptureModal result={result} onClose={() => setShowLeadModal(false)} />
      )}
    </div>
  );
}
