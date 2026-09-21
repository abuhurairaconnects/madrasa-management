"use client";

import React, { useEffect, useState } from "react";
import {
  CalendarCheck,
  Calendar,
  Save,
  Check,
  X,
  Clock,
  Send,
  Users,
} from "lucide-react";
import { toBengaliNumber } from "@/lib/formatters";

export default function AttendancePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: string; remark: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadAttendance = () => {
    setLoading(true);
    let url = `/api/attendance?date=${date}`;
    if (selectedClassId) url += `&classId=${selectedClassId}`;

    fetch(url)
      .then((res) => res.json())
      .then((d) => {
        setClasses(d.classes || []);
        const activeId = d.activeClassId || (d.classes?.[0]?.id ?? "");
        setSelectedClassId(activeId);
        setStudents(d.students || []);

        // Build attendance state map
        const initialMap: Record<string, { status: string; remark: string }> = {};
        (d.students || []).forEach((std: any) => {
          const rec = std.attendances?.[0];
          initialMap[std.id] = {
            status: rec?.status || "PRESENT",
            remark: rec?.remark || "",
          };
        });
        setAttendanceMap(initialMap);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAttendance();
  }, [date, selectedClassId]);

  const setStatus = (studentId: string, status: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const records = students.map((std) => ({
        studentId: std.id,
        status: attendanceMap[std.id]?.status || "PRESENT",
        remark: attendanceMap[std.id]?.remark || "",
      }));

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          classId: selectedClassId,
          records,
        }),
      });

      if (res.ok) {
        alert("আজকের হাজিরা সফলভাবে সংরক্ষিত হয়েছে!");
        loadAttendance();
      } else {
        alert("হাজিরা সংরক্ষণে ত্রুটি হয়েছে।");
      }
    } catch (err) {
      console.error(err);
      alert("সার্ভার ত্রুটি।");
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendanceMap).filter((a) => a.status === "PRESENT").length;
  const absentCount = Object.values(attendanceMap).filter((a) => a.status === "ABSENT").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-emerald-600" />
            শিক্ষার্থী ও উস্তাদদের দৈনিক ডিজিটাল হাজিরা
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            এক ক্লিকে উপস্থিতি নিশ্চিতকরণ ও অনুপস্থিত ছাত্রদের অভিভাবকদের এসএমএস প্রদান
          </p>
        </div>

        <button
          onClick={handleSaveAttendance}
          disabled={saving || students.length === 0}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/20 transition cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {saving ? "সংরক্ষণ হচ্ছে..." : "হাজিরা সংরক্ষণ করুন"}
        </button>
      </div>

      {/* Selectors & Stats Ribbon */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <label className="block text-[11px] text-zinc-600 dark:text-zinc-300 font-bold mb-1">
              তারিখ নির্বাচন:
            </label>
            <div className="flex items-center gap-2 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
              <Calendar className="w-4 h-4 text-zinc-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-xs bg-transparent focus:outline-hidden font-mono text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-zinc-600 dark:text-zinc-300 font-bold mb-1">
              জামাত / শ্রেণি:
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="text-xs p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameBn} ({c.department?.nameBn})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Present / Absent Counters */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            উপস্থিত: {toBengaliNumber(presentCount)} জন
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-bold">
            অনুপস্থিত: {toBengaliNumber(absentCount)} জন
          </div>
        </div>
      </div>

      {/* Attendance Sheet Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-500 text-sm">হাজিরা লোড হচ্ছে...</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-xs">
            এই জামাতে কোনো সক্রিয় শিক্ষার্থী পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 border-b border-zinc-200 dark:border-zinc-800 font-bold">
                <tr>
                  <th className="py-3 px-4">রোল / আইডি</th>
                  <th className="py-3 px-4">শিক্ষার্থীর নাম</th>
                  <th className="py-3 px-4">অভিভাবক ফোন</th>
                  <th className="py-3 px-4 text-center">উপস্থিতি স্ট্যাটাস</th>
                  <th className="py-3 px-4">মন্তব্য / কারণ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {students.map((std) => {
                  const currentStatus = attendanceMap[std.id]?.status || "PRESENT";

                  return (
                    <tr
                      key={std.id}
                      className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                        {toBengaliNumber(std.studentId)}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-zinc-900 dark:text-zinc-100">
                          {std.nameBn}
                        </p>
                        <p className="text-[10px] text-zinc-400">পিতা: {std.fatherName}</p>
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-600">
                        {toBengaliNumber(std.guardianPhone)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setStatus(std.id, "PRESENT")}
                            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                              currentStatus === "PRESENT"
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                            }`}
                          >
                            উপস্থিত
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatus(std.id, "ABSENT")}
                            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                              currentStatus === "ABSENT"
                                ? "bg-red-600 text-white shadow-xs"
                                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                            }`}
                          >
                            অনুপস্থিত
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatus(std.id, "LEAVE")}
                            className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                              currentStatus === "LEAVE"
                                ? "bg-blue-600 text-white shadow-xs"
                                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                            }`}
                          >
                            ছুটি
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={attendanceMap[std.id]?.remark || ""}
                          onChange={(e) =>
                            setAttendanceMap((prev) => ({
                              ...prev,
                              [std.id]: {
                                ...prev[std.id],
                                remark: e.target.value,
                              },
                            }))
                          }
                          placeholder="কারণ (যদি থাকে)..."
                          className="w-full p-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
