-- Phase 1: シルエット・コラボブランド指定フィルタ

alter table public.user_preferences
  add column if not exists silhouettes text[] not null default '{}',
  add column if not exists collab_brands text[] not null default '{}';

comment on column public.user_preferences.silhouettes is '指定時、モデル名がシルエットキーワードに一致するもののみ表示（空=全て）';
comment on column public.user_preferences.collab_brands is '指定時、KITH / BEAMS 等のコラボブランド名に一致するもののみ表示（空=全て）';
