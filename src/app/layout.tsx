import type { Metadata, Viewport } from "next";
import "./globals.css";
import { RoleProvider } from "@/context/RoleContext";
import { AppShell } from "@/components/layout/AppShell";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const viewport: Viewport = {
  themeColor: "#065f46",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "মাদ্রাসা ম্যানেজমেন্ট অ্যাপ",
  description: "মাদ্রাসার জন্য পূর্ণাঙ্গ ও স্বয়ংক্রিয় ডিজিটাল ম্যানেজমেন্ট প্ল্যাটফর্ম",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className="h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="h-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex overflow-hidden">
        <ServiceWorkerRegister />
        <RoleProvider>
          <AppShell>{children}</AppShell>
        </RoleProvider>
      </body>
    </html>
  );
}
