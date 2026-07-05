import type { SneakerRadarDetail, SneakerRadarItem, UserPreferences } from "@/types/radar";

export const MOCK_PREFERENCES: UserPreferences = {
  brands: ["Nike", "Jordan", "New Balance"],
  sizes: ["27.0", "27.5", "28.0"],
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

export const MOCK_NEW_ARRIVALS: SneakerRadarItem[] = [
  {
    id: "sr-001",
    brand: "Jordan",
    modelName: "Air Jordan 1 Retro High OG 'Chicago Reimagined'",
    imageUrl:
      "https://images.unsplash.com/photo-1556906781-95a18896efac?w=600&h=600&fit=crop",
    announceDate: "2026-07-01",
    releaseDate: "2026-07-12",
    phase: "upcoming",
    price: 24200,
    storeUrl: "https://example.com/store/jordan-1",
    isRare: true,
    isCollab: false,
    matchedReasons: ["ブランド: Jordan", "サイズ: 28.0cm 在庫あり", "レア"],
  },
  {
    id: "sr-002",
    brand: "Nike",
    modelName: "Air Max 1 '86 OG Big Bubble",
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
    announceDate: "2026-07-03",
    releaseDate: "2026-07-05",
    phase: "today",
    price: 18700,
    storeUrl: "https://example.com/store/air-max-1",
    isRare: true,
    isCollab: false,
    matchedReasons: ["ブランド: Nike", "新作発表 48時間以内", "レア"],
  },
  {
    id: "sr-003",
    brand: "New Balance",
    modelName: "990v6 Made in USA 'Grey'",
    imageUrl:
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop",
    announceDate: "2026-06-28",
    releaseDate: "2026-07-20",
    phase: "announced",
    price: 31900,
    storeUrl: "https://example.com/store/990v6",
    isRare: false,
    isCollab: false,
    matchedReasons: ["ブランド: New Balance"],
  },
  {
    id: "sr-004",
    brand: "Nike",
    modelName: "Dunk Low 'Panda Restock'",
    imageUrl:
      "https://images.unsplash.com/photo-1600185365926-3a95ce3ead9e?w=600&h=600&fit=crop",
    announceDate: "2026-07-04",
    releaseDate: "2026-07-18",
    phase: "announced",
    price: 15400,
    storeUrl: "https://example.com/store/dunk-panda",
    isRare: false,
    isCollab: false,
    matchedReasons: ["ブランド: Nike", "ウォッチ中ブランド"],
  },
];

export const DEFAULT_WATCHLIST_IDS = MOCK_NEW_ARRIVALS.slice(0, 2).map((item) => item.id);

export const MOCK_WATCHLIST: SneakerRadarItem[] = [
  MOCK_NEW_ARRIVALS[0],
  MOCK_NEW_ARRIVALS[1],
];

export function getRadarSneakerById(id: string): SneakerRadarItem | undefined {
  return MOCK_NEW_ARRIVALS.find((item) => item.id === id);
}

const DETAIL_EXTRAS: Record<
  string,
  Pick<SneakerRadarDetail, "description" | "colorway" | "sku">
> = {
  "sr-001": {
    description:
      "1985年のオリジナルを現代の素材感で再構築。フルグレインレザーアッパーにクラシックなChicagoカラーを配した、コレクター向けの一足です。",
    colorway: "Varsity Red / Black / Sail",
    sku: "DZ5485-612",
  },
  "sr-002": {
    description:
      "1986年のビッグバブル仕様を復刻。ビンテージ加工レザーとOGディテールを再現した、Air Max 1ファン待望のモデルです。",
    colorway: "White / University Red / Grey",
    sku: "FN7183-100",
  },
  "sr-003": {
    description:
      "Made in USAラインの990v6。プレミアムスエードとメッシュのコンビネーションに、安定感のあるENCAPミッドソールを搭載。",
    colorway: "Grey / Castlerock",
    sku: "M990GL6",
  },
  "sr-004": {
    description:
      "定番Pandaカラーの再入荷モデル。シンプルなツートーンが合わせやすく、デイリーユースにも最適です。",
    colorway: "White / Black",
    sku: "DD1391-100",
  },
};

export function getRadarSneakerDetailById(id: string): SneakerRadarDetail | undefined {
  const base = getRadarSneakerById(id);
  const extras = DETAIL_EXTRAS[id];
  if (!base || !extras) return undefined;
  return { ...base, ...extras };
}
