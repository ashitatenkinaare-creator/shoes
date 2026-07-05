import type { UserPreferences } from "@/types/radar";

export const MOCK_PREFERENCES: UserPreferences = {
  brands: ["Nike", "Jordan", "New Balance"],
  sizes: ["27.0", "27.5", "28.0"],
  silhouettes: [],
  collabBrands: [],
  notifyOnAnnouncement: true,
  notifyOnRelease: true,
  filterRare: false,
  filterCollab: false,
};

export const AVAILABLE_BRANDS = [
  "Nike",
  "Jordan",
  "Adidas",
  "New Balance",
  "Asics",
  "Puma",
  "Converse",
  "Yeezy",
] as const;

export const AVAILABLE_SIZES = [
  "25.0",
  "25.5",
  "26.0",
  "26.5",
  "27.0",
  "27.5",
  "28.0",
  "28.5",
  "29.0",
  "29.5",
  "30.0",
] as const;

export const PREFERENCES_STORAGE_KEY = "sneaker-radar-preferences";
export const WATCHLIST_STORAGE_KEY = "sneaker-radar-watchlist";
