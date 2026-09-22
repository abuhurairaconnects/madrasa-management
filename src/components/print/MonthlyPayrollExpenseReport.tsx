"use client";

import React, { useEffect } from "react";
import { formatTaka, toBengaliNumber, numberToBengaliWords, formatBengaliDate } from "@/lib/formatters";
import { Printer, X, ArrowLeft, Building2, CheckCircle2, AlertCircle } from "lucide-react";

interface StaffSalaryRecord {
  id: string;
  basicSalary: number;
  housingAllowance: number;
  foodAllowance: number;
  bonus: number;
  deduction: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  paymentDate?: string | null;
  notes?: string | null;
  user: {
    name: string;
    role: string;
    phone?: string | null;
  };
}

interface MonthlyPayrollReportProps {
  month: string;
  year: number;
  salaries: StaffSalaryRecord[];
  institution?: {
    nameBn?: string;
    arabicName?: string | null;
    address?: string;
    phone?: string;
    muhtamimName?: string | null;
  } | null;
  onClose: () => void;
}

const ROLE_BN: Record<string, string> = {
  MUHTAMIM: "প্রধান মুহতামিম ও পরিচালক",
  NAZIM_E_TALIMAT: "নাজেমে তালিমাত ও প্রধান শিক্ষক",
  ACCOUNTANT: "প্রধান হিসাবরক্ষক ও ক্যাশিয়ার",
  TEACHER: "উস্তাদ / শিক্ষক",
  HOSTEL_SUPER: "হোস্টেল সুপার / স্টাফ",
};

