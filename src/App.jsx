// ==========================================
// IMPORT MODULES & DEPENDENCIES
// ==========================================
import { useState, useEffect } from "react"; // Mengimpor React hooks dasar
import { useNavigate } from "react-router-dom"; // Navigasi ke dashboard
import Header from "./components/Header"; // Komponen navigasi header
import TaskForm from "./components/TaskForm"; // Komponen form input tugas baru
import QuadrantGrid from "./components/QuadrantGrid"; // Komponen grid 4 kuadran Eisenhower
import ProductivityIndicator from "./components/ProductivityIndicator"; // Komponen indikator produktivitas
import { get, post, patch, del } from "./api/client"; // API client methods
import { useAuth } from "./context/AuthContext"; // Akses user info
import ImportBanner from "./components/ImportBanner"; // Banner impor localStorage

// ==========================================
// MAIN COMPONENT: PriorityTodoList
// ==========================================
export default function App() {
  // Ambil user dari auth context (untuk guard data per user)
  const { user } = useAuth(); // user = profil yang login

  // Navigasi router untuk pergi ke dashboard
  const navigate = useNavigate(); // Fungsi pindah halaman

  // State untuk menyimpan daftar seluruh tugas
  // // TODO: API_INTEGRATION_POINT - Ganti initial state ini dengan pemanggilan API GET (fetch/axios) saat mengambil data dari database
  const [tasks, setTasks] = useState([]); // Data dari server (GET saat mount, bukan sample)

  // State untuk menentukan tampilan: "matrix" (4 kuadran) atau "list" (daftar semua)
  const [viewMode, setViewMode] = useState("matrix"); // Default ke tampilan matriks

  // ==========================================
  // LOCAL STORAGE / API SYNC EFFECT
  // ==========================================
  useEffect(() => {
    // // TODO: API_INTEGRATION_POINT - Tempat memuat data awal (GET /api/tasks) dari server/database eksternal saat komponen pertama kali dirender
    // Ambil data dari API saat user sudah login
    if (user) {
      get("/tasks").then(({ data }) => {
        setTasks(data.tasks || []); // Set tasks dari server
      });
    }
  }, [user]); // Jalankan saat user login

  // PERHATIAN: Effect localStorage dihapus!
  // Data sekarang disimpan di server (PostgreSQL) sebagai single source of truth.
  // localStorage hanya dipakai utk migrasi awal via ImportBanner.
  // (marker TODO lama #3 untuk sinkronisasi lokal sudah digantikan oleh API call)

  // ==========================================
  // COMPUTED VALUES
  // ==========================================
  // Hitung statistik untuk ditampilkan di header
  const stats = {
    total: tasks.length, // Total jumlah tugas
    completed: tasks.filter((t) => t.completed).length, // Jumlah tugas selesai
  };

  // ==========================================
  // HANDLE FUNCTIONS (LOGIC)
  // ==========================================

  // Fungsi untuk menambah tugas baru
  const handleAddTask = async (newTask) => {
    // // TODO: API_INTEGRATION_POINT - Lakukan POST request ke database (misal: axios.post('/api/tasks', newTask)) untuk menyimpan data secara permanen
    try {
      // Kirim POST ke server dengan title & quadrant
      const { data } = await post("/tasks", { title: newTask.title, quadrant: newTask.quadrant });
      setTasks((prev) => [...prev, data.task]); // Tambahkan task dari server (dengan UUID server)
    } catch {
      console.error("Gagal menambah task"); // Log error
    }
  };

  // Fungsi untuk mengubah status selesai/belum tugas
  const handleToggleComplete = async (id) => {
    // Temukan task yang diklik
    const task = tasks.find((t) => t.id === id);
    if (!task) return; // Cegah jika task tidak ada

    // Optimistic update: ubah UI dulu sebelum server merespons
    const newCompleted = !task.completed; // Status baru
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: newCompleted } : t)));

    // // TODO: API_INTEGRATION_POINT - Lakukan PUT/PATCH request ke database (misal: axios.patch(`/api/tasks/${id}`, { completed: updatedTask.completed }))
    try {
      // Kirim PATCH ke server dengan status baru
      const { data } = await patch(`/tasks/${id}`, { completed: newCompleted });
      // Update state dengan respons server (server memberi completed_at)
      setTasks((prev) => prev.map((t) => (t.id === id ? data.task : t)));
    } catch {
      // Rollback: kembalikan status lama jika gagal
      setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: task.completed } : t)));
      console.error("Gagal update task"); // Log error
    }
  };

  // Fungsi untuk menghapus tugas
  const handleDeleteTask = async (id) => {
    // // TODO: API_INTEGRATION_POINT - Lakukan DELETE request ke database (misal: axios.delete(`/api/tasks/${id}`)) sebelum menghapusnya dari state lokal
    try {
      // Kirim DELETE ke server
      await del(`/tasks/${id}`);
      // Hapus dari state lokal setelah server sukses
      setTasks(tasks.filter((task) => task.id !== id));
    } catch {
      console.error("Gagal menghapus task"); // Log error
    }
  };

  // ==========================================
  // RENDER UI (TAILWIND CSS + DARK MODE)
  // ==========================================
  return (
    <div className="min-h-screen bg-sage-50 bg-gradient-to-br from-sage-100 via-sage-50 to-sage-200/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300">

      {/* Header navigasi dengan stats + tombol dashboard */}
      <Header
        currentView={viewMode} // Tampilan aktif saat ini
        onNavigate={setViewMode} // Fungsi mengubah tampilan
        stats={stats} // Statistik untuk header
        onDashboard={() => navigate("/dashboard")} // Navigasi ke dashboard
        user={user} // Profil user untuk avatar
      />

      {/* Konten utama */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">

        {/* Banner impor localStorage (jika ada data lama) */}
        <ImportBanner />

        {/* Indikator Produktivitas */}
        <ProductivityIndicator tasks={tasks} />

        {/* Form Input Tugas */}
        <TaskForm onSubmit={handleAddTask} />

        {/* Tampilan berdasarkan mode */}
        {viewMode === "matrix" ? (
          <QuadrantGrid
            tasks={tasks}
            onToggle={handleToggleComplete}
            onDelete={handleDeleteTask}
          />
        ) : (
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-5 sm:p-6 rounded-2xl shadow-md border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-slate-800 dark:text-slate-100 text-lg">
                Semua Tugas
              </h2>
              <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium px-2.5 py-1 rounded-full">
                {tasks.length} total
              </span>
            </div>
            <div className="space-y-2">
              {tasks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">📋</p>
                  <p className="text-slate-400 dark:text-slate-500 text-sm">
                    Belum ada tugas. Tambahkan tugas baru di atas!
                  </p>
                </div>
              ) : (
                tasks.map((task) => (
                  <TaskCardInline
                    key={task.id}
                    task={task}
                    onToggle={handleToggleComplete}
                    onDelete={handleDeleteTask}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 px-4 text-xs text-slate-400 dark:text-slate-600">
        {/* Baris copyright dengan tahun dinamis */}
        <p>
          &copy; {new Date().getFullYear()} PriorityMatrix Todo — Developed by Adryan
        </p>

        {/* Baris ikon sosial media */}
        <div className="flex items-center justify-center gap-4 mt-3">
          {/* Link GitHub */}
          <a
            href="https://github.com/adryanshinta" // Profil GitHub
            target="_blank" // Buka tab baru
            rel="noopener noreferrer" // Keamanan: cegah tabnabbing
            aria-label="GitHub" // Label aksesibilitas
            className="text-slate-400 dark:text-slate-500 hover:text-sage-600 dark:hover:text-sage-400 transition-colors duration-200"
          >
            {/* Ikon GitHub (SVG) */}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </a>

          {/* Link LinkedIn */}
          <a
            href="https://www.linkedin.com/in/adryan-syah/" // Profil LinkedIn
            target="_blank" // Buka tab baru
            rel="noopener noreferrer" // Keamanan: cegah tabnabbing
            aria-label="LinkedIn" // Label aksesibilitas
            className="text-slate-400 dark:text-slate-500 hover:text-sage-600 dark:hover:text-sage-400 transition-colors duration-200"
          >
            {/* Ikon LinkedIn (SVG) */}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
            </svg>
          </a>

          {/* Link Instagram */}
          <a
            href="https://www.instagram.com/adryansyyh/" // Profil Instagram
            target="_blank" // Buka tab baru
            rel="noopener noreferrer" // Keamanan: cegah tabnabbing
            aria-label="Instagram" // Label aksesibilitas
            className="text-slate-400 dark:text-slate-500 hover:text-sage-600 dark:hover:text-sage-400 transition-colors duration-200"
          >
            {/* Ikon Instagram (SVG) */}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}

// ==========================================
// INLINE SUB-COMPONENT: TaskCard for List View
// ==========================================
function TaskCardInline({ task, onToggle, onDelete }) {
  // Konfigurasi warna dan label berdasarkan kuadran
  const quadrantConfig = {
    q1: { label: "Q1", color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800" },
    q2: { label: "Q2", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
    q3: { label: "Q3", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
    q4: { label: "Q4", color: "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600" },
  };

  const config = quadrantConfig[task.quadrant] || quadrantConfig.q1; // Fallback q1

  return (
    <div className={`flex items-center justify-between gap-3 p-3 sm:p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
      task.completed
        ? "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-70"
        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs"
    }`}>
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <span className={`shrink-0 text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-md border ${config.color}`}>
          {config.label}
        </span>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          className="shrink-0 w-4 h-4 text-sage-600 rounded focus:ring-sage-500 cursor-pointer"
        />
        <span className={`text-sm sm:text-base truncate ${
          task.completed ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-800 dark:text-slate-200"
        }`}>
          {task.title}
        </span>
      </div>
      <button
        onClick={() => onDelete(task.id)}
        className="shrink-0 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-medium px-2 py-1.5 rounded-lg transition-colors"
      >
        Hapus
      </button>
    </div>
  );
}