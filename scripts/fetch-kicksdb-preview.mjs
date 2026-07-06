/**
 * KicksDB クエリ診断（開発用）
 * 使い方: node scripts/fetch-kicksdb-preview.mjs [--probe]
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  const content = readFileSync(path, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx);
    const value = trimmed.slice(idx + 1);
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const apiKey = process.env.KICKSDB_API_KEY;
if (!apiKey) {
  console.error("KICKSDB_API_KEY missing");
  process.exit(1);
}

const probe = process.argv.includes("--probe");

async function fetchProducts(queryString) {
  const response = await fetch(`https://api.kicks.dev/v3/stockx/products?${queryString}`, {
    headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
  });
  const body = await response.text();
  if (!response.ok) {
    return { ok: false, status: response.status, body: body.slice(0, 300) };
  }
  const json = JSON.parse(body);
  return {
    ok: true,
    count: json.data?.length ?? 0,
    total: json.meta?.total ?? 0,
    sample: json.data?.[0],
  };
}

if (probe) {
  const cases = [
    ["limit only", "limit=5"],
    ["query jordan", "limit=5&query=Jordan"],
    ["query adidas", "limit=5&query=Adidas"],
    ["query new balance", "limit=5&query=New Balance"],
    [
      "wide release dates",
      `limit=5&filters=${encodeURIComponent('release_date >= "2025-01-01" AND release_date <= "2026-12-31"')}`,
    ],
    ["sneakers type", `limit=5&filters=${encodeURIComponent('product_type = "sneakers"')}`],
  ];

  for (const [name, qs] of cases) {
    const result = await fetchProducts(qs);
    console.log(name, result);
  }
  process.exit(0);
}

const daysAhead = Number(process.env.KICKSDB_SYNC_DAYS_AHEAD ?? 30);
const daysBehind = Number(process.env.KICKSDB_SYNC_DAYS_BEHIND ?? 3);
const limit = Number(process.env.KICKSDB_SYNC_LIMIT ?? 20);

function formatIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

const today = new Date();
const start = new Date(today);
start.setDate(start.getDate() - daysBehind);
const end = new Date(today);
end.setDate(end.getDate() + daysAhead);

const filters = `release_date >= "${formatIsoDate(start)}" AND release_date <= "${formatIsoDate(end)}" AND product_type = "sneakers"`;
const params = new URLSearchParams({ filters, sort: "release_date", limit: String(limit) });

const result = await fetchProducts(params.toString());
console.log(JSON.stringify(result, null, 2));
