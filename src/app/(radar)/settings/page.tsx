import type { Metadata } from "next";
import SettingsView from "@/components/radar/settings/SettingsView";

export const metadata: Metadata = {
  title: "条件設定",
  description: "ブランド・サイズ・通知タイミングの好み条件を設定",
};

export default function SettingsPage() {
  return <SettingsView />;
}
