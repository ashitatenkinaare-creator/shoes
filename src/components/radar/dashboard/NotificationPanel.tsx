"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Megaphone, Rocket, X } from "lucide-react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { getPhaseLabel } from "@/lib/radar/notifications";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  sendDemoNotification,
  syncNotifications,
} from "@/lib/radar/notifications-db";
import type { NotificationItem } from "@/types/notification";

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const { user } = useAuthSession();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    await syncNotifications(user.id);
    const { data, error: fetchError } = await fetchNotifications(user.id);

    setLoading(false);
    if (fetchError) {
      setError(fetchError);
      return;
    }
    setItems(data ?? []);
  }, [user]);

  useEffect(() => {
    if (open && user) void load();
  }, [load, open, user]);

  const unreadCount = items.filter((n) => !n.readAt).length;

  const handleMarkRead = async (id: string) => {
    if (!user) return;
    await markNotificationRead(user.id, id);
    void load();
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllNotificationsRead(user.id);
    void load();
  };

  const handleDemoSend = async () => {
    if (!user) return;
    const { error: demoError } = await sendDemoNotification(user.id);
    if (demoError) {
      setError(demoError);
      return;
    }
    void load();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div
        role="dialog"
        aria-label="通知一覧"
        className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-radar-border bg-radar-surface shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-radar-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-radar-accent" aria-hidden="true" />
            <h2 className="font-bold text-white">通知</h2>
            {unreadCount > 0 && (
              <span className="rounded-full bg-radar-accent px-2 py-0.5 text-[10px] font-bold text-radar-bg">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="rounded-lg p-1 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!user ? (
          <div className="p-6 text-center text-sm text-slate-400">
            <p>ログインすると2段階通知（発表 / 発売）を受け取れます。</p>
            <Link
              href="/auth?redirect=/dashboard"
              className="mt-4 inline-block font-semibold text-radar-accent hover:underline"
            >
              ログイン / 新規登録
            </Link>
          </div>
        ) : (
          <>
            <div className="flex gap-2 border-b border-radar-border px-4 py-2">
              <button
                type="button"
                onClick={() => void handleMarkAllRead()}
                className="text-[11px] font-medium text-slate-400 hover:text-radar-accent"
              >
                すべて既読
              </button>
              <button
                type="button"
                onClick={() => void handleDemoSend()}
                className="text-[11px] font-medium text-slate-400 hover:text-radar-accent"
              >
                デモ通知を送信
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loading && (
                <p className="text-center text-sm text-slate-500">読み込み中...</p>
              )}
              {error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                  {error}
                </p>
              )}
              {!loading && items.length === 0 && (
                <p className="text-center text-sm text-slate-500">
                  通知はありません。ウォッチリストにモデルを追加してください。
                </p>
              )}
              <ul className="space-y-3">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className={`rounded-xl border p-3 ${
                      item.readAt
                        ? "border-radar-border bg-radar-muted/30 opacity-70"
                        : "border-radar-accent/30 bg-radar-accent/5"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {item.phase === "announcement" ? (
                        <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-radar-accent" />
                      ) : (
                        <Rocket className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-radar-accent">
                          {getPhaseLabel(item.phase)}
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-white">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-400">{item.body}</p>
                        {!item.readAt && (
                          <button
                            type="button"
                            onClick={() => void handleMarkRead(item.id)}
                            className="mt-2 text-[11px] font-medium text-radar-accent hover:underline"
                          >
                            既読にする
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
