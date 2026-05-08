import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAuditBySlug } from "@/lib/db/supabase";
import SharePageClient from "@/components/audit/SharePageClient";
import { formatCurrency } from "@/lib/utils";
import { getBaseUrl } from "@/lib/utils";

interface SharePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { slug } = await params;
  const stored = await getAuditBySlug(slug).catch(() => null);

  if (!stored) {
    return { title: "Audit Not Found" };
  }

  const savings = stored.result.totalMonthlySavings ?? 0;
  const title = savings > 0
    ? `AI Audit: ${formatCurrency(savings)}/mo in savings found`
    : "AI Audit: Spend is well-optimized";
  const description = `See how this team's AI tool spending was audited. ${savings > 0 ? `${formatCurrency(savings * 12)} in annual savings identified.` : "No significant overspending found."}`;

  const ogUrl = `${getBaseUrl()}/api/og?slug=${slug}&savings=${savings}&pct=${stored.result.savingsPercentage ?? 0}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${getBaseUrl()}/share/${slug}`,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { slug } = await params;
  const stored = await getAuditBySlug(slug).catch(() => null);

  if (!stored) notFound();

  return <SharePageClient stored={stored} slug={slug} />;
}
