import type { SneakerRadarDetail, SneakerRadarItem } from "@/types/radar";
import type { RadarSneakerRow } from "@/types/radar-db";
import { RADAR_SNEAKER_DB_TO_APP, RADAR_SNEAKER_ID_MAP } from "@/types/radar-db";

export function toDbSneakerId(appId: string): string {
  return RADAR_SNEAKER_ID_MAP[appId as keyof typeof RADAR_SNEAKER_ID_MAP] ?? appId;
}

export function toAppSneakerId(dbId: string): string {
  return RADAR_SNEAKER_DB_TO_APP[dbId] ?? dbId;
}

export function rowToSneakerItem(row: RadarSneakerRow): SneakerRadarItem {
  return {
    id: toAppSneakerId(row.id),
    brand: row.brand,
    modelName: row.model_name,
    imageUrl: row.image_url,
    announceDate: row.announce_date,
    releaseDate: row.release_date,
    phase: row.phase,
    price: row.price,
    storeUrl: row.store_url,
    matchedReasons: [`ブランド: ${row.brand}`],
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
