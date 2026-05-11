"use client";

import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 8);
  });

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
      role="banner"
    >
      <div
        className="absolute inset-0 transition-all duration-300"
        style={{
          background: scrolled
            ? "rgba(250, 250, 249, 0.85)"
            : "rgba(250, 250, 249, 0)",
          backdropFilter: scrolled ? "blur(16px) saturate(1.4)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(16px) saturate(1.4)" : "none",
          borderBottom: `1px solid ${
            scrolled ? "var(--hairline)" : "transparent"
          }`,
        }}
        aria-hidden="true"
      />

      <nav
        className="relative max-w-6xl mx-auto px-6 h-14 flex items-center justify-between"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label="SpendLens home"
        >
          <span
            className="text-[15px] font-semibold tracking-tight"
            style={{
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            SpendLens
          </span>
          <span
            className="hidden sm:inline-block text-[10px] font-medium px-1.5 py-0.5 rounded"
            style={{
              background: "var(--bg-elevated)",
              color: "var(--text-tertiary)",
              border: "1px solid var(--border-subtle)",
              letterSpacing: "0.02em",
            }}
          >
            by Credex
          </span>
        </Link>

        <div className="flex items-center gap-5">
          <Link
            href="#how-it-works"
            className="hidden md:inline-block text-[13px] font-medium text-[color:var(--text-tertiary)] hover:text-[color:var(--text-primary)] transition-colors duration-150"
          >
            How it works
          </Link>
          <Link
            href="#faq"
            className="hidden md:inline-block text-[13px] font-medium text-[color:var(--text-tertiary)] hover:text-[color:var(--text-primary)] transition-colors duration-150"
          >
            FAQ
          </Link>
          <Link href="/audit" className="btn-success">
            Run free audit
            <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}