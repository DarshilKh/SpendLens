"use client";
import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import type { BenchmarkData } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface Props { benchmark: BenchmarkData; teamSize: number; }

export default function BenchmarkWidget({ benchmark, teamSize }: Props) {
  const pct = Math.max(5, Math.min(95, benchmark.percentile));
  const isHigh = pct > 66;
  const isLow = pct < 33;
  const markerColor = isHigh
    ? "var(--accent-gold)"
    : isLow
    ? "var(--accent-green)"
    : "var(--accent-blue)";

  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const ticks = [
    { label: "25th pct", note: "lean ops", v: "$45" },
    { label: "Median", note: "industry avg", v: `$${benchmark.industryAveragePerDeveloper}` },
    { label: "75th pct", note: "heavy usage", v: "$130" },
  ];

  return (
    <div className="card-elevated" role="region" aria-label="Spend benchmark comparison">
      <div className="flex items-center gap-2 mb-5">
        <BarChart3 size={14} style={{ color: "var(--text-muted)" }} aria-hidden="true" />
        <span className="text-label">Spend benchmark</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
        <div>
          <p className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            {formatCurrency(benchmark.spendPerDeveloper)}
            <span className="text-base font-normal ml-1" style={{ color: "var(--text-muted)" }}>
              /dev/mo
            </span>
          </p>
          <p className="text-sm mt-1.5" style={{ color: "var(--text-secondary)" }}>
            Industry avg:{" "}
            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
              {formatCurrency(benchmark.industryAveragePerDeveloper)}/dev/mo
            </span>
            {" "}· {teamSize}-person team
          </p>
        </div>
        <div
          className="text-sm font-semibold capitalize px-3 py-1.5 rounded-lg"
          style={{
            color: markerColor,
            background: `${markerColor}11`,
            border: `1px solid ${markerColor}33`,
          }}
          aria-label={`Benchmark status: ${benchmark.label}`}
        >
          {benchmark.label}
        </div>
      </div>

      {/* Track */}
      <div className="relative mb-6" role="img" aria-label={`You are at the ${pct}th percentile`}>
        {/* Background track */}
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: "var(--bg-highlight)" }}
        >
          {/* Gradient fill segments */}
          <div
            className="h-full rounded-full relative"
            style={{
              width: "100%",
              background: "linear-gradient(90deg, var(--accent-green) 0%, var(--accent-blue) 50%, var(--accent-gold) 100%)",
              opacity: 0.25,
            }}
          />
        </div>

        {/* Progress bar */}
        <motion.div
          className="absolute top-0 left-0 h-2 rounded-full"
          initial={{ width: "5%" }}
          animate={{ width: animated ? `${pct}%` : "5%" }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          style={{
            background: `linear-gradient(90deg, var(--accent-green), ${markerColor})`,
          }}
        />

        {/* Industry avg marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-px h-4"
          style={{ left: "50%", background: "var(--text-muted)", opacity: 0.5 }}
          aria-hidden="true"
        />

        {/* You marker */}
        <motion.div
          className="absolute -top-1 w-4 h-4 rounded-full border-2 -translate-x-1/2"
          initial={{ left: "5%" }}
          animate={{ left: animated ? `${pct}%` : "5%" }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          style={{ background: markerColor, borderColor: "var(--bg-elevated)" }}
          aria-hidden="true"
        />

        <div
          className="flex justify-between text-xs mt-4"
          style={{ color: "var(--text-muted)" }}
          aria-hidden="true"
        >
          <span>Low</span>
          <span>Industry avg ↑</span>
          <span>High</span>
        </div>
      </div>

      {/* Percentile ticks */}
      <div className="grid grid-cols-3 gap-3" role="list" aria-label="Industry spend percentiles">
        {ticks.map((tick) => (
          <div
            key={tick.label}
            className="text-center p-2.5 rounded-lg"
            style={{
              background: "var(--bg-highlight)",
              border: "1px solid var(--border-subtle)",
            }}
            role="listitem"
          >
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {tick.v}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {tick.label}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)", opacity: 0.7 }}>
              {tick.note}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
