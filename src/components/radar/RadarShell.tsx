"use client";

import RadarBottomNav from "@/components/radar/RadarBottomNav";
import RadarSidebar from "@/components/radar/RadarSidebar";
import { AuthProvider } from "@/hooks/useAuthSession";
import { WatchlistProvider } from "@/hooks/useWatchlist";

interface RadarShellProps {
  children: React.ReactNode;
}

export default function RadarShell({ children }: RadarShellProps) {
  return (
    <AuthProvider>
      <WatchlistProvider>
        <div className="flex min-h-screen bg-radar-bg text-white">
          <RadarSidebar />
          <div className="flex min-h-screen flex-1 flex-col pb-20 lg:pb-0">
            <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 lg:px-8 lg:py-8">
              {children}
            </main>
          </div>
          <RadarBottomNav />
        </div>
      </WatchlistProvider>
    </AuthProvider>
  );
}
