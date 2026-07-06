/** Supabase radar_categories テーブル行型 */
export type RadarCategoryRow = {
  id: string;
  slug: string;
  label: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

/** Supabase radar_sneakers テーブル行型 */
export type RadarSneakerRow = {
  id: string;
  category_id: string;
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
  lottery_opened_at: string | null;
  description: string;
  colorway: string;
  sku: string;
  source: "seed" | "kicksdb" | string;
  external_id: string | null;
  is_rare: boolean;
  is_collab: boolean;
  created_at: string;
  updated_at: string;
  radar_categories?: Pick<RadarCategoryRow, "slug" | "label"> | null;
};

/** Supabase user_preferences テーブル行型 */
export type UserPreferencesRow = {
  user_id: string;
  brands: string[];
  sizes: string[];
  silhouettes: string[];
  collab_brands: string[];
  categories: string[];
  notify_on_announcement: boolean;
  notify_on_release: boolean;
  filter_rare: boolean;
  filter_collab: boolean;
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
  silhouettes: string[];
  collab_brands: string[];
  categories: string[];
  notify_on_announcement: boolean;
  notify_on_release: boolean;
  filter_rare: boolean;
  filter_collab: boolean;
};

/** CRUD 共通レスポンス */
export type RadarDbResult<T = unknown> = {
  data: T | null;
  error: string | null;
};
