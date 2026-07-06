import { describe, expect, it } from "vitest";
import {
  hasTrustworthyReleaseDate,
  parseReleaseDateFromDescription,
  resolveVerifiedReleaseDate,
} from "../../../supabase/functions/_shared/release-date";

describe("parseReleaseDateFromDescription", () => {
  it("released on Month Day, Year を解析する", () => {
    expect(
      parseReleaseDateFromDescription("The shoe released on July 15, 2026 and retailed for $200."),
    ).toBe("2026-07-15");
  });

  it("released on the 29th of January, 2025 を解析する", () => {
    expect(
      parseReleaseDateFromDescription(
        "The shoe retailed at $110 when it was released on the 29th of January, 2025.",
      ),
    ).toBe("2025-01-29");
  });

  it("released in March of 2022 を解析する", () => {
    expect(
      parseReleaseDateFromDescription(
        "The adidas Yeezy Boost 350 V2 Bone released in March of 2022 and retailed for $230.",
      ),
    ).toBe("2022-03-01");
  });
});

describe("resolveVerifiedReleaseDate", () => {
  it("API の release_date のみの場合は API を採用", () => {
    expect(
      resolveVerifiedReleaseDate({
        release_date: "2026-08-01",
        description: "Popular sneaker on StockX.",
      }),
    ).toEqual({ date: "2026-08-01", source: "api" });
  });

  it("説明文と API が食い違う場合は説明文を優先する", () => {
    expect(
      resolveVerifiedReleaseDate({
        release_date: "2026-07-06",
        description:
          "The shoe retailed at $110 when it was released on the 29th of January, 2025.",
      }),
    ).toEqual({ date: "2025-01-29", source: "description" });
  });

  it("created_at 相当のフォールバックは使わない", () => {
    expect(
      resolveVerifiedReleaseDate({
        description: "A popular sneaker on StockX.",
      }),
    ).toBeNull();
  });
});

describe("hasTrustworthyReleaseDate", () => {
  const today = new Date("2026-07-06T12:00:00Z");

  it("SNKRS 行は個別 URL・公式画像説明・今日以降の発売日が必要", () => {
    expect(
      hasTrustworthyReleaseDate(
        {
          source: "snkrs",
          release_date: "2026-07-15",
          description: "エア ジョーダン 1 HIGH OG Love Letter (DZ5485-201)。Nike SNKRS 公式掲載モデル。",
          lottery_url: "https://www.nike.com/jp/launch/t/air-jordan-1-high-og-love-letter",
          image_url: "https://static.nike.com/a/images/example.jpg",
        },
        today,
      ),
    ).toBe(true);
  });

  it("SNKRS 行でプレースホルダー画像またはカレンダー仮データは除外", () => {
    expect(
      hasTrustworthyReleaseDate(
        {
          source: "snkrs",
          release_date: "2026-07-06",
          description: "Jordan エア ジョーダン 1 HIGH OG。Nike SNKRS 公式カレンダー掲載モデル。",
          lottery_url: "https://www.nike.com/jp/launch",
          image_url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop",
        },
        today,
      ),
    ).toBe(false);
  });

  it("SNKRS 行は release_date が今日以降なら掲載可", () => {
    expect(
      hasTrustworthyReleaseDate(
        {
          source: "snkrs",
          release_date: "2026-07-15",
          description: "モデル名 (SKU)。Nike SNKRS 公式掲載モデル。",
          lottery_url: "https://www.nike.com/jp/launch/t/example",
          image_url: "https://static.nike.com/a/images/example.jpg",
        },
        today,
      ),
    ).toBe(true);
  });

  it("KicksDB: 説明文に未来発売日がある場合は DB と一致必須", () => {
    expect(
      hasTrustworthyReleaseDate(
        {
          source: "kicksdb",
          release_date: "2026-07-15",
          description: "The shoe released on July 15, 2026 and retailed for $200.",
        },
        today,
      ),
    ).toBe(true);
  });

  it("Samba のように DB 日付が説明文と食い違う場合は除外", () => {
    expect(
      hasTrustworthyReleaseDate(
        {
          source: "kicksdb",
          release_date: "2026-07-06",
          description:
            "The shoe retailed at $110 when it was released on the 29th of January, 2025.",
        },
        today,
      ),
    ).toBe(false);
  });

  it("AF1 のように originally released / restock の説明は既発売扱い", () => {
    expect(
      hasTrustworthyReleaseDate(
        {
          source: "kicksdb",
          release_date: "2026-07-06",
          description:
            "The Nike Air Force 1 Low White '07 originally released in 2007, but since it is an essential colorway to the brand, it consistently restocks.",
        },
        today,
      ),
    ).toBe(false);
  });

  it("既発売（説明文が過去日）の KicksDB 行は除外", () => {
    expect(
      hasTrustworthyReleaseDate(
        {
          source: "kicksdb",
          release_date: "2022-03-01",
          description:
            "The adidas Yeezy Boost 350 V2 Bone released in March of 2022 and retailed for $230.",
        },
        today,
      ),
    ).toBe(false);
  });

  it("KicksDB: 説明文に発売日が無くても既発売ヒントがなければ未来 release_date を許可", () => {
    expect(
      hasTrustworthyReleaseDate(
        {
          source: "kicksdb",
          release_date: "2026-08-01",
          description: "The New Balance 9060 Triple Black exemplifies the essence of the model.",
        },
        today,
      ),
    ).toBe(true);
  });

  it("KicksDB: 説明文に発売日が無くても未来 release_date なら許可", () => {
    expect(
      hasTrustworthyReleaseDate(
        {
          source: "kicksdb",
          release_date: "2026-07-15",
          description: "Popular sneaker on StockX.",
        },
        today,
      ),
    ).toBe(true);
  });
});
