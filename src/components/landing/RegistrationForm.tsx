"use client";

import { useState, type FormEvent } from "react";
import LandingProductImage from "@/components/landing/LandingProductImage";
import Link from "next/link";

export default function RegistrationForm() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !username.trim() || !password) {
      setError("すべての項目を入力してください");
      return;
    }
    if (password.length < 8) {
      setError("パスワードは8文字以上で入力してください");
      return;
    }

    setSuccess(true);
  };

  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4 py-12 lg:py-16">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-10 block text-center text-lg font-black tracking-[0.15em] text-drop-orange"
        >
          SNEAKERDROP
        </Link>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <h1 className="text-center text-2xl font-black tracking-tight text-white uppercase">
            Join the Drop
          </h1>
          <p className="mt-2 text-center text-xs tracking-wide text-slate-400 uppercase">
            Exclusive access to exclusive inventory
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-drop-orange focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="username" className="mb-1.5 block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-drop-orange focus:outline-none"
                placeholder="hypebeast_01"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-drop-orange focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}
            {success && (
              <p className="rounded-lg border border-drop-orange/30 bg-drop-orange/10 px-3 py-2 text-sm text-drop-orange">
                アカウントを作成しました（デモ）
              </p>
            )}

            <button
              type="submit"
              className="btn-press min-h-[52px] w-full rounded-lg bg-drop-orange py-4 text-sm font-black tracking-wider text-black uppercase transition-colors hover:bg-drop-orange-hover"
            >
              Create Account
            </button>
          </form>

          <p className="mt-6 text-center text-[10px] font-bold tracking-wide text-drop-orange uppercase">
            <Link href="/" className="hover:underline">
              Already have an account? Log in to your profile
            </Link>
          </p>
        </div>
      </div>

      <aside className="mt-8 w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-4 lg:absolute lg:right-8 lg:bottom-8 lg:mt-0 lg:max-w-xs">
        <p className="text-[10px] font-bold tracking-widest text-drop-orange uppercase">
          Live Drop Status
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
            <LandingProductImage
              src="https://images.stockx.com/images/Air-Jordan-4-Retro-Black-Cat-2025-Product.jpg?fit=fill&bg=FFFFFF&w=200&h=200&fm=webp"
              alt=""
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>
          <div>
            <p className="text-xs font-bold text-white uppercase">Jordan Zero-Ten X2</p>
            <p className="text-sm font-black text-drop-orange">$195.00</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
