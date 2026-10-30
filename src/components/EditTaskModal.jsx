// ==========================================
// COMPONENT: EditTaskModal
// Dialog untuk mengedit judul & kuadran sebuah tugas.
// Menampilkan waktu dibuat/diedit agar pengguna punya konteks.
// ==========================================

import { useState, useEffect, useRef } from "react";
import { QUADRANT_KEYS, getQuadrant } from "../constants/quadrants";
import { formatDateTime, formatRelative } from "../utils/date";
import { XIcon, SaveIcon, ClockIcon, PencilIcon, AlertIcon } from "./Icons";

export default function EditTaskModal({ task, onClose, onSave }) {
  const [title, setTitle] = useState(task?.title || ""); // Judul saat ini
  const [quadrant, setQuadrant] = useState(task?.quadrant || "q1"); // Kuadran saat ini
  const [saving, setSaving] = useState(false); // Status simpan
  const [error, setError] = useState(""); // Pesan validasi
  const inputRef = useRef(null); // Autofocus ke input judul

  // Fokus otomatis & tangani tombol Escape untuk menutup dialog
  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!task) return null;

  // Simpan perubahan
  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = title.trim();
    if (!trimmed) {
      setError("Judul tugas wajib diisi");
      return;
    }

    // Tidak ada perubahan → langsung tutup
    if (trimmed === task.title && quadrant === task.quadrant) {
      onClose();
      return;
    }

    setError("");
    setSaving(true);
    try {
      await onSave(task.id, { title: trimmed, quadrant });
      onClose();
    } catch {
      setError("Gagal menyimpan perubahan. Coba lagi.");
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="presentation"
    >
      {/* Panel dialog (bottom sheet di mobile, card di desktop) */}
      <div
        className="w-full sm:max-w-lg bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-slide-up-in max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-task-title"
      >
        {/* Handle kecil khas bottom sheet (mobile) */}
        <div className="sm:hidden pt-3 flex justify-center">
          <div className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 sm:px-6 pt-4 sm:pt-5 pb-3">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-sage-50 dark:bg-sage-900/40 text-sage-700 dark:text-sage-300 grid place-items-center">
              <PencilIcon className="w-4 h-4" />
            </span>
            <div>
              <h2
                id="edit-task-title"
                className="text-base font-semibold text-slate-800 dark:text-slate-100"
              >
                Edit Tugas
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Perbarui judul atau prioritas tugas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Tutup"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 sm:px-6 pb-6 space-y-4">
          {/* Judul */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
              Nama Tugas
            </label>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError("");
              }}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all"
              placeholder="Nama tugas..."
            />
          </div>

          {/* Kuadran */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
              Kuadran Prioritas
            </label>
            <div className="grid grid-cols-1 gap-2">
              {QUADRANT_KEYS.map((key) => {
                const q = getQuadrant(key); // Metadata kuadran
                const Icon = q.Icon;
                const active = quadrant === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setQuadrant(key)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${
                      active
                        ? `${q.chip} ring-2 ring-sage-500/40`
                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-lg grid place-items-center shrink-0 ${
                        active ? "bg-white/70 dark:bg-slate-800/60" : "bg-slate-100 dark:bg-slate-700"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">
                        Q{q.num} · {q.title}
                      </span>
                      <span className="block text-[11px] opacity-80">{q.subtitle}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Keterangan waktu */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-700/60 p-3 space-y-1.5">
            <p className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <ClockIcon className="w-3.5 h-3.5" />
              Dibuat: {formatDateTime(task.created_at)} ({formatRelative(task.created_at)})
            </p>
            {task.edited_at && (
              <p className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <PencilIcon className="w-3.5 h-3.5" />
                Terakhir diedit: {formatDateTime(task.edited_at)}
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
              <AlertIcon className="w-4 h-4 shrink-0" />
              {error}
            </p>
          )}

          {/* Aksi */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-sage-500 to-sage-600 hover:from-sage-600 hover:to-sage-700 shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              <SaveIcon className="w-4 h-4" />
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
