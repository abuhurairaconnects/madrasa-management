"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  MessageSquare,
  HardDrive,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Search,
  Sparkles,
  Layers,
} from "lucide-react";
import { toBengaliNumber } from "@/lib/formatters";

interface InstitutionItem {
  id: string;
  code: string;
  nameBn: string;
  nameEn: string;
  phone: string;
  muhtamimName: string;
  studentCount: number;
  studentLimit: number;
  smsBalance: number;
  storageUsedMb: number;
  subscriptionStatus: string;
  subscriptionPlan: string;
  createdAt: string;
}

interface SuperAdminData {
  metrics: {
    totalInstitutions: number;
    activeInstitutions: number;
    totalStudents: number;
    totalSmsBalance: number;
    totalStorageMb: number;
  };
  institutions: InstitutionItem[];
  cached?: boolean;
}

export default function SuperAdminPage() {
  const [data, setData] = useState<SuperAdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Institution Form
  const [formData, setFormData] = useState({
    code: "",
    nameBn: "",
    nameEn: "",
    phone: "",
    muhtamimName: "",
    studentLimit: 2000,
    smsBalance: 1000,
    subscriptionPlan: "STANDARD",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin");
      const json = await res.json();
      if (json.metrics) {
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/super-admin/institutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        alert("মাদ্রাসা সফলভাবে নিবন্ধিত হয়েছে!");
        setShowAddModal(false);
        setFormData({
          code: "",
          nameBn: "",
          nameEn: "",
          phone: "",
          muhtamimName: "",
          studentLimit: 2000,
          smsBalance: 1000,
          subscriptionPlan: "STANDARD",
        });
        fetchData();
      } else {
        alert(result.error || "নিবন্ধন ব্যর্থ হয়েছে");
      }
    } catch (err: any) {
      alert("ত্রুটি: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    if (!confirm(`আপনি কি এই প্রতিষ্ঠানটি ${nextStatus === "ACTIVE" ? "সক্রিয়" : "স্থগিত"} করতে চান?`)) {
      return;
    }

    try {
      await fetch("/api/super-admin/institutions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "TOGGLE_STATUS", value: nextStatus }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTopupSms = async (id: string) => {
    const amountStr = prompt("কতগুলো এসএমএস ক্রেডিট টপ-আপ করতে চান?", "500");
    if (!amountStr || isNaN(Number(amountStr))) return;

    try {
      await fetch("/api/super-admin/institutions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "ADD_SMS", value: Number(amountStr) }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredInstitutions = data?.institutions.filter(
    (i) =>
      i.nameBn.toLowerCase().includes(search.toLowerCase()) ||
      i.code.toLowerCase().includes(search.toLowerCase()) ||
      i.phone.includes(search)
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-1">
            <ShieldCheck className="w-5 h-5" /> সেন্ট্রাল পার্সোনাল এক্সেস ও SaaS কন্ট্রোল
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            মাদ্রাসা মাল্টি-টেন্যান্ট প্ল্যাটফর্ম
            <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-normal">
              Super Admin
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            নিবন্ধিত মাদ্রাসাসমূহ পরিচালনা, শিক্ষার্থী ধারণক্ষমতা এবং রিসোর্স ট্র্যাকিং
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition"
            title="রিফ্রেশ"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> রিফ্রেশ
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium shadow-lg shadow-emerald-900/40 transition"
          >
            <Plus className="w-4 h-4" /> নতুন মাদ্রাসা যুক্ত করুন
          </button>
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition"
          >
            <ExternalLink className="w-4 h-4" /> মাদ্রাসা ভিউ
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">মোট প্রতিষ্ঠান</span>
            <Building2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {toBengaliNumber(data?.metrics.totalInstitutions || 0)} টি
          </div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> {toBengaliNumber(data?.metrics.activeInstitutions || 0)} টি সক্রিয়
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">মোট শিক্ষার্থী</span>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {toBengaliNumber(data?.metrics.totalStudents || 0)} জন
          </div>
          <div className="text-xs text-slate-400 mt-1">সব প্রতিষ্ঠান মিলিয়ে বর্তমান এনরোলমেন্ট</div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">মোট SMS কোটা</span>
            <MessageSquare className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {toBengaliNumber(data?.metrics.totalSmsBalance || 0)} টি
          </div>
          <div className="text-xs text-amber-400 mt-1">অটোমেটেড নোটিফিকেশন ব্যালেন্স</div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">রিসোর্স ও স্টোরেজ</span>
            <HardDrive className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {toBengaliNumber(data?.metrics.totalStorageMb || 0)} MB
          </div>
          <div className="text-xs text-purple-400 mt-1">ডেটাবেস ও ডকুমেন্ট ব্যবহার</div>
        </div>
      </div>

      {/* Main Content: Search & Institutions Table */}
      <div className="max-w-7xl mx-auto bg-slate-800/60 border border-slate-700/60 rounded-xl overflow-hidden shadow-xl">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-700/60 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="মাদ্রাসার নাম, কোড বা ফোন দিয়ে খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
          <div className="text-xs text-slate-400">
            মোট প্রতিষ্ঠান: {toBengaliNumber(filteredInstitutions?.length || 0)} টি
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700/60">
              <tr>
                <th className="px-6 py-3.5">মাদ্রাসা ও কোড</th>
                <th className="px-6 py-3.5">মুহতামিম ও যোগাযোগ</th>
                <th className="px-6 py-3.5">শিক্ষার্থী কোটা (স্কেল)</th>
                <th className="px-6 py-3.5">এসএমএস কোটা</th>
                <th className="px-6 py-3.5">স্ট্যাটাস</th>
                <th className="px-6 py-3.5 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {filteredInstitutions && filteredInstitutions.length > 0 ? (
                filteredInstitutions.map((inst) => {
                  const studentPercent = Math.min(
                    Math.round((inst.studentCount / inst.studentLimit) * 100),
                    100
                  );
                  return (
                    <tr key={inst.id} className="hover:bg-slate-700/30 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{inst.nameBn}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-mono bg-slate-900 text-emerald-400 px-2 py-0.5 rounded border border-slate-700">
                            {inst.code}
                          </span>
                          <span className="text-xs text-slate-400">{inst.subscriptionPlan}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-slate-200">{inst.muhtamimName || "নির্ধারিত নয়"}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{inst.phone}</div>
                      </td>

                      <td className="px-6 py-4 min-w-[200px]">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{toBengaliNumber(inst.studentCount)} শিক্ষার্থী</span>
                          <span className="text-slate-400">সর্বোচ্চ {toBengaliNumber(inst.studentLimit)}</span>
                        </div>
                        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              studentPercent > 85 ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${studentPercent}%` }}
                          />
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">
                            {toBengaliNumber(inst.smsBalance)}
                          </span>
                          <button
                            onClick={() => handleTopupSms(inst.id)}
                            className="text-xs bg-slate-700 hover:bg-slate-600 text-emerald-300 px-2 py-0.5 rounded transition"
                          >
                            +টপ-আপ
                          </button>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            inst.subscriptionStatus === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {inst.subscriptionStatus === "ACTIVE" ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> সক্রিয়
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3" /> স্থগিত
                            </>
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleToggleStatus(inst.id, inst.subscriptionStatus)}
                          className={`text-xs px-2.5 py-1.5 rounded transition ${
                            inst.subscriptionStatus === "ACTIVE"
                              ? "bg-red-950/40 hover:bg-red-900 text-red-300 border border-red-800/40"
                              : "bg-emerald-950/40 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/40"
                          }`}
                        >
                          {inst.subscriptionStatus === "ACTIVE" ? "স্থগিত করুন" : "পুনরায় সক্রিয় করুন"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    কোনো মাদ্রাসা পাওয়া যায়নি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboarding Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" /> নতুন মাদ্রাসা নিবন্ধন করুন
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInstitution} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  ইউনিক কোড (যেমন: JAMIA-03) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="JAMIA-03"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  মাদ্রাসার পুরো নাম (বাংলায়) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: জামিয়া ইসলামিয়া দারুল কুরআন"
                  value={formData.nameBn}
                  onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">মুহতামিমের নাম</label>
                  <input
                    type="text"
                    placeholder="মাওলানা আবু বকর"
                    value={formData.muhtamimName}
                    onChange={(e) => setFormData({ ...formData, muhtamimName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">অফিসিয়াল ফোন *</label>
                  <input
                    type="text"
                    required
                    placeholder="017xxxxxxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    শিক্ষার্থী কোটা (লিমিট)
                  </label>
                  <input
                    type="number"
                    value={formData.studentLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, studentLimit: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">বরাদ্দকৃত SMS ক্রেডিট</label>
                  <input
                    type="number"
                    value={formData.smsBalance}
                    onChange={(e) =>
                      setFormData({ ...formData, smsBalance: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg shadow-lg shadow-emerald-900/40 transition flex items-center gap-2"
                >
                  {submitting ? "সংরক্ষণ হচ্ছে..." : "অনবোর্ড করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
