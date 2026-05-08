import type { ToolDefinition, ToolId } from "@/types";

// ─── Pricing Database ─────────────────────────────────────────────────────────
// All prices in USD/user/month. Verified against official pricing pages.
// Last verification: 2025-01-06
// Sources documented in PRICING_DATA.md

export const TOOLS: ToolDefinition[] = [
  {
    id: "cursor",
    name: "Cursor",
    category: "coding",
    officialPricingUrl: "https://cursor.sh/pricing",
    pricingLastVerified: "2025-01-06",
    plans: [
      {
        id: "hobby",
        name: "Hobby",
        monthlyPricePerSeat: 0,
        features: ["2000 completions/mo", "50 slow requests", "Basic AI features"],
        bestFor: ["coding"],
      },
      {
        id: "pro",
        name: "Pro",
        monthlyPricePerSeat: 20,
        annualMonthlyPricePerSeat: 16,
        features: ["Unlimited completions", "500 fast requests", "GPT-4 & Claude access"],
        bestFor: ["coding"],
      },
      {
        id: "business",
        name: "Business",
        monthlyPricePerSeat: 40,
        minSeats: 1,
        features: ["Everything in Pro", "Team management", "SSO", "Admin controls", "Usage analytics"],
        bestFor: ["coding"],
      },
      {
        id: "enterprise",
        name: "Enterprise",
        monthlyPricePerSeat: 100, // estimated; requires contact
        minSeats: 20,
        features: ["Custom deployment", "SLA", "Dedicated support", "Security review"],
        bestFor: ["coding"],
      },
    ],
  },
  {
    id: "github_copilot",
    name: "GitHub Copilot",
    category: "coding",
    officialPricingUrl: "https://github.com/features/copilot#pricing",
    pricingLastVerified: "2025-01-06",
    plans: [
      {
        id: "individual",
        name: "Individual",
        monthlyPricePerSeat: 10,
        annualMonthlyPricePerSeat: 8.33,
        features: ["Code completions", "Chat in IDE", "CLI integration"],
        bestFor: ["coding"],
      },
      {
        id: "business",
        name: "Business",
        monthlyPricePerSeat: 19,
        features: ["Everything in Individual", "Policy management", "Audit logs", "IP indemnity"],
        bestFor: ["coding"],
      },
      {
        id: "enterprise",
        name: "Enterprise",
        monthlyPricePerSeat: 39,
        features: ["Everything in Business", "Personalized models", "PR summaries", "Fine-tuning"],
        bestFor: ["coding"],
      },
    ],
  },
  {
    id: "claude",
    name: "Claude (Anthropic)",
    category: "chat",
    officialPricingUrl: "https://www.anthropic.com/pricing",
    pricingLastVerified: "2025-01-06",
    plans: [
      {
        id: "free",
        name: "Free",
        monthlyPricePerSeat: 0,
        features: ["Limited messages", "Claude 3.5 Sonnet access", "Basic features"],
        bestFor: ["writing", "research", "mixed"],
      },
      {
        id: "pro",
        name: "Pro",
        monthlyPricePerSeat: 20,
        features: ["5x more usage", "Priority access", "Early features", "Projects"],
        bestFor: ["writing", "research", "coding", "mixed"],
      },
      {
        id: "max",
        name: "Max",
        monthlyPricePerSeat: 100,
        features: ["20x or 5x usage (two tiers)", "Highest priority", "All models"],
        bestFor: ["writing", "research", "coding", "data", "mixed"],
      },
      {
        id: "team",
        name: "Team",
        monthlyPricePerSeat: 30,
        minSeats: 5,
        features: ["Higher usage limits", "Team collaboration", "Admin console", "Usage management"],
        bestFor: ["writing", "research", "mixed"],
      },
      {
        id: "enterprise",
        name: "Enterprise",
        monthlyPricePerSeat: 60, // approximate; requires contact
        minSeats: 10,
        features: ["SSO", "Audit logs", "Custom data retention", "Expanded context"],
        bestFor: ["writing", "research", "data", "mixed"],
      },
      {
        id: "api_direct",
        name: "API Direct",
        monthlyPricePerSeat: 0, // usage-based
        features: ["Pay per token", "Full API access", "All models"],
        bestFor: ["coding", "data", "mixed"],
      },
    ],
  },
  {
    id: "chatgpt",
    name: "ChatGPT (OpenAI)",
    category: "chat",
    officialPricingUrl: "https://openai.com/chatgpt/pricing",
    pricingLastVerified: "2025-01-06",
    plans: [
      {
        id: "free",
        name: "Free",
        monthlyPricePerSeat: 0,
        features: ["GPT-4o mini", "Limited GPT-4o", "Basic features"],
        bestFor: ["writing", "research", "mixed"],
      },
      {
        id: "plus",
        name: "Plus",
        monthlyPricePerSeat: 20,
        features: ["GPT-4o", "Advanced Voice", "DALL-E", "GPTs", "5x limits vs free"],
        bestFor: ["writing", "research", "mixed"],
      },
      {
        id: "team",
        name: "Team",
        monthlyPricePerSeat: 30,
        annualMonthlyPricePerSeat: 25,
        minSeats: 2,
        features: ["Everything in Plus", "Longer context", "Admin workspace", "Data privacy"],
        bestFor: ["writing", "research", "mixed"],
      },
      {
        id: "enterprise",
        name: "Enterprise",
        monthlyPricePerSeat: 60, // approximate
        minSeats: 10,
        features: ["Unlimited GPT-4o", "SSO", "Custom GPTs", "Advanced analytics"],
        bestFor: ["writing", "research", "data", "mixed"],
      },
      {
        id: "api_direct",
        name: "API Direct",
        monthlyPricePerSeat: 0,
        features: ["Pay per token", "All models", "Assistants API"],
        bestFor: ["coding", "data", "mixed"],
      },
    ],
  },
  {
    id: "anthropic_api",
    name: "Anthropic API",
    category: "api",
    officialPricingUrl: "https://www.anthropic.com/pricing#api",
    pricingLastVerified: "2025-01-06",
    plans: [
      {
        id: "pay_as_you_go",
        name: "Pay-as-you-go",
        monthlyPricePerSeat: 0,
        features: ["Claude 3.5 Sonnet: $3/MTok in, $15/MTok out", "All models available", "No commitment"],
        bestFor: ["coding", "data", "mixed"],
      },
      {
        id: "credits",
        name: "Pre-purchased Credits",
        monthlyPricePerSeat: 0, // varies
        features: ["Discounted via Credex", "Up to 30-40% off retail", "Same API, lower cost"],
        bestFor: ["coding", "data", "mixed"],
      },
    ],
  },
  {
    id: "openai_api",
    name: "OpenAI API",
    category: "api",
    officialPricingUrl: "https://openai.com/api/pricing",
    pricingLastVerified: "2025-01-06",
    plans: [
      {
        id: "pay_as_you_go",
        name: "Pay-as-you-go",
        monthlyPricePerSeat: 0,
        features: ["GPT-4o: $2.50/MTok in, $10/MTok out", "All models available", "No commitment"],
        bestFor: ["coding", "data", "mixed"],
      },
      {
        id: "credits",
        name: "Pre-purchased Credits",
        monthlyPricePerSeat: 0,
        features: ["Discounted via Credex", "Up to 30-40% off retail", "Same API, lower cost"],
        bestFor: ["coding", "data", "mixed"],
      },
    ],
  },
  {
    id: "gemini",
    name: "Gemini (Google)",
    category: "chat",
    officialPricingUrl: "https://gemini.google.com/advanced",
    pricingLastVerified: "2025-01-06",
    plans: [
      {
        id: "free",
        name: "Free",
        monthlyPricePerSeat: 0,
        features: ["Gemini 1.5 Flash", "Basic features", "Google Workspace integration"],
        bestFor: ["writing", "research", "mixed"],
      },
      {
        id: "advanced",
        name: "Advanced (One Premium)",
        monthlyPricePerSeat: 19.99,
        features: ["Gemini 1.5 Ultra", "2TB storage", "Priority access", "NotebookLM+"],
        bestFor: ["writing", "research", "data", "mixed"],
      },
      {
        id: "workspace",
        name: "Workspace Business",
        monthlyPricePerSeat: 30,
        features: ["Gemini in all Workspace apps", "Admin controls", "Data governance", "Meet AI"],
        bestFor: ["writing", "research", "mixed"],
      },
      {
        id: "api",
        name: "API (AI Studio)",
        monthlyPricePerSeat: 0,
        features: ["Pay per token", "Gemini 1.5 Pro: $3.50/MTok", "Free tier available"],
        bestFor: ["coding", "data", "mixed"],
      },
    ],
  },
  {
    id: "windsurf",
    name: "Windsurf (Codeium)",
    category: "coding",
    officialPricingUrl: "https://windsurf.ai/pricing",
    pricingLastVerified: "2025-01-06",
    plans: [
      {
        id: "free",
        name: "Free",
        monthlyPricePerSeat: 0,
        features: ["5 user prompt credits/day", "Basic completions", "Cascade Base"],
        bestFor: ["coding"],
      },
      {
        id: "pro",
        name: "Pro",
        monthlyPricePerSeat: 15,
        features: ["Unlimited prompts", "Cascade advanced models", "Priority compute"],
        bestFor: ["coding"],
      },
      {
        id: "teams",
        name: "Teams",
        monthlyPricePerSeat: 35,
        minSeats: 3,
        features: ["Everything in Pro", "Team management", "Analytics", "Admin controls"],
        bestFor: ["coding"],
      },
    ],
  },
];

