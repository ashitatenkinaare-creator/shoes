import type { Metadata } from "next";
import AuthView from "@/components/radar/auth/AuthView";

export const metadata: Metadata = {
  title: "ログイン / 新規登録",
  description: "Sneaker Radar アカウントの認証",
};

export default function AuthPage() {
  return <AuthView />;
}
