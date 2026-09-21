"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Receipt,
  PlusCircle,
  Search,
  Filter,
  Printer,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  UserCheck,
  Edit3,
  User,
} from "lucide-react";
import {
  toBengaliNumber,
  formatTaka,
  formatBengaliDate,
} from "@/lib/formatters";
import { PosThermalReceipt } from "@/components/print/PosThermalReceipt";
import { A4OfficialReceipt } from "@/components/print/A4OfficialReceipt";

export default function FeesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [institution, setInstitution] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [showCollectModal, setShowCollectModal] = useState(false);

  // Search & Type Suggestion State
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [entryMode, setEntryMode] = useState<"SEARCH" | "MANUAL">("SEARCH");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Print state
  const [activeInvoiceForPrint, setActiveInvoiceForPrint] = useState<any | null>(null);
  const [printType, setPrintType] = useState<"THERMAL" | "A4">("THERMAL");

  // Collect Fee Form
  const [formData, setFormData] = useState({
    studentId: "",
    studentName: "",
    studentRoll: "",
    className: "",
    fatherName: "",
    guardianPhone: "",
    month: "সেপ্টেম্বর",
    year: 2026,
    tuitionFee: 2000,
    boardingFee: 3500,
    admissionFee: 0,
    examFee: 0,
    otherFee: 0,
    discount: 0,
    paidAmount: 5500,
    paymentMethod: "CASH",
    collectedBy: "হাফেজ মাওলানা এনামুল হক",
    notes: "",
  });

  const loadData = () => {
    setLoading(true);
    let url = `/api/fees?`;
    if (selectedStatus !== "ALL") url += `status=${selectedStatus}`;

    fetch(url)
      .then((res) => res.json())
      .then((d) => {
        setInvoices(d.invoices || []);
        setInstitution(d.institution);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    // Also fetch students for modal selector
    fetch("/api/students")
      .then((res) => res.json())
      .then((d) => {
        const stdList = d.students || [];
        setStudents(stdList);
        if (stdList.length > 0 && !formData.studentName) {
          const first = stdList[0];
          setFormData((prev) => ({
            ...prev,
            studentId: first.id,
            studentName: first.nameBn,
            studentRoll: first.studentId,
            className: first.classSession?.nameBn || first.department?.nameBn || "হিফজ বিভাগ",
            fatherName: first.fatherName || "",
            guardianPhone: first.guardianPhone || "",
            tuitionFee: first.monthlyTuitionFee ?? 2000,
            boardingFee: first.monthlyBoardingFee ?? 3500,
            paidAmount: (first.monthlyTuitionFee ?? 2000) + (first.monthlyBoardingFee ?? 3500),
          }));
          setSearchQuery(first.nameBn);
        }
      });
  };

  useEffect(() => {
    loadData();
  }, [selectedStatus]);

  // Handle clicking outside the suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectStudent = (std: any) => {
    setFormData((prev) => ({
      ...prev,
      studentId: std.id,
      studentName: std.nameBn,
      studentRoll: std.studentId,
      className: std.classSession?.nameBn || std.department?.nameBn || "",
      fatherName: std.fatherName || "",
      guardianPhone: std.guardianPhone || "",
      tuitionFee: std.monthlyTuitionFee ?? 2000,
      boardingFee: std.monthlyBoardingFee ?? 3500,
      admissionFee: 0,
      examFee: 0,
      otherFee: 0,
      discount: 0,
      paidAmount: (std.monthlyTuitionFee ?? 2000) + (std.monthlyBoardingFee ?? 3500),
    }));
    setSearchQuery(std.nameBn);
    setIsDropdownOpen(false);
  };

  const calculatedTotal =
    Number(formData.tuitionFee || 0) +
    Number(formData.boardingFee || 0) +
    Number(formData.admissionFee || 0) +
    Number(formData.examFee || 0) +
    Number(formData.otherFee || 0) -
    Number(formData.discount || 0);

  const calculatedDue = Math.max(0, calculatedTotal - Number(formData.paidAmount || 0));

  const handleCollectFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentName.trim() && !searchQuery.trim()) {
      alert("অনুগ্রহ করে শিক্ষার্থীর নাম লিখুন।");
      return;
    }

    const payload = {
      ...formData,
      studentName: formData.studentName.trim() || searchQuery.trim(),
    };

    try {
      const res = await fetch("/api/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const createdInvoice = await res.json();
        setShowCollectModal(false);
        loadData();
        // Ask to print immediately
        setActiveInvoiceForPrint(createdInvoice);
        setPrintType("THERMAL");
      } else {
        const errData = await res.json();
        alert(errData.error || "ফি কালেকশন সম্পন্ন করা যায়নি।");
      }
    } catch (err: any) {
      console.error(err);
      alert("সার্ভার ত্রুটি: " + err.message);
    }
  };

  // Filter students based on user search query
  const filteredStudents = students.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.nameBn?.toLowerCase().includes(q) ||
      s.studentId?.toLowerCase().includes(q) ||
      s.fatherName?.toLowerCase().includes(q) ||
      s.classSession?.nameBn?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ফি কালেকশন ও রসিদ প্রিন্টিং
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            টিউশন ফি, বোর্ডিং ফি আদায় এবং ৮০ মিমি থার্মাল ও A4 অফিশিয়াল রসিদ প্রিন্ট
          </p>
        </div>

        <button
          onClick={() => {
            setShowCollectModal(true);
            setIsDropdownOpen(false);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/20 transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          নতুন ফি গ্রহণ ও রশিদ প্রদান
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 pl-2 font-medium">
          <Filter className="w-3.5 h-3.5" /> স্ট্যাটাস:
        </span>
        <button
          onClick={() => setSelectedStatus("ALL")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            selectedStatus === "ALL"
              ? "bg-emerald-700 text-white"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          }`}
        >
          সকল রসিদ
        </button>
        <button
          onClick={() => setSelectedStatus("PAID")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            selectedStatus === "PAID"
              ? "bg-emerald-700 text-white"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          }`}
        >
          পরিশোধিত (Paid)
        </button>
        <button
          onClick={() => setSelectedStatus("PARTIAL")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            selectedStatus === "PARTIAL"
              ? "bg-amber-600 text-white"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          }`}
        >
          বকেয়া আছে (Due / Partial)
        </button>
      </div>

      {/* Invoices List */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-500 text-sm">তথ্য লোড হচ্ছে...</div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-xs">কোনো রসিদ পাওয়া যায়নি।</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-800 font-bold">
                <tr>
                  <th className="py-3 px-4">রশিদ নং</th>
                  <th className="py-3 px-4">তারিখ</th>
                  <th className="py-3 px-4">শিক্ষার্থী ও জামাত</th>
                  <th className="py-3 px-4">মাস ও সন</th>
                  <th className="py-3 px-4">মোট টাকা</th>
                  <th className="py-3 px-4">আদায়কৃত</th>
                  <th className="py-3 px-4">বকেয়া</th>
                  <th className="py-3 px-4">স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-right">রসিদ প্রিন্ট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800 dark:text-emerald-400">
                      {inv.invoiceNo}
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-500 dark:text-zinc-400">
                      {toBengaliNumber(inv.receivedDate)}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-zinc-900 dark:text-zinc-100">
                        {inv.student?.nameBn}
                      </p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                        আইডি: {toBengaliNumber(inv.student?.studentId)} | {inv.student?.classSession?.nameBn}
                      </p>
                    </td>
                    <td className="py-3 px-4 font-medium text-zinc-800 dark:text-zinc-200">
                      {inv.month} {toBengaliNumber(inv.year)}
                    </td>
                    <td className="py-3 px-4 font-bold text-zinc-800 dark:text-zinc-200">
                      {formatTaka(inv.totalAmount)}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700 dark:text-emerald-400">
                      {formatTaka(inv.paidAmount)}
                    </td>
                    <td className="py-3 px-4 font-bold">
                      {inv.dueAmount > 0 ? (
                        <span className="text-red-600 dark:text-red-400">
                          {formatTaka(inv.dueAmount)}
                        </span>
                      ) : (
                        <span className="text-zinc-400 font-normal">০</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {inv.status === "PAID" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> পরিশোধিত
                        </span>
                      ) : inv.status === "PARTIAL" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-800">
                          <AlertCircle className="w-3 h-3" /> আংশিক
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-950/60 px-2 py-0.5 rounded-md border border-red-300 dark:border-red-800">
                          বকেয়া
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setActiveInvoiceForPrint(inv);
                            setPrintType("THERMAL");
                          }}
                          className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition"
                          title="৮০মিমি পিওএস থার্মাল রসিদ প্রিন্ট করুন"
                        >
                          <Printer className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </button>
                        <button
                          onClick={() => {
                            setActiveInvoiceForPrint(inv);
                            setPrintType("A4");
                          }}
                          className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition"
                          title="A4 সাইজ প্রাতিষ্ঠানিক রসিদ প্রিন্ট করুন"
                        >
                          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Collect Fee Modal */}
      {showCollectModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 my-auto max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  নতুন ফি আদায় ও মানি রিসিট গ্রহণ
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  ছাত্রের নাম লিখুন বা তালিকা থেকে নির্বাচন করে সমস্ত তথ্য ম্যানুয়ালি দিন
                </p>
              </div>
              <button
                onClick={() => setShowCollectModal(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCollectFee} className="mt-4 space-y-4 text-xs">
              {/* Student Name & Selection Field */}
              <div ref={dropdownRef} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center gap-1.5">
                    <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    শিক্ষার্থী নির্বাচন বা নাম লিখুন *
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEntryMode("SEARCH")}
                      className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        entryMode === "SEARCH"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                      }`}
                    >
                      সার্চ ও ড্রপডাউন
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEntryMode("MANUAL");
                        setFormData((prev) => ({ ...prev, studentId: "" }));
                      }}
                      className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        entryMode === "MANUAL"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                      }`}
                    >
                      সরাসরি টাইপ
                    </button>
                  </div>
                </div>

                {/* Search / Typeable Input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={formData.studentName || searchQuery}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSearchQuery(val);
                      setFormData((prev) => ({
                        ...prev,
                        studentName: val,
                        studentId: "", // manual or custom
                      }));
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder="শিক্ষার্থীর নাম লিখুন বা আইডি দিয়ে খুঁজুন (যেমন: মোহাম্মদ আব্দুল্লাহ)..."
                    className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition shadow-xs"
                  />
                  {(formData.studentName || searchQuery) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setFormData((prev) => ({
                          ...prev,
                          studentName: "",
                          studentId: "",
                          studentRoll: "",
                          className: "",
                          fatherName: "",
                          guardianPhone: "",
                        }));
                        setIsDropdownOpen(false);
                      }}
                      className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  {/* Dropdown suggestions */}
                  {isDropdownOpen && entryMode === "SEARCH" && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl z-50 max-h-56 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((s) => (
                          <div
                            key={s.id}
                            onClick={() => selectStudent(s)}
                            className="p-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 cursor-pointer transition flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-bold text-zinc-900 dark:text-zinc-100">
                                {s.nameBn}
                              </p>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                                আইডি: {s.studentId} • {s.classSession?.nameBn || s.department?.nameBn}
                              </p>
                            </div>
                            <div className="text-right text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                              বেতন: ৳{toBengaliNumber(s.monthlyTuitionFee || 0)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
                          তালিকাভুক্ত কোনো শিক্ষার্থী পাওয়া যায়নি।
                        </div>
                      )}

                      {/* Manual Entry Acceptance Button */}
                      {(formData.studentName || searchQuery) && (
                        <div
                          onClick={() => {
                            setIsDropdownOpen(false);
                          }}
                          className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 cursor-pointer font-bold text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2"
                        >
                          <Edit3 className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          <span>
                            এই নামে ম্যানুয়ালি গ্রহণ করুন: &quot;
                            {formData.studentName || searchQuery}&quot;
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Editable Student Details Grid (Manual fields) */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-bold border-b border-zinc-200 dark:border-zinc-700/60 pb-1.5">
                  <span className="flex items-center gap-1 text-emerald-800 dark:text-emerald-300">
                    <UserCheck className="w-3.5 h-3.5" /> শিক্ষার্থীর বিস্তারিত তথ্য (ম্যানুয়ালি পরিবর্তনযোগ্য):
                  </span>
                  <span>সব তথ্য সম্পাদনযোগ্য</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 mb-1 font-bold text-[11px]">
                      শিক্ষার্থীর পুরো নাম *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.studentName}
                      onChange={(e) => {
                        setFormData({ ...formData, studentName: e.target.value, studentId: "" });
                        setSearchQuery(e.target.value);
                      }}
                      placeholder="যেমন: মোহাম্মদ আব্দুল্লাহ"
                      className="w-full p-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 mb-1 font-bold text-[11px]">
                      শিক্ষার্থীর রোল বা আইডি
                    </label>
                    <input
                      type="text"
                      value={formData.studentRoll}
                      onChange={(e) => setFormData({ ...formData, studentRoll: e.target.value })}
                      placeholder="যেমন: JAMIA-01-S001 অথবা ১০১"
                      className="w-full p-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono font-bold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 mb-1 font-bold text-[11px]">
                      জামাত / শ্রেণি বা বিভাগ
                    </label>
                    <input
                      type="text"
                      value={formData.className}
                      onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                      placeholder="যেমন: হিফজুল কুরআন বিভাগ / মিজান"
                      className="w-full p-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 mb-1 font-bold text-[11px]">
                      পিতার নাম / অভিভাবক ও ফোন
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        value={formData.fatherName}
                        onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                        placeholder="বাবার নাম"
                        className="w-full p-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-medium text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={formData.guardianPhone}
                        onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                        placeholder="01711223344"
                        className="w-full p-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Month and Year */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-800 dark:text-zinc-200 font-bold mb-1.5">ফি-এর মাস</label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {[
                      "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
                      "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
                    ].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-800 dark:text-zinc-200 font-bold mb-1.5">সন</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Fee Breakdown Breakdown (Manual Editable) */}
              <div className="space-y-1.5">
                <label className="block text-zinc-800 dark:text-zinc-200 font-bold text-xs">
                  ফি এর খাত ও পরিমাণ (ম্যানুয়ালি পরিবর্তনযোগ্য):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80">
                  <div>
                    <label className="block text-zinc-800 dark:text-zinc-200 mb-1 font-bold text-[11px]">মাসিক বেতন</label>
                    <input
                      type="number"
                      value={formData.tuitionFee}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const newTotal = val + Number(formData.boardingFee || 0) + Number(formData.admissionFee || 0) + Number(formData.examFee || 0) + Number(formData.otherFee || 0) - Number(formData.discount || 0);
                        setFormData({ ...formData, tuitionFee: val, paidAmount: Math.max(0, newTotal) });
                      }}
                      className="w-full p-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-800 dark:text-zinc-200 mb-1 font-bold text-[11px]">বোর্ডিং/খাবার ফি</label>
                    <input
                      type="number"
                      value={formData.boardingFee}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const newTotal = Number(formData.tuitionFee || 0) + val + Number(formData.admissionFee || 0) + Number(formData.examFee || 0) + Number(formData.otherFee || 0) - Number(formData.discount || 0);
                        setFormData({ ...formData, boardingFee: val, paidAmount: Math.max(0, newTotal) });
                      }}
                      className="w-full p-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-800 dark:text-zinc-200 mb-1 font-bold text-[11px]">ভর্তি/সেশন ফি</label>
                    <input
                      type="number"
                      value={formData.admissionFee}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const newTotal = Number(formData.tuitionFee || 0) + Number(formData.boardingFee || 0) + val + Number(formData.examFee || 0) + Number(formData.otherFee || 0) - Number(formData.discount || 0);
                        setFormData({ ...formData, admissionFee: val, paidAmount: Math.max(0, newTotal) });
                      }}
                      className="w-full p-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-800 dark:text-zinc-200 mb-1 font-bold text-[11px]">পরীক্ষা ফি</label>
                    <input
                      type="number"
                      value={formData.examFee}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const newTotal = Number(formData.tuitionFee || 0) + Number(formData.boardingFee || 0) + Number(formData.admissionFee || 0) + val + Number(formData.otherFee || 0) - Number(formData.discount || 0);
                        setFormData({ ...formData, examFee: val, paidAmount: Math.max(0, newTotal) });
                      }}
                      className="w-full p-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-800 dark:text-zinc-200 mb-1 font-bold text-[11px]">অন্যান্য ফি</label>
                    <input
                      type="number"
                      value={formData.otherFee}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const newTotal = Number(formData.tuitionFee || 0) + Number(formData.boardingFee || 0) + Number(formData.admissionFee || 0) + Number(formData.examFee || 0) + val - Number(formData.discount || 0);
                        setFormData({ ...formData, otherFee: val, paidAmount: Math.max(0, newTotal) });
                      }}
                      className="w-full p-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-800 dark:text-zinc-200 mb-1 font-bold text-[11px]">ছাড় / মওকুফ (Discount)</label>
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const subTotal = Number(formData.tuitionFee || 0) + Number(formData.boardingFee || 0) + Number(formData.admissionFee || 0) + Number(formData.examFee || 0) + Number(formData.otherFee || 0);
                        setFormData({ ...formData, discount: val, paidAmount: Math.max(0, subTotal - val) });
                      }}
                      className="w-full p-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-800 dark:text-zinc-200 font-bold mb-1.5 text-xs">
                    আজ পরিশোধিত টাকা (টাকা) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.paidAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, paidAmount: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 font-bold font-mono text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-800 dark:text-zinc-200 font-bold mb-1.5 text-xs">
                    পরিশোধের মাধ্যম
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentMethod: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="CASH">ক্যাশ (নগদ)</option>
                    <option value="BKASH">বিকাশ (bKash)</option>
                    <option value="NAGAD">নগদ (Nagad)</option>
                    <option value="BANK">ব্যাংক ট্রান্সফার</option>
                  </select>
                </div>
              </div>

              {/* Collector and Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-800 dark:text-zinc-200 font-bold mb-1 text-xs">
                    ফি আদায়কারী / রিসিভার
                  </label>
                  <input
                    type="text"
                    value={formData.collectedBy}
                    onChange={(e) => setFormData({ ...formData, collectedBy: e.target.value })}
                    placeholder="আদায়কারীর নাম বা পদবি"
                    className="w-full p-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-800 dark:text-zinc-200 font-bold mb-1 text-xs">
                    বিশেষ নোট / মন্তব্য (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="যেমন: সেপ্টেম্বর মাসের অর্ধেক পরিশোধিত"
                    className="w-full p-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Total Summary Bar */}
              <div className="flex flex-wrap justify-between items-center p-3.5 rounded-2xl bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-xs font-bold text-emerald-950 dark:text-emerald-200 gap-2">
                <span>সর্বমোট প্রদেয়: {formatTaka(calculatedTotal)}</span>
                <span>আজ জমা: {formatTaka(formData.paidAmount)}</span>
                <span className={calculatedDue > 0 ? "text-red-700 dark:text-red-400 font-bold" : "text-emerald-800 dark:text-emerald-300 font-bold"}>
                  অবশিষ্ট বকেয়া: {formatTaka(calculatedDue)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCollectModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold shadow-md shadow-emerald-900/20 transition cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  ফি জমা নিন ও রসিদ তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POS Thermal 80mm Print Modal */}
      {activeInvoiceForPrint && printType === "THERMAL" && (
        <PosThermalReceipt
          invoice={activeInvoiceForPrint}
          institution={institution}
          onClose={() => setActiveInvoiceForPrint(null)}
        />
      )}

      {/* A4 Official Receipt Print Modal */}
      {activeInvoiceForPrint && printType === "A4" && (
        <A4OfficialReceipt
          invoice={activeInvoiceForPrint}
          institution={institution}
          onClose={() => setActiveInvoiceForPrint(null)}
        />
      )}
    </div>
  );
}
