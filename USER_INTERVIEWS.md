# User Interviews

Three conversations conducted during Days 5 and 6 of the build week.
Each was 10–15 minutes, conducted over a voice call or voice message thread.

---

## Interview 1

**Name / initials:** A.G.
**Role:** Student / indie builder
**Company stage:** Pre-revenue, solo — working on an AI agent project
**Date conducted:** 2025-05-05
**Duration:** 7 minutes

**3+ direct quotes:**

> "I've spent around $1,200 getting this project off the ground and a big chunk of that is just AI tools I'm paying for at the same time — Claude, Copilot, Kimi for reasoning stuff, GPT."

> "I already use Groq because someone told me it was faster and cheaper. I don't even know if I set it up the right way. I just know it's running."

> "I have a 1,660-line prompt file I built in Perplexity two months ago. I use it as a kind of system prompt for everything — I save the session, export to markdown, upload it again. It's basically my memory layer."

**The most surprising thing they said:**

They'd built a surprisingly sophisticated personal workflow using `.agent` and `.rules` files inside Perplexity to get something close to a persistent context — basically homebrew memory management. They weren't complaining about the cost so much as the chaos of having no clear view of what they were actually paying per tool and whether any of it was redundant. They said: "I know I'm probably paying for three things that do similar stuff. I just haven't sat down to figure it out because I don't even know what the right benchmark is for someone like me." That last part landed hard — the benchmark problem isn't just a company problem, it's personal too.

**What it changed about my design:**

Their workflow surfaced a use case I hadn't accounted for: solo builders who stack tools aggressively and have no finance process to catch waste. The current benchmark tiers assume team context (cost per developer). Added a solo/individual tier to the benchmark logic — "spending $X/month as a solo builder" with a separate reference range. Also noted genuine interest from A.G. in using SpendLens once it's live, which confirmed the tool has pull beyond the CTO/EM audience I'd been designing for.

---

## Interview 2

**Name / initials:** P.W.
**Role:** Digital marketing expert / educator
**Company stage:** Independent — teaches and consults, uses AI tools daily
**Date conducted:** 2025-05-05
**Duration:** 6 minutes

**3+ direct quotes:**

> "I use Claude for most of my actual thinking work. The others I've tried but I keep coming back. It's not about price for me — it's about whether the output is actually good."

> "If I'm going to downgrade something, I need to understand why. Not just 'you'll save $15.' Tell me what I'm actually giving up and whether it matters for how I use it."

> "It's a good idea. The problem it's solving is real. I just want to make sure it's not going to tell me to switch things that are working."

**The most surprising thing they said:**

P.W. said they primarily rely on their own judgment before trusting any tool recommendation — which initially sounded like a blocker, but wasn't. What they actually meant was that they'd engage seriously with a well-reasoned recommendation but would reject anything that felt generic or one-size-fits-all. They brought up that most AI spend advice online is written for engineering teams and doesn't account for people who use these tools for creative or strategic work, where "the cheapest option" is often not fit for purpose. That reframing — cost advice that acknowledges use case fit — directly influenced the copy around findings.

**What it changed about my design:**

Tightened the reasoning copy on recommendation cards. Instead of "switch to X, save $Y," findings now lead with what specifically about the current plan is underused or mismatched, then present the saving. Also added a caveat line to cross-vendor alternatives: "consider whether your primary use case aligns" — directly from this conversation. P.W. also confirmed interest in using the tool but said they'd only act on a recommendation if the reasoning held up independently, which is a credibility standard we should be designing toward anyway.

---

## Interview 3

**Name / initials:** R.S.
**Role:** Peer / early-stage founder
**Company stage:** Pre-seed, 3–5 people, training a custom model on Gemini API
**Date conducted:** 2025-05-06
**Duration:** 8 minutes

**3+ direct quotes:**

> "We're basically living inside the Gemini API right now. Every training run, every eval — it all hits the API. I calculate the cost per run manually in a spreadsheet."

> "I'm not really the target user for this, honestly. When you're training models you kind of have to track spend obsessively anyway — it's not something you can afford to be vague about."

> "I get what you're building but for me the problem doesn't exist the way it does for you. The moment you have GPU costs in the mix, subscription pricing feels small."

**The most surprising thing they said:**

R.S. was the clearest "not the user" signal across the three interviews — which was actually useful data. They weren't dismissive of the product, just precise about why it didn't apply to them. Their spend is all API usage tied to model training, tracked at the run level, with no subscription-based tooling to audit. The entire value proposition of SpendLens — catching waste in seat-based subscriptions — doesn't map onto their workflow. What was interesting: they said their concern was compute cost per training epoch, not per-seat pricing, which put a hard lower bound on the addressable audience. Teams that have crossed into custom model training have a different cost structure entirely.

**What it changed about my design:**

Clarified the ICP framing in my head. SpendLens is for teams using off-the-shelf AI tooling on subscription plans — not teams running custom training pipelines or doing heavy API volume with tracked usage. The copy already leans this way implicitly ("AI tools your team uses"), but this conversation made me more confident about not trying to stretch the product to cover API cost optimization in a granular way. Keeping the scope tight is the right call for now.

---

## Synthesis

All three conversations pointed toward the same core problem from different angles: people using AI tools have a reasonable sense of what they're spending but no reference point for whether it's appropriate. A.G. was spending $1,200+ across a personal project without a clear view of redundancy. P.W. was using premium plans and open to optimization, but only with reasoning that respected how they actually work. R.S. was out of scope entirely — which sharpened who is in scope.

The most consistent theme across the two relevant interviews was that recommendations need to feel earned. Neither A.G. nor P.W. would act on a finding that said "switch to X" without a specific reason tied to their actual usage pattern. That reinforced the existing design decision to lead with evidence (underused features, mismatched tier) before the saving, and to label cross-vendor alternatives as medium confidence with use-case caveats.

One thing R.S. pointed out really stuck with me: once a team starts training custom models, subscription tracking stops being their main concern. At that stage, their priorities shift elsewhere. That creates a pretty natural limit for who SpendLens is actually built for, and it’s a strong argument for keeping the product focused on subscription management instead of branching into broader API cost tracking.