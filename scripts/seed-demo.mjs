/**
 * 評価用デモデータ一式（カタログ + デモアカウント）を投入
 * 使い方: node scripts/seed-demo.mjs
 */
import { execSync } from "node:child_process";

function run(script) {
  execSync(`node scripts/${script}`, { stdio: "inherit" });
}

run("seed-e2e-radar-data.mjs");
run("seed-demo-account.mjs");

console.log("\nDemo seed complete. Login at /auth with demo@sneaker-radar.app / DemoPass1234");
