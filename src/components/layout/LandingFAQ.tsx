"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import Link from "next/link";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const FAQS = [
  {
    q: "What AI tools does SpendLens cover?",
    a: "Cursor, GitHub Copilot, Claude, ChatGPT, Anthropic API, OpenAI API, Google Gemini, and Windsurf. Pricing is pulled directly from official vendor pages and refreshed weekly — not cached from six months ago.",
  },
  {
    q: "How accurate are the recommendations?",
    a: "Every recommendation comes from rule-based logic against verified pricing data — not an AI making educated guesses. Each finding cites the exact tier, the delta, and the reasoning. Your finance team can verify it independently in under five minutes. We only flag savings when the evidence is clear.",
  },
  {
    q: "Do I need to create an account?",
    a: "No. You see your full audit results — every finding, every dollar amount — before we ask for anything. Email capture is optional and only used to send you a copy of the report. No login. No credit card. No trial period.",
  },
  {
    q: "What's the spend benchmark based on?",
    a: "We compare your AI cost per developer against ranges sourced from public FinOps data, vendor pricing pages, and startup spend surveys. Three ranges: lean ops (under $50/dev/mo), at market ($50–$100), and heavy usage (above $100). We show where you land and what's typical for your team size.",
  },
  {
    q: "What is Credex, and how does it fit in?",
    a: "Credex is the company behind SpendLens. We also sell discounted AI credits — Cursor, Claude, ChatGPT Enterprise — sourced from companies that over-provisioned. Typically 25–40% below retail. SpendLens is completely free. Credex credits are an optional add-on for high-spend teams.",
  },
] as const;

function FAQItem({ q, a, isLast }: { q: string; a: string; isLast: boolean }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((o) => !o), []);

  return (
    <div
      style={{
        borderBottom: isLast ? "none" : "1px solid var(--hairline)",
      }}
    >
      <button
        onClick={toggle}
        className="w-full flex items-start justify-between gap-6 py-5 text-left group"
        aria-expanded={open}
      >
        <span
          className="text-[15px] font-medium transition-colors duration-150"
          style={{
            color: open ? "var(--text-primary)" : "var(--text-secondary)",
            letterSpacing: "-0.012em",
          }}
        >
          {q}
        </span>
        <span
          className="flex-shrink-0 mt-1 transition-transform duration-200"
          style={{
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
            color: "var(--text-tertiary)",
          }}
          aria-hidden="true"
        >
          <Plus size={14} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            style={{ overflow: "hidden" }}
          >
            <p
              className="text-[14px] leading-relaxed pb-5 max-w-2xl"
              style={{ color: "var(--text-tertiary)" }}
            >
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LandingFAQ() {
  return (
    <>
      {/* ─── FAQ ─────────────────────────────────────────────────────── */}
      <section
        id="faq"
        className="py-24 sm:py-28 px-6"
        aria-labelledby="faq-heading"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12 md:gap-20">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <p className="text-eyebrow mb-4">FAQ</p>
              <h2
                id="faq-heading"
                className="text-heading text-3xl sm:text-[2.25rem] mb-4"
              >
                Common questions
              </h2>
              <p
                className="text-[14px] leading-relaxed mb-6"
                style={{ color: "var(--text-tertiary)" }}
              >
                Everything you need to know before running your audit.
              </p>
              <Link href="/audit" className="btn-success">
                Run free audit
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: 0.08, duration: 0.5, ease: EASE }}
            >
              {FAQS.map((faq, i) => (
                <FAQItem
                  key={faq.q}
                  q={faq.q}
                  a={faq.a}
                  isLast={i === FAQS.length - 1}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ───────────────────────────────────────────────── */}
      <section
        className="py-24 sm:py-28 px-6 relative overflow-hidden"
        style={{
          background: "var(--bg-secondary)",
          borderTop: "1px solid var(--border-subtle)",
        }}
        aria-label="Get started"
      >
        <div
          className="absolute inset-x-0 top-0 h-[300px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 50% 0%, var(--accent-green-a6) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        <div className="max-w-6xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: EASE }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2
              className="text-heading text-3xl sm:text-[2.5rem] mb-5 text-balance"
              style={{ lineHeight: 1.1 }}
            >
              Stop overpaying for AI tools your team has outgrown.
            </h2>
            <p
              className="text-[15px] mb-8 max-w-md mx-auto text-balance"
              style={{ color: "var(--text-tertiary)", lineHeight: 1.6 }}
            >
              Run a free audit in 60 seconds. No account. No credit card. See
              your savings before we ask for anything.
            </p>
            <Link
              href="/audit"
              className="btn-success"
              style={{ fontSize: "0.9375rem", padding: "0.75rem 1.5rem" }}
            >
              Run free audit
            </Link>
            <p
              className="text-[12px] mt-5 tabular"
              style={{ color: "var(--text-muted)" }}
            >
              2,400+ audits completed · $340 median monthly savings
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}