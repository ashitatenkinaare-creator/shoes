import { describe, expect, it } from "vitest";
import {
  getDashboardQualityFailure,
  meetsDashboardCatalogQuality,
} from "../../../supabase/functions/_shared/dashboard-catalog-quality";

const TODAY = new Date("2026-07-06T12:00:00+09:00");

describe("getDashboardQualityFailure priority", () => {
  it("複数不合格でも最初の失敗理由を返す", () => {
    expect(
      getDashboardQualityFailure(
        {
          source: "snkrs",
          external_id: "e2e-test",
          release_date: "2026-07-06",
          description: "fallback",
          image_url: null,
          lottery_url: null,
        },
        TODAY,
      ),
    ).toBe("e2e_fixture");
  });
});

describe("meetsDashboardCatalogQuality all-or-nothing", () => {
  const validSnkrs = {
    source: "snkrs",
    external_id: "snkrs-valid",
    release_date: "2026-07-15",
    description: "Model (SKU)。Nike SNKRS 公式掲載モデル。",
    image_url: "https://static.nike.com/a/images/x.jpg",
    lottery_url: "https://www.nike.com/jp/launch/t/example",
  };

  it("3基準すべて満たすと true", () => {
    expect(meetsDashboardCatalogQuality(validSnkrs, TODAY)).toBe(true);
  });

  it("発売日だけ不合格なら false", () => {
    expect(
      meetsDashboardCatalogQuality({ ...validSnkrs, release_date: "2026-07-01" }, TODAY),
    ).toBe(false);
  });

  it("画像だけ不合格なら false", () => {
    expect(
      meetsDashboardCatalogQuality(
        {
          ...validSnkrs,
          image_url:
            "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop",
        },
        TODAY,
      ),
    ).toBe(false);
  });

  it("ソースURLだけ不合格なら false", () => {
    expect(
      meetsDashboardCatalogQuality({ ...validSnkrs, lottery_url: "https://stockx.com/foo" }, TODAY),
    ).toBe(false);
  });
});
