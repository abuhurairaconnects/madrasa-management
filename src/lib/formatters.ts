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

const BN_WORDS_UNDER_100: string[] = [
  "", "এক", "দুই", "তিন", "চার", "পাঁচ", "ছয়", "সাত", "আট", "নয়", "দশ",
  "এগারো", "বারো", "তেরো", "চৌদ্দ", "পনেরো", "ষোল", "সতেরো", "আঠারো", "উনিশ", "বিশ",
  "একুশ", "বাইশ", "তেইশ", "চব্বিশ", "পঁচিশ", "ছাব্বিশ", "সাতাশ", "আটাশ", "ঊনত্রিশ", "ত্রিশ",
  "একত্রিশ", "বত্রিশ", "তেত্রিশ", "চৌত্রিশ", "পঁয়ত্রিশ", "ছত্রিশ", "সাঁইত্রিশ", "আটত্রিশ", "ঊনচল্লিশ", "চল্লিশ",
  "একচল্লিশ", "বিয়াল্লিশ", "তেতাল্লিশ", "চুয়াল্লিশ", "পঁয়তাল্লিশ", "ছেচল্লিশ", "সাতচল্লিশ", "আটচল্লিশ", "ঊনপঞ্চাশ", "পঞ্চাশ",
  "একান্ন", "বায়ান্ন", "তিপ্পান্ন", "চুয়ান্ন", "পঞ্চান্ন", "ছাপ্পান্ন", "সাতান্ন", "আটান্ন", "ঊনষাট", "ষাট",
  "একষট্টি", "বাষট্টি", "তেষট্টি", "চৌষট্টি", "পঁয়ষট্টি", "ছেষট্টি", "সাতষট্টি", "আটষট্টি", "ঊনসত্তর", "সত্তর",
  "একাত্তর", "বাহাত্তর", "তিয়াত্তর", "চুয়াত্তর", "পঁচাত্তর", "ছিয়াত্তর", "সাতাত্তর", "আটাত্তর", "ঊনআশি", "আশি",
  "একাশি", "বিরাশি", "তিরাশি", "চুরাশি", "পঁচাশি", "ছিয়াশি", "সাতাশি", "অষ্টআশি", "ঊননব্বই", "নব্বই",
  "একানব্বই", "বানব্বই", "তিরানব্বই", "চুরানব্বই", "পঁচানব্বই", "ছিয়ানব্বই", "সাতানব্বই", "আটানব্বই", "নিরানব্বই"
];

export function numberToBengaliWords(n: number | null | undefined): string {
  if (!n || n <= 0) return "শূন্য টাকা মাত্র";
  let num = Math.floor(n);
  const parts: string[] = [];

  // কোটি (Crore)
  if (num >= 10000000) {
    const crore = Math.floor(num / 10000000);
    parts.push(`${numberToBengaliWords(crore).replace(" টাকা মাত্র", "")} কোটি`);
    num %= 10000000;
  }

  // লাখ (Lakh)
  if (num >= 100000) {
    const lakh = Math.floor(num / 100000);
    if (lakh < 100) {
      parts.push(`${BN_WORDS_UNDER_100[lakh]} লাখ`);
    }
    num %= 100000;
  }

  // হাজার (Thousand)
  if (num >= 1000) {
    const thousand = Math.floor(num / 1000);
    if (thousand < 100) {
      parts.push(`${BN_WORDS_UNDER_100[thousand]} হাজার`);
    }
    num %= 1000;
  }

  // শত (Hundred)
  if (num >= 100) {
    const hundred = Math.floor(num / 100);
    parts.push(`${BN_WORDS_UNDER_100[hundred]} শত`);
    num %= 100;
  }

  // বাকি অংশ (< 100)
  if (num > 0 && num < 100) {
    parts.push(BN_WORDS_UNDER_100[num]);
  }

  return `${parts.join(" ")} টাকা মাত্র`;
}
