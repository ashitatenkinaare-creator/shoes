/**
 * KicksDB → Supabase 同期（Node 単体実行）
 * 使い方: node scripts/run-radar-sync.mjs
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

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

const USD_JPY = Number(process.env.KICKSDB_USD_JPY ?? 150);
const ANNOUNCE_OFFSET = Number(process.env.KICKSDB_ANNOUNCE_OFFSET_DAYS ?? 14);
const LIMIT = Number(process.env.KICKSDB_SYNC_LIMIT ?? 20);

function formatIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function computePhase(releaseDate, today = new Date()) {
  if (releaseDate === formatIsoDate(today)) return "today";
  const release = new Date(`${releaseDate}T00:00:00`);
  const diffDays = (release.getTime() - today.getTime()) / 86400000;
  if (diffDays > 0 && diffDays <= 7) return "upcoming";
  return "announced";
}

function computeAnnounceDate(releaseDate) {
  const d = new Date(`${releaseDate}T00:00:00`);
  d.setDate(d.getDate() - ANNOUNCE_OFFSET);
  return formatIsoDate(d);
}

function resolveReleaseDate(product) {
  if (product.release_date) {
    const raw = String(product.release_date);
    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  }

  const desc = product.description ?? "";
  const dropped = desc.match(/(?:dropped|released)\s+on\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})/i);
  if (dropped?.[1]) {
    const parsed = new Date(dropped[1]);
    if (!Number.isNaN(parsed.getTime())) return formatIsoDate(parsed);
  }

  const title = product.title ?? "";
  const year = title.match(/\((20\d{2})\)/);
  if (year?.[1] && Number(year[1]) >= new Date().getFullYear()) {
    return `${year[1]}-07-01`;
  }

  if (product.created_at) return formatIsoDate(new Date(product.created_at));
  return null;
}

function mapProduct(product) {
  if (!product.slug) return null;
  const releaseDate = resolveReleaseDate(product);
  if (!releaseDate) return null;

  const retailMatch = (product.description ?? "").match(/retailed for \$(\d+(?:\.\d+)?)/i);
  const retailUsd = retailMatch ? Number(retailMatch[1]) : null;
  let price = 18000;
  if (retailUsd) price = Math.round(retailUsd * USD_JPY);
  else if (product.min_price) price = Math.round(product.min_price * USD_JPY);

  const brand = product.brand ?? "Unknown";
  const modelName = product.title ?? product.slug;

  return {
    source: "kicksdb",
    external_id: product.slug,
    brand,
    model_name: modelName,
    image_url: product.image ?? "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop",
    announce_date: computeAnnounceDate(releaseDate),
    release_date: releaseDate,
    phase: computePhase(releaseDate),
    price,
    store_url: product.link ?? `https://stockx.com/${product.slug}`,
    description: (product.description ?? `${brand} ${modelName}`).slice(0, 2000),
    colorway: product.colorway ?? "",
    sku: product.sku ?? "",
  };
}

const apiKey = process.env.KICKSDB_API_KEY;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!apiKey || !url || !serviceRole) {
  console.error("Missing KICKSDB_API_KEY, NEXT_PUBLIC_SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const params = new URLSearchParams({
  filters: 'product_type = "sneakers"',
  sort: "rank",
  limit: String(LIMIT),
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
const rows = products.map(mapProduct).filter(Boolean);

if (rows.length === 0) {
  console.log(JSON.stringify({ fetched: products.length, upserted: 0, skipped: products.length, errors: ["No mappable rows"] }));
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

console.log(JSON.stringify({ fetched: products.length, upserted, skipped: products.length - rows.length, errors }));
process.exit(errors.length > 0 && upserted === 0 ? 1 : 0);
