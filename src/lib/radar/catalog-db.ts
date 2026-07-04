import type { PostgrestError } from "@supabase/supabase-js";
import {
  rowToSneakerDetail,
  rowToSneakerItem,
  toDbSneakerId,
} from "@/lib/radar/map-radar-sneaker";
import { createServerSupabase } from "@/lib/supabase/server";
import type { SneakerRadarDetail, SneakerRadarItem } from "@/types/radar";
import type { RadarDbResult, RadarSneakerRow } from "@/types/radar-db";

function formatError(error: PostgrestError, context: string): string {
  return `${context}: ${error.message}`;
}

function daysAgoIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function daysAheadIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export async function fetchUpcomingSneakers(
  limit = 20,
): Promise<RadarDbResult<SneakerRadarItem[]>> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("radar_sneakers")
    .select("*")
    .gte("release_date", daysAgoIso(3))
    .lte("release_date", daysAheadIso(60))
    .order("release_date", { ascending: true })
    .limit(limit);

  if (error) {
    return {
      data: null,
      error: formatError(error, "カタログの取得に失敗しました"),
    };
  }

  const rows = (data ?? []) as RadarSneakerRow[];
  return { data: rows.map(rowToSneakerItem), error: null };
}

export async function fetchSneakerDetailById(
  appOrDbId: string,
): Promise<RadarDbResult<SneakerRadarDetail>> {
  const supabase = await createServerSupabase();
  const dbId = toDbSneakerId(appOrDbId);

  const { data, error } = await supabase
    .from("radar_sneakers")
    .select("*")
    .eq("id", dbId)
    .maybeSingle();

  if (error) {
    return {
      data: null,
      error: formatError(error, "スニーカー詳細の取得に失敗しました"),
    };
  }

  if (!data) {
    return { data: null, error: null };
  }

  return { data: rowToSneakerDetail(data as RadarSneakerRow), error: null };
}

export async function countUpcomingSneakers(): Promise<number> {
  const supabase = await createServerSupabase();

  const { count, error } = await supabase
    .from("radar_sneakers")
    .select("*", { count: "exact", head: true })
    .gte("release_date", daysAgoIso(3))
    .lte("release_date", daysAheadIso(60));

  if (error) return 0;
  return count ?? 0;
}
