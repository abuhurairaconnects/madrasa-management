"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface SidebarContextType {
  isMobileOpen: boolean;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  // Automatically close mobile menu whenever route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Close mobile drawer on Esc key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen]);

  const openMobileMenu = () => setIsMobileOpen(true);
  const closeMobileMenu = () => setIsMobileOpen(false);
  const toggleMobileMenu = () => setIsMobileOpen((prev) => !prev);
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  return (
    <SidebarContext.Provider
      value={{
        isMobileOpen,
        openMobileMenu,
        closeMobileMenu,
        toggleMobileMenu,
        isCollapsed,
        toggleCollapse,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
