import { buildSyncOptions, syncRadarReleases } from "@/lib/radar/kicksdb-sync";
import { createAdminSupabase, getKicksDbApiKey } from "@/lib/supabase/admin";
import type { SyncRadarResult } from "@/lib/radar/kicksdb-sync";

export type { SyncRadarResult };

export async function runRadarReleaseSync(): Promise<SyncRadarResult> {
  const apiKey = getKicksDbApiKey();
  if (!apiKey) {
    return {
      fetched: 0,
      upserted: 0,
      skipped: 0,
      errors: ["KICKSDB_API_KEY が未設定です"],
    };
  }

  const supabase = createAdminSupabase();
  return syncRadarReleases(supabase, buildSyncOptions(apiKey));
}
