/**
 * radar_sneakers の news_url / lottery_url を整理（汎用 URL 除去 + ソースマッチ）
 * 使い方: npm run sync:official-urls
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { register } from "tsx/esm/api";
import { createClient } from "@supabase/supabase-js";

register();

const { syncOfficialUrlsForCatalog } = await import("../src/lib/radar/official-url-sync.server.ts");
const { syncSnkrsCalendarUrls } = await import("../src/lib/radar/snkrs-calendar-sync.server.ts");

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    if (!process.env[trimmed.slice(0, idx)]) {
      process.env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
    }
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRole) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const registryResult = await syncOfficialUrlsForCatalog(supabase);
if (registryResult.error) {
  console.error(registryResult.error);
  process.exit(1);
}

const snkrsResult = await syncSnkrsCalendarUrls(supabase);
if (snkrsResult.error) {
  console.error(snkrsResult.error);
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      registryUpdated: registryResult.data ?? 0,
      snkrs: snkrsResult.data,
    },
    null,
    2,
  ),
);
