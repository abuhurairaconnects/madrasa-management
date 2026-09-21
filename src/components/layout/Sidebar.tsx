"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileSpreadsheet,
  BookOpen,
  Sparkles,
  Receipt,
  Landmark,
  Banknote,
  BedDouble,
  Library,
  Boxes,
  CalendarCheck,
  MessageSquare,
  Settings,
  ShieldCheck,
  Smartphone,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Building,
  Layers,
} from "lucide-react";
import { useRole, UserRole, ROLE_ICONS } from "@/context/RoleContext";
import { useSidebar } from "@/context/SidebarContext";

interface NavItem {
  nameBn: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const departmentNavItems: Record<UserRole, NavItem[]> = {
  MUHTAMIM: [
    {
      nameBn: "মূল ড্যাশবোর্ড",
      href: "/",
      icon: LayoutDashboard,
      badge: "সেন্ট্রাল",
    },
    {
      nameBn: "মাদ্রাসার প্রোফাইল",
      href: "/profile",
      icon: Building,
      badge: "তথ্য",
    },
    {
      nameBn: "এস.এম.এস সেন্টার",
      href: "/sms",
      icon: MessageSquare,
      badge: "বার্তা",
    },
    {
      nameBn: "মাদ্রাসা সেটিংস",
      href: "/settings",
      icon: Settings,
      badge: "কনফিগ",
    },
    {
      nameBn: "সুপার এডমিন (SaaS)",
      href: "/super-admin",
      icon: ShieldCheck,
      badge: "মাস্টার",
    },
  ],
  ACCOUNTANT: [
    {
      nameBn: "ফি আদায় ও রসিদ",
      href: "/fees",
      icon: Receipt,
      badge: "রসিদ",
    },
    {
      nameBn: "শরীয়াহ ফান্ড ও খতিয়ান",
      href: "/accounts",
      icon: Landmark,
      badge: "তহবিল",
    },
    {
      nameBn: "উস্তাদ বেতন ও পে-রোল",
      href: "/payroll",
      icon: Banknote,
      badge: "স্যালারি",
    },
    {
      nameBn: "সম্পদ ও মালামাল স্টক",
      href: "/inventory",
      icon: Boxes,
      badge: "ইনভেন্টরি",
    },
  ],
  NAZIM_E_TALIMAT: [
    {
      nameBn: "শিক্ষার্থী ও ভর্তি",
      href: "/students",
      icon: Users,
      badge: "ভর্তি",
    },
    {
      nameBn: "একাডেমিক ও রুটিন",
      href: "/academic",
      icon: GraduationCap,
      badge: "সিলেবাস",
    },
    {
      nameBn: "পরীক্ষা ও ফলাফল",
      href: "/exams",
      icon: FileSpreadsheet,
      badge: "মার্কশিট",
    },
    {
      nameBn: "দৈনিক হাজিরা খাতা",
      href: "/attendance",
      icon: CalendarCheck,
      badge: "উপস্থিতি",
    },
  ],
  TEACHER: [
    {
      nameBn: "হিফজ ট্র্যাকার",
      href: "/hifz",
      icon: BookOpen,
      badge: "ছবক",
    },
    {
      nameBn: "তাজবীদ ও আমল",
      href: "/islamic-studies",
      icon: Sparkles,
      badge: "নামাজ",
    },
    {
      nameBn: "কিতাবখানা ও লাইব্রেরি",
      href: "/library",
      icon: Library,
      badge: "বই",
    },
    {
      nameBn: "ক্লাসের হাজিরা",
      href: "/attendance",
      icon: CalendarCheck,
      badge: "হাজিরা",
    },
  ],
  HOSTEL_SUPER: [
    {
      nameBn: "হোস্টেল ও ডাইনিং",
      href: "/hostel",
      icon: BedDouble,
      badge: "রুম/মিল",
    },
    {
      nameBn: "হোস্টেল মালামাল স্টক",
      href: "/inventory",
      icon: Boxes,
      badge: "মালামাল",
    },
  ],
  PARENT: [
    {
      nameBn: "অভিভাবক পোর্টাল",
      href: "/guardian",
      icon: Smartphone,
      badge: "মোবাইল",
    },
    {
      nameBn: "মাদ্রাসার তথ্য ও প্রোফাইল",
      href: "/profile",
      icon: Building,
      badge: "তথ্য",
    },
  ],
};

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { role, setRole, activeDepartment, departments, currentUser } = useRole();
  const { isMobileOpen, closeMobileMenu, isCollapsed, toggleCollapse } = useSidebar();

