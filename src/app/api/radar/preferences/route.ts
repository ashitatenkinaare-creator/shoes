import { NextResponse } from "next/server";
import { rowToPreferences } from "@/lib/radar/map-preferences";
import {
  getAuthenticatedServerUser,
  upsertServerUserPreferences,
} from "@/lib/radar/preferences-server";
import type { UserPreferences } from "@/types/radar";
import type { UserPreferencesRow } from "@/types/radar-db";

export const runtime = "nodejs";

function isUserPreferences(value: unknown): value is UserPreferences {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    Array.isArray(record.brands) &&
    Array.isArray(record.sizes) &&
    typeof record.notifyOnAnnouncement === "boolean" &&
    typeof record.notifyOnRelease === "boolean"
  );
}

export async function GET() {
  const { supabase, user, error: authError } = await getAuthenticatedServerUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ data: null });
  }

  return NextResponse.json({ data: rowToPreferences(data as UserPreferencesRow) });
}

export async function PUT(request: Request) {
  const { supabase, user, error: authError } = await getAuthenticatedServerUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isUserPreferences(body)) {
    return NextResponse.json({ error: "Invalid preferences payload" }, { status: 400 });
  }

  const result = await upsertServerUserPreferences(supabase, user.id, body);

  if (result.error || !result.data) {
    return NextResponse.json(
      { error: result.error ?? "条件設定の保存に失敗しました" },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: result.data });
}
