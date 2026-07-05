/**
 * KicksDB → Supabase 同期（Node 単体実行）
 * 使い方: node scripts/run-radar-sync.mjs
 *
 * 共有ロジック: supabase/functions/_shared/ + src/lib/kicksdb-map.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { register } from "tsx/esm/api";
import { createClient } from "@supabase/supabase-js";

register();

const { mapKicksDbProductToRow } = await import("../src/lib/kicksdb-map.ts");

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
const limit = Number(process.env.KICKSDB_SYNC_LIMIT ?? 20);
const mapOptions = {
  usdJpy: Number(process.env.KICKSDB_USD_JPY ?? 150),
  announceOffsetDays: Number(process.env.KICKSDB_ANNOUNCE_OFFSET_DAYS ?? 14),
};

if (!apiKey || !url || !serviceRole) {
  console.error("Missing KICKSDB_API_KEY, NEXT_PUBLIC_SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const params = new URLSearchParams({
  filters: 'product_type = "sneakers"',
  sort: "rank",
  limit: String(limit),
});

const response = await fetch(`https://api.kicks.dev/v3/stockx/products?${params}`, {
  headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
});

if (!response.ok) {
  console.error(await response.text());
  process.exit(1);
}

const json = await response.json();
const products = json.data ?? [];
const rows = products
  .map((product) => mapKicksDbProductToRow(product, mapOptions))
  .filter((row) => row !== null);

if (rows.length === 0) {
  console.log(
    JSON.stringify({
      fetched: products.length,
      upserted: 0,
      skipped: products.length,
      errors: ["No mappable rows"],
    }),
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let upserted = 0;
const errors = [];

for (const row of rows) {
  const { data: existing, error: selectError } = await supabase
    .from("radar_sneakers")
    .select("id")
    .eq("source", row.source)
    .eq("external_id", row.external_id)
    .maybeSingle();

  if (selectError) {
    errors.push(`Select failed (${row.external_id}): ${selectError.message}`);
    continue;
  }

  if (existing?.id) {
    const { error: updateError } = await supabase.from("radar_sneakers").update(row).eq("id", existing.id);
    if (updateError) {
      errors.push(`Update failed (${row.external_id}): ${updateError.message}`);
      continue;
    }
  } else {
    const { error: insertError } = await supabase.from("radar_sneakers").insert(row);
    if (insertError) {
      errors.push(`Insert failed (${row.external_id}): ${insertError.message}`);
      continue;
    }
  }

  upserted += 1;
}

console.log(
  JSON.stringify({
    fetched: products.length,
    upserted,
    skipped: products.length - rows.length,
    errors,
  }),
);
process.exit(errors.length > 0 && upserted === 0 ? 1 : 0);
