"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createSneaker,
  deleteSneaker,
  listSneakers,
  toggleSneakerNotification,
} from "@/lib/sneakers";
import type { FilterMode, Sneaker } from "@/types/sneaker";
import { toSneaker } from "@/types/sneaker";

export function useSneakers() {
  const [sneakers, setSneakers] = useState<Sneaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterMode>("all");

  const loadSneakers = useCallback(async () => {
    setError(null);
    const { data, error: fetchError } = await listSneakers();

    if (fetchError) {
      setError(fetchError);
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

  const filteredSneakers = useMemo(() => {
    if (filter === "notified") {
      return sneakers.filter((s) => s.isNotified);
    }
    return sneakers;
  }, [sneakers, filter]);

  const handleCreate = async (input: {
    modelName: string;
    brand: string;
    releaseDate: string;
  }): Promise<string | null> => {
    const { data, error: createError } = await createSneaker({
      model_name: input.modelName,
      brand: input.brand,
      release_date: input.releaseDate,
    });

    if (createError) return createError;

    if (data) {
      setSneakers((prev) =>
        [...prev, toSneaker(data)].sort(
          (a, b) => a.releaseDate.getTime() - b.releaseDate.getTime(),
        ),
      );
    }

    return null;
  };

  const handleToggleNotify = async (sneaker: Sneaker) => {
    const { data, error: toggleError } = await toggleSneakerNotification(
      sneaker.id,
      !sneaker.isNotified,
    );

    if (toggleError) {
      setError(toggleError);
      return;
    }

    if (data) {
      setSneakers((prev) =>
        prev.map((s) => (s.id === sneaker.id ? toSneaker(data) : s)),
      );
    }
  };

  const handleDelete = async (sneaker: Sneaker) => {
    if (!window.confirm(`「${sneaker.modelName}」を削除しますか？`)) return;

    const { error: deleteError } = await deleteSneaker(sneaker.id);

    if (deleteError) {
      setError(deleteError);
      return;
    }

    setSneakers((prev) => prev.filter((s) => s.id !== sneaker.id));
  };

  return {
    filteredSneakers,
    loading,
    error,
    filter,
    setFilter,
    handleCreate,
    handleToggleNotify,
    handleDelete,
    isRegisteredEmpty: !loading && sneakers.length === 0,
  };
}
