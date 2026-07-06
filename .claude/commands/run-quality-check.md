---
description: TypeScript / ESLint / Prettier / Vitest の品質チェックを実行する
---

# 品質チェック

以下を順に実行し、PASS/FAIL を表形式で報告してください。

```bash
npx tsc --noEmit
npm run lint
npm run format:check
npm test -- --run
```

失敗があれば原因と修正方針を提示してください。
