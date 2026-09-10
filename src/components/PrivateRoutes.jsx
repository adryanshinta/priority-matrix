// ==========================================
// IMPORT MODULES & DEPENDENCIES
// ==========================================
import { Navigate, Outlet } from "react-router-dom"; // Komponen redirect & nested route
import { useAuth } from "../context/AuthContext"; // Akses auth state

// ==========================================
// COMPONENT: PrivateRoutes
// Membungkus halaman yang membutuhkan login
// Menggunakan Outlet (nested route dari main.jsx)
// ==========================================
export default function PrivateRoutes() {
  // Ambil user & loading dari auth context
  const { user, loading } = useAuth(); // user = profil / null

  // Jika masih loading (cek sesi), tampilkan spinner
  if (loading) {
    // Animasi loading penuh halaman
    return (
      <div className="min-h-screen flex items-center justify-center bg-sage-50 bg-gradient-to-br from-sage-100 via-sage-50 to-sage-200/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        {/* Spinner animasi */}
        <div className="w-10 h-10 border-4 border-sage-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Jika tidak login, redirect ke halaman login
  if (!user) {
    return <Navigate to="/login" replace />; // Ganti URL ke /login
  }

  // Jika login, render halaman yang diminta
  return <Outlet />; // Route anak (/, /dashboard)
}