import { describe, expect, it, vi, beforeEach } from "vitest";
import type { RadarSneakerRow } from "@/types/radar-db";

const mockSelect = vi.fn();
const mockFrom = vi.fn(() => ({ select: mockSelect }));
const mockCreateServerSupabase = vi.fn(async () => ({ from: mockFrom }));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: () => mockCreateServerSupabase(),
}));

import { fetchUpcomingSneakers } from "@/lib/radar/catalog-db.server";
import { meetsDashboardCatalogQuality } from "@/lib/radar/dashboard-catalog-quality";
import { RADAR_PLACEHOLDER_IMAGE } from "@/lib/radar/placeholder-image";

function buildQueryChain(rows: RadarSneakerRow[]) {
  const chain = {
    gte: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    then: undefined as unknown,
  };
  chain.order.mockReturnValue({
    ...chain,
    then(onFulfilled: (value: { data: RadarSneakerRow[]; error: null }) => unknown) {
      return Promise.resolve(onFulfilled({ data: rows, error: null }));
    },
  });
  return chain;
}

const SNKRS_GOOD: RadarSneakerRow = {
  id: "snkrs-good",
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
};

const SNKRS_BAD: RadarSneakerRow = {
  ...SNKRS_GOOD,
  id: "snkrs-bad",
  external_id: "snkrs-bad-row",
  release_date: "2026-07-06",
  image_url: RADAR_PLACEHOLDER_IMAGE,
  lottery_url: "https://www.nike.com/jp/launch",
  description: "Jordan 1。Nike SNKRS 公式カレンダー掲載モデル。",
};

describe("fetchUpcomingSneakers dashboard mode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("DB クエリ結果に品質フィルターを適用し、不合格行を除外する", async () => {
    mockSelect.mockReturnValue(buildQueryChain([SNKRS_GOOD, SNKRS_BAD]));

    const result = await fetchUpcomingSneakers(20, undefined, { mode: "dashboard" });

    expect(result.error).toBeNull();
    expect(result.data).toHaveLength(1);
    expect(result.data?.[0]?.id).toBe("snkrs-good");
    expect(result.data?.[0]?.lotteryUrl).toContain("/launch/t/");
    expect(result.data?.[0]?.imageUrl).toContain("static.nike.com");
  });

  it("返却アイテムはすべて品質基準を満たす", async () => {
    const nbGood: RadarSneakerRow = {
      ...SNKRS_GOOD,
      id: "nb-good",
      source: "kicksdb",
      brand: "New Balance",
      external_id: "nb-990",
      release_date: "2026-08-01",
      image_url: "https://images.stockx.com/images/nb.jpg",
      lottery_url: "https://shop.newbalance.jp",
      description: "The shoe released on August 1, 2026 and retailed for $220.",
    };

    mockSelect.mockReturnValue(buildQueryChain([SNKRS_GOOD, nbGood, SNKRS_BAD]));

    const result = await fetchUpcomingSneakers(20, undefined, { mode: "dashboard" });

    expect(result.data).toHaveLength(2);
    for (const item of result.data ?? []) {
      expect(item.lotteryUrl).toBeTruthy();
      expect(item.imageUrl).not.toContain("images.unsplash.com/photo-1549298916");
    }
  });
});

describe("meetsDashboardCatalogQuality contract", () => {
  it("fetchUpcomingSneakers の dashboard 返却値は品質ゲートと整合", async () => {
    mockSelect.mockReturnValue(buildQueryChain([SNKRS_GOOD]));

    const result = await fetchUpcomingSneakers(20, undefined, { mode: "dashboard" });
    const item = result.data?.[0];
    expect(item).toBeDefined();

    expect(
      meetsDashboardCatalogQuality(
        {
          source: "snkrs",
          external_id: SNKRS_GOOD.external_id,
          release_date: item!.releaseDate,
          description: SNKRS_GOOD.description,
          image_url: item!.imageUrl,
          lottery_url: item!.lotteryUrl,
        },
        new Date("2026-07-06T12:00:00+09:00"),
      ),
    ).toBe(true);
  });
});
