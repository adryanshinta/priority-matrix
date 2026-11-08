-- ==========================================
-- SCHEMA DATABASE: PriorityMatrix Todo
-- PostgreSQL + pgcrypto (gen_random_uuid)
-- ==========================================

-- Aktifkan ekstensi pgcrypto untuk gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==========================================
-- TABEL: users
-- Menyimpan data pengguna dari Google OAuth dan/atau login password.
-- Satu email = satu akun (OAuth & password digabung berdasarkan email).
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- ID unik UUID otomatis
  google_id     TEXT UNIQUE, -- ID pengguna dari Google (NULL jika daftar via password)
  email         TEXT UNIQUE NOT NULL, -- Email (unik, kunci penggabungan akun OAuth & password)
  username      TEXT, -- Username opsional untuk login (unik, case-insensitive)
  password_hash TEXT, -- Hash password (scrypt). NULL jika akun hanya via Google
  name          TEXT NOT NULL, -- Nama lengkap pengguna
  avatar_url    TEXT, -- URL foto profil dari Google
  dark_mode     BOOLEAN NOT NULL DEFAULT FALSE, -- Preferensi tema pengguna (dark/light)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(), -- Waktu akun dibuat
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now() -- Waktu terakhir diupdate
);

-- ==========================================
-- TABEL: tasks
-- Menyimpan todo tasks milik pengguna
-- completed_at adalah linchpin untuk analytics
-- ==========================================
CREATE TABLE IF NOT EXISTS tasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- ID unik UUID otomatis
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Pemilik task (hapus user = hapus task)
  title        TEXT NOT NULL, -- Judul / nama tugas
  quadrant     TEXT NOT NULL CHECK (quadrant IN ('q1', 'q2', 'q3', 'q4')), -- Kuadran Eisenhower (validasi via CHECK)
  completed    BOOLEAN NOT NULL DEFAULT FALSE, -- Status selesai/belum
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(), -- Waktu task dibuat
  completed_at TIMESTAMPTZ, -- Waktu task diselesaikan (NULL jika belum selesai) - kunci analytics
  edited_at    TIMESTAMPTZ, -- Waktu task terakhir di-edit (NULL jika belum pernah diedit)
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now() -- Waktu terakhir diupdate
);

-- Index untuk mempercepat query tasks per user (urut by created_at desc)
CREATE INDEX IF NOT EXISTS idx_tasks_user_created ON tasks (user_id, created_at DESC);

-- Partial index khusus rows completed (untuk query analytics yang cepat)
CREATE INDEX IF NOT EXISTS idx_tasks_user_completed
  ON tasks (user_id, completed_at)
  WHERE completed_at IS NOT NULL;

-- ==========================================
-- TABEL: refresh_tokens
-- Menyimpan hash refresh token untuk rotasi & revoke
-- ==========================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- ID unik UUID otomatis
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Pemilik token
  token_hash       TEXT UNIQUE NOT NULL, -- SHA-256 hash dari token (token asli tidak pernah disimpan)
  expires_at       TIMESTAMPTZ NOT NULL, -- Waktu kedaluwarsa token (absolute, 7 hari sejak dibuat)
  last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT now(), -- Waktu terakhir token diakses (untuk inactivity timeout)
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(), -- Waktu token dibuat
  revoked_at       TIMESTAMPTZ -- Waktu token dicabut (NULL = masih aktif)
);

-- Index untuk mempercepat lookup refresh token per user
CREATE INDEX IF NOT EXISTS idx_refresh_user ON refresh_tokens (user_id);

-- ==========================================
-- MIGRASI (idempotent) untuk database yang sudah ada
-- Aman dijalankan berulang kali.
-- ==========================================

-- Akun password tidak punya google_id → kolom harus boleh NULL
ALTER TABLE users ALTER COLUMN google_id DROP NOT NULL;

-- Kolom baru untuk autentikasi manual (password)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;

-- Kolom baru pada tasks untuk melacak waktu edit
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

-- Kolom baru pada refresh_tokens untuk inactivity timeout
ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Username unik tanpa peduli huruf besar/kecil (partial: username boleh NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower
  ON users (lower(username))
  WHERE username IS NOT NULL;
