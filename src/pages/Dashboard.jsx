// ==========================================
// IMPORT MODULES & DEPENDENCIES
// ==========================================
import { useState, useEffect } from "react"; // React hooks
import Header from "../components/Header"; // Header dengan navigasi
import { get } from "../api/client"; // API GET
import { useDarkMode } from "../context/DarkModeContext"; // Warna chart sesuai tema
import {
  ResponsiveContainer, // Container chart responsif (recharts)
  AreaChart, // Chart area untuk task selesai per hari
  Area, // Komponen area series
  BarChart, // Chart bar untuk distribusi kuadran
  Bar, // Komponen bar
  XAxis, // Sumbu X
  YAxis, // Sumbu Y
  CartesianGrid, // Grid background
  Tooltip, // Tooltip hover
  Cell, // Warna per bar (kuadran)
  LineChart, // Chart line untuk tren rate
  Line, // Komponen line
} from "recharts"; // Library chart

// ==========================================
// PALETTE KUADRAN (divalidasi: light & dark PASS)
// q1=red q2=blue q3=amber-dark q4=aqua
// ==========================================
const QUADRANT_COLORS = {
  q1: "#ef4444", // Kuadran 1: merah (urgent & important)
  q2: "#3b82f6", // Kuadran 2: biru (not urgent & important)
  q3: "#c98500", // Kuadran 3: amber (urgent & not important)
  q4: "#10a5a5", // Kuadran 4: aqua (not urgent & not important)
};

// Label Bahasa Indonesia per kuadran
const QUADRANT_LABELS = {
  q1: "Q1 Do First", // Lakukan sekarang
  q2: "Q2 Schedule", // Jadwalkan
  q3: "Q3 Delegate", // Delegasikan
  q4: "Q4 Eliminate", // Hilangkan
};

