"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import PreferenceForm from "@/components/radar/settings/PreferenceForm";
import { useAuthSession } from "@/hooks/useAuthSession";

export default function SettingsView() {
  const router = useRouter();
  const { user, loading, signOut } = useAuthSession();

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
    router.refresh();
  };

  return (
    <>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-black text-white lg:text-2xl">条件設定</h1>
          <p className="mt-2 text-sm text-slate-400">
            好みのブランドとサイズを登録すると、新作を自動でピックアップします。
          </p>
        </div>

        {!loading && user && (
          <div className="flex items-center gap-3">
            <p className="truncate text-xs text-slate-500">{user.email}</p>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="btn-press inline-flex items-center gap-1.5 rounded-lg border border-radar-border px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:border-red-500/50 hover:text-red-400"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              ログアウト
            </button>
          </div>
        )}
      </header>

      <PreferenceForm />
    </>
  );
}
