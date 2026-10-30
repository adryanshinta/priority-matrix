// ==========================================
// KONSTANTA: Metadata Kuadran Eisenhower
// Sumber tunggal untuk label, warna, dan ikon tiap kuadran,
// dipakai di grid matrix, list, form, dan chip.
// ==========================================

import {
  ZapIcon, // Q1: lakukan sekarang (mendesak)
  CalendarIcon, // Q2: jadwalkan
  UsersIcon, // Q3: delegasikan
  ArchiveIcon, // Q4: hilangkan
} from "../components/Icons";

export const QUADRANT_KEYS = ["q1", "q2", "q3", "q4"];

export const QUADRANT_META = {
  q1: {
    key: "q1",
    num: 1,
    title: "Do First",
    subtitle: "Mendesak & Penting",
    Icon: ZapIcon,
    text: "text-red-700 dark:text-red-400",
    badge: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
    chip: "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
    accentBar: "bg-red-500",
    panel:
      "bg-gradient-to-br from-red-50 to-red-100/40 dark:from-red-950/30 dark:to-red-900/10",
    panelBorder: "border-red-200/80 dark:border-red-800/60",
  },
  q2: {
    key: "q2",
    num: 2,
    title: "Schedule",
    subtitle: "Tidak Mendesak & Penting",
    Icon: CalendarIcon,
    text: "text-blue-700 dark:text-blue-400",
    badge: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
    chip: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    accentBar: "bg-blue-500",
    panel:
      "bg-gradient-to-br from-blue-50 to-blue-100/40 dark:from-blue-950/30 dark:to-blue-900/10",
    panelBorder: "border-blue-200/80 dark:border-blue-800/60",
  },
  q3: {
    key: "q3",
    num: 3,
    title: "Delegate",
    subtitle: "Mendesak & Tidak Penting",
    Icon: UsersIcon,
    text: "text-amber-700 dark:text-amber-400",
    badge: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
    chip: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    accentBar: "bg-amber-500",
    panel:
      "bg-gradient-to-br from-amber-50 to-amber-100/40 dark:from-amber-950/30 dark:to-amber-900/10",
    panelBorder: "border-amber-200/80 dark:border-amber-800/60",
  },
  q4: {
    key: "q4",
    num: 4,
    title: "Eliminate",
    subtitle: "Tidak Mendesak & Tidak Penting",
    Icon: ArchiveIcon,
    text: "text-slate-600 dark:text-slate-300",
    badge: "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
    chip: "bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600",
    accentBar: "bg-slate-400",
    panel:
      "bg-gradient-to-br from-slate-50 to-slate-100/60 dark:from-slate-800/40 dark:to-slate-800/20",
    panelBorder: "border-slate-200 dark:border-slate-700",
  },
};

// Helper aman: fallback ke q1 jika key tidak dikenal
export function getQuadrant(key) {
  return QUADRANT_META[key] || QUADRANT_META.q1;
}
