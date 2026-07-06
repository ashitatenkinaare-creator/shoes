import type { NotificationPhase, UserPreferences } from "@/types/radar";
import type { RadarSneakerRow } from "@/types/radar-db";
import { isGenericBrandHubUrl } from "@/lib/radar/sneaker-links";

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

export type NotificationDraft = {
  sneaker_id: string;
  phase: NotificationPhase;
  title: string;
  body: string;
  action_url: string | null;
};

function daysBetween(from: Date, to: Date): number {
  const ms = to.setHours(0, 0, 0, 0) - from.setHours(0, 0, 0, 0);
  return Math.round(ms / 86400000);
}

function parseDate(iso: string): Date {
  return new Date(`${iso.slice(0, 10)}T00:00:00`);
}

function parseDateTime(iso: string): Date {
  return new Date(iso);
}

function isWithinDaysOfToday(target: Date, today: Date, maxDays: number): boolean {
  const diff = daysBetween(target, today);
  return diff >= 0 && diff <= maxDays;
}

/** 発売日までの期間を通知文言用に整形（例: 1ヶ月後 / 2週間後） */
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

function productOfficialUrl(url: string | null | undefined): string | null {
  if (!url || isGenericBrandHubUrl(url)) return null;
  return url;
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

    const newsUrl = productOfficialUrl(sneaker.news_url);
    const lotteryUrl = productOfficialUrl(sneaker.lottery_url);

    // 第1弾: 公式発表（news_url）
    if (
      preferences.notifyOnAnnouncement &&
      newsUrl &&
      daysSinceAnnounce >= 0 &&
      daysSinceAnnounce <= 7
    ) {
      const leadTime = formatReleaseLeadTime(daysUntilRelease);
      drafts.push({
        sneaker_id: sneaker.id,
        phase: "announcement",
        title: `【本日発表】${sneaker.brand}から${leadTime}に新作コラボが発売決定！公式ニュースをチェックしよう`,
        body: `${sneaker.brand} の新作コラボが発表されました。公式ニュースをチェックしよう。`,
        action_url: newsUrl,
      });
    }

    // 第2弾: 販売・抽選ページ開設（lottery_url）
    if (preferences.notifyOnRelease && lotteryUrl) {
      const openedAt = sneaker.lottery_opened_at ? parseDateTime(sneaker.lottery_opened_at) : today;

      if (isWithinDaysOfToday(openedAt, today, 7)) {
        drafts.push({
          sneaker_id: sneaker.id,
          phase: "lottery_open",
          title: `【販売・抽選ページ開設！】${sneaker.model_name}の抽選受付が開始されました。今すぐエントリーしよう！`,
          body: `${sneaker.brand} ${sneaker.model_name} の抽選・購入ページが公開されました。`,
          action_url: lotteryUrl,
        });
      }
    } else if (
      preferences.notifyOnRelease &&
      !lotteryUrl &&
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
        body: `${timing}。公式ページを確認して抽選・購入準備を。`,
        action_url: newsUrl,
      });
    }
  }

  return drafts;
}

export function getPhaseLabel(phase: NotificationPhase): string {
  if (phase === "announcement") return "発表通知";
  if (phase === "lottery_open") return "抽選ページ開設";
  return "発売通知";
}
