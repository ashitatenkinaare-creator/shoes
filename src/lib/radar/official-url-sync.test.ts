import { describe, expect, it } from "vitest";
import { matchOfficialUrlsFromSources, pickRegistryLotteryUrl } from "@/lib/radar/official-url-sync";

const SOURCES = [
  {
    slug: "nike-snkrs",
    label: "Nike SNKRS",
    brand_pattern: "^(nike|jordan)$",
    model_pattern: ".*",
    news_url: "https://www.nike.com/jp/launch",
    lottery_url: "https://www.nike.com/jp/launch",
    priority: 10,
    is_active: true,
  },
  {
    slug: "beams-collab",
    label: "BEAMS コラボ",
    brand_pattern: ".*",
    model_pattern: "beams",
    news_url: "https://www.beams.co.jp/",
    lottery_url: "https://www.beams.co.jp/",
    priority: 20,
    is_active: true,
  },
  {
    slug: "travis-scott",
    label: "Travis Scott x Nike",
    brand_pattern: ".*",
    model_pattern: "travis scott",
    news_url: "https://www.nike.com/jp/launch",
    lottery_url: "https://www.nike.com/jp/launch",
    priority: 25,
    is_active: true,
  },
];

describe("matchOfficialUrlsFromSources", () => {
  it("ブランドパターンで Nike を解決する", () => {
    const match = matchOfficialUrlsFromSources("Nike", "Air Max 1", SOURCES);
    expect(match.source_slug).toBe("nike-snkrs");
    expect(match.news_url).toBe("https://www.nike.com/jp/launch");
  });

  it("高優先度の Travis Scott コラボを解決する", () => {
    const match = matchOfficialUrlsFromSources("Nike", "Air Jordan 1 Travis Scott", SOURCES);
    expect(match.source_slug).toBe("travis-scott");
  });

  it("BEAMS コラボをモデル名から解決する", () => {
    const match = matchOfficialUrlsFromSources("Converse", "One Star Pro BEAMS", SOURCES);
    expect(match.source_slug).toBe("beams-collab");
    expect(match.news_url).toBe("https://www.beams.co.jp/");
  });

  it("マッチしない場合は null を返す", () => {
    const match = matchOfficialUrlsFromSources("Unknown Brand", "Mystery Model", SOURCES);
    expect(match.source_slug).toBeNull();
  });
});

describe("pickRegistryLotteryUrl", () => {
  it("個別 URL を最優先する", () => {
    expect(
      pickRegistryLotteryUrl(
        "https://www.nike.com/jp/launch/t/foo",
        "https://www.adidas.com/jp",
      ),
    ).toBe("https://www.nike.com/jp/launch/t/foo");
  });

  it("Adidas 等のブランド総合ページ URL も lottery_url に保存する", () => {
    expect(pickRegistryLotteryUrl(null, "https://www.adidas.com/jp")).toBe(
      "https://www.adidas.com/jp",
    );
    expect(pickRegistryLotteryUrl(null, "https://shop.newbalance.jp")).toBe(
      "https://shop.newbalance.jp",
    );
  });
});
