import { createClient } from "@supabase/supabase-js";
import type { StoredAudit, StoredLead, AuditResult, LeadCaptureData } from "@/types";

// Validate env vars at module load (server-side only)
function getEnvVar(name: string, fallback = ""): string {
  const val = process.env[name] ?? fallback;
  return val;
}

const supabaseUrl = getEnvVar("NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const supabaseServiceKey = getEnvVar("SUPABASE_SERVICE_ROLE_KEY");

// Public client (browser-safe) — lazy init to avoid issues when env not set
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

// Server-side admin client — created fresh per call to avoid stale auth
export function getAdminClient() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Legacy export for backwards compat in share page
export const supabase = {
  from: (table: string) => {
    const client = getPublicClient();
    if (!client) {
      // Return a dummy object that silently fails
      const dummy: Record<string, unknown> = {};
      dummy.select = () => dummy;
      dummy.eq = () => dummy;
      dummy.single = () => Promise.resolve({ data: null, error: new Error("Supabase not configured") });
      return dummy;
    }
    return client.from(table);
  },
};

// ─── Audit Storage ────────────────────────────────────────────────────────────

export async function storeAudit(result: AuditResult): Promise<{ error: Error | null }> {
  const admin = getAdminClient();
  if (!admin) {
    console.warn("[DB] Supabase not configured — skipping audit storage");
    return { error: null };
  }

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

  return { error: error ? new Error(error.message) : null };
}

export async function getAuditBySlug(slug: string): Promise<StoredAudit | null> {
  const client = getPublicClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("audits")
      .select("*")
      .eq("share_slug", slug)
      .eq("is_public", true)
      .single();

    if (error || !data) return null;
    return data as StoredAudit;
  } catch {
    return null;
  }
}

export async function getAuditById(id: string): Promise<StoredAudit | null> {
  const client = getPublicClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("audits")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return data as StoredAudit;
  } catch {
    return null;
  }
}

// ─── Lead Storage ─────────────────────────────────────────────────────────────

export async function storeLead(
  lead: LeadCaptureData,
  monthlySavings: number
): Promise<{ error: Error | null }> {
  const admin = getAdminClient();
  if (!admin) {
    console.warn("[DB] Supabase not configured — skipping lead storage");
    return { error: null };
  }

  try {
    // Check for duplicate email + audit_id combo
    const { data: existing } = await admin
      .from("leads")
      .select("id")
      .eq("email", lead.email)
      .eq("audit_id", lead.auditId)
      .single();

    if (existing) {
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

    return { error: error ? new Error(error.message) : null };
  } catch (err) {
    console.error("[DB] Lead insertion error:", err);
    return { error: err instanceof Error ? err : new Error("Unknown error") };
  }
}

// ─── Referral Tracking ────────────────────────────────────────────────────────

export async function trackReferral(referralCode: string, newAuditId: string) {
  const admin = getAdminClient();
  if (!admin) return;
  await admin.from("referrals").insert({
    referral_code: referralCode,
    triggered_audit_id: newAuditId,
    created_at: new Date().toISOString(),
  });
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
