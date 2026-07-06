import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { filterDashboardCatalogRows } from "@/lib/radar/catalog-dashboard-filter";
import { rowToSneakerDetail, rowToSneakerItem, toDbSneakerId } from "@/lib/radar/map-radar-sneaker";
import { createServerSupabase } from "@/lib/supabase/server";
import type { SneakerCatalogFilters } from "@/lib/radar/filter-sneakers";
import type { SneakerRadarDetail, SneakerRadarItem } from "@/types/radar";
import type { RadarDbResult, RadarSneakerRow } from "@/types/radar-db";

export type UpcomingSneakersOptions = {
  /** dashboard: E2E 除外 + 公式 lottery_url 付きの新作 */
  mode?: "default" | "dashboard";
};

function formatError(error: PostgrestError, context: string): string {
  return `${context}: ${error.message}`;
}

function todayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** 品質フィルター前に十分な件数を取得（LIMIT が先頭の低品質行だけになるのを防ぐ） */
const DASHBOARD_PREFILTER_MULTIPLIER = 10;
const DASHBOARD_PREFILTER_MIN = 100;

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
  mode: UpcomingSneakersOptions["mode"] = "default",
): Promise<CatalogQueryResult> {
  let query = supabase.from("radar_sneakers").select(select).gte("release_date", todayIso());

  if (mode === "dashboard") {
    query = query
      .in("source", ["snkrs", "kicksdb"])
      .not("external_id", "ilike", "e2e-%")
      .not("lottery_url", "is", null);
  } else {
    query = query.eq("source", "kicksdb");
  }

  query = query.order("release_date", { ascending: true });

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
  mode: UpcomingSneakersOptions["mode"] = "default",
): Promise<CatalogQueryResult> {
  const withCategory = await runCatalogQuery(
    supabase,
    CATALOG_SELECT_WITH_CATEGORY,
    filters,
    limit,
    mode,
  );
  if (!withCategory.error) return withCategory;

  if (isMissingCategoriesRelation(withCategory.error)) {
    return runCatalogQuery(supabase, CATALOG_SELECT_BASE, filters, limit, mode);
  }

  return withCategory;
}

/** Server Component 専用カタログ取得 */
export async function fetchUpcomingSneakers(
  limit = 20,
  filters?: SneakerCatalogFilters,
  options?: UpcomingSneakersOptions,
): Promise<RadarDbResult<SneakerRadarItem[]>> {
  const mode = options?.mode ?? "default";
  const supabase = await createServerSupabase();
  const queryLimit =
    mode === "dashboard"
      ? Math.max(limit * DASHBOARD_PREFILTER_MULTIPLIER, DASHBOARD_PREFILTER_MIN)
      : limit;
  const { data, error } = await selectCatalogRows(supabase, filters, queryLimit, mode);

  if (error) {
    return {
      data: null,
      error: formatError(error, "カタログの取得に失敗しました"),
    };
  }

  let rows = (data ?? []) as RadarSneakerRow[];
  if (mode === "dashboard") {
    // 発売日・画像・ソースURL の3基準: dashboard-catalog-quality.ts + filterDashboardCatalogRows
    rows = filterDashboardCatalogRows(rows).slice(0, limit);
  }

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
    .in("source", ["kicksdb", "snkrs"])
    .eq("id", dbId)
    .maybeSingle();

  let result: CatalogQueryResult = withCategory;

  if (withCategory.error && isMissingCategoriesRelation(withCategory.error)) {
    result = await supabase
      .from("radar_sneakers")
      .select(CATALOG_SELECT_BASE)
      .in("source", ["kicksdb", "snkrs"])
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
    .gte("release_date", todayIso());

  if (error) return 0;
  return count ?? 0;
}
