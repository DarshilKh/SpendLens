import { v4 as uuidv4 } from "uuid";
import type {
  AuditFormData,
  AuditResult,
  BenchmarkData,
  ToolRecommendation,
  RecommendationType,
  RecommendationSeverity,
  ToolEntry,
  ToolId,
} from "@/types";
import {
  getToolById,
  getPlanById,
  INDUSTRY_BENCHMARKS,
  ALTERNATIVE_MAP,
} from "@/lib/pricing-data";
import { generateShareSlug } from "@/lib/utils";

// ─── Nuanced Plan Evaluation ──────────────────────────────────────────────────

interface PlanEvaluation {
  recommendationType: RecommendationType;
  severity: RecommendationSeverity;
  statusLabel: string;
  isActionable: boolean;
  betterPlanId?: string;
  betterPlanName?: string;
  recommendedCostPerSeat: number;
  reasoning: string;
  confidence: "high" | "medium" | "low";
}

function evaluatePlanFit(
  entry: ToolEntry,
  useCase: string,
  teamSize: number
): PlanEvaluation {
  const tool = getToolById(entry.toolId);
  const currentPlan = getPlanById(entry.toolId, entry.planId);

  if (!tool || !currentPlan) {
    return {
      recommendationType: "already_optimal",
      severity: "info",
      statusLabel: "Unknown",
      isActionable: false,
      recommendedCostPerSeat: entry.monthlySpend / Math.max(entry.seats, 1),
      reasoning: "Unable to evaluate — tool or plan data unavailable.",
      confidence: "low",
    };
  }

  const costPerSeat = currentPlan.monthlyPricePerSeat;
  const expectedTotal = costPerSeat * entry.seats;

  // ── Spend anomaly: reported vs expected ──────────────────────────────
  if (expectedTotal > 0 && entry.monthlySpend > expectedTotal * 1.25 && costPerSeat > 0) {
    const pctOver = Math.round(((entry.monthlySpend - expectedTotal) / expectedTotal) * 100);
    return {
      recommendationType: "slight_overprovision",
      severity: "warning",
      statusLabel: "Spend anomaly",
      isActionable: true,
      recommendedCostPerSeat: costPerSeat,
      reasoning: `Your reported spend of $${entry.monthlySpend}/mo is ${pctOver}% above the standard rate of $${expectedTotal}/mo for ${entry.seats} ${currentPlan.name} seat${entry.seats > 1 ? "s" : ""}. This typically indicates legacy pricing tiers, usage overages, or unadvertised add-ons. Request a line-item breakdown from ${tool.name} before your next renewal.`,
      confidence: "medium",
    };
  }

  // ══════════════════════════════════════════════
  // CURSOR
  // ══════════════════════════════════════════════
  if (tool.id === "cursor") {
    // Enterprise: only justified for 20+ devs with security/SSO requirements
    if (entry.planId === "enterprise") {
      if (entry.seats < 20) {
        const bizPlan = getPlanById("cursor", "business");
        if (bizPlan) {
          return {
            recommendationType: "enterprise_overkill",
            severity: "savings",
            statusLabel: "Enterprise overkill",
            isActionable: true,
            betterPlanId: "business",
            betterPlanName: "Business",
            recommendedCostPerSeat: bizPlan.monthlyPricePerSeat,
            reasoning: `Cursor Enterprise pricing justifies itself through custom deployment, dedicated SLAs, and security review — requirements that typically surface at 20+ engineers under compliance mandates. At ${entry.seats} seats, Cursor Business provides identical AI capabilities, team management, and SSO at a significantly lower rate.`,
            confidence: "high",
          };
        }
      }
      return {
        recommendationType: "strong_roi",
        severity: "optimal",
        statusLabel: "Well matched",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Cursor Enterprise is appropriate for your ${entry.seats}-seat engineering team. At this scale, the custom deployment options, security review process, and dedicated support provide measurable operational value.`,
        confidence: "high",
      };
    }

    // Business: justified at 8+ seats for the admin/policy value
    if (entry.planId === "business") {
      if (entry.seats < 5) {
        const proPlan = getPlanById("cursor", "pro");
        if (proPlan) {
          return {
            recommendationType: "slight_overprovision",
            severity: "savings",
            statusLabel: "Slight overprovision",
            isActionable: true,
            betterPlanId: "pro",
            betterPlanName: "Pro",
            recommendedCostPerSeat: proPlan.monthlyPricePerSeat,
            reasoning: `Cursor Business adds centralized billing, usage analytics, and admin controls — features that deliver ROI when managing 5+ developers across departments. With ${entry.seats} seat${entry.seats > 1 ? "s" : ""}, these controls add overhead without proportional benefit. Pro delivers the same AI performance at half the per-seat cost.`,
            confidence: "high",
          };
        }
      }
      if (entry.seats >= 5 && entry.seats < 8) {
        return {
          recommendationType: "minor_opportunity",
          severity: "info",
          statusLabel: "Minor opportunity",
          isActionable: true,
          recommendedCostPerSeat: costPerSeat,
          reasoning: `Cursor Business is a reasonable fit at ${entry.seats} seats. That said, if your team hasn't adopted the admin dashboard or centralized policy controls yet, you're paying for overhead you're not using. Confirm utilization before your next renewal — Pro may suffice.`,
          confidence: "medium",
        };
      }
      return {
        recommendationType: "strong_roi",
        severity: "optimal",
        statusLabel: "Well matched",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Cursor Business is well-matched for your ${entry.seats}-person engineering team. At this scale, centralized billing, usage controls, and team management features are active cost levers, not decorative features.`,
        confidence: "high",
      };
    }

    // Pro: the sweet spot for most teams
    if (entry.planId === "pro") {
      if (useCase === "writing" || useCase === "research") {
        return {
          recommendationType: "minor_opportunity",
          severity: "info",
          statusLabel: "Use case mismatch",
          isActionable: true,
          recommendedCostPerSeat: costPerSeat,
          reasoning: `Cursor Pro is purpose-built for code generation workflows. For primarily ${useCase} use cases, the 500 fast AI requests and code-focused context system deliver limited value. Claude Pro or ChatGPT Plus would provide better output quality per dollar for your workload.`,
          confidence: "medium",
        };
      }
      return {
        recommendationType: "already_optimal",
        severity: "optimal",
        statusLabel: "Optimized",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Cursor Pro is the right tier for your team. At $20/seat with unlimited completions and fast AI request access, it's the highest-value coding assistant tier for engineering teams without enterprise governance requirements.`,
        confidence: "high",
      };
    }
  }

  // ══════════════════════════════════════════════
  // GITHUB COPILOT
  // ══════════════════════════════════════════════
  if (tool.id === "github_copilot") {
    if (entry.planId === "enterprise") {
      if (entry.seats < 15) {
        const bizPlan = getPlanById("github_copilot", "business");
        if (bizPlan) {
          return {
            recommendationType: "enterprise_overkill",
            severity: "savings",
            statusLabel: "Enterprise overkill",
            isActionable: true,
            betterPlanId: "business",
            betterPlanName: "Business",
            recommendedCostPerSeat: bizPlan.monthlyPricePerSeat,
            reasoning: `Copilot Enterprise's personalized models are trained on your organization's codebase — but the quality improvement requires 15+ active engineers generating sufficient training data over 6+ months. Below that threshold, the model isn't meaningfully differentiated from Business. You're paying a $20/seat premium for a feature you can't yet utilize.`,
            confidence: "high",
          };
        }
      }
      if (entry.seats >= 15 && entry.seats < 30) {
        return {
          recommendationType: "minor_opportunity",
          severity: "info",
          statusLabel: "Early for Enterprise",
          isActionable: true,
          recommendedCostPerSeat: costPerSeat,
          reasoning: `Copilot Enterprise is a reasonable long-term investment at ${entry.seats} seats, but the personalized model benefits compound over time. If you've been on Enterprise less than 6 months, Business provides equivalent immediate value. Revisit after your first annual review with usage data.`,
          confidence: "medium",
        };
      }
      return {
        recommendationType: "strong_roi",
        severity: "optimal",
        statusLabel: "Strong ROI",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Copilot Enterprise is well-justified at ${entry.seats} seats. At this scale, the personalized model, PR summaries, and knowledge base integration deliver compounding productivity gains that more than offset the per-seat premium versus Business.`,
        confidence: "high",
      };
    }

    if (entry.planId === "business") {
      if (teamSize <= 3) {
        const indivPlan = getPlanById("github_copilot", "individual");
        if (indivPlan) {
          return {
            recommendationType: "slight_overprovision",
            severity: "savings",
            statusLabel: "Slight overprovision",
            isActionable: true,
            betterPlanId: "individual",
            betterPlanName: "Individual",
            recommendedCostPerSeat: indivPlan.monthlyPricePerSeat,
            reasoning: `Copilot Business adds policy management, audit logs, and IP indemnity — governance features that matter when managing a developer team centrally. For a ${teamSize}-person team without a dedicated security or compliance function, Individual plans at $10/seat provide the same coding performance at nearly half the cost.`,
            confidence: "high",
          };
        }
      }
      return {
        recommendationType: "already_optimal",
        severity: "optimal",
        statusLabel: "Well matched",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Copilot Business is the right tier for your team size. The policy management, audit logging, and IP indemnity features are appropriate at ${entry.seats} seats and provide governance value that Individual plans can't offer.`,
        confidence: "high",
      };
    }

    if (entry.planId === "individual") {
      if (teamSize > 10) {
        const bizPlan = getPlanById("github_copilot", "business");
        if (bizPlan) {
          return {
            recommendationType: "upgrade_recommended",
            severity: "info",
            statusLabel: "Consider upgrading",
            isActionable: true,
            betterPlanId: "business",
            betterPlanName: "Business",
            recommendedCostPerSeat: bizPlan.monthlyPricePerSeat,
            reasoning: `At ${teamSize} team members, Individual Copilot licenses become a compliance liability. Business adds IP indemnity, audit logs, and centralized policy controls — which are practically mandatory once you're building commercial software at this headcount.`,
            confidence: "medium",
          };
        }
      }
      return {
        recommendationType: "already_optimal",
        severity: "optimal",
        statusLabel: "Optimized",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Copilot Individual is cost-efficient for your team size. At $10/seat, it delivers full code completion, chat, and CLI integration without the governance overhead of Business.`,
        confidence: "high",
      };
    }
  }

  // ══════════════════════════════════════════════
  // CLAUDE
  // ══════════════════════════════════════════════
  if (tool.id === "claude") {
    if (entry.planId === "max") {
      const proPlan = getPlanById("claude", "pro");
      if (proPlan) {
        if (entry.seats > 3) {
          return {
            recommendationType: "slight_overprovision",
            severity: "savings",
            statusLabel: "Slight overprovision",
            isActionable: true,
            betterPlanId: "pro",
            betterPlanName: "Pro",
            recommendedCostPerSeat: proPlan.monthlyPricePerSeat,
            reasoning: `Claude Max ($100/seat) targets individual power users who routinely exhaust Pro's message windows. For ${entry.seats} seats across a team, usage patterns rarely sustain Max-level throughput per seat — the aggregate limit is shared, not multiplied. Claude Team at $30/seat provides pooled higher limits with workspace management at less than a third of the cost.`,
            confidence: "medium",
          };
        }
        if (useCase !== "coding" && useCase !== "data") {
          return {
            recommendationType: "slight_overprovision",
            severity: "savings",
            statusLabel: "Likely overprovisioned",
            isActionable: true,
            betterPlanId: "pro",
            betterPlanName: "Pro",
            recommendedCostPerSeat: proPlan.monthlyPricePerSeat,
            reasoning: `Claude Max's value proposition is sustained high-volume usage — developers running long agentic tasks or analysts processing large document batches. For ${useCase} workflows, Pro's limits (typically 45+ messages per session window) are rarely hit in practice. Downgrading saves $80/seat/month with negligible day-to-day difference.`,
            confidence: "medium",
          };
        }
      }
      return {
        recommendationType: "strong_roi",
        severity: "optimal",
        statusLabel: "Justified",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Claude Max is appropriate for your use case. High-throughput ${useCase} workflows regularly exhaust standard limits, and the 5× or 20× usage headroom translates directly to uninterrupted productivity.`,
        confidence: "medium",
      };
    }

    if (entry.planId === "team") {
      if (entry.seats === 1) {
        const proPlan = getPlanById("claude", "pro");
        if (proPlan) {
          return {
            recommendationType: "downgrade_plan",
            severity: "savings",
            statusLabel: "Team plan, solo usage",
            isActionable: true,
            betterPlanId: "pro",
            betterPlanName: "Pro",
            recommendedCostPerSeat: proPlan.monthlyPricePerSeat,
            reasoning: `Claude Team adds shared workspaces, admin controls, and usage management — features that require multiple users to generate value. At 1 seat, you're paying a $10/month team premium for features you can't utilize. Pro delivers identical model access and the same usage limits.`,
            confidence: "high",
          };
        }
      }
      if (entry.seats < 5) {
        return {
          recommendationType: "minor_opportunity",
          severity: "info",
          statusLabel: "Below minimum value threshold",
          isActionable: true,
          recommendedCostPerSeat: costPerSeat,
          reasoning: `Claude Team has a 5-seat minimum and is optimized for collaborative workspaces with shared projects and admin visibility. At ${entry.seats} seats, you're meeting the floor but not extracting full value from the tier's collaboration features. If your team isn't actively using shared Projects, individual Pro plans may be more cost-effective.`,
          confidence: "medium",
        };
      }
      return {
        recommendationType: "already_optimal",
        severity: "optimal",
        statusLabel: "Well matched",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Claude Team is well-suited for your ${entry.seats}-person team. The workspace management, shared projects, and higher usage pools are appropriate at this scale and provide measurable collaboration value.`,
        confidence: "high",
      };
    }

    if (entry.planId === "pro") {
      if (entry.seats > 8 && useCase !== "coding") {
        const teamPlan = getPlanById("claude", "team");
        if (teamPlan) {
          return {
            recommendationType: "upgrade_recommended",
            severity: "info",
            statusLabel: "Upgrade candidate",
            isActionable: true,
            betterPlanId: "team",
            betterPlanName: "Team",
            recommendedCostPerSeat: teamPlan.monthlyPricePerSeat,
            reasoning: `At ${entry.seats} Pro seats, you're at the scale where Claude Team ($30/seat) starts delivering structural value: shared Projects, admin-level usage visibility, and centralized billing. The $10/seat premium pays for itself in operational overhead reduction once you're managing 8+ users on a shared AI workflow.`,
            confidence: "medium",
          };
        }
      }
      return {
        recommendationType: "already_optimal",
        severity: "optimal",
        statusLabel: "Optimized",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Claude Pro is well-calibrated for your current usage. At $20/seat, it provides priority access and meaningful usage headroom above the free tier without the team overhead of a workspace plan.`,
        confidence: "high",
      };
    }

    if (entry.planId === "enterprise") {
      return {
        recommendationType: "strong_roi",
        severity: "optimal",
        statusLabel: "Enterprise justified",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Claude Enterprise is typically purchased for SSO, extended context windows, custom data retention policies, and compliance controls. These features carry real organizational value that justifies the premium over Team.`,
        confidence: "low",
      };
    }
  }

  // ══════════════════════════════════════════════
  // CHATGPT
  // ══════════════════════════════════════════════
  if (tool.id === "chatgpt") {
    if (entry.planId === "team") {
      if (entry.seats === 1) {
        const plusPlan = getPlanById("chatgpt", "plus");
        if (plusPlan) {
          return {
            recommendationType: "downgrade_plan",
            severity: "savings",
            statusLabel: "Team plan, solo usage",
            isActionable: true,
            betterPlanId: "plus",
            betterPlanName: "Plus",
            recommendedCostPerSeat: plusPlan.monthlyPricePerSeat,
            reasoning: `ChatGPT Team's workspace and admin features require multiple collaborators to generate value. At 1 seat, Plus delivers identical model access, longer context, and the same core capabilities at $10/month less.`,
            confidence: "high",
          };
        }
      }
      if (entry.seats >= 2) {
        return {
          recommendationType: "already_optimal",
          severity: "optimal",
          statusLabel: "Well matched",
          isActionable: false,
          recommendedCostPerSeat: costPerSeat,
          reasoning: `ChatGPT Team provides appropriate value at ${entry.seats} seats. The longer context windows, data privacy guarantees, and team workspace features are meaningfully better than Plus for collaborative use.`,
          confidence: "high",
        };
      }
    }

    if (entry.planId === "plus") {
      if (teamSize > 5) {
        const teamPlan = getPlanById("chatgpt", "team");
        if (teamPlan) {
          return {
            recommendationType: "upgrade_recommended",
            severity: "info",
            statusLabel: "Scale opportunity",
            isActionable: true,
            betterPlanId: "team",
            betterPlanName: "Team",
            recommendedCostPerSeat: teamPlan.monthlyPricePerSeat,
            reasoning: `At ${teamSize} users on ChatGPT Plus, you're missing the data privacy guarantees that Team provides — your conversations may be used for training on Plus. For a team of this size using AI for business work, Team's data isolation is worth the $10/seat premium.`,
            confidence: "medium",
          };
        }
      }
      return {
        recommendationType: "already_optimal",
        severity: "optimal",
        statusLabel: "Optimized",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `ChatGPT Plus is well-suited for your current scale. At $20/seat, it provides full GPT-4o access, Advanced Voice, and DALL-E with sufficient limits for individual professional use.`,
        confidence: "high",
      };
    }

    if (entry.planId === "enterprise") {
      if (entry.seats < 10) {
        const teamPlan = getPlanById("chatgpt", "team");
        if (teamPlan) {
          return {
            recommendationType: "enterprise_overkill",
            severity: "savings",
            statusLabel: "Enterprise overkill",
            isActionable: true,
            betterPlanId: "team",
            betterPlanName: "Team",
            recommendedCostPerSeat: teamPlan.monthlyPricePerSeat,
            reasoning: `ChatGPT Enterprise targets organizations with dedicated compliance, SSO, and custom GPT deployment requirements — typically 50+ users. At ${entry.seats} seats, Team provides equivalent AI performance and data privacy at roughly half the cost. Enterprise's custom model fine-tuning and admin analytics aren't cost-justified below this threshold.`,
            confidence: "high",
          };
        }
      }
      return {
        recommendationType: "strong_roi",
        severity: "optimal",
        statusLabel: "Well matched",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `ChatGPT Enterprise is appropriate at ${entry.seats} seats. The custom GPT deployment, unlimited usage caps, and enterprise admin controls deliver proportional value at this scale.`,
        confidence: "medium",
      };
    }
  }

  // ══════════════════════════════════════════════
  // GEMINI
  // ══════════════════════════════════════════════
  if (tool.id === "gemini") {
    if (entry.planId === "workspace") {
      if (useCase === "coding") {
        return {
          recommendationType: "potential_redundancy",
          severity: "warning",
          statusLabel: "Potential redundancy",
          isActionable: true,
          recommendedCostPerSeat: costPerSeat,
          reasoning: `Gemini in Workspace is optimized for Docs, Sheets, and Meet integration — not code generation. For a team primarily using AI for coding, you're likely paying $30/seat for features that complement your workflow without replacing a dedicated coding assistant. Evaluate whether the Workspace add-on is actively used versus simply included.`,
          confidence: "medium",
        };
      }
      return {
        recommendationType: "already_optimal",
        severity: "optimal",
        statusLabel: "Well matched",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Gemini Workspace is well-suited for ${useCase} workflows. Deep integration with Google Docs, Sheets, Slides, and Meet provides compounding value for teams already embedded in the Google ecosystem.`,
        confidence: "high",
      };
    }
    if (entry.planId === "advanced") {
      return {
        recommendationType: "already_optimal",
        severity: "optimal",
        statusLabel: "Reasonable",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Gemini Advanced at $19.99/seat provides competitive model access for the price. The inclusion of 2TB storage and NotebookLM+ makes it viable if your team has existing Google Workspace investment.`,
        confidence: "medium",
      };
    }
  }

  // ══════════════════════════════════════════════
  // WINDSURF
  // ══════════════════════════════════════════════
  if (tool.id === "windsurf") {
    if (entry.planId === "teams") {
      if (entry.seats < 5) {
        const proPlan = getPlanById("windsurf", "pro");
        if (proPlan) {
          return {
            recommendationType: "slight_overprovision",
            severity: "savings",
            statusLabel: "Below minimum value threshold",
            isActionable: true,
            betterPlanId: "pro",
            betterPlanName: "Pro",
            recommendedCostPerSeat: proPlan.monthlyPricePerSeat,
            reasoning: `Windsurf Teams adds admin analytics and team management for a 3-seat minimum. At ${entry.seats} seat${entry.seats > 1 ? "s" : ""}, the admin overhead isn't proportional — Pro delivers equivalent AI performance at $${proPlan.monthlyPricePerSeat}/seat without the team management layer you don't yet need.`,
            confidence: "high",
          };
        }
      }
      return {
        recommendationType: "already_optimal",
        severity: "optimal",
        statusLabel: "Well matched",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Windsurf Teams is appropriate at ${entry.seats} seats. The analytics and admin controls provide genuine value at this scale for engineering managers tracking AI tool adoption.`,
        confidence: "high",
      };
    }
    if (entry.planId === "pro") {
      return {
        recommendationType: "already_optimal",
        severity: "optimal",
        statusLabel: "Strong value",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Windsurf Pro at $15/seat is one of the best price-to-performance ratios in AI coding assistants. Unlimited prompts with Cascade's advanced models at this price point represents strong value versus Cursor Pro at $20/seat.`,
        confidence: "high",
      };
    }
  }

  // ─── Default: optimal ────────────────────────────────────────────────────
  return {
    recommendationType: "already_optimal",
    severity: "optimal",
    statusLabel: "Well matched",
    isActionable: false,
    recommendedCostPerSeat: costPerSeat,
    reasoning: `${tool.name} ${currentPlan.name} is well-matched to your team's profile. No significant optimization opportunity identified at current usage patterns.`,
    confidence: "high",
  };
}

