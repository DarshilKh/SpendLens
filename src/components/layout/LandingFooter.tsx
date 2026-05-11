import Link from "next/link";

export default function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="py-12 px-6"
      style={{
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--bg-base)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr_1fr] gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span
                className="text-[15px] font-semibold tracking-tight"
                style={{
                  color: "var(--text-primary)",
                  letterSpacing: "-0.02em",
                }}
              >
                SpendLens
              </span>
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                style={{
                  background: "var(--bg-elevated)",
                  color: "var(--text-tertiary)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                by Credex
              </span>
            </div>
            <p
              className="text-[13px] leading-relaxed max-w-sm"
              style={{ color: "var(--text-tertiary)" }}
            >
              AI spend auditing for engineering teams. Find where your stack is
              quietly overbilling you.
            </p>
          </div>

          {/* Product */}
          <nav aria-label="Product">
            <p className="text-eyebrow mb-3">Product</p>
            <ul className="space-y-2.5">
              {[
                { label: "Run audit", href: "/audit" },
                { label: "How it works", href: "#how-it-works" },
                { label: "FAQ", href: "#faq" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Company">
            <p className="text-eyebrow mb-3">Company</p>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="https://credex.rocks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition-colors duration-150"
                >
                  Credex
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div
          className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          style={{ borderTop: "1px solid var(--hairline)" }}
        >
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            © {year} Credex. All rights reserved.
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Pricing sourced from official vendor pages. Updated weekly. Not
            financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}