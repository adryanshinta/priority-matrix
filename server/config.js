// ==========================================
// Konfigurasi aplikasi
// Load env + validasi fail-fast untuk production runtime.
// ==========================================

import "dotenv/config";

const isVercel = process.env.VERCEL === "1";
const isProduction = process.env.NODE_ENV === "production";
const isProductionRuntime = isProduction && !isVercel;

const requiredForProduction = [
  "DATABASE_URL",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REDIRECT_URI",
  "CLIENT_URL",
];

if (isProductionRuntime) {
  const missing = requiredForProduction.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables in production: ${missing.join(", ")}`,
    );
  }
}

if (!process.env.GOOGLE_CLIENT_ID && !isVercel) {
  console.warn(
    "Peringatan: GOOGLE_CLIENT_ID tidak diatur. OAuth Google hanya akan berfungsi jika diisi.",
  );
}

export const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT, 10) || 3000,
  databaseUrl: process.env.DATABASE_URL,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "dev_access_secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "dev_refresh_secret",
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
};

// Helper: ambil origin frontend yang benar untuk redirect.
// Prioritas:
//  1. CLIENT_URL env (jika di-set — production di Render)
//  2. Header request (x-forwarded-host / host) — Vercel & proxy
// Di Vercel, CLIENT_URL sering tidak di-set tapi host-nya tersedia di header.
export function getClientOrigin(req) {
  if (process.env.CLIENT_URL) return process.env.CLIENT_URL;

  const proto = req.headers["x-forwarded-proto"] || (req.secure ? "https" : "http");
  const host = req.headers["x-forwarded-host"] || req.headers.host;

  if (host) return `${proto}://${host}`;

  return "http://localhost:5173";
}

export function assertGoogleConfigured() {
  if (!config.googleClientId || !config.googleClientSecret || !config.googleRedirectUri) {
    throw new Error(
      "Konfigurasi Google OAuth belum lengkap. Pastikan GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, dan GOOGLE_REDIRECT_URI diatur.",
    );
  }
}
