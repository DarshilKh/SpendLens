# Unit Economics

## What a converted lead is worth to Credex

Credex's business model: source overstock AI infrastructure credits at a discount from companies that over-provisioned, sell to startups below retail. Margin is the spread between acquisition cost and sale price.

**Assumptions (show reasoning):**

- **Average credit purchase: $5,000.** A startup burning $1,000–3,000/mo on Anthropic or OpenAI API will typically buy 2–3 months of runway in credits at a time to lock in the discount. $5,000 is the conservative midpoint; high-API-spend customers (the ones SpendLens flags as `credexRelevant`) tend to be $8,000–15,000 per transaction.
- **Credex gross margin: 15–20%.** Standard for infrastructure credit/software resale with volume sourcing. Assume 17% for base math.
- **Gross profit per transaction: ~$850** ($5,000 × 17%).
- **Repeat purchase rate: ~40% within 6 months.** Credits are consumable — satisfied buyers reorder when their balance runs low. 40% is conservative; a buyer who saved 30% on their first purchase has strong incentive to return.
- **Average purchases over 18 months: 2.5** (first purchase + 1.5 repeat transactions on average, blended across the 40% repeat cohort).
- **LTV over 18 months: ~$2,125** ($850 gross profit × 2.5 transactions).

**Conclusion:** A converted consultation → credit purchase is worth approximately **$2,000–2,500 LTV** to Credex over 18 months. For high-API-spend customers ($15,000+ transactions), LTV exceeds $5,000. SpendLens is specifically designed to surface those customers first.

---

## CAC at each GTM channel

| Channel | Est. visits per action | Email capture rate | Consult rate | Credits conversion | CAC (time-cost assumed $0 paid) |
|---------|------------------------|--------------------|--------------|--------------------|--------------------------------|
| HN / Reddit organic | 400 visits | 25% → 100 emails | 15% → 15 consults | 40% → 6 customers | ~$0 paid, ~8 hrs effort = **$0 cash CAC** |
| Newsletter feature | 500 visits | 20% → 100 emails | 12% → 12 consults | 40% → 5 customers | ~$0 paid (editorial) |
| Credex customer email | 200 opens | 40% → 80 leads | 25% → 20 consults | 50% → 10 customers | ~$0 (list already owned) |
| Twitter viral share | 200 visits | 15% → 30 emails | 10% → 3 consults | 40% → 1-2 customers | ~$0 paid |

**Paid channel estimate (if activated):**
- LinkedIn ads to "CTO at startup 10-50 employees": ~$15 CPC, 5% audit completion, 30% email rate, 15% consult rate, 40% close → **~$1,000 CAC**
- At $1,500 LTV: paid channel is marginally positive; meaningful only at volume

---

## Conversion funnel required for profitability

```
Landing page visitors
  ↓ 30% start form              [barrier: does the headline convince them to try?]
Form starts
  ↓ 70% complete form           [barrier: is the form short enough / clear enough?]
Audits completed
  ↓ 35% enter email             [barrier: did results show enough value?]
Email captures
  ↓ ~43% are high-savings cases [filter: >$500/mo identified savings]
High-savings emails
  ↓ 20% book consultation       [barrier: is the Credex CTA credible?]
Consultations booked
  ↓ 40% convert to purchase     [barrier: is Credex inventory available for their tools?]
Credit purchases
```

**Breakeven math per 1,000 visitors:**
- 1,000 visitors → 300 form starts → 210 audits completed → 73 email captures
- Of 73 emails: ~32 are high-savings (>$500/mo identified savings) → 6 consultations → 2–3 purchases
- 2–3 purchases × $2,125 LTV = **$4,250–6,375 gross profit per 1,000 visitors**
- At $0 paid CAC (organic launch): profitable from visitor #1
- Vercel hosting at this traffic: ~$20–50/mo — essentially $0 against the revenue

**Where the funnel leaks and how to fix it:**
The biggest single leak is the 35% email capture rate. Users who complete the audit but don't enter their email saw the value and still didn't convert — the most likely reason is that the savings figure wasn't large enough to feel worth the friction. Solution: for low-savings audits (<$100/mo), replace the email gate with a "notify me" opt-in framed as benchmark alerts rather than report delivery. Lower the ask to match the value delivered.

---

## What would need to be true for $1M ARR in 18 months

$1M ARR = ~$83k/month revenue to Credex.

At $1,500 average LTV over 18 months = ~667 total customers needed.
667 customers / 18 months = ~37 new credit-purchasing customers per month.

**Required funnel at 37 customers/month:**
- 37 customers / 40% conversion from consultation = 93 consultations/month
- 93 consultations / 20% of email captures = 465 "high savings" email captures/month
- 465 high-savings emails / 40% of all emails = ~1,160 total emails/month
- 1,160 emails / 35% email capture rate = 3,300 audits/month
- 3,300 audits / 70% completion rate = 4,700 form starts/month
- 4,700 starts / 30% of visitors = **~16,000 monthly visitors needed**

**Is 16,000 monthly visitors achievable in 18 months?**
Yes, if:
1. The HN/Reddit launch generates 400-600 initial visits and some organic backlinks
2. One newsletter feature generates 500 visits
3. The shareable URL mechanic drives 20-30% of traffic via shares (viral coefficient ~0.3)
4. SEO on "cursor pricing comparison," "chatgpt vs claude cost" etc. builds to 2,000-3,000 organic visits/month by month 6
5. Credex's existing customer base provides a warm funnel that bypasses the top of funnel entirely for 20-30% of customers

This is achievable. It requires consistent distribution effort, not just a launch. The biggest risk is that the shareable URL mechanic underperforms — if people don't actually share their audit results, the viral coefficient is 0 and the tool depends entirely on paid or earned distribution.

---

## Key assumption risks

| Assumption | Risk | Mitigation |
|------------|------|------------|
| $5k avg credit purchase | Could be lower for pre-seed | Build for seed+ as primary target; pre-seed is secondary |
| 40% conversion from consultation to purchase | Could be lower if credits aren't available in buyer's preferred tools | Expand credits inventory before scaling distribution |
| 20% of high-savings audits book consultation | Could be lower if CTA is too aggressive | A/B test CTA copy and timing |
| Organic traffic compounds | Could plateau without SEO investment | Allocate 2 hours/week to content targeting high-intent keywords |