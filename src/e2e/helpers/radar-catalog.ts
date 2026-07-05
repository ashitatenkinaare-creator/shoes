import { expect, type Locator, type Page } from "@playwright/test";

function newArrivalsSection(page: Page): Locator {
  return page.getByRole("region", { name: "条件にマッチした新作" });
}

/** 「条件に合う新作はまだありません」を除いたスニーカーカード行 */
export function matchedSneakerItems(section: Locator): Locator {
  return section.locator('ul > li:has(a[href^="/sneaker/"])');
}

export async function expectMatchedSneakerList(page: Page, minCount = 1): Promise<Locator> {
  const section = newArrivalsSection(page);
  await expect(section).toBeVisible();

  const sneakers = matchedSneakerItems(section);
  await expect(sneakers.first()).toBeVisible({ timeout: 15000 });
  expect(await sneakers.count()).toBeGreaterThanOrEqual(minCount);
  return sneakers;
}
