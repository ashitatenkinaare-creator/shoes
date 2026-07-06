import { describe, expect, it } from "vitest";
import { MOCK_PREFERENCES } from "@/data/radar-mock";
import { buildNotificationDrafts } from "@/lib/radar/notifications";

const today = new Date("2026-07-05T12:00:00");

const baseSneaker = {
  id: "test-id",
  brand: "Nike",
  model_name: "Air Jordan 1 x Travis Scott",
  announce_date: "2026-07-05",
  release_date: "2026-08-05",
  news_url: "https://example.com/news",
  lottery_url: null as string | null,
  lottery_opened_at: null as string | null,
};

describe("buildNotificationDrafts", () => {
  it("news_url のみのとき第1弾（発表）通知を生成する", () => {
    const drafts = buildNotificationDrafts([baseSneaker], MOCK_PREFERENCES, today);
    const announcement = drafts.find((d) => d.phase === "announcement");
    expect(announcement).toBeDefined();
    expect(announcement?.title).toContain("【本日発表】");
    expect(announcement?.title).toContain("新作コラボが発売決定");
    expect(announcement?.action_url).toBe("https://example.com/news");
  });

  it("lottery_url が開設されたとき第2弾（抽選ページ）通知を生成する", () => {
    const drafts = buildNotificationDrafts(
      [
        {
          ...baseSneaker,
          lottery_url: "https://example.com/lottery",
          lottery_opened_at: "2026-07-05T09:00:00Z",
        },
      ],
      MOCK_PREFERENCES,
      today,
    );
    const lotteryOpen = drafts.find((d) => d.phase === "lottery_open");
    expect(lotteryOpen).toBeDefined();
    expect(lotteryOpen?.title).toContain("【販売・抽選ページ開設！】");
    expect(lotteryOpen?.action_url).toBe("https://example.com/lottery");
  });

  it("notifyOnAnnouncement OFF のとき発表通知を生成しない", () => {
    const drafts = buildNotificationDrafts(
      [baseSneaker],
      { ...MOCK_PREFERENCES, notifyOnAnnouncement: false },
      today,
    );
    expect(drafts.some((d) => d.phase === "announcement")).toBe(false);
  });
});
