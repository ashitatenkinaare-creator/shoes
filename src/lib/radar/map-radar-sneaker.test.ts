import { describe, expect, it } from "vitest";
import { meetsDashboardCatalogQuality } from "@/lib/radar/dashboard-catalog-quality";
import { RADAR_PLACEHOLDER_IMAGE } from "@/lib/radar/placeholder-image";
import { rowToSneakerItem } from "@/lib/radar/map-radar-sneaker";
import type { RadarSneakerRow } from "@/types/radar-db";

const TODAY = new Date("2026-07-06T12:00:00+09:00");

function qualitySnkrsRow(overrides: Partial<RadarSneakerRow> = {}): RadarSneakerRow {
  return {
    id: "snkrs-1",
    category_id: "c1",
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

describe("rowToSneakerItem dashboard quality contract", () => {
  it("品質ゲート通過行は固有 image_url と lottery_url を UI へそのまま渡す", () => {
    const row = qualitySnkrsRow();
    expect(meetsDashboardCatalogQuality(row, TODAY)).toBe(true);

    const item = rowToSneakerItem(row);

    expect(item.imageUrl).toBe("https://static.nike.com/a/images/example.jpg");
    expect(item.imageUrl).not.toContain("unsplash.com");
    expect(item.lotteryUrl).toBe("https://www.nike.com/jp/launch/t/air-jordan-1-high-og-love-letter");
    expect(item.releaseDate).toBe("2026-07-15");
  });

  it("KicksDB 正常行も固有画像とブランド公式 lottery_url を保持", () => {
    const row = qualitySnkrsRow({
      source: "kicksdb",
      brand: "Adidas",
      external_id: "adidas-future",
      model_name: "adidas Samba OG Future",
      release_date: "2026-08-10",
      image_url: "https://images.stockx.com/images/adidas-samba.jpg",
      lottery_url: "https://www.adidas.com/jp",
      description: "The shoe released on August 10, 2026 and retailed for $110.",
    });

    expect(meetsDashboardCatalogQuality(row, TODAY)).toBe(true);

    const item = rowToSneakerItem(row);
    expect(item.imageUrl).toContain("images.stockx.com");
    expect(item.lotteryUrl).toBe("https://www.adidas.com/jp");
  });

  it("品質不合格行は meetsDashboardCatalogQuality が false（ダッシュボード経路では到達しない）", () => {
    const row = qualitySnkrsRow({
      image_url: RADAR_PLACEHOLDER_IMAGE,
      lottery_url: "https://www.nike.com/jp/launch",
      description: "Jordan 1。Nike SNKRS 公式カレンダー掲載モデル。",
    });

    expect(meetsDashboardCatalogQuality(row, TODAY)).toBe(false);
  });
});
