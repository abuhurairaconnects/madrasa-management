"use client";

import React, { useEffect } from "react";
import { formatTaka, toBengaliNumber, numberToBengaliWords, formatBengaliDate } from "@/lib/formatters";
import { Printer, X, ArrowLeft } from "lucide-react";

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
  HOSTEL_SUPER: "হোস্টেল সুপার / বোর্ডিং",
  COOK: "বাবুর্চি / সহকারী",
  GUARD: "নিরাপত্তা প্রহরী / দারোয়ান",
  KHADEM: "খাদেম / স্টাফ",
  STAFF: "সাধারণ কর্মচারী",
  OTHER: "অন্যান্য কর্মচারী",
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
      <div
        className="relative bg-white text-zinc-950 rounded-2xl shadow-2xl max-w-5xl w-full p-4 sm:p-6 md:p-8 my-2 sm:my-4 print:p-0 print:shadow-none print:max-w-none print:m-0 print:border-none printable-sheet"
        style={{ color: "#09090b", backgroundColor: "#ffffff" }}
      >
        {/* Sticky Top Bar Controls (Hidden in Print) */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-zinc-300 pb-3 pt-1 -mt-1 mb-6 flex items-center justify-between gap-2 shadow-xs print:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-900 rounded-xl text-xs font-black transition cursor-pointer border border-zinc-400 shadow-xs"
              style={{ color: "#09090b" }}
              title="পূর্বের পেজে ফিরে যান (Esc)"
            >
              <ArrowLeft className="w-4 h-4 text-zinc-900" />
              <span>← ফিরে যান / বন্ধ করুন</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 pl-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-700" />
              <h3 className="font-black text-xs sm:text-sm text-zinc-900" style={{ color: "#09090b" }}>
                মাসিক বেতন ও খরচ বিবরণী শিট ({month} {toBengaliNumber(year)})
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer"
              style={{ color: "#ffffff", backgroundColor: "#065f46" }}
            >
              <Printer className="w-4 h-4" />
              <span>পিডিএফ ডাউনলোড / প্রিন্ট করুন</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-zinc-600 hover:text-black rounded-xl hover:bg-zinc-200 transition cursor-pointer"
              style={{ color: "#334155" }}
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
            <p className="text-xs font-arabic font-semibold text-zinc-800 mb-1" style={{ color: "#1e293b" }}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight" style={{ color: "#022c22" }}>
              {institution?.nameBn || "দারুল উলুম হাফিজিয়া কওমিয়া মাদ্রাসা"}
            </h1>
            {institution?.arabicName && (
              <p className="text-sm font-arabic text-emerald-900 font-bold mt-0.5" style={{ color: "#064e3b" }}>
                {institution.arabicName}
              </p>
            )}
            <p className="text-xs text-zinc-800 font-semibold mt-1" style={{ color: "#1e293b" }}>
              {institution?.address || "দীঘি সগুনা , তাড়াশ, সিরাজগঞ্জ"} | মোবাইল: {institution?.phone || "01869171818"}
            </p>
            <p className="text-xs text-zinc-800 font-semibold" style={{ color: "#1e293b" }}>
              মুহতামিম ও পরিচালক: <b className="text-zinc-950 font-black" style={{ color: "#000000" }}>{institution?.muhtamimName || "মাওলানা মোহাম্মদ আবু হুরায়রা"}</b>
            </p>

            {/* Title Badge */}
            <div className="mt-3 flex justify-center">
              <span
                className="inline-block px-5 py-1.5 bg-emerald-950 text-white rounded-full text-xs sm:text-sm font-bold shadow-xs tracking-wide"
                style={{ color: "#ffffff", backgroundColor: "#022c22" }}
              >
                কর্মকর্তা ও কর্মচারী মাসিক বেতন এবং খরচ বিবরণী
              </span>
            </div>

            {/* Report Meta row */}
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-dotted border-zinc-400 text-xs text-zinc-800 px-1 font-semibold" style={{ color: "#1e293b" }}>
              <div>
                <span>বেতনের মাস ও সন: </span>
                <b className="text-emerald-950 font-black text-xs" style={{ color: "#022c22" }}>{month} {toBengaliNumber(year)} ইং</b>
              </div>
              <div>
                <span>প্রতিবেদন তৈরির তারিখ: </span>
                <b className="text-zinc-950 font-black" style={{ color: "#000000" }}>{todayStr}</b>
              </div>
            </div>
          </div>

          {/* KPI Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-emerald-50/90 p-3.5 rounded-xl border border-emerald-300" style={{ backgroundColor: "#ecfdf5" }}>
            <div className="bg-white p-2.5 rounded-lg border border-emerald-200 shadow-xs" style={{ backgroundColor: "#ffffff" }}>
              <span className="text-[11px] font-bold text-zinc-700 block" style={{ color: "#334155" }}>মোট কর্মকর্তা-কর্মচারী:</span>
              <span className="text-base font-black text-zinc-950" style={{ color: "#000000" }}>{toBengaliNumber(salaries.length)} জন</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-emerald-200 shadow-xs" style={{ backgroundColor: "#ffffff" }}>
              <span className="text-[11px] font-bold text-zinc-700 block" style={{ color: "#334155" }}>সর্বমোট প্রদেয় বেতন:</span>
              <span className="text-base font-black text-zinc-950" style={{ color: "#000000" }}>{formatTaka(grandTotal)}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-emerald-200 shadow-xs" style={{ backgroundColor: "#ffffff" }}>
              <span className="text-[11px] font-bold text-zinc-700 block" style={{ color: "#334155" }}>পরিশোধিত খরচ:</span>
              <span className="text-base font-black text-emerald-900" style={{ color: "#064e3b" }}>{formatTaka(totalPaid)}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-emerald-200 shadow-xs" style={{ backgroundColor: "#ffffff" }}>
              <span className="text-[11px] font-bold text-zinc-700 block" style={{ color: "#334155" }}>অবশিষ্ট বকেয়া:</span>
              <span className="text-base font-black" style={{ color: totalDue > 0 ? "#b91c1c" : "#334155" }}>
                {formatTaka(totalDue)}
              </span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-zinc-400 rounded-lg text-xs leading-normal" style={{ color: "#000000" }}>
              <thead>
                <tr className="bg-emerald-950 text-white font-black text-center" style={{ backgroundColor: "#022c22", color: "#ffffff" }}>
                  <th className="py-2.5 px-2 border border-emerald-900 w-8" style={{ color: "#ffffff" }}>ক্র.নং</th>
                  <th className="py-2.5 px-3 border border-emerald-900 text-left" style={{ color: "#ffffff" }}>নাম ও পদবী</th>
                  <th className="py-2.5 px-2 border border-emerald-900 text-left" style={{ color: "#ffffff" }}>মোবাইল নং</th>
                  <th className="py-2.5 px-2 border border-emerald-900 text-right" style={{ color: "#ffffff" }}>মূল বেতন</th>
                  <th className="py-2.5 px-2 border border-emerald-900 text-right" style={{ color: "#ffffff" }}>ভাতা সমূহ</th>
                  <th className="py-2.5 px-2 border border-emerald-900 text-right" style={{ color: "#ffffff" }}>বোনাস</th>
                  <th className="py-2.5 px-2 border border-emerald-900 text-right" style={{ color: "#ffffff" }}>কর্তন</th>
                  <th className="py-2.5 px-2.5 border border-emerald-900 text-right" style={{ color: "#ffffff" }}>নিট বেতন</th>
                  <th className="py-2.5 px-2 border border-emerald-900" style={{ color: "#ffffff" }}>পরিশোধ মাধ্যম</th>
                  <th className="py-2.5 px-2 border border-emerald-900" style={{ color: "#ffffff" }}>স্ট্যাটাস</th>
                  <th className="py-2.5 px-3 border border-emerald-900 w-28" style={{ color: "#ffffff" }}>প্রাপকের স্বাক্ষর</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-300">
                {salaries.map((s, idx) => {
                  const isPaid = s.paymentStatus === "PAID";
                  const allowanceTotal = s.housingAllowance + s.foodAllowance;
                  const roleLabel = (s.user?.role && ROLE_BN[s.user.role]) || s.user?.role || "কর্মকর্তা/কর্মচারী";

                  return (
                    <tr key={s.id || idx} className="hover:bg-zinc-100/80 bg-white" style={{ backgroundColor: "#ffffff" }}>
                      <td className="py-2.5 px-2 text-center font-mono font-bold text-zinc-950 border border-zinc-300" style={{ color: "#000000" }}>
                        {toBengaliNumber(idx + 1)}
                      </td>
                      <td className="py-2.5 px-3 border border-zinc-300">
                        <div className="font-extrabold text-xs text-zinc-950" style={{ color: "#000000" }}>
                          {s.user?.name || "নাম পাওয়া যায়নি"}
                        </div>
                        <div className="text-[10px] text-emerald-900 font-bold mt-0.5" style={{ color: "#064e3b" }}>
                          {roleLabel}
                        </div>
                      </td>
                      <td className="py-2.5 px-2 font-mono text-[11px] font-bold text-zinc-800 border border-zinc-300" style={{ color: "#1e293b" }}>
                        {s.user?.phone ? toBengaliNumber(s.user.phone) : "—"}
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-zinc-950 border border-zinc-300" style={{ color: "#000000" }}>
                        {formatTaka(s.basicSalary)}
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-zinc-800 border border-zinc-300" style={{ color: "#1e293b" }}>
                        {allowanceTotal > 0 ? `+${formatTaka(allowanceTotal)}` : "—"}
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold border border-zinc-300" style={{ color: s.bonus > 0 ? "#047857" : "#64748b" }}>
                        {s.bonus > 0 ? (
                          <span className="text-emerald-800 font-bold" style={{ color: "#065f46" }}>+{formatTaka(s.bonus)}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold border border-zinc-300" style={{ color: s.deduction > 0 ? "#b91c1c" : "#64748b" }}>
                        {s.deduction > 0 ? (
                          <span className="text-rose-700 font-bold" style={{ color: "#b91c1c" }}>-{formatTaka(s.deduction)}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2.5 px-2.5 text-right font-black text-xs text-emerald-950 border border-zinc-300" style={{ color: "#022c22" }}>
                        {formatTaka(s.totalAmount)}
                      </td>
                      <td className="py-2.5 px-2 text-center border border-zinc-300 text-xs font-bold text-zinc-900" style={{ color: "#09090b" }}>
                        <div>{s.paymentMethod === "BANK" ? "ব্যাংক" : s.paymentMethod === "BKASH" ? "বিকাশ" : "ক্যাশ"}</div>
                        {s.paymentDate && (
                          <span className="block text-[9px] text-zinc-700 font-mono font-semibold" style={{ color: "#334155" }}>
                            {toBengaliNumber(s.paymentDate)}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center border border-zinc-300">
                        {isPaid ? (
                          <span
                            className="inline-block px-2.5 py-0.5 rounded text-[10px] font-black text-emerald-900 bg-emerald-100 border border-emerald-400"
                            style={{ color: "#064e3b", backgroundColor: "#d1fae5" }}
                          >
                            পরিশোধিত
                          </span>
                        ) : (
                          <span
                            className="inline-block px-2.5 py-0.5 rounded text-[10px] font-black text-amber-900 bg-amber-100 border border-amber-400"
                            style={{ color: "#78350f", backgroundColor: "#fef3c7" }}
                          >
                            বকেয়া
                          </span>
                        )}
                      </td>
                      {/* Blank physical signature column */}
                      <td className="py-2.5 px-3 border border-zinc-300 text-center">
                        <div className="h-6 border-b border-dotted border-zinc-500 mt-2" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                {/* Grand Total Row */}
                <tr className="bg-emerald-100 font-black border-t-2 border-emerald-950 text-zinc-950" style={{ backgroundColor: "#d1fae5", color: "#000000" }}>
                  <td colSpan={3} className="py-2.5 px-3 text-right border border-emerald-900 text-xs font-black" style={{ color: "#000000" }}>
                    সর্বমোট যোগফল (Grand Total):
                  </td>
                  <td className="py-2.5 px-2 text-right border border-emerald-900 font-black" style={{ color: "#000000" }}>
                    {formatTaka(totalBasic)}
                  </td>
                  <td className="py-2.5 px-2 text-right border border-emerald-900 font-black" style={{ color: "#000000" }}>
                    +{formatTaka(totalAllowances)}
                  </td>
                  <td className="py-2.5 px-2 text-right border border-emerald-900 font-black" style={{ color: "#000000" }}>
                    +{formatTaka(totalBonus)}
                  </td>
                  <td className="py-2.5 px-2 text-right border border-emerald-900 font-black" style={{ color: "#b91c1c" }}>
                    -{formatTaka(totalDeductions)}
                  </td>
                  <td className="py-2.5 px-2.5 text-right border border-emerald-900 text-xs font-black" style={{ color: "#022c22" }}>
                    {formatTaka(grandTotal)}
                  </td>
                  <td colSpan={3} className="py-2.5 px-2 text-center border border-emerald-900 text-xs font-black" style={{ color: "#000000" }}>
                    পরিশোধিত: <b style={{ color: "#064e3b" }}>{formatTaka(totalPaid)}</b>
                    {totalDue > 0 && <span className="text-red-700 ml-2" style={{ color: "#b91c1c" }}>(বকেয়া: {formatTaka(totalDue)})</span>}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* In Words & Notes Box */}
          <div className="p-3.5 rounded-lg bg-zinc-100 border border-zinc-300 text-xs space-y-1.5" style={{ color: "#09090b", backgroundColor: "#f8fafc" }}>
            <div>
              <span className="text-zinc-800 font-bold" style={{ color: "#1e293b" }}>সর্বমোট পরিশোধিত খরচের পরিমাণ (কথায়): </span>
              <b className="text-emerald-950 font-black" style={{ color: "#022c22" }}>{numberToBengaliWords(totalPaid)}</b>
            </div>
            {totalDue > 0 && (
              <div>
                <span className="text-red-700 font-bold" style={{ color: "#b91c1c" }}>বকেয়া পাওনার পরিমাণ (কথায়): </span>
                <b className="text-red-900 font-black" style={{ color: "#7f1d1d" }}>{numberToBengaliWords(totalDue)}</b>
              </div>
            )}
            <p className="text-[11px] text-zinc-700 font-medium pt-1" style={{ color: "#334155" }}>
              * নোট: এই বেতন বিবরণী মাদ্রাসার দাপ্তরিক অডিট ও ফান্ড খরচের অফিশিয়াল রেজিস্টার হিসেবে সংরক্ষিত থাকবে।
            </p>
          </div>

          {/* 3 Signatures */}
          <div className="pt-10 grid grid-cols-3 gap-6 text-center text-xs text-zinc-900 print:pt-12" style={{ color: "#000000" }}>
            <div>
              <div className="w-36 mx-auto border-t-2 border-zinc-800 mb-1" />
              <p className="font-extrabold text-zinc-950" style={{ color: "#000000" }}>হিসাবরক্ষকের স্বাক্ষর</p>
              <p className="text-[11px] text-zinc-700 font-semibold" style={{ color: "#334155" }}>মাদরাসা একাউন্টস শাখা</p>
            </div>
            <div>
              <div className="w-40 mx-auto border-t-2 border-zinc-800 mb-1" />
              <p className="font-extrabold text-zinc-950" style={{ color: "#000000" }}>নাজেমে তালিমাত / নিরীক্ষক</p>
              <p className="text-[11px] text-zinc-700 font-semibold" style={{ color: "#334155" }}>শিক্ষা সচিব ও অভ্যন্তরীণ নিরীক্ষা</p>
            </div>
            <div>
              <div className="w-44 mx-auto border-t-2 border-emerald-950 mb-1" />
              <p className="font-black text-emerald-950 text-sm" style={{ color: "#022c22" }}>
                {institution?.muhtamimName || "মাওলানা মোহাম্মদ আবু হুরায়রা"}
              </p>
              <p className="text-[11px] text-zinc-800 font-bold" style={{ color: "#1e293b" }}>প্রধান মুহতামিম ও পরিচালক</p>
            </div>
          </div>
        </div>

        {/* Bottom Navigation & Print Bar (Hidden in Print) */}
        <div className="mt-8 pt-4 border-t border-zinc-300 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-900 rounded-xl text-xs font-black transition cursor-pointer border border-zinc-400 shadow-xs"
            style={{ color: "#09090b" }}
          >
            <ArrowLeft className="w-4 h-4 text-zinc-900" />
            <span>← বন্ধ করুন ও ফিরে যান</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer ml-auto"
            style={{ color: "#ffffff", backgroundColor: "#065f46" }}
          >
            <Printer className="w-4 h-4" />
            <span>পিডিএফ ডাউনলোড / প্রিন্ট করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
}
