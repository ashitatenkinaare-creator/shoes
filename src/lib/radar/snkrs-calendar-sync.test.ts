import { describe, expect, it } from "vitest";
import {
  matchSnkrsEntryToSneaker,
  parseSnkrsLaunchEntriesFromHtml,
  type SnkrsLaunchEntry,
} from "@/lib/radar/snkrs-calendar-sync";
import { mapSnkrsEntryToCatalogRow, mapSnkrsLotteryPatch } from "@/lib/radar/snkrs-catalog-map";
import { meetsDashboardCatalogQuality } from "@/lib/radar/dashboard-catalog-quality";
import { mergeSnkrsProductPatch } from "@/lib/radar/placeholder-image";
import { RADAR_PLACEHOLDER_IMAGE } from "@/lib/radar/placeholder-image";

const FIXTURE_HTML = `
<script id="__NEXT_DATA__" type="application/json">{"props":{"pageProps":{"initialState":"{\\"product\\":{\\"threads\\":{\\"data\\":{\\"items\\":{\\"a\\":{\\"title\\":\\"エア ジョーダン 1\\",\\"coverCard\\":{\\"subtitle\\":\\"Air Jordan 1 High OG\\"},\\"seo\\":{\\"slug\\":\\"air-jordan-1-high-og-love-letter\\",\\"title\\":\\"Air Jordan 1 High OG Love Letter\\"}},\\"b\\":{\\"title\\":\\"Jordan 1 Retro Low OG SP\\",\\"coverCard\\":{\\"subtitle\\":\\"Travis Scott Sail Tropical Pink\\"},\\"seo\\":{\\"slug\\":\\"air-jordan-1-retro-low-og-sp-travis-scott-sail-tropical-pink\\",\\"title\\":\\"Travis Scott x Air Jordan 1\\"}}}}}}}"}}}</script>
<a href="/jp/launch/t/zoom-streak-3-black-and-white">Zoom</a>
`;

const ENTRIES: SnkrsLaunchEntry[] = [
  {
    slug: "air-jordan-1-high-og-love-letter",
    title: "エア ジョーダン 1",
    subtitle: "Air Jordan 1 High OG",
    seoTitle: "Air Jordan 1 High OG Love Letter",
    url: "https://www.nike.com/jp/launch/t/air-jordan-1-high-og-love-letter",
  },
  {
    slug: "air-jordan-1-retro-low-og-sp-travis-scott-sail-tropical-pink",
    title: "Jordan 1 Retro Low OG SP",
    subtitle: "Travis Scott Sail Tropical Pink",
    seoTitle: "Travis Scott x Air Jordan 1",
    url: "https://www.nike.com/jp/launch/t/air-jordan-1-retro-low-og-sp-travis-scott-sail-tropical-pink",
  },
  {
    slug: "womens-first-sight-mirage-sail-and-white",
    title: "ウィメンズ ファースト サイト ミラージュ",
    subtitle: "Sail and White",
    seoTitle:
      "【NIKE公式】レディース ファースト サイト ミラージュ 'Sail and White' (HQ2412-101) 発売日",
    url: "https://www.nike.com/jp/launch/t/womens-first-sight-mirage-sail-and-white",
  },
  {
    slug: "zoom-streak-3-black-and-white",
    title: "zoom streak 3 black and white",
    subtitle: null,
    seoTitle: null,
    url: "https://www.nike.com/jp/launch/t/zoom-streak-3-black-and-white",
  },
];

describe("parseSnkrsLaunchEntriesFromHtml", () => {
  it("__NEXT_DATA__ とパス走査から SNKRS エントリを抽出する", () => {
    const entries = parseSnkrsLaunchEntriesFromHtml(FIXTURE_HTML);
    expect(entries.length).toBeGreaterThanOrEqual(3);
    expect(entries.some((entry) => entry.slug === "air-jordan-1-high-og-love-letter")).toBe(true);
    expect(entries.some((entry) => entry.slug.includes("travis-scott"))).toBe(true);
    expect(entries.some((entry) => entry.slug === "zoom-streak-3-black-and-white")).toBe(true);
  });
});

