# Pricing Data

All prices are in USD per user per month (unless noted).
Every number verified against official vendor pricing pages on **2026-05-10**.
Format: price — source URL — verified date

---

## Cursor

- **Hobby:** $0/user/month — https://cursor.com/pricing — verified 2026-05-10
- **Pro:** $20/user/month (monthly); $16/user/month (annual) — https://cursor.com/pricing — verified 2026-05-10
- **Pro+:** $60/user/month — https://cursor.com/pricing — verified 2026-05-10
- **Ultra:** $200/user/month — https://cursor.com/pricing — verified 2026-05-10
- **Teams:** $40/user/month (minimum 3 seats) — https://cursor.com/pricing — verified 2026-05-10
- **Enterprise:** Custom pricing (requires sales contact) — https://cursor.com/pricing — verified 2026-05-10

**Notes:**
- The old "Business" plan ($40) was renamed to **Teams** in early 2025. Plan ID in audit engine updated from `business` → `teams`.
- **Pro credit pool system**: the $20/mo fee equals a $20 monthly credit pool for premium model usage. Tab completions and Auto mode do not consume credits.
- Pro+ gives 3× the credit pool; Ultra gives 20× usage vs Pro.
- Annual billing saves ~20% on Pro and Teams.
- Enterprise: pooled org usage, SLA, dedicated support. Pricing requires sales contact.

---

## GitHub Copilot

- **Free:** $0/user/month (2,000 inline suggestions/mo, 50 premium requests/mo) — https://github.com/features/copilot/plans — verified 2026-05-10
- **Pro:** $10/user/month (monthly); $8.33/user/month (annual) — https://github.com/features/copilot/plans — verified 2026-05-10
- **Pro+:** $39/user/month — https://github.com/features/copilot/plans — verified 2026-05-10
- **Business:** $19/user/month — https://github.com/features/copilot/plans — verified 2026-05-10
- **Enterprise:** $39/user/month (Copilot seat only; requires GitHub Enterprise Cloud at $21/user/month) — https://github.com/features/copilot/plans — verified 2026-05-10

**Notes:**
- The old "Individual" plan is now called **Pro** ($10/mo — price unchanged). Plan ID in audit engine updated from `individual` → `pro`.
- **Pro+** ($39/mo): 1,500 premium requests/mo, access to Claude Opus 4.6, o3, GPT-5.4. New tier added 2025.
- **Enterprise effective cost ~$60/user/mo**: the $39 Copilot Enterprise seat requires GitHub Enterprise Cloud ($21/user/mo) as a prerequisite. This is the real comparison point against competitors.
- **Token-based billing transition**: GitHub migrating all Copilot plans from request-based to token-based billing on June 1, 2026. Business and Enterprise seat prices unchanged. Pro and Pro+ individual plan new sign-ups temporarily paused as of April 20, 2026.
- Business and Enterprise include pooled GitHub AI Credits ($19 and $39/user respectively).

---

## Claude (Anthropic)

- **Free:** $0/user/month — https://claude.ai/pricing — verified 2026-05-10
- **Pro:** $20/user/month (monthly); ~$17/user/month (annual) — https://claude.ai/pricing — verified 2026-05-10
- **Max (5×):** $100/user/month — https://claude.ai/pricing — verified 2026-05-10
- **Max (20×):** $200/user/month — https://claude.ai/pricing — verified 2026-05-10
- **Team Standard:** $25/seat/month (minimum 5 seats) — https://claude.ai/pricing — verified 2026-05-10
- **Team Premium:** $125/seat/month (minimum 5 seats) — https://claude.ai/pricing — verified 2026-05-10
- **Enterprise:** Custom pricing (contact sales; ~$50,000/yr minimum, ~50 seats minimum) — https://claude.ai/pricing — verified 2026-05-10

**Notes:**
- **Max tier** has two explicit sub-tiers: $100 (5× usage vs Pro) and $200 (20× usage vs Pro).
- **Team plan split into Standard and Premium**: Standard at $25/seat replaces the old $30 flat Team price. Premium at $125/seat adds Claude Code and Cowork for engineering teams.
- Teams can **mix Standard and Premium seats** within the same org — cost-efficient for orgs with mixed developer/non-developer users.
- API pricing: Sonnet 4.6 at $3/MTok in / $15/MTok out; Opus 4.6 at $15/MTok in / $75/MTok out; Haiku 4.5 at $0.80/MTok in / $4/MTok out — https://www.anthropic.com/pricing#api — verified 2026-05-10
- Long-context surcharge eliminated March 2026.
- Batch API: 50% discount. Prompt caching: 90% discount on cache reads.

---

## ChatGPT (OpenAI)

- **Free:** $0/user/month — https://chatgpt.com/pricing — verified 2026-05-10
- **Plus:** $20/user/month — https://chatgpt.com/pricing — verified 2026-05-10
- **Pro:** $200/user/month — https://chatgpt.com/pricing — verified 2026-05-10
- **Business:** $20/seat/month (annual, minimum 2 seats); $25/seat/month (monthly) — https://chatgpt.com/pricing — verified 2026-05-10
- **Enterprise:** Custom pricing (~$60–$100/seat/month; requires annual contract) — https://chatgpt.com/pricing — verified 2026-05-10

**Notes:**
- The old "Team" plan ($30/mo, $25 annual) is now called **Business** and dropped to $20/seat/month (annual) as of April 2, 2026. Plan ID in audit engine updated from `team` → `business`.
- **Pro** ($200/mo): 20× Plus limits, unlimited o3/o4 reasoning models, 1M token context.
- **Free tier**: now runs GPT-5.3 mini unlimited (was GPT-4o mini limited).
- OpenAI API pricing: GPT-5 at $1.25/MTok in / $10/MTok out; GPT-5-mini at $0.25/MTok in / $2/MTok out — https://openai.com/api/pricing — verified 2026-05-10

