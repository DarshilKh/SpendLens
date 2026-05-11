// ─── Tool & Plan Types ───────────────────────────────────────────────────────

export type ToolId =
  | "cursor"
  | "github_copilot"
  | "claude"
  | "chatgpt"
  | "anthropic_api"
  | "openai_api"
  | "gemini"
  | "windsurf";

export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export interface ToolEntry {
  id: string;
  toolId: ToolId;
  planId: string;
  seats: number;
  monthlySpend: number;
}

export interface AuditFormData {
  tools: ToolEntry[];
  teamSize: number;
  useCase: UseCase;
  companyName?: string;
}

// ─── Pricing Data Types ──────────────────────────────────────────────────────

/**
 * Pricing model for a plan:
 *
 *   • undefined / absent → standard per-seat pricing.
 *                          monthlyPricePerSeat × seats = expected spend.
 *                          The form auto-fills the "Actual / mo" field.
 *
 *   • "usage"            → metered / pay-per-token (e.g. raw API access).
 *                          monthlyPricePerSeat is conventionally 0.
 *                          The form does NOT auto-fill — user enters their
 *                          real invoice amount.
 *
 *   • "custom"           → sales-quoted contract pricing (e.g. Enterprise tiers).
 *                          monthlyPricePerSeat may be 0 (truly custom) or a
 *                          "starting from" estimate. The form does NOT
 *                          auto-fill — user enters their contracted amount.
 */
export type PlanPriceType = "usage" | "custom";

export interface PricingPlan {
  id: string;
  name: string;
  monthlyPricePerSeat: number;
  annualMonthlyPricePerSeat?: number;
  minSeats?: number;
  maxSeats?: number;
  features: string[];
  bestFor: UseCase[];
  /** Undefined for standard per-seat plans. See PlanPriceType for details. */
  priceType?: PlanPriceType;
}

export interface ToolDefinition {
  id: ToolId;
  name: string;
  category: "coding" | "chat" | "api";
  plans: PricingPlan[];
  officialPricingUrl: string;
  pricingLastVerified: string;
}

// ─── Audit Engine Types ──────────────────────────────────────────────────────

export type RecommendationType =
  | "downgrade_plan"
  | "switch_tool"
  | "add_credits"
  | "already_optimal"
  | "minor_opportunity"
  | "potential_redundancy"
  | "slight_overprovision"
  | "enterprise_overkill"
  | "strong_roi"
  | "upgrade_recommended";

export type RecommendationSeverity = "savings" | "info" | "optimal" | "warning";

export interface ToolRecommendation {
  toolEntryId: string;
  toolId: ToolId;
  toolName: string;
  currentPlanName: string;
  currentMonthlyCost: number;
  recommendationType: RecommendationType;
  severity: RecommendationSeverity;
  statusLabel: string;           // e.g. "Slight overprovision", "Well matched"
  recommendedAction: string;
  recommendedToolId?: ToolId;
  recommendedPlanId?: string;
  recommendedMonthlyCost: number;
  monthlySavings: number;
  annualSavings: number;
  reasoning: string;
  credexRelevant: boolean;
  confidence: "high" | "medium" | "low";
}

export interface BenchmarkData {
  spendPerDeveloper: number;
  industryAveragePerDeveloper: number;
  percentile: number;
  label: string;
}

export interface AuditResult {
  id: string;
  formData: AuditFormData;
  recommendations: ToolRecommendation[];
  totalCurrentMonthlySpend: number;
  totalRecommendedMonthlySpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  savingsPercentage: number;
  isAlreadyOptimal: boolean;
  highSavingsCase: boolean;
  benchmark: BenchmarkData;
  aiSummary?: string;
  aiSummaryFallback: boolean;
  createdAt: string;
  shareSlug: string;
}

// ─── Lead Capture Types ──────────────────────────────────────────────────────

export interface LeadCaptureData {
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
  auditId: string;
  wantsConsultation: boolean;
}

export interface StoredLead {
  id: string;
  email: string;
  company_name?: string;
  role?: string;
  team_size?: number;
  audit_id: string;
  wants_consultation: boolean;
  monthly_savings: number;
  created_at: string;
}

export interface StoredAudit {
  id: string;
  share_slug: string;
  form_data: AuditFormData;
  result: Omit<AuditResult, "formData">;
  is_public: boolean;
  created_at: string;
  ip_hash?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface ReferralData {
  code: string;
  referrerId?: string;
  auditId?: string;
}

export interface WidgetConfig {
  theme: "light" | "dark";
  primaryColor?: string;
  showBranding: boolean;
}