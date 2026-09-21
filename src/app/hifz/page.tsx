"use client";

import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Award,
  CheckCircle2,
  Calendar,
  Save,
  Clock,
  Sparkles,
  BookMarked,
  User,
  History,
  TrendingUp,
} from "lucide-react";
import {
  toBengaliNumber,
  formatBengaliDate,
  HIFZ_QUALITY_MAP,
} from "@/lib/formatters";

export default function HifzTrackerPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedStudentData, setSelectedStudentData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Daily Entry Form State
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [sabaqPara, setSabaqPara] = useState<number>(1);
  const [sabaqSurah, setSabaqSurah] = useState("");
  const [sabaqPage, setSabaqPage] = useState<number>(1);
  const [sabaqQuality, setSabaqQuality] = useState("MUMTAZ");
  const [sabaqiPages, setSabaqiPages] = useState("");
  const [sabaqiQuality, setSabaqiQuality] = useState("MUMTAZ");
  const [amukhtaParas, setAmukhtaParas] = useState("");
  const [amukhtaQuality, setAmukhtaQuality] = useState("JAYYID_JIDDAN");
  const [totalParasMemorized, setTotalParasMemorized] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [teacherId, setTeacherId] = useState("");

  const loadHifzList = async () => {
    try {
      const res = await fetch("/api/hifz");
      const d = await res.json();
      setStudents(d.students || []);
      setTeachers(d.teachers || []);

      if (d.students && d.students.length > 0 && !selectedStudentId) {
        setSelectedStudentId(d.students[0].id);
        fetchStudentHistory(d.students[0].id);
      }
      if (d.teachers && d.teachers.length > 0 && !teacherId) {
        setTeacherId(d.teachers[0].id);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchStudentHistory = async (stdId: string) => {
    try {
      const res = await fetch(`/api/hifz?studentId=${stdId}`);
      const d = await res.json();
      setSelectedStudentData(d.student);

      // Pre-fill total memorized paras and latest hints
      const latest = d.student?.hifzRecords?.[0];
      if (latest) {
        setTotalParasMemorized(latest.totalParasMemorized);
        setSabaqPara(latest.sabaqPara || 1);
        setSabaqPage((latest.sabaqPage || 1) + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadHifzList();
  }, []);

  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
    fetchStudentHistory(id);
  };

  const handleSaveDailyRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    setSaving(true);
    try {
      const res = await fetch("/api/hifz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudentId,
          date: entryDate,
          sabaqPara,
          sabaqSurah,
          sabaqPage,
          sabaqQuality,
          sabaqiPages,
          sabaqiQuality,
          amukhtaParas,
          amukhtaQuality,
          totalParasMemorized,
          notes,
          teacherId,
        }),
      });

      if (res.ok) {
        alert("আজকের ছবক ও আমুখতা রেকর্ড সফলভাবে সংরক্ষণ করা হয়েছে!");
        fetchStudentHistory(selectedStudentId);
        loadHifzList();
      } else {
        alert("রেকর্ড সংরক্ষণে ব্যর্থ হয়েছে।");
      }
    } catch (error) {
      console.error(error);
      alert("সার্ভার ত্রুটি।");
    } finally {
      setSaving(false);
    }
  };

  const completedPercentage = Math.round(((totalParasMemorized || 0) / 30) * 100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-emerald-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-700/60 border border-amber-400/30 text-amber-200 text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            হিফজুল কুরআন বিভাগ
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            দৈনিক ছবক, সবকি ও আমুখতা ট্র্যাকার
          </h1>
          <p className="text-xs text-amber-200/90 mt-1">
            পবিত্র কুরআন হিফজের নিয়মিত অগ্রগতি পর্যবেক্ষণ ও রেকর্ড খাতা
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/20 backdrop-blur-xs">
          <Award className="w-8 h-8 text-amber-300" />
          <div>
            <p className="text-[11px] text-amber-200">হিফজ শিক্ষার্থী সংখ্যা</p>
            <p className="text-xl font-bold font-mono">
              {toBengaliNumber(students.length)} জন
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Student Selector, Center Daily Form, Right History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Student List Selection (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              হিফজ শিক্ষার্থী নির্বাচন করুন
            </h3>

            <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
              {students.map((std) => {
                const isSelected = std.id === selectedStudentId;
                const latest = std.hifzRecords?.[0];
                const memorized = latest?.totalParasMemorized || 0;
                const percent = Math.round((memorized / 30) * 100);

                return (
                  <button
                    key={std.id}
                    onClick={() => handleSelectStudent(std.id)}
                    className={`w-full text-left p-3 rounded-xl border transition cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 shadow-xs"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 bg-white dark:bg-zinc-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                        {std.nameBn}
                      </span>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {toBengaliNumber(std.studentId)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                      <span>{std.classSession?.nameBn}</span>
                      <span className="font-bold text-amber-600">
                        {toBengaliNumber(memorized)} পারা সমাপ্ত ({toBengaliNumber(percent)}%)
                      </span>
                    </div>

                    {/* Mini Progress */}
                    <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Daily Sabaq Form & 30 Para Visualizer (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Student Header & 30 Para Visualizer */}
          {selectedStudentData && (
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                    {selectedStudentData.classSession?.nameBn}
                  </span>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                    {selectedStudentData.nameBn}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    পিতা: {selectedStudentData.fatherName} | রোল: {toBengaliNumber(selectedStudentData.studentId)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-zinc-500">হিফজ সমাপ্তির শতকরা হার</p>
                  <p className="text-2xl font-black text-amber-600 font-mono">
                    {toBengaliNumber(completedPercentage)}%
                  </p>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    {toBengaliNumber(totalParasMemorized)} / ৩০ পারা সমাপ্ত
                  </p>
                </div>
              </div>

              {/* 30 Para Interactive Visualizer Tiles */}
              <div>
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                  <BookMarked className="w-4 h-4 text-emerald-600" />
                  পবিত্র কুরআনের ৩০ পারা অগ্রগতির মানচিত্র:
                </p>
                <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((paraNum) => {
                    const isDone = paraNum <= totalParasMemorized;
                    const isCurrent = paraNum === totalParasMemorized + 1;

                    return (
                      <button
                        type="button"
                        key={paraNum}
                        onClick={() => setTotalParasMemorized(paraNum)}
                        title={`পারা ${paraNum} ${isDone ? "(মুখস্থ সম্পন্ন)" : isCurrent ? "(চলমান)" : ""}`}
                        className={`p-1.5 sm:p-2 rounded-xl text-center text-xs font-bold transition flex flex-col items-center justify-center cursor-pointer ${
                          isDone
                            ? "bg-emerald-600 text-white shadow-xs"
                            : isCurrent
                            ? "bg-amber-400 text-emerald-950 ring-2 ring-amber-500 animate-pulse"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-zinc-200"
                        }`}
                      >
                        <span className="font-mono text-[11px]">{toBengaliNumber(paraNum)}</span>
                        {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-200 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Daily Sabaq Card Entry Form */}
          <form
            onSubmit={handleSaveDailyRecord}
            className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                দৈনিক ছবক ও আমুখতা কার্ড পূরণ করুন
              </h3>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="text-xs p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-mono"
                />
              </div>
            </div>

            {/* Section 1: Daily Sabaq (দৈনিক ছবক) */}
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  ১. আজকের নতুন ছবক (Daily Sabaq)
                </h4>
                <span className="text-[10px] text-emerald-700 font-medium">নতুন পড়া</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-zinc-800 dark:text-zinc-200 mb-1 font-bold">পারা নম্বর</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={sabaqPara}
                    onChange={(e) => setSabaqPara(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-800 dark:text-zinc-200 mb-1 font-bold">সূরা নাম ও আয়াত</label>
                  <input
                    type="text"
                    value={sabaqSurah}
                    onChange={(e) => setSabaqSurah(e.target.value)}
                    placeholder="উদা: সূরা বাকারাহ (১-২০)"
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-zinc-800 dark:text-zinc-200 mb-1 font-bold">পৃষ্ঠা নম্বর</label>
                  <input
                    type="number"
                    value={sabaqPage}
                    onChange={(e) => setSabaqPage(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-800 dark:text-zinc-200 mb-1 font-bold">পাঠের মান (গ্রেড)</label>
                  <select
                    value={sabaqQuality}
                    onChange={(e) => setSabaqQuality(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold"
                  >
                    <option value="MUMTAZ">মুমতাজ (চমৎকার)</option>
                    <option value="JAYYID_JIDDAN">জায়্যিদ জিদ্দান (খুব ভালো)</option>
                    <option value="JAYYID">জায়্যিদ (ভালো)</option>
                    <option value="MAKBUL">মাকবুল (কাঁচা)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Sabaqi & Amukhta (সবকি ও আমুখতা) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Sabaqi */}
              <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 space-y-3">
                <h4 className="font-bold text-amber-900 dark:text-amber-300">
                  ২. সবকি (পেছনের রিভিশন ১)
                </h4>
                <div>
                  <label className="block text-zinc-800 dark:text-zinc-200 mb-1 font-bold">পৃষ্ঠা / রুব রেঞ্জ</label>
                  <input
                    type="text"
                    value={sabaqiPages}
                    onChange={(e) => setSabaqiPages(e.target.value)}
                    placeholder="উদা: পৃষ্ঠা ১৫ থেকে ২০ (১ রুব)"
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-zinc-800 dark:text-zinc-200 mb-1 font-bold">সবকি মান</label>
                  <select
                    value={sabaqiQuality}
                    onChange={(e) => setSabaqiQuality(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold"
                  >
                    <option value="MUMTAZ">মুমতাজ (চমৎকার)</option>
                    <option value="JAYYID_JIDDAN">জায়্যিদ জিদ্দান (খুব ভালো)</option>
                    <option value="JAYYID">জায়্যিদ (ভালো)</option>
                    <option value="MAKBUL">মাকবুল (কাঁচা)</option>
                  </select>
                </div>
              </div>

              {/* Amukhta / Dor */}
              <div className="p-4 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40 space-y-3">
                <h4 className="font-bold text-teal-900 dark:text-teal-300">
                  ৩. আমুখতা / দোর (পেছনের পারা রিভিশন)
                </h4>
                <div>
                  <label className="block text-zinc-800 dark:text-zinc-200 mb-1 font-bold">কোন কোন পারা শুনাল</label>
                  <input
                    type="text"
                    value={amukhtaParas}
                    onChange={(e) => setAmukhtaParas(e.target.value)}
                    placeholder="উদা: পারা ১ ও ২"
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-zinc-800 dark:text-zinc-200 mb-1 font-bold">আমুখতা মান</label>
                  <select
                    value={amukhtaQuality}
                    onChange={(e) => setAmukhtaQuality(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold"
                  >
                    <option value="MUMTAZ">মুমতাজ (চমৎকার)</option>
                    <option value="JAYYID_JIDDAN">জায়্যিদ জিদ্দান (খুব ভালো)</option>
                    <option value="JAYYID">জায়্যিদ (ভালো)</option>
                    <option value="MAKBUL">মাকবুল (কাঁচা)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Total Completed Paras & Teacher Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-zinc-800 dark:text-zinc-200 font-bold mb-1">
                  সর্বমোট মুখস্থ সম্পন্ন পারা সংখ্যা (১-৩০) *
                </label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={totalParasMemorized}
                  onChange={(e) => setTotalParasMemorized(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-emerald-800 dark:text-emerald-300 font-bold font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-zinc-800 dark:text-zinc-200 font-bold mb-1">
                  পরীক্ষক / হিফজ উস্তাদ
                </label>
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-zinc-800 dark:text-zinc-200 font-bold mb-1 text-xs">
                উস্তাদের মন্তব্য ও মূল্যায়ন
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="যেমন: মাশাআল্লাহ, সুন্দর ও তারতীলের সাথে তিলাওয়াত করেছে..."
                className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs font-medium"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/20 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {saving ? "সংরক্ষণ হচ্ছে..." : "ছবক ও আমুখতা সংরক্ষণ করুন"}
              </button>
            </div>
          </form>

          {/* Past History Table for Selected Student */}
          {selectedStudentData?.hifzRecords && (
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600" />
                বিগত দিনগুলোর ছবক ও আমুখতা লগ ({selectedStudentData.nameBn})
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="py-2.5 px-3">তারিখ</th>
                      <th className="py-2.5 px-3">ছবক (পারা ও পৃষ্ঠা)</th>
                      <th className="py-2.5 px-3">সবকি</th>
                      <th className="py-2.5 px-3">আমুখতা</th>
                      <th className="py-2.5 px-3">মান</th>
                      <th className="py-2.5 px-3">মন্তব্য</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {selectedStudentData.hifzRecords.map((r: any) => {
                      const q = HIFZ_QUALITY_MAP[r.sabaqQuality] || HIFZ_QUALITY_MAP.JAYYID;
                      return (
                        <tr key={r.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition">
                          <td className="py-2.5 px-3 font-mono font-medium text-zinc-600 dark:text-zinc-300">
                            {toBengaliNumber(r.date)}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-zinc-100">
                            পারা {toBengaliNumber(r.sabaqPara)}, পৃ: {toBengaliNumber(r.sabaqPage)}
                            {r.sabaqSurah && (
                              <span className="block text-[10px] text-zinc-500 dark:text-zinc-400 font-normal">
                                {r.sabaqSurah}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-300">{r.sabaqiPages || "-"}</td>
                          <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-300">{r.amukhtaParas || "-"}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${q.bg} ${q.color}`}
                            >
                              {q.label}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-zinc-500 dark:text-zinc-400 max-w-xs truncate">
                            {r.notes || "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
