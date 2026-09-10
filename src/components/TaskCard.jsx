// ==========================================
// COMPONENT: TaskCard
// Card individual untuk menampilkan satu tugas
// Digunakan di dalam QuadrantGrid untuk setiap kuadran
// ==========================================
export default function TaskCard({ task, onToggle, onDelete }) {
  // Render card tugas dengan checkbox, judul, dan tombol hapus
  return (
    // Container card dengan dark mode
    <div className={`flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl border transition-all duration-200 hover:shadow-sm ${
      task.completed
        ? "bg-white/50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/60 opacity-60" // Selesai
        : "bg-white/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 shadow-xs" // Aktif
    }`}>
      {/* Bagian kiri: checkbox + judul tugas */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {/* Checkbox untuk toggle status */}
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          className="shrink-0 w-4 h-4 text-sage-600 rounded focus:ring-sage-500 cursor-pointer"
        />
        {/* Judul tugas: coret jika selesai */}
        <span className={`text-sm truncate ${
          task.completed ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-700 dark:text-slate-200"
        }`}>
          {task.title}
        </span>
      </div>
      {/* Tombol Hapus */}
      <button
        onClick={() => onDelete(task.id)}
        className="shrink-0 text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition-colors"
        title="Hapus tugas"
      >
        {/* Ikon X */}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
