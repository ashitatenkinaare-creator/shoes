/** 通知フェーズ（発表 / 抽選ページ開設 / 発売） */
export type NotificationPhase = "announcement" | "lottery_open" | "release";

/** スニーカーのライフサイクル表示用 */
export type SneakerPhase = "announced" | "upcoming" | "today";

export type SneakerRadarItem = {
  id: string;
  categorySlug: string;
  categoryLabel: string;
  brand: string;
  modelName: string;
  imageUrl: string;
  announceDate: string;
  releaseDate: string;
  phase: SneakerPhase;
  price: number;
  storeUrl: string;
  newsUrl: string | null;
  lotteryUrl: string | null;
  lotteryOpenedAt: string | null;
  isRare: boolean;
  isCollab: boolean;
  /** 条件マッチ理由（ダッシュボード表示用） */
  matchedReasons: string[];
};

/** 詳細画面用の追加情報 */
export type SneakerRadarDetail = SneakerRadarItem & {
  description: string;
  colorway: string;
  sku: string;
};

export type UserPreferences = {
  brands: string[];
  sizes: string[];
  /** シルエット指定（空=全て）。例: All Star, One Star */
  silhouettes: string[];
  /** コラボブランド指定（空=全て）。例: KITH, BEAMS */
  collabBrands: string[];
  /** 表示カテゴリ slug（空=全カテゴリ）。例: sneakers, apparel */
  categories: string[];
  /** 発表時通知 */
  notifyOnAnnouncement: boolean;
  /** 発売時通知 */
  notifyOnRelease: boolean;
  /** レアスニーカーのみ表示 */
  filterRare: boolean;
  /** コラボモデルのみ表示 */
  filterCollab: boolean;
};

export type RadarNavKey = "dashboard" | "watchlist" | "settings" | "auth";

/** ウォッチリスト削除ハンドラ */
export type WatchlistRemoveHandler = (sneakerId: string) => void | Promise<void>;
