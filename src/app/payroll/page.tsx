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
} from "lucide-react";
import { toBengaliNumber, formatTaka } from "@/lib/formatters";

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
  MUHTAMIM: "প্রধান মুহতামিম",
  NAZIM_E_TALIMAT: "নাজেমে তালিমাত",
  ACCOUNTANT: "হিসাবরক্ষক",
  TEACHER: "উস্তাদ / শিক্ষক",
  HOSTEL_SUPER: "হোস্টেল সুপার",
};

const CURRENT_YEAR = new Date().getFullYear();
// বিগত ৫ বছর এবং আগামী ১০ বছর (২০২১ থেকে ২০৩৬)
const YEARS = Array.from({ length: 16 }, (_, i) => CURRENT_YEAR - 5 + i);

export default function PayrollPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("আগস্ট");
  const [selectedYear, setSelectedYear] = useState(2026);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [paySlipData, setPaySlipData] = useState<any | null>(null);

  // Form
  const [salaryForm, setSalaryForm] = useState({
    userId: "",
    basicSalary: 16000,
    housingAllowance: 3000,
    foodAllowance: 2000,
    bonus: 1000,
    deduction: 0,
    paymentStatus: "PAID",
    paymentMethod: "BANK",
    notes: "মাসিক নিয়মিত বেতন প্রদান",
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
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  const handleCreateSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/payroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "CREATE_SALARY",
        month: selectedMonth,
        year: selectedYear,
        ...salaryForm,
      }),
    });
    if (res.ok) {
      setShowCreateModal(false);
      loadData();
    }
  };

  const handleMarkPaid = async (salaryId: string) => {
    await fetch("/api/payroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "MARK_PAID",
        salaryId,
        paymentMethod: "CASH",
        paymentDate: new Date().toISOString().split("T")[0],
      }),
    });
    loadData();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-sm font-medium mb-1">
            <Banknote className="w-5 h-5 text-amber-400" />
            <span>মডিউল ৫: উস্তাদ ও স্টাফ বেতন (Payroll)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">মাসিক বেতন শিট ও পে-স্লিপ</h1>
          <p className="text-emerald-200/80 text-sm mt-1">
            উস্তাদ ও কর্মকর্তা-কর্মচারীদের মূল বেতন, ভাতা, কর্তন ও অফিশিয়াল পে-স্লিপ প্রিন্ট
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-emerald-950 font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          বেতন এন্ট্রি করুন
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase">পরিশোধিত বেতন ({selectedMonth})</div>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
              {formatTaka(data?.totalDisbursed || 0)}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase">বকেয়া বেতন</div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {formatTaka(data?.pendingDisbursed || 0)}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase">মোট কর্মকর্তা ও উস্তাদ</div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
              {toBengaliNumber(data?.staffUsers?.length || 0)} জন
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-semibold text-zinc-500">মাস নির্বাচন:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-zinc-800 dark:text-zinc-200"
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-zinc-800 dark:text-zinc-200"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {toBengaliNumber(y)}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-zinc-500">
          বেতন এন্ট্রি রয়েছে: <strong className="text-emerald-700 dark:text-emerald-400">{toBengaliNumber(data?.salaries?.length || 0)}</strong> জনের
        </div>
      </div>

      {/* Salary Table */}
      {loading ? (
        <div className="text-center py-20 text-zinc-400">বেতন শিট লোড হচ্ছে...</div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800 text-xs uppercase">
                  <th className="p-4">উস্তাদ / স্টাফের নাম</th>
                  <th className="p-4">পদবী</th>
                  <th className="p-4 text-right">মূল বেতন</th>
                  <th className="p-4 text-right">বাড়ি ও খাবার ভাতা</th>
                  <th className="p-4 text-right">বোনাস / কর্তন</th>
                  <th className="p-4 text-right">সর্বমোট প্রদেয়</th>
                  <th className="p-4 text-center">স্ট্যাটাস</th>
                  <th className="p-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {data?.salaries?.map((s: any) => {
                  const isPaid = s.paymentStatus === "PAID";
                  return (
                    <tr key={s.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                      <td className="p-4">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100">{s.user?.name}</div>
                        <div className="text-xs text-zinc-500 font-mono">{s.user?.phone || "—"}</div>
                      </td>
                      <td className="p-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                        {ROLE_BN[s.user?.role] || s.user?.role}
                      </td>
                      <td className="p-4 text-right font-medium">{formatTaka(s.basicSalary)}</td>
                      <td className="p-4 text-right text-xs text-zinc-600 dark:text-zinc-400">
                        +{formatTaka(s.housingAllowance + s.foodAllowance)}
                      </td>
                      <td className="p-4 text-right text-xs">
                        <span className="text-emerald-600">+{formatTaka(s.bonus)}</span>
                        {s.deduction > 0 && <span className="text-rose-600"> -{formatTaka(s.deduction)}</span>}
                      </td>
                      <td className="p-4 text-right font-bold text-base text-emerald-700 dark:text-emerald-400">
                        {formatTaka(s.totalAmount)}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300"
                          }`}
                        >
                          {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {isPaid ? "পরিশোধিত" : "বকেয়া"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isPaid && (
                            <button
                              onClick={() => handleMarkPaid(s.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all"
                            >
                              পরিশোধ করুন
                            </button>
                          )}
                          <button
                            onClick={() => setPaySlipData(s)}
                            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 flex items-center gap-1"
                          >
                            <Printer className="w-3 h-3" />
                            পে-স্লিপ
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
      )}

      {/* Modal: Create Salary */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="bg-emerald-900 text-white p-4 font-bold text-lg flex items-center justify-between">
              <span>বেতন এন্ট্রি ({selectedMonth} {toBengaliNumber(selectedYear)})</span>
              <button onClick={() => setShowCreateModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateSalary} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block font-semibold mb-1">উস্তাদ / স্টাফ নির্বাচন করুন*</label>
                <select
                  required
                  value={salaryForm.userId}
                  onChange={(e) => setSalaryForm({ ...salaryForm, userId: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                >
                  {data?.staffUsers?.map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({ROLE_BN[u.role] || u.role})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">মূল বেতন (Basic Salary)*</label>
                  <input
                    type="number"
                    value={salaryForm.basicSalary}
                    onChange={(e) => setSalaryForm({ ...salaryForm, basicSalary: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">বাড়ি ভাড়া ভাতা</label>
                  <input
                    type="number"
                    value={salaryForm.housingAllowance}
                    onChange={(e) => setSalaryForm({ ...salaryForm, housingAllowance: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">খাবার ভাতা</label>
                  <input
                    type="number"
                    value={salaryForm.foodAllowance}
                    onChange={(e) => setSalaryForm({ ...salaryForm, foodAllowance: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">বোনাস</label>
                  <input
                    type="number"
                    value={salaryForm.bonus}
                    onChange={(e) => setSalaryForm({ ...salaryForm, bonus: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-rose-600">কর্তন (Deduction)</label>
                  <input
                    type="number"
                    value={salaryForm.deduction}
                    onChange={(e) => setSalaryForm({ ...salaryForm, deduction: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">পেমেন্ট মেথড</label>
                  <select
                    value={salaryForm.paymentMethod}
                    onChange={(e) => setSalaryForm({ ...salaryForm, paymentMethod: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                  >
                    <option value="BANK">ব্যাংক ট্রান্সফার</option>
                    <option value="CASH">নগদ ক্যাশ</option>
                    <option value="BKASH">বিকাশ / মোবাইল ব্যাংক</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">পরিশোধের স্ট্যাটাস</label>
                  <select
                    value={salaryForm.paymentStatus}
                    onChange={(e) => setSalaryForm({ ...salaryForm, paymentStatus: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                  >
                    <option value="PAID">পরিশোধিত (Paid)</option>
                    <option value="UNPAID">বকেয়া (Unpaid)</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-zinc-500 hover:text-zinc-800 font-medium"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-md"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Printable Pay Slip */}
      {paySlipData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-300 overflow-hidden print:m-0 print:border-none">
            <div className="p-6 border-b border-zinc-200 text-center bg-emerald-50 relative">
              <button
                onClick={() => setPaySlipData(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-800 print:hidden text-lg"
              >
                ✕
              </button>
              <h2 className="text-xl font-black text-emerald-950">মাদ্রাসা শিক্ষক ও স্টাফ পে-স্লিপ</h2>
              <p className="text-xs text-zinc-600 font-arabic mt-0.5">قسيمة راتب الموظف</p>
              <p className="text-sm font-bold text-zinc-800 mt-1">
                মাস: {paySlipData.month} {toBengaliNumber(paySlipData.year)}
              </p>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                <div>নাম: <strong className="text-sm">{paySlipData.user?.name}</strong></div>
                <div>পদবী: <strong>{ROLE_BN[paySlipData.user?.role] || paySlipData.user?.role}</strong></div>
                <div>মোবাইল: <strong className="font-mono">{paySlipData.user?.phone || "—"}</strong></div>
                <div>পেমেন্ট মেথড: <strong>{paySlipData.paymentMethod}</strong></div>
              </div>

              <table className="w-full text-left border-collapse border border-zinc-200">
                <tbody>
                  <tr className="border-b border-zinc-200">
                    <td className="p-2 font-medium">মূল বেতন (Basic)</td>
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
                  <tr className="border-b border-zinc-200">
                    <td className="p-2 font-medium">বোনাস / অন্যান্য</td>
                    <td className="p-2 text-right font-bold text-emerald-700">+{formatTaka(paySlipData.bonus)}</td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="p-2 font-medium">কর্তন (যদি থাকে)</td>
                    <td className="p-2 text-right font-bold text-rose-700">-{formatTaka(paySlipData.deduction)}</td>
                  </tr>
                  <tr className="bg-emerald-50 text-sm font-black text-emerald-950">
                    <td className="p-3">সর্বমোট প্রদেয় বেতন</td>
                    <td className="p-3 text-right">{formatTaka(paySlipData.totalAmount)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="pt-8 grid grid-cols-2 gap-4 text-center text-zinc-500">
                <div className="border-t border-zinc-400 pt-1">প্রাপকের স্বাক্ষর</div>
                <div className="border-t border-zinc-400 pt-1">মুহতামিম / হিসাবরক্ষক</div>
              </div>
            </div>

            <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex justify-end gap-3 print:hidden">
              <button onClick={() => setPaySlipData(null)} className="px-4 py-2 text-zinc-600 font-medium">
                বন্ধ করুন
              </button>
              <button
                onClick={() => window.print()}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2 rounded-xl flex items-center gap-2 shadow"
              >
                <Printer className="w-4 h-4" />
                প্রিন্ট করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
