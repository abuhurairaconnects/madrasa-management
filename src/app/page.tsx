"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRole, ROLE_ICONS } from "@/context/RoleContext";
import {
  Users,
  BookOpen,
  Receipt,
  Wallet,
  Building,
  TrendingUp,
  HeartHandshake,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
  PlusCircle,
  Sparkles,
  GraduationCap,
  FileSpreadsheet,
  Banknote,
  BedDouble,
  Library,
  Boxes,
  CalendarCheck,
  MessageSquare,
} from "lucide-react";
import {
  toBengaliNumber,
  formatTaka,
  formatBengaliDate,
  HIFZ_QUALITY_MAP,
  FUND_INFO_MAP,
} from "@/lib/formatters";
import { PosThermalReceipt } from "@/components/print/PosThermalReceipt";
import { A4OfficialReceipt } from "@/components/print/A4OfficialReceipt";

interface DashboardData {
  institution: any;
  stats: {
    totalStudents: number;
    hifzStudentsCount: number;
    boardingStudentsCount: number;
    orphanStudentsCount: number;
    totalFundBalance: number;
    todayCollection: number;
    presentCount: number;
    absentCount: number;
  };
  funds: any[];
  recentInvoices: any[];
  recentHifz: any[];
  recentTransactions: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { role, setRole, departments } = useRole();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [printFormat, setPrintFormat] = useState<"THERMAL" | "A4">("THERMAL");

  const [error, setError] = useState<string | null>(null);

