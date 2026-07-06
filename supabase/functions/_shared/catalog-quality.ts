const SNKRS_OFFICIAL_DESCRIPTION_MARKER = "Nike SNKRS 公式掲載モデル";
const SNKRS_CALENDAR_FALLBACK_MARKER = "Nike SNKRS 公式カレンダー掲載モデル";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop";

export function isRadarPlaceholderImage(imageUrl: string | null | undefined): boolean {
  const trimmed = imageUrl?.trim();
  if (!trimmed) return true;
  return (
    trimmed === PLACEHOLDER_IMAGE || trimmed.includes("images.unsplash.com/photo-1549298916")
  );
}

export function isSnkrsProductLotteryUrl(lotteryUrl: string | null | undefined): boolean {
  return !!lotteryUrl?.includes("/launch/t/");
}

export function isSnkrsOfficialProductDescription(description: string | null | undefined): boolean {
  return !!description?.includes(SNKRS_OFFICIAL_DESCRIPTION_MARKER);
}

export function isSnkrsCalendarFallbackDescription(
  description: string | null | undefined,
): boolean {
  return !!description?.includes(SNKRS_CALENDAR_FALLBACK_MARKER);
}

export function parseSnkrsSlugFromLotteryUrl(lotteryUrl: string | null | undefined): string | null {
  const match = lotteryUrl?.match(/\/launch\/t\/([a-z0-9-]+)/i);
  return match?.[1]?.toLowerCase() ?? null;
}

/** 既存の良い画像・発売日をプレースホルダー / 推定値で上書きしない */
export function mergeSnkrsProductPatch<T extends Record<string, unknown>>(
  existing: { image_url?: string | null; release_date?: string | null; description?: string | null },
  patch: T,
): T {
  const merged = { ...patch };

  if (
    "image_url" in merged &&
    isRadarPlaceholderImage(String(merged.image_url ?? "")) &&
    existing.image_url &&
    !isRadarPlaceholderImage(existing.image_url)
  ) {
    delete merged.image_url;
  }

  if (
    "description" in merged &&
    isSnkrsCalendarFallbackDescription(String(merged.description ?? "")) &&
    isSnkrsOfficialProductDescription(existing.description)
  ) {
    delete merged.description;
  }

  return merged;
}