export const TOOL_MAP = new Map(TOOLS.map((t) => [t.id, t]));

export function getToolById(id: string): ToolDefinition | undefined {
  return TOOL_MAP.get(id as ToolId);
}

export function getPlanById(toolId: string, planId: string) {
  const tool = getToolById(toolId);
  return tool?.plans.find((p) => p.id === planId);
}

// Industry benchmark data (spend per developer per month)
export const INDUSTRY_BENCHMARKS = {
  // By team size bucket
  small: { avg: 85, p25: 45, p75: 130 }, // 1-10 people
  medium: { avg: 110, p25: 65, p75: 170 }, // 11-50 people
  large: { avg: 95, p25: 55, p75: 150 }, // 51-200 people
};

// Alternative recommendations mapping: if on tool A, consider tool B
export const ALTERNATIVE_MAP: Record<string, Array<{ toolId: string; planId: string; reason: string }>> = {
  "cursor:business": [
    {
      toolId: "cursor",
      planId: "pro",
      reason: "Business adds team management features that are only needed at 10+ engineers with centralized billing requirements.",
    },
  ],
  "chatgpt:team": [
    {
      toolId: "claude",
      planId: "team",
      reason: "Claude Team offers comparable collaboration features at a similar price point, with stronger performance on writing and analysis tasks.",
    },
  ],
  "github_copilot:enterprise": [
    {
      toolId: "github_copilot",
      planId: "business",
      reason: "Enterprise adds personalized models and fine-tuning, which typically only provides ROI for teams >50 with 6+ months of usage data.",
    },
  ],
  "chatgpt:enterprise": [
    {
      toolId: "claude",
      planId: "enterprise",
      reason: "Claude Enterprise offers equivalent governance, SSO, and data privacy at typically 10-15% lower cost.",
    },
  ],
  "gemini:workspace": [
    {
      toolId: "claude",
      planId: "team",
      reason: "If your team isn't deeply embedded in Google Workspace, Claude Team delivers stronger AI output quality at a lower per-seat cost.",
    },
  ],
};
