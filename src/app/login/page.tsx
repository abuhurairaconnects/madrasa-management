"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  PlusCircle,
  LogIn,
  ArrowRight,
  Phone,
  Lock,
  User,
  MapPin,
  HelpCircle,
  KeyRound,
  AlertCircle,
} from "lucide-react";
import { useRole, UserRole } from "@/context/RoleContext";

interface InstitutionItem {
  id: string;
  code: string;
  nameBn: string;
  nameEn: string;
  address: string;
  phone: string;
  muhtamimName?: string;
  _count?: {
    students: number;
    funds: number;
  };
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setRole } = useRole();

  const [mode, setMode] = useState<"LOGIN" | "REGISTER">("LOGIN");
  const [demoInstitutions, setDemoInstitutions] = useState<InstitutionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Login form state
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [registerData, setRegisterData] = useState({
    nameBn: "",
    muhtamimName: "",
    phone: "",
    password: "",
    address: "",
  });

  // Load suggested demo institutions
  useEffect(() => {
    fetch("/api/auth/institution-login")
      .then((res) => res.json())
      .then((data) => {
        if (data.institutions) {
          setDemoInstitutions(data.institutions);
        }
      })
      .catch(() => {});

    if (searchParams.get("logged_out")) {
      setSuccessMsg("আপনার অ্যাকাউন্ট থেকে সফলভাবে লগআউট সম্পন্ন হয়েছে।");
    }
  }, [searchParams]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone.trim()) {
      setError("মোবাইল নম্বর অথবা ইউজারনেম দিন");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/institution-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          phoneOrUsername: loginPhone.trim(),
          password: loginPassword.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "লগইন ব্যর্থ হয়েছে");
      }

      // Save user session
      if (data.user?.role) {
        setRole(data.user.role as UserRole);
      }
      localStorage.setItem("madrasa_active_institution_id", data.institution.id);
      localStorage.setItem("madrasa_active_institution_name", data.institution.nameBn);
      if (data.user) {
        localStorage.setItem("madrasa_active_user", JSON.stringify(data.user));
      }

      // Set cookie directly in browser
      document.cookie = `madrasa_institution_id=${data.institution.id}; path=/; max-age=31536000; SameSite=Lax`;

      setSuccessMsg(`${data.institution.nameBn} এ সফলভাবে লগইন হয়েছে! ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...`);
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 500);
    } catch (err: any) {
      setError(err.message || "লগইন করা সম্ভব হয়নি");
      setSubmitting(false);
    }
  };

  // Handle Demo 1-Click Login
  const handleDemoLogin = async (inst: InstitutionItem) => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/institution-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "demo-login",
          institutionId: inst.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "ডেমো লগইন ব্যর্থ হয়েছে");
      }

      setRole("MUHTAMIM");
      localStorage.setItem("madrasa_active_institution_id", inst.id);
      localStorage.setItem("madrasa_active_institution_name", inst.nameBn);

      document.cookie = `madrasa_institution_id=${inst.id}; path=/; max-age=31536000; SameSite=Lax`;

      setSuccessMsg(`${inst.nameBn} এ প্রবেশ করা হয়েছে!`);
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 400);
    } catch (err: any) {
      setError(err.message || "ডেমো লগইন সম্ভব হয়নি");
      setSubmitting(false);
    }
  };

  // Handle Register New Madrasa & Instant Login
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.nameBn.trim()) {
      setError("মাদ্রাসার নাম (বাংলায়) অবশ্যই দিতে হবে");
      return;
    }
    if (!registerData.phone.trim()) {
      setError("মোবাইল নম্বর দিতে হবে (যা পরবর্তীতে লগইন আইডি হবে)");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/institution-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          ...registerData,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "রেজিস্ট্রেশন ব্যর্থ হয়েছে");
      }

      setRole("MUHTAMIM");
      localStorage.setItem("madrasa_active_institution_id", data.institution.id);
      localStorage.setItem("madrasa_active_institution_name", data.institution.nameBn);
      if (data.user) {
        localStorage.setItem("madrasa_active_user", JSON.stringify(data.user));
      }

      document.cookie = `madrasa_institution_id=${data.institution.id}; path=/; max-age=31536000; SameSite=Lax`;

      setSuccessMsg(`অভিনন্দন! আপনার মাদ্রাসার আইডি তৈরি হয়েছে। ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...`);
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 700);
    } catch (err: any) {
      setError(err.message || "রেজিস্ট্রেশন সম্পন্ন করা যায়নি");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white flex flex-col justify-between p-4 sm:p-6 md:p-8">
      {/* Top Header */}
      <div className="max-w-3xl mx-auto w-full flex items-center justify-between py-2 border-b border-emerald-800/40">
        <div className="flex items-center space-x-3">
          <img
            src="/logo.png"
            alt="মাদ্রাসা লোগো"
            className="w-11 h-11 rounded-full object-cover shadow-md border border-amber-400/50 shrink-0"
          />
          <div>
            <h1 className="font-bold text-base sm:text-lg text-white leading-tight">
              মাদ্রাসা ম্যানেজমেন্ট সিস্টেম
            </h1>
            <p className="text-xs text-emerald-300 font-arabic">
              نظام إدارة المدرسة الشامل
            </p>
          </div>
        </div>

        <div className="text-xs text-emerald-300 bg-emerald-900/60 px-3 py-1.5 rounded-full border border-emerald-700/50 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>সার্বজনীন মাদ্রাসা প্ল্যাটফর্ম</span>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="max-w-xl mx-auto w-full my-6 bg-zinc-900/90 backdrop-blur-md rounded-3xl border border-emerald-800/60 shadow-2xl p-5 sm:p-8">
        {/* Alerts */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ==========================================================
            VIEW 1: LOGIN TO YOUR MADRASA
            ========================================================== */}
        {mode === "LOGIN" ? (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                মাদ্রাসায় লগইন করুন
              </h2>
              <p className="text-xs sm:text-sm text-emerald-300/80">
                আপনার মোবাইল নম্বর অথবা ইউজারনেম দিয়ে লগইন করুন
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  মোবাইল নম্বর / ইউজারনেম
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="যেমন: ০১৭১২-৩৪৫৬৭৮ বা ইউজারনেম"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl pl-9 pr-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder:text-zinc-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-zinc-300">
                    পাসওয়ার্ড / পিন
                  </label>
                  <span className="text-[11px] text-zinc-400">
                    (ডিফল্ট: 123456)
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    placeholder="গোপন পাসওয়ার্ড বা পিন"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl pl-9 pr-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder:text-zinc-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-950 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {submitting ? (
                  <span>যাচাই করা হচ্ছে...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>মাদ্রাসার ড্যাশবোর্ডে লগইন করুন</span>
                  </>
                )}
              </button>
            </form>

            {/* Switch to Register */}
            <div className="pt-2 text-center border-t border-zinc-800">
              <p className="text-xs text-zinc-400">
                আপনার কি কোনো মাদ্রাসা আইডি খোলা নেই?
              </p>
              <button
                type="button"
                onClick={() => {
                  setMode("REGISTER");
                  setError(null);
                }}
                className="mt-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 underline underline-offset-4 flex items-center justify-center gap-1 mx-auto transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>এখানে ক্লিক করে নতুন মাদ্রাসা আইডি খুলুন</span>
              </button>
            </div>

            {/* Suggested Demo Section */}
            {demoInstitutions.length > 0 && (
              <div className="pt-3 border-t border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-semibold text-emerald-300">
                    সাজেস্টেড ডেমো মাদ্রাসা (১-ক্লিকে টেস্ট লগইন):
                  </span>
                  <span className="text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-400 px-1.5 py-0.5 rounded">
                    ডেমো মোড
                  </span>
                </div>

                <div className="space-y-2">
                  {demoInstitutions.slice(0, 2).map((inst, index) => (
                    <div
                      key={inst.id}
                      onClick={() => handleDemoLogin(inst)}
                      className="p-3 rounded-2xl bg-zinc-800/50 hover:bg-emerald-900/40 border border-zinc-700/60 hover:border-emerald-500/80 cursor-pointer transition flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-900/80 text-emerald-300 flex items-center justify-center font-bold text-xs">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-white group-hover:text-emerald-300 transition">
                            {inst.nameBn}
                          </h4>
                          <p className="text-[11px] text-zinc-400">
                            {inst.address} {inst.muhtamimName ? `• মুহতামিম: ${inst.muhtamimName}` : ""}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-emerald-400 font-semibold group-hover:translate-x-0.5 transition shrink-0">
                        প্রবেশ →
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ==========================================================
              VIEW 2: REGISTER NEW MADRASA ID
              ========================================================== */
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                নতুন মাদ্রাসা আইডি খুলুন
              </h2>
              <p className="text-xs sm:text-sm text-amber-300/90">
                সংক্ষেপে আপনার মাদ্রাসার তথ্য দিন, সাথে সাথে আইডি প্রস্তুত হবে
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  মাদ্রাসার পূর্ণ নাম (বাংলায়) <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="যেমন: দারুল উলূম কওমি মাদ্রাসা ও এতিমখানা"
                    value={registerData.nameBn}
                    onChange={(e) => setRegisterData({ ...registerData, nameBn: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl pl-9 pr-3.5 py-2.5 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:text-zinc-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    মুহতামিম / পরিচালকের নাম <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="মাওলানা মুফতি..."
                      value={registerData.muhtamimName}
                      onChange={(e) => setRegisterData({ ...registerData, muhtamimName: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl pl-9 pr-3.5 py-2.5 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:text-zinc-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    মোবাইল নম্বর (লগইন আইডি) <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="০১৭১২-৩৪৫৬৭৮"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl pl-9 pr-3.5 py-2.5 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:text-zinc-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    গোপন পাসওয়ার্ড / পিন
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      placeholder="যেমন: 123456"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl pl-9 pr-3.5 py-2.5 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:text-zinc-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    ঠিকানা ও জেলা <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="থানা, জেলা"
                      value={registerData.address}
                      onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl pl-9 pr-3.5 py-2.5 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:text-zinc-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-3 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-black rounded-2xl shadow-lg shadow-amber-950/50 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {submitting ? (
                  <span>আইডি তৈরি করা হচ্ছে...</span>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>আইডি তৈরি করে সরাসরি প্রবেশ করুন</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center border-t border-zinc-800">
              <p className="text-xs text-zinc-400">
                আপনার কি পূর্বেই আইডি খোলা আছে?
              </p>
              <button
                type="button"
                onClick={() => {
                  setMode("LOGIN");
                  setError(null);
                }}
                className="mt-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 flex items-center justify-center gap-1 mx-auto transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>লগইন পেজে ফিরে যান</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer info strip */}
      <div className="max-w-3xl mx-auto w-full text-center text-xs text-emerald-400/60 py-2">
        <p>মাদ্রাসা ম্যানেজমেন্ট সফটওয়্যার • নিরাপদে লগইন ও আইডি খোলার সুবিধা</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-sm">
          লোড হচ্ছে...
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
