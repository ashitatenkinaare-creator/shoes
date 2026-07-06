# 品質チェック（型・Lint・Prettier）

評価基準「6. 品質」に沿って、以下を順に実行し結果を報告してください。

## 実行コマンド

```bash
npx tsc --noEmit
npm run lint
npm run format:check
npm test -- --run
```

## 報告形式

| チェック   | 結果        | 備考           |
| ---------- | ----------- | -------------- |
| TypeScript | PASS / FAIL | エラー数       |
| ESLint     | PASS / FAIL | エラー・警告数 |
| Prettier   | PASS / FAIL |                |
| Vitest     | PASS / FAIL | 件数           |

失敗があれば原因と修正方針を提示してください。
