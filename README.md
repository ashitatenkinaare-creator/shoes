# SneakerDrop / Sneaker Radar

スニーカー関連の Web アプリケーション群です。

| アプリ | 概要 |
|--------|------|
| **SneakerDrop** | マーケットプレイス風ランディング + 管理 CRUD |
| **Sneaker Radar** | 好み条件に合う新作をピックアップし、発表・発売の2段階通知を行うパートナーアプリ |

## 技術スタック

- **Next.js 16** (App Router)
- **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Supabase** (PostgreSQL + Auth)
- **Playwright** (E2E) / **Vitest** (ユニット)

---

## セットアップ

### 1. 依存関係

```bash
npm install
```

### 2. 環境変数

`.env.example` をコピーして `.env.local` を作成します。

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Supabase Dashboard → **Project Settings → API** から取得してください。

### 3. Supabase Auth 設定

**Authentication → URL Configuration** に以下を追加:

| 種別 | URL |
|------|-----|
| Site URL | `http://localhost:3000` |
| Redirect URLs | `http://localhost:3000/auth/callback` |

### 4. 開発サーバー

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開きます。

---

## SneakerDrop（マーケットプレイス）

| パス | 説明 |
|------|------|
| `/` | Launches（ランディング） |
| `/vault` | The Vault（カタログ） |
| `/drops/[slug]` | 商品詳細 |
| `/register` | 会員登録（デモ UI） |
| `/sneakers` | 管理 CRUD（Supabase `sneakers` テーブル） |

---

## Sneaker Radar（パートナーアプリ）

| パス | 説明 | 認証 |
|------|------|------|
| `/dashboard` | 新作ピックアップ・通知確認 | 不要 |
| `/settings` | ブランド/サイズ/通知条件 | **必須** |
| `/watchlist` | ウォッチリスト管理 | **必須** |
| `/sneaker/[id]` | スニーカー詳細 | 不要 |
| `/auth` | ログイン / 新規登録 | — |

### デモの流れ

1. `/auth` でアカウント作成（メール + 8文字以上 PW）
2. `/settings` でブランド・サイズ・2段階通知を ON にして保存
3. `/dashboard` で新作をウォッチリストに追加
4. 「通知を確認」→ 発表/発売通知が自動生成（ウォッチ + 条件に基づく）
5. 「デモ通知を送信」でサンプル通知を追加可能

### 2段階通知（MVP）

| フェーズ | トリガー（サンプル実装） |
|----------|--------------------------|
| **発表通知** | ウォッチ中 & 発表から7日以内 & 設定 ON |
| **発売通知** | ウォッチ中 & 発売まで3日以内 & 設定 ON |

通知は `notification_logs` テーブルに保存され、ダッシュボードのパネルで確認します。  
本番拡張: Supabase Edge Functions + Web Push / FCM 連携を想定。

### KicksDB カタログ同期

新作カタログは [KicksDB Standard API](https://docs.kicks.dev/guides)（StockX データ）から `radar_sneakers` へ日次同期します。

1. [kicks.dev](https://kicks.dev/register) で API キー取得（無料 1,000 req/月）
2. `.env.local` に `KICKSDB_API_KEY` と `SUPABASE_SERVICE_ROLE_KEY` を設定
3. マイグレーション `20260704160000_add_radar_sneakers_source.sql` を適用
4. 手動同期:

```bash
curl -X POST http://localhost:3000/api/radar/sync \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Edge Function（本番 Cron 雛形）**: `supabase/functions/sync-radar-releases/`

```bash
supabase functions deploy sync-radar-releases
# Supabase Dashboard → Edge Functions → Secrets に KICKSDB_API_KEY 等を設定
# Cron: 0 3 * * * （毎日 03:00 UTC など）
```

| 環境変数 | 用途 |
|----------|------|
| `KICKSDB_API_KEY` | KicksDB 認証 |
| `SUPABASE_SERVICE_ROLE_KEY` | DB upsert |
| `CRON_SECRET` | 同期 API / Edge Function 保護 |
| `KICKSDB_SYNC_LIMIT` | 1回あたり取得件数（既定 20） |

`announce_date` は MVP では `release_date - 14日` のヒューリスティックです（Phase 2 で RSS 連携予定）。

### Supabase テーブル（Radar）

| テーブル | 用途 |
|----------|------|
| `radar_sneakers` | カタログ（シード + KicksDB 同期） |
| `user_preferences` | 好み条件 |
| `watchlist` | ウォッチリスト |
| `notification_logs` | 2段階通知ログ |

---

## スクリプト

| コマンド | 内容 |
|----------|------|
| `npm run dev` | 開発サーバー |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー |
| `npm run lint` | ESLint |
| `npm test` | Vitest |
| `npm run test:e2e` | Playwright（`/sneakers` 管理画面） |

## E2E テスト

```bash
npm run test:e2e
```

ベース URL: `http://localhost:3000`（Playwright `webServer` で自動起動）

---

## ディレクトリ構成（抜粋）

```
src/
  app/
    (radar)/          # Sneaker Radar ページ
    sneakers/         # 管理 CRUD
    vault/            # SneakerDrop Vault
  components/
    radar/            # Radar UI
    landing/          # SneakerDrop ランディング
    sneakers/         # 管理 UI
  hooks/              # useAuthSession, useWatchlist 等
  lib/
    radar/            # Radar API レイヤー
    supabase/         # Supabase クライアント
supabase/
  migrations/         # DB マイグレーション
  functions/
    sync-radar-releases/  # KicksDB 日次同期（Edge Function 雛形）
    _shared/              # Next.js / Edge Function 共通ロジック
```

---

## 注意事項

- `.env.local` は Git に含めないでください
- `/settings` `/watchlist` は Middleware でログイン必須
- 管理画面 `/sneakers` の `public.sneakers` テーブルは RLS 未設定（開発用）
