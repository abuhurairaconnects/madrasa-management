// Bengali digits mapping
const bnDigits: { [key: string]: string } = {
  "0": "০",
  "1": "১",
  "2": "২",
  "3": "৩",
  "4": "৪",
  "5": "৫",
  "6": "৬",
  "7": "৭",
  "8": "৮",
  "9": "৯",
};

export function toBengaliNumber(num: number | string | null | undefined): string {
  if (num === null || num === undefined) return "০";
  const str = num.toString();
  return str.replace(/[0-9]/g, (w) => bnDigits[w] || w);
}

export function formatTaka(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "৳০";
  const formatted = new Intl.NumberFormat("en-IN").format(amount);
  return `৳${toBengaliNumber(formatted)}`;
}

export function formatBengaliDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "";
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return String(dateStr);

  const monthsBn = [
    "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
    "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
  ];

  const daysBn = [
    "রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"
  ];

  const dayName = daysBn[d.getDay()];
  const day = toBengaliNumber(d.getDate());
  const month = monthsBn[d.getMonth()];
  const year = toBengaliNumber(d.getFullYear());

  return `${dayName}, ${day} ${month} ${year}`;
}

export const HIFZ_QUALITY_MAP: Record<string, { label: string; color: string; bg: string }> = {
  MUMTAZ: {
    label: "মুমতাজ (চমৎকার)",
    color: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300",
  },
  JAYYID_JIDDAN: {
    label: "জায়্যিদ জিদ্দান (খুব ভালো)",
    color: "text-teal-700 dark:text-teal-300",
    bg: "bg-teal-100 dark:bg-teal-950/60 border-teal-300",
  },
  JAYYID: {
    label: "জায়্যিদ (ভালো)",
    color: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-100 dark:bg-blue-950/60 border-blue-300",
  },
  MAKBUL: {
    label: "মাকবুল (কাঁচা)",
    color: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-100 dark:bg-amber-950/60 border-amber-300",
  },
};

export const FUND_INFO_MAP: Record<string, { name: string; tag: string; color: string; desc: string }> = {
  GENERAL: {
    name: "সাধারণ তহবিল",
    tag: "সাধারণ আয়-ব্যয়",
    color: "border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
    desc: "শিক্ষার্থীদের বেতন, উস্তাদদের বেতন ও অফিসিয়াল খরচ",
  },
  LILLAH_ZAKAT: {
    name: "লিল্লাহ ও যাকাত তহবিল",
    tag: "শরিয়াহ যাকাত খাত",
    color: "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30",
    desc: "শুধুমাত্র এতিম ও অসচ্ছল ছাত্রদের খানা, বস্ত্র ও চিকিৎসার জন্য নির্ধারিত",
  },
  HOSPITALITY: {
    name: "মেহমানদারি তহবিল",
    tag: "মেহমান আপ্যায়ন",
    color: "border-purple-500 text-purple-600 bg-purple-50 dark:bg-purple-950/30",
    desc: "মেহমান, অভিভাবক ও বিশিষ্ট আলেমদের আপ্যায়ন খরচ",
  },
  WAQF_BUILDING: {
    name: "মসজিদ ও ওয়াকফ তহবিল",
    tag: "সদকায়ে জারিয়া",
    color: "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/30",
    desc: "ভবন নির্মাণ, জমি সম্প্রসারণ ও স্থায়ী ওয়াকফ সম্পদ সংরক্ষণ",
  },
};
