# Tests

All tests are in the `tests/` directory. Run with:

```bash
npm test              # Run all tests once
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

---

## Test files

### `tests/audit-engine.test.ts`

The core test file. Covers the audit engine (`src/lib/audit/engine.ts`) exhaustively.

**How to run:**
```bash
npx vitest run tests/audit-engine.test.ts
```

**Note on plan IDs:** Cursor renamed its "Business" plan to "Teams" in early 2025. GitHub Copilot's "Individual" plan is now "Pro". Tests use the current plan IDs (`teams`, `pro`) that match `src/lib/pricing-data.ts`.

| Test | What it covers |
|------|----------------|
| `returns all required fields` | Engine output shape — all required properties present |
| `recommendation includes severity and statusLabel` | Per-recommendation shape validation |
| `correctly totals current monthly spend` | Aggregation math across multiple tools |
| `annual savings = monthly x 12` | Derived field consistency invariant |
| `generates unique share slugs and IDs` | UUID/slug uniqueness across two calls with identical input |
| `flags Cursor Teams as overprovision for a 3-person team` | Core plan downgrade rule: Teams plan not justified under ~5 seats |
| `does NOT flag Cursor Teams for an 8-person team` | Negative case — Teams plan appropriate at scale |
| `does NOT flag Cursor Teams for a 12-person team` | Boundary case — was a regression bug, now a pinned test |
| `flags GitHub Copilot Enterprise for teams under 15 seats` | Enterprise over-provisioning: personalised models need 15+ devs of data |
| `does NOT flag GitHub Copilot Enterprise for 15+ seats` | Enterprise negative case |
| `flags ChatGPT Business with 1 seat as single-user waste` | Single-user team plan detection |
| `marks Cursor Pro for 5-person coding team as optimal` | Already-optimal case — no false positives |
| `suggests credits for Anthropic API spend over $200/mo` | Credits opportunity detection; credexRelevant flag |
| `does NOT suggest credits for spend under $200/mo` | Credits threshold negative case |
| `applies higher discount for spend over $1000/mo` | Tiered discount rate — higher volume earns better rate |
| `highSavingsCase=true when savings > $500/mo` | Credex CTA trigger condition |
| `highSavingsCase=false for small savings` | Low-savings negative case — no false Credex CTAs |
| `totalMonthlySavings is never negative` | Math invariant — savings floor at 0 |
| `savingsPercentage is 0 when no spend` | Division-by-zero guard |
| `handles empty tools array without throwing` | Edge case — empty input does not crash |
| `calculates spend per developer correctly` | Benchmark arithmetic: totalSpend / teamSize |
| `benchmark percentile is clamped between 0 and 100` | Percentile boundary conditions |
| `produces a non-empty benchmark label` | Benchmark output shape |
| `Cursor Teams with 5 seats is borderline — info or optimal` | Threshold boundary: not an aggressive downgrade at exactly 5 seats |
| `Windsurf Teams with 2 seats flags overprovision` | Non-Cursor plan downgrade rule |
| `Claude Max 5x with 5 seats on 10-person team triggers warning` | Personal high-tier plan vs team size mismatch |
| `GitHub Copilot Pro with 12-person team suggests upgrade` | Under-provisioning detection: Pro plan missing admin controls at scale |
| `multi-tool mixed result produces correct totals` | Integration-style test across 3 tools with different recommendation types |

**Total: 28 tests** (exceeds the required minimum of 5)

---

## Known limitations

1. **In-memory rate limiter** (`/api/audit`): The rate limiter uses a `Map` stored in Node.js process memory. On Vercel, each serverless function invocation may run in a different instance, so the rate limit does not persist across cold starts. In production, replace with Upstash Redis (`@upstash/ratelimit` sliding window).

2. **No integration tests for API routes**: The API routes (`/api/audit`, `/api/leads`) are not covered by automated tests because they require live Supabase and Resend credentials. Manual end-to-end testing was performed on the Vercel deployment. In a production codebase, these would be tested with mocked Supabase responses and a Resend test mode.

3. **No UI tests**: No Playwright or Cypress tests. The form interactions, modal, and results rendering were manually tested across Chrome, Firefox, and Safari. Component-level tests with React Testing Library would be the next addition in a production codebase.

---

## CI

Tests run automatically on every push to `main` via `.github/workflows/ci.yml`. The workflow:
1. Type-checks with `tsc --noEmit`
2. Lints with `next lint`
3. Runs `npm test` (all Vitest tests)
4. Builds the Next.js app (catches any build-time errors)

The workflow uses placeholder environment variables for API keys so the build and tests pass in CI without live credentials.