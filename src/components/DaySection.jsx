// ==========================================
// COMPONENT: DaySection
// Section hari/tanggal yang dapat dibuka-tutup.
// Dipakai untuk menampilkan tugas lama (>24 jam) yang dikelompokkan per hari.
// ==========================================

import { useState } from "react";
import TaskCardInline from "./TaskCardInline";
import { CalendarIcon, ChevronDownIcon, CheckCircleIcon } from "./Icons";

export default function DaySection({
  label,
  tasks,
  defaultOpen = false,
  onToggle,
  onEdit,
  onDelete,
}) {
  const [open, setOpen] = useState(defaultOpen); // Section terbuka/tutup

  const total = tasks.length; // Jumlah tugas di hari ini
  const completed = tasks.filter((t) => t.completed).length; // Jumlah selesai

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/70 bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm overflow-hidden shadow-sm">
      {/* Header tombol section */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 text-left hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-9 h-9 rounded-xl bg-sage-50 dark:bg-sage-900/30 text-sage-700 dark:text-sage-300 grid place-items-center shrink-0">
            <CalendarIcon className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
              {label}
            </p>
            <p className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
              {total} tugas
              {completed > 0 && (
                <span className="inline-flex items-center gap-1 text-green-600/80 dark:text-green-400/80">
                  · <CheckCircleIcon className="w-3 h-3" /> {completed} selesai
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Chevron berputar saat buka/tutup */}
        <span
          className={`shrink-0 text-slate-400 transition-transform duration-300 ${
            open ? "rotate-180" : "rotate-0"
          }`}
        >
          <ChevronDownIcon className="w-5 h-5" />
        </span>
      </button>

      {/* Isi section */}
      {open && (
        <div className="px-3 sm:px-4 pb-3.5 pt-1 space-y-2 animate-fade-in-down">
          {tasks.map((task) => (
            <TaskCardInline
              key={task.id}
              task={task}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