  const currentNavItems = departmentNavItems[role] || departmentNavItems.MUHTAMIM;
  const CurrentUserIcon = ROLE_ICONS[currentUser?.role || role] || Users;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/institution-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
    } catch {}

    localStorage.removeItem("madrasa_active_institution_id");
    localStorage.removeItem("madrasa_active_institution_name");
    localStorage.removeItem("madrasa_active_user");
    document.cookie = "madrasa_institution_id=; path=/; max-age=0";
    document.cookie = "madrasa_user_id=; path=/; max-age=0";

    window.location.href = "/login?logged_out=true";
  };

  const switchDepartment = (deptRole: UserRole, defaultPath: string) => {
    setRole(deptRole);
    router.push(defaultPath);
  };

  // Render Department Switcher Grid (6 quick buttons)
  const renderDepartmentSwitcher = (isMobile: boolean = false) => {
    const ActiveDeptIcon = ROLE_ICONS[activeDepartment.role] || Layers;

    if (isCollapsed && !isMobile) {
      return (
        <div className="p-2 border-b border-emerald-900/80 bg-emerald-900/30 flex justify-center">
          <button
            onClick={() => setRole(role === "MUHTAMIM" ? "ACCOUNTANT" : "MUHTAMIM")}
            className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold text-base shadow-sm hover:bg-amber-300 transition"
            title={`${activeDepartment.fullTitle} (ক্লিক করে পরিবর্তন করুন)`}
          >
            <ActiveDeptIcon className="w-5 h-5 text-emerald-950" />
          </button>
        </div>
      );
    }

    return (
      <div className="p-3 border-b border-emerald-900/80 bg-emerald-900/30 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-emerald-300 font-bold px-0.5">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            বিভাগ বা ডেস্ক নির্বাচন:
          </span>
          <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.2 rounded font-normal">
            {activeDepartment.badge}
          </span>
        </div>

        {/* 6 Quick Modular Department Buttons (2 columns for clear full text) */}
        <div className="grid grid-cols-2 gap-1.5">
          {departments.map((dept) => {
            const isSelected = role === dept.role;
            const DeptIcon = ROLE_ICONS[dept.role] || Layers;
            return (
              <button
                key={dept.role}
                onClick={() => {
                  switchDepartment(dept.role, dept.defaultPath);
                  if (isMobile) {
                    closeMobileMenu();
                  }
                }}
                className={`flex items-center justify-start gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition ${
                  isSelected
                    ? "bg-amber-400 text-emerald-950 shadow-md ring-1 ring-amber-300 scale-[1.01]"
                    : "bg-emerald-900/70 hover:bg-emerald-800/90 text-emerald-100 border border-emerald-800/80"
                }`}
                title={`${dept.fullTitle} — ${dept.description}`}
              >
                <DeptIcon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-emerald-950" : "text-amber-300"}`} />
                <span className="truncate">{dept.shortTitle}</span>
              </button>
            );
          })}
        </div>

        {/* Current Active Desk Badge */}
        <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/80 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-800/80 flex items-center justify-center shrink-0">
            <ActiveDeptIcon className="w-4 h-4 text-amber-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-xs text-white truncate">
              {activeDepartment.fullTitle}
            </p>
            <p className="text-[10px] text-emerald-300/80 truncate">
              {activeDepartment.description}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderNavLinks = (isMobile: boolean = false) => (
    <nav className="flex-1 p-2.5 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-800">
      <div className="px-2 py-1 text-[11px] font-bold text-emerald-400/80 uppercase tracking-wider">
        {activeDepartment.shortTitle} ডেস্কের মেনু:
      </div>

      {currentNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => {
              if (isMobile) {
                closeMobileMenu();
              }
            }}
            title={isCollapsed && !isMobile ? item.nameBn : undefined}
            className={`flex items-center ${
              isCollapsed && !isMobile ? "justify-center px-2" : "justify-between px-3"
            } py-2.5 rounded-xl font-medium text-xs md:text-sm transition-all duration-150 ${
              isActive
                ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-900/50 translate-x-1"
                : "text-emerald-100/90 hover:bg-emerald-900/70 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? "text-amber-300" : "text-emerald-400"
                }`}
              />
              {(!isCollapsed || isMobile) && (
                <span className="truncate">{item.nameBn}</span>
              )}
            </div>
            {(!isCollapsed || isMobile) && item.badge && (
              <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded font-normal shrink-0">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* =========================================
          1. MOBILE DRAWER OVERLAY & SLIDE-OUT
          ========================================= */}
      {/* Dark backdrop blur */}
      <div
        onClick={closeMobileMenu}
        className={`md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300 ${
          isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Slide-out mobile drawer */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-emerald-950 text-emerald-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
      >
        {/* Mobile Header with Brand & Close Button */}
        <div className="p-4 border-b border-emerald-900/80 bg-emerald-900/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/logo.png"
              alt="মাদ্রাসা লোগো"
              className="w-10 h-10 rounded-full object-cover shadow-md border border-amber-400/50 shrink-0"
            />
            <div>
              <h1 className="font-bold text-sm tracking-wide text-white leading-tight">
                মাদ্রাসা ম্যানেজমেন্ট
              </h1>
              <p className="text-[11px] text-emerald-300/80 font-arabic">
                نظام إدارة المدرسة الشامل
              </p>
            </div>
          </div>
          <button
            onClick={closeMobileMenu}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800/60 transition"
            aria-label="মেনু বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Department Switcher Grid */}
        {renderDepartmentSwitcher(true)}

        {/* Filtered Navigation Links for Mobile */}
        {renderNavLinks(true)}

        {/* Mobile Status Footer */}
        <div className="p-3 border-t border-emerald-900/80 bg-emerald-900/30 text-xs text-emerald-300/70 space-y-2">
          {/* Active User Mini Profile Link */}
          <Link
            href="/profile"
            onClick={closeMobileMenu}
            className="flex items-center gap-2 p-2 rounded-xl bg-emerald-900/70 hover:bg-emerald-800/90 border border-emerald-800/80 transition text-left"
            title="আমার প্রোফাইল দেখুন ও এডিট করুন"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-800 flex items-center justify-center shrink-0">
              <CurrentUserIcon className="w-4 h-4 text-amber-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{currentUser?.name}</p>
              <p className="text-[10px] text-amber-300 truncate">{currentUser?.designation}</p>
            </div>
            <span className="text-[9px] bg-emerald-800 text-emerald-200 px-1.5 py-0.5 rounded font-medium shrink-0">প্রোফাইল</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-400/30 text-red-300 transition text-xs font-semibold"
          >
            <span>লগআউট করুন</span>
            <LogOut className="w-3.5 h-3.5 text-red-400" />
          </button>

          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {activeDepartment.shortTitle} ডেস্ক সক্রিয়
            </span>
            <span className="text-amber-300 font-mono text-[10px] bg-emerald-900/60 px-1.5 py-0.5 rounded">
              মডুলার
            </span>
          </div>
        </div>
      </aside>

      {/* =========================================
          2. DESKTOP SIDEBAR (HIDDEN ON MOBILE)
          ========================================= */}
      <aside
        className={`hidden md:flex flex-col bg-emerald-950 text-emerald-50 shrink-0 border-r border-emerald-900 shadow-xl min-h-screen transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-emerald-900/80 bg-emerald-900/40">
          <div className="flex items-center space-x-3">
            <img
              src="/logo.png"
              alt="মাদ্রাসা লোগো"
              className="w-10 h-10 rounded-full object-cover shadow-md border border-amber-400/50 shrink-0"
            />
            {!isCollapsed && (
              <div className="overflow-hidden">
                <h1 className="font-bold text-base tracking-wide text-white leading-tight truncate">
                  মাদ্রাসা ম্যানেজমেন্ট
                </h1>
                <p className="text-xs text-emerald-300/80 font-arabic truncate">
                  نظام إدارة المدرسة الشامل
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Department Switcher Grid */}
        {renderDepartmentSwitcher(false)}

        {/* Desktop Navigation Links (Clean 3-5 items) */}
        {renderNavLinks(false)}

        {/* Desktop Footer & Collapse Toggle */}
        <div className="p-3 border-t border-emerald-900/80 bg-emerald-900/30 text-xs text-emerald-300/70 space-y-2">
          {!isCollapsed ? (
            <div>
              {/* Active User Mini Profile Link */}
              <Link
                href="/profile"
                className="flex items-center gap-2 p-2 rounded-xl bg-emerald-900/70 hover:bg-emerald-800/90 border border-emerald-800/80 transition text-left mb-2"
                title="আমার প্রোফাইল দেখুন ও এডিট করুন"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-800 flex items-center justify-center shrink-0">
                  <CurrentUserIcon className="w-4 h-4 text-amber-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{currentUser?.name}</p>
                  <p className="text-[10px] text-amber-300 truncate">{currentUser?.designation}</p>
                </div>
                <span className="text-[9px] bg-emerald-800 text-emerald-200 px-1.5 py-0.5 rounded font-medium shrink-0">প্রোফাইল</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full mb-2 flex items-center justify-between p-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-400/30 text-red-300 transition text-xs font-semibold"
              >
                <span>লগআউট করুন</span>
                <LogOut className="w-3.5 h-3.5 text-red-400" />
              </button>

              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {activeDepartment.shortTitle} ডেস্ক
                </span>
                <span className="text-emerald-400 font-mono text-[10px] bg-emerald-900/60 px-1.5 py-0.5 rounded">
                  মডুলার
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              title="লগআউট করুন"
              className="w-full flex items-center justify-center p-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-400/30 text-red-300 transition text-xs"
            >
              <LogOut className="w-4 h-4 text-red-400" />
            </button>
          )}

          <button
            onClick={toggleCollapse}
            className="w-full flex items-center justify-center p-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800/70 text-emerald-300 hover:text-white transition text-xs"
            title={isCollapsed ? "সাইডবার বড় করুন" : "সাইডবার ছোট করুন"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <div className="flex items-center gap-1.5">
                <ChevronLeft className="w-4 h-4" />
                <span className="text-[11px]">সাইডবার সংক্ষেপ করুন</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
