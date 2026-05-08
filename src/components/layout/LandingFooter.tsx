import Link from "next/link";

export default function LandingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer
      style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-secondary)" }}
      className="py-10 px-6"
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
            SpendLens
          </span>
          <span style={{ color: "var(--text-muted)" }}>·</span>
          <span style={{ color: "var(--text-muted)" }}>by</span>
          <a
            href="https://credex.rocks"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium"
            style={{ color: "var(--accent-blue)" }}
          >
            Credex
          </a>
          <span style={{ color: "var(--text-muted)" }}>· {year}</span>
        </div>

        <p className="text-xs text-center order-last sm:order-none" style={{ color: "var(--text-muted)" }}>
          Pricing sourced from official vendor pages. Updated weekly. Not financial advice.
        </p>

        <nav className="flex items-center gap-5 text-xs" style={{ color: "var(--text-muted)" }} aria-label="Footer navigation">
          <Link
            href="/audit"
            className="transition-colors duration-150 hover:text-[color:var(--text-primary)]"
          >
            Run Audit
          </Link>
          <a
            href="https://credex.rocks"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors duration-150 hover:text-[color:var(--text-primary)]"
          >
            Credex
          </a>
        </nav>
      </div>
    </footer>
  );
}
