import { buildSyncOptions, syncRadarReleases } from "@/lib/radar/kicksdb-sync";
import { syncOfficialUrlsForCatalog } from "@/lib/radar/official-url-sync.server";
import { createAdminSupabase, getKicksDbApiKey } from "@/lib/supabase/admin";
import type { SyncRadarResult } from "@/lib/radar/kicksdb-sync";

export type { SyncRadarResult };

export async function runRadarReleaseSync(): Promise<
  SyncRadarResult & { officialUrlsUpdated?: number }
> {
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
  const result = await syncRadarReleases(supabase, buildSyncOptions(apiKey));

  const urlSync = await syncOfficialUrlsForCatalog(supabase);
  if (urlSync.error) {
    result.errors.push(urlSync.error);
  }

  return {
    ...result,
    officialUrlsUpdated: urlSync.data ?? 0,
  };
}
