"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, Radar, UserPlus } from "lucide-react";
import { sanitizeRedirectPath } from "@/lib/radar/auth-routes";
import { useAuthSession } from "@/hooks/useAuthSession";

type AuthMode = "login" | "register";

function AuthFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = sanitizeRedirectPath(searchParams?.get("redirect"));
  const { signIn, signUp } = useAuthSession();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const queryError = searchParams?.get("error");
    if (queryError) setError(queryError);
  }, [searchParams]);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError(null);
    setInfo(null);
    setPassword("");
    setPasswordConfirm("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email.trim() || !password) {
      setError("メールアドレスとパスワードを入力してください");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      setError("有効なメールアドレスを入力してください");
      return;
    }

    if (password.length < 8) {
      setError("パスワードは8文字以上で入力してください");
      return;
    }

    if (mode === "register" && password !== passwordConfirm) {
      setError("パスワード（確認）が一致しません");
      return;
    }

    setSubmitting(true);

    if (mode === "login") {
      const authError = await signIn(email.trim(), password);
      setSubmitting(false);
      if (authError) {
        setError(authError);
        return;
      }
      router.push(redirectTo);
      router.refresh();
      return;
    }

    const { error: signUpError, needsEmailConfirmation } = await signUp(
      email.trim(),
      password,
      redirectTo,
    );
    setSubmitting(false);

    if (signUpError) {
      setError(signUpError);
      return;
    }

    if (needsEmailConfirmation) {
      setInfo("確認メールを送信しました。メール内のリンクから認証後、ログインしてください。");
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 text-center lg:hidden">
        <div className="inline-flex items-center gap-2">
          <Radar className="h-6 w-6 text-radar-accent" aria-hidden="true" />
          <span className="text-lg font-black text-white">Sneaker Radar</span>
        </div>
      </div>

      <div className="rounded-2xl border border-radar-border bg-radar-surface p-6 sm:p-8">
        <h1 className="text-center text-xl font-black text-white">アカウント</h1>
        <p className="mt-2 text-center text-sm text-slate-400">
          ログインして条件設定・ウォッチリストをクラウドに同期
        </p>

        {redirectTo !== "/dashboard" && (
          <p className="mt-3 rounded-lg bg-radar-muted px-3 py-2 text-center text-xs text-slate-400">
            ログイン後 <span className="text-radar-accent">{redirectTo}</span> へ移動します
          </p>
        )}

        <div
          className="mt-6 flex rounded-xl border border-radar-border bg-radar-muted p-1"
          role="tablist"
          aria-label="認証モード"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            onClick={() => switchMode("login")}
            className={`btn-press flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors ${
              mode === "login"
                ? "bg-radar-accent text-radar-bg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            ログイン
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "register"}
            onClick={() => switchMode("register")}
            className={`btn-press flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors ${
              mode === "register"
                ? "bg-radar-accent text-radar-bg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            新規登録
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="auth-email" className="mb-1.5 block text-xs font-bold text-slate-400">
              メールアドレス
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-radar-border bg-radar-bg px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-radar-accent focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="mb-1.5 block text-xs font-bold text-slate-400">
              パスワード
            </label>
            <input
              id="auth-password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8文字以上"
              className="w-full rounded-xl border border-radar-border bg-radar-bg px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-radar-accent focus:outline-none"
            />
          </div>

          {mode === "register" && (
            <div>
              <label
                htmlFor="auth-password-confirm"
                className="mb-1.5 block text-xs font-bold text-slate-400"
              >
                パスワード（確認）
              </label>
              <input
                id="auth-password-confirm"
                type="password"
                autoComplete="new-password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="もう一度入力"
                className="w-full rounded-xl border border-radar-border bg-radar-bg px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-radar-accent focus:outline-none"
              />
            </div>
          )}

          {info && (
            <p
              role="status"
              className="rounded-xl border border-radar-accent/30 bg-radar-accent/10 px-4 py-3 text-sm text-radar-accent"
            >
              {info}
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-press min-h-[48px] w-full rounded-xl bg-radar-accent py-3 text-sm font-bold text-radar-bg transition-colors hover:bg-radar-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "処理中..."
              : mode === "login"
                ? "ログイン"
                : "アカウントを作成"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          {mode === "login" ? (
            <>
              アカウントをお持ちでない方は{" "}
              <button
                type="button"
                onClick={() => switchMode("register")}
                className="font-semibold text-radar-accent hover:underline"
              >
                新規登録
              </button>
            </>
          ) : (
            <>
              すでに登録済みの方は{" "}
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="font-semibold text-radar-accent hover:underline"
              >
                ログイン
              </button>
            </>
          )}
        </p>
      </div>

      <p className="mt-6 text-center">
        <Link
          href="/dashboard"
          className="text-xs font-medium text-slate-500 transition-colors hover:text-radar-accent"
        >
          ログインせずにダッシュボードへ →
        </Link>
      </p>
    </div>
  );
}

export default function AuthForm() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-radar-border bg-radar-surface px-4 py-12 text-center text-sm text-slate-500">
          読み込み中...
        </div>
      }
    >
      <AuthFormInner />
    </Suspense>
  );
}
