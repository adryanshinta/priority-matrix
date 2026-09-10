// ==========================================
// IMPORT MODULES & DEPENDENCIES
// ==========================================
import TaskCard from "./TaskCard"; // Import komponen TaskCard untuk merender setiap tugas

// ==========================================
// COMPONENT: QuadrantGrid
// Grid 2x2 yang menampilkan 4 kuadran Eisenhower Matrix
// ==========================================
export default function QuadrantGrid({ tasks, onToggle, onDelete }) {
  // Konfigurasi untuk setiap kuadran: warna, border, teks, emoji, judul
  const quadrants = [
    {
      key: "q1",
      bg: "bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20", // Gradient merah
      border: "border-red-400 dark:border-red-600",
      text: "text-red-700 dark:text-red-400",
      badge: "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400",
      emoji: "🔥",
      title: "Do First",
      subtitle: "Mendesak & Penting",
    },
    {
      key: "q2",
      bg: "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20", // Gradient biru
      border: "border-blue-400 dark:border-blue-600",
      text: "text-blue-700 dark:text-blue-400",
      badge: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
      emoji: "📅",
      title: "Schedule",
      subtitle: "Tidak Mendesak & Penting",
    },
    {
      key: "q3",
      bg: "bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20", // Gradient kuning
      border: "border-amber-400 dark:border-amber-600",
      text: "text-amber-700 dark:text-amber-400",
      badge: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400",
      emoji: "👥",
      title: "Delegate",
      subtitle: "Mendesak & Tidak Penting",
    },
    {
      key: "q4",
      bg: "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/30", // Gradient abu
      border: "border-slate-300 dark:border-slate-600",
      text: "text-slate-600 dark:text-slate-400",
      badge: "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400",
      emoji: "🗑️",
      title: "Eliminate",
      subtitle: "Tidak Mendesak & Tidak Penting",
    },
  ];

  // ==========================================
  // RENDER UI: Grid 2 kolom (responsive)
  // ==========================================
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
      {quadrants.map((q) => {
        const filteredTasks = tasks.filter((t) => t.quadrant === q.key); // Filter tasks per kuadran

        return (
          <div
            key={q.key}
            className={`${q.bg} ${q.border} border-l-4 p-4 sm:p-5 rounded-2xl transition-all duration-200 hover:shadow-md`}
          >
            {/* Header kuadran */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{q.emoji}</span>
                <div>
                  <h2 className={`font-bold ${q.text} text-sm sm:text-base leading-tight`}>
                    Q{quadrants.indexOf(q) + 1}: {q.title}
                  </h2>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block">
                    {q.subtitle}
                  </p>
                </div>
              </div>
              {/* Badge jumlah tugas */}
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${q.badge}`}>
                {filteredTasks.length}
              </span>
            </div>

            {/* Garis pemisah */}
            <div className={`h-px ${q.border} opacity-30 mb-3`}></div>

            {/* Daftar tugas */}
            <div className="space-y-2">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-2xl mb-1 opacity-50">{q.emoji}</p>
                  <p className="text-slate-400 dark:text-slate-500 text-xs italic">
                    Belum ada tugas
                  </p>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={onToggle}
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
