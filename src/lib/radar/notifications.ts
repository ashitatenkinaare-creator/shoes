import type { NotificationPhase, UserPreferences } from "@/types/radar";
import type { RadarSneakerRow } from "@/types/radar-db";

type WatchlistSneaker = RadarSneakerRow;

export type NotificationDraft = {
  sneaker_id: string;
  phase: NotificationPhase;
  title: string;
  body: string;
};

function daysBetween(from: Date, to: Date): number {
  const ms = to.setHours(0, 0, 0, 0) - from.setHours(0, 0, 0, 0);
  return Math.round(ms / 86400000);
}

function parseDate(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

/** ウォッチ中モデルから送信候補の通知を生成（重複は DB unique で排除） */
export function buildNotificationDrafts(
  sneakers: WatchlistSneaker[],
  preferences: UserPreferences,
  today = new Date(),
): NotificationDraft[] {
  const drafts: NotificationDraft[] = [];

  for (const sneaker of sneakers) {
    const announceDate = parseDate(sneaker.announce_date);
    const releaseDate = parseDate(sneaker.release_date);
    const daysSinceAnnounce = daysBetween(announceDate, today);
    const daysUntilRelease = daysBetween(today, releaseDate);

    if (
      preferences.notifyOnAnnouncement &&
      daysSinceAnnounce >= 0 &&
      daysSinceAnnounce <= 7
    ) {
      drafts.push({
        sneaker_id: sneaker.id,
        phase: "announcement",
        title: `【発表】${sneaker.brand} ${sneaker.model_name}`,
        body: `${sneaker.brand} の新作が発表されました。詳細をチェックしましょう。`,
      });
    }

    if (
      preferences.notifyOnRelease &&
      daysUntilRelease >= 0 &&
      daysUntilRelease <= 3
    ) {
      const timing =
        daysUntilRelease === 0
          ? "本日発売"
          : daysUntilRelease === 1
            ? "明日発売"
            : `${daysUntilRelease}日後に発売`;
      drafts.push({
        sneaker_id: sneaker.id,
        phase: "release",
        title: `【発売】${sneaker.brand} ${sneaker.model_name}`,
        body: `${timing}。ストアを確認して抽選・購入準備を。`,
      });
    }
  }

  return drafts;
}

export function getPhaseLabel(phase: NotificationPhase): string {
  return phase === "announcement" ? "発表通知" : "発売通知";
}
