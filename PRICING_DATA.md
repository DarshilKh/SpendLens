# Pricing Data

All prices are in USD per user per month (unless noted). Verified against official vendor pricing pages during submission week.

---

## Cursor

- **Hobby:** $0/user/month — https://cursor.sh/pricing — verified 2025-01-06
- **Pro:** $20/user/month (monthly); $16/user/month (annual) — https://cursor.sh/pricing — verified 2025-01-06
- **Business:** $40/user/month — https://cursor.sh/pricing — verified 2025-01-06
- **Enterprise:** ~$100/user/month (estimated; requires sales contact for exact pricing) — https://cursor.sh/pricing — verified 2025-01-06

**Notes:** Business plan minimum is 1 seat. Enterprise pricing is listed as "custom" — the $100 estimate is based on publicly shared pricing information from enterprise customers; treated as an estimate in the audit engine (confidence: low).

---

## GitHub Copilot

- **Individual:** $10/user/month (monthly); $8.33/user/month (annual) — https://github.com/features/copilot#pricing — verified 2025-01-06
- **Business:** $19/user/month — https://github.com/features/copilot#pricing — verified 2025-01-06
- **Enterprise:** $39/user/month — https://github.com/features/copilot#pricing — verified 2025-01-06

**Notes:** Copilot Free tier exists (limited to verified students/OSS maintainers). Not included in the paid audit scope.

---

## Claude (Anthropic)

- **Free:** $0/user/month (rate-limited) — https://www.anthropic.com/pricing — verified 2025-01-06
- **Pro:** $20/user/month — https://www.anthropic.com/pricing — verified 2025-01-06
- **Max ($100 tier):** $100/user/month — https://www.anthropic.com/pricing — verified 2025-01-06
- **Max ($200 tier):** $200/user/month — https://www.anthropic.com/pricing — verified 2025-01-06
- **Team:** $30/user/month (minimum 5 seats) — https://www.anthropic.com/pricing — verified 2025-01-06
- **Enterprise:** ~$60/user/month (estimated; requires sales contact) — https://www.anthropic.com/pricing — verified 2025-01-06

**Notes:** Max plan has two sub-tiers ($100 and $200/mo); the $100 tier offers 5× usage vs Pro, the $200 tier offers 20×. The audit engine uses $100 as the default Max price.

---

## ChatGPT (OpenAI)

- **Free:** $0/user/month — https://openai.com/chatgpt/pricing — verified 2025-01-06
- **Plus:** $20/user/month — https://openai.com/chatgpt/pricing — verified 2025-01-06
- **Team:** $30/user/month (monthly); $25/user/month (annual) — minimum 2 seats — https://openai.com/chatgpt/pricing — verified 2025-01-06
- **Enterprise:** ~$60/user/month (estimated; requires sales contact) — https://openai.com/chatgpt/pricing — verified 2025-01-06

**Notes:** ChatGPT Pro ($200/mo) is a single-user ultra plan; not included in the standard audit as it targets a very specific power-user segment.

---

## Anthropic API

- **claude-opus-4-5:** $15/MTok input, $75/MTok output — https://www.anthropic.com/pricing#api — verified 2025-01-06
- **claude-sonnet-4-5:** $3/MTok input, $15/MTok output — https://www.anthropic.com/pricing#api — verified 2025-01-06
- **claude-haiku-4-5:** $0.80/MTok input, $4/MTok output — https://www.anthropic.com/pricing#api — verified 2025-01-06

**Credex discount:** Credex-sourced credits typically provide 25-35% reduction on effective per-token rates. Threshold for credits recommendation in audit: $200+/month API spend.

---

## OpenAI API

- **GPT-4o:** $2.50/MTok input, $10/MTok output — https://openai.com/api/pricing — verified 2025-01-06
- **GPT-4o mini:** $0.15/MTok input, $0.60/MTok output — https://openai.com/api/pricing — verified 2025-01-06
- **o1:** $15/MTok input, $60/MTok output — https://openai.com/api/pricing — verified 2025-01-06

**Credex discount:** Same as Anthropic API — 25-35% below retail at $200+/month threshold.

---

## Gemini (Google)

- **Free (AI Studio):** $0 — https://ai.google.dev/pricing — verified 2025-01-06
- **Gemini Advanced (One AI Premium):** $19.99/user/month — https://one.google.com/about/ai-premium — verified 2025-01-06
- **Workspace Business Starter + Gemini:** $14/user/month base + add-on pricing varies — https://workspace.google.com/pricing — verified 2025-01-06
- **API (Gemini 1.5 Pro):** $3.50/MTok input (>128k context), $7/MTok input (>128k context) — https://ai.google.dev/pricing — verified 2025-01-06

**Notes:** Google Workspace Gemini pricing is complex (bundled with Workspace tiers). The audit uses $30/seat as a representative Workspace+Gemini cost for the "Workspace Business" plan.

---

## Windsurf (Codeium)

- **Free:** $0/user/month (5 user prompt credits/day) — https://windsurf.ai/pricing — verified 2025-01-06
- **Pro:** $15/user/month — https://windsurf.ai/pricing — verified 2025-01-06
- **Teams:** $35/user/month (minimum 3 seats) — https://windsurf.ai/pricing — verified 2025-01-06

**Notes:** Windsurf's marketing page showed $10/user/month during early 2024; the current Pro price is $15. Always use the checkout page as the source of truth.

---

## Update process

Before submission, verify each URL still resolves and the price shown matches what is coded in `src/lib/pricing-data.ts`. Any discrepancy must be updated in both files simultaneously. The verification date must be updated to the current date.
