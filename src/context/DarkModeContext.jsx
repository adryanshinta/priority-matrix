// ==========================================
// IMPORT MODULES & DEPENDENCIES
// ==========================================
import { createContext, useContext, useState, useEffect } from "react"; // React hooks untuk context dan state

// ==========================================
// CREATE CONTEXT
// Membuat React Context untuk dark mode
// ==========================================
const DarkModeContext = createContext(); // Buat context baru dengan default undefined

// ==========================================
// CUSTOM HOOK: useDarkMode
// Hook untuk mengakses dark mode state dari component manapun
// ==========================================
export function useDarkMode() {
  const context = useContext(DarkModeContext); // Ambil value dari context
  if (!context) { // Jika hook dipanggil di luar Provider
    throw new Error("useDarkMode harus digunakan di dalam DarkModeProvider"); // Lempar error
  }
  return context; // Kembalikan { isDark, toggle }
}

// ==========================================
// PROVIDER COMPONENT
// Membungkus aplikasi dan menyediakan dark mode state
// ==========================================
export function DarkModeProvider({ children }) {
  // State untuk menyimpan status dark mode
  // // TODO: API_INTEGRATION_POINT - Ambil preferensi dark mode dari user profile di database
  const [isDark, setIsDark] = useState(() => {
    // Cek localStorage terlebih dahulu untuk preferensi yang tersimpan
    const saved = localStorage.getItem("dark_mode"); // Ambil dari localStorage
    if (saved !== null) { // Jika ada data tersimpan
      return JSON.parse(saved); // Gunakan nilai tersimpan
    }
    // Jika belum ada, cek preferensi sistem operasi user
    return window.matchMedia("(prefers-color-scheme: dark)").matches; // true jika sistem gelap
  });

  // Effect untuk meng-toggle class "dark" di element <html>
  useEffect(() => {
    const html = document.documentElement; // Ambil element <html>
    if (isDark) { // Jika dark mode aktif
      html.classList.add("dark"); // Tambahkan class "dark"
    } else { // Jika light mode
      html.classList.remove("dark"); // Hapus class "dark"
    }
    // // TODO: API_INTEGRATION_POINT - Simpan preferensi dark mode ke user profile di database
    localStorage.setItem("dark_mode", JSON.stringify(isDark)); // Simpan ke localStorage
  }, [isDark]); // Jalankan ulang saat isDark berubah

  // Effect untuk mendengarkan perubahan preferensi sistem
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)"); // Buat media query listener

    const handleChange = (e) => {
      // Hanya update jika user belum pernah set manual (tidak ada di localStorage)
      if (localStorage.getItem("dark_mode") === null) { // Cek localStorage
        setIsDark(e.matches); // Update sesuai preferensi sistem baru
      }
    };

    mediaQuery.addEventListener("change", handleChange); // Tambahkan listener
    return () => mediaQuery.removeEventListener("change", handleChange); // Cleanup saat unmount
  }, []); // Hanya jalan sekali saat mount

  // Fungsi untuk toggle dark mode
  const toggle = () => setIsDark((prev) => !prev); // Balik nilai isDark

  // ==========================================
  // RENDER PROVIDER
  // ==========================================
  return (
    // Context Provider membungkus children dengan value
    <DarkModeContext.Provider value={{ isDark, toggle }}>
      {children} {/* Render komponen anak */}
    </DarkModeContext.Provider>
  );
}
