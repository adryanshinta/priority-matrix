// ==========================================
// IMPORT MODULES & DEPENDENCIES
// ==========================================
import { useState, useEffect } from "react";
import Header from "./components/Header";
import TaskForm from "./components/TaskForm";
import QuadrantGrid from "./components/QuadrantGrid";
import ProductivityIndicator from "./components/ProductivityIndicator";
import TaskCardInline from "./components/TaskCardInline";
import DaySection from "./components/DaySection";
import EditTaskModal from "./components/EditTaskModal";
import ImportBanner from "./components/ImportBanner";
import { get, post, patch, del } from "./api/client";
import { useAuth } from "./context/AuthContext";
import { partitionTasks, groupByDay } from "./utils/tasks";
import {
  LayersIcon,
  HistoryIcon,
  ListIcon,
  SparkIcon,
} from "./components/Icons";

// ==========================================
// MAIN COMPONENT: App (halaman Todo)
// ==========================================
export default function App() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]); // Seluruh tugas user
  const [viewMode, setViewMode] = useState("matrix"); // "matrix" | "list"
  const [editingTask, setEditingTask] = useState(null); // Tugas yang sedang diedit

  // Muat ulang daftar tugas dari server setiap user berubah.
  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }

    let cancelled = false;

    get("/tasks")
      .then(({ data }) => {
        if (!cancelled) {
          setTasks(Array.isArray(data?.tasks) ? data.tasks : []);
        }
      })
      .catch(() => {
        if (!cancelled) setTasks([]);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  // ── Pengelompokan: aktif (<=24 jam) vs riwayat (>24 jam) ────────────────────
  const { active, archived } = partitionTasks(tasks); // Aktif vs lama
  const historyDays = groupByDay(archived); // Riwayat dikelompokkan per hari

  // Statistik sederhana untuk header
  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
  };

  // ==========================================
  // HANDLE FUNCTIONS
  // ==========================================

  // Tambah tugas baru
  const handleAddTask = async (newTask) => {
    const { data } = await post("/tasks", {
      title: newTask.title,
      quadrant: newTask.quadrant,
    });

    setTasks((prev) => {
      if (data?.task && data.task.id) {
        return [data.task, ...prev]; // Terbaru di depan
      }

      // Fallback jika server tidak mengembalikan id
      return [
        {
          id: Date.now(),
          title: newTask.title,
          quadrant: newTask.quadrant,
          completed: false,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ];
    });
  };

  // Toggle selesai / belum (optimistic update)
  const handleToggleComplete = async (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const newCompleted = !task.completed;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: newCompleted,
              completed_at: newCompleted ? new Date().toISOString() : null,
            }
          : t,
      ),
    );

    try {
      const { data } = await patch(`/tasks/${id}`, { completed: newCompleted });
      if (data?.task && data.task.id === id) {
        setTasks((prev) => prev.map((t) => (t.id === id ? data.task : t)));
      }
    } catch {
      // Rollback ke status sebelum klik
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...task } : t)),
      );
    }
  };

  // Edit judul / kuadran tugas — melempar error agar modal bisa menampilkan pesan
  const handleEditTask = async (id, updates) => {
    const { data } = await patch(`/tasks/${id}`, updates);

    if (data?.task && data.task.id === id) {
      setTasks((prev) => prev.map((t) => (t.id === id ? data.task : t)));
      return data.task;
    }

    // Fallback optimistik jika server tidak mengembalikan task
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, ...updates, edited_at: new Date().toISOString() }
          : t,
      ),
    );
    return null;
  };

  // Hapus tugas
  const handleDeleteTask = async (id) => {
    try {
      await del(`/tasks/${id}`);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch {
      // Biarkan tugas tetap ada; user bisa mencoba lagi
    }
  };

  // ==========================================
  // RENDER UI
  // ==========================================
  return (
    <div className="min-h-screen bg-sage-50 bg-gradient-to-br from-sage-100 via-sage-50 to-sage-200/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300">
      <Header currentView={viewMode} onNavigate={setViewMode} stats={stats} />

      <main className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5 sm:space-y-7">
        <ImportBanner />
        <ProductivityIndicator tasks={tasks} />
        <TaskForm onSubmit={handleAddTask} />

        {/* ====== TAMPILAN UTAMA: aktif (24 jam terakhir) ====== */}
        {viewMode === "matrix" ? (
          <section className="space-y-3.5">
            <SectionHeader
              icon={<LayersIcon className="w-4 h-4" />}
              title="Matriks Prioritas"
              subtitle="Tugas aktif dalam 24 jam terakhir"
              count={active.length}
            />
            <QuadrantGrid
              tasks={active}
              onToggle={handleToggleComplete}
              onEdit={setEditingTask}
              onDelete={handleDeleteTask}
            />
          </section>
        ) : (
          <section className="space-y-3.5">
            <SectionHeader
              icon={<ListIcon className="w-4 h-4" />}
              title="Tugas Aktif"
              subtitle="Diurutkan dari yang terbaru"
              count={active.length}
            />

            {active.length === 0 ? (
              <EmptyState
                title="Belum ada tugas aktif"
                hint="Tambahkan tugas baru di atas untuk memulai harimu."
              />
            ) : (
              <div className="space-y-2 animate-stagger">
                {active.map((task) => (
                  <TaskCardInline
                    key={task.id}
                    task={task}
                    onToggle={handleToggleComplete}
                    onEdit={setEditingTask}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ====== RIWAYAT: tugas >24 jam, dikelompokkan per hari ====== */}
        {historyDays.length > 0 && (
          <section className="space-y-3.5">
            <SectionHeader
              icon={<HistoryIcon className="w-4 h-4" />}
              title="Riwayat"
              subtitle="Tugas berumur lebih dari 24 jam, tersimpan per tanggal"
              count={archived.length}
            />

            <div className="space-y-3">
              {historyDays.map((day) => (
                <DaySection
                  key={day.key}
                  label={day.label}
                  tasks={day.tasks}
                  defaultOpen={false}
                  onToggle={handleToggleComplete}
                  onEdit={setEditingTask}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Modal edit tugas */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleEditTask}
        />
      )}

      <footer className="text-center py-8 px-4 text-xs text-slate-400 dark:text-slate-600">
        <p className="inline-flex items-center gap-1.5">
          {/* <SparkIcon className="w-3.5 h-3.5" /> */}
          &copy; {new Date().getFullYear()} PriorityMatrix Todo — Developed by
          Adryan
        </p>
        <div className="flex items-center justify-center gap-4 mt-3">
          <FooterLink href="https://github.com/adryanshinta" label="GitHub">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </FooterLink>
          <FooterLink
            href="https://www.linkedin.com/in/adryan-syah/"
            label="LinkedIn"
          >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
          </FooterLink>
          <FooterLink
            href="https://www.instagram.com/adryansyyh/"
            label="Instagram"
          >
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </FooterLink>
        </div>
      </footer>
    </div>
  );
}

// ==========================================
// SUB-COMPONENT: SectionHeader
// Header section dengan ikon, judul, subjudul, dan badge jumlah.
// ==========================================
function SectionHeader({ icon, title, subtitle, count }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="w-8 h-8 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/70 text-sage-700 dark:text-sage-300 grid place-items-center shadow-sm shrink-0">
          {icon}
        </span>
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
            {title}
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
            {subtitle}
          </p>
        </div>
      </div>
      <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300">
        {count}
      </span>
    </div>
  );
}

// ==========================================
// SUB-COMPONENT: EmptyState
// Tampilan saat tidak ada tugas aktif.
// ==========================================
function EmptyState({ title, hint }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-800/40 px-6 py-12 text-center">
      <span className="mx-auto mb-3 w-11 h-11 rounded-2xl bg-sage-50 dark:bg-sage-900/30 text-sage-600 dark:text-sage-400 grid place-items-center">
        <SparkIcon className="w-5 h-5" />
      </span>
      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
        {title}
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{hint}</p>
    </div>
  );
}

// ==========================================
// SUB-COMPONENT: FooterLink
// Tautan sosial media di footer dengan ikon SVG.
// ==========================================
function FooterLink({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="text-slate-400 dark:text-slate-500 hover:text-sage-600 dark:hover:text-sage-400 transition-colors duration-200"
    >
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        {children}
      </svg>
    </a>
  );
}
