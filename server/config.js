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
if (process.env.NODE_ENV === "production") {
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