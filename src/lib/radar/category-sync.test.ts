import { describe, expect, it } from "vitest";
import { RADAR_CATEGORY_SEEDS } from "@/lib/radar/category-sync";

describe("RADAR_CATEGORY_SEEDS", () => {
  it("KicksDB 同期で使う sneakers カテゴリ seed を含む", () => {
    expect(RADAR_CATEGORY_SEEDS.sneakers).toEqual({
      label: "スニーカー",
      description: "フットウェア・スニーカー新作",
      sort_order: 1,
    });
  });
});
