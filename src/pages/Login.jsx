// ==========================================
// IMPORT MODULES & DEPENDENCIES
// ==========================================
import { useState, useEffect } from "react"; // React hooks
import { useNavigate } from "react-router-dom"; // Navigasi setelah login
import { useAuth } from "../context/AuthContext"; // Akses auth context
import { useDarkMode } from "../context/DarkModeContext"; // Akses dark mode

// ==========================================
// COMPONENT: Login
// Halaman login dengan Google OAuth
// ==========================================
export default function Login() {
  // Ambil fungsi login dari context
  const { login, user, loading } = useAuth();

  // Ambil dark mode context
  const { isDark } = useDarkMode();

  // Navigasi router
  const navigate = useNavigate();

  // State untuk menampilkan pesan error dari query string
  const [errorMessage, setErrorMessage] = useState(""); // Default kosong

  // Redirect ke dashboard jika sudah login
  useEffect(() => {
    if (!loading && user) {
      navigate("/", { replace: true }); // Jika sudah login, langsung ke app
    }
  }, [loading, user, navigate]); // Jalankan saat status auth berubah

  // Baca query string untuk pesan error (Google mengarahkan ?error=denied)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search); // Parse query
    if (params.get("error") === "denied") {
      setErrorMessage("Login dibatalkan. Silakan coba lagi."); // Pesan user menolak
    } else if (params.get("error") === "stale") {
      setErrorMessage("Sesi login kedaluwarsa. Silakan coba lagi."); // Pesan cookie hilang / session stale
    }
  }, []); // Hanya sekali saat mount

  // Sudah login → jangan render (loading atau redirect)
  if (loading || user) return null; // Return kosong (redirect dijalankan oleh effect)

  // ==========================================
  // RENDER UI
  // ==========================================
  return (
    // Container full screen dengan gradient background
    <div className="min-h-screen flex items-center justify-center bg-sage-50 bg-gradient-to-br from-sage-100 via-sage-50 to-sage-200/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4">
      {/* Card login */}
      <div className="w-full max-w-md">
        {/* Logo & branding */}
        <div className="text-center mb-8">
          {/* Ikon logo */}
          <div className="w-14 h-14 bg-gradient-to-br from-sage-500 to-sage-700 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
            <span className="text-white font-bold text-xl">PM</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            PriorityMatrix
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Fokus pada prioritas, tingkatkan produktivitas
          </p>
        </div>

        {/* Card form login */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 dark:border-slate-700/60 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">
            Selamat Datang
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Masuk untuk mengelola tugas dan melihat analitikmu
          </p>

          {/* Tombol login Google */}
          <button
            onClick={login} // Redirect ke Google OAuth
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {/* Logo Google (SVG resmi) */}
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
              <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
            </svg>
            Masuk dengan Google
          </button>

          {/* Pesan error jika login denined */}
          {errorMessage && (
            <p className="mt-4 text-center text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg py-2 px-3">
              {errorMessage} {/* Tampilkan pesan error */}
            </p>
          )}

          {/* Catatan privasi */}
          <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
            Login menggunakan akun Google kamu. Data tersimpan aman.
          </p>
        </div>
      </div>
    </div>
  );
}