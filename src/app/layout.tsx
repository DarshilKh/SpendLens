import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://spendlens.co"),
  title: { default: "SpendLens — AI Spend Audit", template: "%s | SpendLens" },
  description:
    "Find out if you're overpaying for AI tools. Free audit: Cursor, Claude, ChatGPT, GitHub Copilot. Instant results, no login required.",
  keywords: [
    "AI tools audit", "spend audit", "Cursor pricing", "Claude pricing",
    "ChatGPT cost", "GitHub Copilot", "startup savings", "FinOps", "AI spend optimization",
  ],
  authors: [{ name: "Credex", url: "https://credex.rocks" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "SpendLens",
    title: "SpendLens — AI Spend Audit for Startups",
    description:
      "Find out if you're overpaying for AI tools. Free, instant, no login required. Covers Cursor, Claude, ChatGPT, GitHub Copilot, and more.",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "SpendLens AI Spend Audit" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@spendlens",
    creator: "@credex",
    title: "SpendLens — AI Spend Audit for Startups",
    description: "Find out if you're overpaying for AI tools. Free, instant, no login.",
    images: ["/og-default.png"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://spendlens.co" },
};

export const viewport: Viewport = {
  themeColor: "#07111A",
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body
        className="antialiased"
        style={{ background: "#07111A", color: "#F1F5F9" }}
      >
        {children}
      </body>
    </html>
  );
}