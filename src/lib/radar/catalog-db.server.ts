import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
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

const CATALOG_SELECT_WITH_CATEGORY = "*, radar_categories(slug, label)";
const CATALOG_SELECT_BASE = "*";

function isMissingCategoriesRelation(error: PostgrestError): boolean {
  return error.message.includes("radar_categories");
}

type CatalogQueryResult = {
  data: unknown;
  error: PostgrestError | null;
};

async function runCatalogQuery(
  supabase: SupabaseClient,
  select: string,
  filters?: SneakerCatalogFilters,
  limit?: number,
): Promise<CatalogQueryResult> {
  let query = supabase
    .from("radar_sneakers")
    .select(select)
    .eq("source", "kicksdb")
    .gte("release_date", daysAgoIso(540))
    .lte("release_date", daysAheadIso(60))
    .order("release_date", { ascending: true });

  if (typeof limit === "number") {
    query = query.limit(limit);
  }

  if (filters?.filterRare) {
    query = query.eq("is_rare", true);
  }
  if (filters?.filterCollab) {
    query = query.eq("is_collab", true);
  }

  return query;
}

async function selectCatalogRows(
  supabase: SupabaseClient,
  filters?: SneakerCatalogFilters,
  limit?: number,
): Promise<CatalogQueryResult> {
  const withCategory = await runCatalogQuery(supabase, CATALOG_SELECT_WITH_CATEGORY, filters, limit);
  if (!withCategory.error) return withCategory;

  if (isMissingCategoriesRelation(withCategory.error)) {
    return runCatalogQuery(supabase, CATALOG_SELECT_BASE, filters, limit);
  }

  return withCategory;
}

/** Server Component 専用カタログ取得 */
export async function fetchUpcomingSneakers(
  limit = 20,
  filters?: SneakerCatalogFilters,
): Promise<RadarDbResult<SneakerRadarItem[]>> {
  const supabase = await createServerSupabase();
  const { data, error } = await selectCatalogRows(supabase, filters, limit);

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

  const withCategory = await supabase
    .from("radar_sneakers")
    .select(CATALOG_SELECT_WITH_CATEGORY)
    .eq("source", "kicksdb")
    .eq("id", dbId)
    .maybeSingle();

  let result: CatalogQueryResult = withCategory;

  if (withCategory.error && isMissingCategoriesRelation(withCategory.error)) {
    result = await supabase
      .from("radar_sneakers")
      .select(CATALOG_SELECT_BASE)
      .eq("source", "kicksdb")
      .eq("id", dbId)
      .maybeSingle();
  }

  const { data, error } = result;

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
    .gte("release_date", daysAgoIso(540))
    .lte("release_date", daysAheadIso(60));

  if (error) return 0;
  return count ?? 0;
}
