-- 存在しない newbalance.co.jp を除去し、NB 公式ストア URL を更新

update public.radar_lottery_sources
set news_url = 'https://shop.newbalance.jp'
where slug = 'new-balance-jp';

update public.radar_sneakers
set news_url = null
where news_url is not null
  and (
    lower(news_url) like '%newbalance.co.jp%'
    or lower(news_url) = 'https://shop.newbalance.jp'
    or lower(news_url) = 'https://shop.newbalance.jp/'
  );

update public.radar_sneakers
set store_url = 'https://shop.newbalance.jp'
where lower(brand) = 'new balance'
  and (
    lower(store_url) like '%newbalance.co.jp%'
    or store_url = 'https://www.nike.com/jp/launch'
  );
