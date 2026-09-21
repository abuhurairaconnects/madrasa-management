"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Phone,
  Home,
  HeartHandshake,
  CheckCircle2,
  X,
  Printer,
  BadgeCheck,
} from "lucide-react";
import { toBengaliNumber, formatTaka } from "@/lib/formatters";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nameBn: "",
    nameEn: "",
    fatherName: "",
    motherName: "",
    guardianPhone: "",
    emergencyPhone: "",
    village: "",
    district: "ঢাকা",
    bloodGroup: "A+",
    birthDate: "",
    admissionDate: new Date().toISOString().split("T")[0],
    isBoarding: true,
    isOrphan: false,
    isEligibleForLillah: false,
    monthlyTuitionFee: 2000,
    monthlyBoardingFee: 3500,
    departmentId: "",
    classId: "",
  });

  const loadData = () => {
    setLoading(true);
    let url = `/api/students?`;
    if (selectedDept !== "ALL") url += `departmentId=${selectedDept}&`;
    if (search) url += `search=${encodeURIComponent(search)}`;

    fetch(url)
      .then((res) => res.json())
      .then((d) => {
        setStudents(d.students || []);
        setDepartments(d.departments || []);
        if (d.departments && d.departments.length > 0 && !formData.departmentId) {
          setFormData((prev) => ({
            ...prev,
            departmentId: d.departments[0].id,
            classId: d.departments[0].classes?.[0]?.id || "",
          }));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [selectedDept]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowAddModal(false);
        loadData();
        alert("নতুন শিক্ষার্থী সফলভাবে ভর্তি করা হয়েছে!");
      } else {
        alert("ভর্তি সংরক্ষণে ত্রুটি হয়েছে।");
      }
    } catch (error) {
      console.error(error);
      alert("সার্ভার ত্রুটি।");
    }
  };

  // Selected department classes for the modal dropdown
  const currentDeptClasses =
    departments.find((d) => d.id === formData.departmentId)?.classes || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            শিক্ষার্থী ও ভর্তি ব্যবস্থাপনা
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            মোট সক্রিয় শিক্ষার্থী: <b>{toBengaliNumber(students.length)} জন</b>
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/20 transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          নতুন ছাত্র ভর্তি ফরম
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="নাম, রোল বা মোবাইল নম্বর দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:outline-emerald-600"
          />
        </form>

        {/* Department Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-zinc-400 whitespace-nowrap flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> বিভাগ:
          </span>
          <button
            onClick={() => setSelectedDept("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              selectedDept === "ALL"
                ? "bg-emerald-700 text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            সকল বিভাগ
          </button>
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setSelectedDept(dept.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedDept === dept.id
                  ? "bg-emerald-700 text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {dept.nameBn}
            </button>
          ))}
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-500 text-sm">তথ্য লোড হচ্ছে...</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-xs">
            কোনো শিক্ষার্থী পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 border-b border-zinc-200 dark:border-zinc-800 font-bold">
                <tr>
                  <th className="py-3 px-4">আইডি / রোল</th>
                  <th className="py-3 px-4">শিক্ষার্থীর নাম</th>
                  <th className="py-3 px-4">পিতার নাম ও ঠিকানা</th>
                  <th className="py-3 px-4">বিভাগ ও শ্রেণি</th>
                  <th className="py-3 px-4">আবাসিক/লিল্লাহ</th>
                  <th className="py-3 px-4">মাসিক ফি</th>
                  <th className="py-3 px-4 text-right">কার্যক্রম</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {students.map((std) => (
                  <tr
                    key={std.id}
                    className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800 dark:text-emerald-400">
                      {toBengaliNumber(std.studentId)}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-zinc-900 dark:text-zinc-100">
                        {std.nameBn}
                      </p>
                      <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" /> {toBengaliNumber(std.guardianPhone)}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-zinc-700 dark:text-zinc-300">{std.fatherName}</p>
                      <p className="text-[10px] text-zinc-400">
                        {std.district ? `${std.district}, ` : ""}
                        {std.village || ""}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {std.classSession?.nameBn}
                      </span>
                      <p className="text-[10px] text-zinc-400">{std.department?.nameBn}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium w-max ${
                            std.isBoarding
                              ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                          }`}
                        >
                          <Home className="w-2.5 h-2.5" />
                          {std.isBoarding ? "আবাসিক" : "অনাবাসিক"}
                        </span>
                        {std.isEligibleForLillah && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium w-max bg-amber-50 text-amber-700 border border-amber-200">
                            <HeartHandshake className="w-2.5 h-2.5" />
                            লিল্লাহ ফ্রি
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-zinc-800 dark:text-zinc-200">
                      {formatTaka(std.monthlyTuitionFee + std.monthlyBoardingFee)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedStudent(std)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-semibold border border-emerald-200 dark:border-emerald-800 transition cursor-pointer"
                      >
                        প্রোফাইল
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Student Admission Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  নতুন শিক্ষার্থী ভর্তি ফরম
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">মাদ্রাসার অফিসিয়াল রেজিস্টারে ছাত্রের তথ্য যুক্ত করুন</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                    শিক্ষার্থীর পূর্ণ নাম (বাংলা) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameBn}
                    onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                    placeholder="উদা: মোহাম্মদ মুজাহিদ ইসলাম"
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                    শিক্ষার্থীর নাম (ইংরেজি)
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder="Ex: Mohammad Mujahid Islam"
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                    পিতার নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    placeholder="পিতার নাম লিখুন"
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                    অভিভাবকের মোবাইল নম্বর *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.guardianPhone}
                    onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                    placeholder="০১৭xxxxxxxx"
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                    বিভাগ নির্বাচন করুন *
                  </label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => {
                      const deptId = e.target.value;
                      const dept = departments.find((d) => d.id === deptId);
                      setFormData({
                        ...formData,
                        departmentId: deptId,
                        classId: dept?.classes?.[0]?.id || "",
                      });
                    }}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nameBn}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                    জামাত / শ্রেণি *
                  </label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-500"
                  >
                    {currentDeptClasses.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.nameBn} (ফি: {formatTaka(c.monthlyFee)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Boarding and Lillah options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/60">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isBoarding}
                    onChange={(e) =>
                      setFormData({ ...formData, isBoarding: e.target.checked })
                    }
                    className="rounded text-emerald-600 w-4 h-4"
                  />
                  <span className="font-semibold text-emerald-950 dark:text-emerald-200">আবাসিক ছাত্র (বোর্ডিং)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isOrphan}
                    onChange={(e) =>
                      setFormData({ ...formData, isOrphan: e.target.checked })
                    }
                    className="rounded text-emerald-600 w-4 h-4"
                  />
                  <span className="font-semibold text-emerald-950 dark:text-emerald-200">এতিম ছাত্র</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isEligibleForLillah}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isEligibleForLillah: e.target.checked,
                        monthlyTuitionFee: e.target.checked ? 0 : 2000,
                        monthlyBoardingFee: e.target.checked ? 0 : 3500,
                      })
                    }
                    className="rounded text-emerald-600 w-4 h-4"
                  />
                  <span className="font-semibold text-emerald-950 dark:text-emerald-200">লিল্লাহ ফান্ড সুবিধাভোগী</span>
                </label>
              </div>

              {/* Fee Settings */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                    মাসিক সাধারণ বেতন (টাকা)
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyTuitionFee}
                    onChange={(e) =>
                      setFormData({ ...formData, monthlyTuitionFee: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                    মাসিক বোর্ডিং/খাবার ফি (টাকা)
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyBoardingFee}
                    onChange={(e) =>
                      setFormData({ ...formData, monthlyBoardingFee: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md transition"
                >
                  ভর্তি সম্পন্ন করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Profile Card Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-zinc-200 dark:border-zinc-800">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                  {selectedStudent.department?.nameBn}
                </span>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                  {selectedStudent.nameBn}
                </h3>
                <p className="text-xs text-zinc-500 font-mono">
                  আইডি: {toBengaliNumber(selectedStudent.studentId)}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <div className="flex justify-between">
                <span className="text-zinc-500">জামাত/শ্রেণি:</span>
                <b className="text-zinc-800 dark:text-zinc-200">{selectedStudent.classSession?.nameBn}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">পিতার নাম:</span>
                <span className="text-zinc-800 dark:text-zinc-200 font-medium">{selectedStudent.fatherName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">অভিভাবক ফোন:</span>
                <b className="text-emerald-800 dark:text-emerald-400 font-mono">
                  {toBengaliNumber(selectedStudent.guardianPhone)}
                </b>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">আবাসিক অবস্থা:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {selectedStudent.isBoarding ? "আবাসিক (বোর্ডিং)" : "অনাবাসিক"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">লিল্লাহ যাকাত ফান্ড:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {selectedStudent.isEligibleForLillah ? "হ্যাঁ (১০০% ফ্রি)" : "না (পেইড)"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">মাসিক প্রদেয় ফি:</span>
                <b className="text-zinc-900 dark:text-zinc-100 font-mono">
                  {formatTaka(
                    selectedStudent.monthlyTuitionFee + selectedStudent.monthlyBoardingFee
                  )}
                </b>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800 transition"
              >
                ঠিক আছে
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
