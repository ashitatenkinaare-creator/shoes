/** Supabase radar_sneakers テーブル行型 */
export type RadarSneakerRow = {
  id: string;
  brand: string;
  model_name: string;
  image_url: string;
  announce_date: string;
  release_date: string;
  phase: "announced" | "upcoming" | "today";
  price: number;
  store_url: string;
  description: string;
  colorway: string;
  sku: string;
  source: "seed" | "kicksdb" | string;
  external_id: string | null;
  created_at: string;
  updated_at: string;
};

/** Supabase user_preferences テーブル行型 */
export type UserPreferencesRow = {
  user_id: string;
  brands: string[];
  sizes: string[];
  notify_on_announcement: boolean;
  notify_on_release: boolean;
  created_at: string;
  updated_at: string;
};

/** Supabase watchlist テーブル行型 */
export type WatchlistRow = {
  id: string;
  user_id: string;
  sneaker_id: string;
  created_at: string;
};

/** user_preferences 保存用入力 */
export type UpsertUserPreferencesInput = {
  brands: string[];
  sizes: string[];
  notify_on_announcement: boolean;
  notify_on_release: boolean;
};

/** CRUD 共通レスポンス */
export type RadarDbResult<T = unknown> = {
  data: T | null;
  error: string | null;
};

/** シードデータと UI モックの ID 対応 */
export const RADAR_SNEAKER_ID_MAP = {
  "sr-001": "11111111-1111-4111-8111-111111110001",
  "sr-002": "11111111-1111-4111-8111-111111110002",
  "sr-003": "11111111-1111-4111-8111-111111110003",
  "sr-004": "11111111-1111-4111-8111-111111110004",
} as const;

export const RADAR_SNEAKER_IDS = Object.values(RADAR_SNEAKER_ID_MAP);

/** DB UUID → UI モック ID */
export const RADAR_SNEAKER_DB_TO_APP: Record<string, string> = Object.fromEntries(
  Object.entries(RADAR_SNEAKER_ID_MAP).map(([appId, dbId]) => [dbId, appId]),
);