// ==========================================
// COMPONENT: Dashboard
// Halaman analytics: chart per hari/minggu, kuadran, rate tren
// ==========================================
export default function Dashboard() {
  // State filter range: 7 / 30 / 90 hari
  const [range, setRange] = useState(7); // Default 7 hari

  // State filter grouping: "day" | "week"
  const [group, setGroup] = useState("day"); // Default per hari

  // State data analytics dari server
  const [data, setData] = useState(null); // Null saat belum load

  // State loading
  const [loading, setLoading] = useState(true); // Default loading

  // State error
  const [error, setError] = useState(""); // Default kosong

  // Dark mode context untuk warna chart
  const { isDark } = useDarkMode(); // true = dark theme

  // ==========================================
  // FETCH DATA SAAT FILTER BERUBAH
  // ==========================================
  useEffect(() => {
    // Abort controller untuk batalkan request lama saat filter cepat berubah
    const controller = new AbortController(); // Sinyal pembatalan

    async function fetchData() {
      setLoading(true); // Aktifkan loading
      setError(""); // Reset error

      try {
        // GET /api/analytics dengan query params
        const res = await fetch(`/api/analytics?range=${range}&group=${group}`, {
          credentials: "include", // Kirim cookie
          signal: controller.signal, // Kejut batalkan
        });
        const json = await res.json(); // Parse JSON

        if (res.ok) {
          // Sukses: simpan data
          setData(json);
        } else {
          // Error dari server
          setError(json.message || "Gagal memuat data");
        }
      } catch (e) {
        // Abort bukan error nyata (filter berganti)
        if (e.name !== "AbortError") setError("Gagal terhubung ke server");
      } finally {
        setLoading(false); // Matikan loading
      }
    }

    fetchData(); // Panggil fetch

    return () => controller.abort(); // Batalkan saat cleanup (filter berubah)
  }, [range, group]); // Jalankan ulang saat filter berubah

  // ==========================================
  // EKSTRAK DERIVED DATA
  // ==========================================
  // Format data series untuk chart (ubah key date→label)
  const seriesData = (data?.series || []).map((s) => ({
    label: formatDate(s.date, group), // Label tanggal yang diformat
    completed: s.completed, // Jumlah selesai
  }));

  // Ambil total & stats
  const totals = data?.totals || { total: 0, completed: 0, avgPerDay: "0" }; // Default kosong
  const completionRate = totals.total > 0 ? Math.round((totals.completed / totals.total) * 100) : 0; // Rate %

  // Quadrant data untuk bar chart
  const quadrantData = (data?.quadrants || []).map((q) => ({
    name: QUADRANT_LABELS[q.quadrant], // Nama kuadran
    total: q.total, // Total task
    completed: q.completed, // Task selesai
    color: QUADRANT_COLORS[q.quadrant], // Warna identity kuadran
  }));

  // Rate trend untuk line chart
  const rateTrendData = (data?.rateTrend || []).map((r) => ({
    label: formatDate(r.date, group), // Label tanggal
    rate: r.rate, // Persentase selesai
  }));

  // Warna chart sesuai tema (ink & grid)
  const ink = isDark ? "#c3c2b7" : "#52514e"; // Warna teks sumbu
  const grid = isDark ? "#2c2c2a" : "#e1e0d9"; // Warna grid
  const seriesBlue = isDark ? "#b3c092" : "#8B9A6E"; // Warna series utama (sage - mengikuti brand)

  // ==========================================
  // RENDER UI
  // ==========================================
  return (
    <div className="min-h-screen bg-sage-50 bg-gradient-to-br from-sage-100 via-sage-50 to-sage-200/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Header (tanpa stats, menunjukkan halaman dashboard) */}
      <Header stats={null} />

      {/* Konten utama */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Judul halaman */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
            Dashboard Analitik
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Pantau produktivitas dan trafik tugasmu
          </p>
        </div>

        {/* === FILTER ROW (1 baris di atas chart) === */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          {/* Grup filter per hari/minggu */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setGroup("day")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                group === "day"
                  ? "bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-300"
              }`}
            >
              Per Hari
            </button>
            <button
              onClick={() => setGroup("week")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                group === "week"
                  ? "bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-300"
              }`}
            >
              Per Minggu
            </button>
          </div>

          {/* Grup filter range */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            {[7, 30, 90].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                  range === r
                    ? "bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-300"
                }`}
              >
                {r} Hari
              </button>
            ))}
          </div>
        </div>

        {/* === TAMPILAN SAAT LOADING === */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-sage-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* === TAMPILAN SAAT ERROR === */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-2xl text-center">
            {error}
          </div>
        )}

        {/* === TAMPILAN BERHASIL === */}
        {data && !loading && (
          <div className="space-y-6">
            {/* ====== KPI ROW: Stat tiles ====== */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {/* KPI: Total Tugas */}
              <StatTile
                label="Total Tugas"
                value={totals.total}
                color="text-slate-800 dark:text-slate-100"
                bg="bg-slate-50 dark:bg-slate-900/50"
              />
              {/* KPI: Selesai */}
              <StatTile
                label="Selesai"
                value={totals.completed}
                color="text-green-600 dark:text-green-400"
                bg="bg-green-50 dark:bg-green-900/20"
              />
              {/* KPI: Completion Rate (hero number) */}
              <StatTile
                label="Tingkat Penyelesaian"
                value={`${completionRate}%`}
                color="text-sage-700 dark:text-sage-300"
                bg="bg-sage-50 dark:bg-sage-900/20"
              />
              {/* KPI: Rata-rata per hari */}
              <StatTile
                label="Rata-rata per Hari"
                value={totals.avgPerDay}
                color="text-orange-500 dark:text-orange-400"
                bg="bg-orange-50 dark:bg-orange-900/20"
              />
            </div>

            {/* ====== CHART 1: Task selesai per periode (Area) ====== */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-5 sm:p-6 rounded-2xl shadow-md border border-slate-200/60 dark:border-slate-700/60">
              <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">
                Tugas Selesai per {group === "day" ? "Hari" : "Minggu"}
              </h3>
              {/* Container chart responsif */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  {/* Area chart dengan satu series biru */}
                  <AreaChart data={seriesData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    {/* Grid horizontal halus */}
                    <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                    {/* Sumbu X: label tanggal */}
                    <XAxis dataKey="label" tick={{ fill: ink, fontSize: 11 }} stroke={grid} />
                    {/* Sumbu Y: jumlah */}
                    <YAxis tick={{ fill: ink, fontSize: 11 }} stroke={grid} allowDecimals={false} />
                    {/* Tooltip hover */}
                    <Tooltip contentStyle={tooltipStyle(isDark)} />
                    {/* Series area biru */}
                    <Area
                      type="monotone"
                      dataKey="completed"
                      stroke={seriesBlue}
                      strokeWidth={2}
                      fill={seriesBlue}
                      fillOpacity={0.15}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ====== CHART 2 + 3: Quadrants & Rate Trend (2 kolom desktop) ====== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Chart 2: Distribusi Kuadran (Bar horizontal) */}
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-5 sm:p-6 rounded-2xl shadow-md border border-slate-200/60 dark:border-slate-700/60">
                <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">
                  Distribusi Kuadran
                </h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    {/* Bar chart horizontal */}
                    <BarChart data={quadrantData} layout="vertical" margin={{ top: 5, right: 30, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={grid} horizontal={false} />
                      {/* Sumbu X: jumlah */}
                      <XAxis type="number" tick={{ fill: ink, fontSize: 11 }} stroke={grid} allowDecimals={false} />
                      {/* Sumbu Y: nama kuadran (lebar untuk label penuh) */}
                      <YAxis type="category" dataKey="name" tick={{ fill: ink, fontSize: 11 }} width={80} />
                      <Tooltip contentStyle={tooltipStyle(isDark)} />
                      {/* Bar dengan warna identity per kuadran */}
                      <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                        {quadrantData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Direct labels: warna kuadran (mengatasi WARN kontras) */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {quadrantData.map((q) => (
                    <span key={q.name} className="text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: q.color }}></span>
                      {q.name}: {q.total}
                    </span>
                  ))}
                </div>
              </div>

              {/* Chart 3: Completion Rate Trend (Line) */}
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-5 sm:p-6 rounded-2xl shadow-md border border-slate-200/60 dark:border-slate-700/60">
                <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">
                  Tren Tingkat Penyelesaian
                </h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    {/* Line chart rate trend */}
                    <LineChart data={rateTrendData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                      {/* Sumbu X: tanggal */}
                      <XAxis dataKey="label" tick={{ fill: ink, fontSize: 11 }} stroke={grid} />
                      {/* Sumbu Y: persentase 0-100 */}
                      <YAxis domain={[0, 100]} tick={{ fill: ink, fontSize: 11 }} stroke={grid} />
                      <Tooltip contentStyle={tooltipStyle(isDark)} />
                      {/* Line biru */}
                      <Line
                        type="monotone"
                        dataKey="rate"
                        stroke={seriesBlue}
                        strokeWidth={2}
                        dot={{ r: 3, fill: seriesBlue }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {/* Keterangan sumbu */}
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 text-right">
                  % tugas selesai per periode
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ==========================================
// SUB-COMPONENT: StatTile
// Tile statistik untuk KPI row
// ==========================================
function StatTile({ label, value, color, bg }) {
  // Tile angka besar dengan label
  return (
    <div className={`${bg} rounded-xl p-4 sm:p-5`}>
      {/* Angka utama (hero number) */}
      <p className={`text-2xl sm:text-3xl font-bold ${color}`}>{value}</p>
      {/* Label */}
      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1">
        {label}
      </p>
    </div>
  );
}

// ==========================================
// HELPER: formatDate
// Format tanggal database menjadi label pendek
// ==========================================
function formatDate(dateStr, group) {
  const date = new Date(dateStr); // Parse ISO date

  // Format untuk Bahasa Indonesia
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]; // Nama hari pendek
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]; // Nama bulan

  // Jika grup per minggu, tampilkan minggu (tanggal awal minggu)
  if (group === "week") {
    return `${date.getDate()} ${monthNames[date.getMonth()]}`; // Contoh: 1 Sep
  }

  // Per hari: nama hari + tanggal
  return `${dayNames[date.getDay()]} ${date.getDate()}`; // Contoh: Sen 1
}

// ==========================================
// HELPER: tooltipStyle
// Style tooltip yang sesuai tema dark/light
// ==========================================
function tooltipStyle(isDark) {
  // Tooltip mengikuti tema aplikasi
  return {
    backgroundColor: isDark ? "#1a1a19" : "#ffffff", // Surface
    border: isDark ? "1px solid #383835" : "1px solid #e1e0d9", // Border
    color: isDark ? "#ffffff" : "#0b0b0b", // Warna teks
    borderRadius: "8px", // Korner membulat
    fontSize: "12px", // Ukuran font kecil
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)", // Bayangan halus
  };
}