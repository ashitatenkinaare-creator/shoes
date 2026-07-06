# デモデータ投入

評価用デモアカウント・カタログ・通知サンプルを Supabase に投入してください。

## 手順

1. `.env.local` に `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` が設定されているか確認
2. `npm run seed:demo` を実行
3. 成功したら以下を報告:
   - デモアカウント: `demo@sneaker-radar.app` / `DemoPass1234`
   - 確認 URL: `http://localhost:3000/auth` → ログイン → `/dashboard` → 通知パネル

失敗時はエラーメッセージと不足している環境変数を特定してください。
