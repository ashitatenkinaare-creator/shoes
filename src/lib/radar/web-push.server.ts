import type { SupabaseClient } from "@supabase/supabase-js";
import webpush from "web-push";

type PushPayload = {
  title: string;
  body: string;
  url: string;
};

type PushSubscriptionRow = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

let vapidConfigured = false;

function configureVapid(): boolean {
  if (vapidConfigured) return true;

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:demo@sneaker-radar.app";

  if (!publicKey || !privateKey) return false;

  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
  return true;
}

export function isWebPushConfigured(): boolean {
  return configureVapid();
}

export function getVapidPublicKey(): string | null {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? process.env.VAPID_PUBLIC_KEY ?? null;
}

/** 新規通知に対して Web Push を送信（VAPID 未設定時は no-op） */
export async function sendWebPushForUser(
  supabase: SupabaseClient,
  userId: string,
  payloads: PushPayload[],
): Promise<{ sent: number; failed: number }> {
  if (payloads.length === 0 || !configureVapid()) {
    return { sent: 0, failed: 0 };
  }

  const { data: rows, error } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (error || !rows?.length) {
    return { sent: 0, failed: 0 };
  }

  let sent = 0;
  let failed = 0;

  for (const row of rows as PushSubscriptionRow[]) {
    const subscription = {
      endpoint: row.endpoint,
      keys: { p256dh: row.p256dh, auth: row.auth },
    };

    for (const payload of payloads) {
      try {
        await webpush.sendNotification(
          subscription,
          JSON.stringify({
            title: payload.title,
            body: payload.body,
            url: payload.url,
          }),
        );
        sent += 1;
      } catch {
        failed += 1;
      }
    }
  }

  return { sent, failed };
}
