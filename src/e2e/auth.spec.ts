import { test, expect } from "@playwright/test";
import { confirmUserEmail, createConfirmedTestUser, deleteUserByEmail } from "./helpers/auth-admin";
import { loadEnvLocal } from "./helpers/env";

function uniqueEmail(): string {
  return `e2e.radar.${Date.now()}@mailinator.com`;
}

const TEST_PASSWORD = "TestPass1234";

test.describe("Auth 導線", () => {
  test.beforeAll(() => {
    loadEnvLocal();
  });

  test("認証画面でログイン/新規登録タブを切り替えられる", async ({ page }) => {
    await page.goto("/auth");

    await expect(page.getByRole("tab", { name: "ログイン" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "新規登録" })).toBeVisible();
    await expect(page.locator("#auth-password-confirm")).toHaveCount(0);

    await page.getByRole("tab", { name: "新規登録" }).click();
    await expect(page.locator("#auth-password-confirm")).toBeVisible();

    await page.getByRole("tab", { name: "ログイン" }).click();
    await expect(page.locator("#auth-password-confirm")).toHaveCount(0);
  });

  test("未ログイン時にログイン導線から認証画面へ遷移できる", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/dashboard");

    const loginLink = page
      .getByRole("navigation", { name: "サイドナビ" })
      .getByRole("link", { name: /ログイン/ });
    await expect(loginLink).toBeVisible();
    await loginLink.click();
    await expect(page).toHaveURL(/\/auth/, { timeout: 15_000 });
  });

  test("サインアップ・ログイン・ログアウトの導線", async ({ page }) => {
    test.setTimeout(60_000);
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

      await page.goto("/settings");
      await expect(page.getByRole("button", { name: "条件を保存する" })).toBeVisible();
      const logoutButton = page.getByRole("main").getByRole("button", { name: "ログアウト" });
      await expect(logoutButton).toBeVisible();

      await logoutButton.click();
      await expect(page).toHaveURL(/\/auth/, { timeout: 15000 });

      await page.goto("/dashboard");
      await expect(
        page
          .getByRole("navigation", { name: "サイドナビ" })
          .getByRole("link", { name: /ログイン/ }),
      ).toBeVisible({ timeout: 10000 });
    } finally {
      await deleteUserByEmail(email).catch(() => undefined);
    }
  });
});
