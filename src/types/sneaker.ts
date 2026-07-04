/** Supabase sneakers テーブルの行型 */
export interface SneakerRow {
  id: string;
  model_name: string;
  brand: string;
  release_date: string;
  price: number;
  image_url: string | null;
  is_notified: boolean;
  created_at: string;
  updated_at: string;
}

/** スニーカー作成時の入力 */
export interface CreateSneakerInput {
  model_name: string;
  brand: string;
  release_date: string;
}

/** CRUD 操作の共通レスポンス型 */
export interface SneakerResult<T = SneakerRow> {
  data: T | null;
  error: string | null;
}

/** アプリ共通の Sneaker 型 */
export type Sneaker = {
  id: string;
  modelName: string;
  brand: string;
  isNotified: boolean;
  releaseDate: Date;
  createdAt: Date;
};

/** 一覧フィルター */
export type FilterMode = "all" | "notified";

export function toSneaker(row: SneakerRow): Sneaker {
  return {
    id: row.id,
    modelName: row.model_name,
    brand: row.brand,
    isNotified: row.is_notified,
    releaseDate: new Date(row.release_date),
    createdAt: new Date(row.created_at),
  };
}
