import { NextResponse } from "next/server";
import { runRadarReleaseSync } from "@/lib/radar/sync-releases";
import { getCronSecret } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function isAuthorized(request: Request): boolean {
  const cronSecret = getCronSecret();
  if (!cronSecret) return process.env.NODE_ENV === "development";

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${cronSecret}`) return true;

  const headerSecret = request.headers.get("x-cron-secret");
  return headerSecret === cronSecret;
}

/** KicksDB → radar_sneakers 同期（Cron / 手動トリガー用） */
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runRadarReleaseSync();

  return NextResponse.json(result, {
    status: result.errors.length > 0 && result.upserted === 0 ? 502 : 200,
  });
}
