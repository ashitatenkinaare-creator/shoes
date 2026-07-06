/**
 * AI 駆動開発セットアップの検証
 * 使い方: node scripts/verify-ai-setup.mjs
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
let failed = 0;

function check(label, ok, detail = "") {
  if (ok) {
    console.log(`✅ ${label}${detail ? `: ${detail}` : ""}`);
    return;
  }
  failed += 1;
  console.log(`❌ ${label}${detail ? `: ${detail}` : ""}`);
}

const cursorCommands = existsSync(resolve(root, ".cursor/commands"))
  ? readdirSync(resolve(root, ".cursor/commands")).filter((f) => f.endsWith(".md"))
  : [];
const claudeCommands = existsSync(resolve(root, ".claude/commands"))
  ? readdirSync(resolve(root, ".claude/commands")).filter((f) => f.endsWith(".md"))
  : [];
const cursorRules = existsSync(resolve(root, ".cursor/rules"))
  ? readdirSync(resolve(root, ".cursor/rules")).filter((f) => f.endsWith(".mdc"))
  : [];

check(
  "Cursor スラッシュコマンド 3件以上",
  cursorCommands.length >= 3,
  `${cursorCommands.length}件`,
);
check(
  "Claude Code スラッシュコマンド 3件以上",
  claudeCommands.length >= 3,
  `${claudeCommands.length}件`,
);
check("Cursor Rules 設定", cursorRules.length >= 3, `${cursorRules.length}件`);

const mcpPath = resolve(root, ".cursor/mcp.json");
const mcpExists = existsSync(mcpPath);
check("GitHub MCP 設定ファイル (.cursor/mcp.json)", mcpExists);

if (mcpExists) {
  const mcp = JSON.parse(readFileSync(mcpPath, "utf8"));
  check("GitHub MCP サーバー定義", Boolean(mcp.mcpServers?.github));
}

const token = process.env.GITHUB_TOKEN;
check(
  "GITHUB_TOKEN 環境変数",
  Boolean(token && token.length > 10),
  token
    ? "設定済み"
    : "未設定 — PowerShell: [System.Environment]::SetEnvironmentVariable('GITHUB_TOKEN','ghp_xxx','User') 後 Cursor 再起動",
);

console.log("");
if (failed === 0) {
  console.log("AI 駆動開発セットアップ: すべて OK");
  process.exit(0);
}

console.log(`AI 駆動開発セットアップ: ${failed} 件要対応`);
process.exit(1);
