import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { syncRadarReleases } from "../_shared/sync-radar-releases.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

function isAuthorized(req: Request): boolean {
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (!cronSecret) return true;

  const authHeader = req.headers.get("authorization");
  if (authHeader === `Bearer ${cronSecret}`) return true;

  return req.headers.get("x-cron-secret") === cronSecret;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!isAuthorized(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const kicksdbApiKey = Deno.env.get("KICKSDB_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!kicksdbApiKey || !supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({
        error: "Missing KICKSDB_API_KEY, SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const result = await syncRadarReleases(supabase, {
    kicksdbApiKey,
    daysAhead: Number(Deno.env.get("KICKSDB_SYNC_DAYS_AHEAD") ?? 30),
    daysBehind: Number(Deno.env.get("KICKSDB_SYNC_DAYS_BEHIND") ?? 3),
    limit: Number(Deno.env.get("KICKSDB_SYNC_LIMIT") ?? 20),
    usdJpy: Number(Deno.env.get("KICKSDB_USD_JPY") ?? 150),
    announceOffsetDays: Number(Deno.env.get("KICKSDB_ANNOUNCE_OFFSET_DAYS") ?? 14),
  });

  return new Response(JSON.stringify(result), {
    status: result.errors.length > 0 && result.upserted === 0 ? 502 : 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
