"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Crown,
  Wallet,
  GraduationCap,
  BookOpen,
  BedDouble,
  Users,
} from "lucide-react";

export type UserRole =
  | "MUHTAMIM"
  | "NAZIM_E_TALIMAT"
  | "ACCOUNTANT"
  | "TEACHER"
  | "HOSTEL_SUPER"
  | "PARENT";

export const ROLE_ICONS: Record<UserRole, React.ComponentType<{ className?: string }>> = {
  MUHTAMIM: Crown,
  ACCOUNTANT: Wallet,
  NAZIM_E_TALIMAT: GraduationCap,
  TEACHER: BookOpen,
  HOSTEL_SUPER: BedDouble,
  PARENT: Users,
};

export interface DepartmentMeta {
  role: UserRole;
  shortTitle: string;
  fullTitle: string;
  description: string;
  defaultPath: string;
  badge: string;
  accentColor: string;
}

export const DEPARTMENTS: Record<UserRole, DepartmentMeta> = {
  MUHTAMIM: {
    role: "MUHTAMIM",
    shortTitle: "প্রশাসন",
    fullTitle: "মুহতামিম ও প্রশাসন",
    description: "সার্বিক নিয়ন্ত্রণ, প্রোফাইল ও কেন্দ্রীয় ড্যাশবোর্ড",
    defaultPath: "/",
    badge: "সেন্ট্রাল",
    accentColor: "from-amber-500 to-amber-600",
  },
  ACCOUNTANT: {
    role: "ACCOUNTANT",
    shortTitle: "হিসাব",
    fullTitle: "হিসাব ও অর্থ বিভাগ",
    description: "ফি আদায়, রসিদ, ফান্ড ও বেতন",
    defaultPath: "/fees",
    badge: "অর্থ",
    accentColor: "from-emerald-500 to-emerald-600",
  },
  NAZIM_E_TALIMAT: {
    role: "NAZIM_E_TALIMAT",
    shortTitle: "তালিমাত",
    fullTitle: "তালিমাত ও শিক্ষা বিভাগ",
    description: "ভর্তি, ক্লাস রুটিন, পরীক্ষা ও রেজাল্ট",
    defaultPath: "/students",
    badge: "শিক্ষা",
    accentColor: "from-blue-500 to-blue-600",
  },
  TEACHER: {
    role: "TEACHER",
    shortTitle: "হিফজ",
    fullTitle: "হিফজ ও শিক্ষক ডেস্ক",
    description: "ছবক, সবকিনা, আমুক্তা ও লাইব্রেরি",
    defaultPath: "/hifz",
    badge: "হিফজ",
    accentColor: "from-teal-500 to-teal-600",
  },
  HOSTEL_SUPER: {
    role: "HOSTEL_SUPER",
    shortTitle: "হোস্টেল",
    fullTitle: "হোস্টেল ও বোর্ডিং",
    description: "রুম, সিট বরাদ্দ ও ডাইনিং মিল",
    defaultPath: "/hostel",
    badge: "আবাসিক",
    accentColor: "from-indigo-500 to-indigo-600",
  },
  PARENT: {
    role: "PARENT",
    shortTitle: "অভিভাবক",
    fullTitle: "অভিভাবক পোর্টাল",
    description: "সন্তানের পড়ালেখা, রেজাল্ট ও হাজিরা",
    defaultPath: "/guardian",
    badge: "মোবাইল",
    accentColor: "from-purple-500 to-purple-600",
  },
};

export const DEPARTMENTS_LIST = Object.values(DEPARTMENTS);

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  phone: string;
  designation: string;
  assignedDept: string;
  email: string;
  joinedDate: string;
}

