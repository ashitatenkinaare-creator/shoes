/** 通知フェーズ（MVP: 発表 / 発売の2段階） */
export type NotificationPhase = "announcement" | "release";

/** スニーカーのライフサイクル表示用 */
export type SneakerPhase = "announced" | "upcoming" | "today";

export type SneakerRadarItem = {
  id: string;
  brand: string;
  modelName: string;
  imageUrl: string;
  announceDate: string;
  releaseDate: string;
  phase: SneakerPhase;
  price: number;
  storeUrl: string;
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
