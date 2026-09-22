"use client";

import React, { useEffect, useState } from "react";
import {
  Banknote,
  PlusCircle,
  Printer,
  CheckCircle2,
  Clock,
  Wallet,
  Users,
  Building,
  FileText,
  Calendar,
  Sparkles,
  ArrowLeft,
  X,
  UserPlus,
  Zap,
  TrendingUp,
  Download,
  Check,
  ChevronRight,
  ShieldCheck,
  Pencil,
  Trash2,
} from "lucide-react";
import { toBengaliNumber, formatTaka, numberToBengaliWords } from "@/lib/formatters";
import { MonthlyPayrollExpenseReport } from "@/components/print/MonthlyPayrollExpenseReport";

const MONTHS = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

const ROLE_BN: Record<string, string> = {
  MUHTAMIM: "প্রধান মুহতামিম ও পরিচালক",
  NAZIM_E_TALIMAT: "নাজেমে তালিমাত ও প্রধান শিক্ষক",
  ACCOUNTANT: "প্রধান হিসাবরক্ষক ও ক্যাশিয়ার",
  TEACHER: "উস্তাদ / শিক্ষক",
  HOSTEL_SUPER: "হোস্টেল সুপার / বোর্ডিং",
  COOK: "বাবুর্চি / সহকারী",
  GUARD: "নিরাপত্তা প্রহরী / দারোয়ান",
  KHADEM: "খাদেম / স্টাফ",
  STAFF: "সাধারণ কর্মচারী",
  OTHER: "অন্যান্য কর্মচারী",
};

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 16 }, (_, i) => CURRENT_YEAR - 5 + i);

