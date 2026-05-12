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

type OrgTier = "solo" | "small" | "growing" | "midmarket" | "enterprise";

function classifyOrg(teamSize: number): OrgTier {
  if (teamSize <= 2) return "solo";
  if (teamSize <= 10) return "small";
  if (teamSize <= 25) return "growing";
  if (teamSize <= 100) return "midmarket";
  return "enterprise";
}

const PROCUREMENT_FLOOR: Record<string, Record<OrgTier, string[]>> = {
  cursor: {
    solo: ["pro", "pro_plus", "ultra", "teams", "enterprise"],
    small: ["pro", "pro_plus", "ultra", "teams", "enterprise"],
    growing: ["teams", "enterprise"],
    midmarket: ["teams", "enterprise"],
    enterprise: ["teams", "enterprise"],
  },
  github_copilot: {
    solo: ["pro", "pro_plus", "business", "enterprise"],
    small: ["pro", "pro_plus", "business", "enterprise"],
    growing: ["business", "enterprise"],
    midmarket: ["business", "enterprise"],
    enterprise: ["business", "enterprise"],
  },
  claude: {
    solo: ["pro", "max_5x", "max_20x", "team_standard", "team_premium", "enterprise"],
    small: ["pro", "max_5x", "max_20x", "team_standard", "team_premium", "enterprise"],
    growing: ["team_standard", "team_premium", "enterprise"],
    midmarket: ["team_standard", "team_premium", "enterprise"],
    enterprise: ["team_standard", "team_premium", "enterprise"],
  },
  chatgpt: {
    solo: ["plus", "pro", "business", "enterprise"],
    small: ["plus", "pro", "business", "enterprise"],
    growing: ["business", "enterprise"],
    midmarket: ["business", "enterprise"],
    enterprise: ["business", "enterprise"],
  },
  gemini: {
    solo: ["ai_plus", "ai_pro", "ai_ultra", "workspace_standard", "workspace_plus"],
    small: ["ai_plus", "ai_pro", "ai_ultra", "workspace_standard", "workspace_plus"],
    growing: ["workspace_standard", "workspace_plus"],
    midmarket: ["workspace_standard", "workspace_plus"],
    enterprise: ["workspace_standard", "workspace_plus"],
  },
  windsurf: {
    solo: ["pro", "max", "teams", "enterprise"],
    small: ["pro", "max", "teams", "enterprise"],
    growing: ["teams", "enterprise"],
    midmarket: ["teams", "enterprise"],
    enterprise: ["teams", "enterprise"],
  },
};

function isPlanReachable(toolId: string, planId: string, tier: OrgTier): boolean {
  const allowed = PROCUREMENT_FLOOR[toolId]?.[tier];
  if (!allowed) return true;
  return allowed.includes(planId);
}

// ─── Phrasing helpers ─────────────────────────────────────────────────────────
const seatsCurrentlyAssigned = (seats: number): string =>
  `the ${seats} ${seats === 1 ? "seat" : "seats"} currently assigned`;

const seatsCurrentlyProvisioned = (seats: number): string =>
  `${seats} ${seats === 1 ? "seat" : "seats"} currently provisioned`;

const atSeatCount = (seats: number): string =>
  `at your current ${seats}-seat deployment`;

const ENTERPRISE_OVERKILL_THRESHOLD = 25;
const ENTERPRISE_VERIFY_THRESHOLD = 49;

