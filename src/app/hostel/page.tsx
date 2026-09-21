"use client";

import React, { useEffect, useState } from "react";
import {
  BedDouble,
  Utensils,
  Home,
  Users,
  CheckCircle2,
  XCircle,
  PlusCircle,
  UserCheck,
  UserMinus,
  Sparkles,
} from "lucide-react";
import { toBengaliNumber } from "@/lib/formatters";

export default function HostelPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ROOMS" | "MEALS">("ROOMS");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedBedForAllocation, setSelectedBedForAllocation] = useState<any | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [guestMealCount, setGuestMealCount] = useState(1);
  const [guestMealNotes, setGuestMealNotes] = useState("মেহমানদের খানা");
  const [showGuestMealModal, setShowGuestMealModal] = useState(false);

  const loadData = () => {
    setLoading(true);
    fetch(`/api/hostel?date=${selectedDate}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setData(res);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBedForAllocation || !selectedStudentId) return;

    const res = await fetch("/api/hostel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "ALLOCATE_BED",
        bedId: selectedBedForAllocation.id,
        studentId: selectedStudentId,
      }),
    });
    if (res.ok) {
      setSelectedBedForAllocation(null);
      setSelectedStudentId("");
      loadData();
    }
  };

  const handleVacate = async (bedId: string) => {
    if (!confirm("আপনি কি নিশ্চিত এই বেড খালি করতে চান?")) return;
    const res = await fetch("/api/hostel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "VACATE_BED",
        bedId,
      }),
    });
    if (res.ok) {
      loadData();
    }
  };

  const handleToggleMeal = async (studentId: string, mealType: string, currentVal: boolean) => {
    await fetch("/api/hostel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "TOGGLE_MEAL",
        studentId,
        date: selectedDate,
        mealType,
        currentVal,
      }),
    });
    loadData();
  };

  const handleAddGuestMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/hostel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "RECORD_GUEST_MEAL",
        date: selectedDate,
        count: guestMealCount,
        notes: guestMealNotes,
      }),
    });
    if (res.ok) {
      setShowGuestMealModal(false);
      loadData();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-sm font-medium mb-1">
            <BedDouble className="w-5 h-5 text-amber-400" />
            <span>মডিউল ৬: আবাসিক হোস্টেল ও মেস ডাইনিং</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">হোস্টেল সিট ও দৈনিক মিল কাউন্টিং</h1>
          <p className="text-emerald-200/80 text-sm mt-1">
            কক্ষ ও বেড বরাদ্দ, আবাসিক ছাত্রদের অবস্থান এবং তিন বেলার খাবার/মেহমান খানা ট্র্যাকিং
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGuestMealModal(true)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-emerald-950 font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all text-sm"
          >
            <Utensils className="w-4 h-4" />
            + মেহমান খানা এন্ট্রি
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="text-xs text-zinc-500 font-semibold">মোট বেড সংখ্যা</div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
            {toBengaliNumber(data?.stats?.totalBeds || 0)}টি
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            বরাদ্দ: {toBengaliNumber(data?.stats?.occupiedBeds || 0)} | খালি: {toBengaliNumber(data?.stats?.freeBeds || 0)}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="text-xs text-zinc-500 font-semibold">সকালের নাস্তা ({selectedDate})</div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
            {toBengaliNumber(data?.stats?.totalBreakfast || 0)} জন
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">আবাসিক খানা</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="text-xs text-zinc-500 font-semibold">দুপুরের খাবার</div>
          <div className="text-2xl font-black text-teal-700 dark:text-teal-400 mt-1">
            {toBengaliNumber(data?.stats?.totalLunch || 0)} জন
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">আবাসিক খানা</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="text-xs text-zinc-500 font-semibold">রাতের খাবার + মেহমান</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {toBengaliNumber((data?.stats?.totalDinner || 0) + (data?.stats?.totalGuest || 0))} খানা
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
            মেহমান খানা: {toBengaliNumber(data?.stats?.totalGuest || 0)}টি
          </div>
        </div>
      </div>

      {/* Navigation and Date Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("ROOMS")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === "ROOMS"
                ? "bg-emerald-800 text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <BedDouble className="w-4 h-4" />
            হোস্টেল রুম ও বেড ম্যাপ
          </button>
          <button
            onClick={() => setActiveTab("MEALS")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === "MEALS"
                ? "bg-emerald-800 text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <Utensils className="w-4 h-4" />
            দৈনিক মিল ডাইনিং শিট
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-zinc-500">তারিখ:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-zinc-800 dark:text-zinc-200"
          />
        </div>
      </div>

      {/* Main Area */}
      {loading ? (
        <div className="text-center py-20 text-zinc-400">হোস্টেল ডাটা লোড হচ্ছে...</div>
      ) : activeTab === "ROOMS" ? (
        /* Rooms & Beds Visual Layout */
        <div className="space-y-6">
          {data?.buildings?.map((bld: any) => (
            <div
              key={bld.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{bld.nameBn}</h2>
                  <span className="text-xs text-zinc-500">({bld.code})</span>
                </div>
                <span className="text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  {toBengaliNumber(bld.rooms?.length || 0)}টি কক্ষ
                </span>
              </div>

              {/* Rooms Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bld.rooms?.map((room: any) => (
                  <div
                    key={room.id}
                    className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 rounded">
                        কক্ষ নং: {room.roomNumber} (তলা {toBengaliNumber(room.floorNumber)})
                      </span>
                      <span className="text-zinc-500">ধারণক্ষমতা: {toBengaliNumber(room.capacity)} সিট</span>
                    </div>

                    {/* Beds */}
                    <div className="space-y-2">
                      {room.beds?.map((bed: any) => (
                        <div
                          key={bed.id}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all ${
                            bed.isOccupied
                              ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 text-emerald-950 dark:text-emerald-200"
                              : "bg-white dark:bg-zinc-800 border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-400"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <BedDouble className={`w-4 h-4 ${bed.isOccupied ? "text-emerald-600" : "text-zinc-400"}`} />
                            <div>
                              <div className="font-bold font-mono">{bed.bedNumber}</div>
                              {bed.student ? (
                                <div className="text-zinc-800 dark:text-zinc-200 font-medium">
                                  {bed.student.nameBn} <span className="text-zinc-500">({bed.student.studentId})</span>
                                </div>
                              ) : (
                                <span className="italic text-[11px]">সিট খালি রয়েছে</span>
                              )}
                            </div>
                          </div>

                          {bed.isOccupied ? (
                            <button
                              onClick={() => handleVacate(bed.id)}
                              className="text-rose-600 hover:text-rose-700 bg-white dark:bg-zinc-800 p-1 rounded-md border border-rose-200 shadow-xs"
                              title="সিট খালি করুন"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedBedForAllocation(bed)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded-md text-[11px] font-bold shadow-xs flex items-center gap-1"
                            >
                              <UserCheck className="w-3 h-3" />
                              বরাদ্দ দিন
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Daily Meal Table */
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
            <span>ক্লিক করে সকাল, দুপুর ও রাতের মিল অন/অফ করুন ({selectedDate})</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">
              মোট আবাসিক ছাত্র: {toBengaliNumber(data?.boardingStudents?.length || 0)} জন
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800 text-xs">
                  <th className="p-4">রোল</th>
                  <th className="p-4">শিক্ষার্থীর নাম</th>
                  <th className="p-4">জামাত</th>
                  <th className="p-4 text-center">সকালের নাস্তা</th>
                  <th className="p-4 text-center">দুপুরের খাবার</th>
                  <th className="p-4 text-center">রাতের খাবার</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {data?.boardingStudents?.map((s: any) => {
                  const m = data?.mealRecords?.find((rec: any) => rec.studentId === s.id) || {
                    breakfast: true,
                    lunch: true,
                    dinner: true,
                  };

                  return (
                    <tr key={s.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                      <td className="p-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {s.studentId}
                      </td>
                      <td className="p-4 font-bold text-zinc-900 dark:text-zinc-100">{s.nameBn}</td>
                      <td className="p-4 text-zinc-600 dark:text-zinc-400">{s.classSession?.nameBn}</td>

                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleMeal(s.id, "breakfast", m.breakfast)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                            m.breakfast
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300"
                              : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 border-zinc-200"
                          }`}
                        >
                          {m.breakfast ? "✓ নাস্তা খেয়েছে" : "বন্ধ"}
                        </button>
                      </td>

                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleMeal(s.id, "lunch", m.lunch)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                            m.lunch
                              ? "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-300"
                              : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 border-zinc-200"
                          }`}
                        >
                          {m.lunch ? "✓ দুপুর খেয়েছে" : "বন্ধ"}
                        </button>
                      </td>

                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleMeal(s.id, "dinner", m.dinner)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                            m.dinner
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300"
                              : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 border-zinc-200"
                          }`}
                        >
                          {m.dinner ? "✓ রাত খেয়েছে" : "বন্ধ"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Bed Allocation */}
      {selectedBedForAllocation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="bg-emerald-900 text-white p-4 font-bold text-base flex items-center justify-between">
              <span>সিট বরাদ্দ দিন: {selectedBedForAllocation.bedNumber}</span>
              <button onClick={() => setSelectedBedForAllocation(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAllocate} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block font-semibold mb-1">আবাসিক শিক্ষার্থী নির্বাচন করুন*</label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                >
                  <option value="">ছাত্র নির্বাচন করুন</option>
                  {data?.boardingStudents?.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.nameBn} (রোল: {s.studentId}, {s.classSession?.nameBn})
                    </option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedBedForAllocation(null)}
                  className="px-4 py-2 text-zinc-500 hover:text-zinc-800 font-medium"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-md"
                >
                  বরাদ্দ নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Guest Meal */}
      {showGuestMealModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="bg-emerald-900 text-white p-4 font-bold text-base flex items-center justify-between">
              <span>মেহমান খানা এন্ট্রি</span>
              <button onClick={() => setShowGuestMealModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddGuestMeal} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block font-semibold mb-1">তারিখ</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">মোট মেহমান সংখ্যা*</label>
                <input
                  type="number"
                  min="1"
                  value={guestMealCount}
                  onChange={(e) => setGuestMealCount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">বিবরণ / উপলক্ষ</label>
                <input
                  type="text"
                  placeholder="যেমন: অভিভাবক মেহমান, কমিটির মেহমানদারি"
                  value={guestMealNotes}
                  onChange={(e) => setGuestMealNotes(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                />
              </div>
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowGuestMealModal(false)}
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
