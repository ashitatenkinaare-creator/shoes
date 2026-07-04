import type { PostgrestError } from "@supabase/supabase-js";
import { MOCK_PREFERENCES } from "@/data/radar-mock";
import { buildNotificationDrafts } from "@/lib/radar/notifications";
import { fetchUserPreferences } from "@/lib/radar/preferences-db";
import { getSupabase } from "@/lib/supabase/client";
import type { RadarDbResult, RadarSneakerRow } from "@/types/radar-db";
import type { NotificationItem, NotificationLogRow } from "@/types/notification";
import { rowToNotification } from "@/types/notification";

function formatError(error: PostgrestError, context: string): string {
  return `${context}: ${error.message}`;
}

type WatchlistJoinRow = {
  radar_sneakers: RadarSneakerRow;
};

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

export async function syncNotifications(userId: string): Promise<RadarDbResult<number>> {
  const { data: prefs, error: prefError } = await fetchUserPreferences(userId);
  if (prefError) return { data: null, error: prefError };

  const preferences = prefs ?? MOCK_PREFERENCES;

  const { data: watchlistData, error: watchError } = await getSupabase()
    .from("watchlist")
    .select("radar_sneakers(*)")
    .eq("user_id", userId);

  if (watchError) {
    return {
      data: null,
      error: formatError(watchError, "ウォッチリストの取得に失敗しました"),
    };
  }

  const sneakers = ((watchlistData ?? []) as unknown as WatchlistJoinRow[])
    .map((row) => row.radar_sneakers)
    .filter(Boolean);

  const drafts = buildNotificationDrafts(sneakers, preferences);

  if (drafts.length === 0) {
    return { data: 0, error: null };
  }

  const rows = drafts.map((draft) => ({
    user_id: userId,
    sneaker_id: draft.sneaker_id,
    phase: draft.phase,
    title: draft.title,
    body: draft.body,
  }));

  const { error: insertError } = await getSupabase()
    .from("notification_logs")
    .upsert(rows, { onConflict: "user_id,sneaker_id,phase", ignoreDuplicates: true });

  if (insertError) {
    return {
      data: null,
      error: formatError(insertError, "通知の同期に失敗しました"),
    };
  }

  return { data: drafts.length, error: null };
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

export async function markAllNotificationsRead(
  userId: string,
): Promise<RadarDbResult<null>> {
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

export async function sendDemoNotification(
  userId: string,
): Promise<RadarDbResult<null>> {
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

  const { error: insertError } = await getSupabase().from("notification_logs").upsert(
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
