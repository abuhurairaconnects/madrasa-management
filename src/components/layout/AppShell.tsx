"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { SidebarProvider } from "@/context/SidebarContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isStandalonePortal =
    pathname.startsWith("/super-admin") ||
    pathname.startsWith("/guardian") ||
    pathname.startsWith("/login");

  if (isStandalonePortal) {
    return (
      <div className="w-full h-full min-h-screen overflow-y-auto bg-slate-950">
        {children}
        <InstallPrompt />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex w-full h-full overflow-hidden bg-zinc-50 dark:bg-zinc-950">
        {/* Responsive Sidebar & Mobile Drawer */}
        <Sidebar />

        {/* Main Content Area: Takes 100% full width on mobile */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 pb-24 md:pb-6 bg-zinc-50/70 dark:bg-zinc-950">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <MobileBottomNav />

        {/* PWA Install Prompt */}
        <InstallPrompt />
      </div>
    </SidebarProvider>
  );
}
