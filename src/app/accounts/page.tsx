"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Landmark,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Filter,
  Calendar,
  Wallet,
  Building2,
  HeartHandshake,
  Coffee,
  X,
  ShieldAlert,
  Banknote,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import {
  toBengaliNumber,
  formatTaka,
  formatBengaliDate,
  FUND_INFO_MAP,
} from "@/lib/formatters";

export default function AccountsPage() {
  const [funds, setFunds] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedFund, setSelectedFund] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  // Voucher Form
  const [formData, setFormData] = useState({
    fundId: "",
    type: "INCOME", // INCOME or EXPENSE
    category: "সাধারণ অনুদান",
    amount: "",
    description: "",
    donorName: "",
    donorPhone: "",
    paymentMethod: "CASH",
    date: new Date().toISOString().split("T")[0],
    performedBy: "হিসাবরক্ষক",
  });

  const loadData = () => {
    setLoading(true);
    let url = `/api/accounts?`;
    if (selectedFund !== "ALL") url += `fundId=${selectedFund}&`;
    if (selectedType !== "ALL") url += `type=${selectedType}&`;

    fetch(url)
      .then((res) => res.json())
      .then((d) => {
        setFunds(d.funds || []);
        setTransactions(d.transactions || []);
        setTotalBalance(d.totalBalance || 0);
        if (d.funds && d.funds.length > 0 && !formData.fundId) {
          setFormData((prev) => ({ ...prev, fundId: d.funds[0].id }));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [selectedFund, selectedType]);

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (res.ok) {
        setShowVoucherModal(false);
        setFormData({
          ...formData,
          amount: "",
          description: "",
          donorName: "",
          donorPhone: "",
        });
        loadData();
        alert("ভাউচার সফলভাবে লিপিবদ্ধ করা হয়েছে!");
      } else {
        alert(json.error || "ভাউচার সংরক্ষণে ব্যর্থ হয়েছে।");
      }
    } catch (err) {
      console.error(err);
      alert("সার্ভার ত্রুটি।");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Tab Bar: Accounts (শরীয়াহ তহবিল) vs Payroll (কর্মকর্তা ও কর্মচারী বেতন) */}
      <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800/80 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-700">
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-sm border border-zinc-200/80 dark:border-zinc-700 cursor-pointer"
        >
          <Landmark className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>শরীয়াহ তহবিল ও সাধারণ খতিয়ান</span>
        </button>

        <Link
          href="/payroll"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-white/60 dark:hover:bg-zinc-900/60 transition"
        >
          <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>কর্মকর্তা ও কর্মচারী বেতন</span>
          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
            পে-রোল
          </span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-emerald-600" />
            শরীয়াহ তহবিল ও আয়-ব্যয় খতিয়ান
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            যাকাত/লিল্লাহ, সাধারণ, মেহমানদারি ও ওয়াকফ তহবিলের শরীয়াহ সম্মত আলাদা হিসাব
          </p>
        </div>

        <button
          onClick={() => setShowVoucherModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/20 transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          নতুন আয়/ব্যয় ভাউচার
        </button>
      </div>

      {/* 4 Shariah Funds Balances Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {funds.map((f) => {
          const info = FUND_INFO_MAP[f.code] || {
            name: f.nameBn,
            tag: "তহবিল",
            color: "border-zinc-300 text-zinc-700 bg-zinc-50",
            desc: f.description,
          };

          return (
            <div
              key={f.id}
              onClick={() => setSelectedFund(f.id)}
              className={`p-5 rounded-2xl border transition cursor-pointer shadow-xs ${
                selectedFund === f.id
                  ? "border-emerald-600 ring-2 ring-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20"
                  : "border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  {info.name}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold border border-zinc-200">
                  {info.tag}
                </span>
              </div>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-2 font-mono">
                {formatTaka(f.currentBalance)}
              </p>
              <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2 leading-tight">
                {f.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Total Balance Ribbon */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Wallet className="w-6 h-6 text-amber-300" />
          <div>
            <p className="text-xs text-emerald-200">মাদ্রাসার সর্বমোট তহবিল স্থিতি (সকল ফান্ড)</p>
            <h3 className="text-xl font-black font-mono">{formatTaka(totalBalance)}</h3>
          </div>
        </div>
        <span className="text-xs font-medium bg-emerald-800/80 px-3 py-1 rounded-full border border-emerald-500/30">
          শরিয়াহ নিরীক্ষিত হিসাব
        </span>
      </div>

      {/* Quick Access Card: Employee Salary & Payroll inside Accounts */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 text-white rounded-2xl p-5 border border-emerald-800/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center shrink-0 font-bold shadow-md">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base text-white flex items-center gap-2">
              <span>কর্মকর্তা ও কর্মচারী মাসিক বেতন (পে-রোল)</span>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold">
                হিসাবের অংশ
              </span>
            </h3>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              মাদ্রাসার সকল শিক্ষক ও কর্মচারীর মাসিক বেতন তৈরি, অগ্রিম/কর্তন সমন্বয়, পে-স্লিপ ও পূর্ণাঙ্গ খরচের এ-ফোর (A4) রিপোর্ট
            </p>
          </div>
        </div>

        <Link
          href="/payroll"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black rounded-xl text-xs shadow-md transition shrink-0"
        >
          <Banknote className="w-4 h-4" />
          <span>বেতন ও পে-রোল পরিচালনা করুন →</span>
        </Link>
      </div>

      {/* Filter and Transaction Ledger Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
        {/* Table Filters */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> ফিল্টার:
            </span>
            <button
              onClick={() => setSelectedFund("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedFund === "ALL"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700"
              }`}
            >
              সকল ফান্ড
            </button>
            {funds.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFund(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedFund === f.id
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700"
                }`}
              >
                {f.nameBn.split(" ")[0]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedType("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedType === "ALL"
                  ? "bg-zinc-800 dark:bg-zinc-700 text-white shadow-sm"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700"
              }`}
            >
              সব (জমা/খরচ)
            </button>
            <button
              onClick={() => setSelectedType("INCOME")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedType === "INCOME"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700"
              }`}
            >
              শুধুমাত্র জমা
            </button>
            <button
              onClick={() => setSelectedType("EXPENSE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedType === "EXPENSE"
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700"
              }`}
            >
              শুধুমাত্র খরচ
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        {loading ? (
          <div className="p-8 text-center text-zinc-500 text-sm">খতিয়ান লোড হচ্ছে...</div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-xs">কোনো লেনদেন পাওয়া যায়নি।</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 border-b border-zinc-200 dark:border-zinc-800 font-bold">
                <tr>
                  <th className="py-3 px-4">ভাউচার নং</th>
                  <th className="py-3 px-4">তারিখ</th>
                  <th className="py-3 px-4">তহবিল / ফান্ড</th>
                  <th className="py-3 px-4">ধরণ</th>
                  <th className="py-3 px-4">খাত ও বিবরণ</th>
                  <th className="py-3 px-4">দাতা / গ্রহণকারী</th>
                  <th className="py-3 px-4 text-right">টাকার পরিমাণ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-zinc-800 dark:text-zinc-200">
                      {tx.voucherNo}
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-500">
                      {toBengaliNumber(tx.date)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {tx.fund?.nameBn}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          tx.type === "INCOME"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {tx.type === "INCOME" ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {tx.type === "INCOME" ? "জমা" : "খরচ"}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <p className="font-bold text-zinc-900 dark:text-zinc-100">
                        {tx.category}
                      </p>
                      <p className="text-[11px] text-zinc-500 truncate">{tx.description}</p>
                    </td>
                    <td className="py-3 px-4 text-zinc-600">
                      {tx.donorName ? (
                        <div>
                          <p className="font-medium text-zinc-800">{tx.donorName}</p>
                          <p className="text-[10px] text-zinc-400">{tx.donorPhone}</p>
                        </div>
                      ) : (
                        <span>{tx.performedBy || "মাদ্রাসা কর্তৃপক্ষ"}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`font-mono font-black text-sm ${
                          tx.type === "INCOME" ? "text-emerald-700" : "text-red-600"
                        }`}
                      >
                        {tx.type === "INCOME" ? "+" : "-"}
                        {formatTaka(tx.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Voucher Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-emerald-600" />
                  নতুন আয়/ব্যয় ভাউচার লিপিবদ্ধ করুন
                </h3>
                <p className="text-xs text-zinc-500">শরিয়াহ অনুযায়ী সঠিক তহবিল নির্বাচন করুন</p>
              </div>
              <button
                onClick={() => setShowVoucherModal(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVoucher} className="mt-4 space-y-4 text-xs">
              {/* Type Toggle: INCOME vs EXPENSE */}
              <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "INCOME" })}
                  className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                    formData.type === "INCOME"
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  জমা / আয় ভাউচার
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "EXPENSE" })}
                  className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                    formData.type === "EXPENSE"
                      ? "bg-red-700 text-white shadow-sm"
                      : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  খরচ / ব্যয় ভাউচার
                </button>
              </div>

              {/* Fund Selector */}
              <div>
                <label className="block text-zinc-800 dark:text-zinc-200 font-bold mb-1.5">
                  তহবিল / ফান্ড নির্বাচন করুন *
                </label>
                <select
                  value={formData.fundId}
                  onChange={(e) => setFormData({ ...formData, fundId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {funds.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nameBn} (বর্তমান স্থিতি: {formatTaka(f.currentBalance)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category and Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-800 dark:text-zinc-200 font-bold mb-1.5">
                    খাত / ক্যাটাগরি *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="উদা: লিল্লাহ খাবার বাজার / দান"
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-800 dark:text-zinc-200 font-bold mb-1.5">
                    টাকার পরিমাণ *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="উদা: ৫০০০"
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold font-mono text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-zinc-800 dark:text-zinc-200 font-bold mb-1.5">
                  বিস্তারিত বিবরণ / কারণ *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="খরচ বা জমার বিস্তারিত বিবরণ লিখুন..."
                  className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Optional Donor info */}
              {formData.type === "INCOME" && (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                  <div>
                    <label className="block text-amber-900 dark:text-amber-200 font-bold mb-1.5 text-xs">দাতার নাম (যদি থাকে)</label>
                    <input
                      type="text"
                      value={formData.donorName}
                      onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                      placeholder="হাজী সাহেব..."
                      className="w-full p-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-amber-900 dark:text-amber-200 font-bold mb-1.5 text-xs">দাতার মোবাইল নং</label>
                    <input
                      type="text"
                      value={formData.donorPhone}
                      onChange={(e) => setFormData({ ...formData, donorPhone: e.target.value })}
                      placeholder="০১৭১১..."
                      className="w-full p-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowVoucherModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold shadow-md transition"
                >
                  ভাউচার সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
