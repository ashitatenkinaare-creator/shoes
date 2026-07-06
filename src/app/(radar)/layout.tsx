import type { Metadata } from "next";
import RadarShell from "@/components/radar/RadarShell";

export const metadata: Metadata = {
  title: {
    default: "Sneaker Radar",
    template: "%s | Sneaker Radar",
  },
  description:
    "好み条件に合う新作スニーカーを自動ピックアップし、発表・発売を通知するパートナーアプリ",
};

export default function RadarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RadarShell>{children}</RadarShell>;
}
