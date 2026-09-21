"use client";

import React, { useEffect, useState } from "react";
import {
  Sparkles,
  Moon,
  Sun,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  PlusCircle,
  Award,
  Filter,
} from "lucide-react";
import { toBengaliNumber } from "@/lib/formatters";

const WAQT_MAP: Record<string, string> = {
  fajr: "ফজর",
  dhuhr: "যোহর",
  asr: "আসর",
  maghrib: "মাগরিব",
  isha: "এশা",
};

const STATUS_ICONS: Record<string, { label: string; color: string; bg: string }> = {
  JAMAAT: { label: "জামাত", color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300" },
  MUNFARID: { label: "একা", color: "text-blue-700 dark:text-blue-300", bg: "bg-blue-50 dark:bg-blue-950/50 border-blue-300" },
  QAZA: { label: "কাযা", color: "text-rose-700 dark:text-rose-300", bg: "bg-rose-50 dark:bg-rose-950/50 border-rose-300" },
  EXCUSED: { label: "ওজর", color: "text-zinc-600 dark:text-zinc-400", bg: "bg-zinc-100 dark:bg-zinc-800 border-zinc-300" },
};

export default function IslamicStudiesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"NAMAZ" | "AMAL" | "TAJWEED">("NAMAZ");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedClassId, setSelectedClassId] = useState("ALL");
  const [showTajweedModal, setShowTajweedModal] = useState(false);

  // Tajweed Form
  const [tajweedForm, setTajweedForm] = useState({
    studentId: "",
    makhrajScore: 5,
    sifatScore: 5,
    tartilQuality: "MUMTAZ",
    surahOrPara: "পারা ৩০",
    notes: "",
  });

  const loadData = () => {
    setLoading(true);
    fetch(`/api/islamic-studies?date=${selectedDate}&classId=${selectedClassId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setData(res);
          if (res.students?.length > 0 && !tajweedForm.studentId) {
            setTajweedForm((prev) => ({ ...prev, studentId: res.students[0].id }));
          }
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [selectedDate, selectedClassId]);

  const toggleWaqt = async (studentId: string, currentRecord: any, waqt: string) => {
    const sequence = ["JAMAAT", "MUNFARID", "QAZA", "EXCUSED"];
    const currentVal = currentRecord?.[waqt] || "JAMAAT";
    const nextIdx = (sequence.indexOf(currentVal) + 1) % sequence.length;
    const nextVal = sequence[nextIdx];

    const updated = {
      action: "UPDATE_NAMAZ",
      studentId,
      date: selectedDate,
      fajr: waqt === "fajr" ? nextVal : currentRecord?.fajr || "JAMAAT",
      dhuhr: waqt === "dhuhr" ? nextVal : currentRecord?.dhuhr || "JAMAAT",
      asr: waqt === "asr" ? nextVal : currentRecord?.asr || "JAMAAT",
      maghrib: waqt === "maghrib" ? nextVal : currentRecord?.maghrib || "JAMAAT",
      isha: waqt === "isha" ? nextVal : currentRecord?.isha || "JAMAAT",
      tahajjud: currentRecord?.tahajjud || false,
    };

    await fetch("/api/islamic-studies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    loadData();
  };

  const toggleTahajjud = async (studentId: string, currentRecord: any) => {
    const updated = {
      action: "UPDATE_NAMAZ",
      studentId,
      date: selectedDate,
      fajr: currentRecord?.fajr || "JAMAAT",
      dhuhr: currentRecord?.dhuhr || "JAMAAT",
      asr: currentRecord?.asr || "JAMAAT",
      maghrib: currentRecord?.maghrib || "JAMAAT",
      isha: currentRecord?.isha || "JAMAAT",
      tahajjud: !currentRecord?.tahajjud,
    };

    await fetch("/api/islamic-studies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    loadData();
  };

  const handleSaveTajweed = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/islamic-studies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ADD_TAJWEED", date: selectedDate, ...tajweedForm }),
    });
    if (res.ok) {
      setShowTajweedModal(false);
      loadData();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-sm font-medium mb-1">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>মডিউল ৪: ইসলামিক শিক্ষা ও তরবিয়ত</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">নামাজ, তাজবীদ ও দৈনিক আমল ট্র্যাকার</h1>
          <p className="text-emerald-200/80 text-sm mt-1">
            পাঁচ ওয়াক্ত জামাতে নামাজ উপস্থিতি, তাহাজ্জুদ, সকাল-সন্ধ্যার আমল এবং বিশুদ্ধ তিলাওয়াত মূল্যায়ন
          </p>
        </div>
        <button
          onClick={() => setShowTajweedModal(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-emerald-950 font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          তাজবীদ মূল্যায়ন যোগ
        </button>
      </div>

      {/* Control & Tab Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("NAMAZ")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === "NAMAZ"
                ? "bg-emerald-800 text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <Moon className="w-4 h-4 text-amber-400" />
            ৫ ওয়াক্ত নামাজ
          </button>
          <button
            onClick={() => setActiveTab("AMAL")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === "AMAL"
                ? "bg-emerald-800 text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            দৈনিক আমল ও আখলাক
          </button>
          <button
            onClick={() => setActiveTab("TAJWEED")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === "TAJWEED"
                ? "bg-emerald-800 text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-500" />
            তাজবীদ মূল্যায়ন
          </button>
        </div>

        {/* Date and Class Selector */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-zinc-800 dark:text-zinc-200"
          />
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            <option value="ALL">সকল জামাত</option>
            {data?.classes?.map((c: any) => (
              <option key={c.id} value={c.id}>{c.nameBn}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="text-center py-20 text-zinc-400">ডাটা লোড হচ্ছে...</div>
      ) : activeTab === "NAMAZ" ? (
        /* Namaz Grid */
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
            <span>ক্লিক করে স্ট্যাটাস পরিবর্তন করুন (জামাত ➔ একা ➔ কাযা ➔ ওজর)</span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 font-bold text-emerald-600">● জামাত</span>
              <span className="inline-flex items-center gap-1 font-bold text-blue-600">● একা</span>
              <span className="inline-flex items-center gap-1 font-bold text-rose-600">● কাযা</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800 text-xs">
                  <th className="p-4">রোল</th>
                  <th className="p-4">শিক্ষার্থীর নাম</th>
                  <th className="p-4 text-center">ফজর</th>
                  <th className="p-4 text-center">যোহর</th>
                  <th className="p-4 text-center">আসর</th>
                  <th className="p-4 text-center">মাগরিব</th>
                  <th className="p-4 text-center">এশা</th>
                  <th className="p-4 text-center">তাহাজ্জুদ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {data?.students?.map((s: any) => {
                  const n = s.namazRecords?.[0] || {};
                  return (
                    <tr key={s.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {s.studentId}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100">{s.nameBn}</div>
                        <div className="text-xs text-zinc-500">{s.classSession?.nameBn}</div>
                      </td>

                      {["fajr", "dhuhr", "asr", "maghrib", "isha"].map((waqt) => {
                        const val = n[waqt] || "JAMAAT";
                        const info = STATUS_ICONS[val] || STATUS_ICONS.JAMAAT;
                        return (
                          <td key={waqt} className="p-4 text-center">
                            <button
                              onClick={() => toggleWaqt(s.id, n, waqt)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all hover:scale-105 ${info.bg} ${info.color}`}
                            >
                              {info.label}
                            </button>
                          </td>
                        );
                      })}

                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleTahajjud(s.id, n)}
                          className={`p-1.5 rounded-lg border text-xs font-bold transition-all ${
                            n.tahajjud
                              ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700"
                          }`}
                          title="তাহাজ্জুদ পড়েছে কি না"
                        >
                          {n.tahajjud ? "★ তাহাজ্জুদ" : "—"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === "AMAL" ? (
        /* Amal & Character Table */
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="font-bold text-base text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" />
              দৈনিক আমল, নফল তিলাওয়াত ও আখলাক পর্যবেক্ষণ ({selectedDate})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800 text-xs">
                  <th className="p-4">রোল</th>
                  <th className="p-4">শিক্ষার্থীর নাম</th>
                  <th className="p-4 text-center">সকালের জিকির</th>
                  <th className="p-4 text-center">সন্ধ্যার জিকির</th>
                  <th className="p-4 text-center">নফল তিলাওয়াত (পৃষ্ঠা)</th>
                  <th className="p-4 text-center">আখলাক / আচরণ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {data?.students?.map((s: any) => {
                  const a = s.amalRecords?.[0] || {};
                  return (
                    <tr key={s.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                      <td className="p-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {s.studentId}
                      </td>
                      <td className="p-4 font-bold text-zinc-900 dark:text-zinc-100">{s.nameBn}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${a.morningAdhkar ? "bg-emerald-50 text-emerald-700 border border-emerald-300" : "bg-zinc-100 text-zinc-400"}`}>
                          {a.morningAdhkar ? "✓ সম্পন্ন" : "অসম্পূর্ণ"}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${a.eveningAdhkar ? "bg-emerald-50 text-emerald-700 border border-emerald-300" : "bg-zinc-100 text-zinc-400"}`}>
                          {a.eveningAdhkar ? "✓ সম্পন্ন" : "অসম্পূর্ণ"}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold text-zinc-800 dark:text-zinc-200">
                        {toBengaliNumber(a.tilawatPages || 0)} পৃষ্ঠা
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-3 py-1 rounded-md text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300">
                          {a.akhlaqRating === "MUMTAZ" ? "মুমতাজ (উত্তম)" : "সাধারণ"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Tajweed Evaluation Records */
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="font-bold text-base text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              তাজবীদ ও বিশুদ্ধ তিলাওয়াত মূল্যায়ন রেকর্ড
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800 text-xs">
                  <th className="p-4">তারিখ</th>
                  <th className="p-4">শিক্ষার্থীর নাম</th>
                  <th className="p-4">সুরা / পারা</th>
                  <th className="p-4 text-center">মাখরাজ স্কোর (১-৫)</th>
                  <th className="p-4 text-center">সিফাত স্কোর (১-৫)</th>
                  <th className="p-4 text-center">তারতীল মান</th>
                  <th className="p-4">উস্তাদের মন্তব্য</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {data?.tajweedRecords?.map((t: any) => (
                  <tr key={t.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                    <td className="p-4 font-mono text-xs text-zinc-500">{t.date}</td>
                    <td className="p-4">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">{t.student?.nameBn}</div>
                      <div className="text-xs text-zinc-500">{t.student?.classSession?.nameBn}</div>
                    </td>
                    <td className="p-4 font-medium text-emerald-700 dark:text-emerald-400">{t.surahOrPara || "—"}</td>
                    <td className="p-4 text-center font-bold text-zinc-800 dark:text-zinc-200">
                      ⭐ {toBengaliNumber(t.makhrajScore)}/৫
                    </td>
                    <td className="p-4 text-center font-bold text-zinc-800 dark:text-zinc-200">
                      ⭐ {toBengaliNumber(t.sifatScore)}/৫
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                        {t.tartilQuality === "MUMTAZ" ? "মুমতাজ (চমৎকার)" : "মধ্যম"}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-zinc-600 dark:text-zinc-400">{t.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add Tajweed Record */}
      {showTajweedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="bg-emerald-900 text-white p-4 font-bold text-base flex items-center justify-between">
              <span>তাজবীদ মূল্যায়ন এন্ট্রি</span>
              <button onClick={() => setShowTajweedModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveTajweed} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block font-semibold mb-1">শিক্ষার্থী*</label>
                <select
                  required
                  value={tajweedForm.studentId}
                  onChange={(e) => setTajweedForm({ ...tajweedForm, studentId: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                >
                  {data?.students?.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.nameBn} (রোল: {s.studentId})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">সুরা বা পারা</label>
                <input
                  type="text"
                  placeholder="যেমন: সুরা আর-রহমান, পারা ৩০"
                  value={tajweedForm.surahOrPara}
                  onChange={(e) => setTajweedForm({ ...tajweedForm, surahOrPara: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">মাখরাজ স্কোর (১-৫)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={tajweedForm.makhrajScore}
                    onChange={(e) => setTajweedForm({ ...tajweedForm, makhrajScore: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">সিফাত স্কোর (১-৫)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={tajweedForm.sifatScore}
                    onChange={(e) => setTajweedForm({ ...tajweedForm, sifatScore: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-bold text-center"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">তারতীল কোয়ালিটি</label>
                <select
                  value={tajweedForm.tartilQuality}
                  onChange={(e) => setTajweedForm({ ...tajweedForm, tartilQuality: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                >
                  <option value="MUMTAZ">মুমতাজ (অনবদ্য)</option>
                  <option value="JAYYID_JIDDAN">জায়্যিদ জিদ্দান (খুব ভালো)</option>
                  <option value="JAYYID">জায়্যিদ (সন্তোষজনক)</option>
                  <option value="MAKBUL">মাকবুল (পরিশ্রম প্রয়োজন)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">উস্তাদের পরামর্শ</label>
                <input
                  type="text"
                  placeholder="যেমন: গুন্নাহ ও মদ্দে আসলি আরও স্পষ্টভাবে আদায় করতে হবে"
                  value={tajweedForm.notes}
                  onChange={(e) => setTajweedForm({ ...tajweedForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                />
              </div>
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowTajweedModal(false)}
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
