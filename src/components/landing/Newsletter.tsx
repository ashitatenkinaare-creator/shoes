"use client";

export default function Newsletter() {
  return (
    <section className="border-t border-slate-800 bg-slate-900 px-4 py-12 lg:px-10 lg:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-black tracking-tight text-white uppercase sm:text-3xl">
          Never Miss a Drop
        </h2>
        <p className="mt-3 text-sm text-slate-400">
          最新ドロップ情報をメールでお届け。限定リリースをいち早くチェック。
        </p>
        <form
          className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            placeholder="your@email.com"
            className="min-h-[48px] flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white placeholder:text-slate-600 focus:border-drop-orange focus:outline-none sm:max-w-xs"
          />
          <button
            type="submit"
            className="btn-press min-h-[48px] shrink-0 rounded-lg bg-drop-orange px-8 py-3 text-sm font-black tracking-wider text-black uppercase transition-colors hover:bg-drop-orange-hover"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
