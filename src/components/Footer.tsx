const snsLinks = [
  { label: "X (Twitter)", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "YouTube", href: "#" },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-border-dark bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4 text-black"
                  aria-hidden="true"
                >
                  <path
                    d="M4 18L12 6L20 18H4Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span className="text-lg font-black text-white">SneakerDrop</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400">
              日本国内のスニーカー発売情報を、
              <br />
              ひと目で確認できるダッシュボード。
              <br />
              最新ドロップを見逃さない。
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-neon">
              サイト運営
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-zinc-400">
              <li>運営：SneakerDrop 編集部</li>
              <li>お問い合わせ：info@sneakerdrop.jp</li>
              <li>更新：毎日 12:00 / 18:00</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-neon">
              リンク
            </h3>
            <ul className="mt-4 space-y-2">
              {snsLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-zinc-400 transition-colors hover:text-neon"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#"
                  className="text-sm text-zinc-400 transition-colors hover:text-neon"
                >
                  プライバシーポリシー
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border-dark pt-6 text-center text-xs text-zinc-600">
          © 2026 SneakerDrop. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
