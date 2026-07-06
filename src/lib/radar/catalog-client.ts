"use client";

import { getSupabase } from "@/lib/supabase/client";
import { rowToSneakerItem, toDbSneakerId } from "@/lib/radar/map-radar-sneaker";
import type { SneakerRadarItem } from "@/types/radar";
import type { RadarSneakerRow } from "@/types/radar-db";

const CATALOG_SELECT_WITH_CATEGORY = "*, radar_categories(slug, label)";
const CATALOG_SELECT_BASE = "*";

async function selectSneakersByIds(dbIds: string[]) {
  const supabase = getSupabase();

  const withCategory = await supabase
    .from("radar_sneakers")
    .select(CATALOG_SELECT_WITH_CATEGORY)
    .in("id", dbIds);

  if (!withCategory.error) return withCategory;

  if (withCategory.error.message.includes("radar_categories")) {
    return supabase.from("radar_sneakers").select(CATALOG_SELECT_BASE).in("id", dbIds);
  }

  return withCategory;
}

/** クライアントからカタログ ID 一覧を Supabase で解決 */
export async function fetchSneakerItemsByIds(ids: string[]): Promise<SneakerRadarItem[]> {
  if (ids.length === 0) return [];

  const dbIds = ids.map(toDbSneakerId);
  const { data, error } = await selectSneakersByIds(dbIds);

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
