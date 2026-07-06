import type { BrandFilter, DropItem, FeaturedDrop, ProductDetail, VaultItem } from "@/types/drop";

const STOCKX = (path: string, size = 700) =>
  `https://images.stockx.com/images/${path}?fit=fill&bg=FFFFFF&w=${size}&h=${size}&fm=webp`;

export const FEATURED_DROP: FeaturedDrop = {
  tag: "注目・限定ドロップ",
  title: "AERO-MAX PHASE 01",
  description:
    "次世代パフォーマンス設計。超軽量カーボンシャシーとアダプティブテンションラシングを搭載。",
  imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&h=700&fit=crop",
};

export const UPCOMING_DROPS: DropItem[] = [
  {
    id: "1",
    slug: "void-runner-elite",
    brand: "NIKE x TECH",
    name: "VOID RUNNER ELITE",
    price: 220,
    releaseDate: "2026年10月24日",
    releaseTime: "09:00",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
    badge: "まもなく発売",
  },
  {
    id: "2",
    slug: "retro-4-safety-blaze",
    brand: "JORDAN",
    name: "RETRO 4 'SAFETY BLAZE'",
    price: 210,
    releaseDate: "2026年11月2日",
    releaseTime: "10:00",
    imageUrl: STOCKX("Air-Jordan-4-Retro-Black-Cat-2025-Product.jpg"),
    badge: "まもなく発売",
  },
  {
    id: "3",
    slug: "ultra-boost-core",
    brand: "ADIDAS",
    name: "ULTRA BOOST 'CORE'",
    price: 190,
    releaseDate: "2026年11月8日",
    releaseTime: "11:00",
    imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop",
    badge: "まもなく発売",
  },
  {
    id: "4",
    slug: "990v6-stealth",
    brand: "NEW BALANCE",
    name: "990v6 'STEALTH'",
    price: 185,
    releaseDate: "2026年11月15日",
    releaseTime: "09:30",
    imageUrl: STOCKX("New-Balance-990v6-Grey-Product.jpg"),
    badge: "まもなく発売",
  },
];

export const VAULT_ITEMS: VaultItem[] = [
  {
    id: "v1",
    slug: "air-max-industrial-void",
    brand: "NIKE",
    name: "AIR MAX 'INDUSTRIAL VOID'",
    price: 200,
    releaseDate: "発売中",
    releaseTime: "",
    imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop",
    badge: "発売中",
    status: "live",
    brandKey: "nike",
  },
  {
    id: "v2",
    slug: "jordan-1-retro-high-og",
    brand: "JORDAN",
    name: "JORDAN 1 RETRO HIGH OG",
    price: 180,
    releaseDate: "近日発売",
    releaseTime: "10月24日",
    imageUrl: STOCKX("Air-Jordan-1-Retro-High-OG-Chicago-Reimagined-Product.jpg"),
    badge: "限定",
    status: "limited",
    brandKey: "jordan",
  },
  {
    id: "v3",
    slug: "retro-4-safety-blaze",
    brand: "JORDAN",
    name: "RETRO 4 'SAFETY BLAZE'",
    price: 210,
    releaseDate: "発売中",
    releaseTime: "",
    imageUrl: STOCKX("Air-Jordan-4-Retro-Black-Cat-2025-Product.jpg"),
    badge: "発売中",
    status: "live",
    brandKey: "jordan",
    highlighted: true,
  },
  {
    id: "v4",
    slug: "yeezy-boost-v3",
    brand: "YEEZY",
    name: "BOOST V3 'MONO'",
    price: 250,
    releaseDate: "11月10日",
    releaseTime: "",
    imageUrl: STOCKX("adidas-Yeezy-Boost-350-V2-Carbon-Product.jpg"),
    badge: "限定",
    status: "limited",
    brandKey: "yeezy",
  },
  {
    id: "v5",
    slug: "samba-og-classic",
    brand: "ADIDAS",
    name: "SAMBA OG 'CLASSIC'",
    price: 120,
    releaseDate: "11月18日",
    releaseTime: "",
    imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop",
    status: "upcoming",
    brandKey: "adidas",
  },
];

export const PRODUCT_DETAILS: Record<string, ProductDetail> = {
  "jordan-1-retro-high-og": {
    id: "v2",
    slug: "jordan-1-retro-high-og",
    brand: "JORDAN",
    series: "今後のドロップ / レトロシリーズ",
    title: "JORDAN 1 RETRO HIGH OG",
    description:
      "アイコンが再び。プレミアムなフルグレインレザーアッパーとクラシックなハイトップシルエット。すべての始まりとなった一足が、最もオーセンティックな形で復活。",
    price: 180,
    imageUrl: STOCKX("Air-Jordan-1-Retro-High-OG-Chicago-Reimagined-Product.jpg", 800),
    gallery: [
      STOCKX("Air-Jordan-1-Retro-High-OG-Chicago-Reimagined-Product.jpg", 800),
      STOCKX("Air-Jordan-4-Retro-Black-Cat-2025-Product.jpg", 800),
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop",
    ],
    specs: [
      { label: "素材", value: "フルグレインレザー" },
      { label: "クッション", value: "Encapsulated Air-Sole" },
      { label: "重量", value: "13oz" },
      { label: "SKU", value: "DZ5485-612" },
    ],
    dropEndsAt: new Date(Date.now() + 2 * 86400000 + 4 * 3600000 + 12 * 60000 + 42 * 1000),
    newsUrl: null,
    lotteryUrl: null,
  },
  "retro-4-safety-blaze": {
    id: "v3",
    slug: "retro-4-safety-blaze",
    brand: "JORDAN",
    series: "今後のドロップ / コラボシリーズ",
    title: "RETRO 4 'SAFETY BLAZE'",
    description:
      "話題のコラボモデル。第一報の公式ニュースから抽選ページ開設まで、アプリ内で段階的にリンクが切り替わります（デモ）。",
    price: 210,
    imageUrl: STOCKX("Air-Jordan-4-Retro-Black-Cat-2025-Product.jpg", 800),
    gallery: [STOCKX("Air-Jordan-4-Retro-Black-Cat-2025-Product.jpg", 800)],
    specs: [
      { label: "素材", value: "レザー / 合成皮革" },
      { label: "SKU", value: "DEMO-RETRO4" },
    ],
    dropEndsAt: new Date(Date.now() + 86400000),
    newsUrl: "https://www.nike.com/jp/launch/t/safety-blaze-demo",
    lotteryUrl: "https://www.nike.com/jp/launch/t/safety-blaze-demo",
  },
};

