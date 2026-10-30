// ==========================================
// COMPONENT: TaskForm
// Form untuk menambah tugas baru.
// Aman terhadap race condition: tombol disabled saat submit berjalan.
// ==========================================

import { useState } from "react";
import { QUADRANT_KEYS, getQuadrant } from "../constants/quadrants";
import { PlusIcon, CheckIcon, AlertIcon } from "./Icons";

export default function TaskForm({ onSubmit }) {
  const [inputTitle, setInputTitle] = useState(""); // Judul tugas
  const [inputQuadrant, setInputQuadrant] = useState("q1"); // Kuadran default: Q1
  const [showSuccess, setShowSuccess] = useState(false); // Umpan balik sukses
  const [submitting, setSubmitting] = useState(false); // Status submit
  const [error, setError] = useState(""); // Pesan validasi

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = inputTitle.trim();
    if (!trimmed) {
      setError("Judul tugas wajib diisi");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await onSubmit({ title: trimmed, quadrant: inputQuadrant });
      setInputTitle("");
      setInputQuadrant("q1");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1600);
    } catch {
      setError("Gagal menambahkan tugas. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white/80 dark:bg-slate-800/70 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-card border border-slate-200/60 dark:border-slate-700/60">
      {/* Judul form */}
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2.5">
        <span className="w-8 h-8 bg-gradient-to-br from-sage-500 to-sage-600 text-white rounded-lg grid place-items-center shadow-sm">
          <PlusIcon className="w-4 h-4" strokeWidth={2.4} />
        </span>
        Tambah Tugas Baru
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Input judul */}
        <div>
          <label
            htmlFor="task-title"
            className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide"
          >
            Nama Tugas
          </label>
          <input
            id="task-title"
            type="text"
            value={inputTitle}
            onChange={(e) => {
              setInputTitle(e.target.value);
              if (error) setError("");
            }}
            placeholder="Contoh: Menyelesaikan laporan bulanan..."
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm sm:text-base text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Pilihan kuadran (grid ikon) */}
        <div>
          <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
            Kuadran Prioritas
          </span>
          <div className="grid grid-cols-2 gap-2">
            {QUADRANT_KEYS.map((key) => {
              const q = getQuadrant(key);
              const Icon = q.Icon;
              const active = inputQuadrant === key;

              return (
                <button
                  key={key}
                  type="button"
                  disabled={submitting}
                  onClick={() => setInputQuadrant(key)}
                  aria-pressed={active}
                  className={`flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl border text-left transition-all duration-200 disabled:opacity-60 ${
                    active
                      ? `${q.chip} ring-2 ring-sage-500/40 shadow-sm`
                      : "border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/40"
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg grid place-items-center shrink-0 ${
                      active
                        ? "bg-white/70 dark:bg-slate-800/60"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs sm:text-sm font-semibold leading-tight">
                      Q{q.num} · {q.title}
                    </span>
                    <span className="block text-[10px] sm:text-[11px] opacity-70 leading-tight truncate">
                      {q.subtitle}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pesan error */}
        {error && (
          <p className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
            <AlertIcon className="w-4 h-4 shrink-0" />
            {error}
          </p>
        )}

        {/* Tombol submit */}
        <button
          type="submit"
          disabled={submitting || !inputTitle.trim()}
          className={`w-full inline-flex items-center justify-center gap-2 font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 text-sm sm:text-base active:scale-[0.99] ${
            showSuccess
              ? "bg-green-500 text-white"
              : "bg-gradient-to-r from-sage-500 to-sage-600 hover:from-sage-600 hover:to-sage-700 text-white shadow-md hover:shadow-card-hover"
          } ${submitting || !inputTitle.trim() ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {showSuccess ? (
            <>
              <CheckIcon className="w-4 h-4" strokeWidth={2.6} /> Tugas Ditambahkan
            </>
          ) : submitting ? (
            "Menambahkan..."
          ) : (
            <>
              <PlusIcon className="w-4 h-4" strokeWidth={2.4} /> Tambah Tugas
            </>
          )}
        </button>
      </form>
    </section>
  );
}
