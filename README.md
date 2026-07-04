# SneakerDrop

スニーカードロップ情報を扱う Web アプリです。マーケットプレイス風のランディングページと、Supabase 連携の管理画面（CRUD）で構成されています。

## 技術スタック

- **Next.js 16** (App Router)
- **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Supabase** (PostgreSQL)
- **Playwright** (E2E) / **Vitest** (ユニット)

## 主要ルート

| パス | 説明 |
|------|------|
| `/` | Launches（ランディング・Upcoming Drops） |
| `/vault` | The Vault（カタログ一覧） |
| `/drops/[slug]` | 商品詳細 |
| `/register` | 会員登録（デモ UI） |
| `/sneakers` | 管理画面（登録・一覧・通知・削除） |

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数

`.env.example` をコピーして `.env.local` を作成し、Supabase の値を設定します。

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Supabase Dashboard → **Project Settings → API** から取得してください。

### 3. 開発サーバー

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## スクリプト

| コマンド | 内容 |
|----------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー起動 |
| `npm run lint` | ESLint |
| `npm test` | Vitest |
| `npm run test:e2e` | Playwright E2E（`/sneakers`） |

## E2E テスト

アプリは `http://localhost:3000` で起動している必要があります。Playwright 設定で `webServer` が有効なため、通常は以下だけで実行できます。

```bash
npm run test:e2e
```

## ディレクトリ構成（抜粋）

```
src/
  app/              # Next.js App Router ページ
  components/
    landing/        # マーケットプレイス UI
    sneakers/       # 管理画面 UI
    form/           # 登録フォーム
  hooks/            # useSneakers など
  lib/              # Supabase クライアント・API
  data/             # 静的ドロップデータ
  e2e/              # Playwright テスト
docs/e2e/           # E2E テストケース
```

## 注意事項

- `.env.local` は Git に含めないでください（`.gitignore` で除外済み）
- 管理画面 `/sneakers` は Supabase の `public.sneakers` テーブルに接続します
