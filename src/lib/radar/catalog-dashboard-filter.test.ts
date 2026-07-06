import { describe, expect, it } from "vitest";
import {
  filterDashboardCatalogRows,
  hasDashboardLotteryUrl,
  hasSnkrsProductLotteryUrl,
  isE2eExternalId,
} from "@/lib/radar/catalog-dashboard-filter";
import { rowToSneakerItem } from "@/lib/radar/map-radar-sneaker";
import { RADAR_PLACEHOLDER_IMAGE } from "@/lib/radar/placeholder-image";
import type { RadarSneakerRow } from "@/types/radar-db";

const baseRow = {
  id: "1",
  category_id: "c",
  brand: "Jordan",
  model_name: "Air Jordan 1 High OG Love Letter",
  image_url: "https://static.nike.com/a/images/example.jpg",
  announce_date: "2026-07-01",
  release_date: "2026-07-15",
  phase: "upcoming" as const,
  price: 20000,
  store_url: "https://www.nike.com/jp/launch",
  news_url: null,
  lottery_url: "https://www.nike.com/jp/launch/t/air-jordan-1-high-og-love-letter",
  lottery_opened_at: null,
  description:
    "Air Jordan 1 High OG Love Letter (DZ5485-201)。Nike SNKRS 公式掲載モデル。",
  colorway: "",
  sku: "",
  source: "snkrs",
  external_id: "snkrs-air-jordan-1-high-og-love-letter",
  is_rare: false,
  is_collab: false,
  created_at: "",
  updated_at: "",
};

describe("isE2eExternalId", () => {
  it("e2e- プレフィックスを検出する", () => {
    expect(isE2eExternalId("e2e-nike-rare")).toBe(true);
    expect(isE2eExternalId("air-jordan-1")).toBe(false);
  });
});

describe("hasSnkrsProductLotteryUrl", () => {
  it("SNKRS 個別 URL のみ true", () => {
    expect(hasSnkrsProductLotteryUrl("https://www.nike.com/jp/launch/t/foo")).toBe(true);
    expect(hasSnkrsProductLotteryUrl("https://www.nike.com/jp/launch")).toBe(false);
    expect(hasSnkrsProductLotteryUrl(null)).toBe(false);
  });
});

describe("hasDashboardLotteryUrl", () => {
  it("ブランド総合ページ URL も true", () => {
    expect(hasDashboardLotteryUrl("https://shop.newbalance.jp")).toBe(true);
    expect(hasDashboardLotteryUrl("https://www.converse.com/jp")).toBe(true);
    expect(hasDashboardLotteryUrl(null)).toBe(false);
  });
});

