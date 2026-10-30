// ==========================================
// COMPONENT: ImportBanner
// Banner migrasi data localStorage lama ke server.
// Muncul sekali jika user memiliki data lama & belum pernah diimpor.
// Setelah sukses, data diambil ulang oleh App (GET /tasks).
// ==========================================

import { useState, useCallback } from "react";
import { post } from "../api/client";
import { BoxIcon } from "./Icons";

export default function ImportBanner() {
  const [pendingCount, setPendingCount] = useState(() => {
    const imported = localStorage.getItem("priority_tasks_imported");
    if (imported) return 0;

    const saved = localStorage.getItem("priority_tasks");
    if (!saved) return 0;

    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed.length : 0;
    } catch {
      return 0;
    }
  });

  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleImport = useCallback(async () => {
    setImporting(true);
    setError("");

    try {
      const saved = localStorage.getItem("priority_tasks");
      const localTasks = JSON.parse(saved);

      const formatted = localTasks.map((t) => ({
        title: t.title,
        quadrant: t.quadrant || "q1",
        completed: Boolean(t.completed),
        clientId: typeof t.id === "number" ? t.id : undefined,
      }));

      const { status } = await post("/tasks/import", { tasks: formatted });

      if (status === 201) {
        localStorage.setItem("priority_tasks_imported", "true");
        localStorage.removeItem("priority_tasks");
        setDone(true);
      } else {
        setError("Gagal mengimpor. Silakan coba lagi.");
      }
    } catch {
      setError("Gagal terhubung ke server. Periksa koneksi Anda.");
    } finally {
      setImporting(false);
    }
  }, []);

  if (pendingCount === 0 || done) return null;

  return (
    <div className="bg-sage-50 dark:bg-sage-900/30 border border-sage-200 dark:border-sage-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-sage-500 text-white rounded-xl grid place-items-center shrink-0">
          <BoxIcon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm sm:text-base">
            {pendingCount} tugas ditemukan di perangkat ini
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Import ke akunmu agar tersimpan di server & terlihat di dashboard.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        <button
          onClick={handleImport}
          disabled={importing}
          className="shrink-0 bg-sage-600 hover:bg-sage-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm"
        >
          {importing ? "Mengimpor..." : "Import Tugas"}
        </button>
      </div>
    </div>
  );
}
