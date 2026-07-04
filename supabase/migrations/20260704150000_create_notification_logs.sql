-- Sneaker Radar: 2段階通知ログ（発表 / 発売）

create table public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  sneaker_id uuid not null references public.radar_sneakers (id) on delete cascade,
  phase text not null check (phase in ('announcement', 'release')),
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, sneaker_id, phase)
);

comment on table public.notification_logs is 'Sneaker Radar 2段階通知ログ（MVP: アプリ内通知）';

create index notification_logs_user_id_idx on public.notification_logs (user_id);
create index notification_logs_unread_idx on public.notification_logs (user_id, read_at)
  where read_at is null;

alter table public.notification_logs enable row level security;

create policy "notification_logs_select_own"
  on public.notification_logs
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "notification_logs_insert_own"
  on public.notification_logs
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "notification_logs_update_own"
  on public.notification_logs
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "notification_logs_delete_own"
  on public.notification_logs
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.notification_logs to authenticated;
