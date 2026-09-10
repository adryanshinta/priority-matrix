// ==========================================
// IMPORT MODULES & DEPENDENCIES
// ==========================================
import { useState } from "react"; // useState untuk state lokal form

// ==========================================
// COMPONENT: TaskForm
// Form untuk menambah tugas baru ke dalam list
// ==========================================
export default function TaskForm({ onSubmit }) {
  // State untuk menyimpan judul tugas yang diketik user
  const [inputTitle, setInputTitle] = useState(""); // Default string kosong

  // State untuk menyimpan pilihan kuadran prioritas
  const [inputQuadrant, setInputQuadrant] = useState("q1"); // Default ke Kuadran 1

  // State untuk menampilkan animasi sukses
  const [showSuccess, setShowSuccess] = useState(false); // Default tidak tampil

  // Fungsi yang dijalankan saat form di-submit
  const handleSubmit = (e) => {
    e.preventDefault(); // Mencegah reload halaman default form

    if (!inputTitle.trim()) return; // Validasi: jangan tambah jika judul kosong

    const newTask = {
      id: Date.now(), // ID unik sementara berdasarkan timestamp
      title: inputTitle, // Judul dari input user
      quadrant: inputQuadrant, // Kuadran dari select dropdown
      completed: false, // Default belum selesai
    };

    onSubmit(newTask); // Kirim tugas baru ke parent (App) via callback

    setInputTitle(""); // Reset input judul ke kosong
    setInputQuadrant("q1"); // Reset pilihan kuadran ke default

    // Tampilkan animasi sukses singkat
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1500);
  };

  // ==========================================
  // RENDER UI (DARK MODE SUPPORT)
  // ==========================================
  return (
    <section className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-5 sm:p-6 rounded-2xl shadow-md border border-slate-200/60 dark:border-slate-700/60">
      {/* Judul seksi form */}
      <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
        <span className="w-7 h-7 bg-sage-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">
          +
        </span>
        Tambah Tugas Baru
      </h3>

      {/* Form element */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Input Judul Tugas */}
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
            Nama Tugas
          </label>
          <input
            type="text"
            value={inputTitle}
            onChange={(e) => setInputTitle(e.target.value)}
            placeholder="Contoh: Menyelesaikan laporan bulanan..."
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm sm:text-base text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Pilihan Kuadran Prioritas */}
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
            Pilih Kuadran Prioritas
          </label>
          <select
            value={inputQuadrant}
            onChange={(e) => setInputQuadrant(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm sm:text-base text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all duration-200"
          >
            <option value="q1">🔥 Kuadran 1: Urgent & Important (Lakukan Sekarang)</option>
            <option value="q2">📅 Kuadran 2: Not Urgent & Important (Jadwalkan)</option>
            <option value="q3">👥 Kuadran 3: Urgent & Not Important (Delegasikan)</option>
            <option value="q4">🗑️ Kuadran 4: Not Urgent & Not Important (Hilangkan)</option>
          </select>
        </div>

        {/* Tombol Submit */}
        <button
          type="submit"
          className={`w-full font-medium py-2.5 px-4 rounded-xl transition-all duration-200 text-sm sm:text-base ${
            showSuccess
              ? "bg-green-500 text-white"
              : "bg-gradient-to-r from-sage-500 to-sage-600 hover:from-sage-600 hover:to-sage-700 text-white shadow-md hover:shadow-lg"
          }`}
        >
          {showSuccess ? "✓ Tugas Ditambahkan!" : "Tambah Tugas"}
        </button>
      </form>
    </section>
  );
}
