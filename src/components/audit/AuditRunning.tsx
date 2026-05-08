"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
        {/* Animated rings */}
        <div className="relative w-20 h-20 mx-auto mb-10" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full"
              style={{ border: `1px solid rgba(95,168,211,${0.18 - i * 0.05})` }}
              animate={{ scale: [1, 1.15 + i * 0.08, 1], opacity: [0.7, 0.2, 0.7] }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                delay: i * 0.28,
                ease: "easeInOut",
              }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 rounded-full border-t-2 border-r-2"
              style={{ borderColor: "var(--accent-blue)" }}
            />
          </div>
        </div>

        <h2
          className="text-lg font-semibold mb-1"
          style={{ color: "var(--text-primary)" }}
          aria-live="polite"
        >
          Auditing your stack
        </h2>
        <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
          Cross-referencing {STEPS.length} data points
        </p>

        <ol className="space-y-3 text-left" aria-label="Audit progress">
          {STEPS.map((step, i) => (
            <motion.li
              key={step.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: step.delay / 1000 + 0.05 }}
              className="flex items-center gap-3 text-sm"
            >
              <span className="w-4 h-4 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                {i < currentStep ? (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                    <CheckCircle2 size={14} style={{ color: "var(--accent-green)" }} />
                  </motion.span>
                ) : i === currentStep ? (
                  <span
                    className="w-3 h-3 rounded-full border border-t-transparent animate-spin"
                    style={{ borderColor: "var(--accent-blue)", borderTopColor: "transparent" }}
                  />
                ) : (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "var(--border)" }}
                  />
                )}
              </span>
              <span
                style={{
                  color: i <= currentStep ? "var(--text-primary)" : "var(--text-muted)",
                  transition: "color 0.3s",
                }}
              >
                {step.label}
              </span>
              {i === currentStep && (
                <span
                  className="ml-auto text-xs"
                  style={{ color: "var(--accent-blue)" }}
                  aria-live="polite"
                >
                  running…
                </span>
              )}
            </motion.li>
          ))}
        </ol>
      </div>
    </div>
  );
}
