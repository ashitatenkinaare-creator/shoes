/** カタログ商品の発売日解析・検証（KicksDB 同期 / ダッシュボード共通） */

import {
  isRadarPlaceholderImage,
  isSnkrsOfficialProductDescription,
  isSnkrsProductLotteryUrl,
} from "./catalog-quality";

export type ReleaseDateSource = "api" | "description";

export type VerifiedReleaseDate = {
  date: string;
  source: ReleaseDateSource;
};

function formatLocalIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseIsoDate(raw: string | undefined): string | null {
  if (!raw) return null;

  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 10);
  }

  if (/^\d{8}$/.test(trimmed)) {
    return `${trimmed.slice(0, 4)}-${trimmed.slice(4, 6)}-${trimmed.slice(6, 8)}`;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return formatLocalIsoDate(parsed);
}

function parseNaturalLanguageDate(raw: string): string | null {
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return formatLocalIsoDate(parsed);
}

/** 説明文から発売日を抽出（信頼できる明示表現のみ） */
export function parseReleaseDateFromDescription(description: string | undefined): string | null {
  if (!description) return null;

  const droppedMatch = description.match(
    /(?:dropped|released)\s+on\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})/i,
  );
  if (droppedMatch?.[1]) {
    return parseNaturalLanguageDate(droppedMatch[1]);
  }

  const ordinalMatch = description.match(
    /(?:dropped|released)\s+on\s+the\s+(\d{1,2})(?:st|nd|rd|th)?\s+of\s+([A-Za-z]+),?\s+(\d{4})/i,
  );
  if (ordinalMatch?.[1] && ordinalMatch?.[2] && ordinalMatch?.[3]) {
    return parseNaturalLanguageDate(`${ordinalMatch[2]} ${ordinalMatch[1]}, ${ordinalMatch[3]}`);
  }

  const releasedInMatch = description.match(/released\s+in\s+([A-Za-z]+)\s+of\s+(\d{4})/i);
  if (releasedInMatch?.[1] && releasedInMatch?.[2]) {
    return parseNaturalLanguageDate(`${releasedInMatch[1]} 1, ${releasedInMatch[2]}`);
  }

  return null;
}

/** 説明文に「既発売」を示す表現があるか */
export function descriptionIndicatesPastRelease(
  description: string | undefined,
  today = new Date(),
): boolean {
  const parsed = parseReleaseDateFromDescription(description);
  if (parsed && parsed < formatLocalIsoDate(today)) {
    return true;
  }

  const text = description ?? "";
  if (/released\s+in\s+[A-Za-z]+\s+of\s+20(1[0-9]|2[0-5])/i.test(text)) return true;
  if (/first revealed in .+ 20(1[0-9]|2[0-5])/i.test(text)) return true;
  if (/originally released in (19|20)\d{2}/i.test(text)) return true;
  if (/consistently restocks/i.test(text)) return true;

  return false;
}

export function isUpcomingReleaseDate(releaseDate: string, today = new Date()): boolean {
  return releaseDate >= formatLocalIsoDate(today);
}

/** KicksDB 同期用: 説明文と API が食い違う場合は説明文を優先（StockX カタログの API 日付は信頼性が低い） */
export function resolveVerifiedReleaseDate(input: {
  release_date?: string;
  description?: string;
}): VerifiedReleaseDate | null {
  const fromDescription = parseReleaseDateFromDescription(input.description);
  const fromApi = parseIsoDate(input.release_date);

  if (fromDescription && fromApi && fromDescription !== fromApi) {
    return { date: fromDescription, source: "description" };
  }

  if (fromApi) {
    return { date: fromApi, source: "api" };
  }

  if (fromDescription) {
    return { date: fromDescription, source: "description" };
  }

  return null;
}

type CatalogReleaseRow = {
  source: string;
  release_date: string;
  description: string;
  lottery_url?: string | null;
  image_url?: string | null;
};

/** ダッシュボード掲載可否: ソースごとに確認済みの発売日・画像・URL のみ */
export function hasTrustworthyReleaseDate(row: CatalogReleaseRow, today = new Date()): boolean {
  const todayStr = formatLocalIsoDate(today);

  if (row.source === "snkrs") {
    if (!isSnkrsProductLotteryUrl(row.lottery_url)) return false;
    if (isRadarPlaceholderImage(row.image_url)) return false;
    if (!isSnkrsOfficialProductDescription(row.description)) return false;
    return row.release_date >= todayStr;
  }

  if (row.source !== "kicksdb") {
    return row.release_date >= todayStr;
  }

  if (descriptionIndicatesPastRelease(row.description, today)) {
    return false;
  }

  const fromDescription = parseReleaseDateFromDescription(row.description);
  if (fromDescription) {
    if (fromDescription < todayStr) return false;
    return row.release_date === fromDescription;
  }

  // 説明文に発売日が無い場合: 同期済みの未来 release_date のみ許可（既発売ヒントは上で除外）
  return row.release_date >= todayStr;
}
