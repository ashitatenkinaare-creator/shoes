/**
 * 評価用デモアカウント（条件設定・ウォッチリスト・通知サンプル）を upsert
 * 使い方: node scripts/seed-demo-account.mjs
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const DEMO_EMAIL = "demo@sneaker-radar.app";
const DEMO_PASSWORD = "DemoPass1234";

const SNEAKER_IDS = {
  nikeRare: "11111111-1111-1111-1111-111111111101",
  jordanRare: "11111111-1111-1111-1111-111111111102",
};

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

async function findUserIdByEmail(admin, email) {
  let page = 1;
  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(error.message);
    const user = data.users.find((entry) => entry.email === email);
    if (user) return user.id;
    if (data.users.length < 200) break;
    page += 1;
  }
  return null;
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRole) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let userId = await findUserIdByEmail(admin, DEMO_EMAIL);

if (!userId) {
  const { data, error } = await admin.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
  });
  if (error) {
    console.error("Failed to create demo user:", error.message);
    process.exit(1);
  }
  userId = data.user.id;
} else {
  const { error } = await admin.auth.admin.updateUserById(userId, {
    password: DEMO_PASSWORD,
    email_confirm: true,
  });
  if (error) {
    console.error("Failed to update demo user:", error.message);
    process.exit(1);
  }
}

const { error: prefError } = await admin.from("user_preferences").upsert(
  {
    user_id: userId,
    brands: ["Nike", "Jordan", "New Balance", "Converse"],
    sizes: ["27.0", "27.5", "28.0"],
    silhouettes: [],
    collab_brands: [],
    notify_on_announcement: true,
    notify_on_release: true,
    filter_rare: false,
    filter_collab: false,
  },
  { onConflict: "user_id" },
);

if (prefError) {
  console.error("Failed to seed preferences:", prefError.message);
  process.exit(1);
}

await admin.from("watchlist").delete().eq("user_id", userId);

const { error: watchError } = await admin.from("watchlist").insert([
  { user_id: userId, sneaker_id: SNEAKER_IDS.nikeRare },
  { user_id: userId, sneaker_id: SNEAKER_IDS.jordanRare },
]);

if (watchError) {
  console.error("Failed to seed watchlist:", watchError.message);
  process.exit(1);
}

await admin.from("notification_logs").delete().eq("user_id", userId);

const { error: notifError } = await admin.from("notification_logs").insert([
  {
    user_id: userId,
    sneaker_id: SNEAKER_IDS.nikeRare,
    phase: "announcement",
    title: "【本日発表】Nikeから2週間後に新作コラボが発売決定！公式ニュースをチェックしよう",
    body: "Nike の新作コラボが発表されました。公式ニュースをチェックしよう。",
    action_url: "https://www.nike.com/jp/launch",
    read_at: null,
  },
  {
    user_id: userId,
    sneaker_id: SNEAKER_IDS.jordanRare,
    phase: "announcement",
    title: "【本日発表】Jordanから3週間後に新作コラボが発売決定！公式ニュースをチェックしよう",
    body: "Jordan の新作コラボが発表されました。公式ニュースをチェックしよう。",
    action_url: "https://www.nike.com/jp/launch",
    read_at: null,
  },
  {
    user_id: userId,
    sneaker_id: SNEAKER_IDS.jordanRare,
    phase: "lottery_open",
    title:
      "【販売・抽選ページ開設！】Air Jordan 4 Retro Black Cat (2025)の抽選受付が開始されました。今すぐエントリーしよう！",
    body: "Jordan Air Jordan 4 Retro Black Cat (2025) の抽選・購入ページが公開されました。",
    action_url: "https://www.nike.com/jp/launch/t/black-cat-demo",
    read_at: null,
  },
]);

if (notifError) {
  console.error("Failed to seed notifications:", notifError.message);
  process.exit(1);
}

console.log(
  JSON.stringify({
    ok: true,
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    userId,
    watchlist: 2,
    notifications: 3,
  }),
);
