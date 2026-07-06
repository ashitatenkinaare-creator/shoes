import type { UserPreferences } from "@/types/radar";
import type { RadarDbResult } from "@/types/radar-db";

function formatError(message: string, context: string): string {
  return `${context}: ${message}`;
}

async function readApiError(response: Response, context: string): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    if (body.error) return formatError(body.error, context);
  } catch {
    // ignore JSON parse errors
  }
  return formatError(`HTTP ${response.status}`, context);
}

/** ログインユーザーの条件設定を API 経由で取得（Cookie セッション → RLS 安全） */
export async function fetchUserPreferences(
  _userId: string,
): Promise<RadarDbResult<UserPreferences | null>> {
  const response = await fetch("/api/radar/preferences", {
    method: "GET",
    credentials: "same-origin",
  });

  if (response.status === 401) {
    return { data: null, error: formatError("ログインが必要です", "条件設定の取得に失敗しました") };
  }

  if (!response.ok) {
    return { data: null, error: await readApiError(response, "条件設定の取得に失敗しました") };
  }

  const body = (await response.json()) as { data?: UserPreferences | null };
  return { data: body.data ?? null, error: null };
}

/** ログインユーザーの条件設定を API 経由で保存（Cookie セッション → RLS 安全） */
export async function upsertUserPreferences(
  _userId: string,
  preferences: UserPreferences,
): Promise<RadarDbResult<UserPreferences>> {
  const response = await fetch("/api/radar/preferences", {
    method: "PUT",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(preferences),
  });

  if (response.status === 401) {
    return {
      data: null,
      error: formatError("ログインが必要です", "条件設定の保存に失敗しました"),
    };
  }

  if (!response.ok) {
    return { data: null, error: await readApiError(response, "条件設定の保存に失敗しました") };
  }

  const body = (await response.json()) as { data?: UserPreferences };
  if (!body.data) {
    return { data: null, error: formatError("empty response", "条件設定の保存に失敗しました") };
  }

  return { data: body.data, error: null };
}
