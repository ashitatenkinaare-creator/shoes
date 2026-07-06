-- Phase 2: 公式抽選・ニュース URL 登録 + Web Push 購読

create table if not exists public.radar_lottery_sources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  brand_pattern text not null default '.*',
  model_pattern text not null default '.*',
  news_url text,
  lottery_url text,
  priority int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.radar_lottery_sources is '公式ニュース/抽選ページ URL 登録（Phase 2）';
comment on column public.radar_lottery_sources.brand_pattern is 'ブランド名マッチ用正規表現（大文字小文字無視）';
comment on column public.radar_lottery_sources.model_pattern is 'モデル名マッチ用正規表現（大文字小文字無視）';

insert into public.radar_lottery_sources (slug, label, brand_pattern, model_pattern, news_url, lottery_url, priority)
values
  ('nike-snkrs', 'Nike SNKRS', '^(nike|jordan)$', '.*', 'https://www.nike.com/jp/launch', 'https://www.nike.com/jp/launch', 10),
  ('adidas-confirmed', 'adidas CONFIRMED', '^adidas$', '.*', 'https://www.adidas.com/jp', 'https://www.adidas.com/jp', 10),
  ('converse-launch', 'Converse 抽選', '^converse$', '.*', 'https://www.converse.com/jp', 'https://www.converse.com/jp', 10),
  ('new-balance-jp', 'New Balance JP', '^new balance$', '.*', 'https://newbalance.co.jp', null, 5),
  ('kith-collab', 'KITH コラボ', '.*', 'kith', 'https://kith.com/', 'https://kith.com/', 20),
  ('beams-collab', 'BEAMS コラボ', '.*', 'beams', 'https://www.beams.co.jp/', 'https://www.beams.co.jp/', 20),
  ('travis-scott', 'Travis Scott x Nike', '.*', 'travis scott', 'https://www.nike.com/jp/launch', 'https://www.nike.com/jp/launch', 25)
on conflict (slug) do nothing;

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

create index if not exists push_subscriptions_user_id_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

create policy "Users manage own push subscriptions"
  on public.push_subscriptions
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

comment on table public.push_subscriptions is 'Web Push 購読（Phase 2）';

alter table public.radar_lottery_sources enable row level security;

create policy "Public read lottery sources"
  on public.radar_lottery_sources
  for select
  to anon, authenticated
  using (is_active = true);
