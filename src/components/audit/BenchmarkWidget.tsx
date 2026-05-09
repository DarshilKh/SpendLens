"use client";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion, useSpring, useTransform } from "framer-motion";
import type { BenchmarkData } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface Props {
  benchmark: BenchmarkData;
  teamSize: number;
  useCase?: string;
}

function SpringNumber({ target, prefix = "" }: { target: number; prefix?: string }) {
  const spring = useSpring(0, { stiffness: 60, damping: 22 });
  const display = useTransform(spring, (v) => `${prefix}${Math.round(v).toLocaleString()}`);
  useEffect(() => {
    const t = setTimeout(() => spring.set(target), 100);
    return () => clearTimeout(t);
  }, [target, spring]);
  return <motion.span>{display}</motion.span>;
}

export default function BenchmarkWidget({ benchmark, teamSize, useCase }: Props) {
  const pct = Math.max(3, Math.min(97, benchmark.percentile));
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 120);
    return () => clearTimeout(t);
  }, []);

  const isHigh = pct > 66;
  const isLow = pct < 33;
  const accent = isHigh ? "var(--accent-gold)" : isLow ? "var(--accent-green)" : "var(--text-secondary)";
  const accentRgb = isHigh ? "180,83,9" : isLow ? "21,128,61" : "64,64,64";
  const PostureIcon = isHigh ? TrendingUp : isLow ? TrendingDown : Minus;
  const postureLabel = isHigh ? "Above market" : isLow ? "Below market" : "At market";
  const postureDetail = isHigh
    ? "Per-developer spend is higher than most comparable stacks at this team size."
    : isLow
      ? "Per-developer spend is lean — within room to invest without overspending."
      : "Per-developer spend is in line with industry norms.";

  const avg = benchmark.industryAveragePerDeveloper;
  const p25 = Math.round(avg * 0.55);
  const p75 = Math.round(avg * 1.55);
  const ticks = [
    { label: "25th",  note: "Lean",   value: p25, pos: 25 },
    { label: "50th",  note: "Median", value: avg, pos: 50 },
    { label: "75th",  note: "Heavy",  value: p75, pos: 75 },
  ] as const;

  const delta = benchmark.spendPerDeveloper - benchmark.industryAveragePerDeveloper;
  const deltaAbs = Math.abs(delta);
  const deltaSign = delta > 0 ? "+" : delta < 0 ? "−" : "";

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
      role="region"
      aria-label="Spend benchmark"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3 border-b"
        style={{ borderColor: "var(--hairline)" }}
      >
        <span className="text-eyebrow">Spend Benchmark</span>
        <span
          className="inline-flex items-center gap-1.5 text-[11px] font-medium"
          style={{ color: accent }}
        >
          <PostureIcon size={11} aria-hidden="true" />
          {postureLabel}
        </span>
      </div>

      <div className="px-5 py-5">

        {/* Primary stat row — two columns split by hairline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-6">
          <div>
            <p className="text-eyebrow mb-1.5">Your spend / dev</p>
            <p
              className="text-[2rem] font-semibold leading-none tabular"
              style={{ color: "var(--text-primary)", letterSpacing: "-0.04em" }}
            >
              <SpringNumber target={benchmark.spendPerDeveloper} prefix="$" />
              <span
                className="text-base font-normal ml-1"
                style={{ color: "var(--text-muted)" }}
              >
                /mo
              </span>
            </p>
            <p className="text-[11px] mt-2 tabular" style={{ color: "var(--text-muted)" }}>
              {teamSize}-person team{useCase && ` · ${useCase}`}
            </p>
          </div>

          <div className="sm:border-l sm:pl-6" style={{ borderColor: "var(--hairline)" }}>
            <p className="text-eyebrow mb-1.5">Industry avg</p>
            <p
              className="text-[2rem] font-semibold leading-none tabular"
              style={{ color: "var(--text-tertiary)", letterSpacing: "-0.04em" }}
            >
              ${avg.toLocaleString()}
              <span
                className="text-base font-normal ml-1"
                style={{ color: "var(--text-muted)" }}
              >
                /mo
              </span>
            </p>
            <p
              className="text-[11px] mt-2 font-medium tabular"
              style={{ color: accent }}
            >
              {deltaSign}${deltaAbs}/dev vs avg
            </p>
          </div>
        </div>

        {/* Posture line */}
        <p className="text-[12px] leading-relaxed mb-5" style={{ color: "var(--text-tertiary)" }}>
          {postureDetail}
        </p>

        {/* Track */}
        <div role="img" aria-label={`${pct}th percentile`}>
          <div className="relative" style={{ height: "20px" }}>
            {/* Hairline rail */}
            <div
              className="absolute inset-x-0"
              style={{ top: "9px", height: "2px", background: "var(--hairline)", borderRadius: "1px" }}
            />
            {/* Filled segment */}
            <motion.div
              className="absolute"
              style={{
                top: "9px",
                height: "2px",
                left: 0,
                background: accent,
                borderRadius: "1px",
                opacity: 0.8,
              }}
              initial={{ width: "3%" }}
              animate={{ width: animated ? `${pct}%` : "3%" }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            />
            {/* Median tick */}
            <div
              className="absolute"
              style={{
                left: "50%",
                top: "5px",
                width: "1px",
                height: "10px",
                background: "var(--border-strong)",
                transform: "translateX(-50%)",
              }}
              aria-hidden="true"
            />
            {/* Marker */}
            <motion.div
              className="absolute flex items-center justify-center"
              style={{ top: "4px", width: "12px", height: "12px", transform: "translateX(-50%)" }}
              initial={{ left: "3%" }}
              animate={{ left: animated ? `${pct}%` : "3%" }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              aria-hidden="true"
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: accent, opacity: 0.18, transform: "scale(2)", filter: "blur(2px)" }}
              />
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: "var(--bg-secondary)", border: `2px solid ${accent}` }}
              />
            </motion.div>
          </div>

          {/* Marker label */}
          <div className="relative mt-1.5" style={{ height: "14px" }}>
            <motion.div
              className="absolute text-[10px] font-medium tabular"
              style={{ color: accent, transform: "translateX(-50%)", whiteSpace: "nowrap" }}
              initial={{ left: "3%" }}
              animate={{ left: animated ? `${pct}%` : "3%" }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              aria-hidden="true"
            >
              You · p{pct}
            </motion.div>
          </div>

          {/* Axis labels */}
          <div
            className="flex justify-between text-[10px] mt-1.5 uppercase"
            style={{ color: "var(--text-faint)", letterSpacing: "0.08em" }}
            aria-hidden="true"
          >
            <span>Lean</span>
            <span>Median</span>
            <span>Heavy</span>
          </div>
        </div>

        {/* Reference table */}
        <div
          className="mt-6 grid grid-cols-3 border-t pt-4"
          style={{ borderColor: "var(--hairline)" }}
          role="list"
        >
          {ticks.map((tick, i) => {
            const nearest =
              Math.abs(tick.pos - pct) ===
              Math.min(...ticks.map((t) => Math.abs(t.pos - pct)));
            return (
              <div
                key={tick.label}
                className={i > 0 ? "border-l pl-4" : "pr-4"}
                style={{ borderColor: i > 0 ? "var(--hairline)" : undefined }}
                role="listitem"
              >
                <p
                  className="text-eyebrow mb-1"
                  style={{ color: nearest ? accent : "var(--text-faint)" }}
                >
                  {tick.label} · {tick.note}
                </p>
                <p
                  className="text-[1rem] font-semibold tabular leading-none"
                  style={{
                    color: nearest ? accent : "var(--text-primary)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {formatCurrency(tick.value)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}