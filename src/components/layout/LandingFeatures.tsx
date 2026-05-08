"use client";
import { motion } from "framer-motion";
import { TrendingDown, BarChart3, Sparkles, Share2, FileText, Lock } from "lucide-react";

const FEATURES = [
  {
    icon: TrendingDown,
    title: "Financially defensible audit logic",
    body: "Not generic AI fluff — hardcoded rule-based analysis against verified pricing data. A CFO would agree with every recommendation.",
    accent: "var(--accent-green)",
    glow: "rgba(163,190,140,0.08)",
  },
  {
    icon: BarChart3,
    title: "Spend benchmarking",
    body: "See how your AI cost per developer compares to companies your size. Know instantly if you're above or below industry norms.",
    accent: "var(--accent-blue)",
    glow: "rgba(95,168,211,0.08)",
  },
  {
    icon: Sparkles,
    title: "AI-personalized summary",
    body: "A concise executive summary from Groq/Llama analyzing your specific situation — not a mail-merge template.",
    accent: "var(--accent-cyan)",
    glow: "rgba(125,211,252,0.06)",
  },
  {
    icon: Share2,
    title: "Shareable report URLs",
    body: "Every audit gets a unique public link. Share with your CFO or post on Twitter. Identifying details stripped automatically.",
    accent: "var(--accent-blue)",
    glow: "rgba(95,168,211,0.08)",
  },
  {
    icon: FileText,
    title: "PDF export",
    body: "Download a polished report suitable for board decks or internal reviews. Formatted for stakeholders, not just your browser.",
    accent: "var(--accent-gold)",
    glow: "rgba(212,166,87,0.06)",
  },
  {
    icon: Lock,
    title: "Value before email",
    body: "We show your full results before asking for anything. Email is optional and captured only after you've seen the savings.",
    accent: "var(--accent-green)",
    glow: "rgba(163,190,140,0.08)",
  },
];

export default function LandingFeatures() {
  return (
    <section
      className="py-24 px-6 relative"
      style={{
        background: "var(--bg-secondary)",
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
      aria-labelledby="features-heading"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <div
            className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
            }}
          >
            For founders & engineering managers
          </div>
          <h2
            id="features-heading"
            className="text-heading text-3xl sm:text-4xl mb-4 text-balance"
          >
            Not a calculator. A real audit engine.
          </h2>
          <p className="max-w-xl mx-auto text-base" style={{ color: "var(--text-secondary)" }}>
            Defensible recommendations your finance team can verify — backed by live pricing data
            updated weekly.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.article
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="card-elevated group transition-all duration-200 hover:translate-y-[-2px]"
              style={{
                "--glow": f.glow,
              } as React.CSSProperties}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-4 transition-colors duration-200"
                style={{
                  background: f.glow,
                  border: `1px solid ${f.accent}22`,
                }}
                aria-hidden="true"
              >
                <f.icon size={16} style={{ color: f.accent }} />
              </div>
              <h3
                className="font-semibold text-sm mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                {f.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {f.body}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
