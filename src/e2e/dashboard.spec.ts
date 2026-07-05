import { test, expect } from "@playwright/test";
import { expectMatchedSneakerList } from "./helpers/radar-catalog";

test.describe("Dashboard CRUD(R)", () => {
  test("ダッシュボードにスニーカーリストが表示される", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page.getByRole("heading", { name: "条件にマッチした新作", level: 2 })).toBeVisible();

    const sneakers = await expectMatchedSneakerList(page);
    expect(await sneakers.count()).toBeGreaterThan(0);
  });
});
