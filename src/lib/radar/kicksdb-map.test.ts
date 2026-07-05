import { describe, expect, it } from "vitest";
import { detectRareCollabFlags, mapKicksDbProductToRow } from "@/lib/radar/kicksdb-sync";

describe("detectRareCollabFlags", () => {
  it("detects rare from OG / Reimagined / quoted colorway", () => {
    expect(detectRareCollabFlags("Air Jordan 1 Retro High OG 'Chicago Reimagined'", "Jordan")).toEqual({
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
  });
});
