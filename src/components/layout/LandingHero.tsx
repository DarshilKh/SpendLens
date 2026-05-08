"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shield, TrendingDown } from "lucide-react";

const TOOLS = ["Cursor", "Claude", "ChatGPT", "GitHub Copilot", "Gemini", "Windsurf"];

const STATS = [
  { v: "$340", l: "avg monthly savings" },
  { v: "8+", l: "AI tools covered" },
  { v: "<60s", l: "to complete audit" },
];

export default function LandingHero() {
  return (
    <section
      className="pt-36 pb-28 px-6 relative overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 grid-lines opacity-30 pointer-events-none"
        aria-hidden="true"
      />

      {/* Radial glow top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-8 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(95,168,211,0.15) 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      {/* Corner accent */}
      <div
        className="absolute top-1/3 right-0 w-[350px] h-[350px] rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(163,190,140,0.3) 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto relative">
        {/* Live badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.4 }}
          className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
        >
          <span className="dot-pulse" aria-hidden="true" />
          <span className="text-xs font-medium" style={{ color: "var(--accent-green)" }}>
            Free · No login required · Results in 60 seconds
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          id="hero-heading"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.5 }}
          className="text-heading text-5xl sm:text-6xl md:text-7xl text-balance mb-6"
        >
          Are you{" "}
          <span className="text-savings">overpaying</span>
          <br />for AI tools?
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-lg sm:text-xl text-balance mb-10 max-w-2xl"
          style={{ color: "var(--text-secondary)" }}
        >
          Most startups blindly pay retail for Cursor, Claude, and GitHub Copilot.
          SpendLens audits your stack and shows exactly where you&apos;re leaving money on the table.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-16"
        >
          <Link href="/audit" className="btn-success text-base py-3.5 px-7">
            Run my free audit
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
            <Shield className="w-3.5 h-3.5" aria-hidden="true" />
            <span>No credit card · Results in under 60s</span>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36, duration: 0.5 }}
          className="grid grid-cols-3 gap-6 max-w-sm mb-14"
          role="list"
          aria-label="Key statistics"
        >
          {STATS.map((s) => (
            <div key={s.l} role="listitem">
              <p
                className="text-2xl font-bold tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {s.v}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{s.l}</p>
            </div>
          ))}
        </motion.div>

        {/* Tool pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.46, duration: 0.5 }}
          className="flex flex-wrap gap-2 items-center"
          aria-label="Supported AI tools"
        >
          <span className="text-xs mr-1" style={{ color: "var(--text-muted)" }}>Covers:</span>
          {TOOLS.map((t, i) => (
            <motion.span
              key={t}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.48 + i * 0.04 }}
              className="text-xs px-2.5 py-1 rounded-full"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              {t}
            </motion.span>
          ))}
        </motion.div>

        {/* Social proof strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-16 pt-8"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
            >
              <TrendingDown size={13} style={{ color: "var(--accent-green)" }} aria-hidden="true" />
              <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                Audits run this month:{" "}
                <strong style={{ color: "var(--text-primary)" }}>2,400+</strong>
              </span>
            </div>
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
            >
              <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                Avg savings identified:{" "}
                <strong style={{ color: "var(--accent-green)" }}>$340/mo</strong>
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
