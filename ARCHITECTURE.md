# Architecture

## System Diagram

```mermaid
graph TD
    User["👤 User (Browser)"]
    Landing["Landing Page /"]
    AuditPage["Audit Page /audit"]
    SharePage["Share Page /share/:slug"]
    Store["Zustand Store\n(localStorage persist)"]

    subgraph "Next.js App Router (Vercel)"
        Landing
        AuditPage
        SharePage
        APIAudit["/api/audit POST"]
        APILeads["/api/leads POST"]
        APIShare["/api/share/:slug GET"]
        APIOG["/api/og GET (SVG)"]
    end

    subgraph "External Services"
        Supabase[("Supabase\nPostgres")]
        Groq["Groq API\n(llama-3.1-8b-instant)"]
        Resend["Resend\n(transactional email)"]
    end

    User --> Landing
    Landing -->|CTA| AuditPage
    AuditPage --> Store
    Store -->|form submit| APIAudit
    APIAudit -->|runAuditEngine()| APIAudit
    APIAudit -->|generateAuditSummary()| Groq
    APIAudit -->|storeAudit()| Supabase
    APIAudit -->|result JSON| AuditPage
    AuditPage -->|lead capture| APILeads
    APILeads -->|storeLead()| Supabase
    APILeads -->|sendAuditConfirmationEmail()| Resend
    AuditPage -->|share URL| SharePage
    SharePage -->|getAuditBySlug()| Supabase
    SharePage -->|og:image| APIOG
    APIShare --> Supabase
```

## Data Flow: Form Input → Audit Result

```
1. User fills AuditForm
   ├── Zustand store updates in real time
   ├── Form state persisted to localStorage
   └── No API calls yet

2. User clicks "Run audit"
   ├── POST /api/audit { formData }
   ├── Rate limit check (IP hash → in-memory Map)
   ├── Honeypot check (_hp field)
   └── Zod validation

3. runAuditEngine(formData) — pure synchronous function
   ├── For each tool entry:
   │   ├── evaluatePlanFit() → checks seat count, plan tier vs team size
   │   ├── evaluateAlternatives() → checks ALTERNATIVE_MAP
   │   └── shouldSuggestCredits() → flags API spend > $200
   ├── Aggregates totals, computes savings %
   ├── Computes benchmark (spend per dev vs INDUSTRY_BENCHMARKS)
   └── Generates UUID + shareSlug

4. generateAuditSummary(result) — async, 8s timeout with AbortController
   ├── Builds CFO-advisor prompt with full audit context
   ├── Calls Groq llama-3.1-8b-instant (max 200 tokens)
   ├── On timeout/error → generateFallbackSummary()
   └── Returns { summary, isFallback }

5. storeAudit(result) — fire-and-forget, does not block response
   └── Supabase insert to audits table

6. Response → client
   └── Zustand setAuditResult() → re-render to results view
```

## Why This Stack

| Choice | Reason |
|--------|--------|
| **Next.js App Router** | Server components for share pages (SEO, OG metadata), client components for interactive form. Route handlers replace a separate API server. |
| **Supabase** | Postgres with an instant REST API, RLS for security, no infrastructure to manage. Free tier handles early traffic. |
| **Zustand + persist** | Form state survives page reloads without any backend session management. Small bundle, no boilerplate. |
| **Groq (llama-3.1-8b-instant)** | Sub-500ms inference at the free tier (14,400 requests/day). Used only for the AI summary paragraph — the audit engine itself is deterministic rule-based logic. Groq's OpenAI-compatible endpoint means the integration is a single fetch call. |
| **Resend** | Transactional email with a clean API and generous free tier (100 emails/day). Trivial to swap for SES at scale. |
| **Vitest** | Faster than Jest for TypeScript projects, native ESM support, compatible with the Next.js module aliases. |
| **No Prisma** | Supabase's JS client with typed JSON columns is sufficient for this schema. Prisma adds migration complexity without meaningful benefit at this scale. |
| **jsPDF (no html2canvas)** | Canvas-based export breaks on dark-mode CSS variables and backdrop-filter utilities. Pure jsPDF layout with explicit coordinates and splitTextToSize produces clean, predictable output that matches the screen. |

## What Changes at 10k Audits/Day

1. **Rate limiting → Upstash Redis**
   Replace the in-memory `Map` with `@upstash/ratelimit` (sliding window, persisted across serverless instances). The current in-memory limiter does not survive across Vercel cold starts.

2. **AI summary → queue-based**
   Move `generateAuditSummary` to a background queue (Inngest or QStash). Return the audit result immediately; SSE or polling delivers the summary when ready. Eliminates the 8s timeout pressure and removes the blocking AI call from the critical path entirely.

3. **Supabase → read replicas**
   Share page reads hit the primary. At 10k/day, add a read replica for `/share/` queries. Write path (audit storage) is already fire-and-forget so it won't be the bottleneck.

4. **OG images → pre-rendered and cached**
   Generate and cache OG images as PNGs in Supabase Storage after each audit, instead of rendering SVG dynamically on every share page request.

5. **Analytics → Posthog**
   Instrument funnel events: `audit_started`, `audit_completed`, `lead_captured`, `share_link_copied`, `consultation_booked`. Currently stubbed as `console.log`. Posthog's self-hosted option keeps user data off third-party servers.

6. **CDN caching for share pages**
   Share pages are already `Cache-Control: public, max-age=3600`. At scale, put Cloudflare in front of Vercel with edge caching for share URLs — they're immutable after creation.