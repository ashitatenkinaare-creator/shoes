import { createClient } from "@supabase/supabase-js";
import { loadEnvLocal } from "./env";

/** E2E シード `scripts/seed-e2e-radar-data.mjs` の固定 ID */
export const E2E_SNEAKER_IDS = {
  nikeRare: "11111111-1111-1111-1111-111111111101",
  jordanRare: "11111111-1111-1111-1111-111111111102",
} as const;

export const E2E_NOTIFICATION_URLS = {
  news: "https://www.nike.com/jp/launch/t/e2e-chicago-reimagined-demo",
  lottery: "https://www.nike.com/jp/launch/t/black-cat-demo",
} as const;

function getAdminClient() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "notification-setup requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** 2段階通知 E2E 用: ウォッチリスト・通知設定・既存通知を整える */
export async function setupTwoPhaseNotificationFixtures(userId: string): Promise<void> {
  const admin = getAdminClient();

  const { error: watchDeleteError } = await admin.from("watchlist").delete().eq("user_id", userId);
  if (watchDeleteError) {
    throw new Error(`Failed to reset watchlist: ${watchDeleteError.message}`);
  }

  const { error: watchInsertError } = await admin.from("watchlist").insert([
    { user_id: userId, sneaker_id: E2E_SNEAKER_IDS.nikeRare },
    { user_id: userId, sneaker_id: E2E_SNEAKER_IDS.jordanRare },
  ]);
  if (watchInsertError) {
    throw new Error(`Failed to seed watchlist: ${watchInsertError.message}`);
  }

  const { error: prefError } = await admin.from("user_preferences").upsert(
    {
      user_id: userId,
      brands: ["Nike", "Jordan", "New Balance"],
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
    throw new Error(`Failed to seed preferences: ${prefError.message}`);
  }

  const { error: notifDeleteError } = await admin
    .from("notification_logs")
    .delete()
    .eq("user_id", userId);
  if (notifDeleteError) {
    throw new Error(`Failed to reset notifications: ${notifDeleteError.message}`);
  }
}
