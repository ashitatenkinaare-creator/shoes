import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SneakerDrop | スニーカー管理",
  description: "スニーカーの発売日管理・通知設定ダッシュボード",
};

export default function SneakersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
