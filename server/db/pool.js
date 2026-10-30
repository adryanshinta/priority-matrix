// ==========================================
// DATABASE POOL
// Pool koneksi PostgreSQL untuk seluruh aplikasi
// ==========================================

import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

// Production runtime wajib SSL (Neon, Render, Railway, dan managed PG lain).
// Vercel build: VERCEL=1 berarti production serverless → SSL juga wajib.
// Development lokal: tanpa SSL (koneksi localhost).
const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
};

if (isProduction) {
  poolConfig.ssl = {
    rejectUnauthorized: false, // Managed PG menggunakan sertifikat — abaikan verifikasi
  };
}

// Buat pool koneksi baru
export const pool = new Pool(poolConfig);

// Helper query yang bisa dipakai di route/Service.
export const query = (text, params) => pool.query(text, params);
