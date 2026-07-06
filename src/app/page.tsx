import type { Metadata } from "next";
import LandingShell from "@/components/landing/LandingShell";
import Hero from "@/components/landing/Hero";
import Newsletter from "@/components/landing/Newsletter";
import UpcomingDrops from "@/components/landing/UpcomingDrops";
import { FEATURED_DROP, UPCOMING_DROPS, filterUpcomingByBrand } from "@/data/drops";
import type { BrandFilter } from "@/types/drop";

export const metadata: Metadata = {
  title: "本日・最新の発売",
  description: "最新スニーカードロップ情報 · SneakerDrop",
};

const validBrands: BrandFilter[] = ["all", "nike", "jordan", "adidas", "yeezy", "new-balance"];

interface HomePageProps {
  searchParams: Promise<{ brand?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const brandParam = params.brand ?? "all";
  const activeBrand = validBrands.includes(brandParam as BrandFilter)
    ? (brandParam as BrandFilter)
    : "all";
  const items = filterUpcomingByBrand(UPCOMING_DROPS, activeBrand);

  return (
    <LandingShell activeNav="launches" activeBrand={activeBrand}>
      <Hero drop={FEATURED_DROP} />
      <UpcomingDrops items={items} activeBrand={activeBrand} />
      <Newsletter />
    </LandingShell>
  );
}
