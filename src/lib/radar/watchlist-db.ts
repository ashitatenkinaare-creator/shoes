import type { PostgrestError } from "@supabase/supabase-js";
import { rowToSneakerItem, toDbSneakerId } from "@/lib/radar/map-radar-sneaker";
import { getSupabase } from "@/lib/supabase/client";
import type { SneakerRadarItem } from "@/types/radar";
import type { RadarDbResult, RadarSneakerRow } from "@/types/radar-db";

function formatError(error: PostgrestError, context: string): string {
  return `${context}: ${error.message}`;
}

type WatchlistJoinRow = {
  sneaker_id: string;
  radar_sneakers: RadarSneakerRow;
};

export async function fetchUserWatchlist(
  userId: string,
): Promise<RadarDbResult<SneakerRadarItem[]>> {
  const { data, error } = await getSupabase()
    .from("watchlist")
    .select("sneaker_id, radar_sneakers(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      data: null,
      error: formatError(error, "ウォッチリストの取得に失敗しました"),
    };
  }

  const rows = (data ?? []) as unknown as WatchlistJoinRow[];
  const items = rows
    .filter((row) => row.radar_sneakers)
    .map((row) => rowToSneakerItem(row.radar_sneakers));

  return { data: items, error: null };
}

export async function addWatchlistItem(
  userId: string,
  appSneakerId: string,
): Promise<RadarDbResult<null>> {
  const sneakerId = toDbSneakerId(appSneakerId);

  const { error } = await getSupabase().from("watchlist").insert({
    user_id: userId,
    sneaker_id: sneakerId,
  });

  if (error) {
    if (error.code === "23505") {
      return { data: null, error: null };
    }
    return {
      data: null,
      error: formatError(error, "ウォッチリストへの追加に失敗しました"),
    };
  }

  return { data: null, error: null };
}

export async function removeWatchlistItem(
  userId: string,
  appSneakerId: string,
): Promise<RadarDbResult<null>> {
  const sneakerId = toDbSneakerId(appSneakerId);

  const { error } = await getSupabase()
    .from("watchlist")
    .delete()
    .eq("user_id", userId)
    .eq("sneaker_id", sneakerId);

  if (error) {
    return {
      data: null,
      error: formatError(error, "ウォッチリストからの削除に失敗しました"),
    };
  }

  return { data: null, error: null };
}
