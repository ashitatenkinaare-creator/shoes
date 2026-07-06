import { test, expect } from "@playwright/test";

test("スニーカー登録画面のタイトルが表示されること", async ({ page }) => {
  await page.goto("/sneakers");
  await expect(page.getByRole("heading", { name: "スニーカー登録" })).toBeVisible();
});

test("スニーカーを新規登録できる", async ({ page }) => {
  const modelName = `E2E-Air Jordan 1 ${Date.now()}`;

  await page.goto("/sneakers");
  await expect(page.getByRole("heading", { name: "スニーカー登録" })).toBeVisible();

  await page.locator("#brand").fill("Nike");
  await page.locator("#modelName").fill(modelName);
  await page.locator("#releaseDate").fill("2026-07-12");
  await page.getByRole("button", { name: "登録する" }).click();

  await expect(page.locator("#modelName")).toHaveValue("", { timeout: 15000 });
  await expect(page.locator("#brand")).toHaveValue("");
  await expect(page.locator("#releaseDate")).toHaveValue("");

  let item = page.locator("ul > li").filter({ hasText: modelName });
  try {
    await expect(item).toBeVisible({ timeout: 5000 });
  } catch {
    await page.reload();
    item = page.locator("ul > li").filter({ hasText: modelName });
    await expect(item).toBeVisible({ timeout: 15000 });
  }

  await expect(item).toContainText("Nike");
  await expect(item.getByRole("switch", { name: `${modelName}の通知設定` })).toBeVisible();

  await page.reload();
  await expect(page.locator("ul > li").filter({ hasText: modelName })).toBeVisible();
});
