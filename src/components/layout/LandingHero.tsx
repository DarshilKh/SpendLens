"use client";
import Link from "next/link";
import { motion, type Transition } from "framer-motion";
import { ArrowRight, Check, ArrowDown } from "lucide-react";

const TOOLS = [
  "Cursor",
  "Claude",
  "ChatGPT",
  "GitHub Copilot",
  "Gemini",
  "Windsurf",
  "Codeium",
  "Anthropic API",
] as const;

const TRUST_POINTS = [
  "Free · No account required",
  "Audit completes in under 60 seconds",
  "Pricing data refreshed weekly from vendor pages",
] as const;

const PREVIEW = {
  current: 2544,
  optimized: 1946,
  savings: 598,
  pct: 24,
  topTool: "Cursor",
  topAction: "Switch from Business to Pro",
  topSave: 1000,
} as const;

const STATS = [
  { v: "$340", l: "Median monthly savings identified" },
  { v: "2,400+", l: "Audits run this month" },
  { v: "8+", l: "AI tools and APIs covered" },
  { v: "<60s", l: "Time to complete an audit" },
] as const;

const PREVIEW_TOOLS = ["Cursor", "Claude", "Windsurf", "Gemini"] as const;

// ✅ Typed as a fixed 4-tuple so TS treats it as a cubic-bezier easing,
//    not a generic number[]. This is what Framer Motion's Transition expects.
const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeUp = (delay: number): { initial: any; animate: any; transition: Transition } => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: EASE_OUT_EXPO },
});

const fadeIn = (delay: number): { initial: any; animate: any; transition: Transition } => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { delay, duration: 0.5 },
});

function BackgroundLayers() {
  return (
    <>
      <div
        className="absolute inset-0 grid-lines opacity-[0.45] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-0 h-[480px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(21,128,61,0.045) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, var(--border) 30%, var(--border) 70%, transparent 100%)",
        }}
        aria-hidden="true"
      />
    </>
  );
}

function Eyebrow() {
  return (
    <motion.div
      {...fadeUp(0)}
      transition={{ duration: 0.4 }}
      className="inline-flex items-center gap-2 mb-8"
    >
      <span className="dot-pulse" aria-hidden="true" />
      <span
        className="text-[11px] font-semibold uppercase"
        style={{ color: "var(--text-tertiary)", letterSpacing: "0.12em" }}
      >
        AI Procurement Audit · v1.0
      </span>
    </motion.div>
  );
}

function Headline() {
  return (
    <motion.h1
      id="hero-heading"
      {...fadeUp(0.08)}
      className="text-display text-balance mb-6"
      style={{
        fontSize: "clamp(2.5rem, 5.5vw, 4.25rem)",
        color: "var(--text-primary)",
        letterSpacing: "-0.045em",
        lineHeight: "1.02",
      }}
    >
      Find out where your AI&nbsp;stack is{" "}
      <span style={{ color: "var(--accent-green)" }}>
        quietly overbilling you
      </span>
      .
    </motion.h1>
  );
}

function Subheadline() {
  return (
    <motion.p
      {...fadeUp(0.16)}
      className="text-balance mb-9 max-w-xl leading-relaxed"
      style={{
        fontSize: "1.0625rem",
        color: "var(--text-secondary)",
        letterSpacing: "-0.008em",
      }}
    >
      Most engineering teams pay full retail for Cursor, Claude, and Copilot
      without ever auditing whether the plan, seat count, or tool itself is
      right-sized. SpendLens models your stack against current pricing and tells
      you — in plain numbers — exactly where the waste is.
    </motion.p>
  );
}

function CTAGroup() {
  return (
    <motion.div
      {...fadeUp(0.24)}
      className="flex flex-col sm:flex-row sm:items-center gap-3 mb-10"
    >
      <Link href="/audit" className="btn-primary text-[0.9375rem] py-3 px-6">
        Run free audit
        <ArrowRight size={14} aria-hidden="true" />
      </Link>
      <Link
        href="#how-it-works"
        className="text-sm font-medium inline-flex items-center gap-1 transition-colors"
        style={{ color: "var(--text-tertiary)" }}
      >
        See how it works
        <ArrowDown size={12} aria-hidden="true" />
      </Link>
    </motion.div>
  );
}

