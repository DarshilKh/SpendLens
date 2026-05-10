# Pricing Data

All prices are in USD per user per month (unless noted). Verified against official vendor pricing pages on **2026-05-10**.

---

## Cursor

- **Hobby:** $0/user/month — https://cursor.com/pricing — verified 2026-05-10
- **Pro:** $20/user/month (monthly); $16/user/month (annual) — verified 2026-05-10
- **Pro+:** $60/user/month — verified 2026-05-10
- **Ultra:** $200/user/month — verified 2026-05-10
- **Teams:** $40/user/month (minimum 3 seats) — verified 2026-05-10
- **Enterprise:** Custom pricing (requires sales contact) — verified 2026-05-10

**Notes (2026 changes):**
- The old "Business" plan ($40) is now called **Teams**.
- **Pro+** ($60) and **Ultra** ($200) are new tiers added in 2025–2026.
- Pro now uses a **credit pool system**: the $20 subscription fee equals a $20 monthly credit pool for premium model usage. Tab completions and Auto mode do not consume credits.
- Pro+ gives 3× the credit pool ($60 pool); Ultra gives 20× usage vs Pro.
- Annual billing saves ~20% on all paid tiers.
- Enterprise pricing is custom — pooled org usage, SLA, dedicated support.

---

## GitHub Copilot

- **Free:** $0/user/month (2,000 inline suggestions/mo, 50 premium requests/mo) — https://github.com/features/copilot/plans — verified 2026-05-10
- **Pro:** $10/user/month (monthly); $8.33/user/month (annual) — verified 2026-05-10
- **Pro+:** $39/user/month — verified 2026-05-10
- **Business:** $19/user/month — verified 2026-05-10
- **Enterprise:** $39/user/month (Copilot seat only) — verified 2026-05-10

**Notes (2026 changes):**
- The old "Individual" plan is now called **Pro** ($10/mo — price unchanged).
- **Pro+** is a new tier at $39/mo with 1,500 premium requests/mo and access to Claude Opus 4.6, o3, GPT-5.4.
- **Enterprise effective cost is ~$60/user/mo**: the $39 Copilot Enterprise seat requires GitHub Enterprise Cloud ($21/user/mo) as a prerequisite, raising total cost significantly. This change took effect Q3 2025.
- **Usage-based billing transition**: GitHub is migrating all Copilot plans from request-based to token-based billing on **June 1, 2026**. Business and Enterprise seat prices remain unchanged; individual plans (Pro, Pro+) move to AI Credits. New sign-ups for Pro and Pro+ temporarily paused as of April 20, 2026.
- Business and Enterprise plans include pooled GitHub AI Credits ($19 and $39/user respectively).

---

## Claude (Anthropic)

- **Free:** $0/user/month — https://claude.com/pricing — verified 2026-05-10
- **Pro:** $20/user/month (monthly); ~$17/user/month (annual) — verified 2026-05-10
- **Max (5×):** $100/user/month — verified 2026-05-10
- **Max (20×):** $200/user/month — verified 2026-05-10
- **Team Standard:** $25/seat/month (minimum 5 seats) — verified 2026-05-10
- **Team Premium:** $125/seat/month (minimum 5 seats) — verified 2026-05-10
- **Enterprise:** Custom pricing (contact sales; ~$50,000/yr minimum, minimum ~50 seats) — verified 2026-05-10

**Notes (2026 changes):**
- **Max tier** (previously noted as $100/mo) now has two explicit sub-tiers: $100 (5× usage vs Pro) and $200 (20× usage vs Pro).
- **Team plan split into Standard and Premium seats**: Standard at $25/seat replaces the old $30 flat Team price. Premium at $125/seat adds Claude Code and Cowork for engineering teams.
- Teams can **mix Standard and Premium seats** within the same plan — cost-efficient for orgs with mixed developer/non-developer users.
- **Anthropic API** pricing (as of May 2026): Sonnet 4.6 at $3/MTok in / $15/MTok out; Opus 4.6 at $15/MTok in / $75/MTok out; Haiku 4.5 at $0.80/MTok in / $4/MTok out.
- Long-context surcharge was **eliminated March 2026** — 900K-token requests cost the same per-token rate as 9K requests.
- Batch API: 50% discount; Prompt caching: 90% discount on cache reads.

---

## ChatGPT (OpenAI)

- **Free:** $0/user/month — https://chatgpt.com/pricing — verified 2026-05-10
- **Plus:** $20/user/month — verified 2026-05-10
- **Pro:** $200/user/month — verified 2026-05-10
- **Business:** $20/seat/month (annual, minimum 2 seats); $25/seat/month (monthly) — verified 2026-05-10
- **Enterprise:** Custom pricing (~$60–$100/seat/month; requires annual contract) — verified 2026-05-10

**Notes (2026 changes):**
- The old "Team" plan ($30/mo, $25 annual) is now called **Business** and **dropped to $20/seat/month (annual)** as of **April 2, 2026**.
- **Pro** ($200/mo) is now explicitly in the standard lineup — 20× Plus limits, unlimited o3/o4 reasoning models, 1M token context. Previously noted as a niche power-user plan; it is now a mainstream tier.
- **Free tier** upgraded: now runs GPT-5.3 mini unlimited (was GPT-4o mini limited).
- **OpenAI API** pricing (as of May 2026): GPT-5 at $1.25/MTok in / $10/MTok out; GPT-5-mini at $0.25/MTok in / $2/MTok out. GPT-5.4 is the current flagship family; GPT-4o pricing has been superseded.

