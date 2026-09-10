// ==========================================
// IMPORT MODULES & DEPENDENCIES
// ==========================================
import { useState } from "react"; // useState untuk menu mobile & dropdown
import { useNavigate, useLocation } from "react-router-dom"; // Router navigasi
import { useDarkMode } from "../context/DarkModeContext"; // Hook dark mode
import { useAuth } from "../context/AuthContext"; // Hook auth (logout, user)
import AvatarImage from "./AvatarImage"; // Avatar robust dengan fallback inisial

// ==========================================
// COMPONENT: Header
// Navigasi header responsif: logo, nav, dark mode toggle, user menu
// Props:
//   - currentView: "matrix" | "list" (tampilan todo aktif)
//   - onNavigate: ubah tampilan todo
//   - stats: { total, completed } utk badge
// ==========================================
export default function Header({ currentView, onNavigate, stats }) {
  // State menu mobile
  const [menuOpen, setMenuOpen] = useState(false); // Default tertutup

  // State dropdown user
  const [userMenuOpen, setUserMenuOpen] = useState(false); // Default tertutup

  // Router hooks
  const navigate = useNavigate(); // Pindah halaman
  const location = useLocation(); // Path saat ini

  // Context hooks
  const { isDark, toggle } = useDarkMode(); // Dark mode
  const { user, logoutUser } = useAuth(); // Profil + logout

  // Deteksi halaman saat ini (todo vs dashboard)
  const isDashboard = location.pathname === "/dashboard"; // true jika di dashboard

  // ==========================================
  // HANDLE FUNCTIONS
  // ==========================================

  // Navigasi halaman utama (todo)
  const goTodo = () => {
    navigate("/"); // Ke halaman todo
    setMenuOpen(false); // Tutup menu mobile
    setUserMenuOpen(false); // Tutup dropdown user
  };

  // Navigasi dashboard
  const goDashboard = () => {
    navigate("/dashboard"); // Ke halaman dashboard
    setMenuOpen(false); // Tutup menu mobile
  };

  // Logout user
  const handleLogout = async () => {
    await logoutUser(); // Panggil logout dari context
    setUserMenuOpen(false); // Tutup dropdown
  };

  // ==========================================
  // RENDER UI
  // ==========================================
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* === KIRI: Logo === */}
          <button
            onClick={goTodo}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-sage-500 to-sage-700 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">PM</span>
            </div>
            <div className="hidden sm:block text-left">
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">
                PriorityMatrix
              </h1>
              <p className="text-xs text-slate-400 dark:text-slate-500 -mt-0.5">
                Fokus pada prioritas
              </p>
            </div>
            <h1 className="sm:hidden text-lg font-bold text-slate-800 dark:text-slate-100">
              PriorityMatrix
            </h1>
          </button>

          {/* === TENGAH: Navigasi Desktop === */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Nav: Todo */}
            <button
              onClick={goTodo} // Ke halaman todo
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                !isDashboard // Aktif jika di todo
                  ? "bg-sage-50 dark:bg-sage-900/40 text-sage-700 dark:text-sage-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              ✓ Todo {/* Label */}
            </button>
            {/* Nav: Dashboard */}
            <button
              onClick={goDashboard} // Ke dashboard
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isDashboard // Aktif jika di dashboard
                  ? "bg-sage-50 dark:bg-sage-900/40 text-sage-700 dark:text-sage-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              📊 Dashboard
            </button>

            {/* Sub-nav: Matrix / List (hanya di halaman todo) */}
            {!isDashboard && (
              <div className="flex items-center gap-1 ml-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => onNavigate("matrix")} // Tampilan matrix
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    currentView === "matrix"
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  Matrix
                </button>
                <button
                  onClick={() => onNavigate("list")} // Tampilan list
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    currentView === "list"
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  List
                </button>
              </div>
            )}
          </nav>

          {/* === KANAN: Stats + Dark Mode + User === */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Stats badge */}
            {stats && !isDashboard && (
              <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {stats.completed}/{stats.total} selesai
                </span>
              </div>
            )}

            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              aria-label={isDark ? "Aktifkan light mode" : "Aktifkan dark mode"}
              title={isDark ? "Light Mode" : "Dark Mode"}
            >
              {isDark ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            {/* User avatar + dropdown */}
            {user && (
              <div className="relative">
                {/* Tombol avatar */}
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)} // Toggle dropdown
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {/* Avatar pengguna */}
                  <AvatarImage user={user} />
                </button>

                {/* Dropdown user */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
                    {/* Nama & email user */}
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                      <p className="font-medium text-sm text-slate-800 dark:text-slate-100 truncate">
                        {user.name} {/* Nama */}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                        {user.email} {/* Email */}
                      </p>
                    </div>

                    {/* Menu: Dashboard */}
                    <button
                      onClick={goDashboard}
                      className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      📊 Dashboard {/* Label */}
                    </button>

                    {/* Menu: Logout */}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                      🚪 Logout {/* Label */}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Hamburger mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* === MENU MOBILE === */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="px-4 py-3 space-y-1">
            {/* Todo */}
            <button
              onClick={goTodo}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                !isDashboard
                  ? "bg-sage-50 dark:bg-sage-900/40 text-sage-700 dark:text-sage-300"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              ✓ Todo
            </button>

            {/* Dashboard */}
            <button
              onClick={goDashboard}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isDashboard
                  ? "bg-sage-50 dark:bg-sage-900/40 text-sage-700 dark:text-sage-300"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              📊 Dashboard
            </button>

            {/* Sub-nav matrix/list (di todo) */}
            {!isDashboard && (
              <div className="flex gap-1 px-2 pt-1">
                <button
                  onClick={() => onNavigate("matrix")}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                    currentView === "matrix"
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                      : "text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800"
                  }`}
                >
                  Matrix
                </button>
                <button
                  onClick={() => onNavigate("list")}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                    currentView === "list"
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                      : "text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800"
                  }`}
                >
                  List
                </button>
              </div>
            )}

            {/* Dark mode toggle mobile */}
            <button
              onClick={toggle}
              className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
            >
              <span className="mr-2">{isDark ? "☀️" : "🌙"}</span>
              {isDark ? "Light Mode" : "Dark Mode"}
            </button>

            {/* Stats mobile */}
            {stats && !isDashboard && (
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">
                  Progres Hari Ini
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {stats.completed} selesai
                  </span>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {stats.total - stats.completed} tersisa
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
