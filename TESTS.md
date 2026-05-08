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

| Test | What it covers |
|------|----------------|
| `returns a valid result structure` | Engine output has all required fields and correct shape |
| `correctly totals current monthly spend` | Aggregation math across multiple tools |
| `annual savings = monthly savings × 12` | Derived field consistency |
| `flags Cursor Business as overpaying for a 2-person team` | Core plan downgrade rule for small teams |
| `does NOT flag Cursor Business for a 20-person team` | Negative case — appropriate plan for larger teams |
| `flags GitHub Copilot Enterprise under 15 seats` | Enterprise over-provisioning detection |
| `flags ChatGPT Team with 1 seat` | Single-user team plan detection |
| `marks Cursor Pro for 3-person coding team as optimal` | Already-optimal case |
| `suggests credits for Anthropic API over $200/mo` | Credits opportunity detection |
| `does NOT suggest credits under $200/mo` | Credits threshold negative case |
| `highSavingsCase=true when savings > $500/mo` | Credex CTA trigger condition |
| `highSavingsCase=false when savings are small` | Low-savings negative case |
| `calculates spend per developer correctly` | Benchmark math |
| `includes a label string in benchmark` | Benchmark output shape |
| `benchmark percentile is between 0 and 100` | Percentile boundary conditions |
| `handles empty tools array gracefully` | Edge case — no tools |
| `totalMonthlySavings is never negative` | Math invariant |
| `savingsPercentage is 0 when no spend` | Division-by-zero guard |
| `multiple tools with mixed recommendations` | Integration-style test across 3 tools |
| `generates unique share slugs` | UUID/slug uniqueness |

**Total: 20 tests** (exceeds the required minimum of 5)

---

## Known limitations

1. **In-memory rate limiter** (`/api/audit`): The rate limiter uses a `Map` stored in Node.js process memory. On Vercel, each serverless function invocation may run in a different instance, so the rate limit does not persist across instances. In production, replace with Upstash Redis (`@upstash/ratelimit`).

2. **No integration tests for API routes**: The API routes (`/api/audit`, `/api/leads`) are not covered by automated tests because they require live Supabase and Resend credentials. Manual testing was performed end-to-end. In a production codebase, these would be tested with `@supabase/auth-helpers-nextjs` test utilities and mocked Resend responses.

3. **No UI tests**: No Playwright or Cypress tests. The form interactions, modal, and results rendering were manually tested across Chrome, Firefox, and Safari. Component-level tests with React Testing Library would be the next addition.

---

## CI

Tests run automatically on every push to `main` via `.github/workflows/ci.yml`. The workflow:
1. Type-checks with `tsc --noEmit`
2. Lints with `next lint`
3. Runs `npm test` (all Vitest tests)
4. Builds the Next.js app (catches any build-time errors)

The workflow uses placeholder environment variables for API keys so tests pass without live credentials.
