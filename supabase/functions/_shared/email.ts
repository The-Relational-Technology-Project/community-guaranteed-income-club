// Shared Resend sender for Community Guaranteed Income Club
// From: notifications@communityguaranteedincome.club (verified domain in Resend)

const RESEND_API_URL = "https://api.resend.com/emails";
export const FROM_ADDRESS = "Community Guaranteed Income Club <notifications@communityguaranteedincome.club>";

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

export async function sendEmail(input: SendEmailInput) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: Array.isArray(input.to) ? input.to : [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
      reply_to: input.replyTo,
      tags: input.tags,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Resend send failed [${res.status}]: ${JSON.stringify(data)}`);
  }
  return data as { id: string };
}

// Minimal branded HTML wrapper. Inline styles only — email clients are unforgiving.
export function brandedEmail(opts: {
  preheader?: string;
  heading: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
}) {
  const { preheader = "", heading, bodyHtml, ctaLabel, ctaUrl, footerNote } = opts;
  const cta = ctaLabel && ctaUrl
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td bgcolor="#1d4ed8" style="border-radius:9999px;">
         <a href="${ctaUrl}" style="display:inline-block;padding:14px 28px;font-family:'DM Sans',Arial,sans-serif;font-weight:700;color:#ffffff;text-decoration:none;border-radius:9999px;">${ctaLabel}</a>
       </td></tr></table>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${heading}</title></head>
<body style="margin:0;padding:0;background:#fef9f3;font-family:'DM Sans',Arial,sans-serif;color:#0f172a;">
  <span style="display:none;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">${preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fef9f3;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:2px solid #0f172a;border-radius:24px;overflow:hidden;">
        <tr><td style="padding:24px 28px;background:#1d4ed8;color:#ffffff;">
          <div style="font-family:'Space Grotesk',Arial,sans-serif;font-weight:800;font-size:18px;letter-spacing:-0.01em;">Community Guaranteed Income Club</div>
          <div style="font-size:12px;opacity:0.85;margin-top:2px;">Baltimore Chapter</div>
        </td></tr>
        <tr><td style="padding:32px 28px;">
          <h1 style="font-family:'Space Grotesk',Arial,sans-serif;font-weight:800;font-size:26px;line-height:1.2;margin:0 0 16px;color:#0f172a;letter-spacing:-0.02em;">${heading}</h1>
          <div style="font-size:15px;line-height:1.6;color:#1f2937;">${bodyHtml}</div>
          ${cta}
          ${footerNote ? `<p style="font-size:13px;color:#64748b;margin:24px 0 0;">${footerNote}</p>` : ""}
        </td></tr>
        <tr><td style="padding:18px 28px;background:#fef3c7;border-top:2px solid #0f172a;font-size:12px;color:#0f172a;">
          <em>"All flourishing is mutual."</em><br/>
          <a href="https://communityguaranteedincome.club" style="color:#1d4ed8;text-decoration:underline;">communityguaranteedincome.club</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
