"use client";

import React, { useEffect, useState } from "react";
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  PlusCircle,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toBengaliNumber } from "@/lib/formatters";

const DAYS_BN: Record<string, string> = {
  SATURDAY: "শনিবার",
  SUNDAY: "রবিবার",
  MONDAY: "সোমবার",
  TUESDAY: "মঙ্গলবার",
  WEDNESDAY: "বুধবার",
  THURSDAY: "বৃহস্পতিবার",
};

export default function AcademicPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"SUBJECTS" | "ROUTINE">("SUBJECTS");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showRoutineModal, setShowRoutineModal] = useState(false);

  // Forms
  const [subjectForm, setSubjectForm] = useState({
    nameBn: "",
    nameEn: "",
    code: "",
    classId: "",
    teacherId: "",
    totalMarks: 100,
    passMarks: 40,
  });

  const [routineForm, setRoutineForm] = useState({
    classId: "",
    subjectId: "",
    teacherId: "",
    dayOfWeek: "SATURDAY",
    periodNumber: 1,
    startTime: "০৮:০০ AM",
    endTime: "০৮:৪৫ AM",
    roomNo: "১০১",
  });

  const loadData = () => {
    setLoading(true);
    fetch(`/api/academic?classId=${selectedClass}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setData(res);
          if (res.classes?.length > 0 && !subjectForm.classId) {
            setSubjectForm((prev) => ({ ...prev, classId: res.classes[0].id }));
            setRoutineForm((prev) => ({ ...prev, classId: res.classes[0].id }));
          }
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [selectedClass]);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/academic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CREATE_SUBJECT", ...subjectForm }),
    });
    if (res.ok) {
      setShowSubjectModal(false);
      setSubjectForm({
        nameBn: "",
        nameEn: "",
        code: "",
        classId: data?.classes[0]?.id || "",
        teacherId: "",
        totalMarks: 100,
        passMarks: 40,
      });
      loadData();
    }
  };

  const handleCreateRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/academic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CREATE_ROUTINE", ...routineForm }),
    });
    if (res.ok) {
      setShowRoutineModal(false);
      loadData();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900 to-teal-900 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-sm font-medium mb-1">
            <GraduationCap className="w-5 h-5" />
            <span>মডিউল ৩: একাডেমিক ও পাঠ্যক্রম</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">কিতাব ও ক্লাস রুটিন ব্যবস্থাপনা</h1>
          <p className="text-emerald-200/80 text-sm mt-1">
            জামাতভিত্তিক কিতাব বণ্টন, পূর্ণমান ও পিরিয়ডভিত্তিক সাপ্তাহিক ক্লাস সময়সূচি
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSubjectModal(true)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-emerald-950 font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            নতুন কিতাব/বিষয়
          </button>
          <button
            onClick={() => setShowRoutineModal(true)}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg transition-all text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            রুটিন এন্ট্রি
          </button>
        </div>
      </div>

      {/* Filter and Tab Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("SUBJECTS")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === "SUBJECTS"
                ? "bg-emerald-800 text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            কিতাব ও বিষয় তালিকা
          </button>
          <button
            onClick={() => setActiveTab("ROUTINE")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === "ROUTINE"
                ? "bg-emerald-800 text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <Calendar className="w-4 h-4" />
            সাপ্তাহিক ক্লাস রুটিন
          </button>
        </div>

        {/* Class Filter */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-semibold text-zinc-500">জামাত নির্বাচন:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            <option value="ALL">সকল জামাত</option>
            {data?.classes?.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.nameBn} ({c.department.nameBn})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="text-center py-20 text-zinc-400">ডাটা লোড হচ্ছে...</div>
      ) : activeTab === "SUBJECTS" ? (
        /* Subjects Table */
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="font-bold text-base text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              পাঠ্য বিষয় ও কিতাবসমূহ (মোট: {toBengaliNumber(data?.subjects?.length || 0)}টি)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <th className="p-4">কোড</th>
                  <th className="p-4">কিতাব / বিষয়ের নাম</th>
                  <th className="p-4">জামাত / ক্লাস</th>
                  <th className="p-4">নিযুক্ত উস্তাদ</th>
                  <th className="p-4 text-center">পূর্ণমান</th>
                  <th className="p-4 text-center">পাস মার্ক</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {data?.subjects?.map((s: any) => (
                  <tr key={s.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="p-4 font-mono font-medium text-emerald-600 dark:text-emerald-400">
                      {s.code || "—"}
                    </td>
                    <td className="p-4 font-bold text-zinc-900 dark:text-zinc-100">
                      {s.nameBn}
                      {s.nameEn && <span className="block text-xs font-normal text-zinc-500">{s.nameEn}</span>}
                    </td>
                    <td className="p-4 font-medium text-zinc-700 dark:text-zinc-300">
                      {s.classSession?.nameBn}
                    </td>
                    <td className="p-4 text-zinc-600 dark:text-zinc-400">
                      {s.teacher?.name ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md font-medium text-xs">
                          <Users className="w-3 h-3" />
                          {s.teacher.name}
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-xs italic">উস্তাদ নির্ধারিত হয়নি</span>
                      )}
                    </td>
                    <td className="p-4 text-center font-bold text-zinc-800 dark:text-zinc-200">
                      {toBengaliNumber(s.totalMarks)}
                    </td>
                    <td className="p-4 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                      {toBengaliNumber(s.passMarks)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Routine View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(DAYS_BN).map(([dayKey, dayTitle]) => {
            const dayRoutines = data?.routines?.filter((r: any) => r.dayOfWeek === dayKey) || [];
            return (
              <div
                key={dayKey}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col"
              >
                <div className="bg-emerald-900 text-white p-3 px-4 font-bold text-sm flex items-center justify-between">
                  <span>{dayTitle}</span>
                  <span className="text-xs bg-emerald-800 px-2 py-0.5 rounded-full text-emerald-200">
                    {toBengaliNumber(dayRoutines.length)}টি ক্লাস
                  </span>
                </div>
                <div className="p-3 divide-y divide-zinc-100 dark:divide-zinc-800 flex-1 space-y-2">
                  {dayRoutines.length === 0 ? (
                    <div className="py-8 text-center text-xs text-zinc-400">কোনো ক্লাস নির্ধারিত নেই</div>
                  ) : (
                    dayRoutines.map((r: any) => (
                      <div key={r.id} className="pt-2 first:pt-0">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                            পিরিয়ড {toBengaliNumber(r.periodNumber)}
                          </span>
                          <span className="text-zinc-500 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-500" />
                            {r.startTime} - {r.endTime}
                          </span>
                        </div>
                        <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{r.subject?.nameBn}</div>
                        <div className="flex items-center justify-between text-xs text-zinc-500 mt-1">
                          <span>জামাত: {r.classSession?.nameBn}</span>
                          <span>রুম: {r.roomNo || "—"}</span>
                        </div>
                        {r.teacher && (
                          <div className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">
                            উস্তাদ: {r.teacher.name}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add Subject */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="bg-emerald-900 text-white p-4 font-bold text-lg flex items-center justify-between">
              <span>নতুন কিতাব / বিষয় যোগ করুন</span>
              <button onClick={() => setShowSubjectModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateSubject} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block font-semibold mb-1">বিষয়ের নাম (বাংলা)*</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মিজানুস সরফ, কুরআন মাজীদ"
                  value={subjectForm.nameBn}
                  onChange={(e) => setSubjectForm({ ...subjectForm, nameBn: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">বিষয় কোড</label>
                  <input
                    type="text"
                    placeholder="e.g. QRN-101"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">জামাত / ক্লাস*</label>
                  <select
                    value={subjectForm.classId}
                    onChange={(e) => setSubjectForm({ ...subjectForm, classId: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                  >
                    {data?.classes?.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.nameBn}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">পূর্ণমান (Total Marks)</label>
                  <input
                    type="number"
                    value={subjectForm.totalMarks}
                    onChange={(e) => setSubjectForm({ ...subjectForm, totalMarks: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">পাস মার্ক</label>
                  <input
                    type="number"
                    value={subjectForm.passMarks}
                    onChange={(e) => setSubjectForm({ ...subjectForm, passMarks: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">নিযুক্ত উস্তাদ</label>
                <select
                  value={subjectForm.teacherId}
                  onChange={(e) => setSubjectForm({ ...subjectForm, teacherId: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                >
                  <option value="">নির্বাচন করুন (ঐচ্ছিক)</option>
                  {data?.teachers?.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
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

      {/* Modal: Add Routine */}
      {showRoutineModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="bg-emerald-900 text-white p-4 font-bold text-lg flex items-center justify-between">
              <span>নতুন ক্লাস রুটিন এন্ট্রি</span>
              <button onClick={() => setShowRoutineModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateRoutine} className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">বার (দিন)*</label>
                  <select
                    value={routineForm.dayOfWeek}
                    onChange={(e) => setRoutineForm({ ...routineForm, dayOfWeek: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                  >
                    {Object.entries(DAYS_BN).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">পিরিয়ড নম্বর*</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={routineForm.periodNumber}
                    onChange={(e) => setRoutineForm({ ...routineForm, periodNumber: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">শুরুর সময়</label>
                  <input
                    type="text"
                    value={routineForm.startTime}
                    onChange={(e) => setRoutineForm({ ...routineForm, startTime: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">শেষের সময়</label>
                  <input
                    type="text"
                    value={routineForm.endTime}
                    onChange={(e) => setRoutineForm({ ...routineForm, endTime: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">জামাত*</label>
                <select
                  value={routineForm.classId}
                  onChange={(e) => setRoutineForm({ ...routineForm, classId: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                >
                  {data?.classes?.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.nameBn}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">বিষয় / কিতাব*</label>
                <select
                  value={routineForm.subjectId}
                  onChange={(e) => setRoutineForm({ ...routineForm, subjectId: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                >
                  <option value="">বিষয় নির্বাচন করুন</option>
                  {data?.subjects?.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.nameBn} ({s.classSession?.nameBn})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">উস্তাদ</label>
                  <select
                    value={routineForm.teacherId}
                    onChange={(e) => setRoutineForm({ ...routineForm, teacherId: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                  >
                    <option value="">উস্তাদ নির্বাচন করুন</option>
                    {data?.teachers?.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">রুম নম্বর</label>
                  <input
                    type="text"
                    value={routineForm.roomNo}
                    onChange={(e) => setRoutineForm({ ...routineForm, roomNo: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                  />
                </div>
              </div>
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowRoutineModal(false)}
                  className="px-4 py-2 text-zinc-500 hover:text-zinc-800 font-medium"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-md"
                >
                  রুটিন যোগ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
