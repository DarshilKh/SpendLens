"use client";
import { ExternalLink, Zap } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function CredexCTA({ monthlySavings }: { monthlySavings: number }) {
  return (
    <aside
      className="rounded-xl p-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-elevated) 100%)",
        border: "1px solid rgba(163,190,140,0.2)",
        boxShadow: "0 0 40px rgba(163,190,140,0.05)",
      }}
      aria-label="Credex upsell"
    >
      {/* Subtle glow */}
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(163,190,140,0.08) 0%, transparent 70%)",
          transform: "translate(30%,-30%)",
        }}
        aria-hidden="true"
      />

      <div className="relative flex items-start gap-4">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: "rgba(163,190,140,0.12)",
            border: "1px solid rgba(163,190,140,0.2)",
          }}
          aria-hidden="true"
        >
          <Zap size={16} style={{ color: "var(--accent-green)" }} />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm mb-1.5" style={{ color: "var(--text-primary)" }}>
            Capture even more of that {formatCurrency(monthlySavings)}/mo with Credex credits
          </p>
          <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
            Beyond plan optimization, Credex sells discounted AI credits — Cursor, Claude, ChatGPT
            Enterprise — sourced from companies that over-provisioned. Typically 25–40% below
            retail, identical API performance.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <a
              href="https://credex.rocks"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-success text-sm py-2 px-4"
            >
              <ExternalLink size={13} aria-hidden="true" />
              Book a free Credex consultation
            </a>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              20-min call · No commitment
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
