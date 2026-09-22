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

interface PosReceiptProps {
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

export function PosThermalReceipt({ invoice, institution, onClose }: PosReceiptProps) {
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

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs p-2 sm:p-4 md:p-6 print:p-0 print:bg-white print:static print:overflow-visible flex justify-center items-start"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div className="relative bg-white text-zinc-900 rounded-2xl shadow-2xl max-w-sm w-full p-4 sm:p-5 my-2 sm:my-4 print:p-0 print:shadow-none print:w-full print:max-w-none print:m-0">
        {/* Sticky Top Bar Controls */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-zinc-200 pb-3 pt-1 -mt-1 mb-3 flex items-center justify-between gap-2 shadow-xs print:hidden">
          <div className="flex items-center gap-1.5">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition cursor-pointer border border-zinc-300 shadow-xs"
                title="পূর্বের পেজে ফিরে যান (Esc)"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-zinc-700" />
                <span>← ফিরে যান</span>
              </button>
            )}
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <h3 className="font-bold text-xs text-zinc-800">৮০ মিমি থার্মাল রসিদ</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট</span>
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-xl hover:bg-zinc-100 transition cursor-pointer"
                title="বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* --- 80mm Thermal Receipt Content --- */}
        <div
          id="pos-thermal-slip"
          className="mx-auto w-[280px] p-2 bg-white text-zinc-900 font-mono text-[11px] leading-tight border border-dashed border-zinc-300 print:border-none print:w-[72mm] print:mx-0"
        >
          {/* Header */}
          <div className="text-center space-y-0.5 border-b border-dashed border-zinc-400 pb-2 mb-2">
            <p className="text-[12px] font-arabic font-semibold">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
            <h2 className="text-[13px] font-bold tracking-tight">
              {institution?.nameBn || "জামিয়া ইসলামিয়া দারুল উলূম"}
            </h2>
            <p className="text-[9px] text-zinc-600 font-sans">
              {institution?.address || "মিরপুর-১, ঢাকা-১২১৬"}
            </p>
            <p className="text-[9px] text-zinc-600">ফোন: {institution?.phone || "০১৭১২-৩৪৫৬৭৮"}</p>
            <div className="pt-1">
              <span className="inline-block px-2 py-0.5 border border-zinc-800 rounded font-bold text-[10px]">
                মানি রিসিট (ক্যাশ মেমো)
              </span>
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-1 text-[10px] border-b border-dashed border-zinc-300 pb-2 mb-2 font-sans">
            <div className="flex justify-between">
              <span>রসিদ নং: <b>{invoice.invoiceNo}</b></span>
              <span>তারিখ: {toBengaliNumber(invoice.receivedDate)}</span>
            </div>
            <div>
              <span>ছাত্রের নাম: <b>{invoice.student.nameBn}</b></span>
            </div>
            <div className="flex justify-between">
              <span>আইডি: {toBengaliNumber(invoice.student.studentId)}</span>
              <span>শ্রেণি: {invoice.student.classSession?.nameBn || "হিফজ"}</span>
            </div>
            <div className="flex justify-between">
              <span>পিতা: {invoice.student.fatherName}</span>
              <span>মাস: <b>{invoice.month} {toBengaliNumber(invoice.year)}</b></span>
            </div>
          </div>

          {/* Fee Itemized List */}
          <table className="w-full text-[10px] border-b border-dashed border-zinc-400 pb-2 mb-2 font-sans">
            <thead>
              <tr className="border-b border-zinc-300 text-left font-semibold">
                <th className="pb-1">বিবরণ</th>
                <th className="pb-1 text-right">টাকা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dotted divide-zinc-200">
              {invoice.tuitionFee > 0 && (
                <tr>
                  <td className="py-0.5">মাসিক বেতন</td>
                  <td className="py-0.5 text-right">{formatTaka(invoice.tuitionFee)}</td>
                </tr>
              )}
              {invoice.boardingFee > 0 && (
                <tr>
                  <td className="py-0.5">বোর্ডিং/খাবার ফি</td>
                  <td className="py-0.5 text-right">{formatTaka(invoice.boardingFee)}</td>
                </tr>
              )}
              {invoice.admissionFee > 0 && (
                <tr>
                  <td className="py-0.5">ভর্তি ফি</td>
                  <td className="py-0.5 text-right">{formatTaka(invoice.admissionFee)}</td>
                </tr>
              )}
              {invoice.examFee > 0 && (
                <tr>
                  <td className="py-0.5">পরীক্ষা ফি</td>
                  <td className="py-0.5 text-right">{formatTaka(invoice.examFee)}</td>
                </tr>
              )}
              {invoice.otherFee > 0 && (
                <tr>
                  <td className="py-0.5">অন্যান্য ফি</td>
                  <td className="py-0.5 text-right">{formatTaka(invoice.otherFee)}</td>
                </tr>
              )}
              {invoice.discount > 0 && (
                <tr className="text-zinc-600">
                  <td className="py-0.5">মওকুফ/ছাড়</td>
                  <td className="py-0.5 text-right">-{formatTaka(invoice.discount)}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Summary / Total */}
          <div className="space-y-1 text-[11px] font-sans border-b border-dashed border-zinc-400 pb-2 mb-2">
            <div className="flex justify-between font-bold">
              <span>মোট প্রদেয়:</span>
              <span>{formatTaka(invoice.totalAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-emerald-800">
              <span>পরিশোধিত টাকা:</span>
              <span>{formatTaka(invoice.paidAmount)}</span>
            </div>
            {invoice.dueAmount > 0 && (
              <div className="flex justify-between font-bold text-red-600">
                <span>অবশিষ্ট বকেয়া:</span>
                <span>{formatTaka(invoice.dueAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-[9px] text-zinc-600 pt-0.5">
              <span>পরিশোধ মাধ্যম:</span>
              <span>{invoice.paymentMethod === "BKASH" ? "বিকাশ" : invoice.paymentMethod === "NAGAD" ? "নগদ" : "ক্যাশ"}</span>
            </div>
          </div>

          {/* Signatures & Footer */}
          <div className="pt-4 font-sans text-[9px]">
            <div className="flex justify-between items-end pb-2">
              <div className="text-center">
                <div className="w-16 border-t border-zinc-400 mb-0.5" />
                <span>অভিভাবক</span>
              </div>
              <div className="text-center">
                <div className="w-20 border-t border-zinc-400 mb-0.5" />
                <span>আদায়কারী ({invoice.collectedBy || "হিসাবরক্ষক"})</span>
              </div>
            </div>

            <p className="text-center text-[8px] text-zinc-500 pt-2 border-t border-dotted border-zinc-300 leading-tight">
              {institution?.receiptFooter || "জাযাকুমুল্লাহু খাইরান। আপনার দান ও অর্থ কবুল হোক।"}
            </p>
          </div>
        </div>

        {/* Bottom Navigation Bar */}
        <div className="mt-4 pt-3 border-t border-zinc-200 flex items-center justify-between gap-2 print:hidden">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition cursor-pointer border border-zinc-300 shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-zinc-700" />
              <span>← ফিরে যান</span>
            </button>
          )}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer ml-auto"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>প্রিন্ট করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
}
