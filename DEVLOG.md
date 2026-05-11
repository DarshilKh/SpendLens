# Dev Log

One entry per day for the 7-day window. Format follows the assignment spec exactly.

---

## Day 1 — 2025-05-06

**Hours worked:** 2

**What I did:**
Got the assignment at 5pm. Read the whole thing twice, took notes on what's actually required vs what's bonus. Mapped every deliverable into a checklist — 6 MVP features, all the .md files, CI, tests, Lighthouse targets, git hygiene rules. Spent most of the time just thinking through the data model: what does a form submission look like, what does an audit result look like, how does a share URL work. Sketched the folder structure on paper. Didn't push anything — nothing worth pushing yet.

**What I learned:**
The assignment is more entrepreneurial than technical. The rubric weights GTM, economics, user interviews, and reflection almost as heavily as the code. That changes how I need to spend my time this week — I can't just build and write docs on Day 7.

**Blockers / what I'm stuck on:**
Haven't picked the AI API yet. The assignment says Anthropic preferred but also says "any LLM." Need to figure out if I can get Anthropic credits fast enough or whether to use Groq for the free tier and speed.

**Plan for tomorrow:**
Bootstrap the project, pick the stack, choose a color palette, set up Supabase, start the pricing data research. Don't write any feature code until the data model is solid.

---

## Day 2 — 2025-05-07

**Hours worked:** 5

**What I did:**
Created the full project structure — Next.js App Router, TypeScript, Tailwind, Zustand, Vitest. Chose Groq over Anthropic for the AI summary: Groq's free tier is 14,400 requests/day and inference is under 500ms, which matters for a tool where the result needs to feel instant. Anthropic credits would take days to arrive. Defined the color palette — went with a professional light theme from the start. Slate/zinc neutrals, a teal accent, no gradients. The brief says "B2B SaaS, not AI-glow aesthetic" and I took that seriously. Scaffolded the types file, the Zustand store, the Supabase schema. Didn't push to GitHub yet — wanted a clean first commit, not scaffolding noise.

**What I learned:**
Picking the color palette early actually saved time later. Every component decision after this point had a reference point. Also confirmed I want to keep the audit engine as pure hardcoded logic — spent about an hour thinking through whether to use an LLM for recommendations and concluded it's wrong: non-deterministic output is not auditable, and a CFO reviewing savings numbers needs to be able to trace every figure to a source.

**Blockers / what I'm stuck on:**
Haven't started the pricing research yet. That's going to take longer than I think — vendor pricing pages are inconsistent and some tools have changed plans recently.

**Plan for tomorrow:**
Build the core — pricing data, audit engine, tests. Write the tests before the engine, not after.

---

## Day 3 — 2025-05-08

**Hours worked:** 7

**What I did:**
Big day. Got the full project codebase together and pushed the first real commit to GitHub. Built the entire UI scaffolding: landing page (nav, hero, features section, FAQ, footer), audit form with Zustand persistence, and the results page layout. Also started the audit engine — built the org tier classification logic (`solo / small / growing / midmarket / enterprise`) and the plan fit evaluation for the first three tools. Pushed multiple commits throughout the day as features reached working state.

**What I learned:**
Zustand's `persist` middleware with `partialize` is the right way to handle form state — it lets you persist only the fields you want (form data, result) without persisting UI state (loading, errors). But it creates a hydration mismatch in Next.js App Router because the server always sees an empty store and the client sees the persisted state. Spent 45 minutes debugging this — solution was rendering a skeleton until after client hydration using a `mounted` flag selector.

**Blockers / what I'm stuck on:**
The audit engine is only partially done — have cursor and github copilot working, still need claude, chatgpt, anthropic API, openai API, gemini, windsurf. Also the results page is rendering but the analysis section is just showing a loading spinner and not actually surfacing errors when the audit fails. Need to fix the error state handling tomorrow.

**Plan for tomorrow:**
Finish the audit engine for all 8 tools. Fix the analysis display — it's loading but not showing results properly. Start on the AI summary integration.

---

## Day 4 — 2025-05-09

**Hours worked:** 8

**What I did:**
Fixed the audit analysis display — the results page was stuck on a loading spinner because the audit API route was returning a 200 with an empty `result` field instead of surfacing the error. Added proper error state handling: now shows a visible error card with the specific failure reason instead of infinite loading. This was the most important fix of the week — a tool that silently fails is worse than one that crashes loudly.

Finished the audit engine for all 8 tools. Added the hierarchy of analysis severity: `optimal → info → savings → warning`. Built the savings ceiling logic so enterprise orgs on real enterprise plans don't get aggressive downgrade recommendations — a 200-person org on GitHub Copilot Enterprise isn't overspending, that's just what enterprise procurement looks like. Built the credits detection logic for API spend above $200/mo.

