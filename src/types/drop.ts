export type DropItem = {
  id: string;
  brand: string;
  name: string;
  price: number;
  releaseDate: string;
  releaseTime: string;
  imageUrl: string;
  badge?: string;
  slug?: string;
};

export type FeaturedDrop = {
  tag: string;
  title: string;
  description: string;
  imageUrl: string;
};

export type BrandFilter = "all" | "nike" | "jordan" | "adidas" | "yeezy" | "new-balance";

export type VaultItem = DropItem & {
  status: "live" | "limited" | "upcoming";
  brandKey: BrandFilter;
  highlighted?: boolean;
};

export type ProductSpec = {
  label: string;
  value: string;
};

export type ProductDetail = {
  id: string;
  slug: string;
  brand: string;
  series: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  gallery: string[];
  specs: ProductSpec[];
  dropEndsAt: Date;
  newsUrl?: string | null;
  lotteryUrl?: string | null;
  storeUrl?: string;
};

export type NavPage = "launches" | "upcoming" | "archive" | "vault";
