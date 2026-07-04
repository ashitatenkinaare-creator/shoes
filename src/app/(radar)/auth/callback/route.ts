import { NextResponse } from "next/server";
import { sanitizeRedirectPath } from "@/lib/radar/auth-routes";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = sanitizeRedirectPath(searchParams.get("redirect"));

  if (code) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        `${origin}/auth?error=${encodeURIComponent("認証に失敗しました。再度ログインしてください。")}`,
      );
    }
  }

  return NextResponse.redirect(`${origin}${redirect}`);
}
