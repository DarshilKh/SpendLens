"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  RotateCcw, Copy, CheckCheck, Download, Sparkles,
  ArrowRight, FileDown, ArrowDown,
} from "lucide-react";
import type { AuditResult } from "@/types";
import { useAuditStore } from "@/store/audit-store";
import { formatCurrency, getBaseUrl } from "@/lib/utils";
import LeadCaptureModal from "@/components/audit/LeadCaptureModal";
import CredexCTA from "@/components/audit/CredexCTA";
import RecommendationCard from "@/components/audit/RecommendationCard";
import BenchmarkWidget from "@/components/audit/BenchmarkWidget";

const PDF_BRAND_URL = "spendlens.co";

// ─── Animated counter ────────────────────────────────────────────────────────
function AnimatedNumber({ value, prefix = "$" }: { value: number; prefix?: string }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const duration = 1100;
    const raf = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplayed(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [value]);
  return <>{prefix}{displayed.toLocaleString()}</>;
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

  // ════════════════════════════════════════════════════════════════════════════
  // PDF — McKinsey-grade layout
  // ════════════════════════════════════════════════════════════════════════════
  const handleDownloadPDF = useCallback(async () => {
    if (pdfLoading) return;
    setPdfLoading(true);

    try {
      const { default: jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const PAGE_W = 210;
      const PAGE_H = 297;
      const MX = 22;
      const MTOP = 22;
      const MBOTTOM = 26;
      const CW = PAGE_W - MX * 2;

      // Refined type scale
      const T = {
        display: 32,
        h1: 16,
        h2: 12,
        h3: 10,
        body: 9,
        small: 7.5,
        micro: 6.5,
        eyebrow: 7,
      };

      // Light-mode professional palette
      const C = {
        ink:        [10, 10, 10]    as const,
        text:       [38, 38, 38]    as const,
        textMid:    [82, 82, 82]    as const,
        textMuted:  [142, 142, 142] as const,
        textFaint:  [181, 181, 181] as const,
        bg:         [255, 255, 255] as const,
        bgSoft:     [250, 250, 249] as const,
        bgPanel:    [245, 245, 244] as const,
        hairline:   [231, 229, 228] as const,
        accent:     [21, 128, 61]   as const,
        warn:       [180, 83, 9]    as const,
        info:       [37, 99, 235]   as const,
      };

      const setColor = (c: readonly [number, number, number]) => pdf.setTextColor(c[0], c[1], c[2]);
      const setFill  = (c: readonly [number, number, number]) => pdf.setFillColor(c[0], c[1], c[2]);
      const setStroke = (c: readonly [number, number, number]) => pdf.setDrawColor(c[0], c[1], c[2]);

      let pageNum = 1;
      let y = 0;

      const drawPageChrome = () => {
        setFill(C.bg);
        pdf.rect(0, 0, PAGE_W, PAGE_H, "F");
      };

      const drawFooter = () => {
        setStroke(C.hairline);
        pdf.setLineWidth(0.2);
        pdf.line(MX, PAGE_H - 16, PAGE_W - MX, PAGE_H - 16);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(T.micro);
        setColor(C.textMuted);
        pdf.text(`SpendLens   ·   ${PDF_BRAND_URL}`, MX, PAGE_H - 11);
        pdf.text(
          `${pageNum}`.padStart(2, "0"),
          PAGE_W - MX, PAGE_H - 11, { align: "right" },
        );
        setColor(C.textFaint);
        pdf.text(
          "Pricing sourced from official vendor pages. Not financial advice.",
          MX, PAGE_H - 7,
        );
      };

      const newPage = () => {
        drawFooter();
        pdf.addPage();
        pageNum += 1;
        drawPageChrome();
        y = MTOP;
      };

      const ensure = (h: number) => { if (y + h > PAGE_H - MBOTTOM) newPage(); };

      const sectionHeader = (label: string) => {
        ensure(16);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(T.eyebrow);
        setColor(C.textMuted);
        // Dotted leader
        const labelText = label.toUpperCase();
        pdf.text(labelText, MX, y);
        const labelW = pdf.getTextWidth(labelText);
        setStroke(C.hairline);
        pdf.setLineWidth(0.2);
        pdf.line(MX + labelW + 3, y - 1, PAGE_W - MX, y - 1);
        y += 7;
      };

      // ════════════════════════════════════════════════════════════════════
      drawPageChrome();
      y = MTOP;

      // ── MASTHEAD ────────────────────────────────────────────────────────
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      setColor(C.ink);
      pdf.text("SpendLens", MX, y);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(T.small);
      setColor(C.textMuted);
      pdf.text(
        new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        PAGE_W - MX, y, { align: "right" },
      );

      y += 4;
      pdf.setFontSize(T.micro);
      setColor(C.textFaint);
      pdf.text("AI Stack Spend Audit", MX, y);
      pdf.text(`Report · ${result.shareSlug}`, PAGE_W - MX, y, { align: "right" });

      y += 4;
      setStroke(C.ink);
      pdf.setLineWidth(0.4);
      pdf.line(MX, y, PAGE_W - MX, y);
      y += 14;

      // ── TITLE ──────────────────────────────────────────────────────────
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(T.eyebrow);
      setColor(C.textMuted);
      pdf.text("EXECUTIVE FINDING", MX, y);
      y += 6;

      if (!result.isAlreadyOptimal && result.totalMonthlySavings > 0) {
        // Title statement
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(T.h1);
        setColor(C.ink);
        const title = pdf.splitTextToSize(
          `${formatCurrency(result.totalMonthlySavings)}/mo (${result.savingsPercentage}%) of current AI spend is recoverable through plan optimization.`,
          CW,
        );
        pdf.text(title, MX, y);
        y += title.length * 6 + 8;

        // ── KEY METRICS — 3 columns ─────────────────────────────────────
        const colW = CW / 3;
        const metrics = [
          { label: "Monthly savings",  value: formatCurrency(result.totalMonthlySavings), tone: "accent" as const },
          { label: "Annual impact",    value: formatCurrency(result.totalAnnualSavings),  tone: "accent" as const },
          { label: "Reduction",        value: `${result.savingsPercentage}%`,             tone: "ink" as const },
        ];

        metrics.forEach((m, i) => {
          const x = MX + colW * i;
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(T.eyebrow);
          setColor(C.textMuted);
          pdf.text(m.label.toUpperCase(), x, y);

          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(T.display * 0.6);
          setColor(m.tone === "accent" ? C.accent : C.ink);
          pdf.text(m.value, x, y + 9);

          if (i > 0) {
            setStroke(C.hairline);
            pdf.setLineWidth(0.2);
            pdf.line(x - 1, y - 2, x - 1, y + 12);
          }
        });
        y += 18;

        // Spend transition strip
        setFill(C.bgPanel);
        pdf.rect(MX, y, CW, 14, "F");

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(T.small);
        setColor(C.textMid);
        pdf.text("CURRENT", MX + 4, y + 5);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(T.h3);
        setColor(C.ink);
        pdf.text(`${formatCurrency(result.totalCurrentMonthlySpend)}/mo`, MX + 4, y + 11);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(T.body);
        setColor(C.textMuted);
        pdf.text("→", PAGE_W / 2, y + 9, { align: "center" });

        pdf.setFontSize(T.small);
        setColor(C.textMid);
        pdf.text("OPTIMIZED", PAGE_W - MX - 4, y + 5, { align: "right" });
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(T.h3);
        setColor(C.accent);
        pdf.text(
          `${formatCurrency(result.totalRecommendedMonthlySpend)}/mo`,
          PAGE_W - MX - 4, y + 11, { align: "right" },
        );

        y += 22;
      } else {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(T.h1);
        setColor(C.ink);
        pdf.text("Stack is well-calibrated to current scale.", MX, y);
        y += 8;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(T.body);
        setColor(C.textMid);
        pdf.text(
          `Current spend of ${formatCurrency(result.totalCurrentMonthlySpend)}/mo is appropriately matched to team profile.`,
          MX, y,
        );
        y += 14;
      }

      // ── CONTEXT TABLE ──────────────────────────────────────────────────
      const ctx = [
        ["Team",     `${result.formData.teamSize} engineers`],
        ["Use case", result.formData.useCase],
        ["Tools",    `${result.recommendations.length} audited`],
        ["$ / dev",  `${formatCurrency(result.benchmark.spendPerDeveloper)}/mo`],
      ];
      const ctxW = CW / ctx.length;
      ctx.forEach(([label, value], i) => {
        const x = MX + ctxW * i;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(T.micro);
        setColor(C.textMuted);
        pdf.text(label.toUpperCase(), x, y);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(T.body);
        setColor(C.ink);
        pdf.text(String(value), x, y + 5);
      });
      y += 14;

      setStroke(C.hairline);
      pdf.setLineWidth(0.2);
      pdf.line(MX, y, PAGE_W - MX, y);
      y += 12;

      // ── EXECUTIVE SUMMARY ──────────────────────────────────────────────
      if (result.aiSummary) {
        ensure(40);
        sectionHeader("Executive Summary");

        const lines = pdf.splitTextToSize(result.aiSummary, CW - 6);
        const h = lines.length * 4.5;

        // Subtle left rule
        setStroke(C.ink);
        pdf.setLineWidth(0.5);
        pdf.line(MX, y - 1, MX, y + h);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(T.body);
        setColor(C.text);
        pdf.text(lines, MX + 5, y + 3.5);
        y += h + 12;
      }

      // ── BENCHMARK ──────────────────────────────────────────────────────
      ensure(36);
      sectionHeader("Spend Benchmark");

      const bmCol = CW / 2;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(T.eyebrow);
      setColor(C.textMuted);
      pdf.text("YOUR SPEND / DEV", MX, y);
      pdf.text("INDUSTRY AVERAGE", MX + bmCol, y);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(T.h1);
      setColor(C.ink);
      pdf.text(`${formatCurrency(result.benchmark.spendPerDeveloper)}/mo`, MX, y + 8);
      setColor(C.textMid);
      pdf.text(`${formatCurrency(result.benchmark.industryAveragePerDeveloper)}/mo`, MX + bmCol, y + 8);

      const bmDelta = result.benchmark.spendPerDeveloper - result.benchmark.industryAveragePerDeveloper;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(T.small);
      setColor(bmDelta > 0 ? C.warn : C.accent);
      pdf.text(
        `${bmDelta > 0 ? "+" : bmDelta < 0 ? "−" : ""}${formatCurrency(Math.abs(bmDelta))}/dev   ·   ${result.benchmark.label}`,
        MX, y + 14,
      );
      y += 22;

      // ── TOOL ANALYSIS ──────────────────────────────────────────────────
      const sortedPdf = [...result.recommendations].sort(
        (a, b) => b.monthlySavings - a.monthlySavings,
      );

      ensure(20);
      sectionHeader(`Tool Analysis (${sortedPdf.length})`);

      for (const rec of sortedPdf) {
        const hasSavings = rec.monthlySavings > 0;
        const actionLines = pdf.splitTextToSize(rec.recommendedAction, CW - 60);
        const reasonLines = pdf.splitTextToSize(rec.reasoning, CW - 4);

        const cardH =
          7 + actionLines.length * 4.5 + 3 + reasonLines.length * 4 +
          (hasSavings ? 8 : 0) + 6;

        ensure(cardH + 4);

        // Top hairline
        setStroke(C.hairline);
        pdf.setLineWidth(0.2);
        pdf.line(MX, y, PAGE_W - MX, y);

        let cy = y + 6;

        // Header row
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(T.h3);
        setColor(C.ink);
        pdf.text(rec.toolName, MX, cy);
        const nameW = pdf.getTextWidth(rec.toolName);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(T.small);
        setColor(C.textMuted);
        pdf.text(`  ${rec.currentPlanName}`, MX + nameW, cy);

        // Right: status or savings
        if (hasSavings) {
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(T.h3);
          setColor(C.accent);
          pdf.text(
            `−${formatCurrency(rec.monthlySavings)}/mo`,
            PAGE_W - MX, cy, { align: "right" },
          );
        } else {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(T.micro);
          setColor(C.textMuted);
          pdf.text(rec.statusLabel.toUpperCase(), PAGE_W - MX, cy, { align: "right" });
        }
        cy += 5;

        // Action
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(T.body);
        setColor(C.text);
        pdf.text(actionLines, MX, cy);
        cy += actionLines.length * 4.5 + 2;

        // Reasoning
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(T.small);
        setColor(C.textMid);
        pdf.text(reasonLines, MX, cy);
        cy += reasonLines.length * 4 + 3;

        // Savings flow
        if (hasSavings) {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(T.micro);
          setColor(C.textMuted);
          pdf.text(
            `${formatCurrency(rec.currentMonthlyCost)}/mo  →  ${formatCurrency(rec.recommendedMonthlyCost)}/mo   ·   ${formatCurrency(rec.annualSavings)}/yr   ·   ${rec.recommendationType.replace(/_/g, " ")}`,
            MX, cy,
          );
        }

        y += cardH;
      }

      // Bottom hairline
      setStroke(C.hairline);
      pdf.setLineWidth(0.2);
      pdf.line(MX, y, PAGE_W - MX, y);
      y += 12;

      // ── METHODOLOGY ────────────────────────────────────────────────────
      ensure(28);
      sectionHeader("Methodology");
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(T.small);
      setColor(C.textMid);
      const meth = pdf.splitTextToSize(
        "Recommendations are derived from current published vendor pricing across major AI assistant providers, benchmarked against aggregated team-spend data from organizations of comparable size and use case. Plan downgrades assume no change in workflow or feature requirements. Per-developer benchmarks are calculated from the team size provided. This report reflects pricing as of the report date and is intended as a directional planning input, not financial advice.",
        CW,
      );
      pdf.text(meth, MX, y);

      drawFooter();
      pdf.save(`spendlens-audit-${result.shareSlug}.pdf`);
    } catch (err) {
      console.error("[PDF] Generation failed:", err);
    } finally {
      setPdfLoading(false);
    }
  }, [pdfLoading, result]);

  const sorted = [...result.recommendations].sort(
    (a, b) => b.monthlySavings - a.monthlySavings,
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-20">

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-5 rounded-2xl overflow-hidden"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-md)",
        }}
        aria-label="Audit summary"
      >
        {/* Layered depth — extremely subtle */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 100% 0%, rgba(21,128,61,0.04) 0%, transparent 60%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 40% at 0% 100%, rgba(37,99,235,0.025) 0%, transparent 60%)",
            }}
          />
        </div>

        <div className="relative">
          {/* Status bar */}
          <div
            className="flex items-center justify-between px-7 py-3.5 border-b"
            style={{ borderColor: "var(--hairline)" }}
          >
            <div className="flex items-center gap-2">
              <span className="dot-pulse" aria-hidden="true" />
              <span
                className="text-[10px] font-semibold uppercase"
                style={{ color: "var(--accent-green)", letterSpacing: "0.12em" }}
              >
                {result.isAlreadyOptimal
                  ? "Audit complete · No action needed"
                  : "Audit complete · Savings identified"}
              </span>
            </div>
            <span
              className="text-[10px] tabular"
              style={{ color: "var(--text-faint)" }}
            >
              {result.recommendations.length} tools · {result.formData.teamSize} engineers
            </span>
          </div>

          {/* Main metric */}
          <div className="px-7 pt-7 pb-6">
            {result.isAlreadyOptimal ? (
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
                <div>
                  <h1
                    className="text-display text-3xl sm:text-4xl mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Stack is well-calibrated.
                  </h1>
                  <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                    Every plan is matched to current scale and use case.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-eyebrow mb-1.5">Current spend</p>
                  <p
                    className="text-2xl font-semibold tabular"
                    style={{ color: "var(--text-primary)", letterSpacing: "-0.03em" }}
                  >
                    {formatCurrency(result.totalCurrentMonthlySpend)}
                    <span className="text-sm font-normal ml-1" style={{ color: "var(--text-muted)" }}>/mo</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 lg:gap-10 items-start">
                {/* Left: hero number */}
                <div>
                  <p className="text-eyebrow mb-3">Potential monthly savings</p>
                  <h1
                    className="text-display leading-none mb-3"
                    style={{
                      fontSize: "clamp(3.25rem, 9vw, 5.5rem)",
                      color: "var(--accent-green)",
                      letterSpacing: "-0.05em",
                    }}
                    aria-live="polite"
                  >
                    <AnimatedNumber value={result.totalMonthlySavings} />
                    <span
                      className="font-normal"
                      style={{
                        fontSize: "clamp(1.125rem, 2.5vw, 1.5rem)",
                        color: "var(--text-muted)",
                        marginLeft: "0.2em",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      /mo
                    </span>
                  </h1>
                  <div className="flex items-baseline gap-3 flex-wrap tabular">
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {formatCurrency(result.totalAnnualSavings)}/yr
                    </span>
                    <span style={{ color: "var(--text-faint)" }}>·</span>
                    <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                      {result.savingsPercentage}% reduction
                    </span>
                  </div>
                </div>

                {/* Right: spend transition */}
                <div className="lg:w-56 lg:border-l lg:pl-8" style={{ borderColor: "var(--hairline)" }}>
                  <p className="text-eyebrow mb-3">Spend transition</p>

                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>Current</span>
                      <span
                        className="text-base font-semibold tabular"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {formatCurrency(result.totalCurrentMonthlySpend)}
                      </span>
                    </div>

                    <div className="flex justify-center" aria-hidden="true">
                      <ArrowDown
                        size={14}
                        style={{ color: "var(--accent-green)", opacity: 0.6 }}
                      />
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>Optimized</span>
                      <span
                        className="text-base font-semibold tabular"
                        style={{ color: "var(--accent-green)" }}
                      >
                        {formatCurrency(result.totalRecommendedMonthlySpend)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tool chips */}
          <div
            className="px-7 py-4 border-t"
            style={{ borderColor: "var(--hairline)" }}
          >
            <div className="flex flex-wrap gap-1.5" role="list">
              {result.recommendations.map((r) => {
                const has = r.monthlySavings > 0;
                return (
                  <span
                    key={r.toolEntryId}
                    className="inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded font-medium tabular"
                    role="listitem"
                    style={{
                      background: has ? "var(--accent-green-a10)" : "var(--bg-elevated)",
                      color: has ? "var(--accent-green)" : "var(--text-tertiary)",
                    }}
                  >
                    {r.toolName}
                    {has && (
                      <span style={{ opacity: 0.7 }}>−{formatCurrency(r.monthlySavings)}</span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Action bar */}
          <div
            className="px-7 py-4 border-t"
            style={{ borderColor: "var(--hairline)", background: "var(--bg-soft)" }}
          >
            {!isPublicView ? (
              <div className="flex flex-wrap gap-2" role="group">
                <button
                  onClick={() => setShowLeadModal(true)}
                  disabled={leadCaptured}
                  className="btn-primary"
                >
                  <Download size={12} aria-hidden="true" />
                  {leadCaptured ? "Report captured" : "Capture report"}
                </button>
                <button onClick={handleCopyLink} className="btn-ghost">
                  {copied ? <CheckCheck size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
                  {copied ? "Copied" : "Copy link"}
                </button>
                <button onClick={handleDownloadPDF} disabled={pdfLoading} className="btn-ghost">
                  <FileDown size={12} aria-hidden="true" />
                  {pdfLoading ? "Generating…" : "PDF"}
                </button>
                <button onClick={resetForm} className="btn-ghost">
                  <RotateCcw size={12} aria-hidden="true" />
                  New audit
                </button>
              </div>
            ) : (
              <a href="/audit" className="btn-primary">
                Run your own audit
                <ArrowRight size={12} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </motion.section>

      {/* ══ HIGH SAVINGS CTA ══════════════════════════════════════════════ */}
      {result.highSavingsCase && !isPublicView && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-5"
        >
          <CredexCTA monthlySavings={result.totalMonthlySavings} />
        </motion.div>
      )}

      {/* ══ AI SUMMARY ════════════════════════════════════════════════════ */}
      {result.aiSummary && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-elevated mb-5"
          aria-label="AI analysis"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={12} style={{ color: "var(--text-tertiary)" }} aria-hidden="true" />
            <span className="text-eyebrow">Executive Summary</span>
            {result.aiSummaryFallback && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded"
                style={{
                  background: "var(--bg-elevated)",
                  color: "var(--text-faint)",
                }}
              >
                rule-based
              </span>
            )}
          </div>
          <p
            className="text-[0.9375rem] leading-relaxed"
            style={{ color: "var(--text-secondary)", letterSpacing: "-0.008em" }}
          >
            {result.aiSummary}
          </p>
        </motion.section>
      )}

      {/* ══ BENCHMARK ═════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-5"
      >
        <BenchmarkWidget
          benchmark={result.benchmark}
          teamSize={result.formData.teamSize}
          useCase={result.formData.useCase}
        />
      </motion.div>

      {/* ══ TOOL BREAKDOWN ════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        aria-label="Tool-by-tool breakdown"
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-eyebrow">Tool-by-Tool Analysis</span>
          <span className="text-[11px] tabular" style={{ color: "var(--text-muted)" }}>
            {result.recommendations.length} {result.recommendations.length === 1 ? "tool" : "tools"}
          </span>
        </div>
        <div className="space-y-2">
          {sorted.map((rec, idx) => (
            <motion.div
              key={rec.toolEntryId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 + idx * 0.05 }}
            >
              <RecommendationCard rec={rec} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ══ BOTTOM NUDGE ══════════════════════════════════════════════════ */}
      {!result.highSavingsCase && !isPublicView && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-7 text-center py-7 rounded-xl"
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
              ? "Your AI stack is well-calibrated."
              : "Limited savings opportunity at current spend levels."}
          </p>
          <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
            Get notified when new optimizations apply to your stack.
          </p>
          <button
            onClick={() => setShowLeadModal(true)}
            disabled={leadCaptured}
            className="btn-ghost text-sm"
          >
            {leadCaptured ? "You're on the list ✓" : "Notify me"}
          </button>
        </motion.div>
      )}

      {showLeadModal && (
        <LeadCaptureModal result={result} onClose={() => setShowLeadModal(false)} />
      )}
    </div>
  );
}