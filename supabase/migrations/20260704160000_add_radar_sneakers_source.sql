-- KicksDB 同期用: 外部ソース識別子
alter table public.radar_sneakers
  add column if not exists source text not null default 'kicksdb',
  add column if not exists external_id text;

comment on column public.radar_sneakers.source is 'データソース (seed | kicksdb 等)';
comment on column public.radar_sneakers.external_id is '外部 API の一意 ID (例: StockX slug)';

create unique index if not exists radar_sneakers_source_external_id_idx
  on public.radar_sneakers (source, external_id)
  where external_id is not null;

-- service_role のみ upsert 可能（Edge Function / Cron 用）
create policy "radar_sneakers_service_role_all"
  on public.radar_sneakers
  for all
  to service_role
  using (true)
  with check (true);
