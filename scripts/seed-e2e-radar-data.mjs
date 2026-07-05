/**
 * E2E 用 Radar カタログ（release_date を current_date 基準で upsert）
 * 使い方: node scripts/seed-e2e-radar-data.mjs
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

function offsetDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
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

const FIXTURES = [
  {
    id: "11111111-1111-1111-1111-111111111101",
    external_id: "e2e-nike-rare",
    brand: "Nike",
    model_name: "Air Jordan 1 Retro High OG Chicago Reimagined",
    release_offset: 14,
    is_rare: true,
    is_collab: false,
  },
  {
    id: "11111111-1111-1111-1111-111111111102",
    external_id: "e2e-jordan-rare",
    brand: "Jordan",
    model_name: "Air Jordan 4 Retro Black Cat (2025)",
    release_offset: 21,
    is_rare: true,
    is_collab: false,
  },
  {
    id: "11111111-1111-1111-1111-111111111103",
    external_id: "e2e-converse-allstar",
    brand: "Converse",
    model_name: "Chuck Taylor All Star 70 Hi",
    release_offset: 28,
    is_rare: false,
    is_collab: false,
  },
  {
    id: "11111111-1111-1111-1111-111111111104",
    external_id: "e2e-nb-standard",
    brand: "New Balance",
    model_name: "990v6 Made in USA Grey",
    release_offset: 35,
    is_rare: false,
    is_collab: false,
  },
];

const imageUrl =
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop";

let categoryId = null;
const { data: category } = await supabase
  .from("radar_categories")
  .select("id")
  .eq("slug", "sneakers")
  .maybeSingle();

if (category?.id) categoryId = category.id;

let upserted = 0;

for (const fixture of FIXTURES) {
  const releaseDate = offsetDate(fixture.release_offset);
  const announceDate = offsetDate(fixture.release_offset - 14);
  const row = {
    id: fixture.id,
    brand: fixture.brand,
    model_name: fixture.model_name,
    image_url: imageUrl,
    announce_date: announceDate,
    release_date: releaseDate,
    phase: "upcoming",
    price: 20000,
    store_url: "https://stockx.com",
    description: "E2E fixture",
    source: "kicksdb",
    external_id: fixture.external_id,
    is_rare: fixture.is_rare,
    is_collab: fixture.is_collab,
    ...(categoryId ? { category_id: categoryId } : {}),
  };

  const { data: existing } = await supabase
    .from("radar_sneakers")
    .select("id")
    .eq("source", "kicksdb")
    .eq("external_id", fixture.external_id)
    .maybeSingle();

  const { error } = existing?.id
    ? await supabase.from("radar_sneakers").update(row).eq("id", existing.id)
    : await supabase.from("radar_sneakers").insert(row);

  if (error) {
    console.error(`Failed ${fixture.external_id}:`, error.message);
    continue;
  }
  upserted += 1;
}

console.log(JSON.stringify({ upserted, total: FIXTURES.length, categoryId }));
process.exit(upserted === FIXTURES.length ? 0 : 1);
