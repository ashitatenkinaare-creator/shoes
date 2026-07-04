import type { Metadata } from "next";
import LandingShell from "@/components/landing/LandingShell";
import Hero from "@/components/landing/Hero";
import Newsletter from "@/components/landing/Newsletter";
import UpcomingDrops from "@/components/landing/UpcomingDrops";
import { FEATURED_DROP, UPCOMING_DROPS } from "@/data/drops";

export const metadata: Metadata = {
  title: "Launches",
  description: "最新スニーカードロップ情報 · SneakerDrop",
};

export default function HomePage() {
  return (
    <LandingShell activeNav="launches">
      <Hero drop={FEATURED_DROP} />
      <UpcomingDrops items={UPCOMING_DROPS} />
      <Newsletter />
    </LandingShell>
  );
}
