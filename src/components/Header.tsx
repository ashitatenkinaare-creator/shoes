import { useState } from "react";

const navItems = [
  { label: "ホーム", href: "#top" },
  { label: "発売日カレンダー", href: "#calendar" },
  { label: "ブランド一覧", href: "#brands" },
];

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border-dark bg-black/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={scrollToTop}
            className="group flex shrink-0 items-center gap-2"
            aria-label="トップページへ戻る"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5 text-black"
                aria-hidden="true"
              >
                <path
                  d="M4 18L12 6L20 18H4Z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="text-xl font-black tracking-tight text-white transition-colors group-hover:text-neon">
              SneakerDrop
            </span>
          </button>

          <div className="flex flex-1 items-center justify-end gap-3 sm:gap-4">
            <div className="relative hidden max-w-xs flex-1 sm:block lg:max-w-sm">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
                />
              </svg>
              <input
                type="search"
                placeholder="モデル名・ブランドで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-border-dark bg-surface-light py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 transition-colors focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
              />
            </div>

            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border-dark bg-surface-light transition-colors hover:border-neon hover:bg-surface"
              aria-label="ユーザーメニュー"
            >
              <svg
                className="h-5 w-5 text-zinc-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </button>
          </div>
        </div>

        <nav
          className="flex items-center gap-1 overflow-x-auto pb-1 sm:gap-2"
          aria-label="メインナビゲーション"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-surface-light hover:text-neon"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="relative sm:hidden">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
            />
          </svg>
          <input
            type="search"
            placeholder="モデル名・ブランドで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-border-dark bg-surface-light py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
          />
        </div>
      </div>
    </header>
  );
}
