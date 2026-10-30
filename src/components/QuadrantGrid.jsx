// ==========================================
// IMPORT MODULES & DEPENDENCIES
// ==========================================
import TaskCard from "./TaskCard";
import { QUADRANT_KEYS, getQuadrant } from "../constants/quadrants";

// ==========================================
// COMPONENT: QuadrantGrid
// Grid 2x2 Eisenhower Matrix. Hanya menerima tugas aktif dari App.
// ==========================================
export default function QuadrantGrid({ tasks, onToggle, onEdit, onDelete }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5">
      {QUADRANT_KEYS.map((key) => {
        const q = getQuadrant(key); // Metadata kuadran (warna, ikon, label)
        const Icon = q.Icon;
        const filtered = tasks.filter((t) => t.quadrant === key); // Tugas per kuadran

        return (
          <div
            key={key}
            className={`relative overflow-hidden ${q.panel} ${q.panelBorder} border rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:shadow-card animate-fade-in-up`}
          >
            {/* Aksen warna kuadran di tepi kiri */}
            <span className={`absolute inset-y-0 left-0 w-1 ${q.accentBar}`} />

            {/* Header kuadran */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className={`w-8 h-8 rounded-lg grid place-items-center bg-white/70 dark:bg-slate-900/40 ${q.text}`}>
                  <Icon className="w-4 h-4" />
                </span>
                <div>
                  <h2 className={`font-bold ${q.text} text-sm sm:text-base leading-tight`}>
                    Q{q.num}: {q.title}
                  </h2>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block">
                    {q.subtitle}
                  </p>
                </div>
              </div>

              {/* Badge jumlah tugas */}
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${q.badge}`}>
                {filtered.length}
              </span>
            </div>

            {/* Daftar tugas */}
            <div className="space-y-2">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Icon className={`w-6 h-6 mb-2 opacity-40 ${q.text}`} />
                  <p className="text-slate-400 dark:text-slate-500 text-xs italic">
                    Belum ada tugas
                  </p>
                </div>
              ) : (
                filtered.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={onToggle}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
