/**
 * デモ用シードカタログを Supabase から削除
 * 使い方: node scripts/remove-seed-radar-data.mjs
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const SEED_IDS = [
  "11111111-1111-4111-8111-111111110001",
  "11111111-1111-4111-8111-111111110002",
  "11111111-1111-4111-8111-111111110003",
  "11111111-1111-4111-8111-111111110004",
];

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
  console.error("NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY が必要です (.env.local)");
  process.exit(1);
}

const supabase = createClient(url, serviceRole);

const { error: watchlistError } = await supabase
  .from("watchlist")
  .delete()
  .in("sneaker_id", SEED_IDS);

if (watchlistError) {
  console.error(JSON.stringify({ step: "watchlist", error: watchlistError.message }));
  process.exit(1);
}

const { count, error: sneakersError } = await supabase
  .from("radar_sneakers")
  .delete({ count: "exact" })
  .or(`source.eq.seed,id.in.(${SEED_IDS.join(",")})`);

if (sneakersError) {
  console.error(JSON.stringify({ step: "radar_sneakers", error: sneakersError.message }));
  process.exit(1);
}

console.log(JSON.stringify({ deletedSeedSneakers: count ?? 0 }, null, 2));
