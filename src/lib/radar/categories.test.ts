import { describe, expect, it } from "vitest";
import {
  DEFAULT_RADAR_CATEGORY_SLUGS,
  isValidCategorySlug,
  normalizeCategorySlug,
} from "@/lib/radar/categories";
import { registerInputToRow } from "@/lib/radar/map-radar-category";

describe("radar categories", () => {
  it("defines default category slugs", () => {
    expect(DEFAULT_RADAR_CATEGORY_SLUGS).toEqual(["sneakers", "apparel", "accessories"]);
  });

  it("validates slug format", () => {
    expect(isValidCategorySlug("sneakers")).toBe(true);
    expect(isValidCategorySlug("street-wear")).toBe(true);
    expect(isValidCategorySlug("Bad Slug")).toBe(false);
  });

  it("normalizes slug to lowercase", () => {
    expect(normalizeCategorySlug(" Apparel ")).toBe("apparel");
  });

  it("maps register input to row shape", () => {
    expect(
      registerInputToRow({ slug: "limited-edition", label: "限定", description: "test" }),
    ).toEqual({
      slug: "limited-edition",
      label: "限定",
      description: "test",
      sort_order: 0,
      is_active: true,
    });
  });
});
