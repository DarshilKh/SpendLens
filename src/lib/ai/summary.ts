import type { AuditResult } from "@/types";
import { formatCurrency } from "@/lib/utils";

const TIMEOUT_MS = 8000;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";

// ─── Prompt ───────────────────────────────────────────────────────────────────
function buildPrompt(result: AuditResult): string {
  const {
    formData,
    recommendations,
    totalMonthlySavings,
    totalAnnualSavings,
    savingsPercentage,
    benchmark,
  } = result;

  const currentSpend = result.totalCurrentMonthlySpend;
  const optimizedSpend = currentSpend - totalMonthlySavings;

  // Top 1 highest-impact action — keep it tight
  const topRec = recommendations
    .filter((r) => r.monthlySavings > 0)
    .sort((a, b) => b.monthlySavings - a.monthlySavings)[0];

  const topAction = topRec
    ? `${topRec.toolName} → ${topRec.recommendedAction} (saves ${formatCurrency(topRec.monthlySavings)}/mo)`
    : "No single high-impact action.";

  // Posture word — give the model the right adjective so it doesn't invent one
  const posture =
    savingsPercentage >= 30
      ? "significantly overprovisioned"
      : savingsPercentage >= 15
        ? "moderately overprovisioned"
        : savingsPercentage >= 5
          ? "slightly above market"
          : "well-calibrated";

  return `You are a CFO writing a 2-sentence verdict for a board memo. Sound like a human executive, not a chatbot.

NUMBERS — use exactly as labeled:
  Current spend          : ${formatCurrency(currentSpend)}/mo
  Recoverable waste      : ${formatCurrency(totalMonthlySavings)}/mo (${savingsPercentage}%)
  After-fix spend        : ${formatCurrency(optimizedSpend)}/mo   ← do NOT call this overspend
  Annual impact          : ${formatCurrency(totalAnnualSavings)}/yr
  Per-developer spend    : $${benchmark.spendPerDeveloper} vs $${benchmark.industryAveragePerDeveloper} industry avg
  Stack posture          : "${posture}"
  Top action             : ${topAction}
  Team                   : ${formData.teamSize} engineers, ${formData.useCase}

CRITICAL — these phrases will get the output rejected:
  ✗ "Our ..."           (never first-person plural)
  ✗ "We're ..."         (never first-person plural)
  ✗ "I think ..."       (no personal opinions)
  ✗ "the analysis ..."  (no meta-references to the report)
  ✗ "this audit ..."    (no meta-references)
  ✗ "it's worth noting" (no filler)
  ✗ "overall" / "in summary" / "in conclusion"
  ✗ Calling ${formatCurrency(optimizedSpend)} "overspending" — that is post-fix spend

REQUIRED FORMAT:
  • Exactly 2 sentences. 35–60 words total. Tighter is better.
  • Sentence 1 starts with "Your stack is ..." or "Your spend is ..." or "Stack posture: ..."
     and contains either ${formatCurrency(currentSpend)} OR ${formatCurrency(totalMonthlySavings)} OR ${savingsPercentage}%.
  • Sentence 2 names the single top action with its dollar impact.
  • Use the posture word "${posture}" verbatim if it fits.
  • No adjectives like "comprehensive", "robust", "leverage", "synergy".

GOOD EXAMPLE (matches the tone we want):
  "Your stack is moderately overprovisioned — ${formatCurrency(totalMonthlySavings)}/mo (${savingsPercentage}%) is recoverable without changing how anyone works. Highest-leverage move: switch Cursor Business to Pro, saving $1,000/mo."

GOOD EXAMPLE 2:
  "Stack posture: ${posture}. ${savingsPercentage}% of monthly AI spend (${formatCurrency(totalMonthlySavings)}) is recoverable — start with ${topRec ? topRec.toolName : "the largest line item"}."

Now write the verdict. Two sentences. No preamble.`;
}

