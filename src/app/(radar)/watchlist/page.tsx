import type { Metadata } from "next";
import WatchlistView from "@/components/radar/watchlist/WatchlistView";

export const metadata: Metadata = {
  title: "ウォッチリスト",
  description: "ウォッチ登録済みスニーカーの一覧と通知管理",
};

export default function WatchlistPage() {
  return <WatchlistView />;
}
