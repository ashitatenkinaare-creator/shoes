import { describe, expect, it } from "vitest";
import {
  mapSnkrsProductDetailsToCatalogPatch,
  parseSnkrsProductPageFromHtml,
  parseSnkrsSlugFromLaunchUrl,
} from "@/lib/radar/snkrs-product-page";

function buildFixtureHtml(): string {
  const initialState = {
    product: {
      threads: {
        data: {
          items: {
            t1: {
              title: "ウィメンズ トータル 90 ショックス マジア",
              coverCard: {
                title: "Black and Yellow Diamond",
                subtitle: "ウィメンズ トータル 90 ショックス マジア",
                portraitURL:
                  "https://static.nike.com/a/images/t_prod_ps/w_1536,c_limit/example.jpg",
              },
              seo: { slug: "women-s-total-90-shox-magia-black-and-yellow-diamond-1" },
            },
          },
        },
      },
      products: {
        data: {
          items: {
            p1: {
              styleColor: "IR8176-002",
              currentPrice: 22880,
              fullPrice: 22880,
              commerceStartDate: "2026-07-14T00:00:00.000Z",
            },
          },
        },
      },
    },
  };

  const nextData = {
    props: {
      pageProps: {
        initialState: JSON.stringify(initialState),
      },
    },
  };

  return `<script id="__NEXT_DATA__" type="application/json">${JSON.stringify(nextData)}</script>`;
}

const FIXTURE_HTML = buildFixtureHtml();

describe("parseSnkrsSlugFromLaunchUrl", () => {
  it("SNKRS 個別 URL から slug を抽出する", () => {
    expect(
      parseSnkrsSlugFromLaunchUrl(
        "https://www.nike.com/jp/launch/t/women-s-total-90-shox-magia-black-and-yellow-diamond-1",
      ),
    ).toBe("women-s-total-90-shox-magia-black-and-yellow-diamond-1");
  });
});

describe("parseSnkrsProductPageFromHtml", () => {
  it("SNKRS 個別ページから公式商品情報を抽出する", () => {
    const details = parseSnkrsProductPageFromHtml(
      FIXTURE_HTML,
      "women-s-total-90-shox-magia-black-and-yellow-diamond-1",
    );

    expect(details).toEqual({
      slug: "women-s-total-90-shox-magia-black-and-yellow-diamond-1",
      modelName: "ウィメンズ トータル 90 ショックス マジア",
      colorway: "Black and Yellow Diamond",
      price: 22880,
      sku: "IR8176-002",
      imageUrl: "https://static.nike.com/a/images/t_prod_ps/w_1536,c_limit/example.jpg",
      releaseDate: "2026-07-14",
      commerceStartDate: "2026-07-14T00:00:00.000Z",
      description:
        "ウィメンズ トータル 90 ショックス マジア Black and Yellow Diamond (IR8176-002)。Nike SNKRS 公式掲載モデル。",
    });
  });
});

describe("mapSnkrsProductDetailsToCatalogPatch", () => {
  it("公式商品情報をカタログ更新パッチに変換する", () => {
    const details = parseSnkrsProductPageFromHtml(
      FIXTURE_HTML,
      "women-s-total-90-shox-magia-black-and-yellow-diamond-1",
    );
    expect(details).not.toBeNull();
    if (!details) return;

    const patch = mapSnkrsProductDetailsToCatalogPatch(details, new Date("2026-07-10T00:00:00Z"));
    expect(patch.price).toBe(22880);
    expect(patch.image_url).toContain("static.nike.com");
    expect(patch.colorway).toBe("Black and Yellow Diamond");
    expect(patch.sku).toBe("IR8176-002");
    expect(patch.release_date).toBe("2026-07-14");
  });
});
