-- レア・コラボ属性: カタログ列 + ユーザー条件フィルタ

-- ---------------------------------------------------------------------------
-- radar_sneakers: KicksDB 名称解析で付与するフラグ
-- ---------------------------------------------------------------------------
alter table public.radar_sneakers
  add column if not exists is_rare boolean not null default false,
  add column if not exists is_collab boolean not null default false;

comment on column public.radar_sneakers.is_rare is '限定・OG・Reimagined 等のレア判定（名称解析）';
comment on column public.radar_sneakers.is_collab is 'コラボ・× 表記等のコラボ判定（名称解析）';

create index if not exists radar_sneakers_is_rare_idx
  on public.radar_sneakers (is_rare)
  where is_rare = true;

create index if not exists radar_sneakers_is_collab_idx
  on public.radar_sneakers (is_collab)
  where is_collab = true;

-- シードデータの代表例を更新（UI デモ用）
update public.radar_sneakers
set is_rare = true, is_collab = false
where id = '11111111-1111-4111-8111-111111110001'; -- Chicago Reimagined

update public.radar_sneakers
set is_rare = true, is_collab = false
where id = '11111111-1111-4111-8111-111111110002'; -- AM1 OG Big Bubble

update public.radar_sneakers
set is_rare = false, is_collab = false
where id in (
  '11111111-1111-4111-8111-111111110003',
  '11111111-1111-4111-8111-111111110004'
);

-- ---------------------------------------------------------------------------
-- user_preferences: ダッシュボード絞り込み条件
-- ---------------------------------------------------------------------------
alter table public.user_preferences
  add column if not exists filter_rare boolean not null default false,
  add column if not exists filter_collab boolean not null default false;

comment on column public.user_preferences.filter_rare is 'ON 時、is_rare = true のみ表示';
comment on column public.user_preferences.filter_collab is 'ON 時、is_collab = true のみ表示';
