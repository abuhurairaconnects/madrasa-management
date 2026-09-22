"use client";

import React, { useEffect } from "react";
import { formatTaka, toBengaliNumber } from "@/lib/formatters";
import { Printer, X, ArrowLeft } from "lucide-react";

interface InvoiceData {
  invoiceNo: string;
  month: string;
  year: number;
  tuitionFee: number;
  boardingFee: number;
  admissionFee: number;
  examFee: number;
  otherFee: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: string;
  collectedBy?: string | null;
  receivedDate: string;
  notes?: string | null;
  student: {
    studentId: string;
    nameBn: string;
    fatherName: string;
    department?: { nameBn: string };
    classSession?: { nameBn: string };
  };
}

interface A4ReceiptProps {
  invoice: InvoiceData;
  institution?: {
    nameBn?: string;
    arabicName?: string | null;
    address?: string;
    phone?: string;
    receiptFooter?: string | null;
  } | null;
  onClose?: () => void;
}

export function A4OfficialReceipt({ invoice, institution, onClose }: A4ReceiptProps) {
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

  const renderReceiptCopy = (copyTitle: string) => (
    <div className="border-2 border-emerald-900 rounded-xl p-5 bg-white relative" style={{ color: "#09090b", backgroundColor: "#ffffff" }}>
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
        <span className="text-7xl font-bold font-arabic">دار العلوم</span>
      </div>

      {/* Copy Type Banner */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-zinc-200">
        <span className="text-[11px] font-semibold text-zinc-500">
          রশিদ নম্বর: <b className="text-emerald-950 font-mono">{invoice.invoiceNo}</b>
        </span>
        <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
          {copyTitle}
        </span>
        <span className="text-[11px] text-zinc-500">
          তারিখ: {toBengaliNumber(invoice.receivedDate)}
        </span>
      </div>

      {/* Institution Header */}
      <div className="text-center space-y-1 mb-4">
        <p className="text-xs font-arabic text-zinc-700">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
        <h2 className="text-xl font-bold text-emerald-950">
          {institution?.nameBn || "দারুল উলুম হাফিজিয়া কওমিয়া মাদ্রাসা"}
        </h2>
        {institution?.arabicName && (
          <p className="text-sm font-arabic text-emerald-800">{institution.arabicName}</p>
        )}
        <p className="text-xs text-zinc-600">
          {institution?.address || "দীঘি সগুনা , তাড়াশ, সিরাজগঞ্জ"} | মোবা: {institution?.phone || "01869171818"}
        </p>
        <div className="pt-1">
          <span className="inline-block px-4 py-0.5 bg-emerald-900 text-white rounded text-xs font-bold tracking-wider">
            ফি ও বেতন আদায়ের মানি রিসিট
          </span>
        </div>
      </div>

      {/* Student Meta Details */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 mb-4">
        <div>
          <span className="text-zinc-600">শিক্ষার্থীর নাম: </span>
          <b className="text-zinc-900">{invoice.student.nameBn}</b>
        </div>
        <div>
          <span className="text-zinc-600">আইডি / রোল: </span>
          <b className="font-mono">{toBengaliNumber(invoice.student.studentId)}</b>
        </div>
        <div>
          <span className="text-zinc-600">পিতার নাম: </span>
          <span className="font-medium">{invoice.student.fatherName}</span>
        </div>
        <div>
          <span className="text-zinc-600">বিভাগ ও জামাত: </span>
          <span className="font-medium">
            {invoice.student.department?.nameBn} ({invoice.student.classSession?.nameBn})
          </span>
        </div>
        <div>
          <span className="text-zinc-600">ফি-এর মাস ও সন: </span>
          <b>{invoice.month}, {toBengaliNumber(invoice.year)}</b>
        </div>
        <div>
          <span className="text-zinc-600">পরিশোধ মাধ্যম: </span>
          <b>{invoice.paymentMethod === "BKASH" ? "বিকাশ" : invoice.paymentMethod === "NAGAD" ? "নগদ" : "ক্যাশ"}</b>
        </div>
      </div>

      {/* Table of Breakdown */}
      <table className="w-full text-xs border border-zinc-300 rounded mb-4">
        <thead>
          <tr className="bg-emerald-900 text-white">
            <th className="py-1.5 px-3 text-left">ক্রমিক</th>
            <th className="py-1.5 px-3 text-left">আদায়ের খাত / বিবরণ</th>
            <th className="py-1.5 px-3 text-right">টাকা (টাকা)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {invoice.tuitionFee > 0 && (
            <tr>
              <td className="py-1.5 px-3">১.</td>
              <td className="py-1.5 px-3">মাসিক সাধারণ বেতন ও তালিমাত</td>
              <td className="py-1.5 px-3 text-right">{formatTaka(invoice.tuitionFee)}</td>
            </tr>
          )}
          {invoice.boardingFee > 0 && (
            <tr>
              <td className="py-1.5 px-3">২.</td>
              <td className="py-1.5 px-3">আবাসিক খানা ও বোর্ডিং খরচ</td>
              <td className="py-1.5 px-3 text-right">{formatTaka(invoice.boardingFee)}</td>
            </tr>
          )}
          {invoice.admissionFee > 0 && (
            <tr>
              <td className="py-1.5 px-3">৩.</td>
              <td className="py-1.5 px-3">নতুন ভর্তি ও সেশন ফি</td>
              <td className="py-1.5 px-3 text-right">{formatTaka(invoice.admissionFee)}</td>
            </tr>
          )}
          {invoice.examFee > 0 && (
            <tr>
              <td className="py-1.5 px-3">৪.</td>
              <td className="py-1.5 px-3">পরীক্ষা ও প্রশ্নপত্র ফি</td>
              <td className="py-1.5 px-3 text-right">{formatTaka(invoice.examFee)}</td>
            </tr>
          )}
          {invoice.otherFee > 0 && (
            <tr>
              <td className="py-1.5 px-3">৫.</td>
              <td className="py-1.5 px-3">অন্যান্য আনুষঙ্গিক ফি</td>
              <td className="py-1.5 px-3 text-right">{formatTaka(invoice.otherFee)}</td>
            </tr>
          )}
          {invoice.discount > 0 && (
            <tr className="text-zinc-600 bg-amber-50/40">
              <td className="py-1 px-3">-</td>
              <td className="py-1 px-3">বিশেষ ছাড় / মওকুফ</td>
              <td className="py-1 px-3 text-right">-{formatTaka(invoice.discount)}</td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="bg-zinc-100 font-bold border-t border-zinc-300">
            <td colSpan={2} className="py-1.5 px-3 text-right">সর্বমোট প্রদেয়:</td>
            <td className="py-1.5 px-3 text-right text-zinc-900">{formatTaka(invoice.totalAmount)}</td>
          </tr>
          <tr className="bg-emerald-50 text-emerald-950 font-bold">
            <td colSpan={2} className="py-1.5 px-3 text-right">আদায়কৃত টাকা:</td>
            <td className="py-1.5 px-3 text-right">{formatTaka(invoice.paidAmount)}</td>
          </tr>
          {invoice.dueAmount > 0 && (
            <tr className="bg-red-50 text-red-700 font-bold">
              <td colSpan={2} className="py-1.5 px-3 text-right">বকেয়া পাওনা:</td>
              <td className="py-1.5 px-3 text-right">{formatTaka(invoice.dueAmount)}</td>
            </tr>
          )}
        </tfoot>
      </table>

      {/* Signatures */}
      <div className="flex justify-between items-end pt-6 text-xs text-zinc-600">
        <div className="text-center">
          <div className="w-28 border-t border-zinc-400 mb-1" />
          <span>অভিভাবকের স্বাক্ষর</span>
        </div>
        <div className="text-center">
          <div className="w-32 border-t border-zinc-400 mb-1" />
          <span>হিসাবরক্ষক / আদায়কারী</span>
        </div>
        <div className="text-center">
          <div className="w-28 border-t border-zinc-400 mb-1" />
          <span>মুহতামিম / প্রিন্সিপাল</span>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs p-2 sm:p-4 md:p-6 print:p-0 print:bg-white print:static print:overflow-visible flex justify-center items-start"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div
        className="relative bg-white text-zinc-950 rounded-2xl shadow-2xl max-w-4xl w-full p-4 sm:p-6 my-2 sm:my-4 print:p-0 print:shadow-none print:max-w-none print:m-0 print:border-none printable-sheet"
        style={{ color: "#09090b", backgroundColor: "#ffffff" }}
      >
        {/* Sticky Top Bar Controls */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-zinc-200 pb-3 pt-1 -mt-1 mb-4 flex items-center justify-between gap-2 shadow-xs print:hidden">
          <div className="flex items-center gap-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition cursor-pointer border border-zinc-300 shadow-xs"
                title="পূর্বের পেজে ফিরে যান (Esc)"
              >
                <ArrowLeft className="w-4 h-4 text-zinc-700" />
                <span>← ফিরে যান / বন্ধ করুন</span>
              </button>
            )}
            <div className="hidden sm:flex items-center gap-2 pl-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <h3 className="font-bold text-xs sm:text-sm text-zinc-800">
                A4 সাইজ ২-কপি মানি রিসিট
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>A4 প্রিন্ট করুন</span>
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-zinc-700 rounded-xl hover:bg-zinc-100 transition cursor-pointer"
                title="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* --- A4 2-Copy Container --- */}
        <div className="space-y-5 print:space-y-4">
          {/* Copy 1: Student Copy */}
          {renderReceiptCopy("শিক্ষার্থী কপি (Student Copy)")}

          {/* Dotted cutting separator */}
          <div className="relative flex items-center justify-center my-3 print:my-4">
            <div className="border-t border-dashed border-zinc-400 w-full" />
            <span className="absolute bg-white px-3 text-[11px] text-zinc-400 font-mono">
              ✂ এখান থেকে কেটে আলাদা করুন
            </span>
          </div>

          {/* Copy 2: Office Copy */}
          {renderReceiptCopy("মাদ্রাসা অফিস কপি (Office Copy)")}
        </div>

        {/* Bottom Navigation & Print Bar */}
        <div className="mt-6 pt-4 border-t border-zinc-200 flex items-center justify-between gap-3 print:hidden">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition cursor-pointer border border-zinc-300 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 text-zinc-700" />
              <span>← ফিরে যান / বন্ধ করুন</span>
            </button>
          )}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer ml-auto"
          >
            <Printer className="w-4 h-4" />
            <span>A4 রসিদ প্রিন্ট করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
}
