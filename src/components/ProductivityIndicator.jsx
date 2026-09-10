// ==========================================
// COMPONENT: ProductivityIndicator
// Menampilkan ringkasan statistik produktivitas:
// total tugas, selesai, belum selesai, dan persentase
// ==========================================
export default function ProductivityIndicator({ tasks }) {
  // Hitung total jumlah tugas
  const totalTasks = tasks.length;

  // Hitung jumlah tugas yang sudah selesai
  const completedTasks = tasks.filter((t) => t.completed).length;

  // Hitung jumlah tugas yang belum selesai
  const remainingTasks = totalTasks - completedTasks;

  // Hitung persentase penyelesaian
  const percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // ==========================================
  // RENDER UI (DARK MODE SUPPORT)
  // ==========================================
  return (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-4 sm:p-5 rounded-2xl shadow-md border border-slate-200/60 dark:border-slate-700/60">

      {/* Judul seksi */}
      <h3 className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-4">
        Ringkasan Produktivitas
      </h3>

      {/* Grid stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Stat: Total Tugas */}
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 sm:p-4 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">{totalTasks}</p>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">Total Tugas</p>
        </div>

        {/* Stat: Selesai */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 sm:p-4 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">{completedTasks}</p>
          <p className="text-[11px] sm:text-xs text-green-600/70 dark:text-green-400/70 mt-0.5">Selesai</p>
        </div>

        {/* Stat: Belum Selesai */}
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 sm:p-4 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-orange-500 dark:text-orange-400">{remainingTasks}</p>
          <p className="text-[11px] sm:text-xs text-orange-500/70 dark:text-orange-400/70 mt-0.5">Tersisa</p>
        </div>

        {/* Stat: Persentase */}
        <div className="bg-sage-50 dark:bg-sage-900/20 rounded-xl p-3 sm:p-4 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-sage-700 dark:text-sage-300">{percentage}%</p>
          <p className="text-[11px] sm:text-xs text-sage-600/70 dark:text-sage-300/70 mt-0.5">Progres</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
          <div
            className="bg-gradient-to-r from-sage-500 to-sage-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {completedTasks} dari {totalTasks} tugas selesai
          </p>
          <p className="text-[11px] font-medium text-sage-700 dark:text-sage-300">
            {percentage}%
          </p>
        </div>
      </div>
    </div>
  );
}
