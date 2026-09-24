"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  ArrowLeft,
  Building,
  UserPlus,
  User,
  Sparkles,
  BookOpen,
  CheckCircle2,
} from "lucide-react";

export default function GuardianLoginPage() {
  const router = useRouter();

  // Main Mode: LOGIN vs REGISTER
  const [authMode, setAuthMode] = useState<"LOGIN" | "REGISTER">("LOGIN");

  // Login State
  const [loginMethod, setLoginMethod] = useState<"PHONE" | "STUDENT_ID">("PHONE");
  const [identifier, setIdentifier] = useState("");
  const [pin, setPin] = useState("");

  // Registration State
  const [guardianName, setGuardianName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [studentNameOrId, setStudentNameOrId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [regPin, setRegPin] = useState("1234");

  // Metadata for autocomplete (departments & existing students)
  const [departments, setDepartments] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("mode") === "register") {
        setAuthMode("REGISTER");
      }
    }

    fetch("/api/guardian")
      .then((res) => res.json())
      .then((data) => {
        if (data.departments) {
          setDepartments(data.departments);
          if (data.departments.length > 0) {
            setDepartmentId(data.departments[0].id);
          }
        }
        if (data.students) {
          setStudentsList(data.students);
        }
      })
      .catch(() => {});
  }, []);

  const executeLogin = async (idVal: string, pinVal: string, isPhone: boolean) => {
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const payload = isPhone
        ? { phone: idVal.trim(), pin: pinVal.trim() }
        : { studentId: idVal.trim(), pin: pinVal.trim() };

      const res = await fetch("/api/guardian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("guardian_session", JSON.stringify(data));
        router.push("/guardian");
      } else {
        setError(data.error || "লগইন ব্যর্থ হয়েছে। সঠিক নম্বর বা আইডি দিন।");
      }
    } catch (err: any) {
      setError("সার্ভার ত্রুটি: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(identifier, pin, loginMethod === "PHONE");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/guardian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REGISTER",
          guardianName: guardianName.trim(),
          phone: regPhone.trim(),
          studentNameOrId: studentNameOrId.trim(),
          departmentId,
          pin: regPin.trim() || "1234",
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMsg("অভিনন্দন! আপনার অভিভাবক অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...");
        localStorage.setItem("guardian_session", JSON.stringify(data));
        setTimeout(() => {
          router.push("/guardian");
        }, 600);
      } else {
        setError(data.error || "অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে। অনুগ্রহ করে সব তথ্য দিন।");
      }
    } catch (err: any) {
      setError("সার্ভার ত্রুটি: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white flex flex-col justify-between p-4 md:p-6 dark-surface">
      <div className="max-w-md w-full mx-auto my-auto py-4">
        {/* Return to Madrasa Login */}
        <div className="mb-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-emerald-300/90 hover:text-emerald-200 transition bg-emerald-950/70 hover:bg-emerald-900/70 border border-emerald-800/60 px-3.5 py-1.5 rounded-xl font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>মাদ্রাসার মূল লগইন পেজে যান</span>
          </Link>
        </div>

        {/* Header Branding */}
        <div className="text-center mb-5">
          <div className="w-20 h-20 mx-auto mb-3">
            <img
              src="/logo.png"
              alt="মাদ্রাসা লোগো"
              className="w-20 h-20 rounded-full object-cover shadow-2xl border-2 border-amber-400/60"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {authMode === "LOGIN" ? "অভিভাবক পোর্টাল লগইন" : "নতুন অভিভাবক অ্যাকাউন্ট খুলুন"}
          </h1>
          <p className="text-emerald-200/80 text-xs sm:text-sm mt-1">
            সন্তানের হিফজ ছবক, হাজিরা ও ফি সংক্রান্ত তথ্যের ডিজিটাল পোর্টাল
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-md">
          {/* Primary Mode Switcher: লগইন করুন vs নতুন অ্যাকাউন্ট খুলুন */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl mb-5 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setAuthMode("LOGIN");
                setError("");
                setSuccessMsg("");
              }}
              className={`py-2.5 px-3 text-xs sm:text-sm font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === "LOGIN"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>লগইন করুন</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode("REGISTER");
                setError("");
                setSuccessMsg("");
              }}
              className={`py-2.5 px-3 text-xs sm:text-sm font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === "REGISTER"
                  ? "bg-amber-500 text-slate-950 font-black shadow-md"
                  : "text-amber-300/90 hover:text-amber-200 hover:bg-slate-900"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>নতুন অ্যাকাউন্ট খুলুন</span>
            </button>
          </div>

          {/* Error & Success Alerts */}
          {error && (
            <div className="bg-red-500/15 border border-red-500/40 text-red-200 text-xs p-3 rounded-xl mb-4 text-center font-medium">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs p-3 rounded-xl mb-4 flex items-center justify-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ==========================================================
              MODE 1: LOGIN FORM
              ========================================================== */}
          {authMode === "LOGIN" ? (
            <>
              {/* Sub-Tabs: Phone vs Student ID */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-1 rounded-xl mb-4 border border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod("PHONE");
                    setError("");
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    loginMethod === "PHONE"
                      ? "bg-emerald-700/80 text-white border border-emerald-500/40 shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  মোবাইল নম্বর দিয়ে
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod("STUDENT_ID");
                    setError("");
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    loginMethod === "STUDENT_ID"
                      ? "bg-emerald-700/80 text-white border border-emerald-500/40 shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  শিক্ষার্থীর আইডি দিয়ে
                </button>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label
                    className="block text-xs text-slate-200 mb-1.5 font-bold"
                    style={{ color: "#e2e8f0" }}
                  >
                    {loginMethod === "PHONE"
                      ? "নিবন্ধিত মোবাইল নম্বর"
                      : "শিক্ষার্থীর আইডি / রোল নম্বর"}
                  </label>
                  <div className="relative">
                    {loginMethod === "PHONE" ? (
                      <Phone className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3 z-10" />
                    ) : (
                      <UserCheck className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3 z-10" />
                    )}
                    <input
                      type="text"
                      required
                      placeholder={
                        loginMethod === "PHONE"
                          ? "যেমন: 01711223344"
                          : "যেমন: STD-2026-001"
                      }
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-950 border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-xs text-slate-200 mb-1.5 font-bold"
                    style={{ color: "#e2e8f0" }}
                  >
                    পিন কোড (PIN)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3 z-10" />
                    <input
                      type="password"
                      required
                      placeholder="•••• (ডিফল্ট: 1234)"
                      maxLength={6}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-950 border border-slate-300 rounded-xl text-sm font-bold tracking-widest focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-950/60 transition flex items-center justify-center gap-2 mt-5 cursor-pointer"
                >
                  {loading ? (
                    "লগইন যাচাই করা হচ্ছে..."
                  ) : (
                    <>
                      <span>অভিভাবক পোর্টালে প্রবেশ করুন</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Callout for Guardians who don't have an account yet */}
              <div className="mt-5 p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-700/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-center sm:text-left">
                  <p className="text-xs font-bold text-emerald-200">
                    আপনার কি অভিভাবক অ্যাকাউন্ট নেই?
                  </p>
                  <p className="text-[11px] text-emerald-300/70">
                    নতুন অ্যাকাউন্ট খুলে সন্তানের তথ্য ও ছবক দেখুন
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("REGISTER");
                    setError("");
                  }}
                  className="w-full sm:w-auto px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>অ্যাকাউন্ট খুলুন</span>
                </button>
              </div>
            </>
          ) : (
            /* ==========================================================
               MODE 2: NEW GUARDIAN ACCOUNT REGISTRATION FORM
               ========================================================== */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed">
                <span className="font-bold text-amber-300 flex items-center gap-1.5 mb-0.5">
                  <Sparkles className="w-3.5 h-3.5" /> নতুন অভিভাবক রেজিস্ট্রেশন:
                </span>
                আপনার নাম, মোবাইল নম্বর ও সন্তানের নাম/আইডি দিয়ে নিচে ফর্মটি পূরণ করলে সাথে সাথে আপনার অ্যাকাউন্ট চালু হয়ে যাবে।
              </div>

              <div>
                <label
                  className="block text-xs text-slate-200 mb-1 font-bold"
                  style={{ color: "#e2e8f0" }}
                >
                  অভিভাবকের নাম (পিতা / মাতা) *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3 z-10" />
                  <input
                    type="text"
                    required
                    placeholder="যেমন: মো. আব্দুল করিম"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-950 border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-xs text-slate-200 mb-1 font-bold"
                  style={{ color: "#e2e8f0" }}
                >
                  আপনার মোবাইল নম্বর (লগইন আইডি) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3 z-10" />
                  <input
                    type="tel"
                    required
                    placeholder="যেমন: 01711223344"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-950 border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-xs text-slate-200 mb-1 font-bold"
                  style={{ color: "#e2e8f0" }}
                >
                  সন্তানের (শিক্ষার্থীর) নাম অথবা আইডি *
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3 z-10" />
                  <input
                    type="text"
                    required
                    list="guardian-student-suggestions"
                    placeholder="সন্তানের নাম লিখুন বা তালিকা থেকে নিন"
                    value={studentNameOrId}
                    onChange={(e) => setStudentNameOrId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-950 border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 transition"
                  />
                  <datalist id="guardian-student-suggestions">
                    {studentsList.map((st) => (
                      <option
                        key={st.id}
                        value={`${st.nameBn} (${st.studentId})`}
                      >
                        পিতা: {st.fatherName} | {st.department?.nameBn || ""}
                      </option>
                    ))}
                  </datalist>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  * আপনার সন্তানের নাম টাইপ করুন অথবা তালিকা থেকে সিলেক্ট করুন
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs text-slate-200 mb-1 font-bold"
                    style={{ color: "#e2e8f0" }}
                  >
                    সন্তানের বিভাগ
                  </label>
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-emerald-600 absolute left-3 top-3 z-10" />
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-white text-slate-950 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-500"
                    >
                      {departments.length === 0 ? (
                        <option value="">হিফজুল কুরআন বিভাগ</option>
                      ) : (
                        departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.nameBn}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    className="block text-xs text-slate-200 mb-1 font-bold"
                    style={{ color: "#e2e8f0" }}
                  >
                    নতুন পিন কোড (৪ সংখ্যা) *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-emerald-600 absolute left-3 top-3 z-10" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="যেমন: 1234"
                      value={regPin}
                      onChange={(e) => setRegPin(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-white text-slate-950 border border-slate-300 rounded-xl text-sm font-bold tracking-widest focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-amber-950/50 transition flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                {loading ? (
                  "অ্যাকাউন্ট তৈরি হচ্ছে..."
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>অ্যাকাউন্ট খুলুন ও পোর্টালে প্রবেশ করুন</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("LOGIN");
                    setError("");
                  }}
                  className="text-xs text-emerald-300 hover:text-emerald-200 font-semibold underline cursor-pointer"
                >
                  ইতোমধ্যে অ্যাকাউন্ট আছে? এখানে লগইন করুন
                </button>
              </div>
            </form>
          )}

          {/* Switch to Madrasa Admin / Muhtamim Login */}
          <div className="mt-5 pt-4 border-t border-slate-800">
            <Link
              href="/login"
              className="flex items-center justify-between p-3 rounded-2xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/50 transition group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-900/80 text-amber-300 flex items-center justify-center shrink-0">
                  <Building className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-xs text-white group-hover:text-amber-300 transition">
                    মাদ্রাসা প্রশাসন ও শিক্ষক লগইন
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    মুহতামিম, শিক্ষক ও কর্মচারীদের ড্যাশবোর্ড
                  </p>
                </div>
              </div>
              <span className="text-xs text-amber-400 font-bold group-hover:translate-x-0.5 transition shrink-0">
                লগইন →
              </span>
            </Link>
          </div>
        </div>

        {/* Help Information */}
        <div className="mt-4 p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed text-center">
          💡 <span className="font-bold text-white">অভিভাবকদের জন্য নির্দেশনা:</span> আপনার অ্যাকাউন্ট না থাকলে উপরে{" "}
          <button
            type="button"
            onClick={() => setAuthMode("REGISTER")}
            className="text-amber-400 font-bold underline cursor-pointer"
          >
            &quot;নতুন অ্যাকাউন্ট খুলুন&quot;
          </button>{" "}
          বাটনে ক্লিক করে নিজের নাম, মোবাইল নম্বর ও পিন দিয়ে সহজেই রেজিস্ট্রেশন করে প্রবেশ করুন।
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-slate-400 pb-2 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>সুরক্ষিত অভিভাবক এক্সেস চ্যানেল • দারুল উলুম হাফিজিয়া কওমিয়া মাদ্রাসা</span>
      </div>
    </div>
  );
}
