// ==========================================
// COMPONENT: TaskCardInline
// Tampilan daftar linear (List / Riwayat) untuk satu tugas.
// Menampilkan chip kuadran berikon, waktu dibuat/diedit, dan aksi edit/hapus.
// ==========================================

import { getQuadrant } from "../constants/quadrants";
import { formatDateTime, formatRelative, formatTime } from "../utils/date";
import { PencilIcon, TrashIcon, ClockIcon } from "./Icons";
import CheckControl from "./CheckControl";

export default function TaskCardInline({ task, onToggle, onEdit, onDelete }) {
  const q = getQuadrant(task.quadrant); // Metadata kuadran
  const { Icon } = q; // Ikon kuadran

  return (
    <div
      className={`group flex items-start gap-3 p-3 sm:p-3.5 rounded-xl border transition-all duration-200 animate-fade-in-up ${
        task.completed
          ? "bg-slate-50/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-75"
          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-card hover:-translate-y-px"
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

      {/* Konten */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          {/* Chip kuadran dengan ikon */}
          <span
            className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${q.chip}`}
          >
            <Icon className="w-3 h-3" strokeWidth={2} />
            Q{q.num}
          </span>

          <p
            className={`text-sm sm:text-[15px] leading-snug break-words ${
              task.completed
                ? "line-through text-slate-400 dark:text-slate-500"
                : "text-slate-800 dark:text-slate-100"
            }`}
          >
            {task.title}
          </p>
        </div>

        {/* Meta waktu */}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-400 dark:text-slate-500">
          <span className="inline-flex items-center gap-1" title={formatDateTime(task.created_at)}>
            <ClockIcon className="w-3 h-3" />
            {formatTime(task.created_at)} · dibuat {formatRelative(task.created_at)}
          </span>
          {task.edited_at && (
            <span
              className="inline-flex items-center gap-1"
              title={formatDateTime(task.edited_at)}
            >
              <PencilIcon className="w-3 h-3" />
              diedit {formatRelative(task.edited_at)}
            </span>
          )}
          {task.completed && task.completed_at && (
            <span className="inline-flex items-center gap-1 text-green-600/80 dark:text-green-400/80">
              Selesai {formatRelative(task.completed_at)}
            </span>
          )}
        </div>
      </div>

      {/* Aksi */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-sage-700 dark:hover:text-sage-300 hover:bg-sage-50 dark:hover:bg-slate-700 transition-colors"
          title="Edit tugas"
          aria-label={`Edit "${task.title}"`}
        >
          <PencilIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Hapus tugas"
          aria-label={`Hapus "${task.title}"`}
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
