import { test, expect, type Page } from "@playwright/test";
import { createConfirmedTestUser, deleteUserByEmail, getUserIdByEmail } from "./helpers/auth-admin";
import { loadEnvLocal } from "./helpers/env";
import {
  E2E_NOTIFICATION_URLS,
  E2E_SNEAKER_IDS,
  setupTwoPhaseNotificationFixtures,
} from "./helpers/notification-setup";

const TEST_PASSWORD = "TestPass1234";

function uniqueEmail(): string {
  return `e2e.notify.${Date.now()}@mailinator.com`;
}

async function loginViaUi(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/auth");
  await page.locator("#auth-email").fill(email);
  await page.locator("#auth-password").fill(password);
  await page.getByRole("button", { name: "ログイン" }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 15000 });
}

test.describe("2段階通知（発表 / 抽選ページ開設）", () => {
  test.beforeAll(() => {
    loadEnvLocal();
  });

  test("通知パネルと詳細画面で第1弾・第2弾が正しく表示される", async ({ page }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width: 1280, height: 720 });
    const email = uniqueEmail();

    await createConfirmedTestUser(email, TEST_PASSWORD);
    const userId = await getUserIdByEmail(email);
    expect(userId).not.toBeNull();
    await setupTwoPhaseNotificationFixtures(userId!);

    try {
      await loginViaUi(page, email, TEST_PASSWORD);

      await page.goto("/dashboard");
      await page.getByRole("button", { name: "通知を確認" }).click();
      await expect(page.getByRole("dialog", { name: "通知一覧" })).toBeVisible();
      await expect(page.getByText("読み込み中...")).toBeHidden({ timeout: 15000 });

      const dialog = page.getByRole("dialog", { name: "通知一覧" });
      await expect(dialog.getByText(/【本日発表】/)).toHaveCount(2);
      await expect(dialog.getByText(/【販売・抽選ページ開設！】/)).toHaveCount(1);

      const announcementItem = dialog.locator("li").filter({ hasText: "【本日発表】" }).first();
      await expect(announcementItem.getByRole("link", { name: "リンクを開く" })).toHaveAttribute(
        "href",
        E2E_NOTIFICATION_URLS.news,
      );

      const lotteryItem = dialog.locator("li").filter({ hasText: "【販売・抽選ページ開設！" });
      await expect(lotteryItem.getByRole("link", { name: "リンクを開く" })).toHaveAttribute(
        "href",
        E2E_NOTIFICATION_URLS.lottery,
      );

      await page.goto(`/sneaker/${E2E_SNEAKER_IDS.nikeRare}`);
      const newsButton = page.getByRole("link", { name: "公式発表を見る" });
      await expect(newsButton).toBeVisible();
      await expect(newsButton).toHaveAttribute("href", E2E_NOTIFICATION_URLS.news);

      await page.goto(`/sneaker/${E2E_SNEAKER_IDS.jordanRare}`);
      const lotteryButton = page.getByRole("link", { name: "公式抽選・販売ページへ" });
      await expect(lotteryButton).toBeVisible();
      await expect(lotteryButton).toHaveAttribute("href", E2E_NOTIFICATION_URLS.lottery);
    } finally {
      await deleteUserByEmail(email).catch(() => undefined);
    }
  });

  test("設定画面に第1弾・第2弾の通知ラベルが表示される", async ({ page }) => {
    await page.goto("/settings");
    await expect(
      page.getByRole("checkbox", { name: /公式の新作発表・解禁ニュース（第1弾）/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("checkbox", { name: /公式の販売・抽選ページ開設の速報（第2弾）/ }),
    ).toBeVisible();
    await expect(page.getByText(/1〜2ヶ月先のコラボ発表（第1弾）/)).toBeVisible();
  });
});
