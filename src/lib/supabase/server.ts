import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * App Router の Server Component / Route Handler 専用。
 * Client Component から import しないこと（categories-db.ts 等の client 版を使う）。
 */
export async function createServerSupabase() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase の環境変数が未設定です");
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component からの呼び出し時は書き込み不可
        }
      },
    },
  });
}
