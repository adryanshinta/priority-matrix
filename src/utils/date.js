// ==========================================
// UTIL: Tanggal & Waktu (Bahasa Indonesia)
// Semua helper di sini dipakai untuk menampilkan keterangan waktu
// pembuatan/edit tugas dan mengelompokkan tugas per hari.
// ==========================================

// Format tanggal + jam lengkap, contoh: "21 Sep 2026, 14:30"
export function formatDateTime(input) {
  const date = toDate(input);
  if (!date) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// Format jam saja, contoh: "14:30"
export function formatTime(input) {
  const date = toDate(input);
  if (!date) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// Format tanggal saja, contoh: "21 September 2026"
export function formatDateLong(input) {
  const date = toDate(input);
  if (!date) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

// Waktu relatif singkat, contoh: "baru saja", "5 menit lalu", "3 jam lalu"
export function formatRelative(input) {
  const date = toDate(input);
  if (!date) return "-";

  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);

  if (diffSec < 45) return "baru saja";
  if (diffSec < 60) return "kurang dari 1 menit lalu";

  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit lalu`;

  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;

  const diffDay = Math.round(diffHour / 24);
  if (diffDay === 1) return "kemarin";
  if (diffDay < 7) return `${diffDay} hari lalu`;

  return formatDateLong(date);
}

// Kunci hari lokal (YYYY-MM-DD) untuk mengelompokkan tugas per tanggal
export function dayKey(input) {
  const date = toDate(input);
  if (!date) return "unknown";

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Label hari yang ramah: "Hari Ini", "Kemarin", atau "Sabtu, 19 Sep 2026"
export function formatDayLabel(input) {
  const date = toDate(input);
  if (!date) return "Tanpa tanggal";

  const todayKey = dayKey(new Date());
  const key = dayKey(date);
  if (key === todayKey) return "Hari Ini";

  // "Kemarin" dihitung dari selisih hari kalender
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (key === dayKey(yesterday)) return "Kemarin";

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

// Label hari singkat untuk header section, contoh: "Sab, 19 Sep"
export function formatDayShort(input) {
  const date = toDate(input);
  if (!date) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

// Umur data dalam satuan jam (dipakai untuk ambang 24 jam)
export function ageInHours(input) {
  const date = toDate(input);
  if (!date) return 0;
  return (Date.now() - date.getTime()) / (1000 * 60 * 60);
}

// ── Helper internal: parse berbagai bentuk input waktu → Date ─────────────────
function toDate(input) {
  if (!input) return null;
  if (input instanceof Date) return Number.isNaN(input.getTime()) ? null : input;

  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}
