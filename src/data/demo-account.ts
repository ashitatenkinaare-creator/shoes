/** 評価・デモ用アカウント（`npm run seed:demo` で Supabase に作成） */
export const DEMO_ACCOUNT = {
  email: "demo@sneaker-radar.app",
  password: "DemoPass1234",
} as const;

export const DEMO_SNEAKER_IDS = {
  /** 第1弾通知デモ（news_url のみ） */
  nikeRare: "11111111-1111-1111-1111-111111111101",
  /** 第2弾通知デモ（lottery_url 開設済み） */
  jordanRare: "11111111-1111-1111-1111-111111111102",
} as const;

export const DEMO_BASE_URL = process.env.NEXT_PUBLIC_DEMO_BASE_URL ?? "http://localhost:3000";

/** 評価者向けデモ URL 一覧 */
export const DEMO_URLS = [
  { label: "SneakerDrop トップ", path: "/" },
  { label: "スニーカーカタログ", path: "/vault" },
  { label: "商品詳細（第2弾・抽選ページ開設デモ）", path: "/drops/retro-4-safety-blaze" },
  { label: "Radar ダッシュボード", path: "/dashboard" },
  { label: "条件設定", path: "/settings" },
  { label: "ウォッチリスト", path: "/watchlist" },
  { label: "ログイン", path: "/auth" },
  {
    label: "Radar 詳細（第1弾・公式発表デモ）",
    path: `/sneaker/${DEMO_SNEAKER_IDS.nikeRare}`,
  },
  {
    label: "Radar 詳細（第2弾・抽選ページデモ）",
    path: `/sneaker/${DEMO_SNEAKER_IDS.jordanRare}`,
  },
  { label: "管理 CRUD", path: "/sneakers" },
  { label: "会員登録（デモ UI）", path: "/register" },
] as const;

/** 評価基準「5. 機能」用: 全画面パス */
export const ALL_APP_SCREEN_PATHS = DEMO_URLS.map((entry) => entry.path);
