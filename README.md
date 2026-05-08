# SpendLens — AI Spend Audit Platform

> **Production-grade AI procurement intelligence for startups.**  
> Find out if you're overpaying for Cursor, Claude, ChatGPT, GitHub Copilot, and more.

---

## Overview

SpendLens is a full-stack SaaS audit tool that analyzes a startup's AI tooling spend and produces:

- **Financially defensible recommendations** backed by live pricing data
- **Spend benchmarking** vs. industry averages ($/dev/mo)
- **AI-generated executive summary** via Groq/Llama (with intelligent fallback)
- **Shareable audit URLs** (`/share/[slug]`)
- **Professional PDF export** — board/CFO ready
- **Email report delivery** via Resend

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| UI | React 19 + Tailwind CSS v3 |
| Animation | Framer Motion 12 |
| State | Zustand 5 (persisted) |
| Forms | React Hook Form + Zod |
| Database | Supabase (Postgres) |
| AI | Groq API (Llama 3.1 8B) |
| Email | Resend |
| PDF | jsPDF 4 |
| Icons | Lucide React |

---

## Quick Start

### 1. Clone & install

```bash
git clone <your-repo>
cd spendlens
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Fill in your values — see .env.example for details
```

Required env vars:
- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-side only)

Optional (graceful fallback if absent):
- `GROQ_API_KEY` — Groq API key (free tier at console.groq.com)
- `RESEND_API_KEY` — Resend API key for email delivery
- `FROM_EMAIL` — Sender email (default: `audits@spendlens.co`)
- `NEXT_PUBLIC_APP_URL` — App URL for share links

### 3. Set up Supabase

Create these tables in your Supabase project:

```sql
-- Audits table
create table audits (
  id uuid primary key,
  share_slug text unique not null,
  form_data jsonb not null,
  result jsonb not null,
  is_public boolean default true,
  created_at timestamptz default now()
);

-- Leads table
create table leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  company_name text,
  role text,
  team_size int,
  audit_id uuid references audits(id),
  wants_consultation boolean default false,
  monthly_savings numeric,
  created_at timestamptz default now()
);

-- Enable RLS
alter table audits enable row level security;
alter table leads enable row level security;

-- Allow public read of public audits
create policy "Public audits readable" on audits
  for select using (is_public = true);

-- Service role has full access (set via SUPABASE_SERVICE_ROLE_KEY)
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── audit/route.ts       # POST — runs audit engine
│   │   ├── leads/route.ts       # POST — captures lead + sends email
│   │   ├── og/route.ts          # GET — dynamic OG image (Edge)
│   │   └── share/[slug]/route.ts # GET — public audit JSON
│   ├── audit/page.tsx           # /audit — form + results page
│   ├── share/[slug]/page.tsx    # /share/:slug — public share page
│   ├── layout.tsx               # Root layout + metadata
│   └── globals.css              # Design system tokens + base styles
├── components/
│   ├── audit/
│   │   ├── AuditPageClient.tsx  # Step orchestrator (form→running→results)
│   │   ├── AuditForm.tsx        # Tool entry form
│   │   ├── AuditRunning.tsx     # Animated loading screen
│   │   ├── AuditResults.tsx     # Full results + PDF + share
│   │   ├── BenchmarkWidget.tsx  # Animated benchmark bar chart
│   │   ├── RecommendationCard.tsx # Per-tool recommendation
│   │   ├── LeadCaptureModal.tsx # Email capture modal
│   │   ├── CredexCTA.tsx        # Upsell to Credex credits
│   │   └── SharePageClient.tsx  # Public share view
│   └── layout/
│       ├── LandingNav.tsx
│       ├── LandingHero.tsx
│       ├── LandingFeatures.tsx
│       ├── LandingFAQ.tsx
│       └── LandingFooter.tsx
├── lib/
│   ├── ai/summary.ts            # Groq AI summary with fallback
│   ├── audit/engine.ts          # Core audit logic (pure, testable)
│   ├── db/supabase.ts           # Supabase client (graceful if unconfigured)
│   ├── email/send.ts            # Resend email templates
│   ├── pricing-data.ts          # Verified pricing database
│   ├── utils.ts                 # formatCurrency, generateShareSlug, etc.
│   └── validation.ts            # Zod schemas
├── store/
│   └── audit-store.ts           # Zustand store (persisted to localStorage)
└── types/
    └── index.ts                 # All TypeScript interfaces
```

---

## Design System

Colors (CSS variables in `globals.css`):

| Token | Value | Usage |
|---|---|---|
| `--bg-base` | `#07111A` | Page background |
| `--bg-secondary` | `#0F1B2A` | Section backgrounds |
| `--bg-elevated` | `#162434` | Cards |
| `--bg-card` | `#1B2B3D` | Nested cards |
| `--bg-highlight` | `#243447` | Hover/selected states |
| `--accent-blue` | `#5FA8D3` | Primary accent |
| `--accent-green` | `#A3BE8C` | Savings / success |
| `--accent-gold` | `#D4A657` | Warnings |
| `--accent-danger` | `#D97777` | Errors |
| `--border` | `#243447` | All borders |

---

## Key Features

### Audit Engine (`/src/lib/audit/engine.ts`)
- Pure function — no side effects, fully unit-testable
- Per-tool rule logic for: Cursor, GitHub Copilot, Claude, ChatGPT, Anthropic API, OpenAI API, Gemini, Windsurf
- Accounts for: team size, use case, seat count, actual vs expected spend, enterprise justification thresholds
- Generates benchmarks vs industry averages

### AI Summary (`/src/lib/ai/summary.ts`)
- Uses Groq `llama-3.1-8b-instant` for speed
- 10s timeout with AbortController
- Graceful deterministic fallback if Groq unavailable
- Never blocks the audit response

### PDF Export (`AuditResults.tsx → handleDownloadPDF`)
- Pure jsPDF — no canvas capture, no clipping, no overlap
- Professional dark-theme layout with accent bar, hero metrics, section headers
- Properly wraps text with `splitTextToSize`
- Per-page overflow detection

### Lead Capture (`/api/leads/route.ts`)
- Email stored via Supabase service client
- Resend email sent fire-and-forget (doesn't block response)
- 8s timeout on Supabase fetch
- 20-minute per-email rate limit
- Honeypot field for bot protection

---

## Scripts

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run type-check   # TypeScript check only
npm run test         # Run Vitest tests
npm run format       # Prettier format
```

---

## Deployment (Vercel)

1. Push to GitHub
2. Import in Vercel
3. Add all env vars from `.env.example`
4. Deploy

The app uses:
- Static prerendering for `/` and `/audit`
- SSR for `/share/[slug]` (fetches from Supabase)
- Edge runtime for `/api/og`

---

## Security

- All API routes validate with Zod
- Rate limiting: 5 audits/hour per IP, 1 lead capture per 20 min per email
- Honeypot fields on all public forms
- Service role key never exposed to client
- Security headers: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, etc.
- `poweredByHeader: false`
- `overrides.postcss` in package.json pins PostCSS to patched version

---

## License

Private — © Credex 2025
