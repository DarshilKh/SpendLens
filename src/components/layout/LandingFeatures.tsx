"use client";

import { motion } from "framer-motion";
import {
  TrendingDown,
  BarChart3,
  Sparkles,
  Share2,
  FileText,
  Lock,
  type LucideIcon,
} from "lucide-react";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
}

const STEPS = [
  {
    num: "01",
    title: "Enter your stack",
    body: "Select the AI tools your team uses, plan tier, and seat count. About 30 seconds.",
  },
  {
    num: "02",
    title: "We audit against live pricing",
    body: "Rule-based engine compares your setup against current vendor pricing and benchmarks.",
  },
  {
    num: "03",
    title: "Get actionable findings",
    body: "Specific, defensible recommendations with dollar amounts. Share, export, or act on it.",
  },
] as const;

const PRIMARY: Feature[] = [
  {
    icon: TrendingDown,
    title: "Financially defensible audit logic",
    body:
      "Not AI guesswork. Hardcoded rule-based analysis against verified pricing data. Every recommendation cites the specific tier and reasoning your finance team can verify in five minutes.",
  },
  {
    icon: BarChart3,
    title: "Industry spend benchmarking",
    body:
      "See how your AI cost per developer compares to companies your size. Lean ops, at market, or heavy usage — know where you sit and what's normal.",
  },
];

const SECONDARY: Feature[] = [
  {
    icon: Sparkles,
    title: "AI executive summary",
    body: "A concise written analysis of your specific situation. Not a mail-merge template.",
  },
  {
    icon: Share2,
    title: "Shareable report URLs",
    body: "Every audit gets a unique link. Identifying details stripped automatically.",
  },
  {
    icon: FileText,
    title: "PDF export",
    body: "Polished report formatted for board decks and internal stakeholder review.",
  },
  {
    icon: Lock,
    title: "Value before email",
    body: "Full results shown before we ask for anything. Email is optional, never required.",
  },
];

export default function LandingFeatures() {
  return (
    <>
      {/* ─── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="py-24 sm:py-28 px-6"
        aria-labelledby="how-heading"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mb-14"
          >
            <p className="text-eyebrow mb-4">How it works</p>
            <h2
              id="how-heading"
              className="text-heading text-3xl sm:text-[2.5rem] max-w-xl"
            >
              Three inputs. One audit. Zero ambiguity.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <motion.article
                key={step.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: EASE }}
                className="relative py-8 first:pt-0 md:py-0 md:px-8 first:md:pl-0 last:md:pr-0"
              >
                {i > 0 && (
                  <>
                    <div
                      className="hidden md:block absolute left-0 top-0 bottom-0 w-px"
                      style={{ background: "var(--hairline)" }}
                      aria-hidden="true"
                    />
                    <div
                      className="md:hidden absolute top-0 left-0 right-0 h-px"
                      style={{ background: "var(--hairline)" }}
                      aria-hidden="true"
                    />
                  </>
                )}
                <span
                  className="text-[11px] font-semibold tabular block mb-4"
                  style={{
                    color: "var(--accent-green)",
                    letterSpacing: "0.06em",
                  }}
                >
                  {step.num}
                </span>
                <h3 className="text-subheading text-[17px] mb-2.5">
                  {step.title}
                </h3>
                <p
                  className="text-[14px] leading-relaxed"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {step.body}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CAPABILITIES ─────────────────────────────────────────────── */}
      <section
        className="py-24 sm:py-28 px-6"
        style={{
          background: "var(--bg-secondary)",
          borderTop: "1px solid var(--border-subtle)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
        aria-labelledby="features-heading"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mb-16"
          >
            <p className="text-eyebrow mb-4">Capabilities</p>
            <h2
              id="features-heading"
              className="text-heading text-3xl sm:text-[2.5rem] max-w-xl"
            >
              Not a calculator. A real audit engine.
            </h2>
          </motion.div>

          {/* Primary — 2 column, larger */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 mb-16">
            {PRIMARY.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: EASE }}
              >
                <FeatureBlock feature={f} primary />
              </motion.div>
            ))}
          </div>

          <div
            className="hairline mb-16"
            aria-hidden="true"
          />

          {/* Secondary — compact 4-column */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {SECONDARY.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.06, duration: 0.5, ease: EASE }}
              >
                <FeatureBlock feature={f} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function FeatureBlock({
  feature,
  primary = false,
}: {
  feature: Feature;
  primary?: boolean;
}) {
  const Icon = feature.icon;
  return (
    <div className={primary ? "max-w-md" : ""}>
      <div
        className="inline-flex items-center justify-center mb-4 rounded"
        style={{
          width: primary ? 36 : 32,
          height: primary ? 36 : 32,
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)",
        }}
        aria-hidden="true"
      >
        <Icon size={primary ? 16 : 14} style={{ color: "var(--text-secondary)" }} />
      </div>
      <h3
        className="text-subheading mb-2"
        style={{ fontSize: primary ? "1.0625rem" : "0.9375rem" }}
      >
        {feature.title}
      </h3>
      <p
        className="leading-relaxed"
        style={{
          fontSize: primary ? "14.5px" : "13px",
          color: "var(--text-tertiary)",
        }}
      >
        {feature.body}
      </p>
    </div>
  );
}