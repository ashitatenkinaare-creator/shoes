import { execSync } from "node:child_process";

export default async function globalSetup() {
  if (process.env.SKIP_E2E_SEED === "1") return;

  try {
    execSync("node scripts/seed-e2e-radar-data.mjs", { stdio: "pipe" });
  } catch {
    // サービスロール未設定時は KicksDB 同期済み DB を前提に続行
  }
}
