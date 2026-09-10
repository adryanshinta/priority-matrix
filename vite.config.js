import { defineConfig } from "vite"; // Import fungsi defineConfig dari Vite
import react from "@vitejs/plugin-react"; // Import plugin React untuk Vite

// Ekspor konfigurasi Vite dengan plugin React + proxy untuk backend
export default defineConfig({
  plugins: [react()], // Aktifkan plugin React agar JSX/JS modern bisa di-build
  server: {
    // Proxy untuk development: semua request /api diteruskan ke Express backend
    proxy: {
      "/api": {
        target: "http://localhost:3000", // URL backend Express di dev
        changeOrigin: true, // Ubah origin header agar cocok dengan target
      },
    },
  },
});