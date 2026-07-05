import type { RadarCategory, RegisterRadarCategoryInput } from "@/lib/radar/categories";
import { isValidCategorySlug, normalizeCategorySlug } from "@/lib/radar/categories";
import type { RadarCategoryRow } from "@/types/radar-db";

export function rowToCategory(row: RadarCategoryRow): RadarCategory {
  return {
    id: row.id,
    slug: row.slug,
    label: row.label,
    description: row.description,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

export function registerInputToRow(
  input: RegisterRadarCategoryInput,
): Pick<RadarCategoryRow, "slug" | "label" | "description" | "sort_order" | "is_active"> {
  const slug = normalizeCategorySlug(input.slug);
  if (!isValidCategorySlug(slug)) {
    throw new Error("slug は小文字英数字とハイフンのみ使用できます");
  }

  return {
    slug,
    label: input.label.trim(),
    description: input.description?.trim() ?? "",
    sort_order: input.sortOrder ?? 0,
    is_active: true,
  };
}
