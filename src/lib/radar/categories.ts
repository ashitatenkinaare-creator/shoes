/** デフォルトカテゴリ slug（マイグレーション seed と一致） */
export const DEFAULT_RADAR_CATEGORY_SLUGS = ["sneakers", "apparel", "accessories"] as const;

export type RadarCategorySlug = (typeof DEFAULT_RADAR_CATEGORY_SLUGS)[number] | string;

export const DEFAULT_SNEAKERS_CATEGORY_SLUG: RadarCategorySlug = "sneakers";

export type RadarCategory = {
  id: string;
  slug: string;
  label: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
};

export type RegisterRadarCategoryInput = {
  slug: string;
  label: string;
  description?: string;
  sortOrder?: number;
};

const SLUG_PATTERN = /^[a-z0-9-]+$/;

export function normalizeCategorySlug(slug: string): string {
  return slug.trim().toLowerCase();
}

export function isValidCategorySlug(slug: string): boolean {
  return SLUG_PATTERN.test(normalizeCategorySlug(slug));
}
