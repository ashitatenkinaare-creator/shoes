"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export default function Newsletter() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="border-t border-slate-800 bg-slate-900 px-4 py-12 lg:px-10 lg:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-black tracking-tight text-white uppercase sm:text-3xl">
          ドロップを見逃さない
        </h2>
        <p className="mt-3 text-sm text-slate-400">
          Sneaker Radar で2段階通知（発表 / 抽選ページ開設）と Web Push を設定できます。
        </p>
        <form
          className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
          onSubmit={handleSubmit}
        >
          <input
            type="email"
            name="email"
            required
            placeholder="メールアドレス"
            className="min-h-[48px] flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white placeholder:text-slate-600 focus:border-drop-orange focus:outline-none sm:max-w-xs"
          />
          <button
            type="submit"
            className="btn-press min-h-[48px] shrink-0 rounded-lg bg-drop-orange px-8 py-3 text-sm font-black tracking-wider text-black uppercase transition-colors hover:bg-drop-orange-hover"
          >
            通知設定へ
          </button>
        </form>
        {submitted && (
          <p className="mt-4 text-sm text-drop-orange">
            <Link href="/settings" className="font-bold underline hover:no-underline">
              Sneaker Radar の条件設定
            </Link>
            で通知を有効にしてください。
          </p>
        )}
      </div>
    </section>
  );
}
