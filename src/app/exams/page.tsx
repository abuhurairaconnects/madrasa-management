"use client";

import React, { useEffect, useState } from "react";
import {
  FileSpreadsheet,
  Award,
  PlusCircle,
  Printer,
  Search,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  ChevronRight,
} from "lucide-react";
import { toBengaliNumber } from "@/lib/formatters";

const GRADE_MAP: Record<string, { bn: string; color: string; bg: string }> = {
  MUMTAZ: { bn: "মুমতাজ (A+)", color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300" },
  JAYYID_JIDDAN: { bn: "জায়্যিদ জিদ্দান (A)", color: "text-teal-700 dark:text-teal-300", bg: "bg-teal-50 dark:bg-teal-950/60 border-teal-300" },
  JAYYID: { bn: "জায়্যিদ (B)", color: "text-blue-700 dark:text-blue-300", bg: "bg-blue-50 dark:bg-blue-950/60 border-blue-300" },
  MAKBUL: { bn: "মাকবুল (C)", color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-50 dark:bg-amber-950/60 border-amber-300" },
  RASIB: { bn: "রাসিব (Fail)", color: "text-rose-700 dark:text-rose-300", bg: "bg-rose-50 dark:bg-rose-950/60 border-rose-300" },
};

export default function ExamsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("ALL");
  const [showNewExamModal, setShowNewExamModal] = useState(false);
  const [markModalStudent, setMarkModalStudent] = useState<any | null>(null);
  const [reportCardStudent, setReportCardStudent] = useState<any | null>(null);

  // Forms
  const [examForm, setExamForm] = useState({
    titleBn: "",
    titleEn: "",
    term: "FIRST_TERM",
    year: 2026,
    startDate: "2026-04-15",
    endDate: "2026-04-25",
  });

  const [markInput, setMarkInput] = useState({
    subjectId: "",
    writtenMarks: 70,
    vivaMarks: 20,
    remarks: "",
  });

  const loadData = () => {
    setLoading(true);
    fetch(`/api/exams?examId=${selectedExamId}&classId=${selectedClassId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setData(res);
          if (!selectedExamId && res.exams?.length > 0) {
            setSelectedExamId(res.exams[0].id);
          }
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [selectedExamId, selectedClassId]);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CREATE_EXAM", ...examForm }),
    });
    if (res.ok) {
      setShowNewExamModal(false);
      loadData();
    }
  };

  const handleSaveMark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!markModalStudent || !markInput.subjectId) return;

    const res = await fetch("/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "SAVE_MARK",
        examId: selectedExamId,
        studentId: markModalStudent.id,
        ...markInput,
      }),
    });
    if (res.ok) {
      setMarkModalStudent(null);
      loadData();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-sm font-medium mb-1">
            <Award className="w-5 h-5 text-amber-400" />
            <span>মডিউল ৩: পরীক্ষা ও ফলাফল ব্যবস্থাপনা</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">পরীক্ষা ও প্রগ্রেস রিপোর্ট কার্ড</h1>
          <p className="text-emerald-200/80 text-sm mt-1">
            সাময়িক ও বার্ষিক পরীক্ষার নম্বর এন্ট্রি, ইসলামিক গ্রেডিং ও এক ক্লিকে মার্কশিট জেনারেশন
          </p>
        </div>
        <button
          onClick={() => setShowNewExamModal(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-emerald-950 font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          নতুন পরীক্ষা তৈরি
        </button>
      </div>

      {/* Selectors Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-500">পরীক্ষা:</span>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-zinc-800 dark:text-zinc-200"
            >
              {data?.exams?.map((e: any) => (
                <option key={e.id} value={e.id}>
                  {e.titleBn} ({toBengaliNumber(e.year)})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-500">জামাত:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-200"
            >
              <option value="ALL">সকল জামাত</option>
              {data?.classes?.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.nameBn}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs font-medium text-zinc-500">
          মোট পরীক্ষার্থী: <span className="font-bold text-emerald-700 dark:text-emerald-400">{toBengaliNumber(data?.students?.length || 0)}</span> জন
        </div>
      </div>

      {/* Tabulation Table */}
      {loading ? (
        <div className="text-center py-20 text-zinc-400">পরীক্ষার ফলাফল লোড হচ্ছে...</div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="font-bold text-base text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              {data?.selectedExam?.titleBn || "পরীক্ষার ফলাফল শিট"}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800 text-xs uppercase">
                  <th className="p-4">রোল / আইডি</th>
                  <th className="p-4">শিক্ষার্থীর নাম</th>
                  <th className="p-4">জামাত</th>
                  <th className="p-4">প্রাপ্ত নম্বর ও বিষয়সমূহ</th>
                  <th className="p-4 text-center">মোট নম্বর</th>
                  <th className="p-4 text-center">সর্বশেষ গ্রেড</th>
                  <th className="p-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {data?.students?.map((s: any) => {
                  const marks = s.examMarks || [];
                  const total = marks.reduce((acc: number, m: any) => acc + (m.totalMarks || 0), 0);
                  const avg = marks.length > 0 ? total / marks.length : 0;
                  const overallGrade =
                    avg >= 80
                      ? "MUMTAZ"
                      : avg >= 65
                      ? "JAYYID_JIDDAN"
                      : avg >= 50
                      ? "JAYYID"
                      : avg >= 40
                      ? "MAKBUL"
                      : marks.length > 0
                      ? "RASIB"
                      : "—";

                  const gradeInfo = GRADE_MAP[overallGrade] || {
                    bn: "অপেক্ষমাণ",
                    color: "text-zinc-400",
                    bg: "bg-zinc-100 dark:bg-zinc-800 border-zinc-300",
                  };

                  return (
                    <tr key={s.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {s.studentId}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100">{s.nameBn}</div>
                        <div className="text-xs text-zinc-500">পিতা: {s.fatherName}</div>
                      </td>
                      <td className="p-4 font-medium text-zinc-700 dark:text-zinc-300">
                        {s.classSession?.nameBn}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1.5 max-w-md">
                          {marks.map((m: any) => (
                            <span
                              key={m.id}
                              className="text-[11px] bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded-md"
                              title={`${m.subject?.nameBn}: লিখিত ${m.writtenMarks}, মৌখিক ${m.vivaMarks}`}
                            >
                              <span className="font-medium">{m.subject?.nameBn}:</span>{" "}
                              <strong className="text-emerald-600 dark:text-emerald-400">
                                {toBengaliNumber(m.totalMarks)}
                              </strong>
                            </span>
                          ))}
                          {marks.length === 0 && (
                            <span className="text-xs text-zinc-400 italic">কোনো নম্বর এন্ট্রি নেই</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center font-bold text-base text-zinc-900 dark:text-zinc-100">
                        {toBengaliNumber(total)}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${gradeInfo.bg} ${gradeInfo.color}`}
                        >
                          {gradeInfo.bn}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setMarkModalStudent(s);
                              if (s.classSession?.subjects?.length > 0) {
                                setMarkInput((prev) => ({
                                  ...prev,
                                  subjectId: s.classSession.subjects[0].id,
                                }));
                              }
                            }}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 dark:text-emerald-300 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-emerald-300 transition-all"
                          >
                            + নম্বর এন্ট্রি
                          </button>
                          <button
                            onClick={() => setReportCardStudent({ ...s, totalMarks: total, avg, overallGrade })}
                            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 flex items-center gap-1"
                          >
                            <Printer className="w-3 h-3" />
                            মার্কশিট
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: New Exam */}
      {showNewExamModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="bg-emerald-900 text-white p-4 font-bold text-lg flex items-center justify-between">
              <span>নতুন পরীক্ষা তৈরি করুন</span>
              <button onClick={() => setShowNewExamModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateExam} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block font-semibold mb-1">পরীক্ষার নাম (বাংলা)*</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ১ম সাময়িক পরীক্ষা ২০২৬, বার্ষিক পরীক্ষা"
                  value={examForm.titleBn}
                  onChange={(e) => setExamForm({ ...examForm, titleBn: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">টার্ম / ধরন</label>
                  <select
                    value={examForm.term}
                    onChange={(e) => setExamForm({ ...examForm, term: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                  >
                    <option value="FIRST_TERM">প্রথম সাময়িক</option>
                    <option value="MID_TERM">অর্ধ-বার্ষিক</option>
                    <option value="ANNUAL">বার্ষিক পরীক্ষা</option>
                    <option value="WEEKLY">সাপ্তাহিক মূল্যায়ন</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">শিক্ষাবর্ষ</label>
                  <input
                    type="number"
                    value={examForm.year}
                    onChange={(e) => setExamForm({ ...examForm, year: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">শুরুর তারিখ</label>
                  <input
                    type="date"
                    value={examForm.startDate}
                    onChange={(e) => setExamForm({ ...examForm, startDate: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">শেষের তারিখ</label>
                  <input
                    type="date"
                    value={examForm.endDate}
                    onChange={(e) => setExamForm({ ...examForm, endDate: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                  />
                </div>
              </div>
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowNewExamModal(false)}
                  className="px-4 py-2 text-zinc-500 hover:text-zinc-800 font-medium"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-md"
                >
                  পরীক্ষা সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Enter Marks */}
      {markModalStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="bg-emerald-900 text-white p-4 font-bold text-base flex items-center justify-between">
              <div>
                <div>নম্বর এন্ট্রি: {markModalStudent.nameBn}</div>
                <div className="text-xs text-emerald-300 font-normal">
                  রোল: {markModalStudent.studentId} | জামাত: {markModalStudent.classSession?.nameBn}
                </div>
              </div>
              <button onClick={() => setMarkModalStudent(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveMark} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block font-semibold mb-1">বিষয় নির্বাচন করুন*</label>
                <select
                  required
                  value={markInput.subjectId}
                  onChange={(e) => setMarkInput({ ...markInput, subjectId: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                >
                  {markModalStudent.classSession?.subjects?.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.nameBn} (পূর্ণমান: {s.totalMarks})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">লিখিত নম্বর</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={markInput.writtenMarks}
                    onChange={(e) => setMarkInput({ ...markInput, writtenMarks: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">মৌখিক / তাকরীর</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={markInput.vivaMarks}
                    onChange={(e) => setMarkInput({ ...markInput, vivaMarks: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-bold text-center"
                  />
                </div>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl flex items-center justify-between text-xs">
                <span>মোট প্রাপ্ত নম্বর:</span>
                <strong className="text-emerald-700 dark:text-emerald-300 text-base">
                  {toBengaliNumber(markInput.writtenMarks + markInput.vivaMarks)}
                </strong>
              </div>
              <div>
                <label className="block font-semibold mb-1">উস্তাদের মন্তব্য</label>
                <input
                  type="text"
                  placeholder="যেমন: মাশাআল্লাহ চমৎকার, হাতের লেখা সুন্দর করতে হবে"
                  value={markInput.remarks}
                  onChange={(e) => setMarkInput({ ...markInput, remarks: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                />
              </div>
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setMarkModalStudent(null)}
                  className="px-4 py-2 text-zinc-500 hover:text-zinc-800 font-medium"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-md"
                >
                  নম্বর সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Printable Report Card (মার্কশিট) */}
      {reportCardStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-zinc-300 overflow-hidden print:m-0 print:border-none print:shadow-none">
            {/* Header */}
            <div className="p-6 border-b border-zinc-200 text-center relative bg-emerald-50">
              <button
                onClick={() => setReportCardStudent(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-800 print:hidden text-lg"
              >
                ✕
              </button>
              <h2 className="text-xl font-black text-emerald-950">মাদ্রাসা মার্কশিট ও ফলাফল বিবরণী</h2>
              <p className="text-xs text-zinc-600 font-arabic mt-0.5">كشف الدرجات وتقرير النتيجة</p>
              <p className="text-sm font-bold text-zinc-800 mt-1">
                {data?.selectedExam?.titleBn || "সাময়িক পরীক্ষা"}
              </p>
            </div>

            {/* Student Info */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                <div>
                  <span className="text-zinc-500">শিক্ষার্থীর নাম:</span>{" "}
                  <strong className="text-zinc-900 text-sm">{reportCardStudent.nameBn}</strong>
                </div>
                <div>
                  <span className="text-zinc-500">আইডি / রোল:</span>{" "}
                  <strong className="font-mono text-emerald-800 text-sm">{reportCardStudent.studentId}</strong>
                </div>
                <div>
                  <span className="text-zinc-500">পিতার নাম:</span>{" "}
                  <strong className="text-zinc-800">{reportCardStudent.fatherName}</strong>
                </div>
                <div>
                  <span className="text-zinc-500">জামাত / ক্লাস:</span>{" "}
                  <strong className="text-zinc-800">{reportCardStudent.classSession?.nameBn}</strong>
                </div>
              </div>

              {/* Subject Breakdown Table */}
              <table className="w-full text-left text-xs border-collapse border border-zinc-300">
                <thead>
                  <tr className="bg-zinc-100 text-zinc-700 font-bold border-b border-zinc-300">
                    <th className="p-2 border-r border-zinc-300">ক্রম</th>
                    <th className="p-2 border-r border-zinc-300">বিষয় / কিতাবের নাম</th>
                    <th className="p-2 text-center border-r border-zinc-300">লিখিত</th>
                    <th className="p-2 text-center border-r border-zinc-300">মৌখিক</th>
                    <th className="p-2 text-center border-r border-zinc-300">মোট প্রাপ্ত</th>
                    <th className="p-2 text-center">গ্রেড</th>
                  </tr>
                </thead>
                <tbody>
                  {reportCardStudent.examMarks?.map((m: any, idx: number) => (
                    <tr key={m.id} className="border-b border-zinc-200">
                      <td className="p-2 text-center border-r border-zinc-300 font-mono">
                        {toBengaliNumber(idx + 1)}
                      </td>
                      <td className="p-2 font-semibold border-r border-zinc-300">{m.subject?.nameBn}</td>
                      <td className="p-2 text-center border-r border-zinc-300">
                        {toBengaliNumber(m.writtenMarks)}
                      </td>
                      <td className="p-2 text-center border-r border-zinc-300">
                        {toBengaliNumber(m.vivaMarks)}
                      </td>
                      <td className="p-2 text-center font-bold text-emerald-800 border-r border-zinc-300">
                        {toBengaliNumber(m.totalMarks)}
                      </td>
                      <td className="p-2 text-center font-bold">{m.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary */}
              <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-950">
                <div>সর্বমোট প্রাপ্ত নম্বর: {toBengaliNumber(reportCardStudent.totalMarks)}</div>
                <div>
                  সার্বিক ফলাফল:{" "}
                  <span className="text-emerald-800 text-sm underline">
                    {GRADE_MAP[reportCardStudent.overallGrade]?.bn || "মুমতাজ"}
                  </span>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-8 grid grid-cols-3 gap-4 text-center text-xs text-zinc-500">
                <div className="border-t border-zinc-400 pt-1">শ্রেণি উস্তাদের স্বাক্ষর</div>
                <div className="border-t border-zinc-400 pt-1">নাজেমে তালিমাত</div>
                <div className="border-t border-zinc-400 pt-1">মুহতামিমের সীল ও স্বাক্ষর</div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex justify-end gap-3 print:hidden">
              <button
                onClick={() => setReportCardStudent(null)}
                className="px-4 py-2 text-zinc-600 font-medium"
              >
                বন্ধ করুন
              </button>
              <button
                onClick={() => window.print()}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2 rounded-xl flex items-center gap-2 shadow"
              >
                <Printer className="w-4 h-4" />
                প্রিন্ট করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
