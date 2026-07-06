import type { NotificationPhase } from "@/types/radar";

/** Supabase notification_logs 行型 */
export type NotificationLogRow = {
  id: string;
  user_id: string;
  sneaker_id: string;
  phase: NotificationPhase;
  title: string;
  body: string;
  action_url: string | null;
  read_at: string | null;
  created_at: string;
};

/** アプリ表示用 */
export type NotificationItem = {
  id: string;
  sneakerId: string;
  phase: NotificationPhase;
  title: string;
  body: string;
  actionUrl: string | null;
  readAt: Date | null;
  createdAt: Date;
};

export function rowToNotification(row: NotificationLogRow): NotificationItem {
  return {
    id: row.id,
    sneakerId: row.sneaker_id,
    phase: row.phase,
    title: row.title,
    body: row.body,
    actionUrl: row.action_url,
    readAt: row.read_at ? new Date(row.read_at) : null,
    createdAt: new Date(row.created_at),
  };
}
