import type { Metadata } from "next";
import DashboardView from "@/components/radar/dashboard/DashboardView";
import { fetchUpcomingSneakers } from "@/lib/radar/catalog-db";
import { MOCK_NEW_ARRIVALS } from "@/data/radar-mock";

export const metadata: Metadata = {
  title: "ダッシュボード",
  description: "条件にマッチした新作スニーカーとウォッチリスト",
};

export default async function DashboardPage() {
  const { data } = await fetchUpcomingSneakers();
  const items = data && data.length > 0 ? data : MOCK_NEW_ARRIVALS;

  return <DashboardView items={items} />;
}
