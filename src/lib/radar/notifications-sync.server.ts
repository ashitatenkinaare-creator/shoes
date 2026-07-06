import type { SupabaseClient } from "@supabase/supabase-js";
import { MOCK_PREFERENCES } from "@/data/radar-mock";
import { generateNotificationCopy } from "@/lib/radar/llm-notification-copy";
import { rowToPreferences } from "@/lib/radar/map-preferences";
import { buildNotificationDrafts, type NotificationDraft } from "@/lib/radar/notifications";
import { sendWebPushForUser } from "@/lib/radar/web-push.server";
import type { NotificationPhase } from "@/types/radar";
import type { RadarDbResult, RadarSneakerRow, UserPreferencesRow } from "@/types/radar-db";

type WatchlistJoinRow = {
  radar_sneakers: RadarSneakerRow;
};

type WatchlistSneaker = Pick<
  RadarSneakerRow,
  | "id"
  | "brand"
  | "model_name"
  | "announce_date"
  | "release_date"
  | "news_url"
  | "lottery_url"
  | "lottery_opened_at"
>;

function parseDate(iso: string): Date {
  return new Date(`${iso.slice(0, 10)}T00:00:00`);
}

function daysBetween(from: Date, to: Date): number {
  const ms = to.setHours(0, 0, 0, 0) - from.setHours(0, 0, 0, 0);
  return Math.round(ms / 86400000);
}

function formatReleaseLeadTime(daysUntilRelease: number): string {
  if (daysUntilRelease >= 28) {
    const months = Math.max(1, Math.round(daysUntilRelease / 30));
    return `${months}ヶ月後`;
  }
  if (daysUntilRelease >= 7) {
    const weeks = Math.max(1, Math.round(daysUntilRelease / 7));
    return `${weeks}週間後`;
  }
  if (daysUntilRelease === 0) return "本日";
  return `${daysUntilRelease}日後`;
}

/** サーバー専用: LLM で通知文を動的生成（失敗時は draft の固定文言を維持） */
export async function enrichNotificationDraftsWithLlm(
  drafts: NotificationDraft[],
  sneakers: WatchlistSneaker[],
  today = new Date(),
): Promise<NotificationDraft[]> {
  if (drafts.length === 0) return drafts;

  const sneakerById = new Map(sneakers.map((sneaker) => [sneaker.id, sneaker]));

  return Promise.all(
    drafts.map(async (draft) => {
      const sneaker = sneakerById.get(draft.sneaker_id);
      if (!sneaker) return draft;

      const releaseDate = parseDate(sneaker.release_date);
      const daysUntilRelease = daysBetween(today, releaseDate);
      const leadTime =
        draft.phase === "announcement" ? formatReleaseLeadTime(daysUntilRelease) : undefined;

      const copy = await generateNotificationCopy({
        phase: draft.phase as NotificationPhase,
        brand: sneaker.brand,
        modelName: sneaker.model_name,
        leadTime,
        fallback: { title: draft.title, body: draft.body },
      });

      return { ...draft, title: copy.title, body: copy.body };
    }),
  );
}

/** サーバー専用: ウォッチリストから通知を同期（LLM 文案生成込み） */
export async function syncNotificationsForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<RadarDbResult<number>> {
  const { data: prefRow, error: prefError } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (prefError) {
    return { data: null, error: `条件設定の取得に失敗しました: ${prefError.message}` };
  }

  const preferences = prefRow ? rowToPreferences(prefRow as UserPreferencesRow) : MOCK_PREFERENCES;

  const { data: watchlistData, error: watchError } = await supabase
    .from("watchlist")
    .select("radar_sneakers(*)")
    .eq("user_id", userId);

  if (watchError) {
    return {
      data: null,
      error: `ウォッチリストの取得に失敗しました: ${watchError.message}`,
    };
  }

  const sneakers = ((watchlistData ?? []) as unknown as WatchlistJoinRow[])
    .map((row) => row.radar_sneakers)
    .filter(Boolean);

  const baseDrafts = buildNotificationDrafts(sneakers, preferences);
  const drafts = await enrichNotificationDraftsWithLlm(baseDrafts, sneakers);

  if (drafts.length === 0) {
    return { data: 0, error: null };
  }

  const { data: existingRows } = await supabase
    .from("notification_logs")
    .select("sneaker_id, phase")
    .eq("user_id", userId);

  const existingKeys = new Set((existingRows ?? []).map((row) => `${row.sneaker_id}:${row.phase}`));
  const newDrafts = drafts.filter(
    (draft) => !existingKeys.has(`${draft.sneaker_id}:${draft.phase}`),
  );

  const rows = drafts.map((draft) => ({
    user_id: userId,
    sneaker_id: draft.sneaker_id,
    phase: draft.phase,
    title: draft.title,
    body: draft.body,
    action_url: draft.action_url,
  }));

  const { error: insertError } = await supabase
    .from("notification_logs")
    .upsert(rows, { onConflict: "user_id,sneaker_id,phase", ignoreDuplicates: true });

  if (insertError) {
    return { data: null, error: `通知の同期に失敗しました: ${insertError.message}` };
  }

  if (newDrafts.length > 0) {
    await sendWebPushForUser(
      supabase,
      userId,
      newDrafts.map((draft) => ({
        title: draft.title,
        body: draft.body,
        url: draft.action_url ?? "/dashboard",
      })),
    );
  }

  return { data: newDrafts.length, error: null };
}
