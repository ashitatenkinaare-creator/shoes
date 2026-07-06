import { describe, expect, it } from "vitest";
import {
  buildReleaseDateFilter,
  mergeUniqueKicksDbProducts,
} from "../../../supabase/functions/_shared/sync-radar-releases";
import type { KicksDbStockxProduct } from "../../../supabase/functions/_shared/kicksdb-types";

function product(slug: string, brand = "Nike"): KicksDbStockxProduct {
  return { slug, brand, title: slug };
}

describe("mergeUniqueKicksDbProducts", () => {
  it("slug 単位で重複を除き先勝ちでマージする", () => {
    const merged = mergeUniqueKicksDbProducts(
      [product("samba-og"), product("air-max")],
      [product("air-max"), product("990v6", "New Balance")],
    );

    expect(merged.map((item) => item.slug)).toEqual(["samba-og", "air-max", "990v6"]);
  });
});

describe("buildReleaseDateFilter", () => {
  it("発売日ウィンドウと sneakers 種別を含む", () => {
    const filter = buildReleaseDateFilter(3, 30);
    expect(filter).toMatch(/release_date >= "/);
    expect(filter).toMatch(/release_date <= "/);
    expect(filter).toContain('product_type = "sneakers"');
  });
});
