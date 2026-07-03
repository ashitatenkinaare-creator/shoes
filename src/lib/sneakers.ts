import type { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type {
  CreateSneakerInput,
  SneakerResult,
  SneakerRow,
  UpdateSneakerInput,
} from "../types/sneaker";

function formatError(error: PostgrestError, context: string): string {
  return `${context}: ${error.message}`;
}

/**
 * 1) 作成：スニーカー情報を登録する
 */
export async function createSneaker(
  input: CreateSneakerInput,
): Promise<SneakerResult> {
  const { data, error } = await supabase
    .from("sneakers")
    .insert({
      model_name: input.model_name,
      brand: input.brand,
      release_date: input.release_date,
      price: input.price,
      image_url: input.image_url ?? null,
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: formatError(error, "スニーカーの登録に失敗しました") };
  }

  return { data: data as SneakerRow, error: null };
}

/**
 * 2) 一覧取得：発売日が近い順（昇順）で全件取得する
 */
export async function listSneakers(): Promise<SneakerResult<SneakerRow[]>> {
  const { data, error } = await supabase
    .from("sneakers")
    .select("*")
    .order("release_date", { ascending: true });

  if (error) {
    return {
      data: null,
      error: formatError(error, "スニーカー一覧の取得に失敗しました"),
    };
  }

  return { data: data as SneakerRow[], error: null };
}

/**
 * 3) 更新：id を指定してスニーカー情報を更新する
 */
export async function updateSneaker(
  id: string,
  input: UpdateSneakerInput,
): Promise<SneakerResult> {
  const updates = Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(updates).length === 0) {
    return { data: null, error: "更新する項目が指定されていません" };
  }

  const { data, error } = await supabase
    .from("sneakers")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { data: null, error: formatError(error, "スニーカーの更新に失敗しました") };
  }

  return { data: data as SneakerRow, error: null };
}

/**
 * 4) 通知切替：id を指定して is_notified を true/false で設定する
 */
export async function toggleSneakerNotification(
  id: string,
  is_notified: boolean,
): Promise<SneakerResult> {
  const { data, error } = await supabase
    .from("sneakers")
    .update({
      is_notified,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return {
      data: null,
      error: formatError(error, "通知設定の更新に失敗しました"),
    };
  }

  return { data: data as SneakerRow, error: null };
}

/**
 * 5) 削除：id を指定してスニーカー情報を削除する
 */
export async function deleteSneaker(id: string): Promise<SneakerResult<null>> {
  const { error } = await supabase.from("sneakers").delete().eq("id", id);

  if (error) {
    return { data: null, error: formatError(error, "スニーカーの削除に失敗しました") };
  }

  return { data: null, error: null };
}
