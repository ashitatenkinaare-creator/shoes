import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SneakerDetailView from "@/components/radar/sneaker/SneakerDetailView";
import { fetchSneakerDetailById } from "@/lib/radar/catalog-db.server";

interface SneakerDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SneakerDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const { data: sneaker } = await fetchSneakerDetailById(id);
  if (!sneaker) return { title: "見つかりません" };
  return {
    title: sneaker.modelName,
    description: `${sneaker.brand} · 発売 ${sneaker.releaseDate}`,
  };
}

export default async function SneakerDetailPage({ params }: SneakerDetailPageProps) {
  const { id } = await params;
  const { data: sneaker } = await fetchSneakerDetailById(id);

  if (!sneaker) notFound();

  return <SneakerDetailView sneaker={sneaker} />;
}
