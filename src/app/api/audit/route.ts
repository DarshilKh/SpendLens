import { NextRequest, NextResponse } from "next/server";
import { AuditApiRequestSchema } from "@/lib/validation";
import { runAuditEngine } from "@/lib/audit/engine";
import { generateAuditSummary } from "@/lib/ai/summary";
import { storeAudit } from "@/lib/db/supabase";
import { hashString } from "@/lib/utils";
import type { AuditResult } from "@/types";

// Simple in-memory rate limiter (replace with Upstash Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // requests
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;

  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const ipHash = hashString(ip);

  if (!checkRateLimit(ipHash)) {
    return NextResponse.json(
      { success: false, error: "Rate limit exceeded. Try again in an hour.", code: "RATE_LIMITED" },
      { status: 429 }
    );
  }

  // Honeypot check
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }

  // Check honeypot field
  if ((body as Record<string, unknown>)._hp) {
    return NextResponse.json({ success: true, data: { id: "bot", shareSlug: "bot" } });
  }

  // Validate input
  const parsed = AuditApiRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" },
      { status: 400 }
    );
  }

  const { formData } = parsed.data;

  try {
    // Run audit engine (synchronous, pure computation)
    const partialResult = runAuditEngine(formData);

    // Generate AI summary (async, with fallback)
    const { summary, isFallback } = await generateAuditSummary({
      ...partialResult,
      aiSummary: undefined,
      aiSummaryFallback: false,
    } as AuditResult);

    const result: AuditResult = {
      ...partialResult,
      aiSummary: summary,
      aiSummaryFallback: isFallback,
    };

    // Store in Supabase (fire and forget — don't block response)
    storeAudit(result).catch((err) =>
      console.error("[Audit API] Storage failed:", err)
    );

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error("[Audit API] Engine error:", err);
    return NextResponse.json(
      { success: false, error: "Audit processing failed. Please try again.", code: "ENGINE_ERROR" },
      { status: 500 }
    );
  }
}
