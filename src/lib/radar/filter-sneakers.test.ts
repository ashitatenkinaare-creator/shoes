import { describe, expect, it } from "vitest";
import { MOCK_PREFERENCES } from "@/data/radar-mock";
import { filterSneakersByPreferences } from "@/lib/radar/filter-sneakers";
import {
  matchesAnyCollabBrand,
  matchesAnySilhouette,
  matchesSilhouette,
} from "@/lib/radar/silhouette-keywords";
import type { SneakerRadarItem } from "@/types/radar";

const SAMPLE_ITEMS: SneakerRadarItem[] = [
  {
    id: "a",
    brand: "Jordan",
    modelName: "Jordan 1 Rare",
    imageUrl: "https://example.com/a.jpg",
    announceDate: "2026-07-01",
    releaseDate: "2026-07-12",
    phase: "upcoming",
    price: 24200,
    storeUrl: "https://stockx.com/a",
    isRare: true,
    isCollab: false,
    matchedReasons: ["ブランド: Jordan", "レア"],
  },
  {
    id: "b",
    brand: "Nike",
    modelName: "Air Max Rare",
    imageUrl: "https://example.com/b.jpg",
    announceDate: "2026-07-03",
    releaseDate: "2026-07-05",
    phase: "today",
    price: 18700,
    storeUrl: "https://stockx.com/b",
    isRare: true,
    isCollab: false,
    matchedReasons: ["ブランド: Nike", "レア"],
  },
  {
    id: "c",
    brand: "Converse",
    modelName: "Chuck Taylor All Star 70 Hi",
    imageUrl: "https://example.com/c.jpg",
    announceDate: "2026-06-28",
    releaseDate: "2026-07-20",
    phase: "announced",
    price: 12000,
    storeUrl: "https://stockx.com/c",
    isRare: false,
    isCollab: false,
    matchedReasons: ["ブランド: Converse"],
  },
  {
    id: "d",
    brand: "Converse",
    modelName: "One Star Pro x BEAMS",
    imageUrl: "https://example.com/d.jpg",
    announceDate: "2026-07-04",
    releaseDate: "2026-07-18",
    phase: "announced",
    price: 15400,
    storeUrl: "https://stockx.com/d",
    isRare: false,
    isCollab: true,
    matchedReasons: ["ブランド: Converse", "コラボ"],
  },
];

describe("silhouette-keywords", () => {
  it("matches All Star and One Star patterns", () => {
    expect(matchesSilhouette("Chuck Taylor All Star 70", "Converse", "All Star")).toBe(true);
    expect(matchesSilhouette("One Star Pro", "Converse", "One Star")).toBe(true);
    expect(matchesSilhouette("Dunk Low", "Nike", "All Star")).toBe(false);
  });

  it("matches collab brand names in model title", () => {
    expect(matchesAnyCollabBrand("One Star Pro x BEAMS", "Converse", ["BEAMS"])).toBe(true);
    expect(matchesAnyCollabBrand("Chuck 70 x KITH", "Converse", ["KITH"])).toBe(true);
    expect(matchesAnyCollabBrand("Chuck Taylor All Star", "Converse", ["BEAMS"])).toBe(false);
  });
});

describe("filterSneakersByPreferences", () => {
  it("returns all items when filters are off", () => {
    expect(filterSneakersByPreferences(SAMPLE_ITEMS, MOCK_PREFERENCES)).toHaveLength(2);
  });

  it("filters rare items only", () => {
    const filtered = filterSneakersByPreferences(SAMPLE_ITEMS, {
      ...MOCK_PREFERENCES,
      brands: ["Nike", "Jordan", "Converse"],
      filterRare: true,
    });

    expect(filtered).toHaveLength(2);
    expect(filtered.every((item) => item.isRare)).toBe(true);
  });

  it("filters by silhouette", () => {
    const filtered = filterSneakersByPreferences(SAMPLE_ITEMS, {
      ...MOCK_PREFERENCES,
      brands: ["Converse"],
      silhouettes: ["One Star"],
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.modelName).toContain("One Star");
  });

  it("filters by collab brand", () => {
    const filtered = filterSneakersByPreferences(SAMPLE_ITEMS, {
      ...MOCK_PREFERENCES,
      brands: ["Converse"],
      collabBrands: ["BEAMS"],
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.modelName).toContain("BEAMS");
  });

  it("filters by brand and collab toggle together", () => {
    const collabItem = {
      ...SAMPLE_ITEMS[0],
      isCollab: true,
      brand: "Nike",
    };
    const items = [collabItem, SAMPLE_ITEMS[1]];

    const filtered = filterSneakersByPreferences(items, {
      ...MOCK_PREFERENCES,
      brands: ["Nike"],
      filterCollab: true,
    });

    expect(filtered).toEqual([collabItem]);
  });
});
