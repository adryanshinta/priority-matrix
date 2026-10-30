// ==========================================
// UTIL: Pengelompokan & Pensortiran Tugas
// Aturan produk: tugas yang berumur lebih dari 24 jam tidak lagi
// tampil di daftar aktif, melainkan disimpan pada section hari/tanggal.
// ==========================================

import { ageInHours, dayKey, formatDayLabel } from "./date.js";

// Ambang batas: tugas lebih tua dari ini dipindah ke riwayat
export const HISTORY_THRESHOLD_HOURS = 24;

// Urutkan dari yang terbaru (created_at) ke terlama
export function sortByNewest(tasks) {
  return [...tasks].sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
  );
}

// Pisahkan tugas menjadi:
//   active   → dibuat dalam 24 jam terakhir (tampil langsung, terbaru dulu)
//   archived → lebih tua dari 24 jam (masuk section hari/tanggal)
export function partitionTasks(tasks) {
  const active = [];
  const archived = [];

  for (const task of tasks) {
    if (ageInHours(task.created_at) < HISTORY_THRESHOLD_HOURS) {
      active.push(task);
    } else {
      archived.push(task);
    }
  }

  return { active: sortByNewest(active), archived };
}

// Kelompokkan tugas per hari berdasarkan created_at.
// Mengembalikan array section terurut dari hari terbaru → terlama.
// Setiap section: { key, label, tasks: [...] }
export function groupByDay(tasks) {
  const groups = new Map();

  for (const task of tasks) {
    const key = dayKey(task.created_at);
    if (!groups.has(key)) {
      groups.set(key, { key, date: task.created_at, tasks: [] });
    }
    groups.get(key).tasks.push(task);
  }

  return [...groups.values()]
    .sort((a, b) => new Date(b.date) - new Date(a.date)) // Hari terbaru dulu
    .map((group) => ({
      key: group.key,
      label: formatDayLabel(group.date),
      tasks: sortByNewest(group.tasks), // Di dalam hari: terbaru dulu
    }));
}
