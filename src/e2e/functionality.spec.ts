/**
 * 評価基準「5. 機能」（難易度 C）に対応する E2E テスト
 */
import { test, expect, type Page } from "@playwright/test";
import { confirmUserEmail, createConfirmedTestUser, deleteUserByEmail } from "./helpers/auth-admin";
import { loadEnvLocal } from "./helpers/env";
import { expectMatchedSneakerList } from "./helpers/radar-catalog";
import { ALL_APP_SCREEN_PATHS } from "../data/demo-account";

const PREFERENCES_STORAGE_KEY = "sneaker-radar-preferences";
const WATCHLIST_STORAGE_KEY = "sneaker-radar-watchlist";
const TEST_PASSWORD = "DemoPass1234";

function uniqueEmail(): string {
  return `e2e.functionality.${Date.now()}@mailinator.com`;
}

async function seedWatchlistFromDashboard(page: Page, count = 1): Promise<string[]> {
  await page.goto("/dashboard");
  const sneakers = await expectMatchedSneakerList(page);
  const ids: string[] = [];

  for (let i = 0, total = await sneakers.count(); i < total && ids.length < count; i += 1) {
    const href = await sneakers.nth(i).locator('a[href^="/sneaker/"]').first().getAttribute("href");
    if (!href) continue;
    const id = href.replace("/sneaker/", "");
    if (!ids.includes(id)) ids.push(id);
  }

  await page.evaluate(
    ([key, watchIds]) => {
      localStorage.setItem(key, JSON.stringify(watchIds));
    },
    [WATCHLIST_STORAGE_KEY, ids.slice(0, count)] as const,
  );

  return ids.slice(0, count);
}

test.describe("5. 機能（評価基準）", () => {
  test.beforeAll(() => {
    loadEnvLocal();
  });

  test("全ての画面がエラーなく表示できる", async ({ page }) => {
    for (const path of ALL_APP_SCREEN_PATHS) {
      await page.goto(path);
      await expect(page.locator("body")).not.toContainText("Application error");
    }
  });

  test("登録機能が想定通りに動く（CRUDのC）", async ({ page }) => {
    await page.goto("/settings");
    await page.evaluate((key) => localStorage.removeItem(key), PREFERENCES_STORAGE_KEY);

    const brandGroup = page.getByRole("group", { name: "ブランド / メーカー" });
    await brandGroup.getByRole("button", { name: "Adidas" }).click();
    await page.getByRole("button", { name: "条件を保存する" }).click();
    await expect(page.getByRole("status")).toContainText(/保存しました/);

    const modelName = `E2E-Functionality-${Date.now()}`;
    await page.goto("/sneakers");
    await page.locator("#brand").fill("Nike");
    await page.locator("#modelName").fill(modelName);
    await page.locator("#releaseDate").fill("2026-07-12");
    await page.getByRole("button", { name: "登録する" }).click();

    await expect(page.locator("ul > li").filter({ hasText: modelName })).toBeVisible({
      timeout: 15000,
    });
  });

  test("表示機能が想定通りに動く（CRUDのR）", async ({ page }) => {
    await page.goto("/dashboard");
    const sneakers = await expectMatchedSneakerList(page);
    await expect(sneakers.first()).toBeVisible();
    await expect(page.getByText(/件の新作/)).toBeVisible();
  });

  test("更新機能が想定通りに動く（CRUDのU）", async ({ page }) => {
    await page.goto("/settings");
    await page.evaluate((key) => localStorage.removeItem(key), PREFERENCES_STORAGE_KEY);
    await page.reload();

    const brandGroup = page.getByRole("group", { name: "ブランド / メーカー" });
    await brandGroup.getByRole("button", { name: "Adidas" }).click();
    await page.getByRole("button", { name: "条件を保存する" }).click();
    await expect(page.getByRole("status")).toContainText(/保存しました/);

    await brandGroup.getByRole("button", { name: "Adidas" }).click();
    await brandGroup.getByRole("button", { name: "Puma" }).click();
    await page.getByRole("button", { name: "条件を保存する" }).click();
    await expect(page.getByRole("status")).toContainText(/保存しました/);

    const parsed = JSON.parse(
      (await page.evaluate((key) => localStorage.getItem(key), PREFERENCES_STORAGE_KEY))!,
    ) as { brands: string[] };
    expect(parsed.brands).toContain("Puma");
    expect(parsed.brands).not.toContain("Adidas");
  });

  test("削除機能が想定通りに動く（CRUDのD）", async ({ page }) => {
    await seedWatchlistFromDashboard(page, 1);
    await page.goto("/watchlist");
    await expect(page.locator("header").getByText("1件", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: /をウォッチリストから外す/ }).click();
    await expect(page.locator("header").getByText("0件", { exact: true })).toBeVisible();
    await expect(page.getByText("ウォッチ中のモデルはありません")).toBeVisible();
  });

  test("サインアップ機能が想定通りに動く", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    const email = uniqueEmail();
    const form = () => page.locator("form");

    try {
      await page.goto("/auth");
      await page.getByRole("tab", { name: "新規登録" }).click();
      await page.locator("#auth-email").fill(email);
      await page.locator("#auth-password").fill(TEST_PASSWORD);
      await page.locator("#auth-password-confirm").fill(TEST_PASSWORD);
      await page.getByRole("button", { name: "アカウントを作成" }).click();

      const outcome = await Promise.race([
        page.waitForURL(/\/dashboard/, { timeout: 15000 }).then(() => "session" as const),
        form()
          .getByRole("status")
          .waitFor({ timeout: 15000 })
          .then(() => "confirm" as const),
        form()
          .getByRole("alert")
          .waitFor({ timeout: 15000 })
          .then(() => "error" as const),
      ]);

      if (outcome === "error") {
        const message = (await form().getByRole("alert").textContent())?.trim() ?? "";
        if (/rate limit exceeded/i.test(message)) {
          await createConfirmedTestUser(email, TEST_PASSWORD);
        } else {
          throw new Error(`Sign up failed: ${message || "unknown error"}`);
        }
      } else if (outcome === "confirm") {
        await expect(form().getByRole("status")).toContainText(/確認メール|ログイン/);
        await confirmUserEmail(email);
      }

      if (outcome !== "session") {
        await page.goto("/auth");
        await page.locator("#auth-email").fill(email);
        await page.locator("#auth-password").fill(TEST_PASSWORD);
        await page.getByRole("button", { name: "ログイン" }).click();
        await page.waitForURL(/\/dashboard/, { timeout: 15000 });
      }

      await expect(page).toHaveURL(/\/dashboard/);
    } finally {
      await deleteUserByEmail(email).catch(() => undefined);
    }
  });

  test("ログアウト機能が想定通りに動く", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/auth");
    await page.getByRole("button", { name: "デモアカウントを入力する" }).click();
    await page.getByRole("button", { name: "ログイン" }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    await page.goto("/settings");
    await page.getByRole("main").getByRole("button", { name: "ログアウト" }).click();
    await expect(page).toHaveURL(/\/auth/);

    await page.goto("/dashboard");
    await expect(
      page.getByRole("navigation", { name: "サイドナビ" }).getByRole("link", { name: /ログイン/ }),
    ).toBeVisible();
  });
});
