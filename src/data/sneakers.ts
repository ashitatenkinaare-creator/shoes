import type { Brand } from "../types/sneaker";

export const BRANDS: Brand[] = [
  "Nike",
  "Adidas",
  "New Balance",
  "ASICS",
  "Mizuno",
  "Puma",
  "Converse",
];

export function formatReleaseDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export function formatPrice(price: number): string {
  return `¥${price.toLocaleString("ja-JP")}`;
}

export const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop";
