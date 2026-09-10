// ==========================================
// IMPORT MODULES & DEPENDENCIES
// ==========================================
import "dotenv/config"; // Load variabel environment dari file .env
import pg from "pg"; // PostgreSQL client

// ==========================================
// DATABASE POOL
// Pool koneksi PostgreSQL untuk seluruh aplikasi
// ==========================================
const { Pool } = pg; // Destructure class Pool dari modul pg

// Konfigurasi untuk production (Render/Railway menuntut SSL)
const sslConfig =
  process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false } // Render PG pakai self-signed cert - abaikan verifikasi
    : undefined; // Dev lokal pakai koneksi biasa

// Buat pool koneksi baru
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // URL koneksi dari environment
  ssl: sslConfig, // Aktifkan SSL hanya di production
});

// ==========================================
// QUERY HELPER
// Fungsi pembungkus query async agar error mudah ditangani
// ==========================================
export const query = (text, params) => pool.query(text, params); // Jalankan query dengan parameter