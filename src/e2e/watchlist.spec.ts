import { test, expect } from "@playwright/test";

const WATCHLIST_STORAGE_KEY = "sneaker-radar-watchlist";

test.describe("Watchlist CRUD(D)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    await page.evaluate(
      ([key, ids]) => {
        localStorage.setItem(key, JSON.stringify(ids));
      },
      [WATCHLIST_STORAGE_KEY, ["sr-001", "sr-002"]] as const,
    );
    await page.goto("/watchlist");
    await expect(page.getByRole("heading", { name: "ウォッチリスト", level: 1 })).toBeVisible();
    await expect(page.getByText("2件")).toBeVisible();
  });

  test("ウォッチリストから削除できる", async ({ page }) => {
    const firstItem = page.getByRole("listitem").first();
    const removeButton = firstItem.getByRole("button", { name: /をウォッチリストから外す/ });

    await expect(removeButton).toBeVisible();
    await removeButton.click();

    await expect(page.getByText("1件")).toBeVisible();
    await expect(page.getByRole("listitem")).toHaveCount(1);

    const storageState = await page.evaluate(
      (key) => localStorage.getItem(key),
      WATCHLIST_STORAGE_KEY,
    );
    expect(storageState).not.toBeNull();

    const ids = JSON.parse(storageState!) as string[];
    expect(ids).toHaveLength(1);
    expect(ids).not.toContain("sr-001");
  });

  test("最後の1件を削除すると空状態が表示される", async ({ page }) => {
    await page.evaluate(
      ([key, ids]) => {
        localStorage.setItem(key, JSON.stringify(ids));
      },
      [WATCHLIST_STORAGE_KEY, ["sr-001"]] as const,
    );
    await page.reload();
    await expect(page.getByText("1件")).toBeVisible();

    await page
      .getByRole("button", { name: /をウォッチリストから外す/ })
      .click();

    await expect(page.getByText("0件")).toBeVisible();
    await expect(page.getByText("ウォッチ中のモデルはありません")).toBeVisible();

    const storageState = await page.evaluate(
      (key) => localStorage.getItem(key),
      WATCHLIST_STORAGE_KEY,
    );
    expect(JSON.parse(storageState!)).toEqual([]);
  });
});
