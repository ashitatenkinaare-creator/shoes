---
description: KicksDB から radar_sneakers へカタログを同期する
---

# KicksDB カタログ同期

1. `KICKSDB_API_KEY` / `CRON_SECRET` が `.env.local` に設定されているか確認
2. `npm run dev` 起動後、`POST /api/radar/sync` を Bearer 認証付きで呼び出す
3. 同期件数を報告

エラー時はレスポンス内容と不足環境変数を特定してください。
