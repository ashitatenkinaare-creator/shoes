"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, User } from "lucide-react";
import type { NavPage } from "@/types/drop";

const navItems: { label: string; href: string; key: NavPage }[] = [
  { label: "LAUNCHES", href: "/", key: "launches" },
  { label: "UPCOMING", href: "/#upcoming", key: "upcoming" },
  { label: "ARCHIVE", href: "/vault", key: "vault" },
];

interface HeaderProps {
  activeNav?: NavPage;
}

export default function Header({ activeNav = "launches" }: HeaderProps) {
  const pathname = usePathname();

  const isActive = (key: NavPage, href: string) => {
    const path = pathname ?? "";
    if (activeNav === key) return true;
    if (key === "launches" && path === "/") return true;
    if (key === "vault" && path.startsWith("/vault")) return true;
    if (key === "vault" && path.startsWith("/drops")) return true;
    return false;
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950 px-4 lg:px-8">
      <Link
        href="/"
        className="text-sm font-black tracking-[0.2em] text-drop-orange lg:hidden"
      >
        SNEAKERDROP
      </Link>

      <nav className="hidden flex-1 items-center justify-center gap-10 lg:flex" aria-label="トップナビ">
        {navItems.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={`text-xs font-semibold tracking-widest transition-colors ${
              isActive(item.key, item.href)
                ? "border-b-2 border-drop-orange pb-1 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <Link
          href="/sneakers"
          className="hidden text-xs font-medium text-slate-500 transition-colors hover:text-drop-orange sm:inline"
        >
          管理
        </Link>
        <Link
          href="/register"
          className="hidden text-xs font-medium text-slate-500 transition-colors hover:text-drop-orange sm:inline"
        >
          Join
        </Link>
        <button
          type="button"
          className="rounded-lg p-2 text-slate-400 transition-colors hover:text-white"
          aria-label="通知"
        >
          <Bell className="h-5 w-5" />
        </button>
        <Link
          href="/register"
          className="rounded-lg p-2 text-slate-400 transition-colors hover:text-white"
          aria-label="プロフィール"
        >
          <User className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
}
