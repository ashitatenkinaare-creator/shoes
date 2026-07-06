# KicksDB カタログ同期

KicksDB API から `radar_sneakers` テーブルへ新作カタログを同期してください。

## 前提

- `.env.local` に `KICKSDB_API_KEY` / `SUPABASE_SERVICE_ROLE_KEY` / `CRON_SECRET` を設定
- 開発サーバー起動: `npm run dev`

## 手順

1. `POST /api/radar/sync` を `Authorization: Bearer $CRON_SECRET` 付きで呼び出す
2. レスポンスの同期件数を報告
3. Supabase MCP または Dashboard で `radar_sneakers` の更新を確認

エラー時は API レスポンスと環境変数の不足を報告してください。
