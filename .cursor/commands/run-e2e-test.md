# Sneaker Radar E2E テスト実行

`docs/e2e/test-cases.md` と `.cursor/rules/e2e-test.mdc` を参照し、Playwright E2E テストを実行してください。

## 手順

1. アプリが起動していることを確認（未起動なら `npm run dev`）
2. `npm run test:e2e` を実行
3. 失敗時は以下を収集して報告:
   - スクリーンショット（`test-results/`）
   - コンソールログ
   - 失敗直前のネットワークリクエスト
4. 結果サマリー（成功/失敗件数、失敗テスト名）を報告

ベース URL: `http://localhost:3000`
