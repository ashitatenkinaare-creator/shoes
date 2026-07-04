import Header from "@/components/landing/Header";
import Sidebar from "@/components/landing/Sidebar";
import type { BrandFilter, NavPage } from "@/types/drop";

interface LandingShellProps {
  children: React.ReactNode;
  activeBrand?: BrandFilter;
  activeNav?: NavPage;
}

export default function LandingShell({
  children,
  activeBrand = "all",
  activeNav = "launches",
}: LandingShellProps) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar activeBrand={activeBrand} />
      <div className="flex min-h-screen flex-1 flex-col pb-16 lg:pb-0">
        <Header activeNav={activeNav} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
