# Sneaker Radar 実装・品質チェックリスト (難易度C)

最終確認: 2026-07-06 — Vitest 36/36 passed、Playwright 31/31 passed（Phase 2 公式 URL 同期・Web Push 追加後）

## 1. 自動テスト (Playwrightにて実行)

開発のたびに `npx playwright test` を実行し、全通過を確認すること。

| カテゴリ    | テスト項目                                          | 状態                        |
| :---------- | :-------------------------------------------------- | :-------------------------- |
| **5. 機能** | 全画面表示 / CRUD(CRUD) / サインアップ / ログアウト | [x] `functionality.spec.ts` |
| CRUD(C)     | 新規設定の保存がDB/localStorageに反映される         | [x]                         |
| CRUD(R)     | ダッシュボードにスニーカーリストが表示される        | [x]                         |
| CRUD(U)     | 設定内容の更新が反映される                          | [x]                         |
| CRUD(D)     | ウォッチリストからの削除ができる                    | [x]                         |
| Auth        | サインアップ・ログイン・ログアウトの導線確認        | [x]                         |
| 品質        | 型エラー、環境変数欠損チェック                      | [x]                         |
| フィルタ    | レア・コラボ / シルエット・コラボブランド絞り込み   | [x]                         |
| ユニット    | Vitest（kicksdb-map / filter / categories 等）      | [x]                         |

### 5. 機能（評価基準）と E2E の対応

| 評価項目               | テスト                                   |
| ---------------------- | ---------------------------------------- |
| 全画面がエラーなく表示 | `functionality.spec.ts` + `demo.spec.ts` |
| 登録 CRUD(C)           | 設定保存 + `/sneakers` 登録              |
| 表示 CRUD(R)           | ダッシュボード一覧                       |
| 更新 CRUD(U)           | 設定のブランド変更                       |
| 削除 CRUD(D)           | ウォッチリスト削除                       |
| サインアップ           | 新規登録 → ダッシュボード                |
| ログアウト             | デモアカウント → ログアウト → `/auth`    |

## 2. 品質・ドキュメント確認 (手動チェック用)

デプロイ前および機能追加時に確認すること。

- [x] **要件定義**: 独自アプリであり、LLM API（Gemini/OpenAI）による通知文案生成が組み込まれているか。
- [x] **デモ環境**: README にデモ URL・デモアカウント（`demo@sneaker-radar.app`）・`npm run seed:demo` が記載されているか。
- [x] **UI/UX**:
  - [x] 全画面レスポンシブ対応（スマホ・PC）
  - [x] アイコン・画像素材が用途に適している
  - [x] 不要な記述・誤字脱字がない
- [x] **コード品質**:
  - [x] `type` 定義が正確で、`any` を使用していないか
  - [x] 環境変数 (`.env`) に機密情報が分離されているか
  - [x] ESLint + Prettier で整形・Lint が通る（`npm run lint` / `npm run format:check`）

## 3. 難易度C 総点検メモ (2026-07-05)

- **CRUD / 画面表示**: 全 Radar 画面 + 管理 CRUD が E2E で検証済み
- **認証**: Supabase Auth（サインアップ・ログイン・ログアウト・callback）実装済み。ゲストは localStorage フォールバック
- **型 / 環境変数 / Lint**: `tsc --noEmit` エラー 0、ESLint エラー 0、Prettier 設定済み、API キーは `.env.local` 経由のみ
- **クリーンアップ**: デモ用 `math.js` / `form.test.js` を削除、未使用 import 整理、ESLint が `dist/` を除外
