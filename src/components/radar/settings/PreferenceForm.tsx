"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Check, Cloud, Megaphone, Rocket } from "lucide-react";
import SelectChipGroup from "@/components/radar/settings/SelectChipGroup";
import {
  AVAILABLE_BRANDS,
  AVAILABLE_SIZES,
  MOCK_PREFERENCES,
} from "@/data/radar-mock";
import { useAuthSession } from "@/hooks/useAuthSession";
import {
  loadLocalPreferences,
  loadPreferencesForUser,
  saveLocalPreferences,
  savePreferencesForUser,
} from "@/lib/radar/preferences";
import type { UserPreferences } from "@/types/radar";

function NotificationToggle({
  label,
  description,
  icon: Icon,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  icon: typeof Megaphone;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-radar-border bg-radar-surface p-4 transition-colors has-[:checked]:border-radar-accent/50">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          checked ? "bg-radar-accent/20 text-radar-accent" : "bg-radar-muted text-slate-500"
        }`}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-white">{label}</span>
        <span className="mt-0.5 block text-xs text-slate-500">{description}</span>
      </span>
      <span
        className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
          checked ? "border-radar-accent bg-radar-accent text-radar-bg" : "border-slate-600"
        }`}
        aria-hidden="true"
      >
        {checked && <Check className="h-3 w-3" />}
      </span>
    </label>
  );
}

export default function PreferenceForm() {
  const { user, loading: authLoading } = useAuthSession();
  const [preferences, setPreferences] = useState<UserPreferences>(MOCK_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setPreferences(loadLocalPreferences());
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const { preferences: remote } = await loadPreferencesForUser(user.id);
        setPreferences(remote);
      } catch (err) {
        setError(err instanceof Error ? err.message : "条件設定の読み込みに失敗しました");
        setPreferences(loadLocalPreferences());
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [authLoading, user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (preferences.brands.length === 0) {
      setError("ブランドを1つ以上選択してください");
      return;
    }
    if (preferences.sizes.length === 0) {
      setError("サイズを1つ以上選択してください");
      return;
    }
    if (!preferences.notifyOnAnnouncement && !preferences.notifyOnRelease) {
      setError("通知タイミングを1つ以上有効にしてください");
      return;
    }

    if (!user) {
      saveLocalPreferences(preferences);
      setSaved(true);
      return;
    }

    try {
      await savePreferencesForUser(user.id, preferences);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "条件設定の保存に失敗しました");
    }
  };

  if (loading || authLoading) {
    return (
      <div className="rounded-2xl border border-radar-border bg-radar-surface px-4 py-12 text-center text-sm text-slate-500">
        読み込み中...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Cloud className="h-3.5 w-3.5 text-radar-accent" aria-hidden="true" />
        {user ? (
          <>Supabase に保存（{user.email}）</>
        ) : (
          <>ブラウザに保存（ログインすると Supabase と同期）</>
        )}
      </div>

      <section className="rounded-2xl border border-radar-border bg-radar-surface p-5">
        <SelectChipGroup
          label="ブランド / メーカー"
          description="選択したブランドの新作のみ自動ピックアップします"
          options={AVAILABLE_BRANDS}
          selected={preferences.brands}
          onChange={(brands) => setPreferences((prev) => ({ ...prev, brands }))}
        />
      </section>

      <section className="rounded-2xl border border-radar-border bg-radar-surface p-5">
        <SelectChipGroup
          label="サイズ（cm）"
          description="在庫・抽選情報のフィルターに使用します"
          options={AVAILABLE_SIZES}
          selected={preferences.sizes}
          onChange={(sizes) => setPreferences((prev) => ({ ...prev, sizes }))}
          formatOption={(size) => `${size} cm`}
        />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-bold text-white">2段階通知</h2>
          <p className="mt-1 text-xs text-slate-500">
            発表時と発売当日のどちらで通知を受け取るか選べます
          </p>
        </div>
        <NotificationToggle
          label="新作発表通知"
          description="モデル発表・情報解禁のタイミングでプッシュ通知"
          icon={Megaphone}
          checked={preferences.notifyOnAnnouncement}
          onChange={(notifyOnAnnouncement) =>
            setPreferences((prev) => ({ ...prev, notifyOnAnnouncement }))
          }
        />
        <NotificationToggle
          label="発売当日通知"
          description="抽選・発売開始の当日にプッシュ通知"
          icon={Rocket}
          checked={preferences.notifyOnRelease}
          onChange={(notifyOnRelease) =>
            setPreferences((prev) => ({ ...prev, notifyOnRelease }))
          }
        />
      </section>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {error}
        </p>
      )}
      {saved && (
        <p
          role="status"
          className="rounded-xl border border-radar-accent/30 bg-radar-accent/10 px-4 py-3 text-sm text-radar-accent"
        >
          条件を{user ? " Supabase に" : ""}保存しました
        </p>
      )}

      <button
        type="submit"
        className="btn-press min-h-[48px] w-full rounded-xl bg-radar-accent py-3 text-sm font-bold text-radar-bg transition-colors hover:bg-radar-accent-hover"
      >
        条件を保存する
      </button>
    </form>
  );
}
