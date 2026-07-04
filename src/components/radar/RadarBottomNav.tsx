"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, List, LogIn, Settings } from "lucide-react";
import { useAuthSession } from "@/hooks/useAuthSession";

const navItems = [
  { href: "/dashboard", label: "ホーム", icon: LayoutDashboard },
  { href: "/watchlist", label: "ウォッチ", icon: List },
  { href: "/settings", label: "条件", icon: Settings },
];

export default function RadarBottomNav() {
  const pathname = usePathname();
  const path = pathname ?? "";
  const { user, loading } = useAuthSession();

  const isActive = (href: string) => {
    if (href === "/dashboard") return path === "/dashboard";
    return path.startsWith(href);
  };

  return (
    <nav
      className="fixed right-0 bottom-0 left-0 z-50 border-t border-radar-border bg-radar-surface/95 backdrop-blur-md lg:hidden"
      aria-label="メインナビゲーション"
    >
      <div className="mx-auto flex max-w-lg">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
              isActive(href) ? "text-radar-accent" : "text-slate-500"
            }`}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            {label}
          </Link>
        ))}
        {!loading && !user && (
          <Link
            href="/auth"
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
              path.startsWith("/auth") ? "text-radar-accent" : "text-slate-500"
            }`}
          >
            <LogIn className="h-5 w-5" aria-hidden="true" />
            ログイン
          </Link>
        )}
      </div>
    </nav>
  );
}
