export type SnkrsLaunchEntry = {
  slug: string;
  title: string;
  subtitle: string | null;
  seoTitle: string | null;
  url: string;
};

const SNKRS_LAUNCH_BASE = "https://www.nike.com/jp/launch/t";

const MATCH_STOP_WORDS = new Set([
  "air",
  "low",
  "high",
  "mid",
  "og",
  "retro",
  "sp",
  "x",
  "the",
  "and",
  "of",
  "wmns",
  "womens",
  "mens",
  "men",
  "women",
  "nike",
  "jp",
  "official",
]);

/** 単独一致では製品特定に使わないカラーウェイ語 */
const COLORWAY_WORDS = new Set([
  "sail",
  "white",
  "black",
  "pink",
  "red",
  "blue",
  "green",
  "grey",
  "gray",
  "cream",
  "ivory",
  "navy",
  "gold",
  "silver",
  "brown",
  "orange",
  "yellow",
  "purple",
  "volt",
  "coral",
  "tropical",
  "diamond",
  "pearl",
  "metallic",
  "summit",
  "royal",
  "bred",
  "cement",
  "infrared",
  "olive",
  "tan",
  "beige",
  "wolf",
  "gum",
  "ice",
  "ghost",
  "light",
  "dark",
  "multi",
  "team",
  "panda",
  "mocha",
  "chicago",
  "shadow",
  "obsidian",
  "pine",
  "sea",
  "glass",
  "hyper",
  "turbo",
  "photo",
  "racer",
  "university",
]);

const SILHOUETTE_WORDS = new Set([
  "jordan",
  "dunk",
  "max",
  "force",
  "zoom",
  "streak",
  "shox",
  "blazer",
  "cortez",
  "pegasus",
  "vomero",
  "magia",
  "mirage",
  "calistra",
  "total",
  "first",
  "sight",
  "mag",
  "presto",
  "vapor",
  "flyknit",
  "react",
  "yeezy",
  "love",
  "letter",
]);

export type MatchTokenGroups = {
  distinctive: string[];
  silhouette: string[];
  colorway: string[];
};

type ThreadItem = {
  title?: string;
  coverCard?: { subtitle?: string; title?: string };
  seo?: { slug?: string; title?: string };
};

export function buildSnkrsLaunchUrl(slug: string): string {
  return `${SNKRS_LAUNCH_BASE}/${slug}`;
}

function slugToTitle(slug: string): string {
  return slug.replace(/-/g, " ");
}

/** SNKRS カレンダー HTML から発売エントリを抽出（__NEXT_DATA__ 優先、パス走査で補完） */
export function parseSnkrsLaunchEntriesFromHtml(html: string): SnkrsLaunchEntry[] {
  const bySlug = new Map<string, SnkrsLaunchEntry>();

  const nextDataMatch = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
  );

  if (nextDataMatch) {
    try {
      const json = JSON.parse(nextDataMatch[1]) as {
        props?: { pageProps?: { initialState?: string } };
      };
      const initialState = json.props?.pageProps?.initialState;
      if (typeof initialState === "string") {
        const state = JSON.parse(initialState) as {
          product?: { threads?: { data?: { items?: Record<string, ThreadItem> } } };
        };
        const items = state.product?.threads?.data?.items;
        if (items) {
          for (const thread of Object.values(items)) {
            const slug = thread.seo?.slug?.trim();
            if (!slug) continue;
            bySlug.set(slug, {
              slug,
              title: thread.title?.trim() ?? slugToTitle(slug),
              subtitle: thread.coverCard?.subtitle?.trim() ?? null,
              seoTitle: thread.seo?.title?.trim() ?? null,
              url: buildSnkrsLaunchUrl(slug),
            });
          }
        }
      }
    } catch {
      // path scan fallback below
    }
  }

  for (const match of html.matchAll(/\/jp\/launch\/t\/([a-z0-9-]+)/gi)) {
    const slug = match[1].toLowerCase();
    if (bySlug.has(slug)) continue;
    bySlug.set(slug, {
      slug,
      title: slugToTitle(slug),
      subtitle: null,
      seoTitle: null,
      url: buildSnkrsLaunchUrl(slug),
    });
  }

  return [...bySlug.values()];
}

