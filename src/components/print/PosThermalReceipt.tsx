"use client";

import React from "react";
import { formatTaka, toBengaliNumber } from "@/lib/formatters";
import { Printer, X } from "lucide-react";

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
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white text-zinc-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 print:p-0 print:shadow-none print:w-full print:max-w-none">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 mb-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="font-bold text-sm text-zinc-800">৮০ মিমি থার্মাল রসিদ প্রিভিউ</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              প্রিন্ট করুন
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition cursor-pointer"
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
      </div>
    </div>
  );
}
