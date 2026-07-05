import type { Metadata } from "next";
import DashboardView from "@/components/radar/dashboard/DashboardView";
import { fetchUpcomingSneakers } from "@/lib/radar/catalog-db.server";
import { fetchServerUserPreferences } from "@/lib/radar/preferences-server";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "ダッシュボード",
  description: "条件にマッチした新作スニーカーとウォッチリスト",
};

export default async function DashboardPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const preferences = user ? await fetchServerUserPreferences(user.id) : null;
  const catalogFilters = preferences
    ? { filterRare: preferences.filterRare, filterCollab: preferences.filterCollab }
    : undefined;

  const { data } = await fetchUpcomingSneakers(20, catalogFilters);
  const items = data ?? [];

  return <DashboardView items={items} initialPreferences={preferences} />;
}
