import { execSync } from "node:child_process";
import { test, expect } from "@playwright/test";
import { loadEnvLocal } from "./helpers/env";

function loadEnvLocalForTest(): Record<string, string> {
  return loadEnvLocal();
}

test.describe("品質チェック", () => {
  test("TypeScript に型エラーがない", () => {
    execSync("npx tsc --noEmit", { stdio: "pipe" });
  });

  test("必須環境変数が .env.local に設定されている", () => {
    const env = loadEnvLocalForTest();
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBeTruthy();
    expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeTruthy();
  });

  test("主要 Radar ページがエラーなく表示される", async ({ page }) => {
    for (const path of ["/dashboard", "/settings", "/watchlist", "/auth"]) {
      await page.goto(path);
      await expect(page.locator("body")).not.toContainText("Application error");
    }
  });
});
