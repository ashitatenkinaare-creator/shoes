import { GoogleGenerativeAI } from "@google/generative-ai";
import type { NotificationPhase } from "@/types/radar";

export type NotificationCopyInput = {
  phase: NotificationPhase;
  brand: string;
  modelName: string;
  leadTime?: string;
  fallback: { title: string; body: string };
};

const PHASE_PREFIX: Record<NotificationPhase, string> = {
  announcement: "【本日発表】",
  lottery_open: "【販売・抽選ページ開設！】",
  release: "【発売】",
};

/** LLM 通知文生成が有効か（テスト / CI / 明示無効時はオフ） */
export function isLlmNotificationCopyEnabled(): boolean {
  if (process.env.DISABLE_LLM_NOTIFICATIONS === "1") return false;
  if (process.env.CI === "true") return false;
  if (process.env.VITEST === "true") return false;
  return Boolean(process.env.GEMINI_API_KEY ?? process.env.OPENAI_API_KEY);
}

function buildPrompt(input: NotificationCopyInput): string {
  const phaseLabel =
    input.phase === "announcement"
      ? "公式新作発表（第1弾）"
      : input.phase === "lottery_open"
        ? "公式抽選・販売ページ開設（第2弾）"
        : "発売当日";

  const leadTimeHint = input.leadTime ? `発売までの目安: ${input.leadTime}` : "";

  return [
    "あなたはスニーカーアプリのプッシュ通知コピーライターです。",
    `ブランド: ${input.brand}`,
    `モデル名: ${input.modelName}`,
    `通知種別: ${phaseLabel}`,
    leadTimeHint,
    "",
    "スニーカーヘッズがワクワクする、短い日本語の通知文を JSON のみで返してください。",
    `タイトルには必ず「${PHASE_PREFIX[input.phase]}」で始めること。`,
    '形式: {"title":"...","body":"..."}',
    "title は 80 文字以内、body は 120 文字以内。",
  ]
    .filter(Boolean)
    .join("\n");
}

function parseJsonCopy(text: string): { title: string; body: string } | null {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]) as { title?: unknown; body?: unknown };
    if (typeof parsed.title !== "string" || typeof parsed.body !== "string") return null;
    if (!parsed.title.trim() || !parsed.body.trim()) return null;
    return { title: parsed.title.trim(), body: parsed.body.trim() };
  } catch {
    return null;
  }
}

function sanitizeCopy(
  phase: NotificationPhase,
  copy: { title: string; body: string },
  fallback: { title: string; body: string },
): { title: string; body: string } {
  const prefix = PHASE_PREFIX[phase];
  if (!copy.title.startsWith(prefix)) return fallback;
  if (copy.title.length > 120 || copy.body.length > 200) return fallback;
  return copy;
}

async function generateWithGemini(
  input: NotificationCopyInput,
): Promise<{ title: string; body: string } | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const modelName = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(buildPrompt(input));
  const text = result.response.text();
  const parsed = parseJsonCopy(text);
  if (!parsed) return null;
  return sanitizeCopy(input.phase, parsed, input.fallback);
}

async function generateWithOpenAI(
  input: NotificationCopyInput,
): Promise<{ title: string; body: string } | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.8,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: 'Respond with JSON only: {"title":"...","body":"..."}',
        },
        { role: "user", content: buildPrompt(input) },
      ],
    }),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;

  const parsed = parseJsonCopy(content);
  if (!parsed) return null;
  return sanitizeCopy(input.phase, parsed, input.fallback);
}

/** LLM で通知タイトル・本文を生成。失敗時は fallback を返す */
export async function generateNotificationCopy(
  input: NotificationCopyInput,
): Promise<{ title: string; body: string }> {
  if (!isLlmNotificationCopyEnabled()) {
    return input.fallback;
  }

  try {
    if (process.env.GEMINI_API_KEY) {
      const geminiCopy = await generateWithGemini(input);
      if (geminiCopy) return geminiCopy;
    }

    if (process.env.OPENAI_API_KEY) {
      const openAiCopy = await generateWithOpenAI(input);
      if (openAiCopy) return openAiCopy;
    }
  } catch {
    // API 障害時は固定文言へフォールバック
  }

  return input.fallback;
}
