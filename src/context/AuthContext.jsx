// ==========================================
// CONTEXT: Auth
// Menyediakan state sesi (user, loading) dan aksi login/logout.
// Sinkronisasi dilakukan melalui api/client.js.
// ==========================================

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getMe,
  loginWithGoogle,
  logout,
  loginWithPassword as apiLoginWithPassword,
  registerUser as apiRegisterUser,
} from "../api/client";
import { useDarkMode } from "./DarkModeContext";

const AuthContext = createContext({
  user: null,
  loading: true,
  login: () => {},
  loginWithPassword: async () => ({ ok: false }),
  register: async () => ({ ok: false }),
  logoutUser: async () => {},
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus dipanggil di dalam AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDark } = useDarkMode();

  const loadUser = useCallback(async () => {
    try {
      const { status, data } = await getMe();
      if (status === 200 && data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load user saat mount & tangani event auth-expired
  useEffect(() => {
    loadUser();

    const handleAuthExpired = () => setUser(null);
    window.addEventListener("auth-expired", handleAuthExpired);
    return () => window.removeEventListener("auth-expired", handleAuthExpired);
  }, [loadUser]);

  // Sinkronkan preferensi tema ke server setiap berubah.
  // Hanya dijalankan jika user sudah login dan loading profil selesai,
  // agar tidak menimpa nilai yang baru saja diambil dari server.
  useEffect(() => {
    if (!user || loading) return;

    const sync = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dark_mode: isDark }),
        });

        if (!res.ok) {
          console.warn("Gagal menyinkronkan preferensi tema:", res.status);
        }
      } catch {
        // Jangan blokir UI jika network bermasalah
      }
    };

    sync();
  }, [isDark, user, loading]);

  // Login via redirect ke Google OAuth
  const login = useCallback(() => {
    loginWithGoogle();
  }, []);

  // Login manual (email/username + password).
  // Mengembalikan { ok, data } agar UI bisa menampilkan pesan kegagalan.
  const loginWithPassword = useCallback(async (identifier, password) => {
    const { status, data } = await apiLoginWithPassword(identifier, password);
    if (status === 200 && data?.user) {
      setUser(data.user);
      return { ok: true, data };
    }
    return { ok: false, data };
  }, []);

  // Registrasi akun baru, langsung login jika berhasil
  const register = useCallback(async (payload) => {
    const { status, data } = await apiRegisterUser(payload);
    if (status === 201 && data?.user) {
      setUser(data.user);
      return { ok: true, data };
    }
    return { ok: false, data };
  }, []);

  const logoutUser = useCallback(async () => {
    await logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, loginWithPassword, register, logoutUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
