"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building,
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  Save,
  CheckCircle2,
  Users,
  Wallet,
  MessageSquare,
  ShieldCheck,
  Printer,
  Edit3,
  KeyRound,
  UserCheck,
  ArrowRight,
  Layers,
  Check,
  AlertCircle,
} from "lucide-react";
import { toBengaliNumber, formatTaka } from "@/lib/formatters";
import { useRole, UserRole, UserProfile, ROLE_ICONS, DEPARTMENTS } from "@/context/RoleContext";

interface InstitutionData {
  id: string;
  code: string;
  nameBn: string;
  nameEn: string;
  arabicName?: string;
  address: string;
  phone: string;
  email?: string;
  muhtamimName?: string;
  establishedYear?: string;
  receiptFooter?: string;
  studentLimit?: number;
  smsBalance?: number;
  subscriptionStatus?: string;
  subscriptionPlan?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const {
    role,
    currentUser,
    setCurrentUser,
    switchUserAccount,
    allUserProfiles,
    activeDepartment,
  } = useRole();

  // Active Tab: "PERSONAL" | "ACCOUNTS" | "INSTITUTION"
  const [activeTab, setActiveTab] = useState<"PERSONAL" | "ACCOUNTS" | "INSTITUTION">("PERSONAL");

  const [institution, setInstitution] = useState<InstitutionData | null>(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFundBalance: 0,
    smsBalance: 500,
  });
  const [loading, setLoading] = useState(true);

  // Institution Edit state
  const [isEditingInst, setIsEditingInst] = useState(false);
  const [savingInst, setSavingInst] = useState(false);
  const [instFormData, setInstFormData] = useState({
    nameBn: "",
    nameEn: "",
    arabicName: "",
    muhtamimName: "",
    phone: "",
    email: "",
    address: "",
    establishedYear: "",
    receiptFooter: "",
  });

  // Personal Profile Edit state
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [personalFormData, setPersonalFormData] = useState({
    name: currentUser.name,
    phone: currentUser.phone,
    email: currentUser.email,
  });

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setPersonalFormData({
      name: currentUser.name,
      phone: currentUser.phone,
      email: currentUser.email,
    });
  }, [currentUser]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      // 1. Fetch institution data
      const instRes = await fetch("/api/institution");
      const instData = await instRes.json();
      if (instData.institution) {
        setInstitution(instData.institution);
        setInstFormData({
          nameBn: instData.institution.nameBn || "",
          nameEn: instData.institution.nameEn || "",
          arabicName: instData.institution.arabicName || "",
          muhtamimName: instData.institution.muhtamimName || "",
          phone: instData.institution.phone || "",
          email: instData.institution.email || "",
          address: instData.institution.address || "",
          establishedYear: instData.institution.establishedYear || "",
          receiptFooter: instData.institution.receiptFooter || "",
        });
      }

      // 2. Fetch live stats
      const dashRes = await fetch("/api/dashboard");
      const dashData = await dashRes.json();
      if (dashData.stats) {
        setStats({
          totalStudents: dashData.stats.totalStudents || 0,
          totalFundBalance: dashData.stats.totalFundBalance || 0,
          smsBalance: instData.institution?.smsBalance || 500,
        });
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("প্রোফাইল তথ্য লোড হতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Save Institution Info
  const handleSaveInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInst(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/institution", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(instFormData),
      });

      const updated = await res.json();
      if (!res.ok || updated.error) {
        throw new Error(updated.error || "সংরক্ষণ করা যায়নি");
      }

      localStorage.setItem("madrasa_active_institution_name", instFormData.nameBn);
      setInstitution(updated);
      setIsEditingInst(false);
      setSuccessMsg("মাদ্রাসার তথ্য সফলভাবে হালনাগাদ করা হয়েছে!");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "সংরক্ষণ ব্যর্থ হয়েছে");
    } finally {
      setSavingInst(false);
    }
  };

  // Save Personal Profile Info
  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: UserProfile = {
      ...currentUser,
      name: personalFormData.name,
      phone: personalFormData.phone,
      email: personalFormData.email,
    };
    setCurrentUser(updatedUser);
    localStorage.setItem("madrasa_active_user", JSON.stringify(updatedUser));
    setIsEditingPersonal(false);
    setSuccessMsg("আপনার ব্যক্তিগত প্রোফাইল তথ্য সফলভাবে সংরক্ষিত হয়েছে!");
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Handle switching to another account
  const handleSwitchAccount = (targetRole: UserRole, targetName: string) => {
    switchUserAccount(targetRole);
    setSuccessMsg(`সফলভাবে "${targetName}" অ্যাকাউন্টে লগইন সম্পন্ন হয়েছে!`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-zinc-500 font-medium">প্রোফাইল লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Top Header & Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-xs transition w-fit"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>পূর্ববর্তী পেজে ফিরে যান</span>
        </button>

        {/* 3 Main View Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-200/70 dark:bg-zinc-800/80 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold">
          <button
            onClick={() => setActiveTab("PERSONAL")}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === "PERSONAL"
                ? "bg-white dark:bg-zinc-900 text-emerald-800 dark:text-emerald-300 shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>আমার ব্যক্তিগত প্রোফাইল</span>
          </button>

          <button
            onClick={() => setActiveTab("ACCOUNTS")}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === "ACCOUNTS"
                ? "bg-amber-400 text-emerald-950 shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <KeyRound className="w-4 h-4 text-amber-700 shrink-0" />
            <span>অ্যাকাউন্ট ও লগইন সুইচ</span>
          </button>

          <button
            onClick={() => setActiveTab("INSTITUTION")}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === "INSTITUTION"
                ? "bg-white dark:bg-zinc-900 text-emerald-800 dark:text-emerald-300 shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Building className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>মাদ্রাসার তথ্য</span>
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 text-xs flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* =========================================================
          TAB 1: MY PERSONAL USER PROFILE (আমার ব্যক্তিগত প্রোফাইল)
          ========================================================= */}
      {activeTab === "PERSONAL" && (
        <div className="space-y-6">
          {/* Personal Hero Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 p-6 sm:p-8 text-white shadow-xl border border-emerald-700/50">
            <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4 sm:gap-5">
                {(() => {
                  const CurrentUserIcon = ROLE_ICONS[currentUser.role] || User;
                  const currentDeptMeta = DEPARTMENTS[currentUser.role];
                  return (
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${currentDeptMeta?.accentColor || "from-amber-400 to-amber-600"} flex items-center justify-center text-white shadow-lg shrink-0 ring-2 ring-white/20`}>
                      <CurrentUserIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                  );
                })()}
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-mono bg-emerald-950 border border-emerald-700 text-amber-300 px-2.5 py-0.5 rounded-full font-bold">
                      ইউজার আইডি: {currentUser.username}
                    </span>
                    <span className="text-[11px] bg-emerald-700/60 border border-emerald-500/40 text-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                      {currentUser.designation}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">
                    {currentUser.name}
                  </h1>
                  <p className="text-xs sm:text-sm text-emerald-200/90 mt-1">
                    মাদ্রাসা: {institution?.nameBn}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {!isEditingPersonal ? (
                  <button
                    onClick={() => setIsEditingPersonal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>ব্যক্তিগত তথ্য এডিট</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditingPersonal(false)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl text-xs font-bold transition"
                  >
                    <span>বাতিল</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveTab("ACCOUNTS")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-xl text-xs font-bold transition shadow-md"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>অন্য অ্যাকাউন্টে লগইন</span>
                </button>
              </div>
            </div>
          </div>

          {/* Personal Info Grid or Form */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 sm:p-7 shadow-xs">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>ব্যক্তিগত তথ্যের বিবরণী</span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  বর্তমানে সক্রিয় ব্যবহারকারীর ব্যক্তিগত পরিচয় ও দায়িত্ব
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                লগইন স্ট্যাটাস: সক্রিয়
              </span>
            </div>

            {!isEditingPersonal ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800">
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                    ব্যবহারকারীর পূর্ণ নাম
                  </span>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                    {currentUser.name}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800">
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                    অফিসিয়াল পদবী
                  </span>
                  <p className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                    {currentUser.designation}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800">
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    মোবাইল নম্বর
                  </span>
                  <p className="font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    {currentUser.phone}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800">
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-emerald-600" />
                    অফিসিয়াল ইমেইল
                  </span>
                  <p className="font-mono text-zinc-900 dark:text-zinc-100">
                    {currentUser.email || "উন্মুক্ত নয়"}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800">
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                    দায়িত্বপ্রাপ্ত বিভাগ
                  </span>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {currentUser.assignedDept}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800">
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                    যোগদানের সময়কাল
                  </span>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {currentUser.joinedDate}
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSavePersonal} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      ব্যবহারকারীর পূর্ণ নাম <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={personalFormData.name}
                      onChange={(e) => setPersonalFormData({ ...personalFormData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      মোবাইল নম্বর <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={personalFormData.phone}
                      onChange={(e) => setPersonalFormData({ ...personalFormData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    ইমেইল ঠিকানা
                  </label>
                  <input
                    type="email"
                    value={personalFormData.email}
                    onChange={(e) => setPersonalFormData({ ...personalFormData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsEditingPersonal(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>তথ্য সংরক্ষণ করুন</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: SWITCH USER ACCOUNTS & LOGIN (অ্যাকাউন্ট ও লগইন সুইচ)
          ========================================================= */}
      {activeTab === "ACCOUNTS" && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-7 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-amber-500" />
                  <span>মাদ্রাসার পদমর্যাদা অনুযায়ী অ্যাকাউন্ট নির্বাচন ও লগইন</span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  আপনি যে পদে বা ডেস্কে কাজ করতে চান, সেই অ্যাকাউন্টের পাশে &ldquo;লগইন করুন&rdquo; বাটনে ক্লিক করুন।
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 rounded-full w-fit">
                ১-ক্লিক সুইচ
              </span>
            </div>

            {/* 6 User Accounts Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allUserProfiles.map((acc) => {
                const isCurrentlyActive = currentUser.role === acc.role;
                return (
                  <div
                    key={acc.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isCurrentlyActive
                        ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 shadow-md ring-2 ring-emerald-500/20"
                        : "bg-zinc-50 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 border-zinc-200/80 dark:border-zinc-700/80"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        {(() => {
                          const AccIcon = ROLE_ICONS[acc.role] || User;
                          const accDeptMeta = DEPARTMENTS[acc.role];
                          return (
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accDeptMeta?.accentColor || "from-emerald-500 to-emerald-600"} flex items-center justify-center text-white shadow-xs`}>
                              <AccIcon className="w-5 h-5 text-white" />
                            </div>
                          );
                        })()}
                        {isCurrentlyActive ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            সক্রিয় ইউজার
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-200/70 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                            প্রস্তুত
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-0.5">
                        {acc.name}
                      </h4>
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2">
                        {acc.designation}
                      </p>

                      <div className="space-y-1 text-[11px] text-zinc-600 dark:text-zinc-400 bg-white/70 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50 mb-3">
                        <div className="flex justify-between">
                          <span>আইডি:</span>
                          <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{acc.username}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ফোন:</span>
                          <span className="font-mono text-zinc-800 dark:text-zinc-200">{acc.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>বিভাগ:</span>
                          <span className="text-zinc-800 dark:text-zinc-200">{acc.assignedDept}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between">
                      {isCurrentlyActive ? (
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          লগইন করা আছে
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSwitchAccount(acc.role, acc.name)}
                          className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>এই অ্যাকাউন্টে লগইন করুন</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: MADRASA INSTITUTIONAL PROFILE (মাদ্রাসার তথ্য)
          ========================================================= */}
      {activeTab === "INSTITUTION" && (
        <div className="space-y-6">
          {/* Hero Profile Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 p-6 sm:p-8 text-white shadow-xl border border-emerald-700/50">
            <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-amber-400 flex items-center justify-center text-emerald-950 shadow-lg font-bold text-3xl sm:text-4xl shrink-0">
                  م
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-mono bg-emerald-950 border border-emerald-700 text-amber-300 px-2.5 py-0.5 rounded-full font-bold">
                      {institution?.code || "MADRASA-ID"}
                    </span>
                    <span className="text-[11px] bg-emerald-700/60 border border-emerald-500/40 text-emerald-200 px-2.5 py-0.5 rounded-full">
                      সক্রিয় সাবস্ক্রিপশন
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">
                    {institution?.nameBn}
                  </h1>
                  {institution?.arabicName && (
                    <p className="text-sm sm:text-base text-emerald-300/80 font-arabic mt-0.5">
                      {institution?.arabicName}
                    </p>
                  )}
                  {institution?.nameEn && (
                    <p className="text-xs text-emerald-200/70 font-sans mt-0.5">
                      {institution?.nameEn}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 border border-white/30 text-white rounded-xl text-xs font-semibold transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">প্রিন্ট</span>
                </button>
                {!isEditingInst ? (
                  <button
                    onClick={() => setIsEditingInst(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-xl text-xs font-bold shadow-md transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>মাদ্রাসার তথ্য এডিট</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditingInst(false)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl text-xs font-bold transition"
                  >
                    <span>বাতিল</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 4 Quick Stat Badges */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Students */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500">মোট শিক্ষার্থী</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                  {toBengaliNumber(stats.totalStudents)} জন
                </p>
                <p className="text-[10px] text-zinc-400 mt-0.5">ধারণক্ষমতা: {toBengaliNumber(institution?.studentLimit || 2000)} জন</p>
              </div>
            </div>

            {/* Fund Balance */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500">মোট তহবিল স্থিতি</span>
                <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
                  {formatTaka(stats.totalFundBalance)}
                </p>
                <p className="text-[10px] text-zinc-400 mt-0.5">৪টি শরীয়াহ ফান্ড</p>
              </div>
            </div>

            {/* SMS Balance */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500">এসএমএস ব্যালেন্স</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                  {toBengaliNumber(institution?.smsBalance || 500)} টি
                </p>
                <p className="text-[10px] text-zinc-400 mt-0.5">অভিভাবক বার্তা</p>
              </div>
            </div>

            {/* Plan / Security */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500">ক্লাউড সংস্করণ</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
                  এন্টারপ্রাইজ
                </p>
                <p className="text-[10px] text-zinc-400 mt-0.5">সম্পূর্ণ সুরক্ষিত ডাটাবেজ</p>
              </div>
            </div>
          </div>

          {/* Main Details & Edit Form */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                    {isEditingInst ? "মাদ্রাসার তথ্য সম্পাদনা করুন" : "মাদ্রাসার প্রাতিষ্ঠানিক বিবরণী"}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {isEditingInst
                      ? "সঠিক তথ্য দিয়ে নিচের 'সংরক্ষণ করুন' বাটনে ক্লিক করুন"
                      : "মাদ্রাসার অফিশিয়াল প্রোফাইল ও প্রশাসনিক বিবরণ"}
                  </p>
                </div>
              </div>
            </div>

            {!isEditingInst ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/80">
                  <span className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    মাদ্রাসার নাম (বাংলায়)
                  </span>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">
                    {institution?.nameBn || "উল্লেখ নেই"}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/80">
                  <span className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    মাদ্রাসার নাম (ইংরেজি)
                  </span>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {institution?.nameEn || "উল্লেখ নেই"}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/80">
                  <span className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    মুহতামিম / পরিচালকের নাম
                  </span>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">
                    {institution?.muhtamimName || "উল্লেখ নেই"}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/80">
                  <span className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    মোবাইল / হেল্পলাইন নম্বর
                  </span>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">
                    {institution?.phone || "উল্লেখ নেই"}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/80 md:col-span-2">
                  <span className="text-[11px] font-semibold text-zinc-400 block mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    মাদ্রাসার পূর্ণাঙ্গ ঠিকানা ও অবস্থান
                  </span>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">
                    {institution?.address || "ঠিকানা উল্লেখ নেই"}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/80 md:col-span-2">
                  <span className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    রসিদের নিচের বাণী / দোয়ার বাক্য
                  </span>
                  <p className="italic text-zinc-700 dark:text-zinc-300">
                    &ldquo;{institution?.receiptFooter || "আল্লাহ পাক আপনার দান ও অর্থ কবুল করুন। জাযাকুমুল্লাহু খাইরান।"}&rdquo;
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveInstitution} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      মাদ্রাসার নাম (বাংলায়) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={instFormData.nameBn}
                      onChange={(e) => setInstFormData({ ...instFormData, nameBn: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      মাদ্রাসার নাম (ইংরেজি)
                    </label>
                    <input
                      type="text"
                      value={instFormData.nameEn}
                      onChange={(e) => setInstFormData({ ...instFormData, nameEn: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      মুহতামিম / পরিচালকের নাম
                    </label>
                    <input
                      type="text"
                      value={instFormData.muhtamimName}
                      onChange={(e) => setInstFormData({ ...instFormData, muhtamimName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      মোবাইল / হেল্পলাইন নম্বর <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={instFormData.phone}
                      onChange={(e) => setInstFormData({ ...instFormData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    মাদ্রাসার পূর্ণাঙ্গ অবস্থান ও ঠিকানা
                  </label>
                  <input
                    type="text"
                    value={instFormData.address}
                    onChange={(e) => setInstFormData({ ...instFormData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsEditingInst(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={savingInst}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingInst ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
