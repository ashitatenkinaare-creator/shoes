import Link from "next/link";

export default function SneakerHeader() {
  return (
    <header className="border-b border-slate-700/80 bg-slate-900/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[640px] items-center justify-between px-3 py-4 md:px-4 md:py-5">
        <Link
          href="/sneakers"
          className="text-xl font-bold tracking-tight text-slate-100 transition-colors hover:text-neon"
        >
          Sneaker<span className="text-neon">Drop</span>
        </Link>
        <Link
          href="/"
          className="text-xs font-medium text-slate-400 transition-colors hover:text-slate-200"
        >
          トップへ
        </Link>
      </div>
    </header>
  );
}
