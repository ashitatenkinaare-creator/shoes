"use client";

import { useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { isWebPushSupported, subscribeToWebPush } from "@/lib/radar/web-push-client";
import { useAuthSession } from "@/hooks/useAuthSession";

export default function WebPushPanel() {
  const { user, loading } = useAuthSession();
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading || !user) return null;

  if (!isWebPushSupported()) {
    return (
      <section className="rounded-2xl border border-radar-border bg-radar-surface p-5">
        <h2 className="text-sm font-bold text-white">ブラウザ通知（Web Push）</h2>
        <p className="mt-2 text-xs text-slate-500">このブラウザは Web Push に対応していません。</p>
      </section>
    );
  }

  const handleSubscribe = async () => {
    setBusy(true);
    setStatus(null);

    const result = await subscribeToWebPush();

    const messages: Record<string, string> = {
      subscribed: "ブラウザ通知を有効にしました。第1弾・第2弾の通知が届きます。",
      denied: "通知が拒否されました。ブラウザのサイト設定から許可してください。",
      "not-configured": "サーバー側の Web Push 設定（VAPID）が未設定です。",
      unsupported: "このブラウザは Web Push に対応していません。",
      error: "購読の登録に失敗しました。しばらくしてから再度お試しください。",
    };

    setStatus(messages[result] ?? messages.error);
    setBusy(false);
  };

  return (
    <section className="rounded-2xl border border-radar-border bg-radar-surface p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-bold text-white">ブラウザ通知（Web Push）</h2>
          <p className="mt-1 text-xs text-slate-500">
            アプリを閉じていても、公式発表（第1弾）・抽選ページ開設（第2弾）を OS
            通知で受け取れます。
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleSubscribe()}
          className="btn-press inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-radar-accent/40 bg-radar-accent/10 px-4 py-2.5 text-sm font-bold text-radar-accent transition-colors hover:bg-radar-accent/20 disabled:opacity-50"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          {busy ? "設定中..." : "ブラウザ通知を有効にする"}
        </button>
      </div>

      {status && (
        <p
          role="status"
          className={`mt-4 flex items-start gap-2 rounded-xl px-4 py-3 text-xs ${
            status.includes("有効")
              ? "border border-radar-accent/30 bg-radar-accent/10 text-radar-accent"
              : "border border-slate-600 bg-radar-muted text-slate-400"
          }`}
        >
          {status.includes("有効") ? (
            <Bell className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          ) : (
            <BellOff className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          )}
          {status}
        </p>
      )}
    </section>
  );
}