// ─── Credits Evaluation ───────────────────────────────────────────────────────

function evaluateCredits(entry: ToolEntry): {
  suggest: boolean;
  discount: number;
  reasoning: string;
} {
  const isApiTool = entry.toolId === "anthropic_api" || entry.toolId === "openai_api";
  if (!isApiTool || entry.monthlySpend < 200) {
    return { suggest: false, discount: 0, reasoning: "" };
  }

  const discount = entry.monthlySpend >= 1000 ? 0.35 : entry.monthlySpend >= 500 ? 0.30 : 0.25;
  const toolName = entry.toolId === "anthropic_api" ? "Anthropic" : "OpenAI";

  return {
    suggest: true,
    discount,
    reasoning: `At $${entry.monthlySpend}/mo in ${toolName} API spend, you qualify for pre-purchased credit discounts of ${Math.round(discount * 100)}% below retail rates. Credits are purchased in advance from companies that over-forecasted usage — same API, same models, meaningfully lower cost. The discount compounds significantly at your volume: ${Math.round(entry.monthlySpend * discount * 12).toLocaleString()} in annual savings.`,
  };
}

// ─── Alternatives Evaluation ──────────────────────────────────────────────────

function evaluateAlternatives(entry: ToolEntry, useCase: string): {
  hasAlternative: boolean;
  altToolId?: string;
  altPlanId?: string;
  altToolName?: string;
  altPlanName?: string;
  altCostPerSeat: number;
  reason: string;
} {
  const altKey = `${entry.toolId}:${entry.planId}`;
  const alts = ALTERNATIVE_MAP[altKey];
  if (!alts?.length) return { hasAlternative: false, altCostPerSeat: 0, reason: "" };

  const alt = alts[0];
  const altTool = getToolById(alt.toolId);
  const altPlan = getPlanById(alt.toolId, alt.planId);
  if (!altTool || !altPlan) return { hasAlternative: false, altCostPerSeat: 0, reason: "" };

  const currentPlan = getPlanById(entry.toolId, entry.planId);
  const currentCostPerSeat = currentPlan?.monthlyPricePerSeat ?? 0;
  const savings = currentCostPerSeat - altPlan.monthlyPricePerSeat;

  if (savings < currentCostPerSeat * 0.15) {
    return { hasAlternative: false, altCostPerSeat: altPlan.monthlyPricePerSeat, reason: "" };
  }

  return {
    hasAlternative: true,
    altToolId: alt.toolId,
    altPlanId: alt.planId,
    altToolName: altTool.name,
    altPlanName: altPlan.name,
    altCostPerSeat: altPlan.monthlyPricePerSeat,
    reason: alt.reason,
  };
}

