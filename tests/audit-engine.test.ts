import { describe, it, expect } from "vitest";
import { v4 as uuidv4 } from "uuid";
import { runAuditEngine } from "@/lib/audit/engine";
import type { AuditFormData, ToolEntry } from "@/types";

function makeEntry(toolId: string, planId: string, seats: number, monthlySpend: number): ToolEntry {
  return { id: uuidv4(), toolId: toolId as ToolEntry["toolId"], planId, seats, monthlySpend };
}

function makeFormData(tools: ToolEntry[], overrides?: Partial<AuditFormData>): AuditFormData {
  return { tools, teamSize: 5, useCase: "coding", companyName: "Test Corp", ...overrides };
}

// ─── Structure tests ─────────────────────────────────────────────────────────

describe("Audit Engine — Output Shape", () => {
  it("returns all required fields", () => {
    const result = runAuditEngine(makeFormData([makeEntry("cursor", "pro", 3, 60)]));
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("shareSlug");
    expect(result).toHaveProperty("recommendations");
    expect(result).toHaveProperty("totalCurrentMonthlySpend");
    expect(result).toHaveProperty("totalMonthlySavings");
    expect(result).toHaveProperty("benchmark");
    expect(result.recommendations[0]).toHaveProperty("severity");
    expect(result.recommendations[0]).toHaveProperty("statusLabel");
  });

  it("recommendation includes severity and statusLabel", () => {
    const result = runAuditEngine(makeFormData([makeEntry("cursor", "pro", 3, 60)]));
    const rec = result.recommendations[0];
    expect(["savings", "info", "optimal", "warning"]).toContain(rec.severity);
    expect(typeof rec.statusLabel).toBe("string");
    expect(rec.statusLabel.length).toBeGreaterThan(0);
  });

  it("correctly totals current monthly spend", () => {
    const result = runAuditEngine(makeFormData([
      makeEntry("cursor", "pro", 2, 40),
      makeEntry("github_copilot", "individual", 2, 20),
      makeEntry("claude", "pro", 1, 20),
    ]));
    expect(result.totalCurrentMonthlySpend).toBe(80);
  });

  it("annual savings = monthly × 12", () => {
    const result = runAuditEngine(makeFormData([makeEntry("cursor", "business", 2, 80)], { teamSize: 2 }));
    expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
  });

  it("generates unique share slugs and IDs", () => {
    const fd = makeFormData([makeEntry("cursor", "pro", 1, 20)]);
    const r1 = runAuditEngine(fd);
    const r2 = runAuditEngine(fd);
    expect(r1.shareSlug).not.toBe(r2.shareSlug);
    expect(r1.id).not.toBe(r2.id);
  });
});

// ─── Plan downgrade detection ─────────────────────────────────────────────────

describe("Audit Engine — Plan Fit Rules", () => {
  it("flags Cursor Business as overprovision for a 3-person team", () => {
    const result = runAuditEngine(makeFormData([makeEntry("cursor", "business", 3, 120)], { teamSize: 3 }));
    const rec = result.recommendations[0];
    expect(rec.severity).toBe("savings");
    expect(rec.monthlySavings).toBeGreaterThan(0);
    expect(rec.recommendedPlanId).toBe("pro");
  });

  it("does NOT flag Cursor Business for an 8-person team", () => {
    const result = runAuditEngine(makeFormData([makeEntry("cursor", "business", 8, 320)], { teamSize: 8 }));
    const rec = result.recommendations[0];
    expect(rec.monthlySavings).toBe(0);
    expect(["optimal", "info"]).toContain(rec.severity);
  });

  it("does NOT flag Cursor Business for a 12-person team", () => {
    // This was the bug: 12 people with Business should NOT be flagged
    const result = runAuditEngine(makeFormData([makeEntry("cursor", "business", 12, 480)], { teamSize: 12 }));
    const rec = result.recommendations[0];
    expect(rec.monthlySavings).toBe(0);
    expect(rec.severity).toBe("optimal");
  });

  it("flags GitHub Copilot Enterprise for teams under 15 seats", () => {
    const result = runAuditEngine(makeFormData([makeEntry("github_copilot", "enterprise", 8, 312)], { teamSize: 8 }));
    const rec = result.recommendations[0];
    expect(rec.severity).toBe("savings");
    expect(rec.recommendedPlanId).toBe("business");
    expect(rec.monthlySavings).toBeGreaterThan(0);
  });

  it("does NOT flag GitHub Copilot Enterprise for 15+ seats", () => {
    const result = runAuditEngine(makeFormData([makeEntry("github_copilot", "enterprise", 20, 780)], { teamSize: 20 }));
    const rec = result.recommendations[0];
    expect(rec.monthlySavings).toBe(0);
  });

  it("flags ChatGPT Team with 1 seat as overprovision", () => {
    const result = runAuditEngine(makeFormData([makeEntry("chatgpt", "team", 1, 30)], { teamSize: 1 }));
    const rec = result.recommendations[0];
    expect(rec.severity).toBe("savings");
    expect(rec.monthlySavings).toBeGreaterThan(0);
  });

  it("marks Cursor Pro for 5-person coding team as optimal", () => {
    const result = runAuditEngine(makeFormData([makeEntry("cursor", "pro", 5, 100)], { teamSize: 5, useCase: "coding" }));
    const rec = result.recommendations[0];
    expect(rec.severity).toBe("optimal");
    expect(rec.monthlySavings).toBe(0);
  });
});

// ─── Credits detection ────────────────────────────────────────────────────────

