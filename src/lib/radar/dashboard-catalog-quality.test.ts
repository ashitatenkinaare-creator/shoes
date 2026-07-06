import { describe, expect, it } from "vitest";
import { filterDashboardCatalogRows } from "@/lib/radar/catalog-dashboard-filter";
import {
  getDashboardQualityFailure,
  hasValidDashboardProductImage,
  hasValidDashboardSourceUrl,
  meetsDashboardCatalogQuality,
} from "@/lib/radar/dashboard-catalog-quality";
import { RADAR_PLACEHOLDER_IMAGE } from "@/lib/radar/placeholder-image";
import type { RadarSneakerRow } from "@/types/radar-db";

const TODAY = new Date("2026-07-06T12:00:00+09:00");

function baseRow(overrides: Partial<RadarSneakerRow>): RadarSneakerRow {
  return {
    id: "row-1",
    category_id: "cat-1",
    brand: "Jordan",
    model_name: "Air Jordan 1 High OG Love Letter",
    image_url: "https://static.nike.com/a/images/example.jpg",
    announce_date: "2026-06-28",
    release_date: "2026-07-15",
    phase: "upcoming",
    price: 20900,
    store_url: "https://www.nike.com/jp/launch",
    news_url: null,
    lottery_url: "https://www.nike.com/jp/launch/t/air-jordan-1-high-og-love-letter",
    lottery_opened_at: null,
    description:
      "Air Jordan 1 High OG Love Letter (DZ5485-201)。Nike SNKRS 公式掲載モデル。",
    colorway: "Love Letter",
    sku: "DZ5485-201",
    source: "snkrs",
    external_id: "snkrs-air-jordan-1-high-og-love-letter",
    is_rare: false,
    is_collab: false,
    created_at: "",
    updated_at: "",
    ...overrides,
  };
}

describe("hasValidDashboardSourceUrl", () => {
  it("Nike SNKRS: /launch/t/ 個別 URL を許可", () => {
    expect(
      hasValidDashboardSourceUrl({
        source: "snkrs",
        lottery_url: "https://www.nike.com/jp/launch/t/air-jordan-1-high-og-love-letter",
      }),
    ).toBe(true);
  });

  it("New Balance: ブランド公式 URL を許可", () => {
    expect(
      hasValidDashboardSourceUrl({
        source: "kicksdb",
        lottery_url: "https://shop.newbalance.jp",
      }),
    ).toBe(true);
  });

  it("Adidas: ブランド公式 URL を許可", () => {
    expect(
      hasValidDashboardSourceUrl({
        source: "kicksdb",
        lottery_url: "https://www.adidas.com/jp",
      }),
    ).toBe(true);
  });

  it("Nike KicksDB: SNKRS トップのみの URL は拒否", () => {
    expect(
      hasValidDashboardSourceUrl({
        source: "kicksdb",
        brand: "Nike",
        lottery_url: "https://www.nike.com/jp/launch",
      }),
    ).toBe(false);
  });

  it("null / 空 / StockX / SNKRS 総合ページは拒否", () => {
    expect(hasValidDashboardSourceUrl({ source: "snkrs", lottery_url: null })).toBe(false);
    expect(hasValidDashboardSourceUrl({ source: "kicksdb", lottery_url: "" })).toBe(false);
    expect(
      hasValidDashboardSourceUrl({
        source: "kicksdb",
        lottery_url: "https://stockx.com/adidas-samba",
      }),
    ).toBe(false);
    expect(
      hasValidDashboardSourceUrl({
        source: "snkrs",
        lottery_url: "https://www.nike.com/jp/launch",
      }),
    ).toBe(false);
  });
});

describe("hasValidDashboardProductImage", () => {
  it("Nike / StockX 固有画像 URL を許可", () => {
    expect(hasValidDashboardProductImage("https://static.nike.com/a/images/example.jpg")).toBe(true);
    expect(
      hasValidDashboardProductImage("https://images.stockx.com/images/NB-990.jpg"),
    ).toBe(true);
  });

  it("Unsplash プレースホルダーと空は拒否", () => {
    expect(hasValidDashboardProductImage(RADAR_PLACEHOLDER_IMAGE)).toBe(false);
    expect(hasValidDashboardProductImage(null)).toBe(false);
    expect(hasValidDashboardProductImage("")).toBe(false);
  });
});

