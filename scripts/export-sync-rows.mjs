/** マップ結果を JSON 出力（DB upsert 前の確認用） */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  for (const line of readFileSync(resolve(process.cwd(), ".env.local"), "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    if (!process.env[trimmed.slice(0, idx)]) process.env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
  }
}

loadEnvLocal();

const USD_JPY = 150;
const ANNOUNCE_OFFSET = 14;
const LIMIT = 20;

function formatIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function computePhase(releaseDate, today = new Date()) {
  if (releaseDate === formatIsoDate(today)) return "today";
  const diffDays = (new Date(`${releaseDate}T00:00:00`).getTime() - today.getTime()) / 86400000;
  if (diffDays > 0 && diffDays <= 7) return "upcoming";
  return "announced";
}

function computeAnnounceDate(releaseDate) {
  const d = new Date(`${releaseDate}T00:00:00`);
  d.setDate(d.getDate() - ANNOUNCE_OFFSET);
  return formatIsoDate(d);
}

function resolveReleaseDate(product) {
  if (product.release_date && /^\d{4}-\d{2}-\d{2}/.test(String(product.release_date))) {
    return String(product.release_date).slice(0, 10);
  }
  const dropped = (product.description ?? "").match(/(?:dropped|released)\s+on\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})/i);
  if (dropped?.[1]) {
    const parsed = new Date(dropped[1]);
    if (!Number.isNaN(parsed.getTime())) return formatIsoDate(parsed);
  }
  const year = (product.title ?? "").match(/\((20\d{2})\)/);
  if (year?.[1] && Number(year[1]) >= new Date().getFullYear()) return `${year[1]}-07-01`;
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
  return {
    source: "kicksdb",
    external_id: product.slug,
    brand: product.brand ?? "Unknown",
    model_name: product.title ?? product.slug,
    image_url: product.image ?? "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop",
    announce_date: computeAnnounceDate(releaseDate),
    release_date: releaseDate,
    phase: computePhase(releaseDate),
    price,
    store_url: product.link ?? `https://stockx.com/${product.slug}`,
    description: (product.description ?? "").slice(0, 2000),
    colorway: product.colorway ?? "",
    sku: product.sku ?? "",
  };
}

const apiKey = process.env.KICKSDB_API_KEY;
const params = new URLSearchParams({ filters: 'product_type = "sneakers"', sort: "rank", limit: String(LIMIT) });
const response = await fetch(`https://api.kicks.dev/v3/stockx/products?${params}`, {
  headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
});
const json = await response.json();
const rows = (json.data ?? []).map(mapProduct).filter(Boolean);
writeFileSync("scripts/.sync-rows.json", JSON.stringify(rows, null, 2));
console.log(JSON.stringify({ fetched: json.data?.length ?? 0, mapped: rows.length, sample: rows[0]?.model_name }, null, 2));
