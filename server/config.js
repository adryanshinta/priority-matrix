// ==========================================
// IMPORT MODULES & DEPENDENCIES
// ==========================================
import "dotenv/config"; // Load variabel environment dari file .env

// ==========================================
// KONFIGURASI APLIKASI
// Validasi fail-fast: pastikan semua env yang dibutuhkan tersedia
// ==========================================

// Helper untuk mengecek env wajib di production
const required = ["DATABASE_URL", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REDIRECT_URI", "CLIENT_URL"];

// Hanya validasi ketat di production (dev bisa mulai tanpa semua env)
// SKIP saat Vercel build: Vercel inject env hanya di runtime (serverless),
// bukan saat build. Throw saat build = build gagal tanpa bisa jalankan app.
const isVercel = process.env.VERCEL === "1"; // Deteksi Vercel environment
if (process.env.NODE_ENV === "production" && !isVercel) {
  const missing = required.filter((key) => !process.env[key]); // Cari env yang kosong
  if (missing.length > 0) {
    // Jika ada yang kurang, throw error dengan pesan jelas (fail-fast)
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

// ==========================================
// EKSPOR KONFIGURASI
// ==========================================
export const config = {
  // Mode aplikasi
  env: process.env.NODE_ENV || "development", // Default ke development

  // Port server
  port: process.env.PORT || 3000, // Default 3000

  // Database
  databaseUrl: process.env.DATABASE_URL, // URL koneksi PostgreSQL

  // JWT secrets
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "dev_access_secret", // Secret access token (dev fallback)
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "dev_refresh_secret", // Secret refresh token (dev fallback)

  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID, // Client ID dari Google Cloud
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET, // Client Secret dari Google Cloud
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI, // URI callback yang didaftarkan di Google

  // Client URL (origin frontend)
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173", // Default dev frontend
};

// ==========================================
// HELPER: getClientOrigin(req)
// Mengambil origin frontend yang benar untuk redirect.
// Prioritas:
//  1. CLIENT_URL env (jika di-set — production di Render)
//  2. Header request (x-forwarded-host / host) — Vercel & proxy
// Di Vercel, CLIENT_URL sering tidak di-set tapi host-nya tersedia di header.
// ==========================================
export function getClientOrigin(req) {
  // Jika CLIENT_URL di-set (misal Render), pakai itu — lebih pasti
  if (process.env.CLIENT_URL) return process.env.CLIENT_URL;

  // Fallback: baca host dari request header
  // Vercel set x-forwarded-host = domain asli yang diakses user
  const proto = req.headers["x-forwarded-proto"] || (req.secure ? "https" : "http"); // http/https
  const host = req.headers["x-forwarded-host"] || req.headers.host; // domain:port

  // Jika ada host, bangun origin dari proto + host
  if (host) return `${proto}://${host}`;

  // Last resort: default dev
  return "http://localhost:5173";
}