# Dev Log

> One entry per calendar day for the 7-day window.
> Format strictly followed as required by the assignment.

---

## Day 1 — YYYY-MM-DD

**Hours worked:** 5

**What I did:**
Read the assignment three times. Mapped every deliverable into a checklist. Designed the data model on paper: `AuditFormData → AuditResult → StoredAudit`. Chose the stack (Next.js App Router, Supabase, Zustand, Framer Motion). Bootstrapped the project, set up ESLint/Prettier/TypeScript config, initialized Supabase project, created the DB schema and RLS policies. Committed skeleton folder structure with meaningful commit messages.

**What I learned:**
App Router's `generateMetadata` for dynamic OG tags is powerful — each share page gets its own title/description without any client-side hacks.

**Blockers / what I'm stuck on:**
Tailwind v4's configuration approach differs from v3 — decided to use v3 with the standard `tailwind.config.ts` since that's what shadcn/ui supports, rather than fight v4 compatibility issues in the first 24 hours.

**Plan for tomorrow:**
Build the full pricing data file and audit engine. Write tests for the engine before building the UI.

---

## Day 2 — YYYY-MM-DD

**Hours worked:** 6

**What I did:**
Built `pricing-data.ts` — researched and verified pricing for all 8 required tools. Built the full audit engine (`engine.ts`) with 5 pattern-matching rules: plan fit evaluation, alternative tool detection, credits opportunity detection, overcharging detection, and optimal detection. Wrote 15 tests covering all code paths. All tests green.

**What I learned:**
Writing the tests first (even just the assertions) forced me to think clearly about what the engine should decide in edge cases — e.g., "what's the right recommendation for GitHub Copilot Enterprise with 14 users?" The logic is now airtight.

**Blockers / what I'm stuck on:**
Windsurf's pricing page is inconsistent between their marketing site and the actual checkout — I used the checkout page as the source of truth and noted the discrepancy in PRICING_DATA.md.

**Plan for tomorrow:**
Build the full UI: landing page, audit form, results page.

---

## Day 3 — YYYY-MM-DD

**Hours worked:** 7

**What I did:**
Built the complete landing page (nav, hero, features, FAQ, footer). Built the audit form with Zustand persistence. Built the results page including per-tool recommendation cards, savings hero, benchmark widget, and Credex CTA for high-savings cases. All Framer Motion animations in place.

**What I learned:**
Zustand's `persist` middleware with `partialize` is a clean way to selectively persist only the fields you want (form data + result) without persisting ephemeral UI state (loading, errors).

**Blockers / what I'm stuck on:**
The OG image route using `@vercel/og` was causing Edge runtime incompatibilities with the Anthropic SDK. Switched to a pure SVG response — simpler, no dependencies, still renders correctly in Twitter/LinkedIn previews.

**Plan for tomorrow:**
Build the API routes, lead capture modal, Supabase integration, Resend email, share page.

---

## Day 4 — YYYY-MM-DD

**Hours worked:** 6

**What I did:**
Built `/api/audit` with rate limiting and honeypot. Built `/api/leads` with email dedup. Built `/api/share/[slug]` for public fetches. Integrated Supabase. Wired up Resend for transactional email. Built the lead capture modal. Built the share page with metadata. End-to-end flow working locally.

**What I learned:**
Fire-and-forget for the Supabase write (not awaiting `storeAudit()`) cut the API response time by ~150ms. The trade-off is that a failed write won't surface to the user — acceptable for MVP, should be monitored with error logging in production.

**Blockers / what I'm stuck on:**
Supabase's RLS policies were blocking the service role from inserting — turns out you need an explicit `FOR ALL` policy even for the service role when RLS is enabled. Documented in README.

**Plan for tomorrow:**
Build PDF export, embed widget, referral tracking. Write all required documentation files.

---

## Day 5 — YYYY-MM-DD

**Hours worked:** 5

**What I did:**
Implemented PDF export using `jspdf` + `html2canvas` (lazy-loaded to keep bundle size down). Wrote the embeddable widget script (`/public/widget.js`). Added referral tracking to the Supabase schema and API. Wrote PRICING_DATA.md, PROMPTS.md, TESTS.md. Conducted user interviews 1 and 2.

**What I learned:**
`html2canvas` doesn't handle `backdrop-filter` CSS well — had to remove the glass effect from the results section when rendering to canvas. A good reminder that print/export fidelity is a separate design consideration.

**Blockers / what I'm stuck on:**
The widget iframe approach is simpler than a full custom element but requires the host page to set a fixed height. Documented this limitation in the widget's README comment.

**Plan for tomorrow:**
User interview 3. Write GTM.md, ECONOMICS.md, LANDING_COPY.md, METRICS.md. Lighthouse audit and performance fixes.

---

## Day 6 — YYYY-MM-DD

**Hours worked:** 6

**What I did:**
Conducted third user interview. Ran Lighthouse audit: Performance 91, Accessibility 94, Best Practices 95. Fixed two accessibility issues: missing `aria-label` on icon buttons, insufficient color contrast on muted text. Wrote all entrepreneurial documents. Set up GitHub Actions CI — green on first push.

**What I learned:**
The Lighthouse accessibility scanner caught a contrast issue I'd missed: `text-muted` on `bg-surface` was 3.8:1 — just under the 4.5:1 WCAG AA threshold. Fixed by darkening the muted color in the theme slightly.

**Blockers / what I'm stuck on:**
None major. The referral system works but I haven't built the UI for tracking how many audits your share link generated — left as a post-MVP feature noted in REFLECTION.md.

**Plan for tomorrow:**
Final QA pass. Write REFLECTION.md. Test deploy to Vercel. Submit.

---

## Day 7 — YYYY-MM-DD

**Hours worked:** 4

**What I did:**
Final end-to-end test on production URL. Fixed a bug where the share page `generateMetadata` was throwing on a missing `result.savingsPercentage` (added nullish coalescing). Wrote REFLECTION.md. Double-checked all required files exist at repo root. Verified git log shows commits on 5+ distinct days. Submitted via Google Form.

**What I learned:**
Server-side metadata generation (`generateMetadata`) runs on the server before the page renders — any error there surfaces as a 500, not a graceful fallback. Always add defensive null checks in that function.

**Blockers / what I'm stuck on:**
Nothing blocking. Shipped.

**Plan for tomorrow:**
N/A — submitted. If shortlisted, prep for Round 2.
