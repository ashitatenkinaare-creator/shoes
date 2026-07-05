import { test, expect } from "@playwright/test";

const PREFERENCES_STORAGE_KEY = "sneaker-radar-preferences";

test.describe("Silhouette / Collab brand filters", () => {
  test("設定画面でシルエットとコラボブランドを保存できる", async ({ page }) => {
    await page.goto("/settings");
    await page.evaluate((key) => localStorage.removeItem(key), PREFERENCES_STORAGE_KEY);
    await page.reload();

    await page.locator("label").filter({ hasText: "All Star" }).click();
    await page.locator("label").filter({ hasText: "KITH" }).click();
    await page.getByRole("button", { name: "条件を保存する" }).click();
    await expect(page.getByRole("status")).toContainText(/保存しました/);

    const stored = await page.evaluate((key) => localStorage.getItem(key), PREFERENCES_STORAGE_KEY);
    const parsed = JSON.parse(stored!) as {
      silhouettes: string[];
      collabBrands: string[];
    };

    expect(parsed.silhouettes).toContain("All Star");
    expect(parsed.collabBrands).toContain("KITH");
  });

  test("シルエット指定でダッシュボードが絞り込まれる", async ({ page }) => {
    await page.goto("/dashboard");
    await page.evaluate(
      ([key, value]) => {
        localStorage.setItem(key, value);
      },
      [
        PREFERENCES_STORAGE_KEY,
        JSON.stringify({
          brands: ["Nike", "Jordan", "Adidas", "New Balance", "Asics", "Puma", "Converse", "Yeezy"],
          sizes: ["27.0", "27.5", "28.0"],
          silhouettes: ["All Star"],
          collabBrands: [],
          notifyOnAnnouncement: true,
          notifyOnRelease: true,
          filterRare: false,
          filterCollab: false,
        }),
      ],
    );
    await page.reload();

    await expect(page.getByText(/シルエット: All Star/)).toBeVisible();
  });
});
