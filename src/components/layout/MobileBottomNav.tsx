"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Receipt,
  Menu,
  Building,
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { toggleMobileMenu, isMobileOpen } = useSidebar();

  const navItems = [
    {
      name: "ড্যাশবোর্ড",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      name: "শিক্ষার্থী",
      href: "/students",
      icon: Users,
    },
    {
      name: "হিফজ",
      href: "/hifz",
      icon: BookOpen,
    },
    {
      name: "প্রোফাইল",
      href: "/profile",
      icon: Building,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-1 py-1 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
      <div className="grid grid-cols-5 items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-150 ${
                isActive
                  ? "text-emerald-700 dark:text-emerald-400 font-bold scale-105"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-300"
              }`}
            >
              <div
                className={`p-1 rounded-lg ${
                  isActive
                    ? "bg-emerald-100/70 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300"
                    : ""
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full">
                {item.name}
              </span>
            </Link>
          );
        })}

        {/* 5th button: Open Drawer for all modules */}
        <button
          onClick={toggleMobileMenu}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-150 ${
            isMobileOpen
              ? "text-amber-600 dark:text-amber-400 font-bold scale-105"
              : "text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-300"
          }`}
          aria-label="সকল মেনু খুলুন"
        >
          <div
            className={`p-1 rounded-lg relative ${
              isMobileOpen
                ? "bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400"
                : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400"
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white dark:border-zinc-900" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-semibold text-emerald-800 dark:text-emerald-300">
            সকল মেনু
          </span>
        </button>
      </div>
    </div>
  );
}
