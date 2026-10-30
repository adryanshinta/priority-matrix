// ==========================================
// COMPONENT: TaskCard
// Kartu tugas untuk tampilan grid kuadran.
// Menampilkan: status, judul, waktu dibuat/diedit, dan aksi edit/hapus.
// ==========================================

import { getQuadrant } from "../constants/quadrants";
import { formatDateTime, formatRelative } from "../utils/date";
import { PencilIcon, TrashIcon, ClockIcon } from "./Icons";
import CheckControl from "./CheckControl";

export default function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const q = getQuadrant(task.quadrant); // Metadata warna/ikon kuadran

  return (
    <div
      className={`group flex items-start gap-2.5 p-3 rounded-xl border transition-all duration-200 animate-fade-in-up ${
        task.completed
          ? "bg-white/50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/60 opacity-70"
          : "bg-white/90 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-card hover:-translate-y-px"
      }`}
    >
      {/* Kontrol centang */}
      <div className="pt-0.5">
        <CheckControl
          checked={task.completed}
          onToggle={() => onToggle(task.id)}
          size="sm"
          label={`Tandai "${task.title}" sebagai ${task.completed ? "belum selesai" : "selesai"}`}
        />
      </div>

      {/* Judul + keterangan waktu */}
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm leading-snug break-words ${
            task.completed
              ? "line-through text-slate-400 dark:text-slate-500"
              : "text-slate-800 dark:text-slate-100"
          }`}
        >
          {task.title}
        </p>

        {/* Meta: waktu dibuat & diedit */}
        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-slate-400 dark:text-slate-500">
          <span className="inline-flex items-center gap-1" title={formatDateTime(task.created_at)}>
            <ClockIcon className="w-3 h-3" />
            Dibuat {formatRelative(task.created_at)}
          </span>
          {task.edited_at && (
            <span
              className="inline-flex items-center gap-1"
              title={formatDateTime(task.edited_at)}
            >
              <PencilIcon className="w-3 h-3" />
              Diedit {formatRelative(task.edited_at)}
            </span>
          )}
        </div>
      </div>

      {/* Aksi */}
      <div className="flex items-center gap-0.5 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity duration-200">
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-sage-700 dark:hover:text-sage-300 hover:bg-sage-50 dark:hover:bg-slate-700 transition-colors"
          title="Edit tugas"
          aria-label={`Edit "${task.title}"`}
        >
          <PencilIcon className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Hapus tugas"
          aria-label={`Hapus "${task.title}"`}
        >
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
