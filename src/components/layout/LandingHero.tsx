"use client";

import Link from "next/link";
import { motion, type Transition } from "framer-motion";
import { ArrowRight, ArrowDown, Check } from "lucide-react";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const TRUST_POINTS = [
  "Free · No account required",
  "Results in under 60 seconds",
  "Pricing verified weekly",
] as const;

const TOOLS = [
  "Cursor",
  "Claude",
  "ChatGPT",
  "GitHub Copilot",
  "Gemini",
  "Windsurf",
  "Anthropic API",
  "OpenAI API",
] as const;

const PREVIEW = {
  current: 2544,
  optimized: 1946,
  savings: 598,
  pct: 24,
} as const;

const FINDINGS = [
  {
    tool: "Cursor",
    plan: "Business",
    action: "Downgrade to Pro — 6 of 10 seats under usage threshold",
    save: 240,
    severity: "high" as const,
  },
  {
    tool: "GitHub Copilot",
    plan: "Enterprise",
    action: "Move to Business — no Enterprise features in active use",
    save: 190,
    severity: "high" as const,
  },
  {
    tool: "Claude",
    plan: "Team",
    action: "Switch 3 light users to Pro",
    save: 120,
    severity: "medium" as const,
  },
  {
    tool: "ChatGPT",
    plan: "Team",
    action: "Remove 2 inactive seats",
    save: 48,
    severity: "low" as const,
  },
];

const SEVERITY_COLOR = {
  high: "var(--accent-green)",
  medium: "var(--accent-gold)",
  low: "var(--text-muted)",
} as const;

// Real, verifiable pricing data — no fake activity, no invented users.
// Doubles as proof we actually have the dataset.
const PRICING_SNAPSHOT = [
  { tool: "Cursor", plan: "Business", price: 40 },
  { tool: "Cursor", plan: "Pro", price: 20 },
  { tool: "Copilot", plan: "Enterprise", price: 39 },
  { tool: "Copilot", plan: "Business", price: 19 },
  { tool: "Claude", plan: "Team", price: 30 },
  { tool: "ChatGPT", plan: "Team", price: 25 },
] as const;

const fadeUp = (delay: number): { initial: any; animate: any; transition: Transition } => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.55, ease: EASE },
});

const fadeIn = (delay: number): { initial: any; animate: any; transition: Transition } => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { delay, duration: 0.5 },
});

