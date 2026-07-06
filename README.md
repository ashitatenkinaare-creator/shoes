# SneakerDrop / Sneaker Radar

スニーカー新作の発売情報を閲覧し、好みに合うモデルを追跡して **2段階通知**（公式発表 → 抽選ページ開設）を受け取れる Web アプリケーション群です。

| アプリ            | 概要                                                                               |
| ----------------- | ---------------------------------------------------------------------------------- |
| **SneakerDrop**   | マーケットプレイス風ランディング + 管理 CRUD                                       |
| **Sneaker Radar** | 好み条件に合う新作をピックアップし、発表・抽選ページ開設を通知するパートナーアプリ |

---

## 目次

1. [デモ URL](#デモ-url)
2. [デモアカウント](#デモアカウント)
3. [要件定義](#要件定義)
4. [機能一覧](#機能一覧)
5. [使用フレームワーク・ライブラリ](#使用フレームワークライブラリ)
6. [使用外部 API](#使用外部-api)
7. [セットアップ](#セットアップ)
8. [スクリプト・テスト](#スクリプトテスト)

---

## デモ URL

`npm run dev` で起動後、以下の URL から全画面を確認できます。

**ベース URL:** [http://localhost:3000](http://localhost:3000)

本番デプロイ時は環境変数 `NEXT_PUBLIC_DEMO_BASE_URL` でベース URL を上書きできます。

| 画面                  | URL                                                                                                                                      | 確認できること               |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| SneakerDrop トップ    | [http://localhost:3000/](http://localhost:3000/)                                                                                         | 注目ドロップ・今後の発売     |
| スニーカーカタログ    | [http://localhost:3000/vault](http://localhost:3000/vault)                                                                               | ブランド絞り込み・検索       |
| 商品詳細（第2弾デモ） | [http://localhost:3000/drops/retro-4-safety-blaze](http://localhost:3000/drops/retro-4-safety-blaze)                                     | 抽選ページ開設済みボタン     |
| Radar ダッシュボード  | [http://localhost:3000/dashboard](http://localhost:3000/dashboard)                                                                       | 新作ピックアップ・通知パネル |
| 条件設定              | [http://localhost:3000/settings](http://localhost:3000/settings)                                                                         | 第1弾 / 第2弾通知トグル      |
| ウォッチリスト        | [http://localhost:3000/watchlist](http://localhost:3000/watchlist)                                                                       | お気に入り管理               |
| ログイン              | [http://localhost:3000/auth](http://localhost:3000/auth)                                                                                 | デモアカウントでログイン     |
| Radar 詳細（第1弾）   | [http://localhost:3000/sneaker/11111111-1111-1111-1111-111111111101](http://localhost:3000/sneaker/11111111-1111-1111-1111-111111111101) | 「公式発表を見る」           |
| Radar 詳細（第2弾）   | [http://localhost:3000/sneaker/11111111-1111-1111-1111-111111111102](http://localhost:3000/sneaker/11111111-1111-1111-1111-111111111102) | 「公式抽選・販売ページへ」   |
| 管理 CRUD             | [http://localhost:3000/sneakers](http://localhost:3000/sneakers)                                                                         | スニーカー登録・一覧         |
| 会員登録（デモ UI）   | [http://localhost:3000/register](http://localhost:3000/register)                                                                         | 入力チェックのみ             |

### デモデータの投入

Supabase に評価用カタログ・デモアカウントを一括投入:

```bash
npm run seed:demo
```

---

## デモアカウント

| 項目               | 値                       |
| ------------------ | ------------------------ |
| **メールアドレス** | `demo@sneaker-radar.app` |
| **パスワード**     | `DemoPass1234`           |

**ログイン後に確認できる機能**

- 条件設定の Supabase 保存
- ウォッチリストのクラウド同期
- 2段階通知パネル（第1弾 × 2・第2弾 × 1 のサンプル通知付き）

**ゲスト（未ログイン）** でも `/dashboard` `/settings` `/watchlist` は localStorage で体験可能です。通知機能のみログイン必須です。

### おすすめデモ手順

1. `/auth` でデモアカウントにログイン
2. `/settings` でブランド・サイズ・2段階通知を ON にして保存
3. `/dashboard` で「通知を確認」→ 第1弾 / 第2弾通知を確認
4. 第1弾・第2弾の詳細 URL（上表）でボタン切り替えを確認

---

## 要件定義

### 背景・課題

SNKRDUNK 等のタイムライン型アプリでは、欲しい情報が流れて見逃しやすい。さらに、コラボ新作の **第一報（公式発表）** 時点では購入・抽選ページの URL がまだ存在せず、ユーザーが自分でサイトを巡回して **販売ページ開設** を確認しなければならない。

### 目的

1. **好みに合う新作を一覧で固定表示** し、タイムライン問題を回避する
2. **2段階通知** で「公式発表」と「抽選ページ開設」の両方を逃さない
3. 抽選・発売を逃さないパーソナルなスニーカー情報パートナーを提供する

### 提供価値

| 提供価値       | 内容                                                                    |
| -------------- | ----------------------------------------------------------------------- |
| 発売情報の閲覧 | SneakerDrop で本日・今後・アーカイブを日本語 UI で閲覧                  |
| パーソナライズ | ブランド・シルエット・コラボ・レア条件で Radar ダッシュボードを絞り込み |
| お気に入り管理 | ウォッチリストで気になるモデルを保存し、発売日順で管理                  |
| 2段階通知      | 第1弾（公式発表）→ 第2弾（抽選ページ開設）をアプリ内パネルで通知        |
| LLM 文案生成   | Gemini / OpenAI で通知タイトル・本文を動的生成（フォールバックあり）    |

### 2段階通知（コア要件）

| 段階                        | トリガー                               | 通知内容                   | リンク先                       |
| --------------------------- | -------------------------------------- | -------------------------- | ------------------------------ |
| **第1弾（発表時）**         | `news_url` 登録 & 発表日から7日以内    | 新作コラボ発表の速報       | 公式ニュース URL（`news_url`） |
| **第2弾（抽選ページ開設）** | `lottery_url` 登録 & 開設日から7日以内 | 抽選・販売ページ開設の速報 | 抽選 URL（`lottery_url`）      |

詳細画面のボタンも段階に応じて自動切り替え:

- 第1弾のみ → 「公式発表を見る」（`news_url`）
- 第2弾開設後 → 「公式抽選・販売ページへ」（`lottery_url`）

### スコープ

| 対象                  | 内容                                                                                   |
| --------------------- | -------------------------------------------------------------------------------------- |
| **MVP 内**            | KicksDB カタログ同期、条件フィルタ、ウォッチリスト、アプリ内通知、LLM 文案、デモデータ |
| **Phase 2（実装済）** | 公式 URL 登録表（`radar_lottery_sources`）+ 同期、Web Push（VAPID 設定時）             |
| **対象外**            | SNS 監視、公式サイト自動クロール（将来拡張）                                           |

詳細仕様: [`docs/user-features.md`](docs/user-features.md) / [`docs/radar/product-requirements.md`](docs/radar/product-requirements.md)

---

## 機能一覧

### SneakerDrop（マーケットプレイス）

| 機能             | 画面            | 説明                                                 |
| ---------------- | --------------- | ---------------------------------------------------- |
| 本日・最新の発売 | `/`             | 注目ドロップ・今後の発売カード                       |
| カタログ閲覧     | `/vault`        | ブランドタブ・フリーワード検索                       |
| 商品詳細         | `/drops/[slug]` | 画像・価格・スペック・カウントダウン                 |
| 会員登録（デモ） | `/register`     | 入力チェック・成功メッセージ（実アカウント連携なし） |
| 管理 CRUD        | `/sneakers`     | スニーカーの **登録・一覧・更新・削除**（Supabase）  |

### Sneaker Radar（パートナーアプリ）

| 機能             | 画面            | 説明                                                                      |
| ---------------- | --------------- | ------------------------------------------------------------------------- |
| 新作ピックアップ | `/dashboard`    | 条件に合う新作一覧・通知パネル                                            |
| 条件設定         | `/settings`     | ブランド / サイズ / シルエット / コラボ / レアフィルタ / 2段階通知 ON/OFF |
| ウォッチリスト   | `/watchlist`    | お気に入り追加・削除・発売日順表示                                        |
| スニーカー詳細   | `/sneaker/[id]` | 詳細情報・公式リンク・ウォッチ追加                                        |
| 認証             | `/auth`         | **サインアップ・ログイン・ログアウト**（Supabase Auth）                   |

### 認証・データ保存

| 状態     | 条件設定 / ウォッチリスト   | 通知                         |
| -------- | --------------------------- | ---------------------------- |
| ゲスト   | localStorage に保存         | 利用不可（ログイン案内表示） |
| ログイン | Supabase に保存・端末間同期 | アプリ内パネルで受信         |

### その他

| 機能            | 説明                                                       |
| --------------- | ---------------------------------------------------------- |
| KicksDB 同期    | StockX 由来の新作カタログを `radar_sneakers` へ日次 upsert |
| LLM 通知文案    | 通知パネル表示時に Gemini / OpenAI で文案生成              |
| レスポンシブ UI | Tailwind ブレークポイントでスマホ・PC 対応                 |

---

## 使用フレームワーク・ライブラリ

### ランタイム

| 名称                                          | バージョン | 用途                         |
| --------------------------------------------- | ---------- | ---------------------------- |
| [Next.js](https://nextjs.org/)                | 16.x       | App Router、SSR / API Routes |
| [React](https://react.dev/)                   | 19.x       | UI コンポーネント            |
| [TypeScript](https://www.typescriptlang.org/) | 5.x        | 静的型付け                   |
| [Tailwind CSS](https://tailwindcss.com/)      | v4         | スタイリング・レスポンシブ   |

### バックエンド・データ

| 名称                              | 用途                             |
| --------------------------------- | -------------------------------- |
| [Supabase](https://supabase.com/) | PostgreSQL、Auth、Edge Functions |
| `@supabase/supabase-js`           | クライアント SDK                 |
| `@supabase/ssr`                   | Next.js 向け SSR 認証            |

### その他ライブラリ

| 名称                    | 用途                      |
| ----------------------- | ------------------------- |
| `@google/generative-ai` | Gemini による通知文案生成 |
| `lucide-react`          | アイコン                  |

### 開発・品質

| 名称                                  | 用途           |
| ------------------------------------- | -------------- |
| [Vitest](https://vitest.dev/)         | ユニットテスト |
| [Playwright](https://playwright.dev/) | E2E テスト     |
| [ESLint](https://eslint.org/)         | 静的解析       |
| [Prettier](https://prettier.io/)      | コード整形     |

---

## 使用外部 API

### Supabase

| 項目               | 内容                                                                               |
| ------------------ | ---------------------------------------------------------------------------------- |
| **用途**           | 認証（Auth）、PostgreSQL（カタログ・設定・ウォッチリスト・通知ログ）               |
| **エンドポイント** | プロジェクト URL（`NEXT_PUBLIC_SUPABASE_URL`）                                     |
| **認証**           | Anon Key（クライアント）/ Service Role Key（サーバー・シード）                     |
| **主なテーブル**   | `radar_sneakers`, `user_preferences`, `watchlist`, `notification_logs`, `sneakers` |

### KicksDB（StockX データ）

| 項目               | 内容                                                           |
| ------------------ | -------------------------------------------------------------- |
| **用途**           | 新作スニーカーカタログの取得・`radar_sneakers` への同期        |
| **エンドポイント** | `https://api.kicks.dev/v3/stockx/products`                     |
| **認証**           | `KICKSDB_API_KEY`（Bearer）                                    |
| **取得条件**       | `product_type = sneakers`、発売日範囲フィルタ                  |
| **ドキュメント**   | [https://docs.kicks.dev/guides](https://docs.kicks.dev/guides) |

### Google Gemini API

| 項目       | 内容                                                                            |
| ---------- | ------------------------------------------------------------------------------- |
| **用途**   | 2段階通知のタイトル・本文を動的生成                                             |
| **SDK**    | `@google/generative-ai`                                                         |
| **認証**   | `GEMINI_API_KEY`（サーバー専用）                                                |
| **モデル** | `gemini-2.0-flash`（`GEMINI_MODEL` で変更可）                                   |
| **実装**   | `src/lib/radar/llm-notification-copy.ts` → `POST /api/radar/sync-notifications` |

### OpenAI API（フォールバック）

| 項目               | 内容                                         |
| ------------------ | -------------------------------------------- |
| **用途**           | Gemini 未設定時の通知文案生成フォールバック  |
| **エンドポイント** | `https://api.openai.com/v1/chat/completions` |
| **認証**           | `OPENAI_API_KEY`（サーバー専用）             |
| **モデル**         | `gpt-4o-mini`（`OPENAI_MODEL` で変更可）     |

### 環境変数一覧

`.env.example` を `.env.local` にコピーして設定してください。

| 変数                            | 必須 | 用途                         |
| ------------------------------- | ---- | ---------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | ○    | Supabase プロジェクト URL    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ○    | クライアント認証             |
| `SUPABASE_SERVICE_ROLE_KEY`     | △    | シード・同期（サーバー専用） |
| `KICKSDB_API_KEY`               | △    | カタログ同期                 |
| `CRON_SECRET`                   | △    | 同期 API 保護                |
| `GEMINI_API_KEY`                | △    | LLM 通知文案                 |
| `OPENAI_API_KEY`                | △    | LLM フォールバック           |
| `DISABLE_LLM_NOTIFICATIONS=1`   | —    | テスト時に LLM 無効化        |

---

## セットアップ

### 1. 依存関係

```bash
npm install
```

### 2. 環境変数

```bash
cp .env.example .env.local
```

Supabase Dashboard → **Project Settings → API** から URL と Anon Key を取得して `.env.local` に設定します。

### 3. Supabase Auth 設定

**Authentication → URL Configuration**

| 種別          | URL                                   |
| ------------- | ------------------------------------- |
| Site URL      | `http://localhost:3000`               |
| Redirect URLs | `http://localhost:3000/auth/callback` |

### 4. デモデータ投入（任意）

```bash
npm run seed:demo
```

### 5. 開発サーバー起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開き、上記 [デモ URL](#デモ-url) から動作確認してください。

---

## スクリプト・テスト

### npm スクリプト

| コマンド               | 内容                            |
| ---------------------- | ------------------------------- |
| `npm run dev`          | 開発サーバー起動                |
| `npm run build`        | 本番ビルド                      |
| `npm run start`        | 本番サーバー                    |
| `npm run lint`         | ESLint                          |
| `npm run format`       | Prettier 整形                   |
| `npm run format:check` | Prettier チェック               |
| `npm test`             | Vitest ユニットテスト           |
| `npm run test:e2e`     | Playwright E2E テスト           |
| `npm run seed:demo`    | デモデータ + デモアカウント投入 |

### E2E テスト

```bash
npm run test:e2e
```

ベース URL: `http://localhost:3000`（Playwright `webServer` で自動起動）

### ディレクトリ構成（抜粋）

```
src/
  app/
    (radar)/          # Sneaker Radar ページ
    sneakers/         # 管理 CRUD
    vault/            # SneakerDrop カタログ
  components/
    radar/            # Radar UI
    landing/          # SneakerDrop ランディング
  lib/
    radar/            # 通知・フィルタ・LLM・KicksDB 同期
    supabase/         # Supabase クライアント
supabase/
  migrations/         # DB マイグレーション
  functions/          # Edge Functions（KicksDB 同期）
docs/
  user-features.md    # 機能仕様書（ユーザー視点）
  e2e/check-list.md   # 品質・E2E チェックリスト
```

---

## AI駆動開発（評価用）

| 項目                              | 設定                                                |
| --------------------------------- | --------------------------------------------------- |
| カスタムスラッシュコマンド（4件） | `.cursor/commands/` / `.claude/commands/`           |
| GitHub MCP                        | `.cursor/mcp.json`（`GITHUB_TOKEN` 環境変数が必要） |
| Cursor Rules                      | `.cursor/rules/`（3ルール）                         |

詳細: [`docs/ai-driven-development.md`](docs/ai-driven-development.md)

### スラッシュコマンド一覧

| コマンド              | 用途                             |
| --------------------- | -------------------------------- |
| `/run-e2e-test`       | Playwright E2E 実行              |
| `/run-quality-check`  | tsc / ESLint / Prettier / Vitest |
| `/seed-demo`          | デモデータ投入                   |
| `/sync-radar-catalog` | KicksDB カタログ同期             |

---

## 注意事項

- `.env.local` は Git に含めないでください
- 管理画面 `/sneakers` の `public.sneakers` テーブルは RLS 未設定（開発用）
- 通知はアプリ内パネル + Web Push（`/settings` で購読、VAPID 設定時）。FCM は未対応
- LLM API キー未設定時は固定文言にフォールバックします

---

## ライセンス

Private — 学校課題用プロジェクト
