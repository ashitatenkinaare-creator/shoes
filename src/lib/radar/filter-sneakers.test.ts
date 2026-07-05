import { describe, expect, it } from "vitest";
import { MOCK_NEW_ARRIVALS, MOCK_PREFERENCES } from "@/data/radar-mock";
import { filterSneakersByPreferences } from "@/lib/radar/filter-sneakers";

describe("filterSneakersByPreferences", () => {
  it("returns all items when filters are off", () => {
    expect(filterSneakersByPreferences(MOCK_NEW_ARRIVALS, MOCK_PREFERENCES)).toHaveLength(4);
  });

  it("filters rare items only", () => {
    const filtered = filterSneakersByPreferences(MOCK_NEW_ARRIVALS, {
      ...MOCK_PREFERENCES,
      filterRare: true,
    });

    expect(filtered).toHaveLength(2);
    expect(filtered.every((item) => item.isRare)).toBe(true);
  });

  it("filters by brand and collab together", () => {
    const collabItem = {
      ...MOCK_NEW_ARRIVALS[0],
      isCollab: true,
      brand: "Nike",
    };
    const items = [collabItem, MOCK_NEW_ARRIVALS[3]];

    const filtered = filterSneakersByPreferences(items, {
      ...MOCK_PREFERENCES,
      brands: ["Nike"],
      filterCollab: true,
    });

    expect(filtered).toEqual([collabItem]);
  });
});
