import { test, expect } from "@playwright/test";

const PREFERENCES_STORAGE_KEY = "sneaker-radar-preferences";

test.describe("Settings Page (正常系動作テスト)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("button", { name: "条件を保存する" })).toBeVisible();
  });

  test("設定フォーム（ブランド・サイズ・通知）が表示されていること", async ({ page }) => {
    await expect(page.locator("form")).toBeVisible();
    await expect(page.getByRole("group", { name: /ブランド/i })).toBeVisible();
    await expect(page.getByRole("group", { name: /サイズ/i })).toBeVisible();
    await expect(page.getByRole("checkbox", { name: /新作発表通知/i })).toBeVisible();
    await expect(page.getByRole("checkbox", { name: /発売当日通知/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "条件を保存する" })).toBeVisible();
  });

  test("未ログイン状態で設定を保存し、localStorageに反映されること", async ({ page }) => {
    await page.evaluate((key) => localStorage.removeItem(key), PREFERENCES_STORAGE_KEY);

    const brandGroup = page.getByRole("group", { name: /ブランド/i });
    await brandGroup.getByRole("button", { name: "Adidas" }).click();

    await page.getByRole("button", { name: "条件を保存する" }).click();
    await expect(page.getByRole("status")).toContainText(/保存しました/);

    const storageState = await page.evaluate(
      (key) => localStorage.getItem(key),
      PREFERENCES_STORAGE_KEY,
    );
    expect(storageState).not.toBeNull();

    const parsed = JSON.parse(storageState!) as { brands: string[] };
    expect(parsed.brands).toContain("Adidas");
  });

  test("設定内容の更新がlocalStorageに反映される", async ({ page }) => {
    await page.evaluate((key) => localStorage.removeItem(key), PREFERENCES_STORAGE_KEY);
    await page.reload();
    await expect(page.getByRole("button", { name: "条件を保存する" })).toBeVisible();

    const brandGroup = page.getByRole("group", { name: /ブランド/i });

    for (const brand of ["Nike", "Jordan", "New Balance"]) {
      const button = brandGroup.getByRole("button", { name: brand });
      if ((await button.getAttribute("aria-pressed")) === "true") {
        await button.click();
      }
    }

    await brandGroup.getByRole("button", { name: "Adidas" }).click();
    await page.getByRole("button", { name: "条件を保存する" }).click();
    await expect(page.getByRole("status")).toContainText(/保存しました/);

    await brandGroup.getByRole("button", { name: "Adidas" }).click();
    await brandGroup.getByRole("button", { name: "Puma" }).click();
    await page.getByRole("button", { name: "条件を保存する" }).click();
    await expect(page.getByRole("status")).toContainText(/保存しました/);

    const storageState = await page.evaluate(
      (key) => localStorage.getItem(key),
      PREFERENCES_STORAGE_KEY,
    );
    const parsed = JSON.parse(storageState!) as { brands: string[] };

    expect(parsed.brands).toContain("Puma");
    expect(parsed.brands).not.toContain("Adidas");
  });
});
