"use client";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

const STEPS = [
  { label: "Mapping your tool stack", delay: 0 },
  { label: "Verifying plan-level pricing", delay: 900 },
  { label: "Evaluating seat fit vs. team size", delay: 2000 },
  { label: "Calculating savings opportunities", delay: 3300 },
  { label: "Generating AI executive summary", delay: 4600 },
];

export default function AuditRunning() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timers = STEPS.slice(1).map((s, i) =>
      setTimeout(() => setCurrentStep(i + 1), s.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-6">
      <div className="text-center max-w-xs w-full">
        {/* CSS spinner — no framer-motion */}
        <div className="relative w-20 h-20 mx-auto mb-10" aria-hidden="true">
          <div
            className="absolute inset-0 rounded-full spin-slow"
            style={{ border: "1px solid rgba(95,168,211,0.18)" }}
          />
          <div
            className="absolute inset-0 rounded-full spin-medium"
            style={{
              border: "1px solid rgba(95,168,211,0.13)",
              margin: "6px",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-8 h-8 rounded-full border-t-2 border-r-2 spin-fast"
              style={{ borderColor: "var(--accent-blue)" }}
            />
          </div>
        </div>

        <p
          className="text-xs font-semibold uppercase tracking-widest mb-8"
          style={{ color: "var(--text-muted)", letterSpacing: "0.12em" }}
        >
          Analysing
        </p>

        <ol className="space-y-3 text-left" aria-live="polite" aria-label="Analysis progress">
          {STEPS.map((s, i) => {
            const done = i < currentStep;
            const active = i === currentStep;
            return (
              <li
                key={s.label}
                className="flex items-center gap-3 transition-opacity duration-300"
                style={{ opacity: i > currentStep ? 0.35 : 1 }}
                aria-current={active ? "step" : undefined}
              >
                <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                  {done ? (
                    <CheckCircle2 size={14} style={{ color: "var(--accent-green)" }} />
                  ) : (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${active ? "dot-pulse" : ""}`}
                      style={{
                        background: active ? "var(--accent-blue)" : "var(--border)",
                      }}
                    />
                  )}
                </span>
                <span
                  className="text-sm"
                  style={{
                    color: done
                      ? "var(--text-muted)"
                      : active
                      ? "var(--text-primary)"
                      : "var(--text-muted)",
                    fontWeight: active ? 500 : 400,
                  }}
                >
                  {s.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}