describe("Audit Engine — Credits Rules", () => {
  it("suggests credits for Anthropic API spend over $200/mo", () => {
    const result = runAuditEngine(makeFormData([makeEntry("anthropic_api", "pay_as_you_go", 1, 500)]));
    const rec = result.recommendations[0];
    expect(rec.recommendationType).toBe("add_credits");
    expect(rec.credexRelevant).toBe(true);
    expect(rec.monthlySavings).toBeGreaterThan(0);
  });

  it("does NOT suggest credits for spend under $200/mo", () => {
    const result = runAuditEngine(makeFormData([makeEntry("anthropic_api", "pay_as_you_go", 1, 100)]));
    const rec = result.recommendations[0];
    expect(rec.recommendationType).not.toBe("add_credits");
  });

  it("applies higher discount for spend over $1000/mo", () => {
    const result1 = runAuditEngine(makeFormData([makeEntry("anthropic_api", "pay_as_you_go", 1, 300)]));
    const result2 = runAuditEngine(makeFormData([makeEntry("anthropic_api", "pay_as_you_go", 1, 1500)]));
    const savings1Pct = result1.recommendations[0].monthlySavings / 300;
    const savings2Pct = result2.recommendations[0].monthlySavings / 1500;
    expect(savings2Pct).toBeGreaterThanOrEqual(savings1Pct);
  });
});

// ─── High savings cases ───────────────────────────────────────────────────────

describe("Audit Engine — Aggregates", () => {
  it("highSavingsCase=true when savings > $500/mo", () => {
    const result = runAuditEngine(makeFormData([makeEntry("anthropic_api", "pay_as_you_go", 1, 2000)]));
    expect(result.highSavingsCase).toBe(true);
    expect(result.totalMonthlySavings).toBeGreaterThan(500);
  });

  it("highSavingsCase=false for small savings", () => {
    const result = runAuditEngine(makeFormData([makeEntry("cursor", "pro", 1, 20)]));
    expect(result.highSavingsCase).toBe(false);
  });

  it("totalMonthlySavings is never negative", () => {
    const result = runAuditEngine(makeFormData([makeEntry("cursor", "pro", 1, 20)]));
    expect(result.totalMonthlySavings).toBeGreaterThanOrEqual(0);
  });

  it("savingsPercentage is 0 when no spend", () => {
    const result = runAuditEngine(makeFormData([makeEntry("claude", "free", 1, 0)]));
    expect(result.savingsPercentage).toBe(0);
  });

  it("handles empty tools array without throwing", () => {
    expect(() => runAuditEngine(makeFormData([]))).not.toThrow();
    const result = runAuditEngine(makeFormData([]));
    expect(result.totalCurrentMonthlySpend).toBe(0);
    expect(result.totalMonthlySavings).toBe(0);
  });
});

// ─── Benchmark ───────────────────────────────────────────────────────────────

describe("Audit Engine — Benchmark", () => {
  it("calculates spend per developer correctly", () => {
    const result = runAuditEngine(makeFormData([
      makeEntry("cursor", "pro", 5, 100),
      makeEntry("github_copilot", "individual", 5, 50),
    ], { teamSize: 5 }));
    expect(result.benchmark.spendPerDeveloper).toBe(30); // $150 / 5
  });

  it("benchmark percentile is clamped between 0 and 100", () => {
    const result = runAuditEngine(makeFormData([makeEntry("cursor", "business", 50, 5000)], { teamSize: 50 }));
    expect(result.benchmark.percentile).toBeGreaterThanOrEqual(0);
    expect(result.benchmark.percentile).toBeLessThanOrEqual(100);
  });

  it("produces a non-empty benchmark label", () => {
    const result = runAuditEngine(makeFormData([makeEntry("cursor", "pro", 3, 60)]));
    expect(typeof result.benchmark.label).toBe("string");
    expect(result.benchmark.label.length).toBeGreaterThan(0);
  });
});

// ─── Nuanced thresholds ───────────────────────────────────────────────────────

describe("Audit Engine — Nuanced Threshold Correctness", () => {
  it("Cursor Business with 5 seats: minor_opportunity not savings", () => {
    const result = runAuditEngine(makeFormData([makeEntry("cursor", "business", 5, 200)], { teamSize: 5 }));
    const rec = result.recommendations[0];
    // At 5 seats it's borderline — could be minor or optimal, NOT a big downgrade
    expect(["info", "optimal"]).toContain(rec.severity);
  });

  it("Windsurf Teams with 2 seats flags overprovision", () => {
    const result = runAuditEngine(makeFormData([makeEntry("windsurf", "teams", 2, 70)], { teamSize: 2 }));
    const rec = result.recommendations[0];
    expect(rec.severity).toBe("savings");
    expect(rec.recommendedPlanId).toBe("pro");
  });

  it("Claude Max with large team triggers overprovision warning", () => {
    const result = runAuditEngine(makeFormData([makeEntry("claude", "max", 5, 500)], { teamSize: 10 }));
    const rec = result.recommendations[0];
    expect(rec.severity).toBe("savings");
    expect(rec.monthlySavings).toBeGreaterThan(0);
  });

  it("Copilot Individual with 12-person team suggests upgrade", () => {
    const result = runAuditEngine(makeFormData([makeEntry("github_copilot", "individual", 12, 120)], { teamSize: 12 }));
    const rec = result.recommendations[0];
    expect(rec.recommendationType).toBe("upgrade_recommended");
  });

  it("multi-tool mixed result produces correct totals", () => {
    const result = runAuditEngine(makeFormData([
      makeEntry("cursor", "business", 2, 80),        // savings
      makeEntry("github_copilot", "individual", 2, 20), // optimal
      makeEntry("anthropic_api", "pay_as_you_go", 1, 300), // credits
    ], { teamSize: 2 }));
    expect(result.recommendations).toHaveLength(3);
    expect(result.totalCurrentMonthlySpend).toBe(400);
    expect(result.totalMonthlySavings).toBeGreaterThan(0);
    expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
  });
});