describe("filterDashboardCatalogRows", () => {
  it("プレースホルダー画像と未確認 SNKRS 行を除外する", () => {
    const rows: RadarSneakerRow[] = [
      baseRow,
      {
        ...baseRow,
        id: "snkrs-bad",
        source: "snkrs",
        external_id: "snkrs-air-jordan-1-high-og-love-letter",
        release_date: "2026-07-06",
        image_url: RADAR_PLACEHOLDER_IMAGE,
        lottery_url: "https://www.nike.com/jp/launch",
        description: "Jordan エア ジョーダン 1 HIGH OG。Nike SNKRS 公式カレンダー掲載モデル。",
      },
    ];

    const filtered = filterDashboardCatalogRows(rows);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.external_id).toBe("snkrs-air-jordan-1-high-og-love-letter");
  });

  it("E2E と lottery_url 未設定を除外する", () => {
    const rows: RadarSneakerRow[] = [
      baseRow,
      { ...baseRow, id: "2", external_id: "e2e-nb-standard", model_name: "990v6 Fake" },
      {
        ...baseRow,
        id: "3",
        external_id: "unmatched-kicksdb",
        source: "kicksdb",
        lottery_url: null,
        model_name: "Mystery Dunk",
        description: "The shoe released on July 15, 2026 and retailed for $200.",
      },
    ];

    const filtered = filterDashboardCatalogRows(rows);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.external_id).toBe("snkrs-air-jordan-1-high-og-love-letter");
  });

  it("他ブランドのブランド公式 URL 付き商品を含める", () => {
    const rows: RadarSneakerRow[] = [
      baseRow,
      {
        ...baseRow,
        id: "nb-1",
        source: "kicksdb",
        brand: "New Balance",
        external_id: "nb-990v6-grey",
        model_name: "990v6 Made in USA Grey",
        release_date: "2026-08-01",
        description: "The shoe released on August 1, 2026 and retailed for $220.",
        lottery_url: "https://shop.newbalance.jp",
      },
      {
        ...baseRow,
        id: "nb-2",
        source: "kicksdb",
        brand: "New Balance",
        external_id: "nb-2002r",
        model_name: "2002R Protection Pack",
        release_date: "2026-08-15",
        description: "The shoe released on August 15, 2026 and retailed for $180.",
        lottery_url: "https://shop.newbalance.jp",
      },
    ];

    const filtered = filterDashboardCatalogRows(rows);
    expect(filtered).toHaveLength(3);
  });

  it("同一 SNKRS lottery_url では KicksDB 行を SNKRS 行より優先する", () => {
    const lotteryUrl = "https://www.nike.com/jp/launch/t/air-jordan-1-high-og-love-letter";
    const kicksdbDescription = "The shoe released on July 15, 2026 and retailed for $200.";
    const rows: RadarSneakerRow[] = [
      {
        ...baseRow,
        id: "snkrs-1",
        source: "snkrs",
        external_id: "snkrs-air-jordan-1-high-og-love-letter",
        image_url: RADAR_PLACEHOLDER_IMAGE,
        description: "Jordan エア ジョーダン 1 HIGH OG。Nike SNKRS 公式カレンダー掲載モデル。",
        price: 20000,
        colorway: "エア ジョーダン 1",
        lottery_url: lotteryUrl,
      },
      {
        ...baseRow,
        id: "kicksdb-1",
        source: "kicksdb",
        description: kicksdbDescription,
        image_url: "https://images.stockx.com/jordan-1.jpg",
        price: 17050,
        colorway: "Love Letter",
        lottery_url: lotteryUrl,
      },
    ];

    const filtered = filterDashboardCatalogRows(rows);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.source).toBe("kicksdb");
    expect(filtered[0]?.image_url).toBe("https://images.stockx.com/jordan-1.jpg");
    expect(filtered[0]?.price).toBe(17050);
    expect(filtered[0]?.colorway).toBe("Love Letter");
  });

  it("発売日が説明文と一致しない KicksDB 商品を除外する", () => {
    const rows: RadarSneakerRow[] = [
      {
        ...baseRow,
        id: "samba-bad",
        brand: "Adidas",
        external_id: "adidas-samba-og-preloved-red-leopard-womens",
        model_name: "adidas Samba OG Preloved Red Leopard (Women's)",
        release_date: "2026-07-06",
        description:
          "The shoe retailed at $110 when it was released on the 29th of January, 2025.",
        lottery_url: "https://www.adidas.com/jp",
      },
    ];

    expect(filterDashboardCatalogRows(rows)).toHaveLength(0);
  });
});

describe("rowToSneakerItem official badges", () => {
  it("Nike SNKRS 個別 URL には SNKRS公式掲載バッジ", () => {
    const item = rowToSneakerItem(baseRow as RadarSneakerRow);
    expect(item.matchedReasons).toContain("SNKRS公式掲載");
  });

  it("他ブランドの公式 URL には公式情報ありバッジ", () => {
    const item = rowToSneakerItem({
      ...baseRow,
      brand: "New Balance",
      lottery_url: "https://shop.newbalance.jp",
    } as RadarSneakerRow);
    expect(item.matchedReasons).toContain("公式情報あり");
    expect(item.matchedReasons).not.toContain("SNKRS公式掲載");
  });
});
