/**
 * Radar カテゴリを登録
 * 使い方: node scripts/register-radar-category.mjs --slug apparel --label アパレル
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { register } from "tsx/esm/api";
import { createClient } from "@supabase/supabase-js";

register();

const { registerRadarCategory } = await import("../src/lib/radar/categories-db.ts");

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

function parseArgs(argv) {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i]?.startsWith("--") && argv[i + 1]) {
      args[argv[i].slice(2)] = argv[i + 1];
      i += 1;
    }
  }
  return args;
}

loadEnvLocal();

const args = parseArgs(process.argv.slice(2));
const slug = args.slug;
const label = args.label;
const description = args.description ?? "";
const sortOrder = args.sortOrder ? Number(args.sortOrder) : 0;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!slug || !label) {
  console.error("Usage: node scripts/register-radar-category.mjs --slug apparel --label アパレル [--description ...] [--sortOrder 10]");
  process.exit(1);
}

if (!url || !serviceRole) {
  console.error("NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY が必要です (.env.local)");
  process.exit(1);
}

const supabase = createClient(url, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await registerRadarCategory(supabase, {
  slug,
  label,
  description,
  sortOrder,
});

if (error) {
  console.error(JSON.stringify({ error }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ category: data }, null, 2));