---

## Anthropic API

- **Claude Opus 4.6:** $15/MTok input, $75/MTok output — https://www.anthropic.com/pricing#api — verified 2026-05-10
- **Claude Sonnet 4.6:** $3/MTok input, $15/MTok output — verified 2026-05-10
- **Claude Haiku 4.5:** $0.80/MTok input, $4/MTok output — verified 2026-05-10

**Notes (2026 changes):**
- Model names updated from claude-*-4-5 suffix to current recommended versions (Opus 4.6, Sonnet 4.6, Haiku 4.5).
- Long-context surcharge **eliminated March 13, 2026** — no premium for prompts exceeding 200K tokens.
- **Batch API:** 50% discount on all input and output tokens for async workloads (24-hour turnaround).
- **Prompt caching:** Cache reads cost 10% of standard input price (90% discount).

**Credex discount:** Credex-sourced credits typically provide 25–40% reduction on effective per-token rates. Audit threshold for credits recommendation: $200+/month API spend.

---

## OpenAI API

- **GPT-5:** $1.25/MTok input, $10/MTok output — https://openai.com/api/pricing — verified 2026-05-10
- **GPT-5-mini:** $0.25/MTok input, $2/MTok output — verified 2026-05-10
- **GPT-5.4 (flagship, April 2026+):** see openai.com/api/pricing for current rates — verified 2026-05-10

**Notes (2026 changes):**
- **GPT-4o and GPT-4o mini are superseded** as the primary API models. GPT-5 and GPT-5-mini are the current standard tiers.
- GPT-5.4 is the current flagship family as of April 2026 — exact per-token rates published on OpenAI's pricing page (subject to frequent updates).
- o1 pricing ($15/$60) is legacy; o3 and o4-mini are the current reasoning models.

**Credex discount:** 25–40% below retail at $200+/month API spend threshold.

---

## Gemini (Google)

- **Free:** $0/user/month — https://gemini.google.com — verified 2026-05-10
- **Google AI Plus:** $7.99/user/month — verified 2026-05-10
- **Google AI Pro:** $19.99/user/month — verified 2026-05-10
- **Google AI Ultra:** $249.99/user/month — verified 2026-05-10
- **Workspace Business Standard (Gemini bundled):** $14/user/month (annual) — https://workspace.google.com/pricing — verified 2026-05-10
- **Workspace Business Plus (Gemini bundled):** $22/user/month (annual) — verified 2026-05-10
- **Gemini API (Flash-Lite):** $0.10/MTok input, $0.40/MTok output — https://ai.google.dev/pricing — verified 2026-05-10
- **Gemini API (3.1 Pro, ≤200K context):** $2/MTok input, $12/MTok output — verified 2026-05-10

**Notes (2026 changes):**
- **Standalone Gemini Business and Gemini Enterprise add-ons are discontinued** for new purchases (removed 2025). Gemini AI is now bundled into all paid Workspace Business and Enterprise plans.
- **Google AI Plus** ($7.99/mo) is a new entry-level tier launched January 2026.
- **Google AI Ultra** ($249.99/mo) is a new premium tier for power users with maximum Gemini 3.1 Pro access, Deep Think, Veo 3.1, and 30TB storage.
- **Google AI Pro** remains $19.99/mo — previously marketed as "Gemini Advanced" or "Google One AI Premium".
- Workspace pricing increased 17–22% in 2025 to absorb the Gemini bundling. Teams that previously paid $12 base + $20 add-on are now at $14 flat — net cheaper. Teams that did not use Gemini see a price increase.
- Old $30/seat representative Workspace+Gemini cost is **no longer accurate**: use $14 (Standard) or $22 (Plus) depending on plan.

---

## Windsurf (Codeium / Cognition AI)

- **Free:** $0/user/month (25 prompt credits/mo) — https://windsurf.com/pricing — verified 2026-05-10
- **Pro:** $20/user/month — verified 2026-05-10
- **Max:** $200/user/month — verified 2026-05-10
- **Teams:** $40/user/month (minimum 3 seats) — verified 2026-05-10
- **Enterprise:** Custom pricing (~$60+/user/month) — verified 2026-05-10

**Notes (2026 changes):**
- **Pricing restructured in March 2026**: Pro increased from $15 → **$20/mo**; Teams increased from $35 → **$40/user/mo**. Existing subscribers grandfathered at old prices.
- **Max** ($200/mo) is a new tier equivalent to Cursor Ultra — for all-day heavy agentic workflows.
- **Credit system replaced by quota system** (March 2026): instead of a monthly credit pool, plans now have daily/weekly rate limits. Tab completions remain unlimited on all plans.
- Add-on credits: $120 for 1,000 pooled credits ($0.12/credit). Teams/Enterprise add-on credits are pooled across the org; base monthly credits are per-user.
- SSO available as a **$10/user/month add-on** on Teams plan.
- Free tier: 25 prompt credits/mo + unlimited SWE-1 Lite (Windsurf's proprietary model at no credit cost).

---

## Update process

Before each release, verify each URL resolves and the price matches `src/lib/pricing-data.ts`. Any discrepancy must be updated in both files simultaneously. The verification date must be updated in both files.

**Next scheduled verification:** 2026-08-10 (quarterly)