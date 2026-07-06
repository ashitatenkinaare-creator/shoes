import { test, expect } from "@playwright/test";
import { DEMO_ACCOUNT, DEMO_URLS } from "../data/demo-account";

test.describe("評価用デモ", () => {
  test("デモ URL の画面が正常に表示される", async ({ page }) => {
    test.setTimeout(90_000);
    for (const entry of DEMO_URLS) {
      await page.goto(entry.path, { waitUntil: "domcontentloaded" });
      await expect(page.locator("body")).not.toContainText("Application error");
    }
  });

  test("認証画面にデモアカウント情報が表示される", async ({ page }) => {
    await page.goto("/auth");
    await expect(page.getByText("評価用デモアカウント")).toBeVisible();
    await expect(page.getByText(DEMO_ACCOUNT.email)).toBeVisible();
    await expect(page.getByRole("button", { name: "デモアカウントを入力する" })).toBeVisible();
  });

  test("デモアカウント入力ボタンでログインフォームが埋まる", async ({ page }) => {
    await page.goto("/auth");
    await page.getByRole("button", { name: "デモアカウントを入力する" }).click();
    await expect(page.locator("#auth-email")).toHaveValue(DEMO_ACCOUNT.email);
    await expect(page.locator("#auth-password")).toHaveValue(DEMO_ACCOUNT.password);
  });
});
