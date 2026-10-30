// ==========================================
// CONTEXT: DarkMode
// Preferensi tema (dark / light), tersimpan di database (jika login)
// dan localStorage (fallback).
// ==========================================

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";

const DarkModeContext = createContext();

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error("useDarkMode harus digunakan di dalam DarkModeProvider");
  }
  return context;
}

export function DarkModeProvider({ children }) {
  const auth = useAuth();
  const { user, loading: authLoading } = auth;

  // Urutan prioritas:
  //  1. Dark mode dari server (jika user login & data sudah di-load)
  //  2. localStorage (untuk guest/non-login atau sebelum user loaded)
  //  3. preferensi sistem (prefers-color-scheme)
  const [isDark, setIsDark] = useState(() => {
    if (user && user.dark_mode !== undefined) {
      return Boolean(user.dark_mode);
    }
    const saved = localStorage.getItem("dark_mode");
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Sinkronkan class <html> & localStorage saat tema berubah
  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    localStorage.setItem("dark_mode", JSON.stringify(isDark));
  }, [isDark]);

  // Dengarkan perubahan preferensi sistem operasi.
  // Update hanya diterapkan jika user belum pernah mengatur tema secara manual
  // (tidak ada nilai di localStorage), sehingga tidak mengabaikan pilihan user.
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      const saved = localStorage.getItem("dark_mode");
      if (saved === null) {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Patch ke server saat tema berubah (hanya jika login)
  const syncDarkMode = useCallback(
    async (darkMode) => {
      if (!user) return;

      try {
        const res = await fetch("/api/auth/me", {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dark_mode: darkMode }),
        });

        if (!res.ok) {
          console.warn("Gagal menyinkronkan dark mode ke server:", res.status);
        }
      } catch {
        // Jangan blokir UI jika network gagal
      }
    },
    [user],
  );

  // Kirim ke server setiap kali isDark berubah (non-blocking).
  useEffect(() => {
    if (!authLoading && user) {
      syncDarkMode(isDark);
    }
  }, [isDark, authLoading, user, syncDarkMode]);

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      syncDarkMode(next);
      return next;
    });
  }, [syncDarkMode]);

  return (
    <DarkModeContext.Provider value={{ isDark, toggle }}>
      {children}
    </DarkModeContext.Provider>
  );
}
