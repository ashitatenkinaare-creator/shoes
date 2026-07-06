-- 公式発表 URL / 抽選ページ URL と第2弾通知フェーズ

alter table public.radar_sneakers
  add column if not exists news_url text,
  add column if not exists lottery_url text,
  add column if not exists lottery_opened_at timestamptz;

comment on column public.radar_sneakers.news_url is '公式ニュース・特設ページ URL（第1弾通知リンク）';
comment on column public.radar_sneakers.lottery_url is '公式抽選・販売エントリー URL（第2弾通知リンク）';
comment on column public.radar_sneakers.lottery_opened_at is '抽選ページが検知・開設された日時';

alter table public.notification_logs
  add column if not exists action_url text;

alter table public.notification_logs
  drop constraint if exists notification_logs_phase_check;

alter table public.notification_logs
  add constraint notification_logs_phase_check
  check (phase in ('announcement', 'lottery_open', 'release'));

comment on column public.notification_logs.action_url is '通知タップ時の遷移先（news_url または lottery_url）';