  const loadDashboard = () => {
    setLoading(true);
    setError(null);
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((d) => {
        if (d.error || !d.stats) {
          setError(d.error || "ড্যাশবোর্ড তথ্য লোড হতে সমস্যা হয়েছে");
        } else {
          setData(d);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load dashboard:", err);
        setError("সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-zinc-500 font-medium">তথ্য লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error || !data || !data.stats) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-red-200 dark:border-red-900/50 text-center max-w-md w-full shadow-lg space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              তথ্য লোড করা যায়নি
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              {error || "সার্ভার থেকে সঠিক ডাটা পাওয়া যায়নি"}
            </p>
          </div>
          <button
            onClick={loadDashboard}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            পুনরায় চেষ্টা করুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 p-4 sm:p-6 md:p-8 text-white shadow-lg border border-emerald-700/40">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-700/60 border border-emerald-500/30 text-emerald-200 text-[11px] sm:text-xs mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              মুহতামিম ও প্রশাসনিক ড্যাশবোর্ড
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              আসসালামু আলাইকুম, স্বাগতম!
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/90 mt-1">
              {data.institution?.nameBn || "জামিয়া ইসলামিয়া দারুল উলূম ও হিফজখানা"} — মাদ্রাসার সার্বিক অবস্থা ও হিসাব
            </p>
          </div>

          <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2 sm:gap-2.5">
            <Link
              href="/students"
              className="inline-flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs border border-white/20 transition text-center"
            >
              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300 shrink-0" />
              <span>নতুন ভর্তি</span>
            </Link>
            <Link
              href="/hifz"
              className="inline-flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-xl text-xs font-bold shadow-md transition text-center"
            >
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>ছবক এন্ট্রি</span>
            </Link>
            <Link
              href="/fees"
              className="inline-flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition text-center"
            >
              <Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>ফি আদায়</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 6 Modular Department Portals Launch Grid */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>মাদ্রাসার বিভাগ ও ডেস্ক নির্বাচন (Department Portals)</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              যেকোনো বিভাগে ক্লিক করে সরাসরি সেই বিভাগের পরিচ্ছন্ন ডেস্কে প্রবেশ করুন
            </p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 w-fit">
            ৬টি স্বতন্ত্র ডেস্ক
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {departments.map((dept) => {
            const isCurrent = role === dept.role;
            const DeptIcon = ROLE_ICONS[dept.role] || Building;
            return (
              <button
                key={dept.role}
                onClick={() => {
                  setRole(dept.role);
                  router.push(dept.defaultPath);
                }}
                className={`group text-left p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between relative overflow-hidden ${
                  isCurrent
                    ? "bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-emerald-500 shadow-md ring-2 ring-emerald-400/40"
                    : "bg-zinc-50 dark:bg-zinc-800/60 hover:bg-emerald-50/60 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200/80 dark:border-zinc-700/80 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-xs"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs ${
                        isCurrent
                          ? "bg-white/20 text-white shadow-inner"
                          : `bg-gradient-to-br ${dept.accentColor} text-white`
                      }`}
                    >
                      <DeptIcon className="w-5 h-5 text-white" />
                    </div>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                        isCurrent
                          ? "bg-white/20 text-white"
                          : "bg-zinc-200/70 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                      }`}
                    >
                      {dept.badge}
                    </span>
                  </div>
                  <h4 className={`font-bold text-xs sm:text-sm leading-tight mb-1 ${isCurrent ? "text-white" : "text-zinc-900 dark:text-zinc-100"}`}>
                    {dept.shortTitle} বিভাগ
                  </h4>
                  <p className={`text-[10px] line-clamp-2 leading-relaxed ${isCurrent ? "text-emerald-100" : "text-zinc-500 dark:text-zinc-400"}`}>
                    {dept.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[10px] font-bold">
                  <span className={isCurrent ? "text-amber-300" : "text-emerald-700 dark:text-emerald-400"}>
                    {isCurrent ? "সক্রিয় ডেস্ক" : "প্রবেশ করুন"}
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${isCurrent ? "text-amber-300" : "text-zinc-400"}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">মোট শিক্ষার্থী</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {toBengaliNumber(data.stats?.totalStudents ?? 0)} জন
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              আবাসিক: {toBengaliNumber(data.stats?.boardingStudentsCount ?? 0)} জন | অনাবাসিক: {toBengaliNumber((data.stats?.totalStudents ?? 0) - (data.stats?.boardingStudentsCount ?? 0))} জন
            </p>
          </div>
        </div>

        {/* Hifz Students */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">হিফজ শিক্ষার্থী</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {toBengaliNumber(data.stats?.hifzStudentsCount ?? 0)} জন
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 font-medium">
              সবক ও আমুখতা চালু
            </p>
          </div>
        </div>

        {/* Today's Fee Collection */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">আজকের ফি আদায়</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-400">
              {formatTaka(data.stats?.todayCollection ?? 0)}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">ক্যাশ ও ডিজিটাল রসিদ</p>
          </div>
        </div>

        {/* Lillah & Zakat Beneficiaries */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">লিল্লাহ/এতিম ছাত্র</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-purple-900 dark:text-purple-300">
              {toBengaliNumber(data.stats?.orphanStudentsCount ?? 0)} জন
            </p>
            <p className="text-xs text-purple-700 dark:text-purple-400 mt-0.5">১০০% ফ্রি খানা ও বাসস্থান</p>
          </div>
        </div>
      </div>

      {/* 8 Core Modules Hub (All-in-One Quick Navigation) */}
      <div className="bg-gradient-to-r from-emerald-900/10 via-teal-900/10 to-emerald-900/10 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
              ৮টি মূল মডিউল কুইক নেভিগেশন (All-in-One Core Modules)
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800">
            সম্পূর্ণ ইন্টিগ্রেটেড
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          <Link
            href="/students"
            className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 hover:shadow-md transition text-center group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">শিক্ষার্থী ও ভর্তি</div>
            <div className="text-[10px] text-zinc-400">প্রোফাইল/আইডি</div>
          </Link>

          <Link
            href="/academic"
            className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 hover:shadow-md transition text-center group"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">একাডেমিক</div>
            <div className="text-[10px] text-zinc-400">কিতাব ও রুটিন</div>
          </Link>

          <Link
            href="/exams"
            className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 hover:shadow-md transition text-center group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">পরীক্ষা ও রেজাল্ট</div>
            <div className="text-[10px] text-zinc-400">মার্কশিট জেনারেটর</div>
          </Link>

          <Link
            href="/islamic-studies"
            className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 hover:shadow-md transition text-center group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">নামাজ ও আমল</div>
            <div className="text-[10px] text-zinc-400">তাজবীদ/তাহাজ্জুদ</div>
          </Link>

          <Link
            href="/fees"
            className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 hover:shadow-md transition text-center group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition">
              <Receipt className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">ফি ও রসিদ</div>
            <div className="text-[10px] text-zinc-400">থার্মাল/A4 প্রিন্ট</div>
          </Link>

          <Link
            href="/payroll"
            className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 hover:shadow-md transition text-center group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition">
              <Banknote className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">উস্তাদ বেতন</div>
            <div className="text-[10px] text-zinc-400">মাসিক পে-স্লিপ</div>
          </Link>

          <Link
            href="/hostel"
            className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 hover:shadow-md transition text-center group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition">
              <BedDouble className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">হোস্টেল ও মেস</div>
            <div className="text-[10px] text-zinc-400">রুম/মিল কাউন্টার</div>
          </Link>

          <Link
            href="/library"
            className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 hover:shadow-md transition text-center group"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition">
              <Library className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">কিতাবখানা</div>
            <div className="text-[10px] text-zinc-400">ইস্যু ও স্টক</div>
          </Link>
        </div>
      </div>

      {/* 4 Shariah Funds Overview Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 sm:p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
              শরীয়াহ ফান্ড ও খতিয়ান স্থিতি (Fund Balances)
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              শরিয়াহ অনুযায়ী সাধারণ, লিল্লাহ/যাকাত, মেহমানদারি ও ওয়াকফ তহবিলের পৃথক হিসাব
            </p>
          </div>
          <Link
            href="/accounts"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            পূর্ণাঙ্গ খতিয়ান দেখুন <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {data.funds.map((f) => {
            const info = FUND_INFO_MAP[f.code] || {
              name: f.nameBn,
              tag: "তহবিল",
              color: "border-zinc-300 text-zinc-700 bg-zinc-50",
              desc: f.description,
            };

            return (
              <div
                key={f.id}
                className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-400 dark:hover:border-emerald-700 transition bg-zinc-50/50 dark:bg-zinc-900/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    {info.name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-semibold text-zinc-600 dark:text-zinc-400">
                    {info.tag}
                  </span>
                </div>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {formatTaka(f.currentBalance)}
                </p>
                <p className="text-[11px] text-zinc-500 leading-tight line-clamp-2">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between text-xs">
          <span className="font-semibold text-emerald-900 dark:text-emerald-200">
            সর্বমোট তহবিলের বর্তমান নগদ/ব্যাংক স্থিতি:
          </span>
          <span className="text-base font-extrabold text-emerald-800 dark:text-emerald-300">
            {formatTaka(data.stats.totalFundBalance)}
          </span>
        </div>
      </div>

      {/* Two Column Layout: Hifz Live Progress & Recent Fee Collections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Live Hifz Sabaq Tracking */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 sm:p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" />
              হিফজ বিভাগের আজকের ছবক ও আমুখতা
            </h2>
            <Link
              href="/hifz"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              সবক ডায়রি <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {data.recentHifz.length === 0 ? (
              <p className="text-xs text-zinc-400 text-center py-6">আজকের কোনো ছবক রেকর্ড নেই</p>
            ) : (
              data.recentHifz.map((h) => {
                const q = HIFZ_QUALITY_MAP[h.sabaqQuality] || HIFZ_QUALITY_MAP.JAYYID;
                const percent = Math.round((h.totalParasMemorized / 30) * 100);

                return (
                  <div
                    key={h.id}
                    className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                          {h.student?.nameBn}
                        </h4>
                        <p className="text-[11px] text-zinc-500">
                          আইডি: {toBengaliNumber(h.student?.studentId)}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${q.bg} ${q.color}`}
                      >
                        {q.label}
                      </span>
                    </div>

                    {/* Sabaq details */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800">
                      <div>
                        <span className="text-zinc-400 block text-[10px]">আজকের ছবক:</span>
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">
                          পারা {toBengaliNumber(h.sabaqPara)}, {h.sabaqSurah}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[10px]">আমুখতা (রিভিশন):</span>
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">
                          {h.amukhtaParas || "নির্দিষ্ট নয়"}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar (out of 30 Juz) */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-zinc-500">
                        <span>হিফজ সমাপ্তি: {toBengaliNumber(h.totalParasMemorized)} / ৩০ পারা</span>
                        <span className="font-bold text-amber-600">{toBengaliNumber(percent)}%</span>
                      </div>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Recent Fee Invoices & Print Preview */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 sm:p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600" />
              সাম্প্রতিক ফি আদায় ও রসিদ
            </h2>
            <Link
              href="/fees"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              সকল রসিদ <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {data.recentInvoices.length === 0 ? (
              <p className="text-xs text-zinc-400 text-center py-6">কোনো রসিদ পাওয়া যায়নি</p>
            ) : (
              data.recentInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {inv.student?.nameBn}
                      </h4>
                      <span className="text-[10px] font-mono text-zinc-400">
                        ({inv.invoiceNo})
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      মাস: {inv.month} | শ্রেণি: {inv.student?.classSession?.nameBn}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                        {formatTaka(inv.paidAmount)}
                      </p>
                      <span
                        className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full ${
                          inv.status === "PAID"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {inv.status === "PAID" ? "পরিশোধিত" : "আংশিক"}
                      </span>
                    </div>

                    {/* Dual Print Action Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        title="৮০ মিমি থার্মাল রসিদ"
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setPrintFormat("THERMAL");
                        }}
                        className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-100 hover:text-emerald-700 text-zinc-600 dark:text-zinc-300 transition cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="A4 অফিশিয়াল ২-কপি রসিদ"
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setPrintFormat("A4");
                        }}
                        className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-[10px] font-bold border border-emerald-200 transition cursor-pointer"
                      >
                        A4
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Print Modals */}
      {selectedInvoice && printFormat === "THERMAL" && (
        <PosThermalReceipt
          invoice={selectedInvoice}
          institution={data.institution}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
      {selectedInvoice && printFormat === "A4" && (
        <A4OfficialReceipt
          invoice={selectedInvoice}
          institution={data.institution}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}
