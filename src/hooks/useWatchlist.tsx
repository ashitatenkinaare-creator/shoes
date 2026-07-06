"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuthSession } from "@/hooks/useAuthSession";
import {
  addWatchlistItem,
  fetchUserWatchlist,
  removeWatchlistItem,
} from "@/lib/radar/watchlist-db";
import { fetchWatchlistItems, loadWatchlistIds, saveWatchlistIds } from "@/lib/radar/watchlist";
import type { SneakerRadarItem } from "@/types/radar";

type WatchlistStorageMode = "remote" | "local";

type WatchlistContextValue = {
  ids: string[];
  items: SneakerRadarItem[];
  ready: boolean;
  storageMode: WatchlistStorageMode;
  error: string | null;
  isWatched: (id: string) => boolean;
  add: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  toggle: (id: string) => Promise<void>;
};

const WatchlistContext = createContext<WatchlistContextValue | null>(null);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuthSession();
  const [ids, setIds] = useState<string[]>([]);
  const [items, setItems] = useState<SneakerRadarItem[]>([]);
  const [ready, setReady] = useState(false);
  const [storageMode, setStorageMode] = useState<WatchlistStorageMode>("local");
  const [error, setError] = useState<string | null>(null);

  const applyLocalState = useCallback(async (nextIds: string[]) => {
    const nextItems = await fetchWatchlistItems(nextIds);
    setIds(nextIds);
    setItems(nextItems);
    saveWatchlistIds(nextIds);
    setStorageMode("local");
  }, []);

  useEffect(() => {
    if (authLoading) return;

    const load = async () => {
      setReady(false);
      setError(null);

      if (user) {
        const { data, error: fetchError } = await fetchUserWatchlist(user.id);
        if (fetchError) {
          setError(fetchError);
          await applyLocalState(loadWatchlistIds());
        } else {
          const remoteItems = data ?? [];
          setIds(remoteItems.map((item) => item.id));
          setItems(remoteItems);
          setStorageMode("remote");
        }
      } else {
        await applyLocalState(loadWatchlistIds());
      }

      setReady(true);
    };

    void load();
  }, [applyLocalState, authLoading, user]);

  const isWatched = useCallback((id: string) => ids.includes(id), [ids]);

  const add = useCallback(
    async (id: string) => {
      if (ids.includes(id)) return;
      setError(null);

      const prevIds = ids;
      const nextIds = [...ids, id];

      if (user) {
        setIds(nextIds);
        setItems(await fetchWatchlistItems(nextIds));

        const { error: addError } = await addWatchlistItem(user.id, id);
        if (addError) {
          setError(addError);
          setIds(prevIds);
          setItems(await fetchWatchlistItems(prevIds));
          return;
        }

        setStorageMode("remote");
        const { data } = await fetchUserWatchlist(user.id);
        if (data) {
          setIds(data.map((item) => item.id));
          setItems(data);
        }
        return;
      }

      await applyLocalState(nextIds);
    },
    [applyLocalState, ids, user],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!ids.includes(id)) return;
      setError(null);

      const prevIds = ids;
      const nextIds = ids.filter((itemId) => itemId !== id);

      if (user) {
        setIds(nextIds);
        setItems(await fetchWatchlistItems(nextIds));

        const { error: removeError } = await removeWatchlistItem(user.id, id);
        if (removeError) {
          setError(removeError);
          setIds(prevIds);
          setItems(await fetchWatchlistItems(prevIds));
          return;
        }

        setStorageMode("remote");
        return;
      }

      await applyLocalState(nextIds);
    },
    [applyLocalState, ids, user],
  );

  const toggle = useCallback(
    async (id: string) => {
      if (ids.includes(id)) {
        await remove(id);
        return;
      }
      await add(id);
    },
    [add, ids, remove],
  );

  const value = useMemo(
    () => ({
      ids,
      items,
      ready,
      storageMode,
      error,
      isWatched,
      add,
      remove,
      toggle,
    }),
    [add, error, ids, isWatched, items, ready, remove, storageMode, toggle],
  );

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error("useWatchlist must be used within WatchlistProvider");
  }
  return context;
}
