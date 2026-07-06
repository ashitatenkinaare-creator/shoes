import type { PostgrestError } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";
import type { RadarDbResult } from "@/types/radar-db";
import type { NotificationItem, NotificationLogRow } from "@/types/notification";
import { rowToNotification } from "@/types/notification";

function formatError(error: PostgrestError, context: string): string {
  return `${context}: ${error.message}`;
}

export async function fetchNotifications(
  userId: string,
): Promise<RadarDbResult<NotificationItem[]>> {
  const { data, error } = await getSupabase()
    .from("notification_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      data: null,
      error: formatError(error, "通知の取得に失敗しました"),
    };
  }

  return {
    data: (data as NotificationLogRow[]).map(rowToNotification),
    error: null,
  };
}

export async function syncNotifications(): Promise<RadarDbResult<number>> {
  try {
    const response = await fetch("/api/radar/sync-notifications", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      return {
        data: null,
        error: payload?.error ?? "通知の同期に失敗しました",
      };
    }

    const payload = (await response.json()) as { synced?: number };
    return { data: payload.synced ?? 0, error: null };
  } catch {
    return { data: null, error: "通知の同期に失敗しました" };
  }
}

export async function markNotificationRead(
  userId: string,
  notificationId: string,
): Promise<RadarDbResult<null>> {
  const { error } = await getSupabase()
    .from("notification_logs")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", userId);

  if (error) {
    return {
      data: null,
      error: formatError(error, "既読更新に失敗しました"),
    };
  }

  return { data: null, error: null };
}

export async function markAllNotificationsRead(userId: string): Promise<RadarDbResult<null>> {
  const { error } = await getSupabase()
    .from("notification_logs")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null);

  if (error) {
    return {
      data: null,
      error: formatError(error, "一括既読に失敗しました"),
    };
  }

  return { data: null, error: null };
}

export async function sendDemoNotification(userId: string): Promise<RadarDbResult<null>> {
  const { data, error } = await getSupabase()
    .from("watchlist")
    .select("sneaker_id, radar_sneakers(model_name, brand)")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    return {
      data: null,
      error: formatError(error, "デモ通知の送信に失敗しました"),
    };
  }

  if (!data) {
    return { data: null, error: "ウォッチリストにモデルを追加してください" };
  }

  const sneaker = data.radar_sneakers as unknown as { model_name: string; brand: string };

  const { error: insertError } = await getSupabase()
    .from("notification_logs")
    .upsert(
      {
        user_id: userId,
        sneaker_id: data.sneaker_id,
        phase: "announcement",
        title: `【デモ】${sneaker.brand} ${sneaker.model_name}`,
        body: "これは Sneaker Radar のサンプル通知です。本番では Web Push / FCM 等に拡張します。",
        read_at: null,
      },
      { onConflict: "user_id,sneaker_id,phase" },
    );

  if (insertError) {
    return {
      data: null,
      error: formatError(insertError, "デモ通知の送信に失敗しました"),
    };
  }

  return { data: null, error: null };
}
