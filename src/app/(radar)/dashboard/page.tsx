import type { Metadata } from "next";
import DashboardView from "@/components/radar/dashboard/DashboardView";
import { fetchUpcomingSneakers } from "@/lib/radar/catalog-db";
import { fetchServerUserPreferences } from "@/lib/radar/preferences-server";
import { MOCK_NEW_ARRIVALS } from "@/data/radar-mock";
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
  const items = data && data.length > 0 ? data : MOCK_NEW_ARRIVALS;

  return <DashboardView items={items} initialPreferences={preferences} />;
}
