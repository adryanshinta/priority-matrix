// ==========================================
// IMPORT MODULES & DEPENDENCIES
// ==========================================
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDarkMode } from "../context/DarkModeContext";
import { useAuth } from "../context/AuthContext";
import AvatarImage from "./AvatarImage";
import {
  CheckCircleIcon,
  ChartIcon,
  GridIcon,
  ListIcon,
  SunIcon,
  MoonIcon,
  LogOutIcon,
  TargetIcon,
} from "./Icons";

// ==========================================
// COMPONENT: Header
// Navigasi header responsif: logo, nav, dark mode toggle, user menu.
// Props:
//   - currentView: "matrix" | "list"
//   - onNavigate: ubah tampilan todo
//   - stats: { total, completed }
// ==========================================
export default function Header({ currentView, onNavigate, stats }) {
  const [menuOpen, setMenuOpen] = useState(false); // Menu mobile
  const [userMenuOpen, setUserMenuOpen] = useState(false); // Dropdown user

  const navigate = useNavigate(); // Pindah halaman
  const location = useLocation(); // Path saat ini

  const { isDark, toggle } = useDarkMode(); // Dark mode
  const { user, logoutUser } = useAuth(); // Profil + logout

  const isDashboard = location.pathname === "/dashboard"; // Sedang di dashboard?

  // ── Handlers ────────────────────────────────────────────────────────────────
  const goTodo = () => {
    navigate("/");
    setMenuOpen(false);
    setUserMenuOpen(false);
  };

  const goDashboard = () => {
    navigate("/dashboard");
    setMenuOpen(false);
    setUserMenuOpen(false);
  };

  const handleLogout = async () => {
    await logoutUser();
    setUserMenuOpen(false);
  };

  // Gaya tombol navigasi utama (aktif/tidak)
  const navClass = (active) =>
    `inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      active
        ? "bg-sage-50 dark:bg-sage-900/40 text-sage-700 dark:text-sage-300 shadow-sm"
        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-700/70 shadow-sm">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* === KIRI: Logo === */}
          <button onClick={goTodo} className="flex items-center gap-2.5 cursor-pointer group">
            <span className="w-9 h-9 bg-gradient-to-br from-sage-500 to-sage-700 rounded-xl grid place-items-center shadow-md transition-transform duration-300 group-hover:scale-105">
              <TargetIcon className="w-5 h-5 text-white" strokeWidth={2.1} />
            </span>
            <span className="text-left">
              <span className="block text-[15px] sm:text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">
                Priority<span className="text-gradient-sage">Matrix</span>
              </span>
              <span className="hidden sm:block text-[11px] text-slate-400 dark:text-slate-500 -mt-0.5">
                Fokus pada prioritas
              </span>
            </span>
          </button>

          {/* === TENGAH: Navigasi Desktop === */}
          <nav className="hidden md:flex items-center gap-1">
            <button onClick={goTodo} className={navClass(!isDashboard)}>
              <CheckCircleIcon className="w-4 h-4" /> Todo
            </button>
            <button onClick={goDashboard} className={navClass(isDashboard)}>
              <ChartIcon className="w-4 h-4" /> Dashboard
            </button>

            {/* Sub-nav: Matrix / List (hanya di halaman todo) */}
            {!isDashboard && (
              <div className="flex items-center gap-1 ml-2 pl-3 border-l border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => onNavigate("matrix")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    currentView === "matrix"
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <GridIcon className="w-3.5 h-3.5" /> Matrix
                </button>
                <button
                  onClick={() => onNavigate("list")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    currentView === "list"
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <ListIcon className="w-3.5 h-3.5" /> List
                </button>
              </div>
            )}
          </nav>

          {/* === KANAN: Stats + Dark Mode + User === */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Ringkasan progres */}
            {stats && !isDashboard && (
              <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {stats.completed}/{stats.total} selesai
                </span>
              </div>
            )}

            {/* Toggle tema */}
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 active:scale-90"
              aria-label={isDark ? "Aktifkan light mode" : "Aktifkan dark mode"}
              title={isDark ? "Light Mode" : "Dark Mode"}
            >
              {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>

            {/* Avatar + dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Menu pengguna"
                  aria-expanded={userMenuOpen}
                >
                  <AvatarImage user={user} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50 animate-scale-in origin-top-right">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                      <p className="font-medium text-sm text-slate-800 dark:text-slate-100 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                        {user.email}
                      </p>
                    </div>

                    <button
                      onClick={goDashboard}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2.5 transition-colors"
                    >
                      <ChartIcon className="w-4 h-4" /> Dashboard
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2.5 transition-colors"
                    >
                      <LogOutIcon className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Hamburger mobile */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Buka menu"
              aria-expanded={menuOpen}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* === MENU MOBILE === */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 animate-fade-in-down">
          <div className="px-3.5 py-3 space-y-1">
            <button
              onClick={goTodo}
              className={`w-full flex items-center gap-2.5 text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                !isDashboard
                  ? "bg-sage-50 dark:bg-sage-900/40 text-sage-700 dark:text-sage-300"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <CheckCircleIcon className="w-4 h-4" /> Todo
            </button>

            <button
              onClick={goDashboard}
              className={`w-full flex items-center gap-2.5 text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isDashboard
                  ? "bg-sage-50 dark:bg-sage-900/40 text-sage-700 dark:text-sage-300"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <ChartIcon className="w-4 h-4" /> Dashboard
            </button>

            {/* Sub-nav matrix/list */}
            {!isDashboard && (
              <div className="flex gap-1.5 px-1 pt-1">
                <button
                  onClick={() => onNavigate("matrix")}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                    currentView === "matrix"
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                      : "text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800"
                  }`}
                >
                  <GridIcon className="w-3.5 h-3.5" /> Matrix
                </button>
                <button
                  onClick={() => onNavigate("list")}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                    currentView === "list"
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                      : "text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800"
                  }`}
                >
                  <ListIcon className="w-3.5 h-3.5" /> List
                </button>
              </div>
            )}

            {/* Toggle tema mobile */}
            <button
              onClick={toggle}
              className="w-full flex items-center gap-2.5 text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
            >
              {isDark ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
              {isDark ? "Light Mode" : "Dark Mode"}
            </button>

            {/* Ringkasan progres mobile */}
            {stats && !isDashboard && (
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Progres Hari Ini</p>
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
