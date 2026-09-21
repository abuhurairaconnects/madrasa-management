"use client";

import React, { useEffect, useState } from "react";
import { Settings, Building, Save, Shield, CheckCircle2, Phone, Mail } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [institution, setInstitution] = useState({
    nameBn: "",
    nameEn: "",
    arabicName: "",
    address: "",
    phone: "",
    email: "",
    muhtamimName: "",
    establishedYear: "",
    receiptFooter: "",
  });

  const [smsGateway, setSmsGateway] = useState({
    provider: "GREENWEB",
    apiKey: "gw_live_demo_key_98234",
    senderId: "JAMIA_ISLAMIA",
    status: "ACTIVE",
  });

  useEffect(() => {
    fetch("/api/institution")
      .then((res) => res.json())
      .then((d) => {
        if (d.institution) {
          setInstitution({
            nameBn: d.institution.nameBn || "",
            nameEn: d.institution.nameEn || "",
            arabicName: d.institution.arabicName || "",
            address: d.institution.address || "",
            phone: d.institution.phone || "",
            email: d.institution.email || "",
            muhtamimName: d.institution.muhtamimName || "",
            establishedYear: d.institution.establishedYear || "",
            receiptFooter: d.institution.receiptFooter || "",
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/institution", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(institution),
      });

      if (res.ok) {
        alert("মাদ্রাসার তথ্য সফলভাবে হালনাগাদ করা হয়েছে!");
      } else {
        alert("সংরক্ষণে ব্যর্থ হয়েছে।");
      }
    } catch (err) {
      console.error(err);
      alert("সার্ভার ত্রুটি।");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-zinc-500 text-sm">তথ্য লোড হচ্ছে...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-600" />
          মাদ্রাসা প্রোফাইল ও সিস্টেম কনফিগারেশন
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          মানি রিসিট, রিপোর্ট ও ডকুমেন্টে প্রদর্শনের জন্য মাদ্রাসার যাবতীয় তথ্য হালনাগাদ করুন
        </p>
      </div>

      {/* Profile Form */}
      <form
        onSubmit={handleSaveProfile}
        className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-5 text-xs"
      >
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <Building className="w-4 h-4 text-emerald-600" />
          মাদ্রাসার অফিশিয়াল পরিচয় ও যোগাযোগের তথ্য
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-zinc-800 dark:text-zinc-200 font-bold mb-1.5">
              মাদ্রাসার নাম (বাংলায়) *
            </label>
            <input
              type="text"
              required
              value={institution.nameBn}
              onChange={(e) => setInstitution({ ...institution, nameBn: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-zinc-800 dark:text-zinc-200 font-bold mb-1.5">
              মাদ্রাসার নাম (ইংরেজি) *
            </label>
            <input
              type="text"
              required
              value={institution.nameEn}
              onChange={(e) => setInstitution({ ...institution, nameEn: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-zinc-800 dark:text-zinc-200 font-bold mb-1.5">
              মাদ্রাসার নাম (আরবীতে)
            </label>
            <input
              type="text"
              value={institution.arabicName}
              onChange={(e) => setInstitution({ ...institution, arabicName: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-arabic text-right text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-zinc-800 dark:text-zinc-200 font-bold mb-1.5">
              মুহতামিম / প্রিন্সিপালের নাম
            </label>
            <input
              type="text"
              value={institution.muhtamimName}
              onChange={(e) => setInstitution({ ...institution, muhtamimName: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-zinc-800 dark:text-zinc-200 font-bold mb-1.5">ফোন নম্বর *</label>
            <input
              type="text"
              required
              value={institution.phone}
              onChange={(e) => setInstitution({ ...institution, phone: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-zinc-800 dark:text-zinc-200 font-bold mb-1.5">ইমেইল ঠিকানা</label>
            <input
              type="email"
              value={institution.email}
              onChange={(e) => setInstitution({ ...institution, email: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-zinc-800 dark:text-zinc-200 font-bold mb-1.5">প্রতিষ্ঠা সন</label>
            <input
              type="text"
              value={institution.establishedYear}
              onChange={(e) => setInstitution({ ...institution, establishedYear: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-zinc-800 dark:text-zinc-200 font-bold mb-1.5">মাদ্রাসার পূর্ণাঙ্গ ঠিকানা *</label>
          <input
            type="text"
            required
            value={institution.address}
            onChange={(e) => setInstitution({ ...institution, address: e.target.value })}
            className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-zinc-800 dark:text-zinc-200 font-bold mb-1.5">
            মানি রিসিটের নিচে প্রিন্ট হওয়ার মতো দোয়ার বাক্য / ফুটনোট
          </label>
          <textarea
            rows={2}
            value={institution.receiptFooter}
            onChange={(e) => setInstitution({ ...institution, receiptFooter: e.target.value })}
            className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/20 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {saving ? "সংরক্ষণ হচ্ছে..." : "তথ্য সংরক্ষণ করুন"}
          </button>
        </div>
      </form>

      {/* SMS Gateway Configurations */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4 text-xs">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          বাংলাদেশি এসএমএস গেটওয়ে সংযোগ (SMS Gateway Integration)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-zinc-800 dark:text-zinc-200 font-bold mb-1.5">গেটওয়ে সার্ভিস</label>
            <select
              value={smsGateway.provider}
              onChange={(e) => setSmsGateway({ ...smsGateway, provider: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="GREENWEB">Greenweb SMS Gateway</option>
              <option value="BULKSMSBD">BulkSMSBD</option>
              <option value="ALPHASMS">Alpha SMS Bangladesh</option>
              <option value="ONNOROKOM">Onnorokom SMS</option>
            </select>
          </div>
          <div>
            <label className="block text-zinc-800 dark:text-zinc-200 font-bold mb-1.5">API কী (API Key)</label>
            <input
              type="password"
              value={smsGateway.apiKey}
              onChange={(e) => setSmsGateway({ ...smsGateway, apiKey: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-zinc-800 dark:text-zinc-200 font-bold mb-1.5">সেন্ডার আইডি / মাস্কিং</label>
            <input
              type="text"
              value={smsGateway.senderId}
              onChange={(e) => setSmsGateway({ ...smsGateway, senderId: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <p className="text-[11px] text-zinc-500">
          * লাইভ API Key যুক্ত করলে স্বয়ংক্রিয়ভাবে প্রকৃত মোবাইলে এসএমএস প্রেরিত হবে। অন্যথায় ডেমো সিমুলেশন হিসেবে সংরক্ষিত থাকবে।
        </p>
      </div>
    </div>
  );
}