export default function PayrollPage() {
  const [activeTab, setActiveTab] = useState<"MONTHLY" | "HISTORY">("MONTHLY");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("সেপ্টেম্বর");
  const [selectedYear, setSelectedYear] = useState(2026);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showPdfReport, setShowPdfReport] = useState(false);
  const [paySlipData, setPaySlipData] = useState<any | null>(null);

  // Mode: "MANUAL" (direct typing) vs "SELECT" (from dropdown)
  const [entryMode, setEntryMode] = useState<"MANUAL" | "SELECT">("MANUAL");

  // For viewing PDF of a historic month directly
  const [reportMonth, setReportMonth] = useState("সেপ্টেম্বর");
  const [reportYear, setReportYear] = useState(2026);
  const [reportSalaries, setReportSalaries] = useState<any[]>([]);

  // Bulk generate loading
  const [generating, setGenerating] = useState(false);

  // Form: Salary Entry
  const [salaryForm, setSalaryForm] = useState({
    userId: "",
    manualName: "",
    manualRole: "TEACHER",
    phone: "",
    basicSalary: 16000,
    housingAllowance: 2500,
    foodAllowance: 2000,
    bonus: 0,
    deduction: 0,
    paymentStatus: "PAID",
    paymentMethod: "CASH",
    paymentDate: new Date().toISOString().split("T")[0],
    notes: "মাসিক নিয়মিত বেতন প্রদান",
  });

  // Form: Add Staff Member
  const [staffForm, setStaffForm] = useState({
    name: "",
    role: "TEACHER",
    phone: "",
    basicSalary: 15000,
    housingAllowance: 2000,
    foodAllowance: 2000,
  });

  const loadData = () => {
    setLoading(true);
    fetch(`/api/payroll?month=${selectedMonth}&year=${selectedYear}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setData(res);
          if (res.staffUsers?.length > 0 && !salaryForm.userId) {
            setSalaryForm((prev) => ({ ...prev, userId: res.staffUsers[0].id }));
          }
        }
      })
      .catch((err) => console.error("Failed to load payroll:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  // Open Create/Edit modal with proper mode and data
  const handleOpenCreateModal = (existingSalary?: any) => {
    if (existingSalary) {
      setEntryMode("SELECT");
      setSalaryForm({
        userId: existingSalary.userId,
        manualName: existingSalary.user?.name || "",
        manualRole: existingSalary.user?.role || "TEACHER",
        phone: existingSalary.user?.phone || "",
        basicSalary: existingSalary.basicSalary,
        housingAllowance: existingSalary.housingAllowance,
        foodAllowance: existingSalary.foodAllowance,
        bonus: existingSalary.bonus,
        deduction: existingSalary.deduction,
        paymentStatus: existingSalary.paymentStatus,
        paymentMethod: existingSalary.paymentMethod,
        paymentDate: existingSalary.paymentDate || new Date().toISOString().split("T")[0],
        notes: existingSalary.notes || "",
      });
    } else {
      // Direct manual writing by default
      setEntryMode("MANUAL");
      setSalaryForm({
        userId: "",
        manualName: "",
        manualRole: "TEACHER",
        phone: "",
        basicSalary: 16000,
        housingAllowance: 2500,
        foodAllowance: 2000,
        bonus: 0,
        deduction: 0,
        paymentStatus: "PAID",
        paymentMethod: "CASH",
        paymentDate: new Date().toISOString().split("T")[0],
        notes: "মাসিক নিয়মিত বেতন প্রদান",
      });
    }
    setShowCreateModal(true);
  };

  // Handle manual name input with autocomplete detection
  const handleManualNameChange = (name: string) => {
    const match = data?.staffUsers?.find(
      (u: any) => u.name.trim().toLowerCase() === name.trim().toLowerCase()
    );
    if (match) {
      setSalaryForm((prev) => ({
        ...prev,
        manualName: name,
        userId: match.id,
        manualRole: match.role || prev.manualRole,
        phone: match.phone || prev.phone,
      }));
    } else {
      setSalaryForm((prev) => ({
        ...prev,
        manualName: name,
        userId: "",
      }));
    }
  };

  // When staff selection changes in dropdown, auto-fill default salary
  const handleStaffSelect = (userId: string) => {
    const selectedUser = data?.staffUsers?.find((u: any) => u.id === userId);
    const existing = data?.salaries?.find((s: any) => s.userId === userId);
    if (existing) {
      setSalaryForm({
        userId,
        manualName: existing.user?.name || selectedUser?.name || "",
        manualRole: existing.user?.role || selectedUser?.role || "TEACHER",
        phone: existing.user?.phone || selectedUser?.phone || "",
        basicSalary: existing.basicSalary,
        housingAllowance: existing.housingAllowance,
        foodAllowance: existing.foodAllowance,
        bonus: existing.bonus,
        deduction: existing.deduction,
        paymentStatus: existing.paymentStatus,
        paymentMethod: existing.paymentMethod,
        paymentDate: existing.paymentDate || new Date().toISOString().split("T")[0],
        notes: existing.notes || "",
      });
    } else {
      setSalaryForm((prev) => ({
        ...prev,
        userId,
        manualName: selectedUser?.name || "",
        manualRole: selectedUser?.role || "TEACHER",
        phone: selectedUser?.phone || "",
      }));
    }
  };

  const handleCreateSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (entryMode === "MANUAL" && !salaryForm.manualName.trim()) {
      alert("দয়া করে কর্মকর্তা বা কর্মচারীর নাম লিখুন");
      return;
    }
    if (entryMode === "SELECT" && !salaryForm.userId) {
      alert("দয়া করে তালিকা থেকে একজন স্টাফ নির্বাচন করুন");
      return;
    }

    try {
      const res = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_SALARY",
          entryMode,
          month: selectedMonth,
          year: selectedYear,
          ...salaryForm,
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        setShowCreateModal(false);
        loadData();
      } else {
        alert(resJson.error || "বেতন সংরক্ষণ করতে সমস্যা হয়েছে");
      }
    } catch (err) {
      console.error("Create salary failed:", err);
    }
  };

  const handleMarkPaid = async (salaryId: string, method = "CASH") => {
    try {
      await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "MARK_PAID",
          salaryId,
          paymentMethod: method,
          paymentDate: new Date().toISOString().split("T")[0],
        }),
      });
      loadData();
    } catch (err) {
      console.error("Mark paid failed:", err);
    }
  };

  const handleDeleteSalary = async (salaryId: string, staffName: string) => {
    if (!confirm(`আপনি কি নিশ্চিতভাবে ${staffName}-এর এই মাসের বেতন রেকর্ডটি মুছে ফেলতে চান?`)) {
      return;
    }
    try {
      const res = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DELETE_SALARY",
          salaryId,
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        loadData();
      } else {
        alert(resJson.error || "মুছে ফেলা সম্ভব হয়নি");
      }
    } catch (err) {
      console.error("Delete salary failed:", err);
    }
  };

  // Close any modal with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (paySlipData) setPaySlipData(null);
        if (showCreateModal) setShowCreateModal(false);
        if (showAddStaffModal) setShowAddStaffModal(false);
        if (showPdfReport) setShowPdfReport(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paySlipData, showCreateModal, showAddStaffModal, showPdfReport]);

  const handleBulkGenerate = async () => {
    if (!confirm(`${selectedMonth} ${selectedYear} মাসের সকল কর্মকর্তা ও কর্মচারীর বেতন শিট এক ক্লিকে প্রস্তুত করতে চান?`)) {
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "BULK_GENERATE",
          month: selectedMonth,
          year: selectedYear,
          defaultStatus: "PAID",
          paymentMethod: "CASH",
        }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error("Bulk generate failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_STAFF",
          ...staffForm,
          currentMonth: selectedMonth,
          currentYear: selectedYear,
        }),
      });
      if (res.ok) {
        setShowAddStaffModal(false);
        setStaffForm({
          name: "",
          role: "TEACHER",
          phone: "",
          basicSalary: 15000,
          housingAllowance: 2000,
          foodAllowance: 2000,
        });
        loadData();
      }
    } catch (err) {
      console.error("Add staff failed:", err);
    }
  };

  // Open PDF for current selected month
  const handleOpenCurrentMonthPdf = () => {
    setReportMonth(selectedMonth);
    setReportYear(selectedYear);
    setReportSalaries(data?.salaries || []);
    setShowPdfReport(true);
  };

  // Open PDF for a historic month from history tab
  const handleOpenHistoricMonthPdf = async (histMonth: string, histYear: number) => {
    try {
      const res = await fetch(`/api/payroll?month=${encodeURIComponent(histMonth)}&year=${histYear}`);
      const d = await res.json();
      if (d.success) {
        setReportMonth(histMonth);
        setReportYear(histYear);
        setReportSalaries(d.salaries || []);
        setShowPdfReport(true);
      }
    } catch (err) {
      console.error("Failed to load historic salaries:", err);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 p-6 rounded-3xl text-white shadow-xl border border-emerald-800/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 opacity-5 pointer-events-none select-none flex items-center justify-center font-arabic text-8xl">
          رواتب
        </div>

        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2 text-emerald-300 text-xs sm:text-sm font-semibold">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-800/80 border border-emerald-600/60 text-amber-300 flex items-center gap-1.5">
              <Banknote className="w-3.5 h-3.5" />
              মাদরাসা কর্মকর্তা ও কর্মচারী বেতন শাখা
            </span>
            <span className="text-zinc-400">•</span>
            <span>মুহতামিম ও একাউন্টস কন্ট্রোল</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            কর্মকর্তা ও কর্মচারী বেতন ব্যবস্থাপনা
          </h1>
          <p className="text-emerald-200/90 text-xs sm:text-sm max-w-2xl leading-relaxed">
            উস্তাদ, কর্মকর্তা ও কর্মচারীদের মাসিক বেতন প্রদান, পে-স্লিপ প্রিন্ট এবং মাস শেষে খরচের অফিশিয়াল বিবরণী শিট (PDF) তৈরি করুন
          </p>
        </div>

        {/* Quick Top Actions */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleOpenCurrentMonthPdf}
            className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all text-xs sm:text-sm cursor-pointer border border-amber-300"
            title="চলতি মাসের সকল খরচের অফিশিয়াল বিবরণী শিট পিডিএফ প্রিন্ট করুন"
          >
            <FileText className="w-4 h-4 text-emerald-950" />
            <span>মাস শেষে খরচের শিট (PDF)</span>
          </button>

          <button
            onClick={() => handleOpenCreateModal()}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition-all text-xs sm:text-sm cursor-pointer border border-emerald-500/50"
          >
            <PlusCircle className="w-4 h-4" />
            <span>বেতন এন্ট্রি ও নাম লিখুন</span>
          </button>

          <button
            onClick={() => setShowAddStaffModal(true)}
            className="flex items-center gap-1.5 bg-emerald-800/90 hover:bg-emerald-700 text-emerald-100 font-semibold px-3.5 py-2.5 rounded-xl shadow-xs transition-all text-xs sm:text-sm cursor-pointer border border-emerald-700/60"
            title="নতুন কোনো উস্তাদ বা কর্মচারী যুক্ত করুন"
          >
            <UserPlus className="w-4 h-4 text-amber-300" />
            <span>নতুন স্টাফ</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Header */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-1">
        <button
          onClick={() => setActiveTab("MONTHLY")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "MONTHLY"
              ? "bg-emerald-900 text-white shadow-md shadow-emerald-950/20"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>মাসিক বেতন শিট ও প্রদান</span>
        </button>

        <button
          onClick={() => setActiveTab("HISTORY")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "HISTORY"
              ? "bg-emerald-900 text-white shadow-md shadow-emerald-950/20"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>সব মাসের হিস্ট্রি ও অডিট রিপোর্ট</span>
          {data?.history?.length > 0 && (
            <span className="px-2 py-0.2 rounded-full text-[10px] bg-amber-400 text-emerald-950 font-black">
              {toBengaliNumber(data.history.length)} মাস
            </span>
          )}
        </button>
      </div>

      {/* ==========================================================
          TAB 1: MONTHLY SALARY VIEW & DISBURSEMENT
          ========================================================== */}
      {activeTab === "MONTHLY" && (
        <div className="space-y-6">
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Wallet className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold uppercase truncate">
                  পরিশোধিত খরচ ({selectedMonth})
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400">
                  {formatTaka(data?.totalDisbursed || 0)}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold uppercase truncate">
                  বকেয়া পাওনা
                </div>
                <div className={`text-xl sm:text-2xl font-black ${(data?.pendingDisbursed || 0) > 0 ? "text-amber-600 dark:text-amber-400" : "text-zinc-400"}`}>
                  {formatTaka(data?.pendingDisbursed || 0)}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold uppercase truncate">
                  মোট স্টাফ সংখ্যা
                </div>
                <div className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
                  {toBengaliNumber(data?.salaries?.length || 0)} / {toBengaliNumber(data?.staffUsers?.length || 0)} জন
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Building className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold uppercase truncate">
                  সর্বমোট খরচ বাজেট
                </div>
                <div className="text-xl sm:text-2xl font-black text-purple-800 dark:text-purple-300">
                  {formatTaka(data?.totalSalaryExpense || 0)}
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar & Bulk Actions */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                মাস ও সন নির্বাচন:
              </span>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {toBengaliNumber(y)}
                  </option>
                ))}
              </select>

              <button
                onClick={handleBulkGenerate}
                disabled={generating}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-bold transition cursor-pointer"
                title="এক ক্লিকে সকল স্টাফের চলতি মাসের বেতন স্বয়ংক্রিয়ভাবে তৈরি করুন"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>{generating ? "প্রস্তুত হচ্ছে..." : "এক ক্লিকে সকল স্টাফের বেতন তৈরি"}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={handleOpenCurrentMonthPdf}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>মাসিক খরচের শিট (PDF)</span>
              </button>
            </div>
          </div>

          {/* Salary Table */}
          {loading ? (
            <div className="text-center py-20 text-zinc-400 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              বেতন শিট ও খরচের তথ্য লোড হচ্ছে...
            </div>
          ) : data?.salaries?.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <Banknote className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-200">
                {selectedMonth} {toBengaliNumber(selectedYear)} মাসের কোনো বেতন এন্ট্রি পাওয়া যায়নি
              </h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                আপনি এক ক্লিকে সকল কর্মকর্তা-কর্মচারীর বেতন স্বয়ংক্রিয়ভাবে তৈরি করতে পারেন অথবা আলাদা আলাদা এন্ট্রি দিতে পারেন।
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={handleBulkGenerate}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>এক ক্লিকে সকল স্টাফের বেতন তৈরি করুন</span>
                </button>
                <button
                  onClick={() => handleOpenCreateModal()}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-zinc-300"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>ম্যানুয়াল এন্ট্রি দিন</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 font-bold border-b border-zinc-200 dark:border-zinc-800 uppercase text-[11px]">
                      <th className="py-3.5 px-4">কর্মকর্তা / স্টাফের নাম</th>
                      <th className="py-3.5 px-3">পদবী ও দায়িত্ব</th>
                      <th className="py-3.5 px-3 text-right">মূল বেতন</th>
                      <th className="py-3.5 px-3 text-right">বাড়ি ও খাবার ভাতা</th>
                      <th className="py-3.5 px-3 text-right">বোনাস / কর্তন</th>
                      <th className="py-3.5 px-3 text-right">সর্বমোট প্রদেয়</th>
                      <th className="py-3.5 px-3 text-center">পরিশোধ মাধ্যম</th>
                      <th className="py-3.5 px-3 text-center">স্ট্যাটাস</th>
                      <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {data.salaries.map((s: any) => {
                      const isPaid = s.paymentStatus === "PAID";
                      const allowanceTotal = s.housingAllowance + s.foodAllowance;
                      const roleLabel = (s.user?.role && ROLE_BN[s.user.role]) || s.user?.role || "কর্মকর্তা/কর্মচারী";

                      return (
                        <tr key={s.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition">
                          <td className="py-3 px-4">
                            <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                              {s.user?.name || "নাম পাওয়া যায়নি"}
                            </div>
                            <div className="text-[10px] text-zinc-500 font-mono">
                              {s.user?.phone ? toBengaliNumber(s.user.phone) : "—"}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-emerald-800 dark:text-emerald-300 text-xs">
                              {roleLabel}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-medium text-zinc-800 dark:text-zinc-200">
                            {formatTaka(s.basicSalary)}
                          </td>
                          <td className="py-3 px-3 text-right text-zinc-600 dark:text-zinc-400">
                            {allowanceTotal > 0 ? `+${formatTaka(allowanceTotal)}` : "০"}
                          </td>
                          <td className="py-3 px-3 text-right">
                            {s.bonus > 0 && <span className="text-emerald-600 font-semibold block">+{formatTaka(s.bonus)}</span>}
                            {s.deduction > 0 && <span className="text-rose-600 font-semibold block">-{formatTaka(s.deduction)}</span>}
                            {s.bonus === 0 && s.deduction === 0 && <span className="text-zinc-400">—</span>}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-sm text-emerald-700 dark:text-emerald-400">
                            {formatTaka(s.totalAmount)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                              {s.paymentMethod === "BANK" ? "ব্যাংক" : s.paymentMethod === "BKASH" ? "বিকাশ" : "ক্যাশ"}
                            </span>
                            {s.paymentDate && (
                              <span className="block text-[9px] text-zinc-400 font-mono">
                                {toBengaliNumber(s.paymentDate)}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                isPaid
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                              }`}
                            >
                              {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                              {isPaid ? "পরিশোধিত" : "বকেয়া"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {!isPaid && (
                                <button
                                  onClick={() => handleMarkPaid(s.id, "CASH")}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition shadow-xs cursor-pointer"
                                  title="ক্যাশে পরিশোধ নিশ্চিত করুন"
                                >
                                  পরিশোধ
                                </button>
                              )}
                              <button
                                onClick={() => handleOpenCreateModal(s)}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 dark:text-emerald-300 text-[11px] font-bold px-2 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800 flex items-center gap-1 transition cursor-pointer"
                                title="বেতন ও তথ্য পরিবর্তন করুন"
                              >
                                <Pencil className="w-3 h-3 text-emerald-600" />
                                <span>সম্পাদনা</span>
                              </button>
                              <button
                                onClick={() => setPaySlipData(s)}
                                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700 flex items-center gap-1 transition cursor-pointer"
                                title="ব্যক্তিগত পে-স্লিপ প্রিন্ট করুন"
                              >
                                <Printer className="w-3 h-3 text-emerald-600" />
                                <span>পে-স্লিপ</span>
                              </button>
                              <button
                                onClick={() => handleDeleteSalary(s.id, s.user?.name || "কর্মকর্তা")}
                                className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                                title="বেতন রেকর্ড মুছে ফেলুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-zinc-100/80 dark:bg-zinc-800/80 font-bold border-t border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
                      <td colSpan={2} className="py-3 px-4 text-right text-xs">
                        মোট যোগফল:
                      </td>
                      <td className="py-3 px-3 text-right">
                        {formatTaka(data.totalBasicSalary)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        +{formatTaka(data.totalAllowances)}
                      </td>
                      <td className="py-3 px-3 text-right text-rose-600">
                        -{formatTaka(data.totalDeduction)}
                      </td>
                      <td className="py-3 px-3 text-right text-sm text-emerald-700 dark:text-emerald-400">
                        {formatTaka(data.totalSalaryExpense)}
                      </td>
                      <td colSpan={3} className="py-3 px-4 text-right text-xs text-zinc-500">
                        পরিশোধিত: <b className="text-emerald-700 dark:text-emerald-400">{formatTaka(data.totalDisbursed)}</b> | বকেয়া: <b className="text-amber-600">{formatTaka(data.pendingDisbursed)}</b>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==========================================================
          TAB 2: ALL MONTHS HISTORY & AUDIT VIEW
          ========================================================== */}
      {activeTab === "HISTORY" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                সকল মাসের বেতন ও খরচের ইতিহাস (All Months History)
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                মাদ্রাসার বিগত ও চলতি সব মাসের বেতন প্রদানের রেকর্ড এবং যেকোনো মাসের অফিশিয়াল পিডিএফ শিট বের করুন
              </p>
            </div>

            <div className="text-xs text-zinc-600 dark:text-zinc-300 font-semibold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3.5 py-1.5 rounded-xl">
              রেকর্ডকৃত মোট মাস: <b className="text-emerald-800 dark:text-emerald-300 font-bold">{toBengaliNumber(data?.history?.length || 0)}টি</b>
            </div>
          </div>

          {/* History Table */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 font-bold border-b border-zinc-200 dark:border-zinc-800 uppercase text-[11px]">
                    <th className="py-3.5 px-4">বেতনের মাস ও সন</th>
                    <th className="py-3.5 px-3 text-center">স্টাফ সংখ্যা</th>
                    <th className="py-3.5 px-3 text-right">মূল বেতন</th>
                    <th className="py-3.5 px-3 text-right">ভাতা ও বোনাস</th>
                    <th className="py-3.5 px-3 text-right">সর্বমোট খরচ</th>
                    <th className="py-3.5 px-3 text-right">পরিশোধিত টাকা</th>
                    <th className="py-3.5 px-3 text-right">বকেয়া</th>
                    <th className="py-3.5 px-3 text-center">পরিস্থিতি</th>
                    <th className="py-3.5 px-4 text-right">পিডিএফ ও রিপোর্ট</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {data?.history?.map((h: any, idx: number) => {
                    const isFullyPaid = h.pendingAmount === 0;

                    return (
                      <tr key={idx} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition">
                        <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                          {h.month} {toBengaliNumber(h.year)}
                          {h.lastPaymentDate && (
                            <span className="block text-[10px] text-zinc-400 font-normal">
                              পেমেন্ট: {toBengaliNumber(h.lastPaymentDate)}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-zinc-700 dark:text-zinc-300">
                          {toBengaliNumber(h.staffCount)} জন
                        </td>
                        <td className="py-3 px-3 text-right text-zinc-700 dark:text-zinc-300 font-medium">
                          {formatTaka(h.totalBasic)}
                        </td>
                        <td className="py-3 px-3 text-right text-zinc-600 dark:text-zinc-400">
                          +{formatTaka(h.totalAllowances + h.totalBonus)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-sm text-zinc-900 dark:text-zinc-100">
                          {formatTaka(h.totalAmount)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-700 dark:text-emerald-400">
                          {formatTaka(h.paidAmount)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold">
                          {h.pendingAmount > 0 ? (
                            <span className="text-amber-600">{formatTaka(h.pendingAmount)}</span>
                          ) : (
                            <span className="text-zinc-400 font-normal">০</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isFullyPaid
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-amber-100 text-amber-800 border border-amber-300"
                            }`}
                          >
                            {isFullyPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {isFullyPaid ? "১০০% পরিশোধিত" : "আংশিক বকেয়া"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenHistoricMonthPdf(h.month, h.year)}
                              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                              title={`${h.month} ${toBengaliNumber(h.year)} মাসের অফিশিয়াল খরচ শিট পিডিএফ দেখুন ও প্রিন্ট করুন`}
                            >
                              <Printer className="w-3.5 h-3.5 text-amber-300" />
                              <span>মাসিক খরচ শিট (PDF)</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedMonth(h.month);
                                setSelectedYear(h.year);
                                setActiveTab("MONTHLY");
                              }}
                              className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                              title="মাসিক শিট ডেস্কে বিস্তারিত দেখুন"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
          MODAL 1: CREATE / EDIT SALARY ENTRY
          ========================================================== */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex justify-center items-start p-3 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCreateModal(false);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 my-4 sm:my-6 overflow-hidden">
            <div className="bg-emerald-950 text-white p-4 font-bold text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-amber-400" />
                <span>বেতন এন্ট্রি ও প্রদান ({selectedMonth} {toBengaliNumber(selectedYear)})</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-emerald-900 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSalary} className="p-5 sm:p-6 space-y-4 text-xs">
              {/* Mode Toggle Pills */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    কর্মকর্তা / কর্মচারীর তথ্য *
                  </span>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                    {entryMode === "MANUAL" ? "✍️ সরাসরি টাইপ করছেন" : "👥 তালিকা থেকে বাছাই"}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700 mb-3">
                  <button
                    type="button"
                    onClick={() => setEntryMode("MANUAL")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      entryMode === "MANUAL"
                        ? "bg-emerald-700 text-white shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    <span>✍️ সরাসরি নাম লিখুন (ম্যানুয়ালি)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEntryMode("SELECT");
                      if (data?.staffUsers?.length > 0 && !salaryForm.userId) {
                        handleStaffSelect(data.staffUsers[0].id);
                      }
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      entryMode === "SELECT"
                        ? "bg-emerald-700 text-white shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    <span>👥 তালিকা থেকে নির্বাচন ({toBengaliNumber(data?.staffUsers?.length || 0)})</span>
                  </button>
                </div>

                {entryMode === "MANUAL" ? (
                  <div className="space-y-3 bg-emerald-50/60 dark:bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                    <div>
                      <label className="block font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                        কর্মকর্তা / কর্মচারীর পূর্ণ নাম (ম্যানুয়ালি লিখুন) *
                      </label>
                      <input
                        type="text"
                        required
                        list="payroll-staff-names-list"
                        value={salaryForm.manualName}
                        onChange={(e) => handleManualNameChange(e.target.value)}
                        placeholder="যেমন: মাওলানা আব্দুর রহমান, ক্বারী ইউসুফ, বাবুর্চি সালাম..."
                        className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                      <datalist id="payroll-staff-names-list">
                        {data?.staffUsers?.map((u: any) => (
                          <option key={u.id} value={u.name}>
                            {ROLE_BN[u.role] || u.role} {u.phone ? `(${u.phone})` : ""}
                          </option>
                        ))}
                      </datalist>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 block">
                        💡 এখানে যেকোনো শিক্ষক, মুহতামিম, খাদেম বা কর্মচারীর নাম লিখে সরাসরি বেতন এন্ট্রি দেওয়া যাবে।
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                          পদবী ও দায়িত্ব *
                        </label>
                        <select
                          value={salaryForm.manualRole}
                          onChange={(e) => setSalaryForm({ ...salaryForm, manualRole: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                          <option value="TEACHER">উস্তাদ / শিক্ষক</option>
                          <option value="NAZIM_E_TALIMAT">নাজেমে তালিমাত / প্রধান শিক্ষক</option>
                          <option value="MUHTAMIM">মুহতামিম / সহকারী মুহতামিম</option>
                          <option value="ACCOUNTANT">হিসাবরক্ষক ও ক্যাশিয়ার</option>
                          <option value="HOSTEL_SUPER">হোস্টেল সুপার / বোর্ডিং</option>
                          <option value="COOK">বাবুর্চি / সহকারী</option>
                          <option value="GUARD">নিরাপত্তা প্রহরী / দারোয়ান</option>
                          <option value="KHADEM">খাদেম / স্টাফ</option>
                          <option value="OTHER">অন্যান্য কর্মচারী</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                          মোবাইল নম্বর (ঐচ্ছিক)
                        </label>
                        <input
                          type="text"
                          value={salaryForm.phone}
                          onChange={(e) => setSalaryForm({ ...salaryForm, phone: e.target.value })}
                          placeholder="017xxxxxxxx"
                          className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                      সংরক্ষিত স্টাফ তালিকা থেকে নির্বাচন করুন *
                    </label>
                    <select
                      required
                      value={salaryForm.userId}
                      onChange={(e) => handleStaffSelect(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="">-- স্টাফ নির্বাচন করুন --</option>
                      {data?.staffUsers?.map((u: any) => (
                        <option key={u.id} value={u.id}>
                          {u.name} — ({ROLE_BN[u.role] || u.role})
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                      <span>তালিকায় কাঙ্ক্ষিত নাম না পেলে?</span>
                      <button
                        type="button"
                        onClick={() => setEntryMode("MANUAL")}
                        className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                      >
                        ✍️ সরাসরি নাম ম্যানুয়ালি লিখুন
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                    মূল বেতন (Basic Salary) *
                  </label>
                  <input
                    type="number"
                    required
                    value={salaryForm.basicSalary}
                    onChange={(e) => setSalaryForm({ ...salaryForm, basicSalary: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                    বাড়ি ভাড়া ভাতা
                  </label>
                  <input
                    type="number"
                    value={salaryForm.housingAllowance}
                    onChange={(e) => setSalaryForm({ ...salaryForm, housingAllowance: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                    খাবার ভাতা
                  </label>
                  <input
                    type="number"
                    value={salaryForm.foodAllowance}
                    onChange={(e) => setSalaryForm({ ...salaryForm, foodAllowance: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                    বোনাস
                  </label>
                  <input
                    type="number"
                    value={salaryForm.bonus}
                    onChange={(e) => setSalaryForm({ ...salaryForm, bonus: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-rose-600 mb-1">
                    কর্তন (Deduction)
                  </label>
                  <input
                    type="number"
                    value={salaryForm.deduction}
                    onChange={(e) => setSalaryForm({ ...salaryForm, deduction: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Total Calculation Preview */}
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex justify-between items-center">
                <span className="font-bold text-zinc-700 dark:text-zinc-300">সর্বমোট প্রদেয় নিট বেতন:</span>
                <span className="text-base font-black text-emerald-900 dark:text-emerald-300">
                  {formatTaka(
                    salaryForm.basicSalary +
                      salaryForm.housingAllowance +
                      salaryForm.foodAllowance +
                      salaryForm.bonus -
                      salaryForm.deduction
                  )}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                    পরিশোধ মাধ্যম
                  </label>
                  <select
                    value={salaryForm.paymentMethod}
                    onChange={(e) => setSalaryForm({ ...salaryForm, paymentMethod: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="CASH">নগদ ক্যাশ</option>
                    <option value="BANK">ব্যাংক ট্রান্সফার</option>
                    <option value="BKASH">বিকাশ / নগদ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                    পরিশোধের স্ট্যাটাস
                  </label>
                  <select
                    value={salaryForm.paymentStatus}
                    onChange={(e) => setSalaryForm({ ...salaryForm, paymentStatus: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="PAID">পরিশোধিত (Paid)</option>
                    <option value="UNPAID">বকেয়া (Unpaid)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                  নোট বা মন্তব্য
                </label>
                <input
                  type="text"
                  value={salaryForm.notes}
                  onChange={(e) => setSalaryForm({ ...salaryForm, notes: e.target.value })}
                  placeholder="যেমন: নিয়মিত মাসিক বেতন ও ভাতা"
                  className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-md cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================================
          MODAL 2: ADD NEW STAFF / EMPLOYEE
          ========================================================== */}
      {showAddStaffModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex justify-center items-start p-3 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddStaffModal(false);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 my-4 sm:my-6 overflow-hidden">
            <div className="bg-emerald-950 text-white p-4 font-bold text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <span>নতুন কর্মকর্তা / কর্মচারী নিবন্ধন</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStaffModal(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-emerald-900 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="p-5 sm:p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                  পুরো নাম *
                </label>
                <input
                  type="text"
                  required
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  placeholder="যেমন: হাফেজ ক্বারী মাওলানা আব্দুল জলিল"
                  className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                    পদবী ও দায়িত্ব *
                  </label>
                  <select
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="TEACHER">উস্তাদ / শিক্ষক</option>
                    <option value="NAZIM_E_TALIMAT">নাজেমে তালিমাত / প্রধান শিক্ষক</option>
                    <option value="MUHTAMIM">মুহতামিম / সহ-মুহতামিম</option>
                    <option value="ACCOUNTANT">হিসাবরক্ষক ও ক্যাশিয়ার</option>
                    <option value="HOSTEL_SUPER">হোস্টেল সুপার / বোর্ডিং</option>
                    <option value="COOK">বাবুর্চি / সহকারী</option>
                    <option value="GUARD">নিরাপত্তা প্রহরী / দারোয়ান</option>
                    <option value="KHADEM">খাদেম / স্টাফ</option>
                    <option value="OTHER">অন্যান্য কর্মচারী</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                    মোবাইল নম্বর
                  </label>
                  <input
                    type="text"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    placeholder="01711223344"
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                    নির্ধারিত মূল বেতন *
                  </label>
                  <input
                    type="number"
                    required
                    value={staffForm.basicSalary}
                    onChange={(e) => setStaffForm({ ...staffForm, basicSalary: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                    বাড়ি ভাড়া ভাতা
                  </label>
                  <input
                    type="number"
                    value={staffForm.housingAllowance}
                    onChange={(e) => setStaffForm({ ...staffForm, housingAllowance: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                    খাবার ভাতা
                  </label>
                  <input
                    type="number"
                    value={staffForm.foodAllowance}
                    onChange={(e) => setStaffForm({ ...staffForm, foodAllowance: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[11px] text-zinc-600 dark:text-zinc-400">
                ℹ️ নতুন কর্মকর্তা/কর্মচারী যুক্ত হওয়ার সাথে সাথে {selectedMonth} {toBengaliNumber(selectedYear)} মাসের পে-রোলে তিনি অন্তর্ভুক্ত হয়ে যাবেন।
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-md cursor-pointer"
                >
                  নিবন্ধন সম্পন্ন করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================================
          MODAL 3: INDIVIDUAL PRINTABLE PAY SLIP VOUCHER
          ========================================================== */}
      {paySlipData && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex justify-center items-start p-3 sm:p-4 print:p-0 print:bg-white print:static"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPaySlipData(null);
          }}
        >
          <div
            className="relative bg-white text-zinc-950 w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-300 my-4 sm:my-6 overflow-hidden print:m-0 print:shadow-none print:border-none print:w-full print:max-w-none printable-sheet"
            style={{ color: "#09090b", backgroundColor: "#ffffff" }}
          >
            {/* Top Bar Controls */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-zinc-200 pb-3 pt-3 px-5 flex items-center justify-between gap-2 print:hidden shadow-xs">
              <button
                type="button"
                onClick={() => setPaySlipData(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition cursor-pointer border border-zinc-300 shadow-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>← ফিরে যান</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>পে-স্লিপ প্রিন্ট করুন</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaySlipData(null)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slip Content */}
            <div className="p-6 space-y-4 text-xs font-sans">
              <div className="text-center border-b border-emerald-900 pb-3">
                <p className="text-xs font-arabic text-zinc-700">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                <h2 className="text-xl font-bold text-emerald-950">
                  {data?.institution?.nameBn || "দারুল উলুম হাফিজিয়া কওমিয়া মাদ্রাসা"}
                </h2>
                <p className="text-[11px] text-zinc-600">
                  {data?.institution?.address || "দীঘি সগুনা , তাড়াশ, সিরাজগঞ্জ"} | মোবা: {data?.institution?.phone || "01869171818"}
                </p>
                <div className="mt-2 inline-block px-3 py-0.5 rounded-full bg-emerald-900 text-white font-bold text-[11px]">
                  কর্মকর্তা ও কর্মচারী বেতন স্লিপ (Pay Slip)
                </div>
                <p className="text-xs font-bold text-zinc-800 mt-1">
                  মাস: {paySlipData.month} {toBengaliNumber(paySlipData.year)} ইং
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
                <div>
                  <span className="text-zinc-600">নাম: </span>
                  <b className="text-zinc-900 text-sm">{paySlipData.user?.name}</b>
                </div>
                <div>
                  <span className="text-zinc-600">পদবী: </span>
                  <b className="text-zinc-800">{ROLE_BN[paySlipData.user?.role] || paySlipData.user?.role}</b>
                </div>
                <div>
                  <span className="text-zinc-600">মোবাইল: </span>
                  <b className="font-mono">{paySlipData.user?.phone ? toBengaliNumber(paySlipData.user.phone) : "—"}</b>
                </div>
                <div>
                  <span className="text-zinc-600">পেমেন্ট মাধ্যম: </span>
                  <b>{paySlipData.paymentMethod === "BANK" ? "ব্যাংক" : paySlipData.paymentMethod === "BKASH" ? "বিকাশ" : "ক্যাশ"}</b>
                </div>
              </div>

              <table className="w-full text-left border-collapse border border-zinc-300">
                <tbody>
                  <tr className="border-b border-zinc-200">
                    <td className="p-2 font-medium">মূল বেতন (Basic Salary)</td>
                    <td className="p-2 text-right font-bold">{formatTaka(paySlipData.basicSalary)}</td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="p-2 font-medium">বাড়ি ভাড়া ভাতা</td>
                    <td className="p-2 text-right font-bold">{formatTaka(paySlipData.housingAllowance)}</td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="p-2 font-medium">খাবার ভাতা</td>
                    <td className="p-2 text-right font-bold">{formatTaka(paySlipData.foodAllowance)}</td>
                  </tr>
                  {paySlipData.bonus > 0 && (
                    <tr className="border-b border-zinc-200">
                      <td className="p-2 font-medium">বিশেষ বোনাস / পারিতোষিক</td>
                      <td className="p-2 text-right font-bold text-emerald-700">+{formatTaka(paySlipData.bonus)}</td>
                    </tr>
                  )}
                  {paySlipData.deduction > 0 && (
                    <tr className="border-b border-zinc-200">
                      <td className="p-2 font-medium">কর্তন (Deduction)</td>
                      <td className="p-2 text-right font-bold text-rose-700">-{formatTaka(paySlipData.deduction)}</td>
                    </tr>
                  )}
                  <tr className="bg-emerald-100/70 font-black text-emerald-950 text-sm">
                    <td className="p-2.5">সর্বমোট নিট প্রদেয় বেতন</td>
                    <td className="p-2.5 text-right">{formatTaka(paySlipData.totalAmount)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="p-2 bg-zinc-50 rounded border border-zinc-200 text-[11px]">
                <span className="text-zinc-600">কথায়: </span>
                <b className="text-emerald-950">{numberToBengaliWords(paySlipData.totalAmount)}</b>
              </div>

              <div className="pt-8 grid grid-cols-2 gap-4 text-center text-zinc-600">
                <div>
                  <div className="w-28 mx-auto border-t border-zinc-400 mb-1" />
                  <span>প্রাপকের স্বাক্ষর</span>
                </div>
                <div>
                  <div className="w-36 mx-auto border-t border-zinc-400 mb-1" />
                  <span>মুহতামিম / হিসাবরক্ষক</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-zinc-50 border-t border-zinc-200 flex justify-between items-center print:hidden">
              <button
                type="button"
                onClick={() => setPaySlipData(null)}
                className="px-3 py-1.5 text-zinc-600 font-bold text-xs"
              >
                বন্ধ করুন
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm text-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>প্রিন্ট করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
          MODAL 4: FULL OFFICIAL MONTHLY EXPENSE REPORT PDF SHEET
          ========================================================== */}
      {showPdfReport && (
        <MonthlyPayrollExpenseReport
          month={reportMonth}
          year={reportYear}
          salaries={reportSalaries}
          institution={data?.institution}
          onClose={() => setShowPdfReport(false)}
        />
      )}
    </div>
  );
}
