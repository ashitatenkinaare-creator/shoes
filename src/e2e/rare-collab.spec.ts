import { test, expect } from "@playwright/test";

const PREFERENCES_STORAGE_KEY = "sneaker-radar-preferences";

test.describe("Rare/Collab filter", () => {
  test("設定画面でレア・コラボフィルタを保存できる", async ({ page }) => {
    await page.goto("/settings");
    await page.evaluate((key) => localStorage.removeItem(key), PREFERENCES_STORAGE_KEY);
    await page.reload();
    await expect(page.getByRole("button", { name: "条件を保存する" })).toBeVisible();

    await page.locator("label").filter({ hasText: "レアスニーカーのみ表示" }).click();
    await page.getByRole("button", { name: "条件を保存する" }).click();
    await expect(page.getByRole("status")).toContainText(/保存しました/);

    const stored = await page.evaluate((key) => localStorage.getItem(key), PREFERENCES_STORAGE_KEY);
    const parsed = JSON.parse(stored!) as { filterRare: boolean };

    expect(parsed.filterRare).toBe(true);
  });

  test("レアフィルタONでダッシュボードが絞り込まれる", async ({ page }) => {
    await page.goto("/dashboard");
    await page.evaluate(
      ([key, value]) => {
        localStorage.setItem(key, value);
      },
      [
        PREFERENCES_STORAGE_KEY,
        JSON.stringify({
          brands: ["Nike", "Jordan", "New Balance", "Adidas", "Asics", "Puma", "Converse", "Yeezy"],
          sizes: ["27.0", "27.5", "28.0"],
          notifyOnAnnouncement: true,
          notifyOnRelease: true,
          filterRare: true,
          filterCollab: false,
        }),
      ],
    );
    await page.reload();

    await expect(page.getByText("フィルタ: レア のみ表示中")).toBeVisible();

    const section = page.locator("section").filter({
      has: page.getByRole("heading", { name: "条件にマッチした新作" }),
    });
    const sneakers = section.locator(":scope > ul > li");
    await expect(sneakers.first()).toBeVisible();
    expect(await sneakers.count()).toBeGreaterThan(0);

    for (let i = 0, count = await sneakers.count(); i < count; i += 1) {
      await expect(sneakers.nth(i).getByText("レア", { exact: true }).first()).toBeVisible();
    }
  });
});
