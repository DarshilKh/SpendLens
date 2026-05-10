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

const seatPhrase = (seats: number): string =>
  `${seats}-seat deployment`;

const seatsCurrentlyAssigned = (seats: number): string =>
  `the ${seats} ${seats === 1 ? "seat" : "seats"} currently assigned`;

const seatsCurrentlyProvisioned = (seats: number): string =>
  `${seats} ${seats === 1 ? "seat" : "seats"} currently provisioned`;

const atSeatCount = (seats: number): string =>
  `at your current ${seatPhrase(seats)}`;

const capitalize = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1);

// ─── Plan Evaluation ──────────────────────────────────────────────────────────

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

  // ════════════════════════════════════════════════════════════════════
  // CURSOR — IDs: hobby, pro, pro_plus, ultra, teams, enterprise
  // ════════════════════════════════════════════════════════════════════
  if (tool.id === "cursor") {
    // Enterprise: 20+ engineers under compliance mandates
    if (entry.planId === "enterprise") {
      if (entry.seats < 20) {
        const teamsPlan = getPlanById("cursor", "teams");
        if (teamsPlan) {
          return {
            recommendationType: "enterprise_overkill",
            severity: "savings",
            statusLabel: "Enterprise overkill",
            isActionable: true,
            betterPlanId: "teams",
            betterPlanName: "Teams",
            recommendedCostPerSeat: teamsPlan.monthlyPricePerSeat,
            reasoning: `Cursor Enterprise pricing justifies itself through pooled org usage, custom deployment, dedicated SLAs, and security review — requirements that typically surface at 20+ engineers under compliance mandates. ${capitalize(atSeatCount(entry.seats))}, Cursor Teams provides identical AI capabilities, centralized billing, and SSO at $40/seat — significantly less than Enterprise.`,
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
        reasoning: `Cursor Enterprise is appropriate ${atSeatCount(entry.seats)}. At this scale, pooled org usage, custom deployment options, and dedicated support provide measurable operational value.`,
        confidence: "high",
      };
    }

    // Teams: justified at 5+ seats for centralized billing/SSO value
    if (entry.planId === "teams") {
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
            reasoning: `Cursor Teams adds centralized billing, SSO, usage analytics, and admin controls — features that deliver ROI when managing 5+ developers across departments. With ${seatsCurrentlyProvisioned(entry.seats)}, these controls add overhead without proportional benefit. Pro at $20/seat delivers the same AI performance at half the per-seat cost.`,
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
          reasoning: `Cursor Teams is a reasonable fit ${atSeatCount(entry.seats)}. That said, if your team hasn't adopted the admin dashboard or centralized policy controls yet, you're paying for overhead you're not using. Confirm utilization before your next renewal — Pro may suffice.`,
          confidence: "medium",
        };
      }
      return {
        recommendationType: "strong_roi",
        severity: "optimal",
        statusLabel: "Well matched",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Cursor Teams is well-matched for ${seatsCurrentlyAssigned(entry.seats)}. At this scale, centralized billing, usage controls, and SSO are active cost levers, not decorative features.`,
        confidence: "high",
      };
    }

    // Ultra: justified only for sustained heavy usage
    if (entry.planId === "ultra") {
      const proPlusPlan = getPlanById("cursor", "pro_plus");
      if (proPlusPlan) {
        return {
          recommendationType: "slight_overprovision",
          severity: "savings",
          statusLabel: "Likely overprovisioned",
          isActionable: true,
          betterPlanId: "pro_plus",
          betterPlanName: "Pro+",
          recommendedCostPerSeat: proPlusPlan.monthlyPricePerSeat,
          reasoning: `Cursor Ultra at $200/seat targets developers running parallel background agents and exhausting Pro+'s 3× usage pool daily. Pro+ at $60/seat covers the vast majority of heavy users — only upgrade if monthly credit overages on Pro+ consistently exceed $40. ${capitalize(atSeatCount(entry.seats))}, the $140/seat premium rarely pays off.`,
          confidence: "medium",
        };
      }
    }

    // Pro+: justified for users hitting Pro's $20 credit pool
    if (entry.planId === "pro_plus") {
      const proPlan = getPlanById("cursor", "pro");
      if (proPlan && useCase !== "coding") {
        return {
          recommendationType: "slight_overprovision",
          severity: "savings",
          statusLabel: "Use case mismatch",
          isActionable: true,
          betterPlanId: "pro",
          betterPlanName: "Pro",
          recommendedCostPerSeat: proPlan.monthlyPricePerSeat,
          reasoning: `Cursor Pro+ at $60/seat provides 3× the credit pool of Pro — valuable for sustained code generation workflows. For ${useCase} use cases, you're unlikely to exhaust Pro's $20 monthly credit pool. Downgrading saves $40/seat/month with negligible day-to-day difference.`,
          confidence: "medium",
        };
      }
      return {
        recommendationType: "already_optimal",
        severity: "optimal",
        statusLabel: "Justified",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Cursor Pro+ is appropriate for sustained coding workflows. The 3× usage pool ($60 vs $20) handles most heavy-usage patterns without overage charges.`,
        confidence: "medium",
      };
    }

    // Pro: the sweet spot
    if (entry.planId === "pro") {
      if (useCase === "writing" || useCase === "research") {
        return {
          recommendationType: "minor_opportunity",
          severity: "info",
          statusLabel: "Use case mismatch",
          isActionable: true,
          recommendedCostPerSeat: costPerSeat,
          reasoning: `Cursor Pro is purpose-built for code generation workflows. For primarily ${useCase} use cases, the $20 credit pool and code-focused context system deliver limited value. Claude Pro or ChatGPT Plus would provide better output quality per dollar for your workload.`,
          confidence: "medium",
        };
      }
      return {
        recommendationType: "already_optimal",
        severity: "optimal",
        statusLabel: "Optimized",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Cursor Pro is the right tier ${atSeatCount(entry.seats)}. At $20/seat with unlimited Tab completions and frontier model access, it's the highest-value coding assistant tier for engineering teams without enterprise governance requirements.`,
        confidence: "high",
      };
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // GITHUB COPILOT — IDs: free, pro, pro_plus, business, enterprise
  // ════════════════════════════════════════════════════════════════════
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
            reasoning: `Copilot Enterprise's personalized models (trained on your codebase) require 15+ active engineers and 6+ months of usage data to differentiate from Business. With ${seatsCurrentlyProvisioned(entry.seats)}, the model isn't meaningfully tuned. Enterprise also requires GitHub Enterprise Cloud (+$21/user) — bringing the effective cost to ~$60/seat. Business at $19/seat provides equivalent value with audit logs, IP indemnity, and SAML SSO.`,
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
          reasoning: `Copilot Enterprise is a reasonable long-term investment ${atSeatCount(entry.seats)}, but factor in the GitHub Enterprise Cloud requirement (+$21/user). Effective per-seat cost is ~$60. If you've been on Enterprise less than 6 months, Business at $19 provides equivalent immediate value. Revisit after annual usage review.`,
          confidence: "medium",
        };
      }
      return {
        recommendationType: "strong_roi",
        severity: "optimal",
        statusLabel: "Strong ROI",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Copilot Enterprise is well-justified ${atSeatCount(entry.seats)}. At this scale, personalized models, knowledge base integration, and PR summaries deliver compounding productivity gains that offset the $39 + $21 GitHub Enterprise Cloud cost.`,
        confidence: "high",
      };
    }

    // Pro+: justified above ~325 premium requests/mo
    if (entry.planId === "pro_plus") {
      const proPlan = getPlanById("github_copilot", "pro");
      if (proPlan) {
        return {
          recommendationType: "minor_opportunity",
          severity: "info",
          statusLabel: "Verify usage",
          isActionable: true,
          betterPlanId: "pro",
          betterPlanName: "Pro",
          recommendedCostPerSeat: proPlan.monthlyPricePerSeat,
          reasoning: `Copilot Pro+ at $39/seat unlocks 1,500 premium requests/month versus Pro's 300. The break-even is ~325 requests — track one month of usage before committing. If you're consistently under that threshold, Pro at $10/seat delivers the same code completion and IDE chat experience for $29 less per seat.`,
          confidence: "medium",
        };
      }
    }

    if (entry.planId === "business") {
      if (teamSize <= 3) {
        const proPlan = getPlanById("github_copilot", "pro");
        if (proPlan) {
          return {
            recommendationType: "slight_overprovision",
            severity: "savings",
            statusLabel: "Slight overprovision",
            isActionable: true,
            betterPlanId: "pro",
            betterPlanName: "Pro",
            recommendedCostPerSeat: proPlan.monthlyPricePerSeat,
            reasoning: `Copilot Business adds policy management, audit logs, and IP indemnity — governance features that matter when managing a developer team centrally. For a ${teamSize}-person team without a dedicated security or compliance function, Pro plans at $10/seat provide the same coding performance at nearly half the cost.`,
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
        reasoning: `Copilot Business is the right tier ${atSeatCount(entry.seats)}. The policy management, audit logging, and IP indemnity features provide governance value that Pro plans can't offer.`,
        confidence: "high",
      };
    }

    if (entry.planId === "pro") {
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
            reasoning: `At a ${teamSize}-person org, Pro Copilot licenses become a compliance liability. Business at $19/seat adds IP indemnity, audit logs, and centralized policy controls — practically mandatory once you're building commercial software at this headcount.`,
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
        reasoning: `Copilot Pro is cost-efficient ${atSeatCount(entry.seats)}. At $10/seat, it delivers unlimited code completions, 300 premium requests, and full IDE integration without the governance overhead of Business.`,
        confidence: "high",
      };
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // CLAUDE — IDs: free, pro, max_5x, max_20x, team_standard,
  //              team_premium, enterprise, api_direct
  // ════════════════════════════════════════════════════════════════════
  if (tool.id === "claude") {
    // Max 20×: rare justification
    if (entry.planId === "max_20x") {
      const max5xPlan = getPlanById("claude", "max_5x");
      if (max5xPlan) {
        return {
          recommendationType: "slight_overprovision",
          severity: "savings",
          statusLabel: "Likely overprovisioned",
          isActionable: true,
          betterPlanId: "max_5x",
          betterPlanName: "Max 5×",
          recommendedCostPerSeat: max5xPlan.monthlyPricePerSeat,
          reasoning: `Claude Max 20× at $200/seat targets developers running Claude Code agents all day on large codebases. Max 5× at $100/seat covers most power users. Track whether you're consistently hitting Max 5× limits before committing to the 2× premium — the $100/seat savings adds up fast across multiple seats.`,
          confidence: "medium",
        };
      }
    }

    // Max 5×: justified for sustained heavy usage
    if (entry.planId === "max_5x") {
      const proPlan = getPlanById("claude", "pro");
      if (proPlan && entry.seats > 3) {
        return {
          recommendationType: "slight_overprovision",
          severity: "savings",
          statusLabel: "Slight overprovision",
          isActionable: true,
          betterPlanId: "pro",
          betterPlanName: "Pro",
          recommendedCostPerSeat: proPlan.monthlyPricePerSeat,
          reasoning: `Claude Max 5× at $100/seat targets individual power users who routinely exhaust Pro's message windows. Across ${seatsCurrentlyProvisioned(entry.seats)}, usage rarely sustains Max-level throughput per seat. Claude Team Standard at $25/seat or Pro at $20/seat would deliver equivalent value at a fraction of the cost.`,
          confidence: "medium",
        };
      }
      if (proPlan && useCase !== "coding" && useCase !== "data") {
        return {
          recommendationType: "slight_overprovision",
          severity: "savings",
          statusLabel: "Likely overprovisioned",
          isActionable: true,
          betterPlanId: "pro",
          betterPlanName: "Pro",
          recommendedCostPerSeat: proPlan.monthlyPricePerSeat,
          reasoning: `Claude Max 5×'s value proposition is sustained high-volume usage — developers running long agentic tasks or analysts processing large document batches. For ${useCase} workflows, Pro's limits are rarely hit in practice. Downgrading saves $80/seat/month with negligible day-to-day difference.`,
          confidence: "medium",
        };
      }
      return {
        recommendationType: "strong_roi",
        severity: "optimal",
        statusLabel: "Justified",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Claude Max 5× is appropriate for your use case. High-throughput ${useCase} workflows regularly exhaust Pro's limits, and the 5× usage headroom translates directly to uninterrupted productivity.`,
        confidence: "medium",
      };
    }

    // Team Premium: justified only when most seats need Claude Code
    if (entry.planId === "team_premium") {
      const teamStandardPlan = getPlanById("claude", "team_standard");
      if (teamStandardPlan) {
        return {
          recommendationType: "minor_opportunity",
          severity: "info",
          statusLabel: "Optimize seat mix",
          isActionable: true,
          betterPlanId: "team_standard",
          betterPlanName: "Team Standard",
          recommendedCostPerSeat: teamStandardPlan.monthlyPricePerSeat,
          reasoning: `Claude Team Premium at $125/seat includes Claude Code and Cowork. If fewer than half your ${entry.seats} seats actively use Claude Code, mix Standard ($25) and Premium ($125) seats to reduce cost — Anthropic allows mixing within a Team plan. The $100/seat differential adds up quickly.`,
          confidence: "medium",
        };
      }
    }

    // Team Standard: well-suited for collaborative teams 5+
    if (entry.planId === "team_standard") {
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
            reasoning: `Claude Team Standard adds shared workspaces, admin controls, and SSO — features that require multiple users to generate value. With only 1 seat assigned, you're paying a $5/month team premium for features you can't utilize. Pro at $20/seat delivers identical model access.`,
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
          reasoning: `Claude Team has a 5-seat minimum and is optimized for collaborative workspaces with shared projects, SSO, and central billing. With ${seatsCurrentlyProvisioned(entry.seats)}, you're meeting the floor but not extracting full value. If your team isn't actively using shared Projects or SSO, individual Pro plans may be more cost-effective.`,
          confidence: "medium",
        };
      }
      return {
        recommendationType: "already_optimal",
        severity: "optimal",
        statusLabel: "Well matched",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Claude Team Standard is well-suited for ${seatsCurrentlyAssigned(entry.seats)}. At $25/seat, the SSO, central billing, Microsoft 365 + Slack integrations, and 200K context window are appropriate at this deployment size and provide measurable collaboration value.`,
        confidence: "high",
      };
    }

    // Pro: the sweet spot for individual professional use
    if (entry.planId === "pro") {
      if (entry.seats > 8 && useCase !== "coding") {
        const teamPlan = getPlanById("claude", "team_standard");
        if (teamPlan) {
          return {
            recommendationType: "upgrade_recommended",
            severity: "info",
            statusLabel: "Upgrade candidate",
            isActionable: true,
            betterPlanId: "team_standard",
            betterPlanName: "Team Standard",
            recommendedCostPerSeat: teamPlan.monthlyPricePerSeat,
            reasoning: `With ${seatsCurrentlyProvisioned(entry.seats)} on Pro at $20/seat, you're at the scale where Claude Team Standard at $25/seat starts delivering structural value: SSO, shared Projects, admin-level usage visibility, central billing, and Microsoft 365/Slack integrations. The $5/seat premium pays for itself in operational overhead reduction.`,
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
        reasoning: `Claude Pro is well-calibrated for your current usage. At $20/seat, it provides Opus 4.6 + Sonnet 4.6 access, Claude Code, and 5× the usage of Free without the team overhead of a workspace plan.`,
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
        reasoning: `Claude Enterprise is purchased for SSO, SCIM, audit logs, custom data retention, 500K context window, HIPAA readiness, and 99.99% SLA. These features carry real organizational value and require annual contracts — only worth evaluating at 50+ seats with compliance requirements.`,
        confidence: "low",
      };
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // CHATGPT — IDs: free, plus, pro, business, enterprise, api_direct
  // ════════════════════════════════════════════════════════════════════
  if (tool.id === "chatgpt") {
    // Pro: $200/seat — only for unlimited reasoning model usage
    if (entry.planId === "pro") {
      const plusPlan = getPlanById("chatgpt", "plus");
      if (plusPlan) {
        return {
          recommendationType: "slight_overprovision",
          severity: "savings",
          statusLabel: "Likely overprovisioned",
          isActionable: true,
          betterPlanId: "plus",
          betterPlanName: "Plus",
          recommendedCostPerSeat: plusPlan.monthlyPricePerSeat,
          reasoning: `ChatGPT Pro at $200/seat is justified only for users running unlimited GPT-5.5, o3, and o4-mini-high reasoning models with 1M token context daily. For typical professional use, Plus at $20/seat delivers the same GPT-5.5/5.4 access, Deep Research, DALL-E, and Agent Mode at 10% of the cost.`,
          confidence: "medium",
        };
      }
    }

    // Business: most teams' sweet spot
    if (entry.planId === "business") {
      if (entry.seats === 1) {
        const plusPlan = getPlanById("chatgpt", "plus");
        if (plusPlan) {
          return {
            recommendationType: "downgrade_plan",
            severity: "savings",
            statusLabel: "Business plan, solo usage",
            isActionable: true,
            betterPlanId: "plus",
            betterPlanName: "Plus",
            recommendedCostPerSeat: plusPlan.monthlyPricePerSeat,
            reasoning: `ChatGPT Business's workspace, SSO, and admin features require multiple collaborators to generate value. With only 1 seat assigned, Plus at $20/seat delivers identical model access and core capabilities — the Business premium adds nothing for solo use.`,
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
          reasoning: `ChatGPT Business provides excellent value ${atSeatCount(entry.seats)}. At $20/seat (annual) or $25/seat (monthly), you get shared workspaces, SAML SSO, SOC 2 Type II compliance, 60+ app integrations (Slack, Drive, GitHub), and training-data exclusion — meaningfully better than Plus for collaborative use.`,
          confidence: "high",
        };
      }
    }

    // Plus: solid for individuals
    if (entry.planId === "plus") {
      if (teamSize > 5) {
        const businessPlan = getPlanById("chatgpt", "business");
        if (businessPlan) {
          return {
            recommendationType: "upgrade_recommended",
            severity: "info",
            statusLabel: "Scale opportunity",
            isActionable: true,
            betterPlanId: "business",
            betterPlanName: "Business",
            recommendedCostPerSeat: businessPlan.monthlyPricePerSeat,
            reasoning: `Across a ${teamSize}-person org on ChatGPT Plus, you're missing the data privacy guarantees, SSO, and admin controls that Business provides. Business is now $20/seat (annual) — the same price as Plus — with training-data exclusion, SAML SSO, and 60+ app integrations. Strict upgrade with no cost penalty.`,
            confidence: "high",
          };
        }
      }
      return {
        recommendationType: "already_optimal",
        severity: "optimal",
        statusLabel: "Optimized",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `ChatGPT Plus is well-suited for your current scale. At $20/seat, it provides full GPT-5.5 + GPT-5.4 access, Deep Research, DALL-E image generation, Agent Mode, and Custom GPTs.`,
        confidence: "high",
      };
    }

    // Enterprise: justified only at scale or specialized compliance needs
    if (entry.planId === "enterprise") {
      if (entry.seats < 10) {
        const businessPlan = getPlanById("chatgpt", "business");
        if (businessPlan) {
          return {
            recommendationType: "enterprise_overkill",
            severity: "savings",
            statusLabel: "Enterprise overkill",
            isActionable: true,
            betterPlanId: "business",
            betterPlanName: "Business",
            recommendedCostPerSeat: businessPlan.monthlyPricePerSeat,
            reasoning: `ChatGPT Enterprise targets organizations with EKM, SCIM, advanced analytics, and 500+ seats — typically requiring annual contracts. With ${seatsCurrentlyProvisioned(entry.seats)}, Business at $20/seat (annual) provides equivalent SSO, training-data exclusion, and SOC 2 compliance at roughly one-third the cost.`,
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
        reasoning: `ChatGPT Enterprise is appropriate ${atSeatCount(entry.seats)}. The unlimited GPT-5.4, custom data retention, EKM, SCIM, role-based access, and dedicated support deliver proportional value at this scale.`,
        confidence: "medium",
      };
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // GEMINI — IDs: free, ai_plus, ai_pro, ai_ultra,
  //              workspace_standard, workspace_plus, api
  // ════════════════════════════════════════════════════════════════════
  if (tool.id === "gemini") {
    // AI Ultra: $250/seat — rare justification
    if (entry.planId === "ai_ultra") {
      const aiProPlan = getPlanById("gemini", "ai_pro");
      if (aiProPlan) {
        return {
          recommendationType: "slight_overprovision",
          severity: "savings",
          statusLabel: "Likely overprovisioned",
          isActionable: true,
          betterPlanId: "ai_pro",
          betterPlanName: "Google AI Pro",
          recommendedCostPerSeat: aiProPlan.monthlyPricePerSeat,
          reasoning: `Google AI Ultra at $249.99/seat targets users running Deep Think 3.1 daily and 120 Deep Research queries per day. AI Pro at $19.99/seat covers Gemini 3.1 Pro (1M token context), 100 Pro prompts/day, and NotebookLM Plus — sufficient for the vast majority of professional use. The $230/seat differential rarely pays off.`,
          confidence: "medium",
        };
      }
    }

    // Workspace Plus: justified only for legal/compliance/large meetings
    if (entry.planId === "workspace_plus") {
      const workspaceStdPlan = getPlanById("gemini", "workspace_standard");
      if (workspaceStdPlan) {
        return {
          recommendationType: "minor_opportunity",
          severity: "info",
          statusLabel: "Verify need",
          isActionable: true,
          betterPlanId: "workspace_standard",
          betterPlanName: "Workspace Business Standard",
          recommendedCostPerSeat: workspaceStdPlan.monthlyPricePerSeat,
          reasoning: `Workspace Business Plus at $22/seat adds Vault (eDiscovery), 5 TB storage, 500-participant meetings, and enhanced security. Upgrade only if legal hold, compliance archival, or large all-hands meetings are an active requirement. Otherwise, Standard at $14/seat includes the same Gemini AI bundled across all Workspace apps.`,
          confidence: "medium",
        };
      }
    }

    // Workspace Standard: solid baseline for Workspace teams
    if (entry.planId === "workspace_standard") {
      if (useCase === "coding") {
        return {
          recommendationType: "potential_redundancy",
          severity: "warning",
          statusLabel: "Use case mismatch",
          isActionable: true,
          recommendedCostPerSeat: costPerSeat,
          reasoning: `Workspace Business Standard at $14/seat bundles Gemini for Docs, Sheets, and Meet integration — not code generation. For a team primarily using AI for coding, Cursor Pro or GitHub Copilot delivers materially better output for less cost. Keep Workspace for productivity apps if you need Drive/Meet, but supplement with a dedicated coding assistant.`,
          confidence: "medium",
        };
      }
      return {
        recommendationType: "already_optimal",
        severity: "optimal",
        statusLabel: "Well matched",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Workspace Business Standard at $14/seat is well-suited for ${useCase} workflows. Gemini AI is now bundled across Docs, Sheets, Slides, Meet, and Drive — previously requiring a $20–30 add-on. Strong value for Workspace-embedded teams.`,
        confidence: "high",
      };
    }

    // AI Pro: standalone Gemini for individuals
    if (entry.planId === "ai_pro") {
      return {
        recommendationType: "already_optimal",
        severity: "optimal",
        statusLabel: "Reasonable",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Google AI Pro at $19.99/seat provides Gemini 3.1 Pro with 1M token context, ~100 Pro prompts/day, NotebookLM Plus, Veo 3.1 Lite video generation, and Deep Research. Competitive value if your team uses Gemini standalone — note Workspace Business Standard at $14 includes Gemini bundled if you also need Drive/Docs.`,
        confidence: "medium",
      };
    }

    // AI Plus: entry-level paid tier
    if (entry.planId === "ai_plus") {
      return {
        recommendationType: "already_optimal",
        severity: "optimal",
        statusLabel: "Optimized",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Google AI Plus at $7.99/seat is a strong entry-level tier — 128K context, 200 monthly AI credits, expanded NotebookLM, and 200 GB storage. Right-sized for occasional Gemini use beyond the Free tier.`,
        confidence: "high",
      };
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // WINDSURF — IDs: free, pro, max, teams, enterprise
  // ════════════════════════════════════════════════════════════════════
  if (tool.id === "windsurf") {
    // Max: $200/seat — rare justification
    if (entry.planId === "max") {
      const proPlan = getPlanById("windsurf", "pro");
      if (proPlan) {
        return {
          recommendationType: "slight_overprovision",
          severity: "savings",
          statusLabel: "Likely overprovisioned",
          isActionable: true,
          betterPlanId: "pro",
          betterPlanName: "Pro",
          recommendedCostPerSeat: proPlan.monthlyPricePerSeat,
          reasoning: `Windsurf Max at $200/seat targets all-day heavy agentic coding workflows — 20× the usage of Pro. Pro at $20/seat covers the majority of professional developers. Only upgrade after consistently hitting Pro quota limits — the $180/seat savings adds up quickly.`,
          confidence: "medium",
        };
      }
    }

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
            reasoning: `Windsurf Teams at $40/seat adds centralized billing, admin dashboard, analytics, and pooled add-on credits — features that justify themselves at 5+ engineers. With ${seatsCurrentlyProvisioned(entry.seats)}, the admin overhead isn't proportional. Pro at $20/seat delivers identical AI performance without the team management layer.`,
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
        reasoning: `Windsurf Teams is appropriate ${atSeatCount(entry.seats)}. At $40/seat, the centralized billing, admin dashboard, analytics, and pooled add-on credits provide genuine value at this deployment size for engineering managers tracking AI tool adoption.`,
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
        reasoning: `Windsurf Pro at $20/seat offers a strong price-to-performance ratio for AI coding assistants. Standard prompt credit quota with SWE-1.5 and frontier model access (Claude, GPT, Gemini at API price) covers most professional developer workflows.`,
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
        reasoning: `Windsurf Enterprise is purchased for SSO + RBAC, Zero Data Retention, hybrid deployment, and 1,000+ credits per user (double Teams). These features justify themselves at 20+ engineers under compliance mandates.`,
        confidence: "low",
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
    reasoning: `${tool.name} ${currentPlan.name} is well-matched ${atSeatCount(entry.seats)}. No significant optimization opportunity identified at current usage patterns.`,
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
    reasoning: `At $${entry.monthlySpend}/mo in ${toolName} API spend, you qualify for pre-purchased credit discounts of ${Math.round(discount * 100)}% below retail rates. Credits are purchased in advance from companies that over-forecasted usage — same API, same models, meaningfully lower cost. The discount compounds significantly at your volume: $${Math.round(entry.monthlySpend * discount * 12).toLocaleString()} in annual savings.`,
  };
}

// ─── Alternatives Evaluation ──────────────────────────────────────────────────

function evaluateAlternatives(entry: ToolEntry, _useCase: string): {
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
  // NOTE: spendPerDeveloper uses TEAM SIZE (org-wide engineering headcount),
  // not per-tool seat count. Intentional — benchmark compares overall AI
  // investment per engineer to industry-wide per-engineer norms.
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