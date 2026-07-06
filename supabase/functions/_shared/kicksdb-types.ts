/** KicksDB StockX 商品（一覧 API の最小型） */
export type KicksDbStockxProduct = {
  id?: string;
  slug?: string;
  title?: string;
  name?: string;
  brand?: string;
  sku?: string;
  colorway?: string;
  release_date?: string;
  image?: string;
  thumb_url?: string;
  url?: string;
  link?: string;
  retail_price?: number;
  min_price?: number;
  description?: string;
  product_type?: string;
  upcoming?: boolean;
  created_at?: string;
  traits?: Record<string, string | number>;
};

export type KicksDbListResponse = {
  data?: KicksDbStockxProduct[];
  meta?: {
    current_page?: number;
    per_page?: number;
    total?: number;
  };
};

/** radar_sneakers upsert 用 */
export type RadarSneakerUpsertRow = {
  source: "kicksdb" | "snkrs";
  external_id: string;
  category_slug: string;
  brand: string;
  model_name: string;
  image_url: string;
  announce_date: string;
  release_date: string;
  phase: "announced" | "upcoming" | "today";
  price: number;
  store_url: string;
  news_url: string | null;
  lottery_url: string | null;
  lottery_opened_at?: string | null;
  description: string;
  colorway: string;
  sku: string;
  is_rare: boolean;
  is_collab: boolean;
};

export type SyncRadarOptions = {
  kicksdbApiKey: string;
  daysAhead?: number;
  daysBehind?: number;
  /** release_date フィルター用の全体上限（API が 0 件のときはブランド別取得にフォールバック） */
  limit?: number;
  /** ブランドごとの query 取得上限 */
  perBrandLimit?: number;
  /** KicksDB query= に渡すブランド名（未指定時は KICKSDB_SYNC_BRANDS） */
  brandQueries?: readonly string[];
  usdJpy?: number;
  announceOffsetDays?: number;
};

export type SyncRadarResult = {
  fetched: number;
  upserted: number;
  skipped: number;
  errors: string[];
};
