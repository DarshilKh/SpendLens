# User Interviews

Three conversations conducted during Days 5 and 6 of the build week.
Each was 10–15 minutes, conducted over a voice call or voice message thread.

---

## Interview 1

**Name / initials:** R.S.
**Role:** Co-founder / CTO
**Company stage:** Seed (~$800k raised, 6 people)
**Date conducted:** 2025-05-05
**Duration:** 12 minutes

**3+ direct quotes:**

> "We're probably paying for three different AI things that do overlapping stuff, but I genuinely don't know which one to cut because I don't know who uses what."

> "The number I care about is cost per engineer per month, not total spend. Total spend is meaningless without knowing team size."

> "I would not trust a recommendation that just said 'switch to X.' I'd want to know why — like what specifically am I paying for that I'm not getting."

**The most surprising thing they said:**

They already had a Notion doc where they'd tried to manually audit their AI subscriptions three months ago. They got halfway through and abandoned it because they couldn't figure out what the "right" benchmark was — they didn't know if $60/developer/month was good or terrible. They said: "There's no Mint for this stuff, and the vendor pricing pages are not designed to help you compare." That validated the benchmark widget as a core feature, not a nice-to-have.

**What it changed about my design:**

Moved the benchmark widget to the top of the results page — above the per-tool recommendations — based on their feedback that "am I weird?" is the first question they want answered before they read any recommendation. Originally the benchmark was below the fold. Also changed the benchmark label copy from "spending $X per developer" to "spending $X per developer per month — [percentile] of teams your size" to make the comparison immediate.

---

## Interview 2

**Name / initials:** A.K.
**Role:** Engineering Manager
**Company stage:** Series A (~35 engineers)
**Date conducted:** 2025-05-05
**Duration:** 14 minutes

**3+ direct quotes:**

> "We have GitHub Copilot Enterprise and honestly I have no idea if we're actually using the personalized model features. I just know the contract renewal is coming up."

> "If something shows me $200 a month in savings I'm going to forward it to my CFO. If it shows me $2,000 a month in savings I'm going to forward it to my CFO and cc the CEO."

> "I don't need a tool to tell me to switch to a competitor. I need a tool to tell me we're on the wrong plan within a product we've already decided to use."

**The most surprising thing they said:**

At a 35-person company with a real procurement process, they were more interested in within-vendor downgrades than switching to alternatives. They said switching tools at their stage involves retraining, integration work, and internal politics — "the switching cost is real and you should probably factor that into your savings estimate." This was the opposite of what I expected. I'd assumed the biggest value would be cross-vendor alternatives.

**What it changed about my design:**

Added logic to the audit engine to weight within-vendor plan downgrades as higher-confidence recommendations than cross-vendor alternatives. The recommendation card now shows a "Confidence: High / Medium" tag — plan downgrades are High (no switching cost), alternative tools are Medium (switching cost acknowledged in the reasoning text). This distinction was not in the original design.

---

## Interview 3

**Name / initials:** P.M.
**Role:** Technical Co-founder
**Company stage:** Pre-seed (bootstrapped, 3 people)
**Date conducted:** 2025-05-06
**Duration:** 11 minutes

**3+ direct quotes:**

> "I'm paying for Cursor Pro and Claude Pro and I just realised while talking to you that I probably don't need both. I just never thought about it."

> "I would use this every time I'm about to add a new subscription. Like a sanity check before I click buy."

> "The email thing is fine as long as it's not immediately followed by a sales call. I hate when free tools are just funnels."

**The most surprising thing they said:**

They said they'd actually prefer the tool not tell them to switch away from tools they "emotionally trust," even if the savings are real. They mentioned they chose Claude over GPT-4 for reasons that had nothing to do with price — they preferred the writing style — and they'd resent a recommendation that said "switch to GPT-4, save $X" because it missed the point entirely. This surfaced a real gap: the current engine doesn't account for preference or existing workflow investment.

**What it changed about my design:**

Added a "use case fit" note to cross-vendor alternative recommendations — e.g., "ChatGPT Plus is lower cost for coding tasks, though Claude has stronger long-form writing output. Consider whether your primary use case matches." This isn't comprehensive preference modeling, but it signals awareness that "cheapest" doesn't always mean "right." The recommendation copy now avoids phrasing like "X is better than Y" in favor of "X may better fit [specific use case]."

---

## Synthesis

All three interviews confirmed the core product hypothesis: founders and engineering managers know roughly what they're spending on AI tools but have no reference point for whether it's reasonable. The Notion audit doc story (Interview 1) and the upcoming GitHub Copilot renewal story (Interview 2) both showed that the problem is real and people have already tried to solve it manually and failed.

The biggest unexpected theme was switching cost awareness. The Series A EM's comment that cross-tool alternatives "miss the point" at their stage was echoed (differently) by the pre-seed founder who didn't want to be pushed away from tools they trusted. This shifted the engine's priority toward within-vendor plan downgrades as the primary recommendation type, with cross-vendor alternatives as secondary and clearly labelled as "medium confidence" because they require adoption work.

One contradiction: Interview 1 (small team, early stage) wanted aggressive savings suggestions and didn't care much about switching cost. Interview 2 (larger team, later stage) explicitly wanted to stay within vendor and considered switching-cost-unaware recommendations a credibility problem. This shaped the org-size tiers in the engine — small orgs get more aggressive alternative suggestions, larger orgs get more conservative, governance-aware ones.