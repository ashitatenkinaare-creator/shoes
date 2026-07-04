-- Sneaker Radar schema: catalog, user preferences, watchlist

-- ---------------------------------------------------------------------------
-- Enum
-- ---------------------------------------------------------------------------
create type public.sneaker_phase as enum ('announced', 'upcoming', 'today');

-- ---------------------------------------------------------------------------
-- Catalog (Radar 用。管理画面 public.sneakers とは分離)
-- ---------------------------------------------------------------------------
create table public.radar_sneakers (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model_name text not null,
  image_url text not null,
  announce_date date not null,
  release_date date not null,
  phase public.sneaker_phase not null default 'announced',
  price integer not null check (price >= 0),
  store_url text not null,
  description text not null default '',
  colorway text not null default '',
  sku text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.radar_sneakers is 'Sneaker Radar カタログ（新作情報）';

create index radar_sneakers_release_date_idx on public.radar_sneakers (release_date);
create index radar_sneakers_brand_idx on public.radar_sneakers (brand);
create index radar_sneakers_phase_idx on public.radar_sneakers (phase);

-- ---------------------------------------------------------------------------
-- User preferences (auth.users と 1:1)
-- ---------------------------------------------------------------------------
create table public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  brands text[] not null default '{}',
  sizes text[] not null default '{}',
  notify_on_announcement boolean not null default true,
  notify_on_release boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.user_preferences is 'Sneaker Radar ユーザーの好み条件';

-- ---------------------------------------------------------------------------
-- Watchlist (ユーザー × カタログ)
-- ---------------------------------------------------------------------------
create table public.watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  sneaker_id uuid not null references public.radar_sneakers (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, sneaker_id)
);

comment on table public.watchlist is 'Sneaker Radar ウォッチリスト';

create index watchlist_user_id_idx on public.watchlist (user_id);
create index watchlist_sneaker_id_idx on public.watchlist (sneaker_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger radar_sneakers_set_updated_at
  before update on public.radar_sneakers
  for each row execute function public.set_updated_at();

create trigger user_preferences_set_updated_at
  before update on public.user_preferences
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.radar_sneakers enable row level security;
alter table public.user_preferences enable row level security;
alter table public.watchlist enable row level security;

-- Catalog: 読み取りのみ（anon / authenticated）
create policy "radar_sneakers_select_public"
  on public.radar_sneakers
  for select
  to anon, authenticated
  using (true);

-- Preferences: 本人のみ
create policy "user_preferences_select_own"
  on public.user_preferences
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "user_preferences_insert_own"
  on public.user_preferences
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "user_preferences_update_own"
  on public.user_preferences
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "user_preferences_delete_own"
  on public.user_preferences
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Watchlist: 本人のみ（UPDATE 不要 — 追加/削除のみ）
create policy "watchlist_select_own"
  on public.watchlist
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "watchlist_insert_own"
  on public.watchlist
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "watchlist_delete_own"
  on public.watchlist
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Grants (Data API)
-- ---------------------------------------------------------------------------
grant select on public.radar_sneakers to anon, authenticated;
grant select, insert, update, delete on public.user_preferences to authenticated;
grant select, insert, delete on public.watchlist to authenticated;

-- ---------------------------------------------------------------------------
-- Seed: UI モックと同等のカタログデータ（固定 UUID）
-- ---------------------------------------------------------------------------
insert into public.radar_sneakers (
  id,
  brand,
  model_name,
  image_url,
  announce_date,
  release_date,
  phase,
  price,
  store_url,
  description,
  colorway,
  sku
) values
  (
    '11111111-1111-4111-8111-111111110001',
    'Jordan',
    'Air Jordan 1 Retro High OG ''Chicago Reimagined''',
    'https://images.unsplash.com/photo-1556906781-95a18896efac?w=600&h=600&fit=crop',
    '2026-07-01',
    '2026-07-12',
    'upcoming',
    24200,
    'https://example.com/store/jordan-1',
    '1985年のオリジナルを現代の素材感で再構築。フルグレインレザーアッパーにクラシックなChicagoカラーを配した、コレクター向けの一足です。',
    'Varsity Red / Black / Sail',
    'DZ5485-612'
  ),
  (
    '11111111-1111-4111-8111-111111110002',
    'Nike',
    'Air Max 1 ''86 OG Big Bubble',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
    '2026-07-03',
    '2026-07-05',
    'today',
    18700,
    'https://example.com/store/air-max-1',
    '1986年のビッグバブル仕様を復刻。ビンテージ加工レザーとOGディテールを再現した、Air Max 1ファン待望のモデルです。',
    'White / University Red / Grey',
    'FN7183-100'
  ),
  (
    '11111111-1111-4111-8111-111111110003',
    'New Balance',
    '990v6 Made in USA ''Grey''',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop',
    '2026-06-28',
    '2026-07-20',
    'announced',
    31900,
    'https://example.com/store/990v6',
    'Made in USAラインの990v6。プレミアムスエードとメッシュのコンビネーションに、安定感のあるENCAPミッドソールを搭載。',
    'Grey / Castlerock',
    'M990GL6'
  ),
  (
    '11111111-1111-4111-8111-111111110004',
    'Nike',
    'Dunk Low ''Panda Restock''',
    'https://images.unsplash.com/photo-1600185365926-3a95ce3ead9e?w=600&h=600&fit=crop',
    '2026-07-04',
    '2026-07-18',
    'announced',
    15400,
    'https://example.com/store/dunk-panda',
    '定番Pandaカラーの再入荷モデル。シンプルなツートーンが合わせやすく、デイリーユースにも最適です。',
    'White / Black',
    'DD1391-100'
  );
