import type { NotificationPhase } from "@/types/radar";

/** Supabase notification_logs 行型 */
export type NotificationLogRow = {
  id: string;
  user_id: string;
  sneaker_id: string;
  phase: NotificationPhase;
  title: string;
  body: string;
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
    readAt: row.read_at ? new Date(row.read_at) : null,
    createdAt: new Date(row.created_at),
  };
}
