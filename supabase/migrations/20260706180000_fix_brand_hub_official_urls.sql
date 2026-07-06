-- ブランド公式ハブ URL の修正（Mobify sitePath エラー / 国選択ページ / 閉鎖 Yeezy ページ）

update public.radar_lottery_sources
set
  news_url = 'https://converse.co.jp/',
  lottery_url = 'https://converse.co.jp/'
where slug = 'converse-launch';

update public.radar_lottery_sources
set
  news_url = 'https://shop.newbalance.jp/on/demandware.store/Sites-NBJP-Site/ja_JP/Home-Show',
  lottery_url = 'https://shop.newbalance.jp/on/demandware.store/Sites-NBJP-Site/ja_JP/Home-Show'
where slug = 'new-balance-jp';

update public.radar_sneakers
set
  lottery_url = 'https://shop.newbalance.jp/on/demandware.store/Sites-NBJP-Site/ja_JP/Home-Show',
  store_url = 'https://shop.newbalance.jp/on/demandware.store/Sites-NBJP-Site/ja_JP/Home-Show'
where lower(lottery_url) in (
  'https://shop.newbalance.jp',
  'https://shop.newbalance.jp/',
  'https://newbalance.co.jp',
  'https://newbalance.co.jp/'
);

update public.radar_sneakers
set
  lottery_url = 'https://converse.co.jp/',
  store_url = 'https://converse.co.jp/'
where lower(lottery_url) in (
  'https://www.converse.com/jp',
  'https://www.converse.com/jp/'
);

update public.radar_sneakers
set
  lottery_url = 'https://www.adidas.com/jp',
  store_url = 'https://www.adidas.com/jp'
where lower(lottery_url) like '%adidas.com/jp/yeezy%';
