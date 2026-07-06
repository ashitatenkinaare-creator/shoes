import { NextResponse } from "next/server";
import { syncOfficialUrlsForCatalog } from "@/lib/radar/official-url-sync.server";
import { syncSnkrsCalendarUrls } from "@/lib/radar/snkrs-calendar-sync.server";
import { createAdminSupabase, getCronSecret } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function isAuthorized(request: Request): boolean {
  const cronSecret = getCronSecret();
  if (!cronSecret) return process.env.NODE_ENV === "development";

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${cronSecret}`) return true;

  const headerSecret = request.headers.get("x-cron-secret");
  return headerSecret === cronSecret;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminSupabase();

  const registryResult = await syncOfficialUrlsForCatalog(supabase);
  if (registryResult.error) {
    return NextResponse.json({ error: registryResult.error }, { status: 500 });
  }

  const snkrsResult = await syncSnkrsCalendarUrls(supabase);
  if (snkrsResult.error) {
    return NextResponse.json({ error: snkrsResult.error }, { status: 500 });
  }

  return NextResponse.json({
    registryUpdated: registryResult.data,
    snkrs: snkrsResult.data,
  });
}
