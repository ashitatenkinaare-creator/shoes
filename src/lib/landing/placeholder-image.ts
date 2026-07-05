/** 404 しない汎用スニーカー画像（Unsplash） */
export const LANDING_PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop";

export function resolveLandingImageUrl(imageUrl: string | null | undefined): string {
  const trimmed = imageUrl?.trim();
  return trimmed || LANDING_PLACEHOLDER_IMAGE;
}
