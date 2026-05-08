# Metrics

---

## North Star Metric

**Audits completed per week**

**Why this, not something else:**

SpendLens is a B2B lead-gen tool where value is delivered in a single session. An audit completed = a user who saw the savings data. That's the moment of value creation. It's also the leading indicator for everything downstream (email capture, consultation booking, credit purchase).

"DAU" is wrong because most users will use this once per quarter at most — it would always look low. "Revenue" is wrong because Credex's revenue conversion is a lagging indicator with a 2-4 week sales cycle. "Site visits" is wrong because it doesn't measure whether we convinced anyone the tool is worth their 2 minutes.

An "audit completed" happens when a user fills the form, gets results, and the result page renders. It's unambiguous and directly measures product value delivered.

---

## 3 Input Metrics That Drive the North Star

### 1. Form start rate (visits → form starts)
**Target:** >30%
**What it measures:** Whether the landing page is convincing people to try.
**What moves it:** Hero copy clarity, CTA placement, social proof, tool list visibility.
**What a bad number tells you:** The value proposition isn't clear above the fold, or the "no signup required" messaging isn't prominent enough.

### 2. Form completion rate (starts → completed audits)
**Target:** >65%
**What it measures:** Whether the form UX is good and friction is low enough.
**What moves it:** Form length, field labels, real-time expected cost hints, tool selection UX.
**What a bad number tells you:** The form is too long or confusing. Most likely: the "Actual $/mo" field is intimidating people who don't know their exact spend — add "estimate is fine" copy.

### 3. Email capture rate (audits → email captures)
**Target:** >30% overall; >55% for high-savings cases
**What it measures:** Whether users found enough value to share contact info.
**What moves it:** Savings results quality, how the lead capture modal is presented, trust copy.
**What a bad number tells you:** Either savings recommendations aren't credible, or the email gate is showing up too early / too aggressively.

---

## What I'd instrument first

In order of priority:

1. **`audit_completed`** — fire when the results page renders successfully. Properties: `total_monthly_savings`, `savings_percentage`, `tool_count`, `use_case`, `team_size`, `high_savings_case`.

2. **`form_started`** — fire when the user adds their first tool. No properties needed; just a count.

3. **`email_captured`** — fire on successful lead submission. Properties: `wants_consultation`, `monthly_savings`.

4. **`share_link_copied`** — fire on the copy button click. Properties: `monthly_savings` (are high-savings audits shared more often?).

5. **`consultation_requested`** — fire when `wantsConsultation = true` on lead submit.

**Tool:** Posthog (open-source, self-hostable, generous free tier). One `posthog.capture()` call per event. No page view tracking needed initially — the funnel events tell the full story.

---

## The number that triggers a pivot decision

**If form completion rate drops below 40% for two consecutive weeks.**

Below 40% means more than 6 in 10 people who start the form don't finish it. That's not a UX polish problem — that's a fundamental mismatch between what the landing page promises and what the form asks for. The pivot decision: either simplify the form to 3 fields (tool, plan, seats — infer spend from plan pricing), or add a "quick mode" that asks only for the top tool.

Secondary trigger: **if the high-savings email capture rate drops below 35%.**

High-savings users (>$500/mo savings) who don't capture the report are leaving significant value on the table. Below 35% means either the savings numbers aren't credible (pricing data error?) or the modal is too pushy. This would trigger an immediate A/B test on modal copy and timing.

---

## Metrics not to track (and why)

- **Time on site:** Not meaningful for a tool people use in 2 minutes; optimizing for it would make the tool slower, not better.
- **Bounce rate:** The landing page has one job — get people to click CTA. A "bounce" might be someone who clicked the CTA from a tweet, went to `/audit`, and never hit the home page. The standard bounce metric is misleading for this funnel.
- **Social media followers:** Vanity metric. One well-placed HN post beats 1,000 followers every time.
