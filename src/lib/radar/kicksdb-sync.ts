import {
  fetchUpcomingStockxProducts,
  syncRadarReleases,
} from "../../../supabase/functions/_shared/sync-radar-releases";
import { mapKicksDbProductToRow } from "../../../supabase/functions/_shared/kicksdb-map";
import type {
  KicksDbStockxProduct,
  SyncRadarOptions,
  SyncRadarResult,
} from "../../../supabase/functions/_shared/kicksdb-types";

export type { KicksDbStockxProduct, SyncRadarOptions, SyncRadarResult };

export { fetchUpcomingStockxProducts, mapKicksDbProductToRow, syncRadarReleases };

export function buildSyncOptions(apiKey: string): SyncRadarOptions {
  return {
    kicksdbApiKey: apiKey,
    daysAhead: Number(process.env.KICKSDB_SYNC_DAYS_AHEAD ?? 30),
    daysBehind: Number(process.env.KICKSDB_SYNC_DAYS_BEHIND ?? 3),
    limit: Number(process.env.KICKSDB_SYNC_LIMIT ?? 20),
    usdJpy: Number(process.env.KICKSDB_USD_JPY ?? 150),
    announceOffsetDays: Number(process.env.KICKSDB_ANNOUNCE_OFFSET_DAYS ?? 14),
  };
}
