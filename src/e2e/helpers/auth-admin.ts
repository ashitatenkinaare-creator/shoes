import { createClient } from "@supabase/supabase-js";
import { loadEnvLocal } from "./env";

function getAdminClient() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "E2E auth helper requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function findUserIdByEmail(email: string): Promise<string | null> {
  const admin = getAdminClient();
  let page = 1;

  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      throw new Error(`Failed to list users: ${error.message}`);
    }

    const user = data.users.find((entry) => entry.email === email);
    if (user) return user.id;

    if (data.users.length < 200) break;
    page += 1;
  }

  return null;
}

/** テスト用ユーザーを Admin API で作成（メール確認済み） */
export async function createConfirmedTestUser(email: string, password: string): Promise<void> {
  const admin = getAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) {
    throw new Error(`Failed to create test user ${email}: ${error.message}`);
  }
}

/** Supabase のメール確認を Admin API で完了させ、E2E からログイン可能にする */
export async function confirmUserEmail(email: string): Promise<void> {
  const userId = await findUserIdByEmail(email);
  if (!userId) {
    throw new Error(`E2E auth helper: user not found for ${email}`);
  }

  const admin = getAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, { email_confirm: true });
  if (error) {
    throw new Error(`Failed to confirm email for ${email}: ${error.message}`);
  }
}

/** テスト後のクリーンアップ用（失敗してもテスト自体は落とさない） */
export async function deleteUserByEmail(email: string): Promise<void> {
  const userId = await findUserIdByEmail(email);
  if (!userId) return;

  const admin = getAdminClient();
  await admin.auth.admin.deleteUser(userId);
}