describe("matchSnkrsEntryToSneaker", () => {
  it("Jordan 1 のモデル名から SNKRS 個別 URL を解決する", () => {
    const match = matchSnkrsEntryToSneaker("Air Jordan 1 High OG Love Letter", "Jordan", ENTRIES);
    expect(match?.slug).toBe("air-jordan-1-high-og-love-letter");
    expect(match?.url).toContain("/launch/t/air-jordan-1-high-og-love-letter");
  });

  it("Travis Scott コラボ名の部分一致で解決する", () => {
    const match = matchSnkrsEntryToSneaker(
      "Jordan 1 Retro Low OG SP Travis Scott Sail Tropical Pink",
      "Jordan",
      ENTRIES,
    );
    expect(match?.slug).toContain("travis-scott");
  });

  it("カラーウェイ語だけの一致では Travis Scott を誤マッチしない", () => {
    const match = matchSnkrsEntryToSneaker(
      "Jordan 1 Retro Low OG SP Travis Scott Sail Tropical Pink",
      "Jordan",
      [
        {
          slug: "womens-first-sight-mirage-sail-and-white",
          title: "ウィメンズ ファースト サイト ミラージュ",
          subtitle: "Sail and White",
          seoTitle:
            "【NIKE公式】レディース ファースト サイト ミラージュ 'Sail and White' (HQ2412-101) 発売日",
          url: "https://www.nike.com/jp/launch/t/womens-first-sight-mirage-sail-and-white",
        },
      ],
    );
    expect(match).toBeNull();
  });

  it("SNKRS に未掲載の Travis Scott は URL を付与しない", () => {
    const match = matchSnkrsEntryToSneaker(
      "Jordan 1 Retro Low OG SP Travis Scott Sail Tropical Pink",
      "Jordan",
      ENTRIES.filter((entry) => !entry.slug.includes("travis-scott")),
    );
    expect(match).toBeNull();
  });

  it("Nike 以外のブランドはマッチしない", () => {
    const match = matchSnkrsEntryToSneaker("Zoom Streak 3", "Adidas", ENTRIES);
    expect(match).toBeNull();
  });

  it("カレンダーに無いモデルは null", () => {
    const match = matchSnkrsEntryToSneaker("Air Mag Back to the Future", "Nike", ENTRIES);
    expect(match).toBeNull();
  });
});

describe("SNKRS 同期 — データ品質（発売日・画像・ソースURL）", () => {
  const entry = ENTRIES[0]!;

  it("lottery パッチは必ず SNKRS 個別 URL を付与する", () => {
    const patch = mapSnkrsLotteryPatch(entry, "2026-07-06T09:00:00.000Z");
    expect(patch.lottery_url).toContain("/launch/t/air-jordan-1-high-og-love-letter");
    expect(patch.lottery_url).not.toBe("https://www.nike.com/jp/launch");
  });

  it("公式詳細なしのカタログ行は null（推定発売日・プレースホルダー画像で登録しない）", () => {
    expect(mapSnkrsEntryToCatalogRow(entry, new Date("2026-07-06T12:00:00Z"))).toBeNull();
  });

  it("公式詳細ありのカタログ行は3基準を満たす", () => {
    const row = mapSnkrsEntryToCatalogRow(entry, new Date("2026-07-06T12:00:00Z"), undefined, {
      slug: entry.slug,
      modelName: "エア ジョーダン 1 HIGH OG",
      colorway: "Love Letter",
      price: 20900,
      sku: "DZ5485-201",
      imageUrl: "https://static.nike.com/a/images/example.jpg",
      releaseDate: "2026-07-15",
      commerceStartDate: "2026-07-15T00:00:00+09:00",
      description:
        "エア ジョーダン 1 HIGH OG Love Letter (DZ5485-201)。Nike SNKRS 公式掲載モデル。",
    });

    expect(row).not.toBeNull();
    expect(meetsDashboardCatalogQuality(row!, new Date("2026-07-06T12:00:00+09:00"))).toBe(true);
    expect(row!.image_url).not.toContain("unsplash.com");
    expect(row!.lottery_url).toContain("/launch/t/");
    expect(row!.release_date).toBe("2026-07-15");
  });

  it("mergeSnkrsProductPatch は既存の公式画像をプレースホルダーで上書きしない", () => {
    const merged = mergeSnkrsProductPatch(
      {
        image_url: "https://static.nike.com/a/images/existing.jpg",
        release_date: "2026-07-15",
        description: "Love Letter (DZ5485-201)。Nike SNKRS 公式掲載モデル。",
      },
      {
        image_url: RADAR_PLACEHOLDER_IMAGE,
        release_date: "2026-07-06",
        description: "Jordan 1。Nike SNKRS 公式カレンダー掲載モデル。",
      },
    );

    expect(merged.image_url).toBeUndefined();
    expect(merged.release_date).toBe("2026-07-06");
  });
});