describe("meetsDashboardCatalogQuality — 正常系（ブランド別）", () => {
  it("Nike/Jordan SNKRS: 固有画像・個別 URL・確認済み発売日", () => {
    const row = baseRow({});
    expect(meetsDashboardCatalogQuality(row, TODAY)).toBe(true);
    expect(getDashboardQualityFailure(row, TODAY)).toBeNull();
  });

  it("New Balance KicksDB: 説明文に明示発売日がなくても未来日なら掲載可", () => {
    const row = baseRow({
      source: "kicksdb",
      brand: "New Balance",
      external_id: "nb-990v6-grey",
      model_name: "990v6 Made in USA Grey",
      release_date: "2026-08-01",
      image_url: "https://images.stockx.com/images/NB-990.jpg",
      lottery_url: "https://shop.newbalance.jp",
      description: "The New Balance 990v6 Made in USA Grey features premium materials.",
    });
    expect(meetsDashboardCatalogQuality(row, TODAY)).toBe(true);
  });

  it("New Balance KicksDB: 説明文と一致する未来発売日 + 公式 URL + 固有画像", () => {
    const row = baseRow({
      source: "kicksdb",
      brand: "New Balance",
      external_id: "nb-990v6-grey",
      model_name: "990v6 Made in USA Grey",
      release_date: "2026-08-01",
      image_url: "https://images.stockx.com/images/NB-990.jpg",
      lottery_url: "https://shop.newbalance.jp",
      description: "The shoe released on August 1, 2026 and retailed for $220.",
    });
    expect(meetsDashboardCatalogQuality(row, TODAY)).toBe(true);
  });

  it("Adidas KicksDB: 説明文と一致する未来発売日 + 公式 URL + 固有画像", () => {
    const row = baseRow({
      source: "kicksdb",
      brand: "Adidas",
      external_id: "adidas-samba-future",
      model_name: "adidas Samba OG Future",
      release_date: "2026-08-10",
      image_url: "https://images.stockx.com/images/adidas-samba.jpg",
      lottery_url: "https://www.adidas.com/jp",
      description: "The shoe released on August 10, 2026 and retailed for $110.",
    });
    expect(meetsDashboardCatalogQuality(row, TODAY)).toBe(true);
  });
});

describe("meetsDashboardCatalogQuality — 異常系", () => {
  it("画像欠落・プレースホルダーは拒否", () => {
    expect(
      getDashboardQualityFailure(
        baseRow({ image_url: RADAR_PLACEHOLDER_IMAGE }),
        TODAY,
      ),
    ).toBe("placeholder_image");
    expect(
      getDashboardQualityFailure(baseRow({ image_url: null }), TODAY),
    ).toBe("placeholder_image");
  });

  it("ソース URL 欠落・二次流通は拒否", () => {
    expect(getDashboardQualityFailure(baseRow({ lottery_url: null }), TODAY)).toBe(
      "missing_source_url",
    );
    expect(
      getDashboardQualityFailure(
        baseRow({ lottery_url: "https://stockx.com/foo" }),
        TODAY,
      ),
    ).toBe("secondary_market_url");
  });

  it("SNKRS 未確認データ（カレンダー仮登録・今日の発売日）は拒否", () => {
    expect(
      getDashboardQualityFailure(
        baseRow({
          release_date: "2026-07-06",
          image_url: RADAR_PLACEHOLDER_IMAGE,
          lottery_url: "https://www.nike.com/jp/launch",
          description: "Jordan エア ジョーダン 1。Nike SNKRS 公式カレンダー掲載モデル。",
        }),
        TODAY,
      ),
    ).toBe("invalid_source_url");
  });

  it("KicksDB: 説明文の過去発売日と DB 不一致は拒否", () => {
    expect(
      meetsDashboardCatalogQuality(
        baseRow({
          source: "kicksdb",
          brand: "Adidas",
          release_date: "2026-07-06",
          lottery_url: "https://www.adidas.com/jp",
          description:
            "The shoe retailed at $110 when it was released on the 29th of January, 2025.",
        }),
        TODAY,
      ),
    ).toBe(false);
  });

  it("E2E フィクスチャは拒否", () => {
    expect(
      getDashboardQualityFailure(baseRow({ external_id: "e2e-nike-rare" }), TODAY),
    ).toBe("e2e_fixture");
  });
});

describe("filterDashboardCatalogRows 統合", () => {
  it("正常系のみ通過し異常系はすべて除外", () => {
    const rows: RadarSneakerRow[] = [
      baseRow({ id: "good-snkrs" }),
      baseRow({
        id: "bad-snkrs",
        external_id: "snkrs-bad",
        image_url: RADAR_PLACEHOLDER_IMAGE,
        lottery_url: "https://www.nike.com/jp/launch",
        description: "Jordan 1。Nike SNKRS 公式カレンダー掲載モデル。",
      }),
      baseRow({
        id: "good-nb",
        source: "kicksdb",
        brand: "New Balance",
        external_id: "nb-990",
        release_date: "2026-08-01",
        image_url: "https://images.stockx.com/images/nb.jpg",
        lottery_url: "https://shop.newbalance.jp",
        description: "The shoe released on August 1, 2026 and retailed for $220.",
      }),
      baseRow({
        id: "bad-adidas",
        source: "kicksdb",
        brand: "Adidas",
        external_id: "adidas-bad",
        release_date: "2026-07-06",
        lottery_url: "https://www.adidas.com/jp",
        description:
          "The shoe retailed at $110 when it was released on the 29th of January, 2025.",
      }),
    ];

    const filtered = filterDashboardCatalogRows(rows);
    expect(filtered.map((row) => row.id)).toEqual(["good-nb", "good-snkrs"]);

    for (const row of filtered) {
      expect(meetsDashboardCatalogQuality(row, TODAY)).toBe(true);
      expect(hasValidDashboardSourceUrl(row)).toBe(true);
      expect(hasValidDashboardProductImage(row.image_url)).toBe(true);
    }
  });
});
