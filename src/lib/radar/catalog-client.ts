"use client";

import { getSupabase } from "@/lib/supabase/client";
import { rowToSneakerItem, toDbSneakerId } from "@/lib/radar/map-radar-sneaker";
import type { SneakerRadarItem } from "@/types/radar";
import type { RadarSneakerRow } from "@/types/radar-db";

/** クライアントからカタログ ID 一覧を Supabase で解決 */
export async function fetchSneakerItemsByIds(ids: string[]): Promise<SneakerRadarItem[]> {
  if (ids.length === 0) return [];

  const dbIds = ids.map(toDbSneakerId);
  const { data, error } = await getSupabase()
    .from("radar_sneakers")
    .select("*, radar_categories(slug, label)")
    .eq("source", "kicksdb")
    .in("id", dbIds);

  if (error || !data) return [];

  const dbById = new Map(
    (data as RadarSneakerRow[]).map((row) => {
      const item = rowToSneakerItem(row);
      return [item.id, item] as const;
    }),
  );

  return ids
    .map((id) => dbById.get(id))
    .filter((item): item is SneakerRadarItem => item !== undefined);
}