export function normalizeMatchText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKC")
    .replace(/['']/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function classifyMatchToken(token: string): "stop" | "colorway" | "silhouette" | "distinctive" {
  if (token.length < 2 || MATCH_STOP_WORDS.has(token)) return "stop";
  if (COLORWAY_WORDS.has(token)) return "colorway";
  if (/^\d+$/.test(token) || SILHOUETTE_WORDS.has(token)) return "silhouette";
  return "distinctive";
}

export function extractMatchKeywords(text: string): string[] {
  const groups = extractMatchTokenGroups(text);
  return [...groups.distinctive, ...groups.silhouette, ...groups.colorway];
}

/** モデル名トークンをコラボ名 / シルエット / カラーウェイに分類 */
export function extractMatchTokenGroups(text: string): MatchTokenGroups {
  const normalized = normalizeMatchText(text);
  const groups: MatchTokenGroups = { distinctive: [], silhouette: [], colorway: [] };

  for (const token of normalized.split(" ")) {
    const kind = classifyMatchToken(token);
    if (kind === "stop") continue;
    groups[kind].push(token);
  }

  return groups;
}

function countMatchedTokens(tokens: string[], haystack: string): number {
  return tokens.filter((token) => haystack.includes(token)).length;
}

export function buildSnkrsEntryHaystack(entry: SnkrsLaunchEntry): string {
  return normalizeMatchText(
    [entry.title, entry.subtitle, entry.seoTitle, entry.slug.replace(/-/g, " ")]
      .filter(Boolean)
      .join(" "),
  );
}

export function isSnkrsEligibleBrand(brand: string): boolean {
  const key = brand.trim().toLowerCase();
  return key === "nike" || key === "jordan" || key.includes("jordan");
}

export function scoreSnkrsMatch(modelName: string, entry: SnkrsLaunchEntry): number {
  const groups = extractMatchTokenGroups(modelName);
  const haystack = buildSnkrsEntryHaystack(entry);
  const nonColorway = [...groups.distinctive, ...groups.silhouette];
  return countMatchedTokens(nonColorway, haystack);
}

function isStrongSnkrsMatch(modelName: string, entry: SnkrsLaunchEntry): boolean {
  const groups = extractMatchTokenGroups(modelName);
  const nonColorway = [...groups.distinctive, ...groups.silhouette];
  if (nonColorway.length === 0) return false;

  const haystack = buildSnkrsEntryHaystack(entry);

  if (groups.distinctive.length > 0) {
    const allDistinctiveMatch = groups.distinctive.every((token) => haystack.includes(token));
    if (!allDistinctiveMatch) return false;
  }

  const matchedNonColorway = countMatchedTokens(nonColorway, haystack);
  const requiredMatches =
    groups.distinctive.length > 0
      ? Math.max(2, groups.distinctive.length)
      : Math.min(2, nonColorway.length);

  if (matchedNonColorway < requiredMatches) return false;

  const matchRatio = matchedNonColorway / nonColorway.length;
  return matchRatio >= 0.5;
}

/** モデル名キーワードが SNKRS エントリと部分一致した最良候補を返す */
export function matchSnkrsEntryToSneaker(
  modelName: string,
  brand: string,
  entries: SnkrsLaunchEntry[],
): SnkrsLaunchEntry | null {
  if (!isSnkrsEligibleBrand(brand)) return null;

  const groups = extractMatchTokenGroups(modelName);
  if (groups.distinctive.length === 0 && groups.silhouette.length === 0) return null;

  let best: { entry: SnkrsLaunchEntry; score: number } | null = null;

  for (const entry of entries) {
    if (!isStrongSnkrsMatch(modelName, entry)) continue;

    const score = scoreSnkrsMatch(modelName, entry);
    if (!best || score > best.score) {
      best = { entry, score };
    }
  }

  return best?.entry ?? null;
}
