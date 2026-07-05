-- マルチカテゴリ: スニーカー / アパレル / 雑貨 等を自由登録可能に

create table public.radar_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  label text not null,
  description text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.radar_categories is 'Radar カタログカテゴリ（スニーカー・アパレル・雑貨等）';
comment on column public.radar_categories.slug is 'URL/API 用識別子（例: sneakers, apparel, accessories）';

create index radar_categories_sort_order_idx on public.radar_categories (sort_order);
create index radar_categories_is_active_idx on public.radar_categories (is_active) where is_active = true;

create trigger radar_categories_set_updated_at
  before update on public.radar_categories
  for each row execute function public.set_updated_at();

insert into public.radar_categories (slug, label, description, sort_order) values
  ('sneakers', 'スニーカー', 'フットウェア・スニーカー新作', 1),
  ('apparel', 'アパレル', 'Gパン・Gジャン等のアパレル', 2),
  ('accessories', '雑貨', '時計・バッグ等の雑貨', 3);

-- 既存カタログはすべてスニーカー扱い
alter table public.radar_sneakers
  add column if not exists category_id uuid references public.radar_categories (id);

update public.radar_sneakers
set category_id = (select id from public.radar_categories where slug = 'sneakers')
where category_id is null;

alter table public.radar_sneakers
  alter column category_id set not null;

create index if not exists radar_sneakers_category_id_idx
  on public.radar_sneakers (category_id);

comment on column public.radar_sneakers.category_id is '所属カテゴリ（radar_categories.id）';

-- ユーザーが表示するカテゴリ（空=全カテゴリ）
alter table public.user_preferences
  add column if not exists categories text[] not null default '{}';

comment on column public.user_preferences.categories is '表示対象カテゴリ slug（空=全カテゴリ）';

-- RLS: カテゴリは読み取りのみ公開
alter table public.radar_categories enable row level security;

create policy "radar_categories_select_public"
  on public.radar_categories
  for select
  to anon, authenticated
  using (is_active = true);

grant select on public.radar_categories to anon, authenticated;
