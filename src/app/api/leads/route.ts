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
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }

  // Honeypot
  if ((body as Record<string, unknown>)._hp) {
    return NextResponse.json({ success: true });
  }

  const parsed = LeadCaptureSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" },
      { status: 400 }
    );
  }

  const lead = parsed.data;
  const emailHash = hashString(lead.email.toLowerCase());

  // Rate limit: 20 min cooldown per email
  const now = Date.now();
  const lastCapture = emailRateLimitMap.get(emailHash) ?? 0;
  if (now - lastCapture < COOLDOWN_MS) {
    return NextResponse.json({ success: true }); // Silently succeed
  }
  emailRateLimitMap.set(emailHash, now);

  // Run storage + email with individual timeouts, non-blocking
  const TIMEOUT = 8000;

  const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
    Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), ms)
      ),
    ]);

  // Fetch audit (needed for email)
  const storedAudit = await withTimeout(getAuditById(lead.auditId), TIMEOUT).catch(() => null);

  // Store lead (non-blocking on failure)
  const monthlySavings = storedAudit?.result?.totalMonthlySavings ?? 0;
  storeLead(lead, monthlySavings).catch((err) =>
    console.error("[Leads API] Storage failed (non-fatal):", err)
  );

  // Send email (fire and forget — don't block response)
  if (storedAudit) {
    const fullResult: AuditResult = {
      ...storedAudit.result,
      id: storedAudit.id,
      shareSlug: storedAudit.share_slug,
      formData: storedAudit.form_data,
    };
    sendAuditConfirmationEmail(lead, fullResult).catch((err) =>
      console.error("[Leads API] Email failed (non-fatal):", err)
    );
  }

  return NextResponse.json({ success: true });
}
