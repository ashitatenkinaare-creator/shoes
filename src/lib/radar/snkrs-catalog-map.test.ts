import { describe, expect, it } from "vitest";
import {
  mapSnkrsEntryToCatalogRow,
  mapSnkrsLotteryPatch,
  snkrsCatalogExternalId,
} from "@/lib/radar/snkrs-catalog-map";
import type { SnkrsLaunchEntry } from "@/lib/radar/snkrs-calendar-sync";

const entry: SnkrsLaunchEntry = {
  slug: "air-jordan-1-high-og-love-letter",
  title: "エア ジョーダン 1",
  subtitle: "Air Jordan 1 High OG Love Letter",
  seoTitle: "Air Jordan 1 High OG Love Letter",
  url: "https://www.nike.com/jp/launch/t/air-jordan-1-high-og-love-letter",
};

describe("mapSnkrsLotteryPatch", () => {
  it("lottery_url と lottery_opened_at のみを返す", () => {
    const patch = mapSnkrsLotteryPatch(entry, "2026-07-06T09:00:00.000Z");
    expect(patch).toEqual({
      lottery_url: entry.url,
      lottery_opened_at: "2026-07-06T09:00:00.000Z",
    });
  });
});

describe("mapSnkrsEntryToCatalogRow", () => {
  const details = {
    slug: entry.slug,
    modelName: "エア ジョーダン 1 HIGH OG",
    colorway: "Love Letter",
    price: 20900,
    sku: "DZ5485-201",
    imageUrl: "https://static.nike.com/a/images/example.jpg",
    releaseDate: "2026-07-15",
    commerceStartDate: "2026-07-15T00:00:00+09:00",
    description: "エア ジョーダン 1 HIGH OG Love Letter (DZ5485-201)。Nike SNKRS 公式掲載モデル。",
  };

  it("公式詳細が無い場合は null（推定値で登録しない）", () => {
    expect(mapSnkrsEntryToCatalogRow(entry, new Date("2026-07-06T12:00:00Z"))).toBeNull();
  });

  it("SNKRS 公式詳細がある場合のみ source=snkrs のカタログ行に変換する", () => {
    const row = mapSnkrsEntryToCatalogRow(entry, new Date("2026-07-06T12:00:00Z"), undefined, details);
    expect(row).not.toBeNull();
    expect(row?.source).toBe("snkrs");
    expect(row?.external_id).toBe(snkrsCatalogExternalId(entry.slug));
    expect(row?.brand).toBe("Jordan");
    expect(row?.lottery_url).toBe(entry.url);
    expect(row?.release_date).toBe("2026-07-15");
    expect(row?.image_url).toContain("static.nike.com");
  });

  it("SNKRS 公式詳細の値をそのまま使う", () => {
    const row = mapSnkrsEntryToCatalogRow(entry, new Date("2026-07-06T12:00:00Z"), undefined, details);

    expect(row?.price).toBe(20900);
    expect(row?.colorway).toBe("Love Letter");
    expect(row?.description).toContain("公式掲載モデル");
  });
});
