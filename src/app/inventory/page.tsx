"use client";

import React, { useEffect, useState } from "react";
import {
  Boxes,
  Package,
  PlusCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  Coins,
  Cpu,
} from "lucide-react";
import { toBengaliNumber, formatTaka } from "@/lib/formatters";

const ASSET_CATEGORIES: Record<string, string> = {
  ELECTRONICS: "ইলেকট্রনিক্স ও কম্পিউটার",
  ELECTRICAL: "বৈদ্যুতিক সরঞ্জাম ও ফ্যান",
  FURNITURE: "আসবাবপত্র ও ডেস্ক-বেঞ্চ",
  GENERAL: "সাধারণ সামগ্রী",
};

export default function InventoryPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ASSETS" | "CONSUMABLES">("ASSETS");
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);

  // Forms
  const [assetForm, setAssetForm] = useState({
    name: "",
    category: "ELECTRONICS",
    quantity: 1,
    location: "প্রধান অফিস",
    condition: "GOOD",
    estimatedCost: 25000,
  });

  const [itemForm, setItemForm] = useState({
    name: "",
    category: "STATIONERY",
    unit: "পিস",
    currentStock: 50,
    reorderLevel: 10,
  });

  const loadData = () => {
    setLoading(true);
    fetch("/api/inventory")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setData(res);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ADD_ASSET", ...assetForm }),
    });
    if (res.ok) {
      setShowAssetModal(false);
      loadData();
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ADD_ITEM", ...itemForm }),
    });
    if (res.ok) {
      setShowItemModal(false);
      loadData();
    }
  };

  const handleUpdateStock = async (itemId: string, newStock: number) => {
    await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "UPDATE_STOCK", itemId, currentStock: newStock }),
    });
    loadData();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-sm font-medium mb-1">
            <Boxes className="w-5 h-5 text-amber-400" />
            <span>মডিউল ৭: সম্পদ ও মালামাল ইনভেন্টরি</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">স্থায়ী সম্পদ ও কনজিউমেবল স্টক</h1>
          <p className="text-emerald-200/80 text-sm mt-1">
            মাদ্রাসার ইলেকট্রনিক্স, আসবাবপত্র, ফ্যান ও অফিস স্টেশনারি সামগ্রীর সংরক্ষণ হিসাব
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAssetModal(true)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-emerald-950 font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            নতুন সম্পদ যুক্ত করুন
          </button>
          <button
            onClick={() => setShowItemModal(true)}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg transition-all text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            স্টক আইটেম যুক্ত করুন
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="text-xs text-zinc-500 font-semibold uppercase">স্থায়ী সম্পদের মোট মূল্যমান</div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
            {formatTaka(data?.stats?.totalAssetValue || 0)}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="text-xs text-zinc-500 font-semibold uppercase">স্থায়ী পণ্যের পরিমাণ</div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
            {toBengaliNumber(data?.stats?.totalAssetItems || 0)}টি
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="text-xs text-zinc-500 font-semibold uppercase">স্টেশনারি ও ব্যবহার্য পণ্য</div>
          <div className="text-2xl font-black text-teal-700 dark:text-teal-400 mt-1">
            {toBengaliNumber(data?.stats?.totalConsumableTypes || 0)} প্রকার
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <button
          onClick={() => setActiveTab("ASSETS")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            activeTab === "ASSETS"
              ? "bg-emerald-800 text-white shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <Cpu className="w-4 h-4" />
          স্থায়ী সম্পদ তালিকা (Assets)
        </button>
        <button
          onClick={() => setActiveTab("CONSUMABLES")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            activeTab === "CONSUMABLES"
              ? "bg-emerald-800 text-white shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <Package className="w-4 h-4" />
          ব্যবহার্য স্টক ও স্টেশনারি (Consumables)
        </button>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="text-center py-20 text-zinc-400">ইনভেন্টরি লোড হচ্ছে...</div>
      ) : activeTab === "ASSETS" ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800 text-xs">
                  <th className="p-4">পণ্যের নাম</th>
                  <th className="p-4">ক্যাটাগরি</th>
                  <th className="p-4">অবস্থান / রুম</th>
                  <th className="p-4 text-center">পরিমাণ</th>
                  <th className="p-4 text-right">আনুমানিক মূল্য</th>
                  <th className="p-4 text-center">অবস্থা (Condition)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {data?.assets?.map((a: any) => (
                  <tr key={a.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                    <td className="p-4 font-bold text-zinc-900 dark:text-zinc-100">{a.name}</td>
                    <td className="p-4 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      {ASSET_CATEGORIES[a.category] || a.category}
                    </td>
                    <td className="p-4 text-zinc-600 dark:text-zinc-400">{a.location || "—"}</td>
                    <td className="p-4 text-center font-bold text-zinc-800 dark:text-zinc-200">
                      {toBengaliNumber(a.quantity)}টি
                    </td>
                    <td className="p-4 text-right font-medium text-emerald-700 dark:text-emerald-400">
                      {formatTaka(a.estimatedCost)}
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                        {a.condition === "GOOD" ? "সচল ও ভালো" : "মেরামতযোগ্য"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800 text-xs">
                  <th className="p-4">মালামালের নাম</th>
                  <th className="p-4">একক (Unit)</th>
                  <th className="p-4 text-center">বর্তমান মজুদ</th>
                  <th className="p-4 text-center">রি-অর্ডার লেভেল</th>
                  <th className="p-4 text-center">মজুদ স্ট্যাটাস</th>
                  <th className="p-4 text-right">স্টক আপডেট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {data?.inventoryItems?.map((item: any) => {
                  const isLow = item.currentStock <= item.reorderLevel;
                  return (
                    <tr key={item.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                      <td className="p-4 font-bold text-zinc-900 dark:text-zinc-100">{item.name}</td>
                      <td className="p-4 text-zinc-600 dark:text-zinc-400">{item.unit}</td>
                      <td className="p-4 text-center font-bold text-base text-zinc-900 dark:text-zinc-100">
                        {toBengaliNumber(item.currentStock)} {item.unit}
                      </td>
                      <td className="p-4 text-center text-zinc-500">
                        {toBengaliNumber(item.reorderLevel)} {item.unit}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            isLow
                              ? "bg-rose-50 text-rose-700 border border-rose-300 flex items-center justify-center gap-1 mx-auto w-fit"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-300"
                          }`}
                        >
                          {isLow && <AlertTriangle className="w-3 h-3" />}
                          {isLow ? "ঘাটতি / জরুরি" : "পর্যাপ্ত"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleUpdateStock(item.id, Math.max(0, item.currentStock - 1))}
                            className="w-7 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold hover:bg-zinc-300"
                          >
                            -
                          </button>
                          <button
                            onClick={() => handleUpdateStock(item.id, item.currentStock + 5)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold border border-emerald-300 hover:bg-emerald-200"
                          >
                            +৫ যোগ
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

      {/* Modal: Add Asset */}
      {showAssetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="bg-emerald-900 text-white p-4 font-bold text-lg flex items-center justify-between">
              <span>নতুন স্থায়ী সম্পদ যুক্ত করুন</span>
              <button onClick={() => setShowAssetModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddAsset} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block font-semibold mb-1">পণ্যের নাম*</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: সনি সাউন্ড প্রজেক্টর, সিলিং ফ্যান"
                  value={assetForm.name}
                  onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">ক্যাটাগরি</label>
                  <select
                    value={assetForm.category}
                    onChange={(e) => setAssetForm({ ...assetForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                  >
                    {Object.entries(ASSET_CATEGORIES).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">পরিমাণ (সংখ্যা)</label>
                  <input
                    type="number"
                    min="1"
                    value={assetForm.quantity}
                    onChange={(e) => setAssetForm({ ...assetForm, quantity: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-bold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">অবস্থান / রুম</label>
                  <input
                    type="text"
                    value={assetForm.location}
                    onChange={(e) => setAssetForm({ ...assetForm, location: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">আনুমানিক মূল্য (টাকা)</label>
                  <input
                    type="number"
                    value={assetForm.estimatedCost}
                    onChange={(e) => setAssetForm({ ...assetForm, estimatedCost: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                  />
                </div>
              </div>
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAssetModal(false)}
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

      {/* Modal: Add Consumable Item */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="bg-emerald-900 text-white p-4 font-bold text-lg flex items-center justify-between">
              <span>নতুন স্টক আইটেম যুক্ত করুন</span>
              <button onClick={() => setShowItemModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddItem} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block font-semibold mb-1">আইটেমের নাম*</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: খাতা, মার্কার পেন, চক"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">একক (Unit)*</label>
                  <input
                    type="text"
                    required
                    placeholder="পিস / ডজন / কেজি"
                    value={itemForm.unit}
                    onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">বর্তমান মজুদ*</label>
                  <input
                    type="number"
                    value={itemForm.currentStock}
                    onChange={(e) => setItemForm({ ...itemForm, currentStock: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">রি-অর্ডার সতর্কতা লেভেল</label>
                <input
                  type="number"
                  value={itemForm.reorderLevel}
                  onChange={(e) => setItemForm({ ...itemForm, reorderLevel: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                />
              </div>
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
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
    </div>
  );
}
