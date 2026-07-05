/** KicksDB マッパーと同じフォールバック（404 しない Unsplash） */
export const RADAR_PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop";

export function resolveRadarImageUrl(imageUrl: string | null | undefined): string {
  const trimmed = imageUrl?.trim();
  return trimmed || RADAR_PLACEHOLDER_IMAGE;
}

export function sanitizeRadarImageUrl(imageUrl: string | null | undefined): string {
  return resolveRadarImageUrl(imageUrl);
}