export const SIDEBAR_BRANDS = [
  { id: "all", label: "すべてのスニーカー" },
  { id: "nike", label: "NIKE" },
  { id: "jordan", label: "JORDAN" },
  { id: "adidas", label: "ADIDAS" },
  { id: "yeezy", label: "YEEZY" },
] as const satisfies ReadonlyArray<{ id: BrandFilter; label: string }>;

export const VAULT_FILTER_OPTIONS: {
  key: string;
  label: string;
  brandKey: BrandFilter;
}[] = [
  { key: "ALL", label: "すべて", brandKey: "all" },
  { key: "NIKE", label: "NIKE", brandKey: "nike" },
  { key: "JORDAN", label: "JORDAN", brandKey: "jordan" },
  { key: "ADIDAS", label: "ADIDAS", brandKey: "adidas" },
  { key: "YEEZY", label: "YEEZY", brandKey: "yeezy" },
  { key: "NEW BALANCE", label: "NEW BALANCE", brandKey: "new-balance" },
];

/** @deprecated Use VAULT_FILTER_OPTIONS for display labels */
export const VAULT_FILTER_TABS = VAULT_FILTER_OPTIONS.map(
  (option) => option.key,
) as readonly string[];

export function getProductBySlug(slug: string): ProductDetail | undefined {
  if (PRODUCT_DETAILS[slug]) return PRODUCT_DETAILS[slug];

  const upcoming = UPCOMING_DROPS.find((item) => item.slug === slug);
  if (upcoming) return upcomingDropToProduct(upcoming);

  const vault = VAULT_ITEMS.find((item) => item.slug === slug);
  if (vault) return vaultItemToProduct(vault);

  return undefined;
}

export function upcomingDropToProduct(item: DropItem): ProductDetail {
  return {
    id: item.id,
    slug: item.slug ?? item.id,
    brand: item.brand,
    series: `今後のドロップ / ${item.brand}`,
    title: item.name,
    description: `${item.brand} の新作ドロップ（デモ用の架空モデル）。${item.releaseDate} ${item.releaseTime} 発売予定です。`,
    price: item.price,
    imageUrl: item.imageUrl,
    gallery: [item.imageUrl],
    specs: [
      { label: "ブランド", value: item.brand },
      { label: "発売日", value: item.releaseDate },
      { label: "発売時刻", value: item.releaseTime },
    ],
    dropEndsAt: new Date(Date.now() + 7 * 86400000),
    newsUrl: null,
    lotteryUrl: null,
  };
}

export function vaultItemToProduct(vault: VaultItem): ProductDetail {
  return {
    id: vault.id,
    slug: vault.slug ?? vault.id,
    brand: vault.brand,
    series: "カタログ / " + vault.brand,
    title: vault.name,
    description: `${vault.brand} の最新ドロップ。限定数量でのリリースを予定しています。`,
    price: vault.price,
    imageUrl: vault.imageUrl,
    gallery: [vault.imageUrl],
    specs: [
      { label: "ブランド", value: vault.brand },
      { label: "ステータス", value: vault.badge ?? vault.status },
      { label: "発売", value: vault.releaseDate },
    ],
    dropEndsAt: new Date(Date.now() + 86400000),
    newsUrl: null,
    lotteryUrl:
      vault.slug === "retro-4-safety-blaze"
        ? "https://www.nike.com/jp/launch/t/safety-blaze-demo"
        : null,
  };
}

export function getVaultItemBySlug(slug: string): VaultItem | undefined {
  return VAULT_ITEMS.find((item) => item.slug === slug);
}

export function getRelatedDrops(excludeId: string): DropItem[] {
  return UPCOMING_DROPS.filter((d) => d.id !== excludeId).slice(0, 4);
}

const BRAND_FILTER_PATTERNS: Record<Exclude<BrandFilter, "all">, string> = {
  nike: "nike",
  jordan: "jordan",
  adidas: "adidas",
  yeezy: "yeezy",
  "new-balance": "new balance",
};

/** 表示ラベル（例: NIKE x TECH）がブランドフィルターに一致するか */
export function matchesBrandFilter(brandLabel: string, filter: BrandFilter): boolean {
  if (filter === "all") return true;
  return brandLabel.toLowerCase().includes(BRAND_FILTER_PATTERNS[filter]);
}

export function filterUpcomingByBrand(items: DropItem[], filter: BrandFilter): DropItem[] {
  if (filter === "all") return items;
  return items.filter((item) => matchesBrandFilter(item.brand, filter));
}

export function brandFilterHref(brandId: BrandFilter, pathname: string): string {
  if (pathname.startsWith("/vault")) {
    return brandId === "all" ? "/vault" : `/vault?brand=${brandId}`;
  }
  return brandId === "all" ? "/" : `/?brand=${brandId}`;
}
