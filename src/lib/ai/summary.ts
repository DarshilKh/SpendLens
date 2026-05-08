import type { AuditResult } from "@/types";
import { formatCurrency } from "@/lib/utils";

const TIMEOUT_MS = 10000;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";

function buildPrompt(result: AuditResult): string {
  const { formData, recommendations, totalMonthlySavings, totalAnnualSavings, savingsPercentage, benchmark } = result;

  const savings = recommendations
    .filter((r) => r.monthlySavings > 0)
    .map((r) => `- ${r.toolName} (${r.currentPlanName}): ${r.recommendedAction} → saves ${formatCurrency(r.monthlySavings)}/mo`)
    .join("\n");

  const optimal = recommendations
    .filter((r) => r.monthlySavings === 0)
    .map((r) => `- ${r.toolName}: ${r.statusLabel}`)
    .join("\n");

  return `You are a FinOps advisor writing a concise executive summary for a startup's AI spend audit.

Audit data:
- Team: ${formData.teamSize} people, primary use case: ${formData.useCase}
- Current AI spend: ${formatCurrency(result.totalCurrentMonthlySpend)}/mo
- Identified savings: ${formatCurrency(totalMonthlySavings)}/mo (${savingsPercentage}%)
- Annual impact: ${formatCurrency(totalAnnualSavings)}
- Spend per developer: $${benchmark.spendPerDeveloper}/dev vs $${benchmark.industryAveragePerDeveloper}/dev industry average (${benchmark.label})
${savings ? `\nSavings opportunities:\n${savings}` : ""}
${optimal ? `\nWell-matched tools:\n${optimal}` : ""}

Write exactly 2-3 sentences (80-110 words total). Be direct and specific:
- Sentence 1: Characterize their spend posture with one specific data point
- Sentence 2: Name the highest-impact action with the dollar amount
- Sentence 3: Give an honest forward-looking assessment

Rules: No preamble. No bullet points. No headers. Output only the paragraph. Use dollar figures. Sound like a CFO, not a chatbot.`;
}

function generateFallbackSummary(result: AuditResult): string {
  const { formData, totalMonthlySavings, totalAnnualSavings, savingsPercentage, isAlreadyOptimal, recommendations, benchmark } = result;

  if (isAlreadyOptimal || totalMonthlySavings === 0) {
    return `Your ${formData.teamSize}-person team's AI spend of ${formatCurrency(result.totalCurrentMonthlySpend)}/mo is ${benchmark.label} — no material optimization gaps identified across ${formData.tools.length} tool${formData.tools.length > 1 ? "s" : ""}. Every plan is appropriately matched to your team's scale and use case. As your headcount or usage patterns shift, revisit the Cursor and Claude tiers first — they're where over-provisioning typically surfaces at growth stages.`;
  }

  const topRec = recommendations
    .filter((r) => r.monthlySavings > 0)
    .sort((a, b) => b.monthlySavings - a.monthlySavings)[0];

  const pct = savingsPercentage;
  const adj = pct > 30 ? "material" : pct > 15 ? "meaningful" : "moderate";

  return `Your ${formData.teamSize}-person team is carrying ${adj} AI tool overhead at ${formatCurrency(result.totalCurrentMonthlySpend)}/mo — ${formatCurrency(totalMonthlySavings)}/mo (${pct}%) is recoverable without changing your workflow. ${topRec ? `The highest-leverage action is ${topRec.toolName}: ${topRec.recommendedAction.toLowerCase()}, saving ${formatCurrency(topRec.monthlySavings)}/mo immediately.` : ""} Implementing these changes puts ${formatCurrency(totalAnnualSavings)} back on the balance sheet annually with zero productivity trade-off.`;
}

export async function generateAuditSummary(
  result: AuditResult
): Promise<{ summary: string; isFallback: boolean }> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return { summary: generateFallbackSummary(result), isFallback: true };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: buildPrompt(result) }],
        max_tokens: 160,
        temperature: 0.35,
        top_p: 0.9,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error("[AI Summary] Groq error:", response.status, await response.text());
      return { summary: generateFallbackSummary(result), isFallback: true };
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };

    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text || text.length < 50) {
      return { summary: generateFallbackSummary(result), isFallback: true };
    }

    return { summary: text, isFallback: false };
  } catch (err) {
    console.error("[AI Summary] Failed:", err);
    return { summary: generateFallbackSummary(result), isFallback: true };
  }
}
