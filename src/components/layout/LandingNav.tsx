"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function LandingNav() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5" aria-label="SpendLens home">
          <span
            className="text-base font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            SpendLens
          </span>
          <span
            className="text-xs px-1.5 py-0.5 rounded hidden sm:inline-block"
            style={{
              background: "var(--bg-elevated)",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
            }}
          >
            by Credex
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs hidden md:block" style={{ color: "var(--text-muted)" }}>
            Free · No login · 60s
          </span>
          <Link href="/audit" className="btn-success text-sm py-2 px-4">
            Free audit <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