// ─── Fallback — same tone as the prompt ───────────────────────────────────────
function generateFallbackSummary(result: AuditResult): string {
  const {
    totalMonthlySavings,
    totalAnnualSavings,
    savingsPercentage,
    isAlreadyOptimal,
    recommendations,
  } = result;

  const currentSpend = result.totalCurrentMonthlySpend;

  if (isAlreadyOptimal || totalMonthlySavings === 0) {
    return `Your stack is well-calibrated at ${formatCurrency(currentSpend)}/mo — every plan is matched to current scale. Revisit when headcount grows or use cases shift.`;
  }

  const topRec = recommendations
    .filter((r) => r.monthlySavings > 0)
    .sort((a, b) => b.monthlySavings - a.monthlySavings)[0];

  const posture =
    savingsPercentage >= 30
      ? "significantly overprovisioned"
      : savingsPercentage >= 15
        ? "moderately overprovisioned"
        : savingsPercentage >= 5
          ? "slightly above market"
          : "close to optimal";

  const verdict = `Your stack is ${posture} — ${formatCurrency(totalMonthlySavings)}/mo (${savingsPercentage}%) is recoverable without changing workflows.`;

  const action = topRec
    ? ` Highest-leverage move: ${topRec.toolName} ${topRec.recommendedAction.toLowerCase()}, saving ${formatCurrency(topRec.monthlySavings)}/mo (${formatCurrency(totalAnnualSavings)}/yr).`
    : "";

  return verdict + action;
}

// ─── Sanity check on LLM output ───────────────────────────────────────────────
// Reject anything that slipped through with banned tone or wrong figures.
function summaryIsAcceptable(summary: string, result: AuditResult): boolean {
  const lower = summary.toLowerCase().trim();

  // ── Banned openings / first-person ──
  const bannedPatterns: RegExp[] = [
    /^our\s/i,                      // "Our current spend..."
    /^we'?re\s/i,                   // "We're overspending..."
    /^we\s/i,                       // "We have..."
    /^i\s/i,                        // "I think..."
    /^the\s+analysis/i,             // "The analysis reveals..."
    /^this\s+audit/i,               // "This audit shows..."
    /^based\s+on/i,                 // "Based on the data..."
    /^it'?s\s+worth\s+noting/i,
    /\bin\s+conclusion\b/i,
    /\bin\s+summary\b/i,
    /\boverall\b/i,
  ];
  if (bannedPatterns.some((rx) => rx.test(lower))) return false;

  // ── Filler / chatbot vocabulary ──
  const fillerWords = [
    "leverage",
    "synergy",
    "comprehensive",
    "robust",
    "holistic",
    "revolutionize",
    "game-changing",
  ];
  if (fillerWords.some((w) => lower.includes(w))) return false;

  // ── Wrong-number guard: don't call optimized spend "overspend" ──
  const optimizedSpend = result.totalCurrentMonthlySpend - result.totalMonthlySavings;
  const overspendRx = /over\s?spend(ing)?|wast(ing|e)|exceed(ing)?/i;
  if (overspendRx.test(summary)) {
    const optimizedStr = Math.round(optimizedSpend).toLocaleString();
    if (summary.includes(optimizedStr)) return false;
  }

  // ── Length guard: must be tight ──
  const wordCount = summary.split(/\s+/).filter(Boolean).length;
  if (wordCount < 20 || wordCount > 80) return false;

  // ── Sentence count: must be 1–3 (model sometimes writes 1 long one) ──
  const sentenceCount = (summary.match(/[.!?](\s|$)/g) || []).length;
  if (sentenceCount < 1 || sentenceCount > 3) return false;

  return true;
}

// ─── Public API ───────────────────────────────────────────────────────────────
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
        max_tokens: 110,        // hard cap — forces concision
        temperature: 0.1,       // lowered from 0.15 → near-deterministic
        top_p: 0.85,            // tighter sampling, fewer odd word choices
        frequency_penalty: 0.4, // discourages chatbot-y repetition
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Groq API ${response.status}`);
    }

    const data = await response.json();
    const raw: string | undefined = data.choices?.[0]?.message?.content?.trim();

    if (!raw) throw new Error("Empty response");

    if (!summaryIsAcceptable(raw, result)) {
      console.warn(
        "[AuditSummary] LLM output rejected (tone/format/numbers). Using fallback.\n" +
          `Rejected output: "${raw}"`
      );
      return { summary: generateFallbackSummary(result), isFallback: true };
    }

    return { summary: raw, isFallback: false };
  } catch {
    return { summary: generateFallbackSummary(result), isFallback: true };
  }
}