import { describe, expect, it } from "vitest";
import {
  matchesAnyCollabBrand,
  matchesAnySilhouette,
  matchesSilhouette,
} from "@/lib/radar/silhouette-keywords";

describe("silhouette-keywords", () => {
  it("matches All Star and One Star model names", () => {
    expect(matchesSilhouette("Chuck Taylor All Star 70", "Converse", "All Star")).toBe(true);
    expect(matchesSilhouette("One Star Pro", "Converse", "One Star")).toBe(true);
    expect(matchesSilhouette("Dunk Low", "Nike", "All Star")).toBe(false);
  });

  it("passes all items when silhouettes is empty", () => {
    expect(matchesAnySilhouette("Dunk Low", "Nike", [])).toBe(true);
  });

  it("matches collab brand names in model title", () => {
    expect(matchesAnyCollabBrand("990v3 KITH", "New Balance", ["KITH"])).toBe(true);
    expect(matchesAnyCollabBrand("Dunk Low BEAMS", "Nike", ["BEAMS"])).toBe(true);
    expect(matchesAnyCollabBrand("Dunk Low", "Nike", ["KITH"])).toBe(false);
  });
});