// Fraction of Team Premium seats that realistically need Claude Code daily.
const CLAUDE_PREMIUM_BLEND_RATIO = 0.4;

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
  const orgTier = classifyOrg(teamSize);
  const isLargeOrg = orgTier === "midmarket" || orgTier === "enterprise";

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

  if (expectedTotal > 0 && entry.monthlySpend > expectedTotal * 1.25 && costPerSeat > 0) {
    const pctOver = Math.round(
      ((entry.monthlySpend - expectedTotal) / expectedTotal) * 100
    );
    return {
      recommendationType: "slight_overprovision",
      severity: "warning",
      statusLabel: "Spend anomaly",
      isActionable: true,
      recommendedCostPerSeat: costPerSeat,
      reasoning: `Your reported spend of $${entry.monthlySpend}/mo is ${pctOver}% above the standard rate of $${expectedTotal}/mo for ${entry.seats} ${currentPlan.name} seat${entry.seats > 1 ? "s" : ""}. Likely indicates legacy pricing tiers, usage overages, or unadvertised add-ons. Request a line-item breakdown from ${tool.name} before your next renewal.`,
      confidence: "medium",
    };
  }

  // ════════════════════════════════════════════════════════════════════
  // CURSOR
  // ════════════════════════════════════════════════════════════════════
  if (tool.id === "cursor") {

    if (entry.planId === "enterprise") {
      const teamsPlan = getPlanById("cursor", "teams");

      if (teamSize < ENTERPRISE_OVERKILL_THRESHOLD && teamsPlan) {
        return {
          recommendationType: "enterprise_overkill",
          severity: "savings",
          statusLabel: "Enterprise overkill",
          isActionable: true,
          betterPlanId: "teams",
          betterPlanName: "Teams",
          recommendedCostPerSeat: teamsPlan.monthlyPricePerSeat,
          reasoning: `Cursor Enterprise's pooled org usage, SCIM, custom deployment, and dedicated SLAs justify themselves at 50+ engineers under compliance mandates. For a ${teamSize}-person org, Cursor Teams at $40/seat provides equivalent SSO, centralized billing, and admin controls — Enterprise's premium isn't yet earned at this scale.`,
          confidence: "high",
        };
      }

      if (teamSize <= ENTERPRISE_VERIFY_THRESHOLD && teamsPlan) {
        return {
          recommendationType: "minor_opportunity",
          severity: "info",
          statusLabel: "Verify scope",
          isActionable: true,
          betterPlanId: "teams",
          betterPlanName: "Teams",
          recommendedCostPerSeat: teamsPlan.monthlyPricePerSeat,
          reasoning: `Cursor Enterprise is reasonable ${atSeatCount(entry.seats)}, but at a ${teamSize}-person org you're at the threshold where Teams ($40/seat) typically suffices unless you have active SOC 2 / ISO 27001 audits, SCIM provisioning needs, or pooled-usage requirements. If those aren't current operational requirements, Teams delivers the same AI capabilities at a meaningful per-seat discount. Audit utilization before next renewal.`,
          confidence: "medium",
        };
      }

      return {
        recommendationType: "strong_roi",
        severity: "optimal",
        statusLabel: "Enterprise justified",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Cursor Enterprise is well-matched ${atSeatCount(entry.seats)} for a ${teamSize}-person engineering org. At this scale, pooled org usage, SCIM seat management, audit logs, custom deployment options, and dedicated SLAs become operational requirements — not optional overhead. The premium over Teams reflects real governance value at this org size.`,
        confidence: "high",
      };
    }

    if (entry.planId === "teams") {
      if (orgTier === "solo" || orgTier === "small") {
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
              reasoning: `Cursor Teams at $40/seat adds centralized billing, SSO, and admin controls — features that earn ROI at 5+ developers under shared governance. With ${seatsCurrentlyProvisioned(entry.seats)} in a ${teamSize}-person org, individual Pro plans at $20/seat deliver the same AI performance at half the per-seat cost.`,
              confidence: "high",
            };
          }
        }
      }
      return {
        recommendationType: "already_optimal",
        severity: "optimal",
        statusLabel: "Well matched",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Cursor Teams is well-matched for ${seatsCurrentlyAssigned(entry.seats)} in a ${teamSize}-person organization. At $40/seat, centralized billing, SSO, and admin governance are operational requirements at this scale, not optional overhead.`,
        confidence: "high",
      };
    }

    if (entry.planId === "ultra") {
      const proPlusPlan = getPlanById("cursor", "pro_plus");
      if (isLargeOrg) {
        const teamsPlan = getPlanById("cursor", "teams");
        if (teamsPlan) {
          return {
            recommendationType: "slight_overprovision",
            severity: "savings",
            statusLabel: "Wrong tier for org size",
            isActionable: true,
            betterPlanId: "teams",
            betterPlanName: "Teams",
            recommendedCostPerSeat: teamsPlan.monthlyPricePerSeat,
            reasoning: `Cursor Ultra at $200/seat is an individual subscription tier — operationally unsuitable for a ${teamSize}-person organization (no centralized billing, SSO, or admin controls). Cursor Teams at $40/seat is the right tier for org-managed seats. If specific power users need Ultra-level usage, mix Teams seats with a small number of Ultra seats for those users.`,
            confidence: "high",
          };
        }
      }
      if (proPlusPlan && useCase !== "coding") {
        return {
          recommendationType: "slight_overprovision",
          severity: "savings",
          statusLabel: "Likely overprovisioned",
          isActionable: true,
          betterPlanId: "pro_plus",
          betterPlanName: "Pro+",
          recommendedCostPerSeat: proPlusPlan.monthlyPricePerSeat,
          reasoning: `Cursor Ultra at $200 targets developers running parallel background agents on heavy coding workflows. For ${useCase} use, Pro+ at $60 covers most usage patterns. Track whether you're consistently exhausting Pro+'s $60 credit pool before committing to Ultra.`,
          confidence: "medium",
        };
      }
      return {
        recommendationType: "already_optimal",
        severity: "optimal",
        statusLabel: "Justified",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Cursor Ultra is appropriate for sustained heavy agentic workflows. The 20× usage pool handles parallel background agent execution without overage charges.`,
        confidence: "medium",
      };
    }

    if (entry.planId === "pro_plus") {
      if (isLargeOrg) {
        const teamsPlan = getPlanById("cursor", "teams");
        if (teamsPlan) {
          return {
            recommendationType: "slight_overprovision",
            severity: "savings",
            statusLabel: "Wrong tier for org size",
            isActionable: true,
            betterPlanId: "teams",
            betterPlanName: "Teams",
            recommendedCostPerSeat: teamsPlan.monthlyPricePerSeat,
            reasoning: `Cursor Pro+ at $60/seat is an individual subscription — operationally unsuitable for a ${teamSize}-person organization that requires centralized billing, SSO, and admin governance. Teams at $40/seat is the appropriate org-grade tier and is actually $20 cheaper per seat.`,
            confidence: "high",
          };
        }
      }
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
          reasoning: `Cursor Pro+ at $60/seat triples Pro's credit pool — valuable for sustained code generation. For ${useCase} workflows, Pro's $20 pool is rarely exhausted. Downgrading saves $40/seat/month with negligible day-to-day difference.`,
          confidence: "medium",
        };
      }
      return {
        recommendationType: "already_optimal",
        severity: "optimal",
        statusLabel: "Justified",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Cursor Pro+ is appropriate for sustained coding workflows. The 3× usage pool handles most heavy-usage patterns without overage charges.`,
        confidence: "medium",
      };
    }

    if (entry.planId === "pro") {
      if (isLargeOrg) {
        const teamsPlan = getPlanById("cursor", "teams");
        if (teamsPlan) {
          return {
            recommendationType: "upgrade_recommended",
            severity: "info",
            statusLabel: "Procurement gap",
            isActionable: true,
            betterPlanId: "teams",
            betterPlanName: "Teams",
            recommendedCostPerSeat: teamsPlan.monthlyPricePerSeat,
            reasoning: `${seatsCurrentlyProvisioned(entry.seats)} on individual Pro subscriptions in a ${teamSize}-person org creates governance risk: no centralized billing, no SSO, no usage visibility, no audit trail. Cursor Teams at $40/seat consolidates these into a single procurement contract — the $20/seat premium pays for IT overhead reduction and compliance posture.`,
            confidence: "high",
          };
        }
      }
      if (useCase === "writing" || useCase === "research") {
        return {
          recommendationType: "minor_opportunity",
          severity: "info",
          statusLabel: "Use case mismatch",
          isActionable: true,
          recommendedCostPerSeat: costPerSeat,
          reasoning: `Cursor Pro is purpose-built for code generation. For ${useCase} workflows, the $20 credit pool and code-focused context system deliver limited value. Claude Pro or ChatGPT Plus would provide better output quality per dollar.`,
          confidence: "medium",
        };
      }
      return {
        recommendationType: "already_optimal",
        severity: "optimal",
        statusLabel: "Optimized",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Cursor Pro is the right tier ${atSeatCount(entry.seats)}. At $20/seat, it delivers unlimited Tab completions and frontier model access for engineering teams without enterprise governance requirements.`,
        confidence: "high",
      };
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // GITHUB COPILOT
  // ════════════════════════════════════════════════════════════════════
  if (tool.id === "github_copilot") {

    if (entry.planId === "enterprise") {
      const bizPlan = getPlanById("github_copilot", "business");

      if (teamSize < 15 && bizPlan) {
        const hint =
          entry.seats < 15
            ? "personalized models require 15+ engineers and 6+ months of usage data to differentiate from Business"
            : "personalized model benefits compound over 6+ months of usage";
        return {
          recommendationType: "enterprise_overkill",
          severity: "savings",
          statusLabel: "Enterprise overkill",
          isActionable: true,
          betterPlanId: "business",
          betterPlanName: "Business",
          recommendedCostPerSeat: bizPlan.monthlyPricePerSeat,
          reasoning: `Copilot Enterprise's ${hint}. Enterprise also requires GitHub Enterprise Cloud (+$21/user), bringing the effective cost to ~$60/seat. Business at $19/seat provides equivalent value with audit logs, IP indemnity, and SAML SSO.`,
          confidence: "high",
        };
      }

      if (teamSize < ENTERPRISE_OVERKILL_THRESHOLD) {
        return {
          recommendationType: "already_optimal",
          severity: "optimal",
          statusLabel: "Well matched",
          isActionable: false,
          recommendedCostPerSeat: costPerSeat,
          reasoning: `Copilot Enterprise is appropriate ${atSeatCount(entry.seats)} for a ${teamSize}-person org. At 15+ engineers, personalized codebase models begin to deliver meaningful lift over Business, and the GHEC requirement is typically already in place at this scale.`,
          confidence: "high",
        };
      }

      if (teamSize <= ENTERPRISE_VERIFY_THRESHOLD && bizPlan) {
        return {
          recommendationType: "minor_opportunity",
          severity: "info",
          statusLabel: "Verify scope",
          isActionable: true,
          betterPlanId: "business",
          betterPlanName: "Business",
          recommendedCostPerSeat: bizPlan.monthlyPricePerSeat,
          reasoning: `Copilot Enterprise is reasonable at a ${teamSize}-person org, but personalized codebase models and knowledge-base integration take 6+ months and 15+ active contributors to deliver measurable lift. Enterprise also requires GitHub Enterprise Cloud (+$21/user/mo). If your team isn't actively using knowledge bases or PR summaries, Business at $19/seat provides equivalent audit logs, IP indemnity, and SSO for less. Review utilization before renewal.`,
          confidence: "medium",
        };
      }

      return {
        recommendationType: "strong_roi",
        severity: "optimal",
        statusLabel: "Strong ROI",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Copilot Enterprise is well-justified ${atSeatCount(entry.seats)} for a ${teamSize}-person org. Personalized models trained on your codebase, knowledge base integration, and PR summaries deliver compounding productivity gains that offset the $39 + $21 GHEC cost at this scale.`,
        confidence: "high",
      };
    }

    if (entry.planId === "pro_plus") {
      if (isLargeOrg) {
        const bizPlan = getPlanById("github_copilot", "business");
        if (bizPlan) {
          return {
            recommendationType: "slight_overprovision",
            severity: "savings",
            statusLabel: "Wrong tier for org size",
            isActionable: true,
            betterPlanId: "business",
            betterPlanName: "Business",
            recommendedCostPerSeat: bizPlan.monthlyPricePerSeat,
            reasoning: `Copilot Pro+ at $39/seat is an individual subscription — operationally unsuitable for a ${teamSize}-person org without IP indemnity, audit logs, or central policy controls. Business at $19/seat provides org-grade governance for $20 less per seat.`,
            confidence: "high",
          };
        }
      }
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
          reasoning: `Copilot Pro+ at $39/seat unlocks 1,500 premium requests/month versus Pro's 300. Break-even is ~325 requests. Track one month of usage before committing — if consistently under, Pro at $10/seat saves $29/seat.`,
          confidence: "medium",
        };
      }
    }

    if (entry.planId === "business") {
      if (orgTier === "solo") {
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
            reasoning: `Copilot Business adds policy management, audit logs, and IP indemnity — governance features that matter when managing a developer team centrally. For a ${teamSize}-person team without compliance requirements, Pro at $10/seat provides the same coding performance at nearly half the cost.`,
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
        reasoning: `Copilot Business is the right tier ${atSeatCount(entry.seats)}. Policy management, audit logs, and IP indemnity provide governance value that Pro can't offer at this org scale.`,
        confidence: "high",
      };
    }

    if (entry.planId === "pro") {
      if (isLargeOrg || teamSize > 10) {
        const bizPlan = getPlanById("github_copilot", "business");
        if (bizPlan) {
          return {
            recommendationType: "upgrade_recommended",
            severity: "info",
            statusLabel: "Procurement gap",
            isActionable: true,
            betterPlanId: "business",
            betterPlanName: "Business",
            recommendedCostPerSeat: bizPlan.monthlyPricePerSeat,
            reasoning: `${seatsCurrentlyProvisioned(entry.seats)} on individual Pro Copilot in a ${teamSize}-person org creates real liability: no IP indemnity, no audit logs, no policy controls. Business at $19/seat is practically mandatory for commercial software development at this headcount.`,
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
        reasoning: `Copilot Pro is cost-efficient ${atSeatCount(entry.seats)}. At $10/seat, it delivers unlimited completions, 300 premium requests, and full IDE integration without governance overhead.`,
        confidence: "high",
      };
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // CLAUDE
  // ════════════════════════════════════════════════════════════════════
  if (tool.id === "claude") {

    if (entry.planId === "enterprise") {
      if (teamSize < ENTERPRISE_OVERKILL_THRESHOLD) {
        const teamPremium = getPlanById("claude", "team_premium");
        if (teamPremium) {
          return {
            recommendationType: "enterprise_overkill",
            severity: "savings",
            statusLabel: "Enterprise overkill",
            isActionable: true,
            betterPlanId: "team_premium",
            betterPlanName: "Team Premium",
            recommendedCostPerSeat: teamPremium.monthlyPricePerSeat,
            reasoning: `Claude Enterprise's 500K context, SCIM, HIPAA readiness, and 99.99% SLA are operationally meaningful at 50+ seats under active compliance requirements. For a ${teamSize}-person org without those mandates, Team Premium at $125/seat provides Claude Code with org-grade governance at a fraction of the annual commitment.`,
            confidence: "medium",
          };
        }
      }

      if (teamSize <= ENTERPRISE_VERIFY_THRESHOLD) {
        const teamPremium = getPlanById("claude", "team_premium");
        if (teamPremium) {
          return {
            recommendationType: "minor_opportunity",
            severity: "info",
            statusLabel: "Verify scope",
            isActionable: true,
            betterPlanId: "team_premium",
            betterPlanName: "Team Premium",
            recommendedCostPerSeat: teamPremium.monthlyPricePerSeat,
            reasoning: `Claude Enterprise is an annual contract purchased for SSO, SCIM, audit logs, custom data retention, 500K context, and HIPAA readiness. At a ${teamSize}-person org, confirm those compliance features are actively required. If not, Team Premium at $125/seat provides Claude Code access with org-grade admin controls under a flexible monthly arrangement.`,
            confidence: "medium",
          };
        }
      }

      return {
        recommendationType: "strong_roi",
        severity: "optimal",
        statusLabel: "Enterprise justified",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Claude Enterprise is well-justified ${atSeatCount(entry.seats)} for a ${teamSize}-person org. SSO, SCIM, audit logs, custom data retention, 500K context, HIPAA readiness, and 99.99% SLA are genuine operational requirements at this scale — not optional overhead.`,
        confidence: "high",
      };
    }

    if (entry.planId === "max_20x") {
      if (isLargeOrg) {
        const teamPremium = getPlanById("claude", "team_premium");
        if (teamPremium) {
          return {
            recommendationType: "slight_overprovision",
            severity: "savings",
            statusLabel: "Wrong tier for org size",
            isActionable: true,
            betterPlanId: "team_premium",
            betterPlanName: "Team Premium",
            recommendedCostPerSeat: teamPremium.monthlyPricePerSeat,
            reasoning: `Claude Max 20× at $200/seat is an individual subscription — no SSO, no central billing, no admin console. For a ${teamSize}-person org, Team Premium at $125/seat provides comparable Claude Code access with org-grade governance, saving $75/seat. For users who genuinely need 20× usage, mix Team Standard seats with a few Max seats for power users.`,
            confidence: "high",
          };
        }
      }
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
          reasoning: `Claude Max 20× at $200/seat targets developers running Claude Code agents all day on large codebases. Max 5× at $100/seat covers most power users. Track whether you're consistently hitting Max 5× limits before committing to the 2× premium.`,
          confidence: "medium",
        };
      }
    }

    if (entry.planId === "max_5x") {
      if (isLargeOrg) {
        const teamPremium = getPlanById("claude", "team_premium");
        if (teamPremium) {
          return {
            recommendationType: "upgrade_recommended",
            severity: "info",
            statusLabel: "Wrong tier for org size",
            isActionable: true,
            betterPlanId: "team_premium",
            betterPlanName: "Team Premium",
            recommendedCostPerSeat: teamPremium.monthlyPricePerSeat,
            reasoning: `Claude Max 5× at $100/seat is an individual tier — no SSO, no admin console, no central billing. For a ${teamSize}-person org, Team Premium at $125/seat provides Claude Code with org-grade governance. The $25/seat premium pays for compliance posture and IT overhead reduction.`,
            confidence: "high",
          };
        }
      }
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
          reasoning: `Claude Max 5× at $100/seat targets individual power users routinely exhausting Pro's message windows. Across ${seatsCurrentlyProvisioned(entry.seats)}, sustained Max-level usage per seat is rare. Team Standard at $25/seat or Pro at $20/seat would deliver equivalent value at a fraction of the cost.`,
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
          reasoning: `Claude Max 5× targets sustained high-volume usage — long agentic tasks or large document batches. For ${useCase} workflows, Pro's limits are rarely hit in practice. Downgrading saves $80/seat/month with negligible day-to-day difference.`,
          confidence: "medium",
        };
      }
      return {
        recommendationType: "strong_roi",
        severity: "optimal",
        statusLabel: "Justified",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Claude Max 5× is appropriate for your use case. High-throughput ${useCase} workflows regularly exhaust Pro's limits — the 5× headroom translates directly to uninterrupted productivity.`,
        confidence: "medium",
      };
    }

    if (entry.planId === "team_premium") {
      const teamStandard = getPlanById("claude", "team_standard");
      if (teamStandard) {
        const blendedCostPerSeat =
          teamStandard.monthlyPricePerSeat * (1 - CLAUDE_PREMIUM_BLEND_RATIO) +
          125 * CLAUDE_PREMIUM_BLEND_RATIO;
        return {
          recommendationType: "minor_opportunity",
          severity: "info",
          statusLabel: "Optimize seat mix",
          isActionable: true,
          betterPlanId: "team_standard",
          betterPlanName: "Team Standard (mixed)",
          recommendedCostPerSeat: blendedCostPerSeat,
          reasoning: `Claude Team Premium at $125/seat includes Claude Code and Cowork. Across ${seatsCurrentlyProvisioned(entry.seats)}, fewer than half typically need Claude Code daily. Anthropic allows mixing seat tiers within a Team plan — assigning Premium only to active Code users and Standard ($25/seat) to the rest can cut total cost 40–60% with no functional loss.`,
          confidence: "medium",
        };
      }
    }

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
            reasoning: `Claude Team Standard adds shared workspaces, admin controls, and SSO — features requiring multiple users to generate value. With 1 seat assigned, Pro at $20/seat delivers identical model access without the $5/month team premium.`,
            confidence: "high",
          };
        }
      }
      if (entry.seats < 5 && (orgTier === "solo" || orgTier === "small")) {
        return {
          recommendationType: "minor_opportunity",
          severity: "info",
          statusLabel: "Below minimum value threshold",
          isActionable: true,
          recommendedCostPerSeat: costPerSeat,
          reasoning: `Claude Team has a 5-seat minimum and is optimized for collaborative workspaces with shared projects, SSO, and central billing. With ${seatsCurrentlyProvisioned(entry.seats)}, you're meeting the floor but not extracting full value. If your team isn't actively using shared Projects, individual Pro plans may be more cost-effective.`,
          confidence: "medium",
        };
      }
      return {
        recommendationType: "already_optimal",
        severity: "optimal",
        statusLabel: "Well matched",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Claude Team Standard is well-suited for ${seatsCurrentlyAssigned(entry.seats)}. At $25/seat, SSO, central billing, Microsoft 365 + Slack integrations, and 200K context provide measurable collaboration value at this deployment size.`,
        confidence: "high",
      };
    }

    if (entry.planId === "pro") {
      if (isLargeOrg) {
        const teamPlan = getPlanById("claude", "team_standard");
        if (teamPlan) {
          return {
            recommendationType: "upgrade_recommended",
            severity: "info",
            statusLabel: "Procurement gap",
            isActionable: true,
            betterPlanId: "team_standard",
            betterPlanName: "Team Standard",
            recommendedCostPerSeat: teamPlan.monthlyPricePerSeat,
            reasoning: `${seatsCurrentlyProvisioned(entry.seats)} on individual Pro plans in a ${teamSize}-person org creates governance risk: no SSO, no admin console, no usage visibility, no central billing. Team Standard at $25/seat consolidates into a single procurement contract — the $5/seat premium pays for compliance posture.`,
            confidence: "high",
          };
        }
      }
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
            reasoning: `With ${seatsCurrentlyProvisioned(entry.seats)} on Pro at $20/seat, Team Standard at $25/seat starts delivering structural value: SSO, shared Projects, admin visibility, central billing. The $5/seat premium pays for itself in operational overhead reduction.`,
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
        reasoning: `Claude Pro is well-calibrated for your scale. At $20/seat, Opus 4.6 + Sonnet 4.6 access, Claude Code, and 5× Free's usage without team overhead.`,
        confidence: "high",
      };
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // CHATGPT
  // ════════════════════════════════════════════════════════════════════
  if (tool.id === "chatgpt") {

    if (entry.planId === "enterprise") {
      if (teamSize < ENTERPRISE_OVERKILL_THRESHOLD) {
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
            reasoning: `ChatGPT Enterprise targets organizations with EKM, SCIM, advanced analytics, and annual contracts — features that pay off at 100+ seats or under regulated workloads. For a ${teamSize}-person org, Business pricing currently starts around $20/user on annual billing, providing equivalent SSO, training-data exclusion, and SOC 2 compliance at a fraction of the cost.`,
            confidence: "high",
          };
        }
      }

      if (teamSize <= ENTERPRISE_VERIFY_THRESHOLD) {
        const businessPlan = getPlanById("chatgpt", "business");
        if (businessPlan) {
          return {
            recommendationType: "minor_opportunity",
            severity: "info",
            statusLabel: "Verify scope",
            isActionable: true,
            betterPlanId: "business",
            betterPlanName: "Business",
            recommendedCostPerSeat: businessPlan.monthlyPricePerSeat,
            reasoning: `ChatGPT Enterprise's premium features — EKM, SCIM, custom data retention, advanced analytics — are most valuable at 100+ seats or under regulated workloads. For a ${teamSize}-person org, audit whether all ${entry.seats} Enterprise seats actively use these capabilities. A mixed deployment of Enterprise (for compliance-bound users) and Business (for general users) often reduces cost significantly without functional loss.`,
            confidence: "medium",
          };
        }
      }

      if (orgTier === "midmarket") {
        const businessPlan = getPlanById("chatgpt", "business");
        if (businessPlan) {
          return {
            recommendationType: "minor_opportunity",
            severity: "info",
            statusLabel: "Verify scope",
            isActionable: true,
            betterPlanId: "business",
            betterPlanName: "Business",
            recommendedCostPerSeat: businessPlan.monthlyPricePerSeat,
            reasoning: `ChatGPT Enterprise's premium features — EKM, SCIM, custom data retention, advanced analytics — deliver the most value at 500+ seats or under regulated workloads. For a ${teamSize}-person org, confirm that all ${entry.seats} Enterprise seats actively use compliance-specific features. A mixed deployment — Enterprise for regulated users, Business for general users — often reduces cost 40–60% without functional loss.`,
            confidence: "medium",
          };
        }
      }

      return {
        recommendationType: "strong_roi",
        severity: "optimal",
        statusLabel: "Well matched",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `ChatGPT Enterprise is appropriate ${atSeatCount(entry.seats)} for a ${teamSize}-person org. Unlimited GPT-5.4, custom data retention, EKM, SCIM, role-based access, and dedicated support deliver proportional value at this scale.`,
        confidence: "medium",
      };
    }

    if (entry.planId === "pro") {
      if (isLargeOrg) {
        const businessPlan = getPlanById("chatgpt", "business");
        if (businessPlan) {
          return {
            recommendationType: "slight_overprovision",
            severity: "savings",
            statusLabel: "Wrong tier for org size",
            isActionable: true,
            betterPlanId: "business",
            betterPlanName: "Business",
            recommendedCostPerSeat: businessPlan.monthlyPricePerSeat,
            reasoning: `ChatGPT Pro at $200/seat is an individual subscription — no SSO, no admin console, no SOC 2 compliance, no training-data exclusion, no procurement contract. For a ${teamSize}-person org, Business provides org-grade governance with full GPT-5.5 access. For specific power users who genuinely need unlimited reasoning models, mix Business seats with a few Pro seats — but don't standardize an org on Pro.`,
            confidence: "high",
          };
        }
      }
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
          reasoning: `ChatGPT Pro at $200/seat is justified only for users running unlimited GPT-5.5, o3, and o4-mini-high reasoning models with 1M context daily. For typical professional use, Plus at $20/seat delivers the same GPT-5.5/5.4 access, Deep Research, and Agent Mode at 10% of the cost.`,
          confidence: "medium",
        };
      }
    }

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
            reasoning: `ChatGPT Business's workspace, SSO, and admin features need multiple collaborators. With 1 seat, Plus at $20/seat delivers identical model access — Business adds nothing for solo use.`,
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
        reasoning: `ChatGPT Business provides excellent value ${atSeatCount(entry.seats)}. Shared workspaces, SAML SSO, SOC 2 Type II, 60+ app integrations, and training-data exclusion meaningfully outperform Plus for collaborative use. Business pricing currently starts around $20/user on annual billing.`,
        confidence: "high",
      };
    }

    if (entry.planId === "plus") {
      if (isLargeOrg) {
        const businessPlan = getPlanById("chatgpt", "business");
        if (businessPlan) {
          return {
            recommendationType: "upgrade_recommended",
            severity: "info",
            statusLabel: "Procurement gap",
            isActionable: true,
            betterPlanId: "business",
            betterPlanName: "Business",
            recommendedCostPerSeat: businessPlan.monthlyPricePerSeat,
            reasoning: `${seatsCurrentlyProvisioned(entry.seats)} on individual Plus subscriptions in a ${teamSize}-person org creates real liability: conversations may be used for training, no SSO, no admin controls, no SOC 2 compliance. Business pricing currently starts around $20/user on annual billing — the same price as Plus — with training-data exclusion and SAML SSO. Strict upgrade with zero cost penalty.`,
            confidence: "high",
          };
        }
      }
      if (teamSize > 5 && teamSize <= 25) {
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
            reasoning: `Across a ${teamSize}-person team on Plus, you're missing the data privacy and admin controls Business provides. Business pricing currently starts around $20/user on annual billing — same price as Plus — adding training-data exclusion, SAML SSO, and 60+ integrations.`,
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
        reasoning: `ChatGPT Plus is well-suited for your scale. At $20/seat, full GPT-5.5 + GPT-5.4, Deep Research, DALL-E, Agent Mode, and Custom GPTs.`,
        confidence: "high",
      };
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // GEMINI
  // ════════════════════════════════════════════════════════════════════
  if (tool.id === "gemini") {

    if (entry.planId === "ai_ultra") {
      if (isLargeOrg) {
        const workspaceStdPlan = getPlanById("gemini", "workspace_standard");
        if (workspaceStdPlan) {
          return {
            recommendationType: "slight_overprovision",
            severity: "savings",
            statusLabel: "Wrong tier for org size",
            isActionable: true,
            betterPlanId: "workspace_standard",
            betterPlanName: "Workspace Business Standard",
            recommendedCostPerSeat: workspaceStdPlan.monthlyPricePerSeat,
            reasoning: `Google AI Ultra at $249.99/seat is a consumer subscription — no admin console, no central billing, no Workspace integration. For a ${teamSize}-person org, Workspace Business Standard at $14/seat bundles Gemini AI across all Workspace apps with admin controls. For specific users needing Deep Think 3.1 daily, mix Workspace seats with a few AI Ultra subscriptions.`,
            confidence: "high",
          };
        }
      }
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
          reasoning: `Google AI Ultra at $249.99/seat targets users running Deep Think 3.1 daily and 120 Deep Research queries per day. AI Pro at $19.99/seat covers Gemini 3.1 Pro (1M context), 100 Pro prompts/day, and NotebookLM Plus — sufficient for the vast majority of professional use.`,
          confidence: "medium",
        };
      }
    }

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
          reasoning: `Workspace Business Plus at $22/seat adds Vault (eDiscovery), 5 TB storage, 500-participant meetings, and enhanced security. Upgrade only if legal hold, compliance archival, or large all-hands meetings are an active requirement. Standard at $14/seat includes the same Gemini AI bundled across all Workspace apps.`,
          confidence: "medium",
        };
      }
    }

    if (entry.planId === "workspace_standard") {
      if (useCase === "coding") {
        return {
          recommendationType: "potential_redundancy",
          severity: "warning",
          statusLabel: "Use case mismatch",
          isActionable: true,
          recommendedCostPerSeat: costPerSeat,
          reasoning: `Workspace Business Standard at $14/seat bundles Gemini for Docs, Sheets, and Meet — not code generation. For a coding-focused team, Cursor Pro or GitHub Copilot delivers materially better output for less cost. Keep Workspace if you need Drive/Meet, but supplement with a dedicated coding assistant.`,
          confidence: "medium",
        };
      }
      return {
        recommendationType: "already_optimal",
        severity: "optimal",
        statusLabel: "Well matched",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Workspace Business Standard at $14/seat is well-suited for ${useCase} workflows. Gemini AI is now bundled across Docs, Sheets, Slides, Meet, and Drive — previously requiring a $20–30 add-on.`,
        confidence: "high",
      };
    }

    if (entry.planId === "ai_pro") {
      if (isLargeOrg) {
        const workspaceStdPlan = getPlanById("gemini", "workspace_standard");
        if (workspaceStdPlan) {
          return {
            recommendationType: "upgrade_recommended",
            severity: "info",
            statusLabel: "Procurement gap",
            isActionable: true,
            betterPlanId: "workspace_standard",
            betterPlanName: "Workspace Business Standard",
            recommendedCostPerSeat: workspaceStdPlan.monthlyPricePerSeat,
            reasoning: `${seatsCurrentlyProvisioned(entry.seats)} on individual AI Pro in a ${teamSize}-person org creates governance risk and is more expensive than necessary. Workspace Business Standard at $14/seat bundles Gemini across all Workspace apps with admin controls — $6/seat cheaper with org-grade governance.`,
            confidence: "high",
          };
        }
      }
      return {
        recommendationType: "already_optimal",
        severity: "optimal",
        statusLabel: "Reasonable",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Google AI Pro at $19.99/seat provides Gemini 3.1 Pro with 1M context, ~100 Pro prompts/day, NotebookLM Plus, and Deep Research — competitive standalone Gemini access.`,
        confidence: "medium",
      };
    }

    if (entry.planId === "ai_plus") {
      return {
        recommendationType: "already_optimal",
        severity: "optimal",
        statusLabel: "Optimized",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Google AI Plus at $7.99/seat is a strong entry-level tier — 128K context, 200 monthly AI credits, expanded NotebookLM, and 200 GB storage. Right-sized for occasional Gemini use beyond Free.`,
        confidence: "high",
      };
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // WINDSURF
  // ════════════════════════════════════════════════════════════════════
  if (tool.id === "windsurf") {

    if (entry.planId === "enterprise") {
      const teamsPlan = getPlanById("windsurf", "teams");

      if (teamSize < ENTERPRISE_OVERKILL_THRESHOLD && teamsPlan) {
        return {
          recommendationType: "enterprise_overkill",
          severity: "savings",
          statusLabel: "Enterprise overkill",
          isActionable: true,
          betterPlanId: "teams",
          betterPlanName: "Teams",
          recommendedCostPerSeat: teamsPlan.monthlyPricePerSeat,
          reasoning: `Windsurf Enterprise's SSO + RBAC, Zero Data Retention, hybrid deployment, and 1,000+ credits/user are operationally meaningful at 50+ engineers under compliance mandates. For a ${teamSize}-person org, Teams at $40/seat provides centralized billing, admin dashboard, and pooled credits without the Enterprise premium.`,
          confidence: "high",
        };
      }

      if (teamSize <= ENTERPRISE_VERIFY_THRESHOLD && teamsPlan) {
        return {
          recommendationType: "minor_opportunity",
          severity: "info",
          statusLabel: "Verify scope",
          isActionable: true,
          betterPlanId: "teams",
          betterPlanName: "Teams",
          recommendedCostPerSeat: teamsPlan.monthlyPricePerSeat,
          reasoning: `Windsurf Enterprise is reasonable at a ${teamSize}-person org, but its key differentiators — Zero Data Retention, hybrid deployment, SSO + RBAC, and 1,000+ credits/user — are most impactful at 50+ engineers under active compliance requirements. If those aren't current operational needs, Teams at $40/seat delivers centralized billing, admin dashboard, and analytics at a meaningful discount. Review before next renewal.`,
          confidence: "medium",
        };
      }

      return {
        recommendationType: "strong_roi",
        severity: "optimal",
        statusLabel: "Enterprise justified",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Windsurf Enterprise is well-justified ${atSeatCount(entry.seats)} for a ${teamSize}-person org. SSO + RBAC, Zero Data Retention, hybrid deployment, and 1,000+ credits/user are operational requirements at this scale — not optional overhead.`,
        confidence: "high",
      };
    }

    if (entry.planId === "max") {
      if (isLargeOrg) {
        const teamsPlan = getPlanById("windsurf", "teams");
        if (teamsPlan) {
          return {
            recommendationType: "slight_overprovision",
            severity: "savings",
            statusLabel: "Wrong tier for org size",
            isActionable: true,
            betterPlanId: "teams",
            betterPlanName: "Teams",
            recommendedCostPerSeat: teamsPlan.monthlyPricePerSeat,
            reasoning: `Windsurf Max at $200/seat is an individual subscription — no admin dashboard, no central billing, no SSO. For a ${teamSize}-person org, Teams at $40/seat provides org-grade governance and pooled add-on credits. For specific users with sustained heavy agentic workflows, mix Teams seats with a few Max subscriptions.`,
            confidence: "high",
          };
        }
      }
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
          reasoning: `Windsurf Max at $200/seat targets all-day heavy agentic coding — 20× the usage of Pro. Pro at $20/seat covers most professional developers. Only upgrade after consistently hitting Pro quota limits.`,
          confidence: "medium",
        };
      }
    }

    if (entry.planId === "teams") {
      if ((orgTier === "solo" || orgTier === "small") && entry.seats < 5) {
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
            reasoning: `Windsurf Teams at $40/seat adds centralized billing, admin dashboard, and pooled credits — features that earn ROI at 5+ engineers. With ${seatsCurrentlyProvisioned(entry.seats)} in a ${teamSize}-person team, individual Pro at $20/seat delivers identical AI performance without the team layer.`,
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
        reasoning: `Windsurf Teams is appropriate for ${seatsCurrentlyAssigned(entry.seats)} in a ${teamSize}-person organization. At $40/seat, centralized billing, admin dashboard, analytics, and pooled add-on credits are operational requirements at this scale.`,
        confidence: "high",
      };
    }

    if (entry.planId === "pro") {
      if (isLargeOrg) {
        const teamsPlan = getPlanById("windsurf", "teams");
        if (teamsPlan) {
          return {
            recommendationType: "upgrade_recommended",
            severity: "info",
            statusLabel: "Procurement gap",
            isActionable: true,
            betterPlanId: "teams",
            betterPlanName: "Teams",
            recommendedCostPerSeat: teamsPlan.monthlyPricePerSeat,
            reasoning: `${seatsCurrentlyProvisioned(entry.seats)} on individual Pro in a ${teamSize}-person org creates governance risk: no centralized billing, no admin dashboard, no SSO option, no usage visibility. Teams at $40/seat consolidates into a single procurement contract — the $20/seat premium pays for IT overhead reduction.`,
            confidence: "high",
          };
        }
      }
      return {
        recommendationType: "already_optimal",
        severity: "optimal",
        statusLabel: "Strong value",
        isActionable: false,
        recommendedCostPerSeat: costPerSeat,
        reasoning: `Windsurf Pro at $20/seat offers a strong price-to-performance ratio. Standard prompt credit quota with SWE-1.5 and frontier model access (Claude, GPT, Gemini at API price) covers most professional developer workflows.`,
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
    reasoning: `${tool.name} ${currentPlan.name} is well-matched ${atSeatCount(entry.seats)}. No significant optimization opportunity identified at current usage patterns.`,
    confidence: "high",
  };
}

function evaluateCredits(entry: ToolEntry): {
  suggest: boolean;
  discount: number;
  reasoning: string;
} {
  const isApiTool = entry.toolId === "anthropic_api" || entry.toolId === "openai_api";
  if (!isApiTool || entry.monthlySpend < 200) {
    return { suggest: false, discount: 0, reasoning: "" };
  }

  const discount =
    entry.monthlySpend >= 1000 ? 0.35 : entry.monthlySpend >= 500 ? 0.30 : 0.25;
  const toolName = entry.toolId === "anthropic_api" ? "Anthropic" : "OpenAI";

  return {
    suggest: true,
    discount,
    reasoning: `At $${entry.monthlySpend}/mo in ${toolName} API spend, you qualify for pre-purchased credit discounts of ${Math.round(discount * 100)}% below retail rates. Credits are purchased in advance from companies that over-forecasted usage — same API, same models, lower cost. Annual savings at your volume: $${Math.round(entry.monthlySpend * discount * 12).toLocaleString()}.`,
  };
}

function evaluateAlternatives(
  entry: ToolEntry,
  _useCase: string,
  teamSize: number
): {
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

  const orgTier = classifyOrg(teamSize);

  const reachableAlts = alts.filter((a) =>
    isPlanReachable(a.toolId, a.planId, orgTier)
  );
  if (!reachableAlts.length) return { hasAlternative: false, altCostPerSeat: 0, reason: "" };

  const alt = reachableAlts[0];
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

function getMaxRealisticSavingsRatio(teamSize: number): number {
  const tier = classifyOrg(teamSize);
  switch (tier) {
    case "solo":       return 0.70;
    case "small":      return 0.55;
    case "growing":    return 0.40;
    case "midmarket":  return 0.25;
    case "enterprise": return 0.18;
  }
}

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
    const altEval =
      planEval.recommendationType === "already_optimal"
        ? { hasAlternative: false, altCostPerSeat: 0, reason: "" }
        : evaluateAlternatives(entry, useCase, teamSize);

    let recommendationType: RecommendationType = planEval.recommendationType;
    let severity: RecommendationSeverity = planEval.severity;
    let statusLabel = planEval.statusLabel;
    let recommendedMonthlyCost =
      planEval.isActionable && planEval.betterPlanId
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
      recommendedMonthlyCost = planEval.recommendedCostPerSeat * entry.seats;
      recommendedPlanId = planEval.betterPlanId;
      recommendedAction =
        planEval.recommendationType === "upgrade_recommended"
          ? `Move to ${tool.name} ${planEval.betterPlanName}`
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

  const totalCurrentMonthlySpend = recommendations.reduce(
    (s, r) => s + r.currentMonthlyCost,
    0
  );
  const rawTotalRecommendedMonthlySpend = recommendations.reduce(
    (s, r) => s + r.recommendedMonthlyCost,
    0
  );
  const rawTotalMonthlySavings = Math.max(
    0,
    totalCurrentMonthlySpend - rawTotalRecommendedMonthlySpend
  );

  const maxRatio = getMaxRealisticSavingsRatio(teamSize);
  const cappedTotalMonthlySavings = Math.min(
    rawTotalMonthlySavings,
    totalCurrentMonthlySpend * maxRatio
  );
  const totalRecommendedMonthlySpend =
    totalCurrentMonthlySpend - cappedTotalMonthlySavings;
  const totalMonthlySavings = cappedTotalMonthlySavings;
  const totalAnnualSavings = totalMonthlySavings * 12;
  const savingsPercentage =
    totalCurrentMonthlySpend > 0
      ? Math.round((totalMonthlySavings / totalCurrentMonthlySpend) * 100)
      : 0;

  const isAlreadyOptimal = recommendations.every(
    (r) => r.monthlySavings === 0 && r.severity === "optimal"
  );
  const highSavingsCase = totalMonthlySavings >= 500;

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
      percentile <= 35
        ? "below industry average"
        : percentile >= 65
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