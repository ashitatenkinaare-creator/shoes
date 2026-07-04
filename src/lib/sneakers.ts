import type { PostgrestError } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";
import type { CreateSneakerInput, SneakerResult, SneakerRow } from "@/types/sneaker";

function formatError(error: PostgrestError, context: string): string {
  return `${context}: ${error.message}`;
}

export async function createSneaker(
  input: CreateSneakerInput,
): Promise<SneakerResult> {
  const { data, error } = await getSupabase()
    .from("sneakers")
    .insert({
      model_name: input.model_name,
      brand: input.brand,
      release_date: input.release_date,
      price: 0,
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: formatError(error, "スニーカーの登録に失敗しました") };
  }

  return { data: data as SneakerRow, error: null };
}

export async function listSneakers(): Promise<SneakerResult<SneakerRow[]>> {
  const { data, error } = await getSupabase()
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

export async function toggleSneakerNotification(
  id: string,
  is_notified: boolean,
): Promise<SneakerResult> {
  const { data, error } = await getSupabase()
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

export async function deleteSneaker(id: string): Promise<SneakerResult<null>> {
  const { error } = await getSupabase().from("sneakers").delete().eq("id", id);

  if (error) {
    return { data: null, error: formatError(error, "スニーカーの削除に失敗しました") };
  }

  return { data: null, error: null };
}
