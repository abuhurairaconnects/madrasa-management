"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import {
  Users,
  BookOpen,
  Receipt,
  Wallet,
  TrendingUp,
  ChevronRight,
  PlusCircle,
  Sparkles,
  CalendarCheck,
  Printer,
  HeartHandshake,
  ShieldCheck,
  Landmark,
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
  const { role } = useRole();
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
          <p className="text-sm text-zinc-400 font-medium">তথ্য লোড হচ্ছে...</p>
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
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* ==========================================================
          1. CLEAN EXECUTIVE WELCOME & QUICK ACTION STRIP
          ========================================================== */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-5 sm:p-7 text-white shadow-xl border border-emerald-800/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/70 border border-emerald-600/40 text-emerald-200 text-xs mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>মুহতামিম ও প্রশাসনিক ড্যাশবোর্ড</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              আসসালামু আলাইকুম, স্বাগতম!
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 font-medium">
              {data.institution?.nameBn || "মাদ্রাসা ম্যানেজমেন্ট প্ল্যাটফর্ম"} — এক নজরে সার্বিক হিসাব ও শিক্ষাক্রম
            </p>
          </div>

          {/* 4 Primary Quick Action Buttons */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-2.5">
            <Link
              href="/students"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/40 transition text-center"
            >
              <PlusCircle className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>নতুন ভর্তি</span>
            </Link>
            <Link
              href="/fees"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 rounded-xl text-xs font-black shadow-md shadow-amber-950/40 transition text-center"
            >
              <Receipt className="w-4 h-4 shrink-0" />
              <span>ফি আদায়</span>
            </Link>
            <Link
              href="/hifz"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold backdrop-blur-sm border border-white/20 transition text-center"
            >
              <BookOpen className="w-4 h-4 text-amber-300 shrink-0" />
              <span>ছবক এন্ট্রি</span>
            </Link>
            <Link
              href="/attendance"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-emerald-200 rounded-xl text-xs font-semibold backdrop-blur-sm border border-emerald-500/30 transition text-center"
            >
              <CalendarCheck className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>হাজিরা গ্রহণ</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ==========================================================
          2. TOP 4 CRISP, HIGH-CONTRAST KPI CARDS
          ========================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/90 dark:border-zinc-800 shadow-sm hover:border-emerald-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">মোট শিক্ষার্থী</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              {toBengaliNumber(data.stats?.totalStudents ?? 0)} <span className="text-sm font-semibold text-zinc-500">জন</span>
            </p>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                আবাসিক: {toBengaliNumber(data.stats?.boardingStudentsCount ?? 0)}
              </span>
              <span>•</span>
              <span>
                অনাবাসিক: {toBengaliNumber((data.stats?.totalStudents ?? 0) - (data.stats?.boardingStudentsCount ?? 0))}
              </span>
            </div>
          </div>
        </div>

        {/* Today's Fee Collection */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/90 dark:border-zinc-800 shadow-sm hover:border-teal-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">আজকের ফি আদায়</span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/70 border border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight">
              {formatTaka(data.stats?.todayCollection ?? 0)}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 font-medium">
              ক্যাশ ও ডিজিটাল রসিদ কালেকশন
            </p>
          </div>
        </div>

        {/* Hifz Students */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/90 dark:border-zinc-800 shadow-sm hover:border-amber-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">হিফজ শিক্ষার্থী</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200/60 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              {toBengaliNumber(data.stats?.hifzStudentsCount ?? 0)} <span className="text-sm font-semibold text-zinc-500">জন</span>
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 font-semibold">
              চলতি ছবক ও আমুখতা চালু
            </p>
          </div>
        </div>

        {/* Total Shariah Fund Balance */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/90 dark:border-zinc-800 shadow-sm hover:border-indigo-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">মোট ফান্ড স্থিতি</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-indigo-700 dark:text-indigo-300 tracking-tight">
              {formatTaka(data.stats?.totalFundBalance ?? 0)}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 font-medium">
              শরিয়াহ সংরক্ষিত মোট নগদ স্থিতি
            </p>
          </div>
        </div>
      </div>

      {/* ==========================================================
          3. TWO COLUMN ACTIVITY: RECENT INVOICES & HIFZ PROGRESS
          ========================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recent Fee Invoices & Print Preview */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 border border-zinc-200/90 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>সাম্প্রতিক ফি আদায় ও রসিদ</span>
            </h2>
            <Link
              href="/fees"
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>সকল রসিদ</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {data.recentInvoices.length === 0 ? (
              <div className="text-center py-8 text-zinc-400 text-xs">
                <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <span>বর্তমানে কোনো আদায়ের রসিদ নেই</span>
              </div>
            ) : (
              data.recentInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/70 transition flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                        {inv.student?.nameBn}
                      </h4>
                      <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                        ({inv.invoiceNo})
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                      মাস: {inv.month} | শ্রেণি: {inv.student?.classSession?.nameBn || "সাধারণ"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                        {formatTaka(inv.paidAmount)}
                      </p>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          inv.status === "PAID"
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                            : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                        }`}
                      >
                        {inv.status === "PAID" ? "পরিশোধিত" : "আংশিক"}
                      </span>
                    </div>

                    {/* Dual Print Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        title="৮০ মিমি থার্মাল রসিদ প্রিন্ট"
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setPrintFormat("THERMAL");
                        }}
                        className="p-2 rounded-xl bg-zinc-200/70 dark:bg-zinc-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 hover:text-emerald-700 dark:hover:text-emerald-300 text-zinc-700 dark:text-zinc-200 transition cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="A4 অফিশিয়াল ২-কপি রসিদ প্রিন্ট"
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setPrintFormat("A4");
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-800 text-[10px] font-black border border-emerald-300/80 dark:border-emerald-700 transition cursor-pointer"
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

        {/* Right: Live Hifz Sabaq Progress */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 border border-zinc-200/90 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" />
              <span>হিফজ বিভাগের আজকের ছবক ও আমুখতা</span>
            </h2>
            <Link
              href="/hifz"
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>সবক ডায়রি</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {data.recentHifz.length === 0 ? (
              <div className="text-center py-8 text-zinc-400 text-xs">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <span>আজকের কোনো ছবক রেকর্ড এন্ট্রি হয়নি</span>
              </div>
            ) : (
              data.recentHifz.map((h) => {
                const q = HIFZ_QUALITY_MAP[h.sabaqQuality] || HIFZ_QUALITY_MAP.JAYYID;
                const percent = Math.round((h.totalParasMemorized / 30) * 100);

                return (
                  <div
                    key={h.id}
                    className="p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-zinc-900 dark:text-white">
                          {h.student?.nameBn}
                        </h4>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          আইডি: {toBengaliNumber(h.student?.studentId)}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${q.bg} ${q.color}`}
                      >
                        {q.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
                      <div>
                        <span className="text-zinc-400 block text-[10px]">আজকের ছবক:</span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                          পারা {toBengaliNumber(h.sabaqPara)}, {h.sabaqSurah}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[10px]">আমুখতা (রিভিশন):</span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                          {h.amukhtaParas || "নির্দিষ্ট নয়"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
                        <span>হিফজ সমাপ্তি: {toBengaliNumber(h.totalParasMemorized)} / ৩০ পারা</span>
                        <span className="font-bold text-amber-500">{toBengaliNumber(percent)}%</span>
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
      </div>

      {/* ==========================================================
          4. 4 SHARIAH FUNDS OVERVIEW & TOTAL CASH BALANCE
          ========================================================== */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 border border-zinc-200/90 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h2 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>শরীয়াহ ফান্ড ও খতিয়ান স্থিতি (Fund Balances)</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              শরিয়াহ অনুযায়ী সাধারণ, লিল্লাহ/যাকাত, মেহমানদারি ও ওয়াকফ তহবিলের পৃথক খতিয়ান হিসাব
            </p>
          </div>
          <Link
            href="/accounts"
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>পূর্ণাঙ্গ খতিয়ান</span>
            <ChevronRight className="w-3.5 h-3.5" />
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
                className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 hover:border-emerald-500/60 dark:hover:border-emerald-700 transition bg-zinc-50/50 dark:bg-zinc-800/30 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    {info.name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold text-zinc-600 dark:text-zinc-300">
                    {info.tag}
                  </span>
                </div>
                <p className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                  {formatTaka(f.currentBalance)}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight line-clamp-2">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
            সর্বমোট তহবিলের বর্তমান নগদ/ব্যাংক স্থিতি:
          </span>
          <span className="text-xl font-black text-emerald-800 dark:text-emerald-300">
            {formatTaka(data.stats.totalFundBalance)}
          </span>
        </div>
      </div>

      {/* ==========================================================
          5. PRINT MODALS (THERMAL & A4)
          ========================================================== */}
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
