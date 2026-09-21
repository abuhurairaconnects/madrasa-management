"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if user previously dismissed
      const dismissed = localStorage.getItem("pwa_prompt_dismissed");
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa_prompt_dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 bg-emerald-950/95 border border-emerald-700/80 text-white p-3.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 animate-in slide-in-from-bottom">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-600/40 border border-emerald-500/50 flex items-center justify-center shrink-0">
          <Smartphone className="w-5 h-5 text-emerald-300" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white">অ্যাপ হিসেবে ইনস্টল করুন</h4>
          <p className="text-[11px] text-emerald-200/80">
            মোবাইলে দ্রুত ও সহজে ব্যবহারের জন্য যুক্ত করুন
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleInstall}
          className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs rounded-lg transition flex items-center gap-1"
        >
          <Download className="w-3.5 h-3.5" /> ইনস্টল
        </button>
        <button
          onClick={handleDismiss}
          className="p-1 text-slate-400 hover:text-white transition rounded-lg"
          title="বন্ধ করুন"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
