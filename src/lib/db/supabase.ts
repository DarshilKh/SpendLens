import { createClient } from "@supabase/supabase-js";
import type {
  StoredAudit,
  AuditResult,
  LeadCaptureData,
} from "@/types";

// ─── Env ────────────────────────────────────────────────────────────
function getEnvVar(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

const supabaseUrl = getEnvVar("NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const supabaseServiceKey = getEnvVar("SUPABASE_SERVICE_ROLE_KEY");

// ─── Clients ────────────────────────────────────────────────────────
let _publicClient: ReturnType<typeof createClient> | null = null;

export function getPublicClient() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (!_publicClient) {
    _publicClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });
  }
  return _publicClient;
}

// Server-side admin client — fresh per call to avoid stale auth
export function getAdminClient() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Legacy export (kept for backwards compat; consider removing after audit)
export const supabase = {
  from: (table: string) => {
    const client = getPublicClient();
    if (!client) {
      const dummy: Record<string, unknown> = {};
      dummy.select = () => dummy;
      dummy.eq = () => dummy;
      dummy.single = () =>
        Promise.resolve({
          data: null,
          error: new Error("Supabase not configured"),
        });
      return dummy;
    }
    return client.from(table);
  },
};

// ═══════════════════════════════════════════════════════════════════
// AUDIT STORAGE
// ═══════════════════════════════════════════════════════════════════

export async function storeAudit(
  result: AuditResult
): Promise<{ error: Error | null }> {
  const admin = getAdminClient();

  if (!admin) {
    const msg =
      "[storeAudit] ❌ Admin client not configured — SUPABASE_SERVICE_ROLE_KEY missing";
    console.error(msg);

    // In production, this is a fatal misconfiguration.
    // Don't pretend it worked — return an error so the API surfaces it.
    if (process.env.NODE_ENV === "production") {
      return { error: new Error(msg) };
    }

    // In dev, allow soft-fail (lets you work without Supabase locally)
    console.warn("[storeAudit] Continuing without persistence (dev mode)");
    return { error: null };
  }

  console.log("[storeAudit] inserting audit:", result.shareSlug);

  const { error } = await admin.from("audits").insert({
    id: result.id,
    share_slug: result.shareSlug,
    form_data: result.formData,
    result: {
      recommendations: result.recommendations,
      totalCurrentMonthlySpend: result.totalCurrentMonthlySpend,
      totalRecommendedMonthlySpend: result.totalRecommendedMonthlySpend,
      totalMonthlySavings: result.totalMonthlySavings,
      totalAnnualSavings: result.totalAnnualSavings,
      savingsPercentage: result.savingsPercentage,
      isAlreadyOptimal: result.isAlreadyOptimal,
      highSavingsCase: result.highSavingsCase,
      benchmark: result.benchmark,
      aiSummary: result.aiSummary,
      aiSummaryFallback: result.aiSummaryFallback,
      createdAt: result.createdAt,
      shareSlug: result.shareSlug,
    },
    is_public: true,
    created_at: result.createdAt,
  });

  if (error) {
    console.error("[storeAudit] ❌ Insert failed:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return { error: new Error(error.message) };
  }

  console.log("[storeAudit] ✅ Stored successfully:", result.shareSlug);
  return { error: null };
}

export async function getAuditBySlug(
  slug: string
): Promise<StoredAudit | null> {
  console.log("[getAuditBySlug] called with slug:", slug);

  const client = getPublicClient();
  if (!client) {
    console.error("[getAuditBySlug] ❌ Public client not configured");
    return null;
  }

  const { data, error } = await client
    .from("audits")
    .select("*")
    .eq("share_slug", slug)
    .eq("is_public", true)
    .maybeSingle();

  if (error) {
    console.error("[getAuditBySlug] ❌ Query error:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return null;
  }

  if (!data) {
    console.warn("[getAuditBySlug] ⚠️ No row found for slug:", slug);
    return null;
  }

  const row = data as unknown as StoredAudit;
  console.log("[getAuditBySlug] ✅ Found audit:", row.id);
  return row;
}

export async function getAuditById(
  id: string
): Promise<StoredAudit | null> {
  const client = getPublicClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("audits")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    return data as unknown as StoredAudit;
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════
// LEAD STORAGE
// ═══════════════════════════════════════════════════════════════════

export async function storeLead(
  lead: LeadCaptureData,
  monthlySavings: number
): Promise<{ error: Error | null }> {
  const admin = getAdminClient();

  if (!admin) {
    const msg =
      "[storeLead] ❌ Admin client not configured — SUPABASE_SERVICE_ROLE_KEY missing";
    console.error(msg);

    if (process.env.NODE_ENV === "production") {
      return { error: new Error(msg) };
    }

    console.warn("[storeLead] Continuing without persistence (dev mode)");
    return { error: null };
  }

  try {
    // Check for duplicate email + audit_id combo
    const { data: existing } = await admin
      .from("leads")
      .select("id")
      .eq("email", lead.email)
      .eq("audit_id", lead.auditId)
      .maybeSingle();

    if (existing) {
      console.log("[storeLead] duplicate, skipping:", lead.email);
      return { error: null };
    }

    const { error } = await admin.from("leads").insert({
      email: lead.email,
      company_name: lead.companyName ?? null,
      role: lead.role ?? null,
      team_size: lead.teamSize ?? null,
      audit_id: lead.auditId,
      wants_consultation: lead.wantsConsultation,
      monthly_savings: monthlySavings,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("[storeLead] ❌ Insert failed:", {
        code: error.code,
        message: error.message,
      });
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (err) {
    console.error("[storeLead] ❌ Unexpected error:", err);
    return {
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}

// ═══════════════════════════════════════════════════════════════════
// REFERRAL TRACKING
// ═══════════════════════════════════════════════════════════════════

export async function trackReferral(
  referralCode: string,
  newAuditId: string
): Promise<void> {
  const admin = getAdminClient();
  if (!admin) {
    console.warn("[trackReferral] Admin client not configured — skipping");
    return;
  }
  const { error } = await admin.from("referrals").insert({
    referral_code: referralCode,
    triggered_audit_id: newAuditId,
    created_at: new Date().toISOString(),
  });
  if (error) {
    console.error("[trackReferral] ❌ Insert failed:", error.message);
  }
}

export async function getReferralCount(auditId: string): Promise<number> {
  const client = getPublicClient();
  if (!client) return 0;
  const { count } = await client
    .from("referrals")
    .select("*", { count: "exact", head: true })
    .eq("triggered_audit_id", auditId);
  return count ?? 0;
}