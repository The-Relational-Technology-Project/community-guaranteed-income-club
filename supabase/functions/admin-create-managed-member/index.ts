import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BodySchema = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().max(40).optional().nullable(),
  zip_code: z.string().max(10).optional().nullable(),
  contact_method: z.enum(["phone", "in_person", "email"]).default("in_person"),
  contact_notes: z.string().max(2000).optional().nullable(),
  post_tax_monthly_income: z.number().nonnegative().optional().nullable(),
  venmo_handle: z.string().max(80).optional().nullable(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ??
      Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return json({ error: "Unauthorized" }, 401);
    }

    // Validate caller
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return json({ error: "Unauthorized" }, 401);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("id")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleRow) {
      return json({ error: "Forbidden" }, 403);
    }

    const body = await req.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return json({ error: parsed.error.flatten().fieldErrors }, 400);
    }
    const input = parsed.data;

    // Synthetic email so auth.users row can exist
    const shortId = crypto.randomUUID().slice(0, 8);
    const syntheticEmail = `managed-${shortId}@no-email.local`;
    const randomPassword = crypto.randomUUID() + crypto.randomUUID();

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: syntheticEmail,
      password: randomPassword,
      email_confirm: true,
      user_metadata: { name: input.name },
    });

    if (createErr || !created?.user) {
      return json({ error: createErr?.message ?? "Could not create user" }, 500);
    }

    const newId = created.user.id;

    // handle_new_user trigger creates the profile row; patch the rest.
    const { error: profErr } = await admin
      .from("profiles")
      .update({
        name: input.name,
        phone: input.phone ?? null,
        zip_code: input.zip_code ?? "",
        venmo_handle: input.venmo_handle ?? null,
        post_tax_monthly_income: input.post_tax_monthly_income ?? 0,
        is_steward_managed: true,
        contact_method: input.contact_method,
        contact_notes: input.contact_notes ?? null,
        participant_status: "active",
      })
      .eq("id", newId);

    if (profErr) {
      return json({ error: profErr.message }, 500);
    }

    return json({ ok: true, profile_id: newId });
  } catch (e) {
    return json({ error: String(e?.message ?? e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}