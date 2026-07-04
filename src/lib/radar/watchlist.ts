import {
  DEFAULT_WATCHLIST_IDS,
  WATCHLIST_STORAGE_KEY,
} from "@/data/radar-mock";
import { fetchSneakerItemsByIds } from "@/lib/radar/catalog-client";
import type { SneakerRadarItem } from "@/types/radar";

export function loadWatchlistIds(): string[] {
  if (typeof window === "undefined") return DEFAULT_WATCHLIST_IDS;

  try {
    const raw = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (!raw) return DEFAULT_WATCHLIST_IDS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : DEFAULT_WATCHLIST_IDS;
  } catch {
    return DEFAULT_WATCHLIST_IDS;
  }
}

export function saveWatchlistIds(ids: string[]): void {
  localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(ids));
}

export async function fetchWatchlistItems(ids: string[]): Promise<SneakerRadarItem[]> {
  return fetchSneakerItemsByIds(ids);
}
