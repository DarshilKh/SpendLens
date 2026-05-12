"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { StoredAudit } from "@/types";
import AuditResults from "@/components/audit/AuditResults";
import type { AuditResult } from "@/types";

interface Props { stored: StoredAudit; slug: string; }

export default function SharePageClient({ stored, slug: _slug }: Props) {
  const result: AuditResult = {
    ...stored.result,
    id: stored.id,
    shareSlug: stored.share_slug,
    formData: { ...stored.form_data, companyName: undefined },
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <header className="sticky top-0 z-40 glass" role="banner">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="font-semibold text-sm"
            style={{ color: "var(--text-primary)" }}
            aria-label="SpendLens home"
          >
            SpendLens
          </Link>
          <div className="flex items-center gap-3">
            <span
              className="text-xs hidden sm:block px-2 py-1 rounded"
              style={{
                color: "var(--text-muted)",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
              }}
            >
              Shared audit
            </span>
            <Link href="/audit" className="btn-success text-sm py-2 px-4">
              Run yours <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>
      <main>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AuditResults result={result} isPublicView />
        </motion.div>
      </main>
    </div>
  );
}