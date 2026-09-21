"use client";

import React, { useEffect, useState } from "react";
import {
  MessageSquare,
  Send,
  Sparkles,
  Phone,
  CheckCircle2,
  Clock,
  AlertTriangle,
  History,
  Copy,
} from "lucide-react";
import {
  toBengaliNumber,
  formatTaka,
  formatBengaliDate,
} from "@/lib/formatters";

export default function SmsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [dueStudents, setDueStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // SMS Compose state
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const [smsType, setSmsType] = useState("FEE_DUE");

  const loadData = () => {
    setLoading(true);
    fetch("/api/sms")
      .then((res) => res.json())
      .then((d) => {
        setLogs(d.logs || []);
        setDueStudents(d.dueStudents || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectDueStudent = (inv: any) => {
    setRecipientPhone(inv.student.guardianPhone);
    setRecipientName(inv.student.fatherName);
    setSmsType("FEE_DUE");
    setMessage(
      `আসসালামু আলাইকুম মুহতারাম, জামিয়া ইসলামিয়ায় আপনার সন্তান ${inv.student.nameBn}-এর ${inv.month} মাসের ফি বকেয়া ${formatTaka(inv.dueAmount)}। দ্রুত পরিশোধের অনুরোধ রইল।`
    );
  };

  const setPresetTemplate = (type: string) => {
    setSmsType(type);
    if (type === "ATTENDANCE") {
      setMessage(
        "আসসালামু আলাইকুম, সম্মানিত অভিভাবক, আপনার সন্তান আজ মাদ্রাসায় অনুপস্থিত রয়েছে। কোনো সমস্যা হলে মাদ্রাসা অফিসে জানানোর অনুরোধ করা হলো।"
      );
    } else if (type === "HOLIDAY") {
      setMessage(
        "মুহতারাম অভিভাবকবৃন্দ, পবিত্র জুমার দিন এবং সাপ্তাহিক ছুটি উপলক্ষে আগামী বৃহস্পতিবার মাগরিবের পর থেকে মাদ্রাসা বন্ধ থাকবে। শনিবার যথারীতি ক্লাস শুরু হবে।"
      );
    } else if (type === "HIFZ_UPDATE") {
      setMessage(
        "মাশাআল্লাহ! অত্যন্ত আনন্দের সাথে জানাচ্ছি যে, আপনার সন্তান আজ সফলভাবে ৫ পারা হিফজ সমাপ্ত করেছে। তার দ্বীনি সফলতার জন্য দুয়ার আবেদন রইল।"
      );
    }
  };

  const handleSendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientPhone || !message) {
      alert("মোবাইল নম্বর ও বার্তা পূরণ করুন।");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientPhone,
          recipientName,
          message,
          smsType,
        }),
      });

      if (res.ok) {
        alert("বার্তাটি সফলভাবে সিমুলেট ও প্রেরিত হয়েছে!");
        loadData();
        setMessage("");
        setRecipientPhone("");
        setRecipientName("");
      } else {
        alert("বার্তা প্রেরণে ত্রুটি হয়েছে।");
      }
    } catch (err) {
      console.error(err);
      alert("সার্ভার ত্রুটি।");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            সার্বজনীন এসএমএস নোটিফিকেশন সেন্টার
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            বকেয়া ফি তাগাদা, ছাত্র অনুপস্থিতি নোটিশ ও ছুটির বার্তা এক ক্লিকে অভিভাবকদের পাঠান
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            এসএমএস গেটওয়ে সিমুলেটর সক্রিয়
          </span>
        </div>
      </div>

      {/* Grid: Left Compose, Right Due Alert Quick Targets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Compose Form (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <Send className="w-4 h-4 text-emerald-600" />
            নতুন বাংলা এসএমএস পাঠান (SMS Composer)
          </h2>

          {/* Preset Templates */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              দ্রুত টেমপ্লেট নির্বাচন করুন:
            </label>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPresetTemplate("ATTENDANCE")}
                className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 font-medium transition cursor-pointer"
              >
                অনুপস্থিতির নোটিশ
              </button>
              <button
                type="button"
                onClick={() => setPresetTemplate("HIFZ_UPDATE")}
                className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 font-medium transition cursor-pointer"
              >
                হিফজ পারা সমাপ্তি মোবারকবাদ
              </button>
              <button
                type="button"
                onClick={() => setPresetTemplate("HOLIDAY")}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-medium transition cursor-pointer"
              >
                ছুটির নোটিশ
              </button>
            </div>
          </div>

          <form onSubmit={handleSendSms} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-800 dark:text-zinc-200 font-bold mb-1.5">
                  অভিভাবক মোবাইল নম্বর *
                </label>
                <input
                  type="text"
                  required
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="০১৭xxxxxxxx"
                  className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-800 dark:text-zinc-200 font-bold mb-1.5">
                  অভিভাবকের নাম
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="উদা: মাওলানা কামাল উদ্দিন"
                  className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-zinc-800 dark:text-zinc-200 font-bold">
                  এসএমএস বার্তা (বাংলায়) *
                </label>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                  অক্ষর: {message.length} (১ এসএমএস)
                </span>
              </div>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="এখানে আপনার নোটিশ বা বার্তাটি লিখুন..."
                className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/20 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {sending ? "প্রেরণ হচ্ছে..." : "বার্তাটি প্রেরণ করুন"}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Quick Due Fee Targets (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            বকেয়া ফি-এর তালিকা (এক ক্লিকে এসএমএস পাঠান)
          </h2>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {dueStudents.length === 0 ? (
              <p className="text-xs text-zinc-400 text-center py-8">বর্তমানে কারো বকেয়া ফি নেই।</p>
            ) : (
              dueStudents.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/30 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {inv.student?.nameBn}
                    </h4>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      {toBengaliNumber(inv.student?.guardianPhone)}
                    </p>
                    <p className="text-[10px] text-red-600 font-bold mt-0.5">
                      বকেয়া: {formatTaka(inv.dueAmount)} ({inv.month})
                    </p>
                  </div>

                  <button
                    onClick={() => selectDueStudent(inv)}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    বার্তা লোড
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Sent SMS Logs Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-600" />
            সাম্প্রতিক প্রেরিত বার্তার ইতিহাস (SMS History Logs)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-800 font-bold">
              <tr>
                <th className="py-2.5 px-4">তারিখ ও সময়</th>
                <th className="py-2.5 px-4">প্রাপকের নম্বর ও নাম</th>
                <th className="py-2.5 px-4">বার্তার বিবরণ</th>
                <th className="py-2.5 px-4">ধরণ</th>
                <th className="py-2.5 px-4 text-right">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition">
                  <td className="py-2.5 px-4 font-mono text-zinc-500 dark:text-zinc-400">
                    {new Date(log.sentAt).toLocaleTimeString("bn-BD")}
                  </td>
                  <td className="py-2.5 px-4">
                    <p className="font-bold font-mono text-zinc-800 dark:text-zinc-200">{toBengaliNumber(log.recipientPhone)}</p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{log.recipientName}</p>
                  </td>
                  <td className="py-2.5 px-4 max-w-md text-zinc-700 dark:text-zinc-300">
                    {log.message}
                  </td>
                  <td className="py-2.5 px-4 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                    {log.smsType}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      {log.status === "SIMULATED" ? "সিমুলেটেড" : "সফল"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