export const DEMO_PROFILES: Record<UserRole, UserProfile> = {
  MUHTAMIM: {
    id: "user-muhtamim-01",
    name: "মাওলানা মুহাম্মদ আব্দুল্লাহ",
    username: "admin_jamia",
    role: "MUHTAMIM",
    phone: "০১৭১১-২২৩৩৪৪",
    designation: "মুহতামিম ও প্রধান পরিচালক",
    assignedDept: "সার্বিক প্রশাসন ও কেন্দ্রীয় সিদ্ধান্ত",
    email: "muhtamim@madrasa.edu.bd",
    joinedDate: "০১ জানুয়ারি ২০২০",
  },
  ACCOUNTANT: {
    id: "user-cashier-02",
    name: "কারী আব্দুর রহমান",
    username: "cashier_jamia",
    role: "ACCOUNTANT",
    phone: "০১৭২২-৩৩৪৪৫৫",
    designation: "প্রধান হিসাবরক্ষক ও ক্যাশিয়ার",
    assignedDept: "হিসাব, ফি আদায় ও অর্থ বিভাগ",
    email: "accounts@madrasa.edu.bd",
    joinedDate: "১৫ মার্চ ২০২১",
  },
  NAZIM_E_TALIMAT: {
    id: "user-talimat-03",
    name: "মুফতি মাহমুদুল হাসান",
    username: "talimat_jamia",
    role: "NAZIM_E_TALIMAT",
    phone: "০১৭৩৩-৪৪৫৫৬৬",
    designation: "নাজেমে তালিমাত (শিক্ষা সচিব)",
    assignedDept: "শিক্ষা, ক্লাস রুটিন ও পরীক্ষা বিভাগ",
    email: "talimat@madrasa.edu.bd",
    joinedDate: "১০ আগস্ট ২০১৯",
  },
  TEACHER: {
    id: "user-teacher-04",
    name: "হাফেজ মাওলানা যোবায়ের",
    username: "teacher_hifz",
    role: "TEACHER",
    phone: "০১৭৪৪-৫৫৬৬৭৭",
    designation: "উস্তাদ ও হিফজ বিভাগীয় প্রধান",
    assignedDept: "হিফজুল কুরআন ও তাজবীদ বিভাগ",
    email: "teacher@madrasa.edu.bd",
    joinedDate: "০১ নভেম্বর ২০২২",
  },
  HOSTEL_SUPER: {
    id: "user-hostel-05",
    name: "মাওলানা কফিল উদ্দীন",
    username: "hostel_super",
    role: "HOSTEL_SUPER",
    phone: "০১৭৫৫-৬৬৭৭৮৮",
    designation: "হোস্টেল সুপার ও ডাইনিং ইনচার্জ",
    assignedDept: "আবাসিক, হোস্টেল ও বোর্ডিং শাখা",
    email: "hostel@madrasa.edu.bd",
    joinedDate: "০১ মে ২০২৩",
  },
  PARENT: {
    id: "user-parent-06",
    name: "মোহাম্মদ রফিকুল ইসলাম",
    username: "guardian_01",
    role: "PARENT",
    phone: "০১৭৬৬-৭৭৮৮৯৯",
    designation: "অভিভাবক (ছাত্র: আবদুল্লাহ আল নোমান)",
    assignedDept: "অভিভাবক ডিজিটাল পোর্টাল",
    email: "guardian.parent@gmail.com",
    joinedDate: "১০ জানুয়ারি ২০২৪",
  },
};

export const ALL_PROFILES_LIST = Object.values(DEMO_PROFILES);

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  roleTitleBn: string;
  activeDepartment: DepartmentMeta;
  departments: DepartmentMeta[];
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  switchUserAccount: (targetRole: UserRole) => void;
  allUserProfiles: UserProfile[];
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const ROLE_TITLES: Record<UserRole, string> = {
  MUHTAMIM: "মুহতামিম (প্রধান পরিচালক)",
  NAZIM_E_TALIMAT: "নাজেমে তালিমাত (শিক্ষা সচিব)",
  ACCOUNTANT: "হিসাবরক্ষক (ক্যাশিয়ার)",
  TEACHER: "উস্তাদ (হিফজ/কিতাব শিক্ষক)",
  HOSTEL_SUPER: "হোস্টেল সুপার (আবাসিক)",
  PARENT: "অভিভাবক পোর্টাল",
};

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("MUHTAMIM");
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_PROFILES.MUHTAMIM);

  useEffect(() => {
    const savedRole = localStorage.getItem("madrasa_role") as UserRole;
    if (savedRole && ROLE_TITLES[savedRole]) {
      setRoleState(savedRole);
      const savedUserStr = localStorage.getItem("madrasa_active_user");
      if (savedUserStr) {
        try {
          setCurrentUser(JSON.parse(savedUserStr));
        } catch {
          setCurrentUser(DEMO_PROFILES[savedRole]);
        }
      } else {
        setCurrentUser(DEMO_PROFILES[savedRole]);
      }
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem("madrasa_role", newRole);
    const targetUser = DEMO_PROFILES[newRole] || DEMO_PROFILES.MUHTAMIM;
    setCurrentUser(targetUser);
    localStorage.setItem("madrasa_active_user", JSON.stringify(targetUser));
  };

  const switchUserAccount = (targetRole: UserRole) => {
    setRole(targetRole);
    const targetUser = DEMO_PROFILES[targetRole] || DEMO_PROFILES.MUHTAMIM;
    setCurrentUser(targetUser);
    localStorage.setItem("madrasa_active_user", JSON.stringify(targetUser));

    // For parent role, guarantee a valid demo session so guardian page works instantly
    if (targetRole === "PARENT") {
      const demoGuardianSession = {
        guardian: {
          id: targetUser.id,
          name: targetUser.name,
          phone: targetUser.phone,
          relation: "পিতা",
        },
        students: [
          {
            id: "student-demo-01",
            nameBn: "আবদুল্লাহ আল নোমান",
            studentId: "JAMIA-01-S001",
            roll: 1,
            className: "হিফজুল কুরআন বিভাগ",
            invoices: [
              {
                id: "inv-demo-01",
                invoiceNo: "INV-2026-001",
                monthBn: "সেপ্টেম্বর ২০২৬",
                totalAmount: 2500,
                paidAmount: 0,
                status: "UNPAID",
              },
            ],
            hifzRecords: [
              {
                date: new Date().toISOString(),
                para: 15,
                surah: "বনি ইসরাঈল",
                page: 12,
                quality: "MUMTAZ",
              },
            ],
          },
        ],
      };
      localStorage.setItem("guardian_session", JSON.stringify(demoGuardianSession));
    }
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        roleTitleBn: ROLE_TITLES[role],
        activeDepartment: DEPARTMENTS[role] || DEPARTMENTS.MUHTAMIM,
        departments: DEPARTMENTS_LIST,
        currentUser,
        setCurrentUser,
        switchUserAccount,
        allUserProfiles: ALL_PROFILES_LIST,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}

