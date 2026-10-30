// ==========================================
// COMPONENT: ProductivityIndicator
// Ringkasan statistik produktivitas: total, selesai, tersisa, progres.
// ==========================================
import { LayersIcon, CheckCircleIcon, ClockIcon, TrendingUpIcon } from "./Icons";

export default function ProductivityIndicator({ tasks }) {
  const totalTasks = tasks.length; // Total tugas
  const completedTasks = tasks.filter((t) => t.completed).length; // Selesai
  const remainingTasks = totalTasks - completedTasks; // Belum selesai
  const percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100); // Persen

  // Konfigurasi tile statistik agar render lebih ringkas
  const tiles = [
    {
      Icon: LayersIcon,
      value: totalTasks,
      label: "Total Tugas",
      valueClass: "text-slate-800 dark:text-slate-100",
      bg: "bg-slate-50 dark:bg-slate-900/50",
      iconClass: "text-slate-400 dark:text-slate-500",
    },
    {
      Icon: CheckCircleIcon,
      value: completedTasks,
      label: "Selesai",
      valueClass: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-900/20",
      iconClass: "text-green-500 dark:text-green-400",
    },
    {
      Icon: ClockIcon,
      value: remainingTasks,
      label: "Tersisa",
      valueClass: "text-orange-500 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-900/20",
      iconClass: "text-orange-400 dark:text-orange-400",
    },
    {
      Icon: TrendingUpIcon,
      value: `${percentage}%`,
      label: "Progres",
      valueClass: "text-sage-700 dark:text-sage-300",
      bg: "bg-sage-50 dark:bg-sage-900/20",
      iconClass: "text-sage-500 dark:text-sage-400",
    },
  ];

  return (
    <div className="bg-white/80 dark:bg-slate-800/70 backdrop-blur-sm p-4 sm:p-5 rounded-2xl shadow-card border border-slate-200/60 dark:border-slate-700/60 animate-fade-in-up">
      <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-4">
        Ringkasan Produktivitas
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {tiles.map((tile) => (
          <div key={tile.label} className={`${tile.bg} rounded-xl p-3 sm:p-4`}>
            <div className="flex items-center justify-between mb-1">
              <p className={`text-2xl sm:text-3xl font-bold ${tile.valueClass}`}>{tile.value}</p>
              <tile.Icon className={`w-4 h-4 ${tile.iconClass}`} />
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">{tile.label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-sage-500 to-sage-600 h-2.5 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {completedTasks} dari {totalTasks} tugas selesai
          </p>
          <p className="text-[11px] font-medium text-sage-700 dark:text-sage-300">{percentage}%</p>
        </div>
      </div>
    </div>
  );
}
