"use client";

import { getSupabase } from "@/lib/supabase/client";
import { rowToSneakerItem, toDbSneakerId } from "@/lib/radar/map-radar-sneaker";
import { MOCK_NEW_ARRIVALS } from "@/data/radar-mock";
import type { SneakerRadarItem } from "@/types/radar";
import type { RadarSneakerRow } from "@/types/radar-db";

const mockById = new Map(MOCK_NEW_ARRIVALS.map((item) => [item.id, item]));

/** クライアントからカタログ ID 一覧を解決（モック + Supabase） */
export async function fetchSneakerItemsByIds(ids: string[]): Promise<SneakerRadarItem[]> {
  if (ids.length === 0) return [];

  const fromMock = ids
    .map((id) => mockById.get(id))
    .filter((item): item is SneakerRadarItem => item !== undefined);

  const missingIds = ids.filter((id) => !mockById.has(id));
  if (missingIds.length === 0) {
    return ids
      .map((id) => mockById.get(id))
      .filter((item): item is SneakerRadarItem => item !== undefined);
  }

  const dbIds = missingIds.map(toDbSneakerId);
  const { data, error } = await getSupabase()
    .from("radar_sneakers")
    .select("*")
    .in("id", dbIds);

  if (error) {
    return fromMock;
  }

  const dbByAppId = new Map(
    (data as RadarSneakerRow[]).map((row) => {
      const item = rowToSneakerItem(row);
      return [item.id, item] as const;
    }),
  );

  return ids
    .map((id) => mockById.get(id) ?? dbByAppId.get(id))
    .filter((item): item is SneakerRadarItem => item !== undefined);
}
