import { describe, expect, it } from "vitest";
import {
  CONVERSE_JP_OFFICIAL_STORE_URL,
  isGenericBrandHubUrl,
  isSecondaryMarketUrl,
  NEW_BALANCE_JP_OFFICIAL_STORE_URL,
  normalizeBrandHubUrlForVisit,
  resolveBrandOfficialNewsUrl,
  resolveOfficialLink,
} from "@/lib/radar/sneaker-links";

describe("isSecondaryMarketUrl", () => {
  it("StockX 等の2次流通 URL を検出する", () => {
    expect(isSecondaryMarketUrl("https://stockx.com/air-jordan-1")).toBe(true);
    expect(isSecondaryMarketUrl("https://www.goat.com/sneakers/test")).toBe(true);
    expect(isSecondaryMarketUrl("https://www.nike.com/jp/launch")).toBe(false);
  });
});

describe("resolveBrandOfficialNewsUrl", () => {
  it("ブランド別の公式ページを返す", () => {
    expect(resolveBrandOfficialNewsUrl("Nike", "Dunk Low")).toBe("https://www.nike.com/jp/launch");
    expect(resolveBrandOfficialNewsUrl("New Balance", "990v6")).toBe(
      NEW_BALANCE_JP_OFFICIAL_STORE_URL,
    );
    expect(resolveBrandOfficialNewsUrl("Converse", "All Star Hi")).toBe(
      CONVERSE_JP_OFFICIAL_STORE_URL,
    );
    expect(resolveBrandOfficialNewsUrl("Converse", "One Star Pro BEAMS")).toBe(
      "https://www.beams.co.jp/",
    );
    expect(resolveBrandOfficialNewsUrl("Yeezy", "350 V2")).toBe("https://www.adidas.com/jp");
  });
});

describe("normalizeBrandHubUrlForVisit", () => {
  it("Mobify トップや国選択ページなど壊れた URL を差し替える", () => {
    expect(normalizeBrandHubUrlForVisit("https://shop.newbalance.jp")).toBe(
      NEW_BALANCE_JP_OFFICIAL_STORE_URL,
    );
    expect(normalizeBrandHubUrlForVisit("https://www.converse.com/jp")).toBe(
      CONVERSE_JP_OFFICIAL_STORE_URL,
    );
    expect(normalizeBrandHubUrlForVisit("https://www.adidas.com/jp/yeezy")).toBe(
      "https://www.adidas.com/jp",
    );
    expect(normalizeBrandHubUrlForVisit("https://www.nike.com/jp/launch/t/foo")).toBe(
      "https://www.nike.com/jp/launch/t/foo",
    );
  });
});

describe("resolveOfficialLink", () => {
  it("lottery_url があるとき抽選ページへ誘導する", () => {
    const link = resolveOfficialLink({
      newsUrl: "https://nike.com/news",
      lotteryUrl: "https://nike.com/lottery",
      brand: "Nike",
      modelName: "Air Max",
    });
    expect(link?.label).toBe("公式抽選・販売ページへ");
    expect(link?.href).toBe("https://nike.com/lottery");
  });

  it("news_url のみのとき公式発表ページへ誘導する", () => {
    const link = resolveOfficialLink({
      newsUrl: "https://nike.com/news",
      lotteryUrl: null,
      brand: "Nike",
      modelName: "Air Max",
    });
    expect(link?.label).toBe("公式発表を見る");
    expect(link?.href).toBe("https://nike.com/news");
  });

  it("StockX URL は商品 URL として使わない", () => {
    const link = resolveOfficialLink({
      newsUrl: "https://stockx.com/example",
      lotteryUrl: null,
      brand: "Jordan",
      modelName: "Air Jordan 1",
    });
    expect(link).toBeNull();
  });

  it("SNKRS トップなど汎用 URL では抽選ページではなくブランド公式サイトへ誘導する", () => {
    const link = resolveOfficialLink({
      newsUrl: "https://www.nike.com/jp/launch",
      lotteryUrl: "https://www.nike.com/jp/launch",
      brand: "Jordan",
      modelName: "Jordan 1 Retro Low OG SP Travis Scott Sail Tropical Pink",
    });
    expect(link?.label).toBe("ブランド公式サイトへ");
    expect(link?.href).toBe("https://www.nike.com/jp/launch");
  });

  it("shop.newbalance.jp トップは Demandware 入口へ差し替える", () => {
    const link = resolveOfficialLink({
      newsUrl: null,
      lotteryUrl: "https://shop.newbalance.jp",
      brand: "New Balance",
      modelName: "990v6",
    });
    expect(link?.label).toBe("ブランド公式サイトへ");
    expect(link?.href).toBe(NEW_BALANCE_JP_OFFICIAL_STORE_URL);
  });

  it("converse.com/jp は converse.co.jp へ差し替える", () => {
    const link = resolveOfficialLink({
      newsUrl: null,
      lotteryUrl: "https://www.converse.com/jp",
      brand: "Converse",
      modelName: "All Star",
    });
    expect(link?.href).toBe(CONVERSE_JP_OFFICIAL_STORE_URL);
  });

  it("モデル固有 URL のときだけ抽選ボタンを出す", () => {
    const link = resolveOfficialLink({
      newsUrl: null,
      lotteryUrl: "https://www.nike.com/jp/launch/t/travis-scott-demo",
      brand: "Jordan",
      modelName: "Jordan 1 Travis Scott",
    });
    expect(link?.label).toBe("公式抽選・販売ページへ");
    expect(link?.href).toContain("/launch/t/");
  });

  it("isGenericBrandHubUrl が SNKRS トップを検出する", () => {
    expect(isGenericBrandHubUrl("https://www.nike.com/jp/launch")).toBe(true);
    expect(isGenericBrandHubUrl("https://www.nike.com/jp/launch/t/foo")).toBe(false);
  });

  it("存在しない NB 旧ドメインは Demandware 入口へ差し替える", () => {
    expect(isGenericBrandHubUrl("https://newbalance.co.jp")).toBe(true);
    expect(isGenericBrandHubUrl("https://newbalance.co.jp/")).toBe(true);
    expect(isGenericBrandHubUrl("https://shop.newbalance.jp")).toBe(true);
    const link = resolveOfficialLink({
      newsUrl: "https://newbalance.co.jp",
      lotteryUrl: null,
      brand: "New Balance",
      modelName: "990v6 Made in USA Grey",
    });
    expect(link?.label).toBe("ブランド公式サイトへ");
    expect(link?.href).toBe(NEW_BALANCE_JP_OFFICIAL_STORE_URL);
  });

  it("allowBrandFallback=false のときブランド推定リンクを返さない", () => {
    const link = resolveOfficialLink(
      {
        newsUrl: null,
        lotteryUrl: null,
        brand: "Nike",
        modelName: "Void Runner Elite",
      },
      { allowBrandFallback: false },
    );
    expect(link).toBeNull();
  });

  it("公式 URL が無いとき null を返す", () => {
    const link = resolveOfficialLink({
      newsUrl: null,
      lotteryUrl: null,
      brand: "Unknown Brand",
      modelName: "Mystery Shoe",
    });
    expect(link).toBeNull();
  });
});
