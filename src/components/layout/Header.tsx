"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useRole, UserRole, ROLE_TITLES, ROLE_ICONS } from "@/context/RoleContext";
import { useSidebar } from "@/context/SidebarContext";
import { formatBengaliDate } from "@/lib/formatters";
import {
  Calendar,
  Moon,
  Sun,
  ChevronDown,
  UserCheck,
  Building,
  Menu,
  LogOut,
  ArrowLeft,
  User,
} from "lucide-react";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { role, setRole, activeDepartment, departments, currentUser } = useRole();
  const { toggleMobileMenu } = useSidebar();
  const [institutionName, setInstitutionName] = useState("জামিয়া ইসলামিয়া দারুল উলূম ও হিফজখানা");
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme from localStorage or system
    const savedTheme = localStorage.getItem("madrasa_theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      setIsDark(true);
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      setIsDark(false);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        document.documentElement.classList.add("dark");
        setIsDark(true);
      } else {
        document.documentElement.classList.remove("dark");
        setIsDark(false);
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      localStorage.setItem("madrasa_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      localStorage.setItem("madrasa_theme", "light");
    }
  };

  useEffect(() => {
    // Read from localStorage initially to prevent layout flash
    const savedName = localStorage.getItem("madrasa_active_institution_name");
    if (savedName) {
      setInstitutionName(savedName);
    }

    fetch("/api/institution")
      .then((res) => res.json())
      .then((data) => {
        if (data?.institution?.nameBn) {
          setInstitutionName(data.institution.nameBn);
          localStorage.setItem("madrasa_active_institution_name", data.institution.nameBn);
        }
      })
      .catch(() => {});
  }, []);

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

  const todayBn = formatBengaliDate(new Date());
  const ActiveDeptIcon = ROLE_ICONS[activeDepartment.role] || Building;
  const CurrentUserIcon = ROLE_ICONS[currentUser?.role || role] || User;

  return (
    <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-2.5 sm:px-6 py-2 sm:py-3 flex items-center justify-between shadow-xs sticky top-0 z-30">
      {/* Left: Mobile Hamburger + Universal Back Button + Madrasa Title & Calendar */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1 mr-2">
        {/* Mobile Hamburger Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-800 transition shrink-0"
          aria-label="মেনু খুলুন"
        >
          <Menu className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
        </button>

        {/* Universal Back Button (shown on every page except home /) */}
        {pathname !== "/" && (
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition border border-zinc-200 dark:border-zinc-700 shrink-0 shadow-xs"
            title="পূর্ববর্তী পেজে ফিরে যান"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">ফিরে যান</span>
          </button>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h2 className="text-xs sm:text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1 sm:gap-2 min-w-0">
              <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate max-w-[220px] xs:max-w-[320px] sm:max-w-md md:max-w-lg" title={institutionName}>
                {institutionName}
              </span>
            </h2>
            <span className="hidden md:inline-block text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full font-medium shrink-0">
              কওমি ও হিফজ
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3 text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-zinc-400 shrink-0" />
              <span>{todayBn}</span>
            </span>
            <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">•</span>
            <span className="hidden sm:flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-arabic font-medium">
              <Moon className="w-3 h-3 text-amber-500 shrink-0" />
              ৮ রবিউস সানি ১৪৪৮ হিজরি
            </span>
          </div>
        </div>
      </div>

      {/* Right: Theme Toggle + My Profile + Role Switcher + Logout */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Theme Switcher Button (Light / Dark mode) */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition shrink-0"
          title={isDark ? "লাইট মোডে পরিবর্তন করুন (সাদা ব্যাকগ্রাউন্ড)" : "ডার্ক মোডে পরিবর্তন করুন (কালো ব্যাকগ্রাউন্ড)"}
          aria-label="থিম পরিবর্তন করুন"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <Moon className="w-4 h-4 text-zinc-700 shrink-0" />
          )}
          <span className="hidden xl:inline">{isDark ? "লাইট মোড" : "ডার্ক মোড"}</span>
        </button>

        {/* My Profile Button with Active User Name */}
        <Link
          href="/profile"
          className={`flex items-center gap-1 sm:gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-bold transition shrink-0 ${
            pathname === "/profile"
              ? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
              : "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border-emerald-200/80 dark:border-emerald-800"
          }`}
          title={`আমার প্রোফাইল: ${currentUser?.name || "ইউজার"} (${currentUser?.designation || "প্রোফাইল"})`}
        >
          <CurrentUserIcon className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300 shrink-0" />
          <span className="hidden sm:inline font-bold truncate max-w-[120px]">
            {currentUser?.name ? currentUser.name.split(" ")[1] || currentUser.name.split(" ")[0] : "প্রোফাইল"}
          </span>
        </Link>

        {/* Department / Desk Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:px-2.5 sm:py-1.5 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-950 dark:text-amber-200 rounded-xl border border-amber-300 dark:border-amber-700 text-xs font-bold transition shrink-0 shadow-xs"
            title="বিভাগ বা ডেস্ক পরিবর্তন করুন"
          >
            <ActiveDeptIcon className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400 shrink-0" />
            <span className="hidden sm:inline font-bold">{activeDepartment.shortTitle}</span>
            <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 p-2 z-50 text-xs">
              <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 font-bold text-zinc-700 dark:text-zinc-300 text-[11px] mb-1.5 flex items-center justify-between">
                <span>বিভাগ বা ডেস্ক নির্বাচন করুন:</span>
                <span className="text-amber-600 dark:text-amber-400 font-normal">{activeDepartment.badge}</span>
              </div>
              <div className="space-y-1">
                {departments.map((dept) => {
                  const isSelected = role === dept.role;
                  const DeptIcon = ROLE_ICONS[dept.role] || Building;
                  return (
                    <button
                      key={dept.role}
                      onClick={() => {
                        setRole(dept.role);
                        setShowRoleMenu(false);
                        router.push(dept.defaultPath);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition ${
                        isSelected
                          ? "bg-emerald-600 dark:bg-emerald-600 text-white font-bold shadow-xs"
                          : "text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                        }`}>
                          <DeptIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className={`font-bold truncate ${isSelected ? "text-white" : "text-zinc-900 dark:text-zinc-100"}`}>
                            {dept.fullTitle}
                          </p>
                          <p className={`text-[10px] truncate ${isSelected ? "text-emerald-100" : "text-zinc-400 dark:text-zinc-400"}`}>
                            {dept.description}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="w-2.5 h-2.5 rounded-full bg-white ring-2 ring-emerald-400 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Direct Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 sm:gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800 text-xs font-bold transition shrink-0"
          title="আপনার আইডি থেকে লগআউট করুন"
        >
          <LogOut className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
          <span className="hidden sm:inline">লগআউট</span>
        </button>
      </div>
    </header>
  );
}
