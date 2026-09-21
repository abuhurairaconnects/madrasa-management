"use client";

import React, { useEffect, useState } from "react";
import {
  Library,
  BookOpen,
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { toBengaliNumber } from "@/lib/formatters";

const CATEGORY_BN: Record<string, string> = {
  HADITH: "হাদীস শরীফ",
  FIQH: "ফিকহ ও ফতোয়া",
  TAFSEER: "তাফসীর ও কুরআন",
  ADAB: "আরবি সাহিত্য ও ব্যাকরণ",
  GENERAL: "সাধারণ ইসলামিক বই",
};

export default function LibraryPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"BOOKS" | "ISSUES">("BOOKS");
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);

  // Forms
  const [bookForm, setBookForm] = useState({
    titleBn: "",
    titleEn: "",
    author: "",
    category: "HADITH",
    shelfNumber: "র‌্যাক-A, সেলফ-১",
    totalCopies: 5,
  });

  const [issueForm, setIssueForm] = useState({
    bookId: "",
    studentId: "",
    issuedToName: "",
    phone: "",
    dueDate: "2026-10-10",
  });

  const loadData = () => {
    setLoading(true);
    fetch("/api/library")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setData(res);
          if (res.books?.length > 0 && !issueForm.bookId) {
            setIssueForm((prev) => ({ ...prev, bookId: res.books[0].id }));
          }
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/library", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ADD_BOOK", ...bookForm }),
    });
    if (res.ok) {
      setShowAddBookModal(false);
      loadData();
    }
  };

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/library", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ISSUE_BOOK", ...issueForm }),
    });
    if (res.ok) {
      setShowIssueModal(false);
      loadData();
    }
  };

  const handleReturnBook = async (issueId: string) => {
    if (!confirm("আপনি কি নিশ্চিত কিতাবটি ফেরত গ্রহণ করতে চান?")) return;
    const res = await fetch("/api/library", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "RETURN_BOOK", issueId, fineAmount: 0 }),
    });
    if (res.ok) {
      loadData();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-sm font-medium mb-1">
            <Library className="w-5 h-5 text-amber-400" />
            <span>মডিউল ৭: কিতাবখানা ও লাইব্রেরি</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">কিতাব ক্যাটালগ ও বই ইস্যু-ফেরত</h1>
          <p className="text-emerald-200/80 text-sm mt-1">
            দরসি কিতাব, তাফসীর, হাদীস ও ফতোয়ার কিতাব বিতরণ এবং স্টক সংরক্ষণ
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddBookModal(true)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-emerald-950 font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            নতুন কিতাব এন্ট্রি
          </button>
          <button
            onClick={() => setShowIssueModal(true)}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg transition-all text-sm"
          >
            <ArrowUpRight className="w-4 h-4" />
            কিতাব ইস্যু করুন
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="text-xs text-zinc-500 font-semibold uppercase">মোট কিতাবের শিরোনাম</div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
            {toBengaliNumber(data?.stats?.totalTitles || 0)}টি
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="text-xs text-zinc-500 font-semibold uppercase">মোট মজুদ কপি</div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
            {toBengaliNumber(data?.stats?.totalCopies || 0)}টি
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="text-xs text-zinc-500 font-semibold uppercase">বর্তমানে ইস্যুকৃত কিতাব</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {toBengaliNumber(data?.stats?.issuedCopies || 0)}টি
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <button
          onClick={() => setActiveTab("BOOKS")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            activeTab === "BOOKS"
              ? "bg-emerald-800 text-white shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          কিতাব ক্যাটালগ
        </button>
        <button
          onClick={() => setActiveTab("ISSUES")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            activeTab === "ISSUES"
              ? "bg-emerald-800 text-white shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          কিতাব ইস্যু ও ফেরত রেকর্ড
        </button>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="text-center py-20 text-zinc-400">লাইব্রেরি ডাটা লোড হচ্ছে...</div>
      ) : activeTab === "BOOKS" ? (
        /* Books List */
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800 text-xs">
                  <th className="p-4">কিতাবের নাম</th>
                  <th className="p-4">মুসান্নিফ / লেখক</th>
                  <th className="p-4">ক্যাটাগরি</th>
                  <th className="p-4">আলমারি / সেলফ</th>
                  <th className="p-4 text-center">মোট কপি</th>
                  <th className="p-4 text-center">মজুদ কপি</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {data?.books?.map((b: any) => (
                  <tr key={b.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                    <td className="p-4">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">{b.titleBn}</div>
                      {b.titleEn && <div className="text-xs text-zinc-500 font-mono">{b.titleEn}</div>}
                    </td>
                    <td className="p-4 text-zinc-700 dark:text-zinc-300 font-medium">{b.author}</td>
                    <td className="p-4 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      {CATEGORY_BN[b.category] || b.category}
                    </td>
                    <td className="p-4 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                      {b.shelfNumber || "—"}
                    </td>
                    <td className="p-4 text-center font-bold">{toBengaliNumber(b.totalCopies)}</td>
                    <td className="p-4 text-center">
                      <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 font-bold px-2 py-0.5 rounded-md text-xs">
                        {toBengaliNumber(b.availableCopies)}টি
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Issues List */
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800 text-xs">
                  <th className="p-4">কিতাবের নাম</th>
                  <th className="p-4">গ্রহীতার নাম</th>
                  <th className="p-4">ইস্যুর তারিখ</th>
                  <th className="p-4">জমার শেষ তারিখ</th>
                  <th className="p-4 text-center">স্ট্যাটাস</th>
                  <th className="p-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {data?.issues?.map((i: any) => {
                  const isIssued = i.status === "ISSUED";
                  return (
                    <tr key={i.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                      <td className="p-4 font-bold text-zinc-900 dark:text-zinc-100">{i.book?.titleBn}</td>
                      <td className="p-4">
                        <div className="font-semibold text-zinc-800 dark:text-zinc-200">{i.issuedToName}</div>
                        <div className="text-xs text-zinc-500 font-mono">{i.phone || "—"}</div>
                      </td>
                      <td className="p-4 text-xs font-mono text-zinc-600 dark:text-zinc-400">{i.issueDate}</td>
                      <td className="p-4 text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
                        {i.dueDate}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            isIssued
                              ? "bg-amber-50 text-amber-700 border border-amber-300"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-300"
                          }`}
                        >
                          {isIssued ? "ইস্যুকৃত" : "ফেরত সম্পন্ন"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {isIssued && (
                          <button
                            onClick={() => handleReturnBook(i.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 ml-auto shadow-xs"
                          >
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                            ফেরত নিন
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add Book */}
      {showAddBookModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="bg-emerald-900 text-white p-4 font-bold text-lg flex items-center justify-between">
              <span>নতুন কিতাব ক্যাটালগ এন্ট্রি</span>
              <button onClick={() => setShowAddBookModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddBook} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block font-semibold mb-1">কিতাবের নাম (বাংলা)*</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: সহীহ বুখারী ১ম খণ্ড, হেদায়া"
                  value={bookForm.titleBn}
                  onChange={(e) => setBookForm({ ...bookForm, titleBn: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">লেখক / মুসান্নিফ*</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: ইমাম বুখারী (রহ.)"
                    value={bookForm.author}
                    onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">বিষয় / ক্যাটাগরি</label>
                  <select
                    value={bookForm.category}
                    onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                  >
                    {Object.entries(CATEGORY_BN).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">সেলফ / আলমারি নম্বর</label>
                  <input
                    type="text"
                    placeholder="যেমন: র‌্যাক-৩, সেলফ-২"
                    value={bookForm.shelfNumber}
                    onChange={(e) => setBookForm({ ...bookForm, shelfNumber: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">মোট কপির সংখ্যা</label>
                  <input
                    type="number"
                    min="1"
                    value={bookForm.totalCopies}
                    onChange={(e) => setBookForm({ ...bookForm, totalCopies: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-bold"
                  />
                </div>
              </div>
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddBookModal(false)}
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

      {/* Modal: Issue Book */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="bg-emerald-900 text-white p-4 font-bold text-lg flex items-center justify-between">
              <span>কিতাব ইস্যু ফর্ম</span>
              <button onClick={() => setShowIssueModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleIssueBook} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block font-semibold mb-1">কিতাব নির্বাচন করুন*</label>
                <select
                  required
                  value={issueForm.bookId}
                  onChange={(e) => setIssueForm({ ...issueForm, bookId: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                >
                  {data?.books?.map((b: any) => (
                    <option key={b.id} value={b.id} disabled={b.availableCopies <= 0}>
                      {b.titleBn} (মজুদ: {toBengaliNumber(b.availableCopies)} কপি)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">শিক্ষার্থী নির্বাচন (ঐচ্ছিক)</label>
                <select
                  value={issueForm.studentId}
                  onChange={(e) => {
                    const stId = e.target.value;
                    const st = data?.students?.find((s: any) => s.id === stId);
                    setIssueForm({
                      ...issueForm,
                      studentId: stId,
                      issuedToName: st?.nameBn || issueForm.issuedToName,
                      phone: st?.guardianPhone || issueForm.phone,
                    });
                  }}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                >
                  <option value="">তালিকাবদ্ধ শিক্ষার্থী হলে নির্বাচন করুন</option>
                  {data?.students?.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.nameBn} ({s.studentId})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">গ্রহীতার নাম*</label>
                  <input
                    type="text"
                    required
                    value={issueForm.issuedToName}
                    onChange={(e) => setIssueForm({ ...issueForm, issuedToName: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">মোবাইল নম্বর</label>
                  <input
                    type="text"
                    value={issueForm.phone}
                    onChange={(e) => setIssueForm({ ...issueForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">ফেরত দেওয়ার শেষ তারিখ*</label>
                <input
                  type="date"
                  required
                  value={issueForm.dueDate}
                  onChange={(e) => setIssueForm({ ...issueForm, dueDate: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                />
              </div>
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 text-zinc-500 hover:text-zinc-800 font-medium"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-md"
                >
                  ইস্যু নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
