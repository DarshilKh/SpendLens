"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LeadCaptureSchema, type LeadCaptureInput } from "@/lib/validation";
import { useAuditStore } from "@/store/audit-store";
import type { AuditResult } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface Props {
  result: AuditResult;
  onClose: () => void;
}

export default function LeadCaptureModal({ result, onClose }: Props) {
  const { setLeadCaptured } = useAuditStore();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadCaptureInput>({
    resolver: zodResolver(LeadCaptureSchema),
    defaultValues: {
      auditId: result.id,
      wantsConsultation: result.highSavingsCase,
      companyName: result.formData.companyName ?? "",
      teamSize: result.formData.teamSize,
    },
  });

  const onSubmit = async (data: LeadCaptureInput) => {
    setSubmitting(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, _hp: "" }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Submission failed");

      setSubmitted(true);
      setLeadCaptured(true);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          style={{ background: "rgba(7,17,26,0.88)", backdropFilter: "blur(10px)" }}
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md p-6 rounded-xl"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(95,168,211,0.04)",
          }}
        >
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-highlight)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <X size={16} aria-hidden="true" />
          </button>

          {submitted ? (
            <div className="text-center py-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{
                  background: "rgba(163,190,140,0.12)",
                  border: "1px solid rgba(163,190,140,0.25)",
                }}
              >
                <CheckCircle size={26} style={{ color: "var(--accent-green)" }} aria-hidden="true" />
              </motion.div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Report on its way
              </h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Your audit report has been emailed.
                {result.highSavingsCase &&
                  " Our team will also reach out about Credex credits."}
              </p>
              <button onClick={onClose} className="btn-ghost mt-6 w-full justify-center text-sm">
                Close
              </button>
            </div>
          ) : (
            <>
              <h3
                id="modal-title"
                className="text-lg font-semibold mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                Capture your report
              </h3>
              <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
                {result.totalMonthlySavings > 0
                  ? `We'll email the full audit — ${formatCurrency(result.totalMonthlySavings)}/mo in savings highlighted.`
                  : "We'll email the full audit report for your records."}
              </p>

              {/* Hidden honeypot */}
              <input
                type="text"
                {...register("_hp" as never)}
                className="hidden"
                tabIndex={-1}
                aria-hidden
              />

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
                <div>
                  <label
                    htmlFor="lead-email"
                    className="text-label block mb-1.5"
                  >
                    Work email *
                  </label>
                  <input
                    {...register("email")}
                    id="lead-email"
                    type="email"
                    autoComplete="email"
                    className="input"
                    placeholder="you@company.com"
                    autoFocus
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <p
                      id="email-error"
                      className="text-xs mt-1"
                      style={{ color: "var(--accent-danger)" }}
                      role="alert"
                    >
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="lead-company" className="text-label block mb-1.5">
                    Company{" "}
                    <span
                      className="normal-case font-normal"
                      style={{ color: "var(--text-muted)" }}
                    >
                      (optional)
                    </span>
                  </label>
                  <input
                    {...register("companyName")}
                    id="lead-company"
                    type="text"
                    autoComplete="organization"
                    className="input"
                    placeholder="Acme Inc."
                  />
                </div>

                <div>
                  <label htmlFor="lead-role" className="text-label block mb-1.5">
                    Role{" "}
                    <span
                      className="normal-case font-normal"
                      style={{ color: "var(--text-muted)" }}
                    >
                      (optional)
                    </span>
                  </label>
                  <input
                    {...register("role")}
                    id="lead-role"
                    type="text"
                    autoComplete="organization-title"
                    className="input"
                    placeholder="CTO, Founder, Engineering Manager…"
                  />
                </div>

                {result.highSavingsCase && (
                  <div
                    className="flex items-start gap-3 p-3 rounded-lg"
                    style={{
                      background: "rgba(163,190,140,0.06)",
                      border: "1px solid rgba(163,190,140,0.18)",
                    }}
                  >
                    <input
                      {...register("wantsConsultation")}
                      type="checkbox"
                      id="consultation"
                      className="mt-0.5"
                      defaultChecked
                    />
                    <label
                      htmlFor="consultation"
                      className="text-xs cursor-pointer leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      I&apos;m interested in a free Credex consultation on discounted AI credits
                      (saves up to 40% on top of plan changes)
                    </label>
                  </div>
                )}

                {error && (
                  <p
                    className="text-xs"
                    style={{ color: "var(--accent-danger)" }}
                    role="alert"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-success w-full justify-center py-2.5"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                      Sending…
                    </>
                  ) : (
                    "Send my report"
                  )}
                </button>

                <p
                  className="text-xs text-center"
                  style={{ color: "var(--text-muted)" }}
                >
                  One email with your audit. No spam, ever.
                </p>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
