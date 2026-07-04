-- PostgREST upsert 用の UNIQUE 制約（部分 index では onConflict 不可）
alter table public.radar_sneakers
  drop constraint if exists radar_sneakers_source_external_id_key;

alter table public.radar_sneakers
  add constraint radar_sneakers_source_external_id_key
  unique (source, external_id);
