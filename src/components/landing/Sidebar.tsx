"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SIDEBAR_BRANDS, brandFilterHref } from "@/data/drops";
import type { BrandFilter } from "@/types/drop";

interface SidebarProps {
  activeBrand?: BrandFilter;
}

export default function Sidebar({ activeBrand = "all" }: SidebarProps) {
  const pathname = usePathname();
  const path = pathname ?? "";

  return (
    <>
      <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-800 bg-slate-950 lg:flex">
        <div className="border-b border-slate-800 px-6 py-6">
          <Link href="/" className="text-lg font-black tracking-[0.15em] text-drop-orange">
            SNEAKERDROP
          </Link>
        </div>

        <div className="border-b border-slate-800 px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-full bg-slate-700" />
            <div>
              <p className="text-xs font-bold text-white">HYPEBEAST_01</p>
              <p className="text-[10px] tracking-wide text-slate-500 uppercase">Lv.4 コレクター</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3" aria-label="ブランドフィルター">
          {SIDEBAR_BRANDS.map((brand) => (
            <Link
              key={brand.id}
              href={brandFilterHref(brand.id, path)}
              className={`block rounded-lg px-4 py-3 text-xs font-bold tracking-wider transition-colors ${
                activeBrand === brand.id && (path.startsWith("/vault") || path === "/")
                  ? "bg-drop-orange text-black"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              {brand.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-3">
          <Link
            href="/auth"
            className="block rounded-lg px-4 py-3 text-xs font-bold tracking-wider text-slate-400 transition-colors hover:bg-slate-900 hover:text-white"
          >
            ログイン / 新規登録
          </Link>
        </div>
      </aside>

      <nav
        className="fixed right-0 bottom-0 left-0 z-40 flex border-t border-slate-800 bg-slate-950/95 backdrop-blur-md lg:hidden"
        aria-label="モバイルナビ"
      >
        <Link
          href="/"
          className={`flex flex-1 flex-col items-center py-2 text-[9px] font-bold tracking-wide ${
            path === "/" ? "text-drop-orange" : "text-slate-500"
          }`}
        >
          ホーム
        </Link>
        <Link
          href="/vault"
          className={`flex flex-1 flex-col items-center py-2 text-[9px] font-bold tracking-wide ${
            path.startsWith("/vault") ? "text-drop-orange" : "text-slate-500"
          }`}
        >
          アーカイブ
        </Link>
        <Link
          href="/auth"
          className={`flex flex-1 flex-col items-center py-2 text-[9px] font-bold tracking-wide ${
            path === "/auth" ? "text-drop-orange" : "text-slate-500"
          }`}
        >
          登録
        </Link>
        <Link
          href="/sneakers"
          className="flex flex-1 flex-col items-center py-2 text-[9px] font-bold tracking-wide text-slate-500"
        >
          管理
        </Link>
      </nav>
    </>
  );
}
