import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { sendEmail, brandedEmail } from "../_shared/email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const esc = (s: unknown): string =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

interface Payload {
  kind: "welcome_approval" | "new_signup_admin" | "custom" | "check_in_intent";
  to?: string;
  // For welcome_approval
  profileId?: string;
  // For check_in_intent
  memberName?: string;
  memberEmail?: string;
  note?: string;
  matchedName?: string;
  // For custom
  subject?: string;
  heading?: string;
  bodyHtml?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  // For new_signup_admin
  newMember?: {
    name: string;
    email: string;
    zip_code?: string | null;
    profession?: string | null;
  };
}

// Set ADMIN_NOTIFY_EMAIL in your Supabase Edge Function secrets to route
// new-signup notifications to your chapter's steward(s).
const ADMIN_NOTIFY_EMAIL =
  Deno.env.get("ADMIN_NOTIFY_EMAIL") ?? "stewards@communityguaranteedincome.club";
const SITE_URL = "https://communityguaranteedincome.club";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const payload = (await req.json()) as Payload;

    // The signup flow can fire `new_signup_admin` before a session exists
    // (magic-link signup). That kind has a fixed admin recipient and escaped
    // content, so it is the only path allowed unauthenticated. Every other
    // kind requires a verified user, and `custom` additionally requires admin.
    let callerId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const authClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const token = authHeader.replace("Bearer ", "");
      const { data: claimsData } = await authClient.auth.getClaims(token);
      callerId = (claimsData?.claims?.sub as string | undefined) ?? null;
    }
    if (payload.kind !== "new_signup_admin" && !callerId) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (payload.kind === "welcome_approval") {
      if (!payload.profileId) throw new Error("profileId required");
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("name,email")
        .eq("id", payload.profileId)
        .single();
      if (error || !profile?.email) throw new Error("Profile not found or no email");

      const html = brandedEmail({
        preheader: "You're in. Welcome to the Club.",
        heading: `Welcome in, ${profile.name?.split(" ")[0] ?? "neighbor"} 💛`,
        bodyHtml: `
          <p>Alex here, on behalf of the Baltimore chapter. You're officially a member of the <strong>Community Guaranteed Income Club</strong>.</p>
          <p>Here's what happens next:</p>
          <ul style="padding-left:20px;margin:12px 0;">
            <li>On the first of each month, we calculate everyone's 7% contribution and pair you up with one or two neighbors.</li>
            <li>You'll get a personalized email with who to send to (or who's sending to you) and a Venmo link to make it one tap.</li>
            <li>We do this in person whenever possible. Relationships over transactions.</li>
          </ul>
          <p>Have a look at the roster, finish your bio, and add your favorite third place when you have a minute.</p>
        `,
        ctaLabel: "Open my profile",
        ctaUrl: `${SITE_URL}/profile`,
        footerNote: "Reply to this email any time — Alex reads everything.",
      });

      const result = await sendEmail({
        to: profile.email,
        subject: "You're in — welcome to the Community Guaranteed Income Club",
        html,
        replyTo: ADMIN_NOTIFY_EMAIL,
      });
      return new Response(JSON.stringify({ ok: true, id: result.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (payload.kind === "new_signup_admin") {
      const m = payload.newMember;
      if (!m) throw new Error("newMember required");
      const html = brandedEmail({
        preheader: `New signup: ${esc(m.name)}`,
        heading: `New signup to review`,
        bodyHtml: `
          <p><strong>${esc(m.name)}</strong> just joined and is awaiting your review.</p>
          <table cellpadding="6" style="font-size:14px;border-collapse:collapse;margin:12px 0;">
            <tr><td style="color:#64748b;">Email</td><td>${esc(m.email)}</td></tr>
            ${m.zip_code ? `<tr><td style="color:#64748b;">ZIP</td><td>${esc(m.zip_code)}</td></tr>` : ""}
            ${m.profession ? `<tr><td style="color:#64748b;">Profession</td><td>${esc(m.profession)}</td></tr>` : ""}
          </table>
          <p>Open the admin dashboard to verify, set a status, and send the welcome email when ready.</p>
        `,
        ctaLabel: "Open admin dashboard",
        ctaUrl: `${SITE_URL}/admin`,
      });
      const result = await sendEmail({
        to: ADMIN_NOTIFY_EMAIL,
        subject: `New signup: ${m.name}`.replace(/[\r\n]+/g, " "),
        html,
      });
      return new Response(JSON.stringify({ ok: true, id: result.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (payload.kind === "check_in_intent") {
      const rawName = payload.memberName ?? "A member";
      const name = esc(rawName);
      const matched = payload.matchedName ? `<p><strong>Matched with:</strong> ${esc(payload.matchedName)}</p>` : "";
      const noteHtml = payload.note
        ? `<p style="border-left:3px solid #1d4ed8;padding:8px 12px;background:#f1f5f9;">${esc(payload.note)}</p>`
        : "";
      const html = brandedEmail({
        preheader: `${name} wants to check in on a neighbor`,
        heading: "Check-in intent",
        bodyHtml: `<p><strong>${name}</strong> (${esc(payload.memberEmail ?? "no email on file")}) tapped "Check in on a neighbor" on their member home.</p>${matched}${noteHtml}<p>The match was made automatically and logged in the admin dashboard.</p>`,
        ctaLabel: "Open admin dashboard",
        ctaUrl: `${SITE_URL}/admin`,
      });
      const result = await sendEmail({
        to: ADMIN_NOTIFY_EMAIL,
        subject: `Check-in intent from ${rawName}`.replace(/[\r\n]+/g, " "),
        html,
        replyTo: payload.memberEmail || undefined,
      });
      return new Response(JSON.stringify({ ok: true, id: result.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (payload.kind === "custom") {
      if (!payload.to || !payload.subject || !payload.heading || !payload.bodyHtml) {
        throw new Error("custom requires to, subject, heading, bodyHtml");
      }
      // Free-form recipient + HTML body is admin-only.
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", callerId!)
        .eq("role", "admin")
        .maybeSingle();
      if (!roleRow) {
        return new Response(JSON.stringify({ ok: false, error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const html = brandedEmail({
        heading: payload.heading,
        bodyHtml: payload.bodyHtml,
        ctaLabel: payload.ctaLabel,
        ctaUrl: payload.ctaUrl,
      });
      const result = await sendEmail({ to: payload.to, subject: payload.subject, html });
      return new Response(JSON.stringify({ ok: true, id: result.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown kind: ${(payload as any).kind}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("send-email error:", message);
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
