"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { SidebarProvider } from "@/context/SidebarContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  const isPublicPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/guardian/login") ||
    pathname.startsWith("/guardian");

  useEffect(() => {
    if (isPublicPage) {
      setCheckingAuth(false);
      return;
    }

    // Check if user is logged in
    const activeInstId = localStorage.getItem("madrasa_active_institution_id");
    const activeUser = localStorage.getItem("madrasa_active_user");
    const cookieMatch = document.cookie.match(/(?:^|;\s*)madrasa_institution_id=([^;]+)/);

    if (!activeInstId && !activeUser && !cookieMatch) {
      // User is NOT logged in -> redirect to /login
      router.replace("/login");
    } else {
      setCheckingAuth(false);
    }
  }, [pathname, isPublicPage, router]);

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

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs">
        লগইন যাচাই করা হচ্ছে...
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
