import { Resend } from "resend";
import type { AuditResult, LeadCaptureData } from "@/types";
import { formatCurrency, getBaseUrl } from "@/lib/utils";

let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM_EMAIL = process.env.FROM_EMAIL ?? "onboarding@resend.dev";

export async function sendAuditConfirmationEmail(
  lead: LeadCaptureData,
  result: AuditResult
): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.warn("[Email] ⚠️ RESEND_API_KEY not set — skipping email send");
    return;
  }

  const shareUrl = `${getBaseUrl()}/share/${result.shareSlug}`;
  const hasSavings = result.totalMonthlySavings > 0;
  const topRec = result.recommendations
    .filter((r) => r.monthlySavings > 0)
    .sort((a, b) => b.monthlySavings - a.monthlySavings)[0];

  const greeting = lead.companyName ? `Hi ${lead.companyName} team,` : "Hi,";

  const subject = hasSavings
    ? `Your AI audit: ${formatCurrency(result.totalMonthlySavings)}/mo in savings identified`
    : "Your SpendLens AI audit is ready";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="color-scheme" content="light"/>
  <title>${subject}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#F0F4F8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1E2D3D;-webkit-font-smoothing:antialiased}
    .wrap{max-width:580px;margin:32px auto;border-radius:12px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.1)}
    .header{background:#07111A;padding:28px 36px;border-bottom:1px solid #162434}
    .logo{font-size:19px;font-weight:700;color:#F1F5F9;letter-spacing:-0.3px}
    .logo-sub{font-size:11px;color:#64748B;margin-top:4px}
    .body{background:#fff;padding:36px}
    .greeting{font-size:15px;color:#374151;margin-bottom:20px;line-height:1.5}
    .intro{font-size:14px;color:#4B5563;line-height:1.6;margin-bottom:20px}
    .savings-box{background:#F0FAF5;border:1px solid #BBF7D0;border-radius:10px;padding:28px;text-align:center;margin:24px 0}
    .savings-amt{font-size:44px;font-weight:800;color:#16A34A;letter-spacing:-1.5px;line-height:1}
    .savings-sub{font-size:13px;color:#6B7280;margin-top:8px}
    .rec-box{background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:18px;margin:20px 0;border-left:3px solid #A3BE8C}
    .rec-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#9CA3AF;margin-bottom:8px}
    .rec-title{font-size:14px;font-weight:600;color:#111827;margin-bottom:6px}
    .rec-body{font-size:13px;color:#4B5563;line-height:1.55}
    .cta-wrap{text-align:center;margin-top:28px}
    .cta{display:inline-block;background:#A3BE8C;color:#07111A;text-decoration:none;padding:13px 28px;border-radius:8px;font-weight:700;font-size:14px;letter-spacing:0.01em}
    .credex-box{background:#07111A;border-radius:10px;padding:24px;margin:24px 0;color:#E8EEF2}
    .credex-box h3{font-size:14px;font-weight:600;margin-bottom:10px;color:#F1F5F9}
    .credex-box p{font-size:13px;color:#94A3B8;line-height:1.55;margin-bottom:18px}
    .credex-btn{display:inline-block;background:#A3BE8C;color:#07111A;text-decoration:none;padding:10px 20px;border-radius:6px;font-weight:700;font-size:13px}
    .divider{height:1px;background:#F3F4F6;margin:24px 0}
    .footer{background:#F9FAFB;padding:20px 36px;border-top:1px solid #E5E7EB}
    .footer p{font-size:11px;color:#9CA3AF;line-height:1.7}
  </style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="logo">SpendLens</div>
    <div class="logo-sub">AI Spend Audit &middot; by Credex &middot; ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
  </div>

  <div class="body">
    <p class="greeting">${greeting}</p>

    <p class="intro">
      ${hasSavings
        ? `Your AI spend audit is complete. We identified <strong style="color:#16A34A">${formatCurrency(result.totalMonthlySavings)}/mo</strong> in potential savings — that's ${formatCurrency(result.totalAnnualSavings)} back on your balance sheet annually.`
        : "Your AI spend audit is complete. Good news: your stack looks well-optimized — no significant savings opportunities were identified at your current spend levels."}
    </p>

    ${hasSavings ? `
    <div class="savings-box">
      <div class="savings-amt">${formatCurrency(result.totalMonthlySavings)}/mo</div>
      <div class="savings-sub">${formatCurrency(result.totalAnnualSavings)}/year &middot; ${result.savingsPercentage}% cost reduction</div>
    </div>
    ` : ""}

    ${topRec ? `
    <div class="rec-box">
      <div class="rec-label">Top recommendation</div>
      <div class="rec-title">${topRec.toolName} &mdash; ${topRec.recommendedAction}</div>
      <div class="rec-body">${topRec.reasoning.split(".")[0]}.</div>
    </div>
    ` : ""}

    <div class="cta-wrap">
      <a href="${shareUrl}" class="cta">View full audit report &rarr;</a>
    </div>

    ${result.highSavingsCase && lead.wantsConsultation ? `
    <div class="divider"></div>
    <div class="credex-box">
      <h3>Go further with Credex credits</h3>
      <p>Beyond plan-level changes, Credex sells discounted AI credits — Cursor, Claude, ChatGPT Enterprise — sourced from companies that over-forecast. Typically 25&ndash;40% below retail. Our team will reach out to discuss your options.</p>
      <a href="${getBaseUrl()}/consult" class="credex-btn">Book a consultation</a>
    </div>
    ` : ""}
  </div>

  <div class="footer">
    <p>
      <strong>SpendLens</strong> by <a href="https://credex.rocks" style="color:#5FA8D3">Credex</a> &middot;
      <a href="${shareUrl}" style="color:#5FA8D3">View your audit</a><br/>
      Pricing data sourced from official vendor pages. Updated weekly. Not financial advice.<br/>
      You received this because you ran an AI spend audit at spendlens.co.
    </p>
  </div>
</div>
</body>
</html>`;

  console.log("[Email] Sending:", { from: FROM_EMAIL, to: lead.email });

  try {
    // Resend SDK quirk: errors come back in `result.error`, NOT as thrown
    // exceptions for most non-network failures. Must check both paths.
    const sendResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: lead.email,
      subject,
      html,
    });

    if (sendResult.error) {
      console.error("[Email] ❌ Resend rejected the send:", {
        name: sendResult.error.name,
        message: sendResult.error.message,
        from: FROM_EMAIL,
        to: lead.email,
      });
      throw new Error(`Resend rejected: ${sendResult.error.message}`);
    }

    console.log("[Email] ✅ Sent successfully:", {
      id: sendResult.data?.id,
      from: FROM_EMAIL,
      to: lead.email,
    });
  } catch (err) {
    console.error("[Email] ❌ Send threw exception:", {
      message: err instanceof Error ? err.message : String(err),
      from: FROM_EMAIL,
      to: lead.email,
    });
    throw err;
  }
}