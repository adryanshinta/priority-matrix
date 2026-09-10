// ==========================================
// IMPORT MODULES & DEPENDENCIES
// ==========================================
import { createContext, useContext, useState, useEffect, useCallback } from "react"; // React hooks
import { getMe, logout } from "../api/client"; // API auth methods
import { useDarkMode } from "./DarkModeContext"; // Akses dark mode context (untuk sinkronisasi)

// ==========================================
// CREATE CONTEXT
// ==========================================
const AuthContext = createContext(); // Context untuk state autentikasi

// ==========================================
// CUSTOM HOOK: useAuth
// ==========================================
export function useAuth() {
  const context = useContext(AuthContext); // Ambil value context
  if (!context) throw new Error("useAuth harus dalam AuthProvider"); // Validasi pemakaian
  return context; // { user, loading, login, logoutUser }
}

// ==========================================
// PROVIDER COMPONENT
// ==========================================
export function AuthProvider({ children }) {
  // State user (null = belum login / sedang loading)
  const [user, setUser] = useState(null);

  // State loading (true saat cek sesi pertama kali)
  const [loading, setLoading] = useState(true); // Default loading dulu

  // Ambil dark mode context untuk sinkronisasi preferensi user
  const { isDark } = useDarkMode(); // Nilai dark mode saat ini

  // Fungsi untuk memuat profil user
  const loadUser = useCallback(async () => {
    try {
      // GET /api/auth/me → profil user yang login
      const { status, data } = await getMe();
      if (status === 200 && data?.user) {
        setUser(data.user); // Set user state
        // Sinkronkan dark mode user ke database (jika ada di server)
        // // TODO: API_INTEGRATION_POINT - Sinkronkan preferensi dark mode dari DM ke akun user
      } else {
        setUser(null); // Tidak login
      }
    } catch {
      setUser(null); // Error → anggap tidak login
    } finally {
      setLoading(false); // Selesai loading
    }
  }, []);

  // Load user saat komponen pertama kali render
  useEffect(() => {
    loadUser(); // Panggil fungsi load

    // Listener: saat event auth-expired dikirim (dari logout / refresh gagal)
    const handleAuthExpired = () => {
      setUser(null); // Hapus user state
    };
    window.addEventListener("auth-expired", handleAuthExpired); // Tambah listener
    return () => window.removeEventListener("auth-expired", handleAuthExpired); // Cleanup
  }, [loadUser]);

  // Sinkronkan dark mode user ke server ketika isDark berubah
  useEffect(() => {
    // Hanya jika user sudah login
    if (user) {
      // Hanya sinkronkan setelah loading selesai (hindari overwrite nilai server)
      if (!loading) {
        // Kirim preferensi dark mode ke database
        fetch("/api/auth/me", {
          method: "PATCH", // Update partial
          credentials: "include", // Kirim cookie
          headers: { "Content-Type": "application/json" }, // Format JSON
          body: JSON.stringify({ dark_mode: isDark }), // Nilai dark mode
        }).catch(() => {}); // Abaikan error (non-bloking)
      }
    }
  }, [isDark, user, loading]); // Jalankan saat isDark atau user berubah

  // Fungsi login: redirect ke Google OAuth
  const login = useCallback(() => {
    window.location.href = "/api/auth/google"; // Full page redirect ke Google consent
  }, []);

  // Fungsi logout: bersihkan sesi
  const logoutUser = useCallback(async () => {
    await logout(); // Panggil endpoint logout → revoke refresh + hapus cookie
    setUser(null); // Hapus user di state
  }, []);

  // ==========================================
  // RENDER PROVIDER
  // ==========================================
  return (
    <AuthContext.Provider value={{ user, loading, login, logoutUser }}>
      {children} {/* Render komponen anak */}
    </AuthContext.Provider>
  );
}