function TrustPoints() {
  return (
    <motion.ul
      {...fadeIn(0.32)}
      className="space-y-2 mb-10"
      aria-label="Audit guarantees"
    >
      {TRUST_POINTS.map((point) => (
        <li
          key={point}
          className="flex items-start gap-2.5 text-[13px]"
          style={{ color: "var(--text-tertiary)" }}
        >
          <Check
            size={13}
            className="mt-[3px] flex-shrink-0"
            style={{ color: "var(--accent-green)" }}
            aria-hidden="true"
          />
          <span>{point}</span>
        </li>
      ))}
    </motion.ul>
  );
}

function CoverageStrip() {
  return (
    <motion.div
      {...fadeIn(0.4)}
      className="pt-6 border-t"
      style={{ borderColor: "var(--hairline)" }}
    >
      <p
        className="text-[10px] font-semibold uppercase mb-3"
        style={{ color: "var(--text-faint)", letterSpacing: "0.12em" }}
      >
        Coverage
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {TOOLS.map((tool) => (
          <span
            key={tool}
            className="text-[12px] font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            {tool}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function WindowChrome() {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 border-b"
      style={{
        borderColor: "var(--hairline)",
        background: "var(--bg-soft)",
      }}
    >
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {[
          { color: "#E5484D" },
          { color: "#FFC53D" },
          { color: "#46A758" },
        ].map(({ color }) => (
          <span
            key={color}
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: color, opacity: 0.75 }}
          />
        ))}
      </div>
      <span
        className="text-[10px] tabular"
        style={{ color: "var(--text-faint)" }}
      >
        spendlens.co/audit/preview
      </span>
      <span style={{ width: "36px" }} aria-hidden="true" />
    </div>
  );
}

function StatusBar() {
  return (
    <div
      className="flex items-center gap-2 px-5 py-2.5 border-b"
      style={{ borderColor: "var(--hairline)" }}
    >
      <span className="dot-pulse" aria-hidden="true" />
      <span
        className="text-[10px] font-semibold uppercase"
        style={{ color: "var(--accent-green)", letterSpacing: "0.12em" }}
      >
        Audit complete · Savings identified
      </span>
    </div>
  );
}

function HeroMetric() {
  return (
    <div className="px-5 py-5">
      <p
        className="text-[10px] font-semibold uppercase mb-2"
        style={{ color: "var(--text-tertiary)", letterSpacing: "0.12em" }}
      >
        Potential monthly savings
      </p>
      <p
        className="text-display tabular leading-none mb-2"
        style={{
          fontSize: "3.25rem",
          color: "var(--accent-green)",
          letterSpacing: "-0.045em",
        }}
      >
        ${PREVIEW.savings}
        <span
          className="text-base font-normal ml-1"
          style={{ color: "var(--text-muted)" }}
        >
          /mo
        </span>
      </p>
      <div
        className="flex items-baseline gap-2 text-[12px] tabular"
        style={{ color: "var(--text-tertiary)" }}
      >
        <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
          ${(PREVIEW.savings * 12).toLocaleString()}/yr
        </span>
        <span style={{ color: "var(--text-faint)" }}>·</span>
        <span>{PREVIEW.pct}% reduction</span>
      </div>
    </div>
  );
}

function SpendTransition() {
  return (
    <div
      className="px-5 py-3 border-y flex items-center justify-between text-[12px] tabular"
      style={{
        borderColor: "var(--hairline)",
        background: "var(--bg-soft)",
      }}
    >
      <div>
        <span
          className="text-[10px] uppercase font-medium block"
          style={{ color: "var(--text-faint)", letterSpacing: "0.08em" }}
        >
          Current
        </span>
        <span
          className="font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          ${PREVIEW.current.toLocaleString()}/mo
        </span>
      </div>
      <span style={{ color: "var(--text-faint)" }} aria-hidden="true">
        →
      </span>
      <div className="text-right">
        <span
          className="text-[10px] uppercase font-medium block"
          style={{ color: "var(--text-faint)", letterSpacing: "0.08em" }}
        >
          Optimized
        </span>
        <span
          className="font-semibold"
          style={{ color: "var(--accent-green)" }}
        >
          ${PREVIEW.optimized.toLocaleString()}/mo
        </span>
      </div>
    </div>
  );
}

function TopFinding() {
  return (
    <div className="px-5 py-4">
      <p
        className="text-[10px] font-semibold uppercase mb-2.5"
        style={{ color: "var(--text-faint)", letterSpacing: "0.1em" }}
      >
        Top finding
      </p>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className="text-[13px] font-semibold mb-0.5"
            style={{ color: "var(--text-primary)" }}
          >
            {PREVIEW.topTool}
            <span
              className="font-normal ml-2"
              style={{ color: "var(--text-muted)" }}
            >
              Business
            </span>
          </p>
          <p
            className="text-[12px] leading-snug"
            style={{ color: "var(--text-tertiary)" }}
          >
            {PREVIEW.topAction}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p
            className="text-[1.125rem] font-semibold tabular leading-none"
            style={{
              color: "var(--accent-green)",
              letterSpacing: "-0.03em",
            }}
          >
            −${PREVIEW.topSave}
          </p>
          <p
            className="text-[10px] mt-0.5 tabular"
            style={{ color: "var(--text-muted)" }}
          >
            /mo
          </p>
        </div>
      </div>
    </div>
  );
}

function PreviewFooter() {
  return (
    <div
      className="px-5 py-3 border-t flex items-center gap-1.5 flex-wrap"
      style={{ borderColor: "var(--hairline)" }}
    >
      {PREVIEW_TOOLS.map((t) => (
        <span
          key={t}
          className="text-[10px] px-1.5 py-0.5 rounded font-medium tabular"
          style={{
            background: "var(--bg-elevated)",
            color: "var(--text-tertiary)",
          }}
        >
          {t}
        </span>
      ))}
      <span
        className="ml-auto text-[10px] tabular"
        style={{ color: "var(--text-faint)" }}
      >
        Sample report
      </span>
    </div>
  );
}

function AuditPreviewPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6, ease: EASE_OUT_EXPO }}
      className="relative lg:mt-12"
    >
      <div
        className="absolute -inset-4 rounded-3xl pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(21,128,61,0.08) 0%, rgba(37,99,235,0.05) 100%)",
          filter: "blur(40px)",
          opacity: 0.6,
        }}
        aria-hidden="true"
      />

      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        <WindowChrome />
        <StatusBar />
        <HeroMetric />
        <SpendTransition />
        <TopFinding />
        <PreviewFooter />
      </div>

      <p
        className="text-[11px] text-center mt-4 tabular"
        style={{ color: "var(--text-faint)", letterSpacing: "0.02em" }}
      >
        Illustrative preview · your audit will reflect your actual stack
      </p>
    </motion.div>
  );
}

function FooterMetrics() {
  return (
    <motion.div
      {...fadeIn(0.55)}
      className="mt-20 pt-10 border-t"
      style={{ borderColor: "var(--hairline)" }}
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-6">
        {STATS.map((s) => (
          <div key={s.l}>
            <p
              className="text-[1.5rem] font-semibold tabular leading-none mb-1.5"
              style={{
                color: "var(--text-primary)",
                letterSpacing: "-0.035em",
              }}
            >
              {s.v}
            </p>
            <p
              className="text-[11px] leading-snug"
              style={{ color: "var(--text-tertiary)" }}
            >
              {s.l}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function LandingHero() {
  return (
    <section
      className="relative overflow-hidden pt-14 sm:pt-16 pb-20 sm:pb-24 px-6"
      aria-labelledby="hero-heading"
    >
      <BackgroundLayers />

      <div className="max-w-6xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-start">
          <div>
            <Eyebrow />
            <Headline />
            <Subheadline />
            <CTAGroup />
            <TrustPoints />
            <CoverageStrip />
          </div>

          <AuditPreviewPanel />
        </div>

        <FooterMetrics />
      </div>
    </section>
  );
}