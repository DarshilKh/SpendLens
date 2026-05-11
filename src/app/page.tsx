import type { Metadata } from "next";
import LandingHero from "@/components/layout/LandingHero";
import LandingFeatures from "@/components/layout/LandingFeatures";
import LandingFAQ from "@/components/layout/LandingFAQ";
import LandingFooter from "@/components/layout/LandingFooter";
import LandingNav from "@/components/layout/LandingNav";

export const metadata: Metadata = {
  title: "SpendLens — AI Spend Audit ",
  description:
    "Find out if you're overpaying for Cursor, Claude, ChatGPT, or GitHub Copilot. Free audit. Instant results. No login required.",
  alternates: { canonical: "https://spendlens.co" },
};

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <LandingNav />
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingFAQ />
      </main>
      <LandingFooter />
    </div>
  );
}
