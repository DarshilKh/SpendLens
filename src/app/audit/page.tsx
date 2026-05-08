import type { Metadata } from "next";
import AuditPageClient from "@/components/audit/AuditPageClient";

export const metadata: Metadata = {
  title: "Run Your AI Spend Audit",
  description:
    "Enter your AI tools, plans, and spend. Get an instant audit showing where you're overpaying and how to fix it.",
};

export default function AuditPage() {
  return <AuditPageClient />;
}
