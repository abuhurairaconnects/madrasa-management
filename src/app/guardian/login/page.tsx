"use client";

import React, { useState } from "react";
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
} from "lucide-react";

export default function GuardianLoginPage() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<"PHONE" | "STUDENT_ID">("PHONE");
  const [identifier, setIdentifier] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const executeLogin = async (idVal: string, pinVal: string, isPhone: boolean) => {
    setLoading(true);
    setError("");

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
        // Save session locally
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white flex flex-col justify-between p-4 md:p-6">
      <div className="max-w-md w-full mx-auto my-auto py-6">
        {/* Return to Madrasa Portal Link */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-emerald-300/80 hover:text-emerald-200 transition bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 px-3 py-1.5 rounded-xl"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>মাদ্রাসার মূল ড্যাশবোর্ডে ফিরে যান</span>
          </Link>
        </div>

        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-3">
            <img
              src="/logo.png"
              alt="মাদ্রাসা লোগো"
              className="w-20 h-20 rounded-full object-cover shadow-2xl border-2 border-amber-400/60"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">অভিভাবক পোর্টাল লগইন</h1>
          <p className="text-emerald-200/70 text-xs sm:text-sm mt-1">
            সন্তানের হিফজ ছবক, হাজিরা ও ফি সংক্রান্ত তথ্যের ডিজিটাল পোর্টাল
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-md">
          {/* Tabs: Phone vs Student ID */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-1 rounded-xl mb-5 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setLoginMethod("PHONE");
                setError("");
              }}
              className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                loginMethod === "PHONE"
                  ? "bg-emerald-600 text-white shadow-sm"
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
              className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                loginMethod === "STUDENT_ID"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              শিক্ষার্থীর আইডি দিয়ে
            </button>
          </div>

          {error && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-200 text-xs p-3 rounded-xl mb-4 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1.5 font-semibold">
                {loginMethod === "PHONE" ? "নিবন্ধিত মোবাইল নম্বর" : "শিক্ষার্থীর আইডি / রোল নম্বর"}
              </label>
              <div className="relative">
                {loginMethod === "PHONE" ? (
                  <Phone className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
                ) : (
                  <UserCheck className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
                )}
                <input
                  type="text"
                  required
                  placeholder={loginMethod === "PHONE" ? "যেমন: 01711223344" : "যেমন: JAMIA-01-S001"}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs text-slate-300 font-semibold">পিন কোড (PIN)</label>
                <span className="text-[11px] text-emerald-400 font-medium">ডিফল্ট পিন: 1234</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white tracking-widest focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
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
                  অভিভাবক পোর্টালে প্রবেশ করুন <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Help Information */}
        <div className="mt-5 p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400 leading-relaxed text-center">
          💡 <span className="font-semibold text-slate-300">অভিভাবকদের জন্য নির্দেশনা:</span> ভর্তির সময় দেওয়া আপনার মোবাইল নম্বর এবং পিন কোড দিয়ে লগইন করুন। পিন ভুলে গেলে মাদ্রাসা কর্তৃপক্ষের সাথে যোগাযোগ করুন।
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-slate-500 pb-2 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>সুরক্ষিত অভিভাবক এক্সেস চ্যানেল • জামিয়া ইসলামিয়া দারুল উলূম</span>
      </div>
    </div>
  );
}
