import { resolveRadarImageUrl } from "@/lib/radar/placeholder-image";
import type { SneakerRadarDetail, SneakerRadarItem } from "@/types/radar";
import type { RadarSneakerRow } from "@/types/radar-db";

export function toDbSneakerId(appId: string): string {
  return appId;
}

export function toAppSneakerId(dbId: string): string {
  return dbId;
}

export function rowToSneakerItem(row: RadarSneakerRow): SneakerRadarItem {
  const matchedReasons = [`ブランド: ${row.brand}`];
  if (row.is_rare) matchedReasons.push("レア");
  if (row.is_collab) matchedReasons.push("コラボ");

  return {
    id: toAppSneakerId(row.id),
    brand: row.brand,
    modelName: row.model_name,
    imageUrl: resolveRadarImageUrl(row.image_url),
    announceDate: row.announce_date,
    releaseDate: row.release_date,
    phase: row.phase,
    price: row.price,
    storeUrl: row.store_url,
    isRare: row.is_rare ?? false,
    isCollab: row.is_collab ?? false,
    matchedReasons,
  };
}

export function rowToSneakerDetail(row: RadarSneakerRow): SneakerRadarDetail {
  return {
    ...rowToSneakerItem(row),
    description: row.description,
    colorway: row.colorway,
    sku: row.sku,
  };
}
