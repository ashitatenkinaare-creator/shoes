import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const fallback = {
  title: "【本日発表】Nikeから1ヶ月後に新作コラボが発売決定！",
  body: "Nike の新作コラボが発表されました。",
};

describe("generateNotificationCopy", () => {
  const originalEnv = { ...process.env };

  beforeEach(async () => {
    vi.resetModules();
    delete process.env.GEMINI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.DISABLE_LLM_NOTIFICATIONS;
    delete process.env.CI;
    delete process.env.VITEST;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("API キー未設定時は fallback を返す", async () => {
    const { generateNotificationCopy, isLlmNotificationCopyEnabled } =
      await import("@/lib/radar/llm-notification-copy");
    const copy = await generateNotificationCopy({
      phase: "announcement",
      brand: "Nike",
      modelName: "Air Jordan 1",
      leadTime: "1ヶ月後",
      fallback,
    });

    expect(copy).toEqual(fallback);
    expect(isLlmNotificationCopyEnabled()).toBe(false);
  });

  it("Vitest 実行中は LLM を呼ばず fallback を返す", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    process.env.VITEST = "true";

    const { generateNotificationCopy, isLlmNotificationCopyEnabled } =
      await import("@/lib/radar/llm-notification-copy");

    const copy = await generateNotificationCopy({
      phase: "announcement",
      brand: "Nike",
      modelName: "Air Jordan 1",
      fallback,
    });

    expect(copy).toEqual(fallback);
    expect(isLlmNotificationCopyEnabled()).toBe(false);
  });

  it("DISABLE_LLM_NOTIFICATIONS=1 のとき LLM を無効化する", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    process.env.DISABLE_LLM_NOTIFICATIONS = "1";
    const { isLlmNotificationCopyEnabled } = await import("@/lib/radar/llm-notification-copy");
    expect(isLlmNotificationCopyEnabled()).toBe(false);
  });
});

describe("enrichNotificationDraftsWithLlm", () => {
  it("LLM 無効時は元の draft を維持する", async () => {
    const { enrichNotificationDraftsWithLlm } =
      await import("@/lib/radar/notifications-sync.server");

    const drafts = [
      {
        sneaker_id: "test-id",
        phase: "announcement" as const,
        title: fallback.title,
        body: fallback.body,
        action_url: "https://example.com/news",
      },
    ];

    const sneakers = [
      {
        id: "test-id",
        brand: "Nike",
        model_name: "Air Jordan 1",
        announce_date: "2026-07-05",
        release_date: "2026-08-05",
        news_url: "https://example.com/news",
        lottery_url: null,
        lottery_opened_at: null,
      },
    ];

    const enriched = await enrichNotificationDraftsWithLlm(drafts, sneakers);
    expect(enriched[0]?.title).toBe(fallback.title);
  });
});
