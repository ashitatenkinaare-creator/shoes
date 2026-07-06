import { describe, expect, it } from "vitest";
import { getProductBySlug, UPCOMING_DROPS } from "@/data/drops";

describe("getProductBySlug", () => {
  it("発売予定カードの slug ですべて詳細ページを解決する", () => {
    for (const item of UPCOMING_DROPS) {
      expect(item.slug).toBeTruthy();
      const product = getProductBySlug(item.slug!);
      expect(product, `missing product for ${item.slug}`).toBeDefined();
      expect(product?.title).toBe(item.name);
    }
  });

  it("カタログ slug も解決する", () => {
    expect(getProductBySlug("jordan-1-retro-high-og")?.title).toBe("JORDAN 1 RETRO HIGH OG");
  });

  it("存在しない slug は undefined", () => {
    expect(getProductBySlug("does-not-exist")).toBeUndefined();
  });
});
