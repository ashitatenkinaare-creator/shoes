import { createClient } from "@supabase/supabase-js";

/** service_role クライアント（サーバー専用・同期 Cron 用） */
export function createAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY または NEXT_PUBLIC_SUPABASE_URL が未設定です",
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function getKicksDbApiKey(): string | null {
  return process.env.KICKSDB_API_KEY ?? null;
}

export function getCronSecret(): string | null {
  return process.env.CRON_SECRET ?? null;
}
