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
  price: number;
  image_url?: string | null;
}

/** スニーカー更新時の入力（指定したフィールドのみ更新） */
export interface UpdateSneakerInput {
  model_name?: string;
  brand?: string;
  release_date?: string;
  price?: number;
  image_url?: string | null;
}

/** CRUD 操作の共通レスポンス型 */
export interface SneakerResult<T = SneakerRow> {
  data: T | null;
  error: string | null;
}

/** UI コンポーネント用（既存） */
export type Brand =
  | "Nike"
  | "Adidas"
  | "New Balance"
  | "ASICS"
  | "Mizuno"
  | "Puma"
  | "Converse";

export interface Sneaker {
  id: string;
  modelName: string;
  brand: Brand;
  releaseDate: string;
  price: number;
  imageUrl: string;
  isNotified: boolean;
  featured?: boolean;
}

export function toSneaker(row: SneakerRow): Sneaker {
  return {
    id: row.id,
    modelName: row.model_name,
    brand: row.brand as Brand,
    releaseDate: row.release_date,
    price: row.price,
    imageUrl: row.image_url ?? "",
    isNotified: row.is_notified,
  };
}
