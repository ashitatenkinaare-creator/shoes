/**
 * KicksDB → Supabase 同期（Node 単体実行）
 * 使い方: node scripts/run-radar-sync.mjs
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { register } from "tsx/esm/api";
import { createClient } from "@supabase/supabase-js";

register();

const { buildSyncOptions, syncRadarReleases } = await import("../src/lib/radar/kicksdb-sync.ts");

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

const apiKey = process.env.KICKSDB_API_KEY;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!apiKey || !url || !serviceRole) {
  console.error("Missing KICKSDB_API_KEY, NEXT_PUBLIC_SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const result = await syncRadarReleases(supabase, buildSyncOptions(apiKey));
console.log(JSON.stringify(result, null, 2));
process.exit(result.errors.length > 0 && result.upserted === 0 ? 1 : 0);
