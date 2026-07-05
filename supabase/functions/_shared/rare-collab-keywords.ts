import rawConfig from "../../../config/rare-collab-keywords.json";

export type RareCollabKeywordsConfig = {
  rare: {
    words: string[];
    quotedColorway: boolean;
  };
  collab: {
    words: string[];
    regex: string[];
  };
};

/** 判定キーワード定義（`config/rare-collab-keywords.json`） */
export const rareCollabKeywordsConfig = rawConfig as RareCollabKeywordsConfig;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function wordToPattern(word: string): RegExp {
  return new RegExp(`\\b${escapeRegex(word)}\\b`, "i");
}

function regexToPattern(source: string): RegExp {
  return new RegExp(source, "i");
}

export type RareCollabKeywordPatterns = {
  rarePatterns: RegExp[];
  collabPatterns: RegExp[];
  quotedColorway: boolean;
};

export function loadRareCollabKeywordPatterns(
  config: RareCollabKeywordsConfig = rareCollabKeywordsConfig,
): RareCollabKeywordPatterns {
  return {
    rarePatterns: config.rare.words.map(wordToPattern),
    collabPatterns: [
      ...config.collab.words.map(wordToPattern),
      ...config.collab.regex.map(regexToPattern),
    ],
    quotedColorway: config.rare.quotedColorway,
  };
}

const defaultPatterns = loadRareCollabKeywordPatterns();

export const RARE_PATTERNS = defaultPatterns.rarePatterns;
export const COLLAB_PATTERNS = defaultPatterns.collabPatterns;
export const RARE_QUOTED_COLORWAY_ENABLED = defaultPatterns.quotedColorway;
