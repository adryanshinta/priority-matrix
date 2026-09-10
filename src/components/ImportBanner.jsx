// ==========================================
// IMPORT MODULES & DEPENDENCIES
// ==========================================
import { useState } from "react"; // React hook state
import { post } from "../api/client"; // API POST import

// ==========================================
// COMPONENT: ImportBanner
// Banner untuk migrasi data localStorage lama ke account server
// Muncul sekali saat user punya data di localStorage & belum diimpor
// ==========================================
export default function ImportBanner() {
  // State untuk menyimpan jumlah task lokal yang menunggu impor
  const [pendingCount, setPendingCount] = useState(() => {
    // Inisialisasi: baca localStorage saat mount

    // Cek apakah sudah pernah diimpor (flag di localStorage)
    const imported = localStorage.getItem("priority_tasks_imported"); // Flag migrasi
    if (imported) return 0; // Sudah impor → tidak perlu banner

    // Baca data tugas lama dari localStorage
    const saved = localStorage.getItem("priority_tasks"); // Data lama
    if (!saved) return 0; // Tidak ada data → tidak perlu banner

    try {
      const parsed = JSON.parse(saved); // Parse JSON
      return Array.isArray(parsed) && parsed.length > 0 ? parsed.length : 0; // Hitung jumlah
    } catch {
      return 0; // Data korup → abaikan
    }
  });

  // State loading saat proses impor berjalan
  const [importing, setImporting] = useState(false); // Default belum impor

  // State hasil impor
  const [done, setDone] = useState(false); // Default belum selesai

  // Jika tidak ada data pending / sudah selesai / sudah impor → jangan render
  if (pendingCount === 0 || done) return null; // Sembunyikan banner

  // ==========================================
  // FUNGSI IMPOR
  // ==========================================
  const handleImport = async () => {
    setImporting(true); // Aktifkan loading state

    try {
      // Baca data localStorage & format untuk API
      const saved = localStorage.getItem("priority_tasks"); // Data mentah
      const localTasks = JSON.parse(saved); // Parse ke array

      // Format untuk server: title, quadrant, completed, clientId
      const formatted = localTasks.map((t) => ({
        title: t.title, // Judul tugas
        quadrant: t.quadrant || "q1", // Kuadran (fallback q1)
        completed: t.completed || false, // Status selesai
        clientId: t.id, // ID lokal (untuk preserve created_at history)
      }));

      // Kirim POST /api/tasks/import ke server
      const { status } = await post("/tasks/import", { tasks: formatted });

      if (status === 201) {
        // Sukses: tandai sudah diimpor & bersihkan localStorage
        localStorage.setItem("priority_tasks_imported", "true"); // Set flag
        localStorage.removeItem("priority_tasks"); // Hapus data lama

        setDone(true); // Tandai selesai (banner hilang)

        // Refresh halaman agar data baru dari server muncul
        window.location.reload(); // Reload utk fetch task dari API
      }
    } catch (err) {
      console.error("Gagal impor:", err); // Log error
    } finally {
      setImporting(false); // Matikan loading
    }
  };

  // ==========================================
  // RENDER UI
  // ==========================================
  return (
    // Banner dengan background biru muda, rounded, shadow
    <div className="bg-sage-50 dark:bg-sage-900/30 border border-sage-200 dark:border-sage-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Kiri: ikon + teks penjelasan */}
      <div className="flex items-center gap-3">
        {/* Ikon migrasi */}
        <div className="w-10 h-10 bg-sage-500 text-white rounded-xl flex items-center justify-center text-lg shrink-0">
          📦
        </div>
        <div>
          {/* Judul banner */}
          <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm sm:text-base">
            {pendingCount} tugas ditemukan di perangkat ini
          </p>
          {/* Penjelasan */}
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Import ke akunmu agar tersimpan di server & terlihat di dashboard.
          </p>
        </div>
      </div>

      {/* Kanan: tombol impor */}
      <button
        onClick={handleImport} // Panggil fungsi impor
        disabled={importing} // Disable saat loading
        className="shrink-0 bg-sage-600 hover:bg-sage-700 disabled:opacity-50 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm"
      >
        {importing ? "Mengimpor..." : "Import Tugas"} {/* Label dinamis saat loading */}
      </button>
    </div>
  );
}