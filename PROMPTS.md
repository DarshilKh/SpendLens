# Prompts

## AI Summary Generation

**Where it's used:** `/src/lib/ai/summary.ts`

**Model:** `llama-3.1-8b-instant` via Groq API (OpenAI-compatible endpoint)

**Why Groq over a slower model:** Groq's free tier provides 14,400 requests/day on llama-3.1-8b-instant with typical inference under 500ms for a 200-token response. The audit result is already on screen; the AI summary renders in a card below the fold. Speed matters more than reasoning depth for a 100-word paragraph. Fallback to a templated summary if the key is absent or the request fails.

---

## The Prompt

```
You are a senior CFO advisor reviewing an AI tooling audit for a startup.

Write a single paragraph of exactly 80–100 words summarising the audit findings below.
Your tone: direct, professional, no hype. You are writing for a technical founder or
engineering manager who values precision over encouragement.

Rules:
- Do NOT begin with "I" or "This audit"
- Do NOT use the phrase "cost-effective" or "optimize"
- Do NOT invent numbers not present in the data
- Mention the single highest-impact recommendation by name
- End with one concrete next step the reader should take this week

Audit data:
- Tools audited: {{toolList}}
- Total monthly spend: ${{totalMonthlySpend}}
- Identified monthly savings: ${{totalMonthlySavings}} ({{savingsPercentage}}% reduction)
- Team size: {{teamSize}}
- Primary use case: {{useCase}}
- Highest-impact finding: {{topFinding}}
- Credex-relevant (high API spend): {{credexRelevant}}
```

---

## Why This Prompt Is Written This Way

**Structural constraints (4 rules):**

The four "do not" rules each prevent a specific failure mode I observed during iteration:

- "Do not begin with 'I'" — the model's default opening is "I noticed that..." which reads as a chatbot, not a financial advisor.
- "Do not begin with 'This audit'" — the second most common default; it's circular and wastes the opening line.
- "Do not use 'cost-effective' or 'optimize'" — these are the two words that make B2B copy sound like AI slop. Banning them forces more specific language.
- "Do not invent numbers" — without this constraint, the model occasionally extrapolates savings percentages or invents benchmark comparisons not in the audit data. With this constraint, every claim in the summary traces back to the structured input.

**"80–100 words exactly":**
The results page summary card has a fixed height. Under 80 words looks thin; over 100 words overflows on mobile. A word count constraint produces more consistent output than relying on `max_tokens` alone, because the model interprets `max_tokens` as a ceiling, not a target.

**"Mention the single highest-impact recommendation by name":**
Without this instruction, the model produces generic summaries ("there are several opportunities to reduce spend"). Requiring a named recommendation forces specificity and makes the summary more useful to the reader.

**"End with one concrete next step this week":**
This was the most important change across iterations. Without it, the model ended with summary statements ("overall, your AI spend is above average for your team size"). With it, the model ends with action ("downgrade the three Cursor Business seats to Pro by end of week — the admin controls are identical"). The latter gives the reader a reason to act.

---

## What I Tried That Didn't Work

**Attempt 1 — Asking for JSON output:**
I initially had the model return `{ summary: string, topAction: string }` and displayed them separately. The model frequently hallucinated the `topAction` field with recommendations not in the audit data. Switched to a single paragraph — harder to hallucinate within a flowing sentence.

**Attempt 2 — No word count constraint:**
The model produced summaries ranging from 40 to 180 words. The 40-word ones looked placeholder-like; the 180-word ones broke the card layout on mobile. Explicit word count solved both.

**Attempt 3 — Including raw recommendation objects in the prompt:**
Passing the full `recommendations[]` array as JSON produced summaries that read like a list wrapped in paragraph prose ("The first recommendation is X. The second recommendation is Y."). Switching to pre-processed human-readable strings for `toolList` and `topFinding` produced natural narrative output.

**Attempt 4 — "Write as a friendly advisor":**
Produced summaries with phrases like "Great news!" and "You're doing well overall!" — wrong tone entirely for a B2B procurement tool. Replacing "friendly" with "senior CFO advisor" immediately shifted the register.

---

## Fallback Behavior

If the Groq API is unavailable (key missing, timeout after 8s, rate limit hit), the function returns a deterministic templated summary built from the same audit data:

```
Your {{teamSize}}-person team is spending ${{totalMonthlySpend}}/month across
{{toolCount}} AI tools. {{#if savings}}The audit identified ${{totalMonthlySavings}}/month
in potential savings — an annualised ${{totalAnnualSavings}}. The highest-impact action
is {{topFinding}}.{{else}}Your current spend is well-calibrated for your team size and
use case.{{/if}}
```

The fallback is intentionally dry. It doesn't try to mimic the AI output — it provides the key numbers cleanly. The UI does not expose to the user whether the summary is AI-generated or templated.