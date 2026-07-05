# Sneaker Radar 実装・品質チェックリスト (難易度C)

最終確認: 2026-07-05 — Vitest 22/22 passed、Playwright 18/18 passed

## 1. 自動テスト (Playwrightにて実行)

開発のたびに `npx playwright test` を実行し、全通過を確認すること。

| カテゴリ | テスト項目 | 状態 |
| :--- | :--- | :--- |
| CRUD(C) | 新規設定の保存がDB/localStorageに反映される | [x] |
| CRUD(R) | ダッシュボードにスニーカーリストが表示される | [x] |
| CRUD(U) | 設定内容の更新が反映される | [x] |
| CRUD(D) | ウォッチリストからの削除ができる | [x] |
| Auth | サインアップ・ログイン・ログアウトの導線確認 | [x] |
| 品質 | 型エラー、環境変数欠損チェック | [x] |
| フィルタ | レア・コラボ / シルエット・コラボブランド絞り込み | [x] |
| ユニット | Vitest（kicksdb-map / filter / categories 等） | [x] |

## 2. 品質・ドキュメント確認 (手動チェック用)

デプロイ前および機能追加時に確認すること。

- [x] **要件定義**: 独自アプリであり、KicksDB連携(LLM等のAPI活用相当)が組み込まれているか。
- [x] **デモ環境**: READMEにデモURLおよびデモアカウント情報（ゲスト用）が記載されているか。
- [x] **UI/UX**:
    - [x] 全画面レスポンシブ対応（スマホ・PC）
    - [x] アイコン・画像素材が用途に適している
    - [x] 不要な記述・誤字脱字がない
- [x] **コード品質**:
    - [x] `type` 定義が正確で、`any` を使用していないか
    - [x] 環境変数 (`.env`) に機密情報が分離されているか
    - [x] コードがPrettier等で整形されているか

## 3. 今回の修正メモ

- `src/e2e/helpers/radar-catalog.ts`: スニーカーカード行のセレクタを `region` + `:has(a[href^="/sneaker/"])` に修正
- `src/e2e/watchlist.spec.ts`: 重複リンクを避けてユニーク ID をシード
- `src/lib/radar/catalog-db.server.ts` / `catalog-client.ts`: `radar_categories` 未適用 DB 向けフォールバック
