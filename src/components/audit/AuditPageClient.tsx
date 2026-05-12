"use client";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuditStore } from "@/store/audit-store";
import AuditForm from "@/components/forms/AuditForm";
import AuditResults from "@/components/audit/AuditResults";
import AuditRunning from "@/components/audit/AuditRunning";

type Step = "form" | "running" | "results";

function StepIndicator({ current }: { current: Step }) {
  const steps = [
    { key: "form", label: "Input" },
    { key: "running", label: "Analysis" },
    { key: "results", label: "Results" },
  ] as const;

  const idx = steps.findIndex((s) => s.key === current);

  return (
    <nav aria-label="Audit steps">
      <ol className="flex items-center gap-2">
        {steps.map((s, i) => (
          <li key={s.key} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              {i < idx ? (
                <CheckCircle2
                  size={13}
                  style={{ color: "var(--accent-green)" }}
                  aria-hidden="true"
                />
              ) : (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${i === idx ? "dot-pulse" : ""}`}
                  style={{
                    background: i === idx ? "var(--accent-blue)" : "var(--border)",
                  }}
                  aria-hidden="true"
                />
              )}
              <span
                className="text-xs font-medium"
                style={{
                  color:
                    i === idx
                      ? "var(--text-primary)"
                      : i < idx
                      ? "var(--accent-green)"
                      : "var(--text-muted)",
                }}
                aria-current={i === idx ? "step" : undefined}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="w-6 h-px"
                style={{ background: i < idx ? "var(--accent-green)" : "var(--border)" }}
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default function AuditPageClient() {
  const { auditResult, isRunningAudit } = useAuditStore();
  const step: Step = auditResult ? "results" : isRunningAudit ? "running" : "form";

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <header className="sticky top-0 z-40 glass" role="banner">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm transition-colors"
            style={{ color: "var(--text-muted)" }}
            aria-label="Back to SpendLens home"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
              SpendLens
            </span>
          </Link>
          <StepIndicator current={step} />
        </div>
      </header>

      <main>
        <div
          key="form"
          className="step-panel"
          style={{ display: step === "form" ? "block" : "none" }}
        >
          <AuditForm />
        </div>

        <div
          key="running"
          className="step-panel"
          style={{ display: step === "running" ? "block" : "none" }}
        >
          <AuditRunning />
        </div>

        {step === "results" && auditResult && (
          <div className="step-panel fade-in">
            <AuditResults result={auditResult} />
          </div>
        )}
      </main>
    </div>
  );
}