import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LandingShell from "@/components/landing/LandingShell";
import ProductDetailView from "@/components/landing/ProductDetailView";
import { getProductBySlug, getRelatedDrops } from "@/data/drops";

interface DropPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: DropPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "見つかりません" };
  return { title: product.title };
}

export default async function DropPage({ params }: DropPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) notFound();

  const related = getRelatedDrops(product.id);

  return (
    <LandingShell activeNav="vault">
      <ProductDetailView product={product} related={related} />
    </LandingShell>
  );
}