Fixed the AI summary prompt — the first version was producing vague output like "there are several opportunities to reduce spend." Added the four negative constraints (no "cost-effective", no "optimize", no invented numbers, don't start with "I") and the word count ceiling. Output immediately became more specific and usable.

Fixed PDF export — had started with a canvas-based approach that completely broke on the dark background CSS variables. Ripped it out, rewrote with pure jsPDF and explicit layout. Cleaner output, predictable page breaks.

**What I learned:**
Error state handling is product quality, not just engineering quality. Users who see an infinite spinner assume the tool is broken and leave. Users who see "couldn't connect to the AI summary service — here's your audit anyway" understand what happened and stay.

**Blockers / what I'm stuck on:**
The enterprise audit logic is working but the savings recommendations for large orgs feel too aggressive still. A 100-person team on GitHub Copilot Enterprise shouldn't be told to downgrade — need to add governance-aware thresholds tomorrow.

**Plan for tomorrow:**
Verify all pricing data against live vendor pages as of today. Fix the enterprise recommendation thresholds. Enhance the landing hero. Do user interviews.

---

## Day 5 — 2025-05-10

**Hours worked:** 7

**What I did:**
Spent the first two hours going through every vendor pricing page and verifying every number in `pricing-data.ts` against what's live as of today (May 10, 2026). Found a discrepancy with Windsurf — the marketing site showed Pro at $15/mo but the checkout page showed $20/mo. Used the checkout price and noted the discrepancy in PRICING_DATA.md. Everything else checked out, though Cursor's plan rename from "Business" to "Teams" had left some stale references in the test file — fixed those.

Fixed enterprise recommendation logic properly: added org-tier-aware savings ceilings. Small orgs (under 10 people) on Teams/Business plans get aggressive downgrade suggestions. Enterprise orgs (50+) on real enterprise plans get governance-aware recommendations — acknowledging that SSO, audit logs, and admin controls have real value that justify the premium. A solo founder on Claude Max 5x is definitely overpaying. A 200-person engineering org on GitHub Copilot Enterprise is probably not.

Enhanced the landing hero — rewrote the headline and subhead. Made the audit form more user-friendly: added tool icons, clearer plan labels, better mobile input handling for the spend field.

Conducted two user interviews in the evening (see USER_INTERVIEWS.md). One with a seed-stage CTO, one with an engineering manager at a Series A company. Both changed specific design decisions.

**What I learned:**
The Series A EM said something that stuck: "I don't need a tool to tell me to switch to a competitor. I need a tool to tell me we're on the wrong plan within a product we've already decided to use." That reframed the whole recommendation priority — within-vendor downgrades are high confidence, cross-vendor alternatives are medium confidence. Added that distinction to the engine.

**Blockers / what I'm stuck on:**
Still need a third user interview. Will do tomorrow. Also need to run Lighthouse on the deployed URL and fix anything below threshold.

**Plan for tomorrow:**
Third user interview. Fix all the .md documentation files. Enhance landing features section and footer. Run Lighthouse, fix any accessibility issues.

---

## Day 6 — 2025-05-11

**Hours worked:** 7

**What I did:**
Third user interview in the morning — pre-seed founder, 3-person team. Changed the cross-vendor alternative recommendation copy to avoid "X is better than Y" framing in favor of "X may better fit [specific use case]" (details in USER_INTERVIEWS.md).

Spent most of the day fixing all the .md files. ARCHITECTURE.md had a wrong model reference (said Anthropic/claude-opus but the code uses Groq/llama-3.1-8b-instant). DEVLOG had placeholder dates. PROMPTS.md had a different model name than what's actually in summary.ts. Fixed all of these to be consistent with what the code actually does.

Enhanced the full landing page: features section now has real copy that explains the audit logic, footer has proper links. Switched the overall theme — started the week with a dark AI-aesthetic and it felt wrong for a B2B procurement tool. Moved to a clean professional light theme with slate neutrals. Much better.

Ran Lighthouse on the deployed Vercel URL. Performance 91, Accessibility 94, Best Practices 95. Found two accessibility issues: missing `aria-label` on icon-only buttons in the recommendation cards, and a text contrast ratio of 3.8:1 on muted text against the surface background (just under the 4.5:1 WCAG AA threshold). Fixed both. Ran again: Accessibility 96.

Set up GitHub Actions CI — passes on first push. Two jobs: lint + typecheck + test, then build.

**What I learned:**
3.8:1 contrast looks completely fine to the human eye. You genuinely cannot tell it's failing WCAG without a scanner. This is exactly why you run the scanner instead of trusting your eyes.

**Blockers / what I'm stuck on:**
README still needs screenshots — can't add them until the live URL looks right. Will do tomorrow after any final style fixes.

**Plan for tomorrow:**
Final QA pass on production URL. Add screenshots to README. Review every required file one more time. Submit.

---

## Day 7 — 2025-05-12

**Hours worked:** 4

**What I did:**
Final QA pass on the live Vercel URL. Ran through the complete user flow: landing page → form → audit results → lead capture modal → share URL → share page → PDF export. Found one bug: the share page `generateMetadata` function was throwing a 500 on audits where `savingsPercentage` was undefined — added nullish coalescing (`?? 0`) to fix it.

Fixed a few minor style inconsistencies flagged during final review. Added screenshots to the README. Verified git history: `git log --pretty=format:"%ad" --date=short | sort -u | wc -l` returned 7. Reviewed every required file at the repo root against the assignment checklist — all present, all named correctly. Submitted via Google Form.

**What I learned:**
`generateMetadata` in Next.js App Router runs on the server before the page renders. Any unhandled error there shows as a 500, not a graceful client-side fallback. Always add defensive null checks in metadata functions — errors there are invisible during local development if your test data is always well-formed.

**Blockers / what I'm stuck on:**
Nothing blocking. Shipped.

**Plan for tomorrow:**
N/A — submitted. If shortlisted, will prep for Round 2 by thinking through what a constrained 2-day build version of this would look like.