// ─── Main Audit Engine ────────────────────────────────────────────────────────

export function runAuditEngine(
  formData: AuditFormData
): Omit<AuditResult, "aiSummary" | "aiSummaryFallback"> {
  const { tools, teamSize, useCase } = formData;

  const recommendations: ToolRecommendation[] = tools.map((entry) => {
    const tool = getToolById(entry.toolId);
    const plan = getPlanById(entry.toolId, entry.planId);

    if (!tool || !plan) {
      return {
        toolEntryId: entry.id,
        toolId: entry.toolId,
        toolName: entry.toolId,
        currentPlanName: entry.planId,
        currentMonthlyCost: entry.monthlySpend,
        recommendationType: "already_optimal" as RecommendationType,
        severity: "info" as RecommendationSeverity,
        statusLabel: "Unknown",
        recommendedAction: "Tool data unavailable.",
        recommendedMonthlyCost: entry.monthlySpend,
        monthlySavings: 0,
        annualSavings: 0,
        reasoning: "Tool or plan not found in pricing database.",
        credexRelevant: false,
        confidence: "low",
      };
    }

    const planEval = evaluatePlanFit(entry, useCase, teamSize);
    const creditsEval = evaluateCredits(entry);
    const altEval = evaluateAlternatives(entry, useCase);

    // Priority: credits > plan downgrade > alternative tool > plan eval result
    let recommendationType: RecommendationType = planEval.recommendationType;
    let severity: RecommendationSeverity = planEval.severity;
    let statusLabel = planEval.statusLabel;
    let recommendedMonthlyCost = planEval.isActionable && planEval.betterPlanId
      ? planEval.recommendedCostPerSeat * entry.seats
      : entry.monthlySpend;
    let recommendedAction = "";
    let reasoning = planEval.reasoning;
    let recommendedToolId: string | undefined;
    let recommendedPlanId: string | undefined;
    let credexRelevant = false;

    if (creditsEval.suggest) {
      recommendedMonthlyCost = entry.monthlySpend * (1 - creditsEval.discount);
      recommendationType = "add_credits";
      severity = "savings";
      statusLabel = "Credits opportunity";
      recommendedAction = `Switch to pre-purchased ${tool.name} credits`;
      reasoning = creditsEval.reasoning;
      credexRelevant = true;
    } else if (planEval.isActionable && planEval.betterPlanId) {
      const betterCost = planEval.recommendedCostPerSeat * entry.seats;
      recommendedMonthlyCost = betterCost;
      recommendedPlanId = planEval.betterPlanId;
      recommendedAction = planEval.recommendationType === "upgrade_recommended"
        ? `Consider upgrading to ${tool.name} ${planEval.betterPlanName}`
        : `Switch to ${tool.name} ${planEval.betterPlanName}`;
    } else if (altEval.hasAlternative && altEval.altToolId && altEval.altPlanId) {
      const altCost = altEval.altCostPerSeat * entry.seats;
      if (altCost < entry.monthlySpend) {
        recommendedMonthlyCost = altCost;
        recommendationType = "switch_tool";
        severity = "savings";
        statusLabel = "Better alternative";
        recommendedToolId = altEval.altToolId as ToolId;
        recommendedPlanId = altEval.altPlanId;
        recommendedAction = `Consider switching to ${altEval.altToolName} ${altEval.altPlanName}`;
        reasoning = altEval.reason;
      } else {
        recommendedAction = "Spend is well-optimized";
      }
    } else {
      recommendedMonthlyCost = entry.monthlySpend;
      recommendedAction = planEval.isActionable
        ? `Review ${tool.name} usage patterns`
        : "Spend is well-optimized";
    }

    const monthlySavings = Math.max(0, entry.monthlySpend - recommendedMonthlyCost);
    const annualSavings = monthlySavings * 12;

    return {
      toolEntryId: entry.id,
      toolId: entry.toolId,
      toolName: tool.name,
      currentPlanName: plan.name,
      currentMonthlyCost: entry.monthlySpend,
      recommendationType,
      severity,
      statusLabel,
      recommendedAction,
      recommendedToolId: recommendedToolId as ToolId | undefined,
      recommendedPlanId,
      recommendedMonthlyCost,
      monthlySavings,
      annualSavings,
      reasoning,
      credexRelevant,
      confidence: planEval.confidence,
    };
  });

  // ─── Aggregates ───────────────────────────────────────────────────────────
  const totalCurrentMonthlySpend = recommendations.reduce(
    (s, r) => s + r.currentMonthlyCost, 0
  );
  const totalRecommendedMonthlySpend = recommendations.reduce(
    (s, r) => s + r.recommendedMonthlyCost, 0
  );
  const totalMonthlySavings = Math.max(0, totalCurrentMonthlySpend - totalRecommendedMonthlySpend);
  const totalAnnualSavings = totalMonthlySavings * 12;
  const savingsPercentage =
    totalCurrentMonthlySpend > 0
      ? Math.round((totalMonthlySavings / totalCurrentMonthlySpend) * 100)
      : 0;

  const isAlreadyOptimal = recommendations.every(
    (r) => r.monthlySavings === 0 && r.severity === "optimal"
  );
  const highSavingsCase = totalMonthlySavings >= 500;

  // ─── Benchmark ────────────────────────────────────────────────────────────
  const spendPerDeveloper =
    teamSize > 0 ? totalCurrentMonthlySpend / teamSize : totalCurrentMonthlySpend;
  const bucket =
    teamSize <= 10
      ? INDUSTRY_BENCHMARKS.small
      : teamSize <= 50
      ? INDUSTRY_BENCHMARKS.medium
      : INDUSTRY_BENCHMARKS.large;

  const rawPct =
    ((spendPerDeveloper - bucket.p25) / Math.max(bucket.p75 - bucket.p25, 1)) * 50 + 50;
  const percentile = Math.max(0, Math.min(100, Math.round(rawPct)));

  const benchmark: BenchmarkData = {
    spendPerDeveloper: Math.round(spendPerDeveloper),
    industryAveragePerDeveloper: bucket.avg,
    percentile,
    label:
      spendPerDeveloper < bucket.p25
        ? "below industry average"
        : spendPerDeveloper > bucket.p75
        ? "above industry average"
        : "within industry norms",
  };

  return {
    id: uuidv4(),
    formData,
    recommendations,
    totalCurrentMonthlySpend,
    totalRecommendedMonthlySpend,
    totalMonthlySavings,
    totalAnnualSavings,
    savingsPercentage,
    isAlreadyOptimal,
    highSavingsCase,
    benchmark,
    createdAt: new Date().toISOString(),
    shareSlug: generateShareSlug(),
  };
}
