import { test, expect } from "@playwright/test";

test.describe("Dashboard CRUD(R)", () => {
  test("ダッシュボードにスニーカーリストが表示される", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page.getByRole("heading", { name: "条件にマッチした新作", level: 2 })).toBeVisible();

    const section = page.locator("section").filter({
      has: page.getByRole("heading", { name: "条件にマッチした新作" }),
    });
    await expect(section.getByText(/^\d+件$/)).toBeVisible();

    const sneakers = section.locator(":scope > ul > li");
    await expect(sneakers.first()).toBeVisible();
    expect(await sneakers.count()).toBeGreaterThan(0);
  });
});
