import type { Metadata } from "next";
import LandingShell from "@/components/landing/LandingShell";
import Newsletter from "@/components/landing/Newsletter";
import VaultGrid from "@/components/landing/VaultGrid";
import type { BrandFilter } from "@/types/drop";

export const metadata: Metadata = {
  title: "The Vault",
  description: "SneakerDrop カタログ · 全リリース一覧",
};

const validBrands: BrandFilter[] = ["all", "nike", "jordan", "adidas", "yeezy", "new-balance"];

interface VaultPageProps {
  searchParams: Promise<{ brand?: string }>;
}

export default async function VaultPage({ searchParams }: VaultPageProps) {
  const params = await searchParams;
  const brandParam = params.brand ?? "all";
  const initialBrand = validBrands.includes(brandParam as BrandFilter)
    ? (brandParam as BrandFilter)
    : "all";

  return (
    <LandingShell activeBrand={initialBrand} activeNav="vault">
      <VaultGrid initialBrand={initialBrand} />
      <Newsletter />
    </LandingShell>
  );
}