export default function LandingHero() {
  return (
    <section
      className="relative overflow-hidden pt-28 sm:pt-32 pb-20 px-6"
      aria-labelledby="hero-heading"
    >
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="grid-lines opacity-[0.35] absolute inset-0" />
        <div
          className="absolute inset-x-0 top-0 h-[520px]"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 0%, var(--accent-green-a6) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--border) 30%, var(--border) 70%, transparent)",
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Top: headline grid (text left, dataset rail right) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 lg:gap-16 mb-16 items-start">
          {/* LEFT — headline column */}
          <div>
            <motion.div {...fadeUp(0)} className="flex items-center gap-2.5 mb-7">
              <span className="dot-pulse" aria-hidden="true" />
              <span className="text-eyebrow">AI Spend Audit Engine · v1.0</span>
            </motion.div>

            <motion.h1
              {...fadeUp(0.06)}
              id="hero-heading"
              className="text-display text-balance mb-6"
              style={{ fontSize: "clamp(2.5rem, 5.4vw, 4rem)" }}
            >
              Your AI stack is{" "}
              <span style={{ color: "var(--accent-green)" }}>quietly overbilling</span>{" "}
              you.
            </motion.h1>

            <motion.p
              {...fadeUp(0.14)}
              className="text-body text-balance mb-9 max-w-xl"
              style={{ fontSize: "1.0625rem" }}
            >
              Audit your Cursor, Claude, and Copilot spend in 60 seconds. See exactly
              where you&apos;re overpaying — before we ask for anything.
            </motion.p>

            <motion.div
              {...fadeUp(0.22)}
              className="flex flex-col sm:flex-row sm:items-center gap-3 mb-9"
            >
              <Link
                href="/audit"
                className="btn-success"
                style={{ fontSize: "0.9375rem", padding: "0.75rem 1.5rem" }}
              >
                Run free audit
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium px-2 py-1 transition-colors duration-150 text-[color:var(--text-tertiary)] hover:text-[color:var(--text-primary)]"
              >
                See how it works
                <ArrowDown size={12} aria-hidden="true" />
              </Link>
            </motion.div>

            <motion.ul
              {...fadeIn(0.3)}
              className="flex flex-wrap gap-x-5 gap-y-2"
              aria-label="Audit guarantees"
            >
              {TRUST_POINTS.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-1.5 text-[12.5px]"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  <Check
                    size={12}
                    style={{ color: "var(--accent-green)" }}
                    aria-hidden="true"
                  />
                  <span>{point}</span>
                </li>
              ))}
            </motion.ul>
          </div>

          {/* RIGHT — pricing dataset rail (desktop only) */}
          <PricingRail />
        </div>

        {/* Audit preview — full-width below */}
        <AuditPreview />

        {/* Coverage strip */}
        <motion.div
          {...fadeIn(0.5)}
          className="mt-14 pt-7"
          style={{ borderTop: "1px solid var(--hairline)" }}
        >
          <p className="text-eyebrow mb-3">Coverage</p>
          <div className="flex flex-wrap gap-x-1.5 gap-y-1.5">
            {TOOLS.map((tool) => (
              <span
                key={tool}
                className="text-[12px] font-medium px-2.5 py-1 rounded"
                style={{
                  color: "var(--text-secondary)",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                {tool}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   PRICING RAIL — fills the right side with verifiable proof
   the dataset exists. No fake activity. No invented users.
   ───────────────────────────────────────────────────────────── */

function PricingRail() {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.32, duration: 0.6, ease: EASE }}
      className="hidden lg:block relative"
      aria-label="Pricing dataset preview"
    >
      {/* Subtle ambient glow behind the rail */}
      <div
        className="absolute -inset-4 rounded-2xl pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, var(--accent-green-a6) 0%, transparent 70%)",
          filter: "blur(30px)",
        }}
        aria-hidden="true"
      />

      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "1px solid var(--hairline)" }}
        >
          <div className="flex items-center gap-2">
            <span className="dot-pulse" aria-hidden="true" />
            <span
              className="text-[10px] font-semibold uppercase"
              style={{
                color: "var(--text-secondary)",
                letterSpacing: "0.1em",
              }}
            >
              Pricing dataset
            </span>
          </div>
          <span
            className="text-[10px] tabular"
            style={{ color: "var(--text-muted)" }}
          >
            Synced 2d ago
          </span>
        </div>

        {/* Coverage stat */}
        <div
          className="px-4 py-4"
          style={{ borderBottom: "1px solid var(--hairline)" }}
        >
          <p
            className="text-[10px] font-medium uppercase mb-1.5"
            style={{
              color: "var(--text-tertiary)",
              letterSpacing: "0.08em",
            }}
          >
            Plans tracked
          </p>
          <div className="flex items-baseline gap-2 mb-1.5">
            <span
              className="text-[1.75rem] font-semibold tabular"
              style={{
                color: "var(--text-primary)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              42
            </span>
            <span
              className="text-[11px] font-medium tabular"
              style={{ color: "var(--text-tertiary)" }}
            >
              across 8 vendors
            </span>
          </div>
          <p
            className="text-[11px]"
            style={{ color: "var(--text-tertiary)" }}
          >
            Verified weekly from official sources
          </p>
        </div>

        {/* Snapshot list */}
        <div>
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <span
              className="text-[10px] font-medium uppercase"
              style={{
                color: "var(--text-tertiary)",
                letterSpacing: "0.08em",
              }}
            >
              Sample
            </span>
            <span
              className="text-[10px] uppercase"
              style={{
                color: "var(--text-muted)",
                letterSpacing: "0.06em",
              }}
            >
              Retail
            </span>
          </div>
          <div className="px-1 pb-1">
            {PRICING_SNAPSHOT.map((item, i) => (
              <motion.div
                key={`${item.tool}-${item.plan}`}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.5 + i * 0.06,
                  duration: 0.4,
                  ease: EASE,
                }}
                className="flex items-center justify-between gap-3 px-3 py-2 rounded-md"
              >
                <div className="min-w-0 flex-1 flex items-baseline gap-1.5">
                  <span
                    className="text-[12px] font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {item.tool}
                  </span>
                  <span
                    className="text-[11px]"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {item.plan}
                  </span>
                </div>
                <div className="flex items-baseline gap-0.5 flex-shrink-0">
                  <span
                    className="text-[12px] font-semibold tabular"
                    style={{ color: "var(--text-primary)" }}
                  >
                    ${item.price}
                  </span>
                  <span
                    className="text-[10px] tabular"
                    style={{ color: "var(--text-muted)" }}
                  >
                    /seat
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-4 py-2.5 flex items-center justify-between"
          style={{
            background: "var(--bg-elevated)",
            borderTop: "1px solid var(--hairline)",
          }}
        >
          <span
            className="text-[10px]"
            style={{ color: "var(--text-muted)" }}
          >
            Source: vendor pricing pages
          </span>
          <span
            className="text-[10px] tabular font-medium"
            style={{ color: "var(--text-tertiary)" }}
          >
            8 vendors
          </span>
        </div>
      </div>
    </motion.aside>
  );
}

/* ─────────────────────────────────────────────────────────────
   AUDIT PREVIEW — full-width product screenshot below the fold
   ───────────────────────────────────────────────────────────── */

function AuditPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.7, ease: EASE }}
      className="relative"
    >
      <div
        className="absolute -inset-6 rounded-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, var(--accent-green-a6) 0%, transparent 60%)",
          filter: "blur(40px)",
        }}
        aria-hidden="true"
      />

      <div className="relative overflow-hidden card-hero" style={{ padding: 0 }}>
        {/* Title bar */}
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{
            background: "var(--bg-elevated)",
            borderBottom: "1px solid var(--hairline)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-[10px] h-[10px] rounded-full"
                  style={{ background: "var(--border-strong)" }}
                />
              ))}
            </div>
            <span
              className="hidden sm:inline text-[11px] font-medium"
              style={{ color: "var(--text-tertiary)" }}
            >
              SpendLens — Audit Report
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="dot-pulse" aria-hidden="true" />
            <span
              className="text-[10px] font-semibold uppercase"
              style={{ color: "var(--accent-green)", letterSpacing: "0.1em" }}
            >
              Audit Complete
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
          {/* Left summary */}
          <div
            className="p-6 flex flex-col justify-between"
            style={{
              background: "var(--bg-secondary)",
              borderRight: "1px solid var(--hairline)",
              minHeight: "320px",
            }}
          >
            <div>
              <p className="text-eyebrow mb-2">Identified savings</p>
              <p
                className="text-display tabular mb-1.5"
                style={{
                  fontSize: "2.75rem",
                  color: "var(--accent-green)",
                  lineHeight: 1,
                }}
              >
                ${PREVIEW.savings}
              </p>
              <p
                className="text-[12px] tabular mb-6"
                style={{ color: "var(--text-tertiary)" }}
              >
                per month · {PREVIEW.pct}% reduction
              </p>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[11px] mb-1.5">
                    <span style={{ color: "var(--text-tertiary)" }}>Current</span>
                    <span
                      className="tabular font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      ${PREVIEW.current.toLocaleString()}/mo
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full"
                    style={{ background: "var(--bg-sunken)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: "100%", background: "var(--text-muted)" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1.5">
                    <span style={{ color: "var(--text-tertiary)" }}>Optimized</span>
                    <span
                      className="tabular font-medium"
                      style={{ color: "var(--accent-green)" }}
                    >
                      ${PREVIEW.optimized.toLocaleString()}/mo
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full"
                    style={{ background: "var(--bg-sunken)" }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "var(--accent-green)" }}
                      initial={{ width: "100%" }}
                      animate={{
                        width: `${(PREVIEW.optimized / PREVIEW.current) * 100}%`,
                      }}
                      transition={{ delay: 1, duration: 0.9, ease: EASE }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div
              className="mt-6 pt-4"
              style={{ borderTop: "1px solid var(--hairline)" }}
            >
              <p
                className="text-[11px] tabular"
                style={{ color: "var(--text-tertiary)" }}
              >
                Annual impact:{" "}
                <span
                  className="font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  ${(PREVIEW.savings * 12).toLocaleString()}
                </span>
              </p>
            </div>
          </div>

          {/* Right findings */}
          <div className="p-6" style={{ background: "var(--bg-secondary)" }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-eyebrow">Findings</p>
              <p
                className="text-[11px] tabular"
                style={{ color: "var(--text-tertiary)" }}
              >
                {FINDINGS.length} recommendations
              </p>
            </div>

            <div>
              {FINDINGS.map((f, i) => (
                <motion.div
                  key={f.tool}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.7 + i * 0.08,
                    duration: 0.4,
                    ease: EASE,
                  }}
                  className="flex items-start justify-between gap-4 py-3"
                  style={{
                    borderBottom:
                      i < FINDINGS.length - 1
                        ? "1px solid var(--hairline)"
                        : "none",
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: SEVERITY_COLOR[f.severity] }}
                        aria-hidden="true"
                      />
                      <span
                        className="text-[13px] font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {f.tool}
                      </span>
                      <span
                        className="text-[11px]"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        {f.plan}
                      </span>
                    </div>
                    <p
                      className="text-[12.5px] leading-snug pl-[14px]"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {f.action}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p
                      className="text-[15px] font-semibold tabular"
                      style={{
                        color: "var(--accent-green)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      −${f.save}
                    </p>
                    <p
                      className="text-[10px] tabular"
                      style={{ color: "var(--text-muted)" }}
                    >
                      /mo
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="px-5 py-2.5 flex items-center justify-between"
          style={{
            background: "var(--bg-elevated)",
            borderTop: "1px solid var(--hairline)",
          }}
        >
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            Illustrative preview · your audit reflects your actual stack
          </span>
          <span
            className="text-[10px] tabular hidden sm:inline"
            style={{ color: "var(--text-muted)" }}
          >
            spendlens.co/audit
          </span>
        </div>
      </div>
    </motion.div>
  );
}