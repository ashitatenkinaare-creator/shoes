# AI駆動開発 — 評価基準チェックリスト

評価カテゴリ **「AI駆動開発」**（難易度 C）の3項目と、本リポジトリでの設定場所です。

## チェックリスト

| 項目                                             | 状態                | 設定場所            |
| ------------------------------------------------ | ------------------- | ------------------- |
| Claude Code にカスタムスラッシュコマンド 3つ以上 | ✅ 4件              | `.claude/commands/` |
| Claude または Cursor に GitHub MCP 設定          | ✅ 設定ファイルあり | `.cursor/mcp.json`  |
| Cursor に cursor rules 設定                      | ✅ 3ルール          | `.cursor/rules/`    |

---

## 1. カスタムスラッシュコマンド（4件）

### Claude Code（`.claude/commands/`）

| コマンド              | ファイル                | 用途                             |
| --------------------- | ----------------------- | -------------------------------- |
| `/run-e2e-test`       | `run-e2e-test.md`       | Playwright E2E 実行              |
| `/run-quality-check`  | `run-quality-check.md`  | tsc / ESLint / Prettier / Vitest |
| `/seed-demo`          | `seed-demo.md`          | デモデータ・デモアカウント投入   |
| `/sync-radar-catalog` | `sync-radar-catalog.md` | KicksDB → Supabase 同期          |

Claude Code で `/` を入力すると上記コマンドが表示されます。

### Cursor（`.cursor/commands/`）

同じ4コマンドを Cursor Agent でも利用できます（内容は Claude Code 版と同等）。

> 旧パス `.cursor/rules/commands/` は非推奨。`.cursor/commands/` を使用してください。

---

## 2. GitHub MCP

プロジェクト設定: [`.cursor/mcp.json`](../.cursor/mcp.json)

```json
{
  "mcpServers": {
    "github": {
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer ${env:GITHUB_TOKEN}"
      }
    }
  }
}
```

### 有効化手順

1. [GitHub Personal Access Token](https://github.com/settings/tokens) を作成（`repo` スコープ推奨）
2. 環境変数 `GITHUB_TOKEN` に PAT を設定（PowerShell 例）:

   ```powershell
   [System.Environment]::SetEnvironmentVariable("GITHUB_TOKEN", "ghp_xxxx", "User")
   ```

3. Cursor を再起動
4. **Settings → Tools & MCP** で `github` が緑（接続済み）であることを確認

トークンは `.env.local` や Git に含めないでください。

---

## 3. Cursor Rules

| ルール           | ファイル                  | 適用                        |
| ---------------- | ------------------------- | --------------------------- |
| プロジェクト共通 | `project-conventions.mdc` | 常時 (`alwaysApply: true`)  |
| E2E テスト       | `e2e-test.mdc`            | `src/e2e/**/*`              |
| Supabase 開発    | `supabase.mdc`            | `src/lib/**`, `supabase/**` |

Rules は Cursor Agent が自動的にコンテキストとして読み込みます。

---

## 確認方法（評価者向け）

1. **スラッシュコマンド**: Cursor / Claude Code で `/` → 4コマンドが一覧表示される
2. **GitHub MCP**: Cursor Settings → MCP → `github` 接続確認
3. **Cursor Rules**: `.cursor/rules/*.mdc` が3ファイル存在する

自動検証:

```bash
npm run verify:ai-setup
```

`GITHUB_TOKEN` 未設定の場合は ❌ と表示されます（PAT 設定後 Cursor 再起動で ✅）。

---

## Phase 2（公式 URL 同期・Web Push）

| 機能              | コマンド / 場所                                                          |
| ----------------- | ------------------------------------------------------------------------ |
| 公式 URL 一括同期 | `npm run sync:official-urls` または `POST /api/radar/sync-official-urls` |
| Web Push 購読     | `/settings` → 「ブラウザ通知を有効にする」                               |
| VAPID 鍵          | `.env.local` に `VAPID_*` / `NEXT_PUBLIC_VAPID_PUBLIC_KEY`               |

KicksDB 同期（`/sync-radar-catalog`）後も `radar_lottery_sources` から `news_url` / `lottery_url` を自動更新します。
