import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import BrandFilter from "../components/BrandFilter";
import ReleaseCalendar from "../components/ReleaseCalendar";
import SneakerForm from "../components/SneakerForm";
import Footer from "../components/Footer";
import {
  createSneaker,
  deleteSneaker,
  listSneakers,
  toggleSneakerNotification,
} from "../lib/sneakers";
import type { Brand, CreateSneakerInput, Sneaker } from "../types/sneaker";
import { toSneaker } from "../types/sneaker";

export default function Home() {
  const [sneakers, setSneakers] = useState<Sneaker[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadSneakers = useCallback(async () => {
    setFetchError(null);
    const { data, error } = await listSneakers();

    if (error) {
      setFetchError(error);
      setSneakers([]);
      return;
    }

    setSneakers(data?.map(toSneaker) ?? []);
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadSneakers();
      setLoading(false);
    };
    void init();
  }, [loadSneakers]);

  const featured = sneakers[0] ?? null;

  const filteredSneakers = useMemo(() => {
    if (!selectedBrand) return sneakers;
    return sneakers.filter((s) => s.brand === selectedBrand);
  }, [sneakers, selectedBrand]);

  const handleCreate = async (input: CreateSneakerInput): Promise<string | null> => {
    const { data, error } = await createSneaker(input);
    if (error) return error;

    if (data) {
      setSneakers((prev) =>
        [...prev, toSneaker(data)].sort(
          (a, b) =>
            new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime(),
        ),
      );
    }
    return null;
  };

  const handleNotifyToggle = async (
    id: string,
    isNotified: boolean,
  ): Promise<string | null> => {
    const { data, error } = await toggleSneakerNotification(id, isNotified);
    if (error) return error;

    if (data) {
      setSneakers((prev) =>
        prev.map((s) => (s.id === id ? toSneaker(data) : s)),
      );
    }
    return null;
  };

  const handleDelete = async (id: string): Promise<string | null> => {
    const { error } = await deleteSneaker(id);
    if (error) return error;

    setSneakers((prev) => prev.filter((s) => s.id !== id));
    return null;
  };

  return (
    <div id="top" className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero featured={featured} />
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
          {fetchError && (
            <p className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {fetchError}
            </p>
          )}

          <div className="mb-10">
            <SneakerForm onSubmit={handleCreate} />
          </div>

          <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
            <div className="lg:w-56 lg:shrink-0">
              <BrandFilter
                selectedBrand={selectedBrand}
                onBrandChange={setSelectedBrand}
              />
            </div>
            <ReleaseCalendar
              sneakers={filteredSneakers}
              loading={loading}
              onNotifyToggle={handleNotifyToggle}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
