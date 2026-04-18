// Bootstraps the admin account from ADMIN_EMAIL / ADMIN_PASSWORD secrets.
// Idempotent: safe to call repeatedly. Returns ok if admin already exists.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const email = Deno.env.get("ADMIN_EMAIL");
    const password = Deno.env.get("ADMIN_PASSWORD");

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Missing ADMIN_EMAIL / ADMIN_PASSWORD" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Find user by email (paginate; small list expected)
    const { data: usersList, error: listErr } = await admin.auth.admin.listUsers();
    if (listErr) throw listErr;
    let user = usersList.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { display_name: "Właściciel" },
      });
      if (createErr) throw createErr;
      user = created.user!;
    }

    // Ensure admin role
    const { error: roleErr } = await admin
      .from("user_roles")
      .upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id,role" });
    if (roleErr) throw roleErr;

    return new Response(JSON.stringify({ ok: true, user_id: user.id, email: user.email }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
