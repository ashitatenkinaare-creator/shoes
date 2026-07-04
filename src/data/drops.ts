import type {
  DropItem,
  FeaturedDrop,
  ProductDetail,
  VaultItem,
} from "@/types/drop";

export const FEATURED_DROP: FeaturedDrop = {
  tag: "LIVE HYPE DROP",
  title: "AERO-MAX PHASE 01",
  description:
    "The future of performance engineering. Ultra-lightweight carbon chassis with adaptive tension lacing system.",
  imageUrl:
    "https://images.unsplash.com/photo-1606107557195-0a29ba4781a1?w=1200&h=700&fit=crop",
};

export const UPCOMING_DROPS: DropItem[] = [
  {
    id: "1",
    slug: "void-runner-elite",
    brand: "NIKE x TECH",
    name: "VOID RUNNER ELITE",
    price: 220,
    releaseDate: "OCT 24, 2026",
    releaseTime: "09:00 AM",
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
    badge: "LAUNCHING SOON",
  },
  {
    id: "2",
    slug: "retro-4-safety-blaze",
    brand: "JORDAN",
    name: "RETRO 4 'SAFETY BLAZE'",
    price: 210,
    releaseDate: "NOV 02, 2026",
    releaseTime: "10:00 AM",
    imageUrl:
      "https://images.unsplash.com/photo-1556906781-95a18896efac?w=600&h=600&fit=crop",
    badge: "LAUNCHING SOON",
  },
  {
    id: "3",
    slug: "ultra-boost-core",
    brand: "ADIDAS",
    name: "ULTRA BOOST 'CORE'",
    price: 190,
    releaseDate: "NOV 08, 2026",
    releaseTime: "11:00 AM",
    imageUrl:
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop",
    badge: "LAUNCHING SOON",
  },
  {
    id: "4",
    slug: "990v6-stealth",
    brand: "NEW BALANCE",
    name: "990v6 'STEALTH'",
    price: 185,
    releaseDate: "NOV 15, 2026",
    releaseTime: "09:30 AM",
    imageUrl:
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop",
    badge: "LAUNCHING SOON",
  },
];

export const VAULT_ITEMS: VaultItem[] = [
  {
    id: "v1",
    slug: "air-max-industrial-void",
    brand: "NIKE",
    name: "AIR MAX 'INDUSTRIAL VOID'",
    price: 200,
    releaseDate: "LIVE NOW",
    releaseTime: "",
    imageUrl:
      "https://images.unsplash.com/photo-1600185365926-3a95ce3ead9e?w=600&h=600&fit=crop",
    badge: "LIVE NOW",
    status: "live",
    brandKey: "nike",
  },
  {
    id: "v2",
    slug: "jordan-1-retro-high-og",
    brand: "JORDAN",
    name: "JORDAN 1 RETRO HIGH OG",
    price: 180,
    releaseDate: "UPCOMING",
    releaseTime: "OCT 24",
    imageUrl:
      "https://images.unsplash.com/photo-1556906781-95a18896efac?w=600&h=600&fit=crop",
    badge: "LIMITED",
    status: "limited",
    brandKey: "jordan",
  },
  {
    id: "v3",
    slug: "retro-4-safety-blaze",
    brand: "JORDAN",
    name: "RETRO 4 'SAFETY BLAZE'",
    price: 210,
    releaseDate: "NOV 02",
    releaseTime: "",
    imageUrl:
      "https://images.unsplash.com/photo-1587563871167-1ee9a731e6cd?w=600&h=600&fit=crop",
    badge: "LIVE NOW",
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
    releaseDate: "NOV 10",
    releaseTime: "",
    imageUrl:
      "https://images.unsplash.com/photo-1605348532760-6753bf2a5b6?w=600&h=600&fit=crop",
    badge: "LIMITED",
    status: "limited",
    brandKey: "yeezy",
  },
  {
    id: "v5",
    slug: "samba-og-classic",
    brand: "ADIDAS",
    name: "SAMBA OG 'CLASSIC'",
    price: 120,
    releaseDate: "NOV 18",
    releaseTime: "",
    imageUrl:
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop",
    status: "upcoming",
    brandKey: "adidas",
  },
];

export const PRODUCT_DETAILS: Record<string, ProductDetail> = {
  "jordan-1-retro-high-og": {
    id: "v2",
    slug: "jordan-1-retro-high-og",
    series: "UPCOMING DROPS / RETRO SERIES",
    title: "JORDAN 1 RETRO HIGH OG",
    description:
      "An icon reborn. Premium full-grain leather upper with classic high-top silhouette. The shoe that started it all, returning in its most authentic form.",
    price: 180,
    imageUrl:
      "https://images.unsplash.com/photo-1556906781-95a18896efac?w=800&h=800&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1556906781-95a18896efac?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1587563871167-1ee9a731e6cd?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1606107557195-0a29ba4781a1?w=800&h=800&fit=crop",
    ],
    specs: [
      { label: "Material", value: "Full-Grain Leather" },
      { label: "Cushioning", value: "Encapsulated Air-Sole" },
      { label: "Weight", value: "13oz" },
      { label: "SKU", value: "DZ5485-612" },
    ],
    dropEndsAt: new Date(Date.now() + 2 * 86400000 + 4 * 3600000 + 12 * 60000 + 42 * 1000),
  },
};

export const SIDEBAR_BRANDS = [
  { id: "all", label: "ALL RELEASES", href: "/vault" },
  { id: "nike", label: "NIKE", href: "/vault?brand=nike" },
  { id: "jordan", label: "JORDAN", href: "/vault?brand=jordan" },
  { id: "adidas", label: "ADIDAS", href: "/vault?brand=adidas" },
  { id: "yeezy", label: "YEEZY", href: "/vault?brand=yeezy" },
] as const;

export const VAULT_FILTER_TABS = [
  "ALL",
  "NIKE",
  "JORDAN",
  "ADIDAS",
  "YEEZY",
  "NEW BALANCE",
] as const;

export function getProductBySlug(slug: string): ProductDetail | undefined {
  return PRODUCT_DETAILS[slug];
}

export function getVaultItemBySlug(slug: string): VaultItem | undefined {
  return VAULT_ITEMS.find((item) => item.slug === slug);
}

export function getRelatedDrops(excludeId: string): DropItem[] {
  return UPCOMING_DROPS.filter((d) => d.id !== excludeId).slice(0, 4);
}
