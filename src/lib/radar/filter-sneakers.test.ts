import { describe, expect, it } from "vitest";
import { MOCK_PREFERENCES } from "@/data/radar-mock";
import { filterSneakersByPreferences } from "@/lib/radar/filter-sneakers";
import {
  matchesAnyCollabBrand,
  matchesAnySilhouette,
  matchesSilhouette,
} from "@/lib/radar/silhouette-keywords";
import type { SneakerRadarItem } from "@/types/radar";

const baseItem = {
  imageUrl: "https://example.com/a.jpg",
  announceDate: "2026-07-01",
  releaseDate: "2026-07-12",
  phase: "upcoming" as const,
  price: 24200,
  storeUrl: "https://stockx.com/a",
  isRare: false,
  isCollab: false,
  matchedReasons: [] as string[],
};

const SAMPLE_ITEMS: SneakerRadarItem[] = [
  {
    ...baseItem,
    id: "a",
    categorySlug: "sneakers",
    categoryLabel: "スニーカー",
    brand: "Jordan",
    modelName: "Jordan 1 Rare",
    isRare: true,
    matchedReasons: ["ブランド: Jordan", "レア"],
  },
  {
    ...baseItem,
    id: "b",
    categorySlug: "sneakers",
    categoryLabel: "スニーカー",
    brand: "Nike",
    modelName: "Air Max Rare",
    isRare: true,
    matchedReasons: ["ブランド: Nike", "レア"],
  },
  {
    ...baseItem,
    id: "c",
    categorySlug: "sneakers",
    categoryLabel: "スニーカー",
    brand: "Converse",
    modelName: "Chuck Taylor All Star 70 Hi",
    matchedReasons: ["ブランド: Converse"],
  },
  {
    ...baseItem,
    id: "d",
    categorySlug: "apparel",
    categoryLabel: "アパレル",
    brand: "Levi's",
    modelName: "501 Original Fit Jeans",
    matchedReasons: ["ブランド: Levi's"],
  },
  {
    ...baseItem,
    id: "e",
    categorySlug: "sneakers",
    categoryLabel: "スニーカー",
    brand: "Converse",
    modelName: "One Star Pro x BEAMS",
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

  it("filters by category slug", () => {
    const filtered = filterSneakersByPreferences(SAMPLE_ITEMS, {
      ...MOCK_PREFERENCES,
      brands: ["Jordan", "Nike", "Converse", "Levi's"],
      categories: ["apparel"],
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.categorySlug).toBe("apparel");
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
});
