"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  Calendar,
  BookOpen,
  Receipt,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Bell,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Building,
  UserCheck,
} from "lucide-react";
import { toBengaliNumber, formatTaka } from "@/lib/formatters";

export default function GuardianDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(0);
  const [isPaying, setIsPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("guardian_session");
    if (!raw) {
      router.push("/guardian/login");
      return;
    }
    try {
      setSession(JSON.parse(raw));
      // Strictly prevent guardian session from accessing main madrasa dashboard
      localStorage.removeItem("madrasa_active_institution_id");
      document.cookie = "madrasa_institution_id=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "madrasa_user_type=GUARDIAN; path=/; max-age=86400; SameSite=Lax";
    } catch {
      router.push("/guardian/login");
    }
  }, [router]);

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-sm">
        লোড হচ্ছে...
      </div>
    );
  }

  const { guardian, students } = session;
  const student = students[selectedStudentIndex] || students[0];
  const unpaidInvoice = student?.invoices?.find((inv: any) => inv.status === "UNPAID");
  const latestHifz = student?.hifzRecords?.[0];

  const handlePayOnline = async (invoiceId: string, amount: number) => {
    setIsPaying(true);
    setPaySuccess(null);

    try {
      const res = await fetch("/api/payment/bkash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId,
          payerPhone: guardian.phone,
          paymentMethod: "BKASH",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPaySuccess(`৳${amount} ফি সফলভাবে পরিশোধ হয়েছে! ট্রানজেকশন আইডি: ${data.transactionId}`);
        // Update local session state
        const updatedStudents = [...students];
        if (updatedStudents[selectedStudentIndex]) {
          updatedStudents[selectedStudentIndex].invoices = updatedStudents[
            selectedStudentIndex
          ].invoices.filter((inv: any) => inv.id !== invoiceId);
        }
        setSession({ ...session, students: updatedStudents });
      } else {
        alert(data.error || "পেমেন্ট সম্পন্ন হতে ব্যর্থ হয়েছে");
      }
    } catch (err: any) {
      alert("ত্রুটি: " + err.message);
    } finally {
      setIsPaying(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("guardian_session");
    document.cookie = "madrasa_user_type=; path=/; max-age=0; SameSite=Lax";
    router.push("/guardian/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Top Bar */}
      <header className="bg-emerald-950/80 border-b border-emerald-800/40 sticky top-0 z-30 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-emerald-950">
            মা
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">
              {guardian.institution?.nameBn || "মাদ্রাসা ম্যানেজমেন্ট"}
            </h1>
            <p className="text-[11px] text-emerald-300">অভিভাবক: {guardian.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-bold transition shadow-xs cursor-pointer"
            title="অভিভাবক অ্যাকাউন্ট থেকে লগআউট করুন"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>লগআউট</span>
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* Children Selector if multiple */}
        {students.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {students.map((s: any, idx: number) => (
              <button
                key={s.id}
                onClick={() => setSelectedStudentIndex(idx)}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition whitespace-nowrap cursor-pointer ${
                  idx === selectedStudentIndex
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {s.nameBn}
              </button>
            ))}
          </div>
        )}

        {/* Student Profile Overview Card */}
        <div className="bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-800/50 rounded-2xl p-4 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-lg">
                {student?.nameBn ? student.nameBn.charAt(0) : "ছ"}
              </div>
              <div>
                <h2 className="text-base font-bold text-white">{student?.nameBn}</h2>
                <p className="text-xs text-slate-400 mt-0.5">আইডি: {student?.studentId}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] bg-emerald-900/60 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-md">
                    {student?.department?.nameBn || "হিফজ বিভাগ"}
                  </span>
                  <span className="text-[11px] text-slate-400">{student?.classSession?.nameBn}</span>
                </div>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
              <CheckCircle2 className="w-3 h-3" /> আজ উপস্থিত
            </span>
          </div>
        </div>

        {/* Payment Confirmation Alert if any */}
        {paySuccess && (
          <div className="bg-emerald-900/40 border border-emerald-600/50 text-emerald-200 text-xs p-3.5 rounded-xl flex items-start gap-2 shadow-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{paySuccess}</p>
              <p className="text-[11px] text-emerald-300/80 mt-0.5">
                আপনার মোবাইল নম্বরে কনফার্মেশন এসএমএস পাঠানো হয়েছে।
              </p>
            </div>
          </div>
        )}

        {/* Digital Fee Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Receipt className="w-4 h-4 text-amber-400" /> ফি সংক্রান্ত তথ্য
            </div>
            <span className="text-xs text-slate-400">সেপ্টেম্বর ২০২৬</span>
          </div>

          {unpaidInvoice ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-amber-950/20 border border-amber-800/40 p-3 rounded-xl">
                <div>
                  <p className="text-xs text-amber-300 font-medium">চলতি বকেয়া ফি</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">মাসিক বেতন ও আবাসন</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-amber-400">
                    ৳{toBengaliNumber(unpaidInvoice.dueAmount)}
                  </p>
                  <span className="text-[10px] text-red-400 bg-red-950/40 border border-red-800/40 px-1.5 py-0.5 rounded">
                    অপরিশোধিত
                  </span>
                </div>
              </div>

              <button
                onClick={() => handlePayOnline(unpaidInvoice.id, unpaidInvoice.dueAmount)}
                disabled={isPaying}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg shadow-pink-950/50 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                {isPaying ? "প্রসেস হচ্ছে..." : "বিকাশ / নগদ দিয়ে এখনই পরিশোধ করুন"}
              </button>
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-emerald-400 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> আলহামদুলিল্লাহ, কোনো বকেয়া নেই!
            </div>
          )}
        </div>

        {/* Daily Hifz / Academic Progress */}
        {latestHifz && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <BookOpen className="w-4 h-4 text-emerald-400" /> হিফজুল কুরআন অগ্রগতি
              </div>
              <span className="text-xs text-slate-400">দৈনিক ছবক</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400">আজকের ছবক</span>
                <p className="text-sm font-bold text-white mt-0.5">
                  পারা {toBengaliNumber(latestHifz.sabaqPara || 1)}, পৃষ্ঠা{" "}
                  {toBengaliNumber(latestHifz.sabaqPage || 1)}
                </p>
                <p className="text-[10px] text-emerald-400 mt-0.5">সুরা: {latestHifz.sabaqSurah}</p>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400">ছবকের মান</span>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">
                  {latestHifz.sabaqQuality === "MUMTAZ" ? "চমৎকার (ممتاز)" : "উত্তম"}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  আমুক্তা: {latestHifz.amukhtaParas || "পারা ১-২"}
                </p>
              </div>
            </div>

            {latestHifz.notes && (
              <div className="text-[11px] bg-slate-950/60 p-2 rounded-lg text-slate-300 border border-slate-800/80">
                <span className="font-semibold text-emerald-400">উস্তাদের মন্তব্য:</span>{" "}
                {latestHifz.notes}
              </div>
            )}
          </div>
        )}

        {/* Notices Board */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center gap-2 text-white font-semibold text-sm mb-3 border-b border-slate-800 pb-2.5">
            <Bell className="w-4 h-4 text-blue-400" /> মাদ্রাসার জরুরি নোটিশ
          </div>

          <div className="space-y-2.5">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                <span className="text-amber-400 font-semibold uppercase">পরীক্ষা নোটিশ</span>
                <span>২০ সেপ্টেম্বর ২০২৬</span>
              </div>
              <h4 className="font-semibold text-white mb-1">আসন্ন সাময়িক পরীক্ষা প্রসঙ্গে</h4>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                আগামী মাসের প্রথম সপ্তাহ থেকে পরীক্ষা শুরু হবে। সকল শিক্ষার্থীকে উপস্থিত থাকার অনুরোধ
                করা যাচ্ছে।
              </p>
            </div>
          </div>
        </div>

        {/* Guardian Account & Profile Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> অভিভাবক অ্যাকাউন্ট ও সেশন
            </div>
            <span className="text-[11px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded-full font-medium">
              সেশন সক্রিয়
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">অভিভাবকের নাম:</span>
              <span className="font-bold text-white">{guardian.name}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">নিবন্ধিত ফোন নম্বর:</span>
              <span className="font-mono text-emerald-400 font-bold">{guardian.phone}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">শিক্ষার্থীর নাম:</span>
              <span className="font-bold text-white">{student?.nameBn}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">শিক্ষার্থীর আইডি:</span>
              <span className="font-mono text-blue-400 font-semibold">{student?.studentId}</span>
            </div>
          </div>

          {/* Action Buttons: Logout & Switch Guardian ONLY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-red-600/20 hover:bg-red-600 border border-red-500/40 text-red-300 hover:text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              লগআউট করুন
            </button>

            <button
              onClick={() => {
                localStorage.removeItem("guardian_session");
                document.cookie = "madrasa_user_type=; path=/; max-age=0; SameSite=Lax";
                router.push("/guardian/login");
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-amber-600/20 hover:bg-amber-600 border border-amber-500/40 text-amber-300 hover:text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              অন্য অভিভাবকে লগইন
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
