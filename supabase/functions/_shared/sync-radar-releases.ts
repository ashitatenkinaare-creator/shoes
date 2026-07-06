import type { SupabaseClient } from "@supabase/supabase-js";
import { attachCategoryId } from "./category-resolve";
import { mapKicksDbProductToRow } from "./kicksdb-map";
import type {
  KicksDbListResponse,
  KicksDbStockxProduct,
  SyncRadarOptions,
  SyncRadarResult,
} from "./kicksdb-types";

const KICKSDB_BASE = "https://api.kicks.dev/v3/stockx/products";

/** KicksDB 同期で query= 取得するブランド（設定画面の AVAILABLE_BRANDS と揃える） */
export const KICKSDB_SYNC_BRANDS = [
  "Nike",
  "Jordan",
  "Adidas",
  "New Balance",
  "Converse",
  "Asics",
  "Puma",
  "Yeezy",
] as const;

function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function buildReleaseDateFilter(daysBehind: number, daysAhead: number): string {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - daysBehind);
  const end = new Date(today);
  end.setDate(end.getDate() + daysAhead);

  const startStr = formatIsoDate(start);
  const endStr = formatIsoDate(end);

  return `release_date >= "${startStr}" AND release_date <= "${endStr}" AND product_type = "sneakers"`;
}

function productSlug(product: KicksDbStockxProduct): string | null {
  const slug = product.slug?.trim();
  return slug || null;
}

/** slug 単位で重複排除（先勝ち） */
export function mergeUniqueKicksDbProducts(
  ...lists: KicksDbStockxProduct[][]
): KicksDbStockxProduct[] {
  const seen = new Set<string>();
  const merged: KicksDbStockxProduct[] = [];

  for (const list of lists) {
    for (const product of list) {
      const slug = productSlug(product);
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      merged.push(product);
    }
  }

  return merged;
}

async function fetchStockxProductsPage(
  options: SyncRadarOptions,
  queryParams: Record<string, string>,
): Promise<{ products: KicksDbStockxProduct[]; error: string | null }> {
  const params = new URLSearchParams(queryParams);

  try {
    const response = await fetch(`${KICKSDB_BASE}?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${options.kicksdbApiKey}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        products: [],
        error: `KicksDB API error (${response.status}): ${body.slice(0, 200)}`,
      };
    }

    const json = (await response.json()) as KicksDbListResponse;
    return { products: json.data ?? [], error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown fetch error";
    return { products: [], error: message };
  }
}

export async function fetchUpcomingStockxProducts(
  options: SyncRadarOptions,
): Promise<{ products: KicksDbStockxProduct[]; error: string | null }> {
  const daysAhead = options.daysAhead ?? 30;
  const daysBehind = options.daysBehind ?? 3;
  const limit = options.limit ?? 20;
  const perBrandLimit = options.perBrandLimit ?? 10;
  const brandQueries = options.brandQueries ?? KICKSDB_SYNC_BRANDS;

  const errors: string[] = [];

  const byReleaseDate = await fetchStockxProductsPage(options, {
    filters: buildReleaseDateFilter(daysBehind, daysAhead),
    sort: "release_date",
    limit: String(limit),
  });
  if (byReleaseDate.error) errors.push(byReleaseDate.error);

  const brandLists = await Promise.all(
    brandQueries.map(async (brand) => {
      const result = await fetchStockxProductsPage(options, {
        query: brand,
        filters: 'product_type = "sneakers"',
        sort: "rank",
        limit: String(perBrandLimit),
      });
      if (result.error) errors.push(`${brand}: ${result.error}`);
      return result.products;
    }),
  );

  const products = mergeUniqueKicksDbProducts(byReleaseDate.products, ...brandLists);

  return {
    products,
    error: errors.length > 0 ? errors.join("; ") : null,
  };
}

export async function syncRadarReleases(
  supabase: SupabaseClient,
  options: SyncRadarOptions,
): Promise<SyncRadarResult> {
  const result: SyncRadarResult = {
    fetched: 0,
    upserted: 0,
    skipped: 0,
    errors: [],
  };

  const { products, error } = await fetchUpcomingStockxProducts(options);
  if (error) {
    result.errors.push(error);
  }

  result.fetched = products.length;

  const rows = products
    .map((product) =>
      mapKicksDbProductToRow(product, {
        usdJpy: options.usdJpy,
        announceOffsetDays: options.announceOffsetDays,
      }),
    )
    .filter((row): row is NonNullable<typeof row> => row !== null);

  result.skipped = products.length - rows.length;

  if (rows.length === 0) {
    return result;
  }

  for (const row of rows) {
    const dbRow = await attachCategoryId(supabase, row);
    if (!dbRow) {
      result.errors.push(`Unknown category (${row.category_slug}): ${row.external_id}`);
      continue;
    }

    const { data: existing, error: selectError } = await supabase
      .from("radar_sneakers")
      .select("id")
      .eq("source", dbRow.source)
      .eq("external_id", dbRow.external_id)
      .maybeSingle();

    if (selectError) {
      result.errors.push(`Select failed (${dbRow.external_id}): ${selectError.message}`);
      continue;
    }

    if (existing?.id) {
      const { error: updateError } = await supabase
        .from("radar_sneakers")
        .update(dbRow)
        .eq("id", existing.id);

      if (updateError) {
        result.errors.push(`Update failed (${dbRow.external_id}): ${updateError.message}`);
        continue;
      }
    } else {
      const { error: insertError } = await supabase.from("radar_sneakers").insert(dbRow);

      if (insertError) {
        result.errors.push(`Insert failed (${dbRow.external_id}): ${insertError.message}`);
        continue;
      }
    }

    result.upserted += 1;
  }

  return result;
}
