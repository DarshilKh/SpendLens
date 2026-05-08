import { NextRequest } from "next/server";
import { formatCurrency } from "@/lib/utils";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug    = searchParams.get("slug") ?? "";
  const savings = parseFloat(searchParams.get("savings") ?? "0");
  const pct     = parseFloat(searchParams.get("pct") ?? "0");

  const hasRealSavings = savings > 0;
  const savingsLabel = hasRealSavings ? `${formatCurrency(savings)}/mo` : "Fully optimized";
  const subLabel = hasRealSavings
    ? `${formatCurrency(savings * 12)} annually · ${pct}% reduction`
    : "Your AI spend is well-calibrated";

  const fontSize = hasRealSavings ? "76" : "54";

  const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#07111A"/>
      <stop offset="100%" stop-color="#0F1B2A"/>
    </linearGradient>
    <linearGradient id="savingsGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#A3BE8C"/>
      <stop offset="100%" stop-color="#5FA8D3"/>
    </linearGradient>
    <radialGradient id="glow1" cx="75%" cy="15%" r="35%">
      <stop offset="0%" stop-color="#A3BE8C" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#07111A" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="20%" cy="85%" r="30%">
      <stop offset="0%" stop-color="#5FA8D3" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#07111A" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow1)"/>
  <rect width="1200" height="630" fill="url(#glow2)"/>

  <!-- Accent bar left -->
  <rect x="0" y="0" width="4" height="630" fill="#5FA8D3"/>

  <!-- Border frame -->
  <rect x="28" y="28" width="1144" height="574" rx="14" fill="none" stroke="#243447" stroke-width="1"/>

  <!-- Card content area -->
  <rect x="60" y="60" width="1080" height="510" rx="12" fill="#162434" fill-opacity="0.7"/>

  <!-- Brand -->
  <text x="100" y="130" font-family="-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif" font-size="13" font-weight="700" fill="#5FA8D3" letter-spacing="4">SPENDLENS</text>
  <text x="100" y="152" font-family="-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif" font-size="11" fill="#64748B">AI Spend Audit &middot; by Credex</text>

  <!-- Divider -->
  <line x1="100" y1="170" x2="1100" y2="170" stroke="#243447" stroke-width="0.75"/>

  <!-- Status indicator -->
  <circle cx="100" cy="230" r="5" fill="#A3BE8C"/>
  <text x="114" y="235" font-family="-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif" font-size="13" fill="#94A3B8" font-weight="500">Audit complete</text>

  <!-- Label -->
  <text x="100" y="288" font-family="-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif" font-size="14" fill="#64748B" font-weight="500">Potential monthly savings</text>

  <!-- Main savings number -->
  <text x="100" y="385" font-family="-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif" font-size="${fontSize}" font-weight="800" fill="url(#savingsGrad)" letter-spacing="-2">${savingsLabel}</text>
  <text x="100" y="424" font-family="-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif" font-size="19" fill="#94A3B8">${subLabel}</text>

  <!-- CTA -->
  <rect x="100" y="480" width="248" height="52" rx="8" fill="#A3BE8C"/>
  <text x="224" y="511" font-family="-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif" font-size="15" font-weight="700" fill="#07111A" text-anchor="middle">Run your free audit</text>

  <!-- URL watermark -->
  <text x="1100" y="538" font-family="-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif" font-size="11" fill="#64748B" text-anchor="end">spendlens.co/share/${slug}</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
