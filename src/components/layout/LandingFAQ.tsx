"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

const FAQS = [
  {
    q: "What AI tools does SpendLens cover?",
    a: "Cursor (Hobby, Business, Enterprise), GitHub Copilot (Individual, Business, Enterprise), Claude.ai (Pro, Team), ChatGPT (Plus, Team, Enterprise), Anthropic API, OpenAI API, Google Gemini, and Windsurf. We update pricing weekly from official vendor pages.",
  },
  {
    q: "How accurate are the recommendations?",
    a: "Our audit engine uses rule-based logic against live pricing data — not AI hallucinations. Every recommendation cites the specific pricing tier and includes reasoning your finance team can verify independently. We're conservative: we only flag savings when the evidence is clear.",
  },
  {
    q: "Do I need to create an account?",
    a: "No. You see your full audit results before we ask for anything. Email capture is optional — it just lets us send you a copy of the report. We don't require login, and we never sell your data.",
  },
  {
    q: "What's the benchmark comparison based on?",
    a: "We compare your AI spend per developer against industry averages sourced from public FinOps data, vendor pricing pages, and startup spend surveys. The benchmark ranges are: lean ops (<$50/dev/mo), at market ($50–$100), and heavy usage (>$100).",
  },
  {
    q: "What is Credex, and how does it fit in?",
    a: "Credex is the company behind SpendLens. Beyond plan-level optimization, Credex sells discounted AI credits — Cursor, Claude, ChatGPT Enterprise — sourced from companies that over-provisioned. Typically 25–40% below retail. SpendLens is free; Credex credits are an optional add-on for high-spend teams.",
  },
  {
    q: "Can I share my audit results?",
    a: "Yes. Every audit generates a unique shareable URL at /share/[slug]. The shared view strips identifying details (company name) but shows all recommendations and savings figures. Useful for sharing with a CFO or posting for feedback.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{ borderBottom: "1px solid var(--border-subtle)" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left transition-colors duration-150"
        aria-expanded={open}
        style={{ color: open ? "var(--text-primary)" : "var(--text-secondary)" }}
      >
        <span className="font-medium text-sm pr-4">{q}</span>
        <ChevronDown
          size={16}
          className="flex-shrink-0 mt-0.5 transition-transform duration-200"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            color: "var(--text-muted)",
          }}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            <p
              className="text-sm leading-relaxed pb-5"
              style={{ color: "var(--text-secondary)" }}
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
    <section className="py-24 px-6" aria-labelledby="faq-heading">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2
            id="faq-heading"
            className="text-heading text-3xl sm:text-4xl mb-4"
          >
            Common questions
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Everything you need to know before running your audit.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid var(--border)", background: "var(--bg-secondary)" }}
        >
          <div className="px-6">
            {FAQS.map((faq) => (
              <FAQItem key={faq.q} {...faq} />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-12 text-center"
        >
          <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
            Ready to find out if you&apos;re overpaying?
          </p>
          <Link href="/audit" className="btn-success text-sm py-2.5 px-6">
            Run my free audit →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
