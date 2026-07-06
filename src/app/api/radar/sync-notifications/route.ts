import { NextResponse } from "next/server";
import { syncNotificationsForUser } from "@/lib/radar/notifications-sync.server";
import { createServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";

/** ウォッチリストに基づき通知を同期（LLM 文案生成はサーバー側のみ） */
export async function POST() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncNotificationsForUser(supabase, user.id);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ synced: result.data ?? 0 });
}