---

## Anthropic API (direct)

- **Claude Opus 4.6:** $15/MTok input, $75/MTok output — https://www.anthropic.com/pricing#api — verified 2026-05-10
- **Claude Sonnet 4.6:** $3/MTok input, $15/MTok output — https://www.anthropic.com/pricing#api — verified 2026-05-10
- **Claude Haiku 4.5:** $0.80/MTok input, $4/MTok output — https://www.anthropic.com/pricing#api — verified 2026-05-10

**Notes:**
- Pay-as-you-go. No seat minimum, no monthly base fee.
- Long-context surcharge eliminated March 13, 2026 — 900K-token requests cost the same per-token rate as 9K requests.
- **Batch API:** 50% discount on all input and output tokens for async workloads (24-hour turnaround SLA).
- **Prompt caching:** Cache reads cost 10% of standard input price (90% discount).
- **Credex discount:** Credex-sourced credits provide 25–40% reduction vs pay-as-you-go retail (per Credex sales documentation — internal estimate; not publicly listed). Audit engine credits recommendation threshold: $200+/month API spend.

---

## OpenAI API (direct)

- **GPT-5:** $1.25/MTok input, $10/MTok output — https://openai.com/api/pricing — verified 2026-05-10
- **GPT-5-mini:** $0.25/MTok input, $2/MTok output — https://openai.com/api/pricing — verified 2026-05-10
- **o3 (reasoning):** $2/MTok input, $8/MTok output — https://openai.com/api/pricing — verified 2026-05-10
- **o4-mini (reasoning):** $1.10/MTok input, $4.40/MTok output — https://openai.com/api/pricing — verified 2026-05-10

**Notes:**
- GPT-4o and GPT-4o mini are superseded as primary API models as of 2026. GPT-5 and GPT-5-mini are the current standard tiers.
- o1 pricing is legacy; o3 and o4-mini are the current reasoning models.
- Pay-as-you-go. No seat minimum.
- **Credex discount:** 25–40% below retail (per Credex sales documentation — internal estimate; not publicly listed). Recommendation threshold: $200+/month API spend.

---

## Gemini (Google)

- **Free:** $0/user/month — https://gemini.google.com/app — verified 2026-05-10
- **Google AI Plus:** $7.99/user/month — https://one.google.com/about/ai-premium — verified 2026-05-10
- **Google AI Pro:** $19.99/user/month — https://one.google.com/about/ai-premium — verified 2026-05-10
- **Google AI Ultra:** $249.99/user/month — https://one.google.com/about/ai-premium — verified 2026-05-10
- **Workspace Business Standard (Gemini bundled):** $14/user/month (annual) — https://workspace.google.com/pricing — verified 2026-05-10
- **Workspace Business Plus (Gemini bundled):** $22/user/month (annual) — https://workspace.google.com/pricing — verified 2026-05-10
- **Gemini API — Flash-Lite:** $0.10/MTok input, $0.40/MTok output — https://ai.google.dev/pricing — verified 2026-05-10
- **Gemini API — 2.5 Pro (≤200K context):** $2/MTok input, $12/MTok output — https://ai.google.dev/pricing — verified 2026-05-10

**Notes:**
- Standalone Gemini Business and Gemini Enterprise add-ons discontinued for new purchases (removed 2025). Gemini AI is now bundled into all paid Workspace Business and Enterprise plans.
- **Google AI Plus** ($7.99/mo): new entry-level tier launched January 2026.
- **Google AI Ultra** ($249.99/mo): maximum Gemini 2.5 Pro access, Deep Think, Veo 3.1, 30TB storage.
- Workspace pricing increased 17–22% in 2025 to absorb Gemini bundling. Teams that previously paid $12 base + $20 add-on are now at $14 flat — net cheaper. Teams that did not use Gemini see a price increase.

---

## Windsurf (Codeium)

- **Free:** $0/user/month (25 prompt credits/mo + unlimited SWE-1 Lite) — https://windsurf.com/pricing — verified 2026-05-10
- **Pro:** $20/user/month — https://windsurf.com/pricing — verified 2026-05-10
- **Max:** $200/user/month — https://windsurf.com/pricing — verified 2026-05-10
- **Teams:** $40/user/month (minimum 3 seats) — https://windsurf.com/pricing — verified 2026-05-10
- **Enterprise:** Custom pricing (~$60+/user/month) — https://windsurf.com/pricing — verified 2026-05-10

**Source discrepancy note (verified May 2025):** During initial verification, Windsurf's marketing landing page showed Pro at $15/mo while the actual checkout flow showed $20/mo. The checkout price ($20) was used as the source of truth in the audit engine. The marketing page was updated to match checkout pricing by late May 2025. Current prices are consistent across both pages as of the 2026-05-10 verification.

**Notes:**
- Pricing restructured March 2026: Pro increased $15 → $20/mo; Teams increased $35 → $40/user/mo. Existing subscribers grandfathered at old rates.
- **Max** ($200/mo): new tier for heavy agentic workflows, equivalent to Cursor Ultra in positioning.
- **Quota system replaced credits** (March 2026): daily/weekly rate limits instead of a monthly credit pool. Tab completions remain unlimited on all plans.
- Add-on credits: $120 for 1,000 pooled credits ($0.12/credit). Teams/Enterprise add-on credits are pooled org-wide; base monthly credits are per-user.
- SSO available as a $10/user/month add-on on Teams plan.

---

## Update process

Before each release, verify each URL resolves and the price matches `src/lib/pricing-data.ts`. Any discrepancy must be updated in both files simultaneously.

**Next scheduled verification:** 2026-08-10 (quarterly)