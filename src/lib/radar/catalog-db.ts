import type { PostgrestError } from "@supabase/supabase-js";
import {
  rowToSneakerDetail,
  rowToSneakerItem,
  toDbSneakerId,
} from "@/lib/radar/map-radar-sneaker";
import { createServerSupabase } from "@/lib/supabase/server";
import type { SneakerCatalogFilters } from "@/lib/radar/filter-sneakers";
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

const CATALOG_SELECT = "*, radar_categories(slug, label)";

export async function fetchUpcomingSneakers(
  limit = 20,
  filters?: SneakerCatalogFilters,
): Promise<RadarDbResult<SneakerRadarItem[]>> {
  const supabase = await createServerSupabase();

  let query = supabase
    .from("radar_sneakers")
    .select(CATALOG_SELECT)
    .eq("source", "kicksdb")
    .gte("release_date", daysAgoIso(3))
    .lte("release_date", daysAheadIso(60))
    .order("release_date", { ascending: true })
    .limit(limit);

  if (filters?.filterRare) {
    query = query.eq("is_rare", true);
  }
  if (filters?.filterCollab) {
    query = query.eq("is_collab", true);
  }

  const { data, error } = await query;

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
    .select(CATALOG_SELECT)
    .eq("source", "kicksdb")
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
    .eq("source", "kicksdb")
    .gte("release_date", daysAgoIso(3))
    .lte("release_date", daysAheadIso(60));

  if (error) return 0;
  return count ?? 0;
}
