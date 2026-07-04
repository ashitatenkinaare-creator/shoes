"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LayoutDashboard, List, LogIn, LogOut, Radar, Settings } from "lucide-react";
import { useAuthSession } from "@/hooks/useAuthSession";

const navItems = [
  { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/watchlist", label: "ウォッチリスト", icon: List },
  { href: "/settings", label: "条件設定", icon: Settings },
];

export default function RadarSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const path = pathname ?? "";
  const { user, loading, signOut } = useAuthSession();

  const handleSignOut = async () => {
    await signOut();
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-radar-border bg-radar-surface lg:flex">
      <div className="border-b border-radar-border px-5 py-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Radar className="h-6 w-6 text-radar-accent" aria-hidden="true" />
          <div>
            <p className="text-sm font-black tracking-wide text-white">Sneaker Radar</p>
            <p className="text-[10px] text-slate-500">新作を逃さないパートナー</p>
          </div>
        </Link>
      </div>

      {!loading && user && (
        <div className="border-b border-radar-border px-4 py-4">
          <p className="truncate text-xs font-medium text-white">{user.email}</p>
          <p className="mt-0.5 text-[10px] text-radar-accent">ログイン中</p>
        </div>
      )}

      <nav className="flex-1 space-y-1 p-3" aria-label="サイドナビ">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== "/dashboard" && path.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-radar-accent/15 text-radar-accent"
                  : "text-slate-400 hover:bg-radar-muted hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {label}
            </Link>
          );
        })}

        {!loading &&
          (user ? (
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-radar-muted hover:text-red-400"
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
              ログアウト
            </button>
          ) : (
            <Link
              href="/auth"
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                path.startsWith("/auth")
                  ? "bg-radar-accent/15 text-radar-accent"
                  : "text-slate-400 hover:bg-radar-muted hover:text-white"
              }`}
            >
              <LogIn className="h-4 w-4 shrink-0" aria-hidden="true" />
              ログイン / 登録
            </Link>
          ))}
      </nav>

      <div className="border-t border-radar-border p-4">
        <div className="flex items-center gap-2 rounded-lg bg-radar-muted px-3 py-2 text-xs text-slate-400">
          <Bell className="h-4 w-4 text-radar-accent" aria-hidden="true" />
          2段階通知: 発表 / 発売
        </div>
      </div>
    </aside>
  );
}
