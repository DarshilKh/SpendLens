import type { ToolDefinition, ToolId } from "@/types";

// ─── Pricing Database ─────────────────────────────────────────────────────────
// All prices in USD/user/month (monthly billing unless noted).
// Last verification: 2026-05-10
//
// priceType field:
//   • undefined / absent → standard per-seat pricing (auto-fill spend)
//   • "usage"            → metered/pay-per-token (do NOT auto-fill)
//   • "custom"           → sales-quoted contract (do NOT auto-fill;
//                          monthlyPricePerSeat is "starting from" estimate)
//
// Sources: official vendor pricing pages + GitHub Docs, Anthropic docs,
// windsurf.com/pricing

export const TOOLS: ToolDefinition[] = [

  // ─── CURSOR ────────────────────────────────────────────────────────────────
  {
    id: "cursor",
    name: "Cursor",
    category: "coding",
    officialPricingUrl: "https://cursor.com/pricing",
    pricingLastVerified: "2026-05-10",
    plans: [
      {
        id: "hobby",
        name: "Hobby",
        monthlyPricePerSeat: 0,
        features: ["Limited agent requests", "Limited Tab completions", "Full editor access"],
        bestFor: ["coding"],
      },
      {
        id: "pro",
        name: "Pro",
        monthlyPricePerSeat: 20,
        annualMonthlyPricePerSeat: 16,
        features: [
          "$20 monthly credit pool",
          "Unlimited Tab completions",
          "Frontier model access (Claude, GPT, Gemini)",
          "MCPs, cloud agents",
          "Background agents",
        ],
        bestFor: ["coding"],
      },
      {
        id: "pro_plus",
        name: "Pro+",
        monthlyPricePerSeat: 60,
        features: [
          "Everything in Pro",
          "3x usage credits ($60 pool)",
          "Priority compute",
        ],
        bestFor: ["coding"],
      },
      {
        id: "ultra",
        name: "Ultra",
        monthlyPricePerSeat: 200,
        features: [
          "Everything in Pro+",
          "20x usage (vs Pro)",
          "Priority access to new features",
          "Heaviest agent workloads",
        ],
        bestFor: ["coding"],
      },
      {
        id: "teams",
        name: "Teams",
        monthlyPricePerSeat: 40,
        minSeats: 3,
        features: [
          "Pro-equivalent AI access per seat",
          "Centralized billing",
          "SSO",
          "Admin controls",
          "Usage analytics",
        ],
        bestFor: ["coding"],
      },
      {
        id: "enterprise",
        name: "Enterprise",
        monthlyPricePerSeat: 100,
        priceType: "custom",
        minSeats: 20,
        features: [
          "Pooled org usage",
          "Custom deployment",
          "SLA + dedicated support",
          "Security review",
          "Custom contracts",
        ],
        bestFor: ["coding"],
      },
    ],
  },

  // ─── GITHUB COPILOT ────────────────────────────────────────────────────────
  {
    id: "github_copilot",
    name: "GitHub Copilot",
    category: "coding",
    officialPricingUrl: "https://github.com/features/copilot/plans",
    pricingLastVerified: "2026-05-10",
    plans: [
      {
        id: "free",
        name: "Free",
        monthlyPricePerSeat: 0,
        features: [
          "2,000 inline suggestions/mo",
          "50 premium requests/mo",
          "Chat in IDE (limited)",
        ],
        bestFor: ["coding"],
      },
      {
        id: "pro",
        name: "Pro",
        monthlyPricePerSeat: 10,
        annualMonthlyPricePerSeat: 8.33,
        features: [
          "Unlimited code completions",
          "300 premium requests/mo",
          "All major IDEs (VS Code, JetBrains, Neovim, Xcode)",
          "GitHub Mobile chat",
        ],
        bestFor: ["coding"],
      },
      {
        id: "pro_plus",
        name: "Pro+",
        monthlyPricePerSeat: 39,
        features: [
          "Everything in Pro",
          "1,500 premium requests/mo",
          "Claude Opus 4.6, o3, GPT-5.4 access",
          "Priority compute",
        ],
        bestFor: ["coding"],
      },
      {
        id: "business",
        name: "Business",
        monthlyPricePerSeat: 19,
        features: [
          "Unlimited code completions per user",
          "$19 monthly AI Credits included",
          "Policy management",
          "Audit logs",
          "IP indemnity",
          "SAML SSO",
        ],
        bestFor: ["coding"],
      },
      {
        id: "enterprise",
        name: "Enterprise",
        monthlyPricePerSeat: 39,
        priceType: "custom",
        minSeats: 10,
        features: [
          "$39 Copilot seat + requires GitHub Enterprise Cloud ($21/user)",
          "Effective total ~$60/user/mo",
          "Knowledge bases (train on your codebase)",
          "Fine-tuned custom models",
          "PR summaries",
          "Advanced compliance",
        ],
        bestFor: ["coding"],
      },
    ],
  },

  // ─── CLAUDE (ANTHROPIC) ────────────────────────────────────────────────────
  {
    id: "claude",
    name: "Claude (Anthropic)",
    category: "chat",
    officialPricingUrl: "https://claude.com/pricing",
    pricingLastVerified: "2026-05-10",
    plans: [
      {
        id: "free",
        name: "Free",
        monthlyPricePerSeat: 0,
        features: [
          "Limited daily usage",
          "Claude Sonnet 4.6 + Haiku 4.5",
          "Web, iOS, Android",
        ],
        bestFor: ["writing", "research", "mixed"],
      },
      {
        id: "pro",
        name: "Pro",
        monthlyPricePerSeat: 20,
        annualMonthlyPricePerSeat: 17,
        features: [
          "5x more usage than Free",
          "Claude Opus 4.6 + Sonnet 4.6 access",
          "Claude Code (terminal)",
          "Projects, Google Workspace integration",
          "Remote MCP connectors",
          "Priority access",
        ],
        bestFor: ["writing", "research", "coding", "mixed"],
      },
      {
        id: "max_5x",
        name: "Max (5x)",
        monthlyPricePerSeat: 100,
        features: [
          "5x more usage than Pro",
          "All models including Opus 4.6",
          "Priority access to new features",
          "Claude Code included",
        ],
        bestFor: ["writing", "research", "coding", "data", "mixed"],
      },
      {
        id: "max_20x",
        name: "Max (20x)",
        monthlyPricePerSeat: 200,
        features: [
          "20x more usage than Pro",
          "Highest priority compute",
          "All models + features",
          "Claude Code included",
        ],
        bestFor: ["writing", "research", "coding", "data", "mixed"],
      },
      {
        id: "team_standard",
        name: "Team Standard",
        monthlyPricePerSeat: 25,
        annualMonthlyPricePerSeat: 25,
        minSeats: 5,
        features: [
          "More usage than Pro",
          "Microsoft 365 + Slack integrations",
          "Enterprise search",
          "SSO + domain capture",
          "Central billing + admin console",
          "200K context window",
        ],
        bestFor: ["writing", "research", "mixed"],
      },
      {
        id: "team_premium",
        name: "Team Premium",
        monthlyPricePerSeat: 125,
        minSeats: 5,
        features: [
          "Everything in Team Standard",
          "Claude Code included",
          "Cowork included",
          "5x more usage than Standard",
          "200K context window",
        ],
        bestFor: ["coding", "data", "mixed"],
      },
      {
        id: "enterprise",
        name: "Enterprise",
        monthlyPricePerSeat: 0,
        priceType: "custom",
        minSeats: 50,
        features: [
          "Custom token rates",
          "500K context window",
          "HIPAA readiness",
          "SSO, SCIM, audit logs, DPA",
          "Role-based access control",
          "Custom data retention",
          "99.99% SLA",
        ],
        bestFor: ["writing", "research", "data", "mixed"],
      },
      {
        id: "api_direct",
        name: "API Direct",
        monthlyPricePerSeat: 0,
        priceType: "usage",
        features: [
          "Sonnet 4.6: $3/MTok in, $15/MTok out",
          "Opus 4.6: $15/MTok in, $75/MTok out",
          "Haiku 4.5: $0.80/MTok in, $4/MTok out",
          "50% Batch API discount",
          "Prompt caching: 90% off repeated input",
        ],
        bestFor: ["coding", "data", "mixed"],
      },
    ],
  },

  // ─── CHATGPT (OPENAI) ───────────────────────────────────────────────────────
  {
    id: "chatgpt",
    name: "ChatGPT (OpenAI)",
    category: "chat",
    officialPricingUrl: "https://chatgpt.com/pricing",
    pricingLastVerified: "2026-05-10",
    plans: [
      {
        id: "free",
        name: "Free",
        monthlyPricePerSeat: 0,
        features: [
          "GPT-5.3 mini (unlimited)",
          "Metered GPT-5 access",
          "10 messages per 5 hours on advanced models",
        ],
        bestFor: ["writing", "research", "mixed"],
      },
      {
        id: "plus",
        name: "Plus",
        monthlyPricePerSeat: 20,
        features: [
          "GPT-5.5 + GPT-5.4",
          "Deep Research (10/mo)",
          "DALL-E image gen",
          "Agent Mode",
          "Advanced Voice",
          "Custom GPTs",
        ],
        bestFor: ["writing", "research", "mixed"],
      },
      {
        id: "pro",
        name: "Pro",
        monthlyPricePerSeat: 200,
        features: [
          "Unlimited GPT-5.5 + all reasoning models",
          "o3 + o4-mini-high unlimited",
          "1M token context",
          "Priority compute",
          "Extended Deep Research",
        ],
        bestFor: ["research", "data", "mixed"],
      },
      {
        id: "business",
        name: "Business",
        monthlyPricePerSeat: 20,
        annualMonthlyPricePerSeat: 20,
        minSeats: 2,
        features: [
          "Everything in Plus",
          "Shared workspaces",
          "SAML SSO",
          "Admin controls",
          "SOC 2 Type II",
          "60+ app integrations (Slack, Google Drive, GitHub)",
          "Data excluded from training by default",
          "$25/seat if billed monthly",
        ],
        bestFor: ["writing", "research", "mixed"],
      },
      {
        id: "enterprise",
        name: "Enterprise",
        monthlyPricePerSeat: 60,
        priceType: "custom",
        minSeats: 10,
        features: [
          "Unlimited GPT-5.4",
          "Custom data retention + EKM",
          "SCIM + role-based access",
          "Domain verification",
          "Advanced analytics",
          "Dedicated support",
          "Data excluded from training",
        ],
        bestFor: ["writing", "research", "data", "mixed"],
      },
      {
        id: "api_direct",
        name: "API Direct",
        monthlyPricePerSeat: 0,
        priceType: "usage",
        features: [
          "GPT-5.4: pay per token",
          "GPT-5: $1.25/MTok in, $10/MTok out",
          "GPT-5-mini: $0.25/MTok in, $2/MTok out",
          "Assistants API + Batch API",
        ],
        bestFor: ["coding", "data", "mixed"],
      },
    ],
  },

  // ─── ANTHROPIC API ─────────────────────────────────────────────────────────
  {
    id: "anthropic_api",
    name: "Anthropic API",
    category: "api",
    officialPricingUrl: "https://www.anthropic.com/pricing#api",
    pricingLastVerified: "2026-05-10",
    plans: [
      {
        id: "pay_as_you_go",
        name: "Pay-as-you-go",
        monthlyPricePerSeat: 0,
        priceType: "usage",
        features: [
          "Sonnet 4.6: $3/MTok in, $15/MTok out",
          "Opus 4.6: $15/MTok in, $75/MTok out",
          "Haiku 4.5: $0.80/MTok in, $4/MTok out",
          "No long-context surcharge (removed March 2026)",
          "Batch API: 50% discount",
          "Prompt caching: 90% off reads",
        ],
        bestFor: ["coding", "data", "mixed"],
      },
      {
        id: "credits",
        name: "Pre-purchased Credits",
        monthlyPricePerSeat: 0,
        priceType: "usage",
        features: [
          "Discounted via Credex",
          "Up to 30–40% off retail API rates",
          "Same API, same performance",
        ],
        bestFor: ["coding", "data", "mixed"],
      },
    ],
  },

  // ─── OPENAI API ────────────────────────────────────────────────────────────
  {
    id: "openai_api",
    name: "OpenAI API",
    category: "api",
    officialPricingUrl: "https://openai.com/api/pricing",
    pricingLastVerified: "2026-05-10",
    plans: [
      {
        id: "pay_as_you_go",
        name: "Pay-as-you-go",
        monthlyPricePerSeat: 0,
        priceType: "usage",
        features: [
          "GPT-5.4: current flagship (April 2026+)",
          "GPT-5: $1.25/MTok in, $10/MTok out",
          "GPT-5-mini: $0.25/MTok in, $2/MTok out",
          "All models, no commitment",
        ],
        bestFor: ["coding", "data", "mixed"],
      },
      {
        id: "credits",
        name: "Pre-purchased Credits",
        monthlyPricePerSeat: 0,
        priceType: "usage",
        features: [
          "Discounted via Credex",
          "Up to 30–40% off retail API rates",
          "Same API, same performance",
        ],
        bestFor: ["coding", "data", "mixed"],
      },
    ],
  },

  // ─── GEMINI (GOOGLE) ───────────────────────────────────────────────────────
  {
    id: "gemini",
    name: "Gemini (Google)",
    category: "chat",
    officialPricingUrl: "https://gemini.google.com",
    pricingLastVerified: "2026-05-10",
    plans: [
      {
        id: "free",
        name: "Free",
        monthlyPricePerSeat: 0,
        features: [
          "Gemini 3 Flash (unlimited)",
          "Daily Gemini 3.1 Pro quota",
          "5 Deep Research/mo",
          "Gemini Live voice",
        ],
        bestFor: ["writing", "research", "mixed"],
      },
      {
        id: "ai_plus",
        name: "Google AI Plus",
        monthlyPricePerSeat: 7.99,
        features: [
          "128K context window",
          "200 monthly AI credits",
          "Expanded NotebookLM",
          "200 GB storage",
        ],
        bestFor: ["writing", "research", "mixed"],
      },
      {
        id: "ai_pro",
        name: "Google AI Pro",
        monthlyPricePerSeat: 19.99,
        features: [
          "Gemini 3.1 Pro (1M token context)",
          "~100 Pro prompts/day",
          "1,000 monthly AI credits",
          "3 Veo 3.1 videos/day",
          "NotebookLM Plus",
          "Deep Research",
        ],
        bestFor: ["writing", "research", "data", "mixed"],
      },
      {
        id: "ai_ultra",
        name: "Google AI Ultra",
        monthlyPricePerSeat: 249.99,
        features: [
          "Gemini 3.1 Pro unlimited (highest limits)",
          "Deep Think 3.1 (10/day)",
          "1,500 Gemini 3 Thinking prompts/day",
          "120 Deep Research/day",
          "12,500 AI Credits",
          "30 TB storage + YouTube Premium",
        ],
        bestFor: ["data", "research", "mixed"],
      },
      {
        id: "workspace_standard",
        name: "Workspace Business Standard (with Gemini)",
        monthlyPricePerSeat: 14,
        annualMonthlyPricePerSeat: 14,
        features: [
          "Gemini AI bundled in all Workspace apps",
          "2 TB storage",
          "Meet with recording (150 participants)",
          "Admin controls",
          "Previously required $20–30 Gemini add-on",
        ],
        bestFor: ["writing", "research", "mixed"],
      },
      {
        id: "workspace_plus",
        name: "Workspace Business Plus (with Gemini)",
        monthlyPricePerSeat: 22,
        annualMonthlyPricePerSeat: 22,
        features: [
          "Everything in Standard",
          "5 TB storage",
          "Gemini Enterprise-level features",
          "Vault (eDiscovery)",
          "Enhanced security controls",
          "500-participant meetings",
        ],
        bestFor: ["writing", "research", "mixed"],
      },
      {
        id: "api",
        name: "Gemini API (AI Studio)",
        monthlyPricePerSeat: 0,
        priceType: "usage",
        features: [
          "Gemini 3.1 Pro: $2/MTok in (≤200K), $4 above",
          "$12/MTok out",
          "Flash-Lite: $0.10/MTok in, $0.40/MTok out",
          "Free tier with daily limits (no card needed)",
        ],
        bestFor: ["coding", "data", "mixed"],
      },
    ],
  },

  // ─── WINDSURF (CODEIUM / COGNITION AI) ────────────────────────────────────
  {
    id: "windsurf",
    name: "Windsurf",
    category: "coding",
    officialPricingUrl: "https://windsurf.com/pricing",
    pricingLastVerified: "2026-05-10",
    plans: [
      {
        id: "free",
        name: "Free",
        monthlyPricePerSeat: 0,
        features: [
          "25 prompt credits/mo",
          "Unlimited SWE-1 Lite (proprietary model)",
          "Tab autocomplete unlimited",
          "1 deploy/day",
        ],
        bestFor: ["coding"],
      },
      {
        id: "pro",
        name: "Pro",
        monthlyPricePerSeat: 20,
        features: [
          "Standard quota of prompt credits",
          "SWE-1, SWE-1.5 models",
          "Frontier model access at API price (Claude, GPT, Gemini)",
          "5 deploys/day",
          "No per-session credit anxiety",
        ],
        bestFor: ["coding"],
      },
      {
        id: "max",
        name: "Max",
        monthlyPricePerSeat: 200,
        features: [
          "Heavy quota — 20x usage vs Pro",
          "All models",
          "Priority compute",
          "Best for all-day agentic coding",
        ],
        bestFor: ["coding"],
      },
      {
        id: "teams",
        name: "Teams",
        monthlyPricePerSeat: 40,
        minSeats: 3,
        features: [
          "Standard quota per user (not pooled)",
          "Centralized billing",
          "Admin dashboard + analytics",
          "Priority support",
          "Pooled add-on credits across team",
          "SSO available (+$10/user/mo add-on)",
        ],
        bestFor: ["coding"],
      },
      {
        id: "enterprise",
        name: "Enterprise",
        monthlyPricePerSeat: 0,
        priceType: "custom",
        minSeats: 20,
        features: [
          "Everything in Teams",
          "SSO + RBAC included",
          "Zero Data Retention (ZDR) by default",
          "Hybrid deployment options",
          "1,000+ credits/user (double Teams)",
          "Custom contracts",
        ],
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

// ─── Industry benchmarks (spend per developer per month) ──────────────────────
// Source: FinOps Foundation reports, vendor surveys, startup spend data — May 2026
export const INDUSTRY_BENCHMARKS = {
  small:  { avg: 90,  p25: 45, p75: 135 }, // 1–10 people
  medium: { avg: 115, p25: 65, p75: 175 }, // 11–50 people
  large:  { avg: 100, p25: 55, p75: 155 }, // 51–200 people
};

// ─── Alternative recommendations ─────────────────────────────────────────────
export const ALTERNATIVE_MAP: Record<string, Array<{ toolId: string; planId: string; reason: string }>> = {
  "cursor:teams": [
    {
      toolId: "cursor",
      planId: "pro",
      reason:
        "Teams adds centralized billing and SSO. Below 10 engineers without compliance requirements, individual Pro seats at $20/user are $20/user cheaper with identical AI capability.",
    },
  ],
  "cursor:ultra": [
    {
      toolId: "cursor",
      planId: "pro_plus",
      reason:
        "Ultra at $200/mo is for developers running parallel background agents all day. Pro+ at $60 covers most heavy users — upgrade only if monthly credit overages consistently exceed $40.",
    },
  ],
  "github_copilot:enterprise": [
    {
      toolId: "github_copilot",
      planId: "business",
      reason:
        "Enterprise requires GitHub Enterprise Cloud ($21/user extra), raising total cost to ~$60/user. Business at $19/user provides policy management, audit logs, and IP indemnity for most team compliance needs.",
    },
  ],
  "github_copilot:pro_plus": [
    {
      toolId: "github_copilot",
      planId: "pro",
      reason:
        "Pro+ at $39/mo pays off only above ~325 premium requests/month. Pro at $10 includes 300 requests — track overages for one month before upgrading.",
    },
  ],
  "chatgpt:enterprise": [
    {
      toolId: "chatgpt",
      planId: "business",
      reason:
        "Business at $20/seat (annual) provides SSO, SOC 2 compliance, and training-data exclusion. Enterprise is warranted only for EKM, SCIM, advanced analytics, or >500 seats.",
    },
  ],
  "claude:team_premium": [
    {
      toolId: "claude",
      planId: "team_standard",
      reason:
        "Team Premium at $125/seat includes Claude Code. If fewer than half your seats need Claude Code, mix Standard ($25) and Premium ($125) seats to reduce cost — Anthropic allows mixing within a plan.",
    },
  ],
  "claude:max_20x": [
    {
      toolId: "claude",
      planId: "max_5x",
      reason:
        "Max 20x at $200 is for developers running Claude Code agents all day on large codebases. Max 5x at $100 covers most power users — track whether you're hitting limits before upgrading.",
    },
  ],
  "gemini:workspace_plus": [
    {
      toolId: "gemini",
      planId: "workspace_standard",
      reason:
        "Business Plus at $22 adds Vault (eDiscovery), 500-participant meetings, and 5TB storage. Upgrade only if legal hold, compliance archival, or large all-hands meetings are a real requirement.",
    },
  ],
  "windsurf:teams": [
    {
      toolId: "windsurf",
      planId: "pro",
      reason:
        "Teams adds centralized billing and admin controls. For small teams without IT governance requirements, individual Pro seats at $20/user are $20/user cheaper with identical AI capability.",
    },
  ],
  "windsurf:max": [
    {
      toolId: "windsurf",
      planId: "pro",
      reason:
        "Max at $200/mo targets all-day heavy agentic workflows. Pro at $20 covers the majority of professional developers — only upgrade if hitting quota limits consistently.",
    },
  ],
};