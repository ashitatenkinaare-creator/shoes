import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SneakerDetailView from "@/components/radar/sneaker/SneakerDetailView";
import { fetchSneakerDetailById } from "@/lib/radar/catalog-db";
import { getRadarSneakerDetailById } from "@/data/radar-mock";

interface SneakerDetailPageProps {
  params: Promise<{ id: string }>;
}

async function resolveSneaker(id: string) {
  const { data } = await fetchSneakerDetailById(id);
  if (data) return data;
  return getRadarSneakerDetailById(id);
}

export async function generateMetadata({ params }: SneakerDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const sneaker = await resolveSneaker(id);
  if (!sneaker) return { title: "Not Found" };
  return {
    title: sneaker.modelName,
    description: `${sneaker.brand} · 発売 ${sneaker.releaseDate}`,
  };
}

export default async function SneakerDetailPage({ params }: SneakerDetailPageProps) {
  const { id } = await params;
  const sneaker = await resolveSneaker(id);

  if (!sneaker) notFound();

  return <SneakerDetailView sneaker={sneaker} />;
}
