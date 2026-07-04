import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LandingShell from "@/components/landing/LandingShell";
import ProductDetailView from "@/components/landing/ProductDetailView";
import {
  getProductBySlug,
  getRelatedDrops,
  getVaultItemBySlug,
} from "@/data/drops";
import type { ProductDetail } from "@/types/drop";

interface DropPageProps {
  params: Promise<{ slug: string }>;
}

function vaultToProduct(slug: string): ProductDetail | undefined {
  const vault = getVaultItemBySlug(slug);
  if (!vault) return undefined;

  return {
    id: vault.id,
    slug: vault.slug ?? slug,
    series: "THE VAULT / " + vault.brand,
    title: vault.name,
    description: `${vault.brand} の最新ドロップ。限定数量でのリリースを予定しています。`,
    price: vault.price,
    imageUrl: vault.imageUrl,
    gallery: [vault.imageUrl],
    specs: [
      { label: "Brand", value: vault.brand },
      { label: "Status", value: vault.badge ?? vault.status },
      { label: "Release", value: vault.releaseDate },
    ],
    dropEndsAt: new Date(Date.now() + 86400000),
  };
}

export async function generateMetadata({ params }: DropPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug) ?? vaultToProduct(slug);
  if (!product) return { title: "Not Found" };
  return { title: product.title };
}

export default async function DropPage({ params }: DropPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug) ?? vaultToProduct(slug);

  if (!product) notFound();

  const related = getRelatedDrops(product.id);

  return (
    <LandingShell activeNav="vault">
      <ProductDetailView product={product} related={related} />
    </LandingShell>
  );
}
