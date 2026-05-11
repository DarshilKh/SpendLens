import { NextRequest, NextResponse } from "next/server";
import { LeadCaptureSchema } from "@/lib/validation";
import { storeLead, getAuditById } from "@/lib/db/supabase";
import { sendAuditConfirmationEmail } from "@/lib/email/send";
import { hashString } from "@/lib/utils";
import type { AuditResult } from "@/types";

// Per-email rate limiting (in-memory; replace with Redis in prod)
const emailRateLimitMap = new Map<string, number>();
const COOLDOWN_MS = 20 * 60 * 1000; // 20 min

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  // Honeypot
  if ((body as Record<string, unknown>)._hp) {
    return NextResponse.json({ success: true });
  }

  const parsed = LeadCaptureSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Validation failed",
      },
      { status: 400 }
    );
  }

  const lead = parsed.data;
  const emailHash = hashString(lead.email.toLowerCase());

  // Rate limit: 20 min cooldown per email
  const now = Date.now();
  const lastCapture = emailRateLimitMap.get(emailHash) ?? 0;
  if (now - lastCapture < COOLDOWN_MS) {
    console.log("[Leads API] Rate-limited (silent success):", lead.email);
    return NextResponse.json({ success: true });
  }
  emailRateLimitMap.set(emailHash, now);

  console.log("[Leads API] Processing:", {
    email: lead.email,
    auditId: lead.auditId,
  });

  // ─── Fetch audit (needed for email body) ───────────────────────
  const storedAudit = await getAuditById(lead.auditId);
  if (!storedAudit) {
    console.warn("[Leads API] ⚠️ Audit not found for ID:", lead.auditId);
  }

  const monthlySavings = storedAudit?.result?.totalMonthlySavings ?? 0;

  // ─── AWAIT both critical operations ────────────────────────────
  // Previous code used .catch() without await — promises were killed
  // by Vercel serverless before they resolved. Both DB write and email
  // never actually executed.

  const { error: storeError } = await storeLead(lead, monthlySavings);
  if (storeError) {
    console.error("[Leads API] ❌ Lead storage failed:", storeError.message);
    // Non-fatal — continue to send email even if DB write fails
  } else {
    console.log("[Leads API] ✅ Lead stored");
  }

  // Send email — only if we have audit data
  if (storedAudit) {
    const fullResult: AuditResult = {
      ...storedAudit.result,
      id: storedAudit.id,
      shareSlug: storedAudit.share_slug,
      formData: storedAudit.form_data,
    };

    try {
      await sendAuditConfirmationEmail(lead, fullResult);
      console.log("[Leads API] ✅ Email pipeline complete:", lead.email);
    } catch (err) {
      console.error("[Leads API] ❌ Email failed:", {
        message: err instanceof Error ? err.message : String(err),
        email: lead.email,
      });
      // Email failure shouldn't break the user flow — they still have
      // the share URL. Return success but log loudly so we can monitor.
    }
  } else {
    console.warn("[Leads API] ⚠️ Skipped email — no audit data available");
  }

  return NextResponse.json({ success: true });
}