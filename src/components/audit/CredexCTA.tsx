"use client";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Props {
  monthlySavings: number;
}

export default function CredexCTA({ monthlySavings }: Props) {
  const annualSavings = monthlySavings * 12;

  return (
    <aside
      className="rounded-2xl relative overflow-hidden"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-md)",
      }}
      aria-label="Credex procurement service"
    >
      {/* ── Top accent line ───────────────────────────────────────────── */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, var(--accent-green) 50%, transparent 100%)",
          opacity: 0.6,
        }}
        aria-hidden="true"
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 px-7 py-7">

        {/* ── Left column — pitch ─────────────────────────────────────── */}
        <div className="min-w-0">

          {/* Eyebrow with verification badge */}
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck
              size={12}
              style={{ color: "var(--accent-green)" }}
              aria-hidden="true"
            />
            <p
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: "var(--accent-green)", letterSpacing: "0.12em" }}
            >
              Procurement opportunity · Verified inventory
            </p>
          </div>

          {/* Headline */}
          <h3
            className="text-xl font-bold mb-3 leading-tight"
            style={{
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Reduce annual AI spend by an additional{" "}
            <span style={{ color: "var(--accent-green)" }}>
              {formatCurrency(annualSavings)}
            </span>{" "}
            through enterprise credit acquisition.
          </h3>

          {/* Body — procurement-grade language */}
          <p
            className="text-sm leading-relaxed mb-4 max-w-2xl"
            style={{ color: "var(--text-secondary)" }}
          >
            Credex sources unused enterprise license capacity from over-provisioned
            organizations across Cursor, Anthropic, OpenAI, and Google. Inventory
            is acquired at <strong style={{ color: "var(--text-primary)" }}>25–40% below list pricing</strong>{" "}
            with full vendor parity — same APIs, same SLAs, same support tier.
          </p>

          {/* Trust strip */}
          <div
            className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-5 text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            <span className="flex items-center gap-1.5">
              <span
                className="w-1 h-1 rounded-full"
                style={{ background: "var(--accent-green)" }}
                aria-hidden="true"
              />
              Direct vendor contracts
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="w-1 h-1 rounded-full"
                style={{ background: "var(--accent-green)" }}
                aria-hidden="true"
              />
              Net-30 invoicing
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="w-1 h-1 rounded-full"
                style={{ background: "var(--accent-green)" }}
                aria-hidden="true"
              />
              Enterprise compliance (SOC 2, GDPR)
            </span>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <a
              href="https://credex.rocks"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm py-2.5 px-5 inline-flex items-center"
            >
              Request procurement briefing
              <ArrowUpRight size={13} aria-hidden="true" />
            </a>
            <p
              className="text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              20-minute call with a sourcing specialist · No purchase commitment
            </p>
          </div>
        </div>

        {/* ── Right column — quantified projection panel ──────────────── */}
        <div
          className="rounded-xl p-5 lg:w-56 flex flex-col justify-center"
          style={{
            background:
              "linear-gradient(180deg, rgba(22,163,74,0.06) 0%, rgba(22,163,74,0.02) 100%)",
            border: "1px solid rgba(22,163,74,0.15)",
          }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-2"
            style={{ color: "var(--text-muted)", letterSpacing: "0.12em" }}
          >
            Projected combined impact
          </p>

          {/* Plan-savings line */}
          <div className="mb-3">
            <p
              className="text-[10px] font-medium mb-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              Plan optimization (this audit)
            </p>
            <p
              className="text-base font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {formatCurrency(monthlySavings)}/mo
            </p>
          </div>

          {/* Divider */}
          <div
            className="h-px mb-3"
            style={{ background: "rgba(22,163,74,0.15)" }}
            aria-hidden="true"
          />

          {/* Credit-savings line */}
          <div className="mb-4">
            <p
              className="text-[10px] font-medium mb-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              + Credex credit sourcing
            </p>
            <p
              className="text-base font-semibold"
              style={{ color: "var(--accent-green)" }}
            >
              up to {formatCurrency(Math.round(monthlySavings * 0.4))}/mo
            </p>
          </div>

          {/* Total annual */}
          <div
            className="rounded-lg px-3 py-2.5"
            style={{
              background: "rgba(22,163,74,0.08)",
              border: "1px solid rgba(22,163,74,0.18)",
            }}
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-widest mb-0.5"
              style={{ color: "var(--text-muted)", letterSpacing: "0.1em" }}
            >
              Total annual potential
            </p>
            <p
              className="text-lg font-bold leading-none tracking-tight"
              style={{ color: "var(--accent-green)" }}
            >
              {formatCurrency(Math.round(annualSavings * 1.4))}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}