// ==========================================
// IMPORT MODULES & DEPENDENCIES
// ==========================================
import express from "express"; // Framework web Express
import cookieParser from "cookie-parser"; // Parse cookie dari request
import { existsSync } from "fs"; // Cek file ada (untuk static dist)
import { dirname, join } from "path"; // Utilitas path
import { fileURLToPath } from "url"; // Konversi URL ke path (ESM)
import authRoutes from "./routes/auth.routes.js"; // Route autentikasi Google OAuth
import taskRoutes from "./routes/tasks.routes.js"; // Route CRUD task
import analyticsRoutes from "./routes/analytics.routes.js"; // Route analytics dashboard
import { errorHandler } from "./middleware/error.js"; // Error handler sentral

// ==========================================
// VARIABEL PATH
// ==========================================
const __dirname = dirname(fileURLToPath(import.meta.url)); // Direktori file ini
const distPath = join(__dirname, "..", "dist"); // Path folder build Vite
const hasDist = existsSync(join(distPath, "index.html")); // Cek apakah sudah di-build

// ==========================================
// BUAT EXPRESS APP
// ==========================================
const app = express(); // Instance Express

// ==========================================
// MIDDLEWARE DASAR
// ==========================================
app.use(express.json()); // Parse JSON body dari request
app.use(express.urlencoded({ extended: true })); // Parse form-urlencoded body
app.use(cookieParser()); // Parse cookies menjadi req.cookies

// ==========================================
// MOUNT API ROUTES
// ==========================================
app.use("/api/auth", authRoutes); // Route /api/auth/* → autentikasi
app.use("/api/tasks", taskRoutes); // Route /api/tasks/* → CRUD task
app.use("/api/analytics", analyticsRoutes); // Route /api/analytics → analytics

// ==========================================
// STATIC + SPA FALLBACK (Production / Non-Vercel)
// Express serve hasil build Vite (frontend) + API
// Di Vercel, static ditangani Vercel (levat rewrites) —
// jadi skip block ini jika environment Vercel (VERCEL=1).
// ==========================================
const isVercel = process.env.VERCEL === "1"; // Deteksi Vercel serverless environment
if (hasDist && !isVercel) {
  // Serve file statis dari folder dist
  app.use(express.static(distPath)); // CSS, JS, gambar dll

  // SPA fallback: semua route non-API dikembalikan ke index.html
  // Penting agar deep link (/dashboard, /login) tetap jalan saat reload
  app.get("*", (req, res, next) => {
    // Abaikan request API (harus diproses route di atas, bukan fallback)
    if (req.path.startsWith("/api")) return next(); // Lanjut ke error handler

    // Kirim index.html untuk client-side routing
    res.sendFile(join(distPath, "index.html")); // BrowserRouter handle route di client
  });
}

// ==========================================
// ERROR HANDLER (harus terakhir)
// ==========================================
app.use(errorHandler); // Tangkap semua error ke JSON response

// ==========================================
// EKSPOR APP
// ==========================================
export default app; // Digunakan index.js untuk listen