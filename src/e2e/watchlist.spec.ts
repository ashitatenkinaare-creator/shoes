import { test, expect, type Page } from "@playwright/test";
import { expectMatchedSneakerList } from "./helpers/radar-catalog";

const WATCHLIST_STORAGE_KEY = "sneaker-radar-watchlist";

async function seedWatchlistFromDashboard(page: Page, count = 2): Promise<string[]> {
  await page.goto("/dashboard");

  const sneakers = await expectMatchedSneakerList(page);
  const ids: string[] = [];

  for (let i = 0, total = await sneakers.count(); i < total && ids.length < count; i += 1) {
    const href = await sneakers
      .nth(i)
      .locator('a[href^="/sneaker/"]')
      .first()
      .getAttribute("href");
    if (!href) continue;
    const id = href.replace("/sneaker/", "");
    if (!ids.includes(id)) ids.push(id);
  }

  expect(ids.length).toBeGreaterThanOrEqual(count);

  await page.evaluate(
    ([key, watchIds]) => {
      localStorage.setItem(key, JSON.stringify(watchIds));
    },
    [WATCHLIST_STORAGE_KEY, ids.slice(0, count)] as const,
  );

  return ids.slice(0, count);
}

test.describe("Watchlist CRUD(D)", () => {
  test.beforeEach(async ({ page }) => {
    await seedWatchlistFromDashboard(page, 2);
    await page.goto("/watchlist");
    await expect(page.getByRole("heading", { name: "ウォッチリスト", level: 1 })).toBeVisible();
    await expect(page.locator("header").getByText("2件", { exact: true })).toBeVisible();
  });

  test("ウォッチリストから削除できる", async ({ page }) => {
    const firstItem = page.getByRole("listitem").first();
    const removeButton = firstItem.getByRole("button", { name: /をウォッチリストから外す/ });

    await expect(removeButton).toBeVisible();
    await removeButton.click();

    await expect(page.locator("header").getByText("1件", { exact: true })).toBeVisible();
    await expect(page.getByRole("listitem")).toHaveCount(1);

    const storageState = await page.evaluate(
      (key) => localStorage.getItem(key),
      WATCHLIST_STORAGE_KEY,
    );
    expect(storageState).not.toBeNull();

    const ids = JSON.parse(storageState!) as string[];
    expect(ids).toHaveLength(1);

    const seededIds = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key) ?? "[]") as string[],
      WATCHLIST_STORAGE_KEY,
    );
    expect(seededIds).toHaveLength(1);
  });

  test("最後の1件を削除すると空状態が表示される", async ({ page }) => {
    const [firstId] = await seedWatchlistFromDashboard(page, 1);
    await page.goto("/watchlist");
    await expect(page.locator("header").getByText("1件", { exact: true })).toBeVisible();

    await page
      .getByRole("button", { name: /をウォッチリストから外す/ })
      .click();

    await expect(page.locator("header").getByText("0件", { exact: true })).toBeVisible();
    await expect(page.getByText("ウォッチ中のモデルはありません")).toBeVisible();

    const storageState = await page.evaluate(
      (key) => localStorage.getItem(key),
      WATCHLIST_STORAGE_KEY,
    );
    expect(JSON.parse(storageState!)).toEqual([]);

    expect(firstId).toBeTruthy();
  });
});
