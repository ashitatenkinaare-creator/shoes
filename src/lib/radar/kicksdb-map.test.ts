import { describe, expect, it } from "vitest";
import { detectRareCollabFlags, mapKicksDbProductToRow } from "@/lib/radar/kicksdb-sync";

describe("detectRareCollabFlags", () => {
  it("loads keyword definitions from config/rare-collab-keywords.json", async () => {
    const { rareCollabKeywordsConfig } = await import("@/lib/radar/kicksdb-sync");
    expect(rareCollabKeywordsConfig.rare.words).toContain("OG");
    expect(rareCollabKeywordsConfig.collab.words).toContain("kith");
    expect(rareCollabKeywordsConfig.collab.words).toContain("beams");
    expect(rareCollabKeywordsConfig.collab.regex).toContain("\\bx\\s+");
  });

  it("detects rare from OG / Reimagined / quoted colorway", () => {
    expect(
      detectRareCollabFlags("Air Jordan 1 Retro High OG 'Chicago Reimagined'", "Jordan"),
    ).toEqual({
      is_rare: true,
      is_collab: false,
    });
    expect(detectRareCollabFlags("Air Max 1 '86 OG Big Bubble", "Nike")).toEqual({
      is_rare: true,
      is_collab: false,
    });
  });

  it("detects collab from x notation and partner names", () => {
    expect(detectRareCollabFlags("Air Jordan 1 x Travis Scott", "Jordan")).toEqual({
      is_rare: false,
      is_collab: true,
    });
    expect(detectRareCollabFlags("Dunk Low Off-White Pine Green", "Nike")).toEqual({
      is_rare: false,
      is_collab: true,
    });
    expect(detectRareCollabFlags("New Balance 990v3 KITH", "New Balance")).toEqual({
      is_rare: false,
      is_collab: true,
    });
    expect(detectRareCollabFlags("One Star Pro BEAMS", "Converse")).toEqual({
      is_rare: false,
      is_collab: true,
    });
  });

  it("returns false for general releases", () => {
    expect(detectRareCollabFlags("Dunk Low Panda Restock", "Nike")).toEqual({
      is_rare: false,
      is_collab: false,
    });
  });
});

describe("mapKicksDbProductToRow", () => {
  it("includes is_rare and is_collab on mapped rows", () => {
    const row = mapKicksDbProductToRow({
      slug: "air-jordan-1-x-travis-scott",
      title: "Air Jordan 1 x Travis Scott",
      brand: "Jordan",
      release_date: "2026-08-01",
    });

    expect(row).not.toBeNull();
    expect(row?.is_rare).toBe(false);
    expect(row?.is_collab).toBe(true);
    expect(row?.news_url).toBeNull();
  });

  it("Adidas 行にブランド公式 lottery_url を付与する", () => {
    const row = mapKicksDbProductToRow({
      slug: "adidas-samba-og-black",
      title: "adidas Samba OG Black",
      brand: "adidas",
      release_date: "2026-08-01",
    });

    expect(row).not.toBeNull();
    expect(row?.brand).toBe("Adidas");
    expect(row?.lottery_url).toBe("https://www.adidas.com/jp");
  });

  it("既発売のカタログ商品（2022年 Yeezy 等）を新作として取り込まない", () => {
    const row = mapKicksDbProductToRow({
      slug: "adidas-yeezy-boost-350-v2-bone",
      title: "adidas Yeezy Boost 350 V2 Bone",
      brand: "adidas",
      upcoming: false,
      created_at: "2026-07-06T07:05:30Z",
      description:
        "The adidas Yeezy Boost 350 V2 Bone features a triple white Primeknit upper. " +
        "The adidas Yeezy Boost 350 V2 Bone released in March of 2022 and retailed for $230.",
    });

    expect(row).toBeNull();
  });

  it("KicksDB の created_at を発売日として使わない", () => {
    const row = mapKicksDbProductToRow({
      slug: "catalog-stale-item",
      title: "Old Catalog Item",
      brand: "Nike",
      upcoming: false,
      created_at: "2026-07-06T07:05:30Z",
    });

    expect(row).toBeNull();
  });

  it("Samba のように既発売（2025年）の説明文は同期しない", () => {
    const row = mapKicksDbProductToRow({
      slug: "adidas-samba-og-preloved-red-leopard-womens",
      title: "adidas Samba OG Preloved Red Leopard (Women's)",
      brand: "adidas",
      release_date: "2026-07-06",
      created_at: "2026-07-06T07:05:30Z",
      description:
        "The shoe retailed at $110 when it was released on the 29th of January, 2025.",
    });

    expect(row).toBeNull();
  });
});