export function MonthlyPayrollExpenseReport({
  month,
  year,
  salaries,
  institution,
  onClose,
}: MonthlyPayrollReportProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const handlePrint = () => {
    window.print();
  };

  // Calculations
  const totalBasic = salaries.reduce((acc, s) => acc + s.basicSalary, 0);
  const totalAllowances = salaries.reduce((acc, s) => acc + s.housingAllowance + s.foodAllowance, 0);
  const totalBonus = salaries.reduce((acc, s) => acc + s.bonus, 0);
  const totalDeductions = salaries.reduce((acc, s) => acc + s.deduction, 0);
  const grandTotal = salaries.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalPaid = salaries
    .filter((s) => s.paymentStatus === "PAID")
    .reduce((acc, s) => acc + s.totalAmount, 0);
  const totalDue = salaries
    .filter((s) => s.paymentStatus !== "PAID")
    .reduce((acc, s) => acc + s.totalAmount, 0);

  const todayStr = formatBengaliDate(new Date());

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs p-2 sm:p-4 md:p-6 print:p-0 print:bg-white print:static print:overflow-visible flex justify-center items-start"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div className="relative bg-white text-zinc-900 rounded-2xl shadow-2xl max-w-5xl w-full p-4 sm:p-6 md:p-8 my-2 sm:my-4 print:p-0 print:shadow-none print:max-w-none print:m-0 print:border-none">
        {/* Sticky Top Bar Controls (Hidden in Print) */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-zinc-200 pb-3 pt-1 -mt-1 mb-6 flex items-center justify-between gap-2 shadow-xs print:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition cursor-pointer border border-zinc-300 shadow-xs"
              title="পূর্বের পেজে ফিরে যান (Esc)"
            >
              <ArrowLeft className="w-4 h-4 text-zinc-700" />
              <span>← ফিরে যান / বন্ধ করুন</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 pl-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <h3 className="font-bold text-xs sm:text-sm text-zinc-800">
                মাসিক বেতন ও খরচ বিবরণী শিট ({month} {toBengaliNumber(year)})
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>পিডিএফ ডাউনলোড / প্রিন্ট করুন</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-700 rounded-xl hover:bg-zinc-100 transition cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* --- OFFICIAL A4 LANDSCAPE / PORTRAIT EXPENSE REPORT SHEET --- */}
        <div className="space-y-5 print:space-y-4 font-sans text-xs">
          {/* Official Letterhead Header */}
          <div className="text-center border-b-2 border-emerald-900 pb-4 relative">
            <p className="text-xs font-arabic text-zinc-700 mb-1">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-emerald-950 tracking-tight">
              {institution?.nameBn || "দারুল উলুম হাফিজিয়া কওমিয়া মাদ্রাসা"}
            </h1>
            {institution?.arabicName && (
              <p className="text-sm font-arabic text-emerald-800 font-semibold mt-0.5">
                {institution.arabicName}
              </p>
            )}
            <p className="text-xs text-zinc-600 mt-1">
              {institution?.address || "দীঘি সগুনা , তাড়াশ, সিরাজগঞ্জ"} | মোবাইল: {institution?.phone || "01869171818"}
            </p>
            <p className="text-[11px] text-zinc-500 font-medium">
              মুহতামিম ও পরিচালক: <b className="text-zinc-800">{institution?.muhtamimName || "মাওলানা মোহাম্মদ আবু হুরায়রা"}</b>
            </p>

            {/* Title Badge */}
            <div className="mt-3 flex justify-center">
              <span className="inline-block px-5 py-1 bg-emerald-900 text-white rounded-full text-xs sm:text-sm font-bold shadow-xs tracking-wide">
                কর্মকর্তা ও কর্মচারী মাসিক বেতন এবং খরচ বিবরণী
              </span>
            </div>

            {/* Report Meta row */}
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-dotted border-zinc-300 text-[11px] text-zinc-600 px-1">
              <div>
                <span>বেতনের মাস ও সন: </span>
                <b className="text-emerald-950 font-bold text-xs">{month} {toBengaliNumber(year)} ইং</b>
              </div>
              <div>
                <span>প্রতিবেদন তৈরির তারিখ: </span>
                <b className="text-zinc-800">{todayStr}</b>
              </div>
            </div>
          </div>

          {/* KPI Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
            <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
              <span className="text-[11px] text-zinc-500 block">মোট কর্মকর্তা-কর্মচারী:</span>
              <span className="text-base font-bold text-zinc-900">{toBengaliNumber(salaries.length)} জন</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
              <span className="text-[11px] text-zinc-500 block">সর্বমোট প্রদেয় বেতন:</span>
              <span className="text-base font-bold text-zinc-900">{formatTaka(grandTotal)}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
              <span className="text-[11px] text-zinc-500 block">পরিশোধিত খরচ:</span>
              <span className="text-base font-bold text-emerald-800">{formatTaka(totalPaid)}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
              <span className="text-[11px] text-zinc-500 block">অবশিষ্ট বকেয়া:</span>
              <span className={`text-base font-bold ${totalDue > 0 ? "text-red-700" : "text-zinc-500"}`}>
                {formatTaka(totalDue)}
              </span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-zinc-300 rounded-lg text-[11px] leading-tight">
              <thead>
                <tr className="bg-emerald-950 text-white font-bold text-center">
                  <th className="py-2 px-2 border border-emerald-900 w-8">ক্র.নং</th>
                  <th className="py-2 px-3 border border-emerald-900 text-left">নাম ও পদবী</th>
                  <th className="py-2 px-2 border border-emerald-900 text-left">মোবাইল নং</th>
                  <th className="py-2 px-2 border border-emerald-900 text-right">মূল বেতন</th>
                  <th className="py-2 px-2 border border-emerald-900 text-right">ভাতা সমূহ</th>
                  <th className="py-2 px-2 border border-emerald-900 text-right">বোনাস</th>
                  <th className="py-2 px-2 border border-emerald-900 text-right">কর্তন</th>
                  <th className="py-2 px-2.5 border border-emerald-900 text-right">নিট বেতন</th>
                  <th className="py-2 px-2 border border-emerald-900">পরিশোধ মাধ্যম</th>
                  <th className="py-2 px-2 border border-emerald-900">স্ট্যাটাস</th>
                  <th className="py-2 px-3 border border-emerald-900 w-28">প্রাপকের স্বাক্ষর</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {salaries.map((s, idx) => {
                  const isPaid = s.paymentStatus === "PAID";
                  const allowanceTotal = s.housingAllowance + s.foodAllowance;
                  const roleLabel = ROLE_BN[s.user.role] || s.user.role;

                  return (
                    <tr key={s.id || idx} className="hover:bg-zinc-50/70">
                      <td className="py-2 px-2 text-center font-mono border border-zinc-300">
                        {toBengaliNumber(idx + 1)}
                      </td>
                      <td className="py-2 px-3 border border-zinc-300">
                        <div className="font-bold text-zinc-900">{s.user.name}</div>
                        <div className="text-[10px] text-emerald-800 font-medium">{roleLabel}</div>
                      </td>
                      <td className="py-2 px-2 font-mono text-[10px] text-zinc-600 border border-zinc-300">
                        {s.user.phone ? toBengaliNumber(s.user.phone) : "—"}
                      </td>
                      <td className="py-2 px-2 text-right font-medium border border-zinc-300">
                        {formatTaka(s.basicSalary)}
                      </td>
                      <td className="py-2 px-2 text-right border border-zinc-300">
                        {allowanceTotal > 0 ? `+${formatTaka(allowanceTotal)}` : "—"}
                      </td>
                      <td className="py-2 px-2 text-right border border-zinc-300">
                        {s.bonus > 0 ? (
                          <span className="text-emerald-700">+{formatTaka(s.bonus)}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2 px-2 text-right border border-zinc-300">
                        {s.deduction > 0 ? (
                          <span className="text-rose-700">-{formatTaka(s.deduction)}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2 px-2.5 text-right font-bold text-emerald-950 border border-zinc-300 text-xs">
                        {formatTaka(s.totalAmount)}
                      </td>
                      <td className="py-2 px-2 text-center border border-zinc-300 text-[10px]">
                        {s.paymentMethod === "BANK"
                          ? "ব্যাংক"
                          : s.paymentMethod === "BKASH"
                          ? "বিকাশ"
                          : "ক্যাশ"}
                        {s.paymentDate && (
                          <span className="block text-[9px] text-zinc-500 font-mono">
                            {toBengaliNumber(s.paymentDate)}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-center border border-zinc-300">
                        {isPaid ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300">
                            পরিশোধিত
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300">
                            বকেয়া
                          </span>
                        )}
                      </td>
                      {/* Blank physical signature column */}
                      <td className="py-2 px-3 border border-zinc-300 text-center text-zinc-300">
                        <div className="h-6 border-b border-dotted border-zinc-400 mt-2" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                {/* Grand Total Row */}
                <tr className="bg-emerald-100/80 font-bold border-t-2 border-emerald-900 text-zinc-900">
                  <td colSpan={3} className="py-2.5 px-3 text-right border border-emerald-900 text-xs">
                    সর্বমোট যোগফল (Grand Total):
                  </td>
                  <td className="py-2.5 px-2 text-right border border-emerald-900 font-bold">
                    {formatTaka(totalBasic)}
                  </td>
                  <td className="py-2.5 px-2 text-right border border-emerald-900">
                    +{formatTaka(totalAllowances)}
                  </td>
                  <td className="py-2.5 px-2 text-right border border-emerald-900">
                    +{formatTaka(totalBonus)}
                  </td>
                  <td className="py-2.5 px-2 text-right border border-emerald-900 text-rose-700">
                    -{formatTaka(totalDeductions)}
                  </td>
                  <td className="py-2.5 px-2.5 text-right border border-emerald-900 text-xs text-emerald-950 font-black">
                    {formatTaka(grandTotal)}
                  </td>
                  <td colSpan={3} className="py-2.5 px-2 text-center border border-emerald-900 text-xs">
                    পরিশোধিত: <b>{formatTaka(totalPaid)}</b>
                    {totalDue > 0 && <span className="text-red-700 ml-2">(বকেয়া: {formatTaka(totalDue)})</span>}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* In Words & Notes Box */}
          <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-300 text-xs space-y-1">
            <div>
              <span className="text-zinc-600 font-semibold">সর্বমোট পরিশোধিত খরচের পরিমাণ (কথায়): </span>
              <b className="text-emerald-900">{numberToBengaliWords(totalPaid)}</b>
            </div>
            {totalDue > 0 && (
              <div>
                <span className="text-red-600 font-semibold">বকেয়া পাওনার পরিমাণ (কথায়): </span>
                <b className="text-red-800">{numberToBengaliWords(totalDue)}</b>
              </div>
            )}
            <p className="text-[10px] text-zinc-500 pt-1">
              * নোট: এই বেতন বিবরণী মাদ্রাসার দাপ্তরিক অডিট ও ফান্ড খরচের অফিশিয়াল রেজিস্টার হিসেবে সংরক্ষিত থাকবে।
            </p>
          </div>

          {/* 3 Signatures */}
          <div className="pt-10 grid grid-cols-3 gap-6 text-center text-xs text-zinc-700 print:pt-12">
            <div>
              <div className="w-36 mx-auto border-t border-zinc-600 mb-1" />
              <p className="font-bold text-zinc-900">হিসাবরক্ষকের স্বাক্ষর</p>
              <p className="text-[10px] text-zinc-500">মাদরাসা একাউন্টস শাখা</p>
            </div>
            <div>
              <div className="w-40 mx-auto border-t border-zinc-600 mb-1" />
              <p className="font-bold text-zinc-900">নাজেমে তালিমাত / নিরীক্ষক</p>
              <p className="text-[10px] text-zinc-500">শিক্ষা সচিব ও অভ্যন্তরীণ নিরীক্ষা</p>
            </div>
            <div>
              <div className="w-44 mx-auto border-t-2 border-emerald-900 mb-1" />
              <p className="font-bold text-emerald-950">
                {institution?.muhtamimName || "মাওলানা মোহাম্মদ আবু হুরায়রা"}
              </p>
              <p className="text-[10px] text-zinc-600 font-semibold">প্রধান মুহতামিম ও পরিচালক</p>
            </div>
          </div>
        </div>

        {/* Bottom Navigation & Print Bar (Hidden in Print) */}
        <div className="mt-8 pt-4 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition cursor-pointer border border-zinc-300 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 text-zinc-700" />
            <span>← বন্ধ করুন ও ফিরে যান</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer ml-auto"
          >
            <Printer className="w-4 h-4" />
            <span>পিডিএফ ডাউনলোড / প্রিন্ট করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
}
