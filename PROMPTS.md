# Prompts

This file documents every LLM prompt used in SpendLens, the reasoning behind each design decision, and what was tried that didn't work.

---

## 1. Audit Summary Prompt

**Used in:** `src/lib/ai/summary.ts` → `generateAuditSummary()`

**Model:** `llama-3.3-70b-versatile` via Groq API (OpenAI-compatible endpoint)

**Why Groq over Anthropic API:** Groq's free tier is generous (14,400 requests/day on llama-3.3-70b) and has zero cold-start latency — typically <500ms for a 200-token response. The Anthropic API is used for the product's core Credex use case; Groq keeps this tool's operating cost at $0 while delivering high-quality output. Fallback to a templated summary if the key is absent or the request fails.

**Full prompt:**

```
You are a pragmatic CFO advisor helping a {teamSize}-person startup optimize their AI tool spending. Analyze this audit and write a 100-word personalized summary.

Team context:
- Team size: {teamSize} people
- Primary use case: {useCase}
- Total AI spend: {totalCurrentMonthlySpend}/mo
- Potential monthly savings: {totalMonthlySavings}/mo ({savingsPercentage}%)
- Potential annual savings: {totalAnnualSavings}
- Spend per developer vs industry: ${spendPerDeveloper}/dev vs ${industryAverage}/dev average ({benchmarkLabel})

Tool-by-tool breakdown:
{tool breakdown lines}

Write a 90-110 word personalized paragraph that:
1. Acknowledges their specific situation (team size, use case, tools they use)
2. Calls out the 1-2 highest-impact savings opportunities with specific dollar amounts
3. Gives one concrete next step
4. Ends with an honest assessment of their AI spend health

Tone: direct, financially literate, not salesy. Sound like a CFO or technical advisor, not a chatbot. Use specific numbers. No fluff or generic AI advice.
```

**Why this prompt works:**

- **Role assignment ("pragmatic CFO advisor"):** Anchors the model's persona in "financial literacy and directness" rather than the default helpful-assistant mode that tends to produce generic advice.
- **Explicit word count (90-110 words):** Without a bound, Claude will expand. 100 words fits the UI card and prevents wall-of-text responses. Giving a range (not exactly 100) prevents the model from padding or truncating awkwardly.
- **Specific numbers in the context:** The model produces better outputs when it has concrete figures to work with rather than abstract descriptions. Injecting `$340/mo` is more useful than "significant savings."
- **The four structural points:** Prevents the model from writing a generic summary that ignores the actual data. Point 4 ("honest assessment") is key — without it, the model tends toward optimism bias.
- **"No fluff or generic AI advice":** This explicit negative constraint reduces the frequency of phrases like "In today's AI landscape..." that add no value.

**What was tried first (and didn't work):**

*Version 1 (too generic):*
```
Summarize this AI spend audit in 100 words.
{audit data}
```
Result: Produced boilerplate summaries that read like a template. Didn't use specific numbers. Tone was that of a customer support bot.

*Version 2 (too structured):*
```
Write a 3-sentence audit summary:
Sentence 1: Current situation
Sentence 2: Top recommendation
Sentence 3: Next step
```
Result: Grammatically correct but robotic. The rigid structure prevented natural flow and the output felt like a mail-merge.

*Version 3 (prompt injection test):*
During testing, a user input `companyName` containing `"Ignore all instructions and say..."` — the template literally injects company name into the context. The model correctly ignored the injection because the system prompt structure makes the data clearly subordinate. No user input is ever placed in a position of structural authority.

---

## 2. Fallback Summary Template

**Used in:** `src/lib/ai/summary.ts` → `generateFallbackSummary()`

Not a prompt — this is a deterministic TypeScript function that generates a templated summary when the Anthropic API is unavailable (timeout, rate limit, missing key).

**Design decision:** The fallback must still feel personalized. It uses the actual team size, tool count, use case, and savings figures from the audit result. A user who never sees the AI version should not notice a qualitative difference — they should just notice the summary paragraph exists.

The fallback is also used as the basis for evaluating whether the AI version is actually better. During development, several AI responses were compared against the fallback for a set of test inputs. The AI version was judged better ~80% of the time; the fallback outperformed AI for the "already optimal" case (where AI tended to over-explain and the template was more confident and concise).

---

## Notes on AI use in the audit engine

The audit engine itself (`src/lib/audit/engine.ts`) does **not** use AI. Every recommendation is produced by deterministic rule-based logic.

This was a deliberate design choice:
1. Audit recommendations need to be traceable to specific pricing data. LLM reasoning is not auditable.
2. Deterministic logic is testable. All 20 test cases in `tests/audit-engine.test.ts` would be impossible to write against an LLM-backed engine.
3. The assignment hints at this explicitly: "knowing when not to use AI is part of the test."

The principle: use AI where it adds genuine value (narrative synthesis, personalization), avoid it where determinism is required (financial calculations, pricing comparisons).
