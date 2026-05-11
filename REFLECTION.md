# Reflection

---

## 1. The hardest bug this week

**The bug:** The audit results page showed a React hydration mismatch error in production (but not locally). The server-rendered HTML had different content than the client-rendered HTML for the savings numbers, causing a flicker and a console error.

**Hypothesis 1:** The Zustand `persist` middleware was loading stale audit data from localStorage and rendering it on the first client render, before the server had a chance to produce the same data. I verified this by opening the page in an incognito window — no error. That confirmed it was localStorage-dependent.

**Hypothesis 2:** The `formatCurrency` function was producing locale-specific output that differed between the Node.js server environment and the browser. I wrapped the results component in a client-only render guard (`useEffect` to set a `mounted` flag) — still happened.

**What I tried:** Checked the Zustand docs for SSR-safe patterns. Found that `persist` hydrates asynchronously — the server always sees an empty store, the client sees the persisted state, and React sees a mismatch.

**What worked:** Used Zustand's `useStore` hook with a selector that returns `undefined` until after hydration, and rendered a skeleton instead. This eliminated the mismatch entirely. The pattern is: `const result = useAuditStore((s) => s.auditResult); if (!result) return <Skeleton />;` — the skeleton renders on both server and client on first paint, and then hydrates to the real state.

---

## 2. A decision I reversed mid-week

**Original decision:** On Day 1 I planned to use the Anthropic API to generate the audit recommendations themselves — prompt: "Given this tool, plan, seat count, and spend, is the user overpaying? Respond with JSON containing recommendedAction, reason, and estimatedSavings." The idea was that an LLM would handle edge cases I hadn't thought of and reduce the amount of rule-writing I'd need to do.

**Why I reversed it:** On Day 2, while writing the first tests, I ran the same input three times and got three slightly different `estimatedSavings` values. That was the moment I knew the approach was wrong. Audit recommendations that show "$240/month savings" on one run and "$190/month" on the next are not audit recommendations — they're opinions. A CFO reviewing this output needs to be able to ask "how did you get that number?" and get a traceable answer. LLM reasoning can't give you that. There's also a subtler problem: the model would sometimes recommend switching tools based on capability reasoning that contradicted the user's stated use case. It had no way to know that a writing team shouldn't be told to switch to Cursor.

**What I did instead:** Hardcoded deterministic rule-based logic against verified pricing data. Every recommendation has a `reasoning` string that cites the exact price delta and the threshold rule that triggered it — e.g., "Cursor Teams ($40/seat) requires a minimum 3-seat purchase; your 2-person team is paying for a seat nobody uses. Downgrade to Pro ($20/seat) — identical model access, no seat minimum." A finance person can verify every claim in under 30 seconds. AI is strictly reserved for the summary paragraph, where synthesis and narrative tone are the goal, not arithmetic.

---

## 3. What I'd build in week 2

**Priority 1: Slack and Linear integrations.** The highest-value follow-up is being able to push the audit results directly to a Slack channel or create a Linear ticket assigned to the CTO/CFO. Right now the share URL is the distribution mechanism — but many teams would prefer "post to #finance-ops" over "copy a link."

**Priority 2: Historical spend tracking.** Let users re-run the audit monthly and compare results over time. Show a sparkline of their AI spend per developer over 6 months. This turns a one-shot tool into a recurring SaaS touchpoint and dramatically increases the probability of a Credex conversion.

**Priority 3: A Credex marketplace integration.** When the audit surfaces "you could save 35% on Anthropic API with credits," there should be a one-click path to actually purchasing those credits through Credex — not just a "book a consultation" CTA. That requires a Credex product integration I don't have access to, but the UI hookpoint is already in place (`credexRelevant` flag on each recommendation).

**Priority 4: Team invite and shared audits.** Right now one person runs an audit and shares a read-only URL. Teams want to collaboratively annotate recommendations and track action items. A lightweight commenting layer on the share page would address this.

---

## 4. How I used AI tools

**Tools used:** Claude (claude.ai) and GitHub Copilot.

**What I used Claude for:**
- Drafting the initial PROMPTS.md content and reasoning about prompt design
- Reviewing my pricing data for obvious errors ("does this Gemini pricing look right?")
- Brainstorming the `ALTERNATIVE_MAP` — what substitution recommendations actually make sense
- Writing the first draft of the email HTML template (then heavily editing it)
- Debugging the Supabase RLS policy issue — I pasted the error and it immediately identified the missing `FOR ALL` clause

**What I used Copilot for:**
- Autocomplete on repetitive TypeScript types and Zod schemas
- The `formatCurrency` utility (standard Intl.NumberFormat pattern)

**What I didn't trust AI with:**
- The core audit engine logic. I wrote this myself because the recommendations need to be financially defensible and I needed to understand every decision. AI-generated audit logic would be untestable at the reasoning level.
- The pricing data. I verified every number against official vendor pages myself. AI's training data is stale and vendor pricing changes frequently.
- The user interview notes. These had to be real.

**One specific time AI was wrong:**
I asked Claude to suggest the `minSeats` for GitHub Copilot Enterprise's "personalized models" feature to be worthwhile. It said "5 users." I double-checked with actual GitHub documentation and Copilot's own published guidance, which suggests the fine-tuned model quality improvements are negligible below 15-20 engineers with 6+ months of data. I used 15 in the audit engine and cited the rationale in the recommendation reasoning.

---

## 5. Self-ratings

| Dimension | Score | Reason |
|-----------|-------|--------|
| **Discipline** | 8/10 | Committed across 7 days with meaningful progress each day. I lost a few hours on Day 3 to a rabbit hole on OG image rendering that I should have timeboxed harder. |
| **Code quality** | 8/10 | The codebase is modular, typed correctly, and testable. I'd dock points for the in-memory rate limiter (not production-safe across serverless instances) and the lack of error boundaries on the results page. |
| **Design sense** | 7/10 | The UI is clean and uses the design system consistently. The results page is screenshot-worthy. I'd go 8+ if I'd had time to add micro-interactions on the form and a proper empty state for the tool list. |
| **Problem-solving** | 9/10 | The hydration bug solution was solid. The decision to avoid AI for the core engine was correct and I caught it early. I made good trade-off calls under time pressure. |
| **Entrepreneurial thinking** | 8/10 | I treated this as a real product — lead capture after value, honest "you're already optimized" messaging, financial credibility in recommendations. The user interviews surfaced two design changes I wouldn't have made otherwise. I'd rate myself higher if I had more distribution channel experience to draw from. |