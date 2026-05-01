// Supabase Auth "Send Email" webhook — branded auth emails via Resend.
// Configure in Cloud → Auth → Hooks (Send Email Hook) pointing to this function URL,
// with secret stored in env var SEND_EMAIL_HOOK_SECRET.
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { sendEmail, brandedEmail } from "../_shared/email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, webhook-id, webhook-timestamp, webhook-signature",
};

interface AuthHookPayload {
  user: { email: string; user_metadata?: { name?: string } };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type:
      | "signup"
      | "login"
      | "invite"
      | "magiclink"
      | "recovery"
      | "email_change"
      | "email_change_current"
      | "email_change_new"
      | "reauthentication";
    site_url: string;
    token_new?: string;
  };
}

function buildVerifyUrl(p: AuthHookPayload) {
  const { site_url, token_hash, email_action_type, redirect_to } = p.email_data;
  const base = site_url.replace(/\/$/, "");
  const verifyType = email_action_type === "signup" ? "signup" : email_action_type;
  return `${base}/auth/v1/verify?token=${token_hash}&type=${verifyType}&redirect_to=${encodeURIComponent(redirect_to)}`;
}

function render(p: AuthHookPayload): { subject: string; html: string } {
  const firstName = p.user.user_metadata?.name?.split(" ")[0] ?? "neighbor";
  const url = buildVerifyUrl(p);
  const action = p.email_data.email_action_type;

  if (action === "signup") {
    return {
      subject: "Confirm your email — Community Guaranteed Income Club",
      html: brandedEmail({
        preheader: "One quick tap to confirm your email.",
        heading: `Welcome, ${firstName} 👋`,
        bodyHtml: `<p>Tap the button below to confirm your email and finish creating your account. Alex will review and approve your membership shortly after.</p>`,
        ctaLabel: "Confirm my email",
        ctaUrl: url,
        footerNote: "If you didn't sign up, you can ignore this email.",
      }),
    };
  }
  if (action === "magiclink" || action === "login") {
    return {
      subject: "Your sign-in link",
      html: brandedEmail({
        preheader: "Tap to sign in. Good for one hour.",
        heading: `Sign in, ${firstName}`,
        bodyHtml: `<p>Here's your one-time sign-in link. It's good for one hour.</p>`,
        ctaLabel: "Sign in",
        ctaUrl: url,
        footerNote: "If you didn't request this, you can safely ignore it.",
      }),
    };
  }
  if (action === "recovery") {
    return {
      subject: "Reset your password",
      html: brandedEmail({
        preheader: "Tap to choose a new password.",
        heading: `Password reset`,
        bodyHtml: `<p>Tap below to choose a new password. The link is good for one hour.</p>`,
        ctaLabel: "Reset password",
        ctaUrl: url,
      }),
    };
  }
  if (action === "invite") {
    return {
      subject: "You've been invited",
      html: brandedEmail({
        heading: `You're invited`,
        bodyHtml: `<p>Alex invited you to join the Community Guaranteed Income Club, Baltimore chapter. Tap below to accept and create your account.</p>`,
        ctaLabel: "Accept invitation",
        ctaUrl: url,
      }),
    };
  }
  // email_change variants, reauthentication, etc.
  return {
    subject: "Action required on your account",
    html: brandedEmail({
      heading: `Confirm this change`,
      bodyHtml: `<p>Tap below to confirm this change to your account.</p>`,
      ctaLabel: "Confirm",
      ctaUrl: url,
    }),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const raw = await req.text();
    const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET");
    let payload: AuthHookPayload;

    if (hookSecret) {
      // Standard Webhooks signature verification (Supabase requires this when configured)
      const wh = new Webhook(hookSecret.replace(/^v1,whsec_/, "").replace(/^whsec_/, ""));
      const headers = Object.fromEntries(req.headers);
      payload = wh.verify(raw, headers) as AuthHookPayload;
    } else {
      payload = JSON.parse(raw) as AuthHookPayload;
    }

    const { subject, html } = render(payload);
    await sendEmail({ to: payload.user.email, subject, html });
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("auth-email-hook error:", message);
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
