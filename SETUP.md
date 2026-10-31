# 🚀 PriorityMatrix — Panduan Setup Lengkap

Aplikasi todo Eisenhower Matrix + Google OAuth + Dashboard Analytics + PostgreSQL.

## Arsitektur

```
Frontend (React + Vite + Tailwind)  →  Express API  →  PostgreSQL
         │                                │
         └────── same-origin (cookie httpOnly) ──────┘
```

- **Satu service** untuk deploy (Express serve built Vite)
- **httpOnly cookies** untuk token (aman dari XSS)
- **PostgreSQL** untuk semua data (users, tasks, analytics)

---

## ✅ LANGKAH 1: Setup Google OAuth (wajib)

Kamu perlu **Google Client ID & Secret** untuk fitur login. Ikuti langkah ini:

### 1.1 Buka Google Cloud Console
1. Buka [console.cloud.google.com](https://console.cloud.google.com)
2. Login dengan Google account kamu
3. Klik **Select Project** (atas kiri) → **New Project**
4. Beri nama misal `priority-matrix` → **Create** → tunggu selesai

### 1.2 Konfigurasi OAuth Consent Screen
1. Menu → **APIs & Services** → **OAuth consent screen**
2. Pilih **External** → **Create**
3. Isi form:
   - **App name**: `PriorityMatrix`
   - **User support email**: email kamu
   - **Developer contact**: email kamu
4. **Save and Continue** hingga selesai
5. Di bagian **Audience**, tambahkan email kamu sebagai **Test user** (atau klik **Publish** jika mau rilis)

### 1.3 Buat OAuth Client ID
1. Menu → **APIs & Services** → **Credentials**
2. Klik **Create Credentials** → **OAuth client ID**
3. **Application type**: `Web application`
4. **Name**: `PriorityMatrix Web`
5. **Authorized redirect URIs** — tambahkan DUA URI ini (PENTING! harus persis):
   ```
   http://localhost:3000/api/auth/google/callback
   ```
   *(nanti tambahkan juga URL production Render)*
6. Klik **Create**

### 1.4 Copy Credentials
- Setelah create, akan muncul **Client ID** dan **Client Secret**
- Salin keduanya — masukkan ke `.env` di Langkah 3

> ⚠️ **Screenshot reference**: Client ID biasanya berakhiran `.apps.googleusercontent.com`

---

## ✅ LANGKAH 2: Setup PostgreSQL (lokal untuk development)

### 2.1 Cek instalasi (sudah terpasang via PostgreSQL 18)
```bash
psql --version
```
Sudah OK (terlihat PostgreSQL 18.4).

### 2.2 Buat database & user
Buka terminal, jalankan (pakai password `postgres` yang kamu set saat install):
```bash
psql -U postgres
```

Lalu dalam postgres shell:
```sql
-- Buat database untuk aplikasi
CREATE DATABASE prioritymatrix;

-- (opsional) Buat user khusus aplikasi, lebih aman dari pakai postgres
CREATE USER priority_user WITH PASSWORD 'password_aman_disini';
GRANT ALL PRIVILEGES ON DATABASE prioritymatrix TO priority_user;

-- Keluar
\q
```

> 🔑 **Butuh dari kamu**: password user `postgres` kamu. Jika lupa, set ulang:
> `ALTER USER postgres PASSWORD 'password_baru';`

---

## ✅ LANGKAH 3: Buat file `.env`

Dari root project:

```bash
cp .env.example .env
```

Lalu edit `.env` — isi semua nilai:

```env
# Database
DATABASE_URL=postgres://priority_user:password_aman_disini@localhost:5432/prioritymatrix

# JWT (generate dengan perintah ini lalu paste):
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_ACCESS_SECRET=<hex_32_byte_1>
JWT_REFRESH_SECRET=<hex_32_byte_2>

# Google OAuth dari Langkah 1.4
GOOGLE_CLIENT_ID=<dari_google_cloud>
GOOGLE_CLIENT_SECRET=<dari_google_cloud>
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

---

## ✅ LANGKAH 4: Jalankan Migrasi Database

```bash
npm run db:migrate
```

Jika berhasil:
```
✅ Terhubung ke database
✅ Schema berhasil dibuat / sudah ada
📋 Tabel yang tersedia: refresh_tokens, tasks, users
```

---

## ✅ LANGKAH 5: Jalankan Aplikasi (Development)

```bash
npm run dev
```

Ini menjalankan duanya sekaligus (concurrently):
- **Frontend** → http://localhost:5173
- **Backend** → http://localhost:3000

Buka http://localhost:5173 → klik **"Masuk dengan Google"**.

Jika sebelumnya kamu punya data todo di localStorage, akan muncul banner **"Import Tugas"** → klik untuk migrasi ke akun.

---

## 🎯 DASHBOARD ANALYTICS

Setelah login, klik **"📊 Dashboard"** di header.

Fitur:
- **Filter** per hari/minggu (7/30/90 hari)
- **KPI tiles**: total, selesai, completion rate, rata-rata/hari
- **Area chart**: tugas selesai per periode
- **Bar chart**: distribusi 4 kuadran (warna identity)
- **Line chart**: tren tingkat penyelesaian

---

## 🚢 DEPLOY KE VERCEL + NEON (Production, Gratis 🔥)

Rencana: **Vercel** (hosting frontend + serverless backend) + **Neon** (Postgres gratis).

Keuntungan vs Render:
- **Gratis penuh** (tanpa kartu kredit)
- Frontend & API di **satu domain** Vercel → cookie httpOnly jalan tanpa CORS
- Express otomatis jadi serverless function lewat `api/index.js`

### 6.1 Push repo ke GitHub (sudah selesai)
```bash
git remote add origin https://github.com/adryanshinta/priority-matrix.git
git push -u origin main
```

### 6.2 Setup Neon Postgres (gratis)
1. Daftar di [neon.tech](https://neon.tech) → **Sign up** (bisa login Google, **tanpa kartu**)
2. Buat project pertama → pilih region terdekat (Singapore untuk kamu)
3. Di dashboard, klik **Connect** → salin **Connection string** (format `postgresql://user:pass@ep-xxx.region.neon.tech/dbname`)
4. Salin apa adanya (termasuk `?sslmode=require` jika ada) — aplikasi
   menormalkan parameter SSL otomatis, jadi tidak perlu diubah manual

### 6.3 Setup Vercel (gratis)
1. Daftar di [vercel.com](https://vercel.com) → **Sign up** (bisa login GitHub, **tanpa kartu**)
2. **Add New → Project** → pilih repo `priority-matrix` → **Import**

### 6.4 Konfigurasi Project di Vercel

**Build Settings** (framework auto-detect seharusnya menangkap Vite):
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

**Environment Variables** (tab **Settings → Environment Variables**, tambahkan production):
```
DATABASE_URL=<Connection string Neon dari 6.2>
JWT_ACCESS_SECRET=<hex_32_byte>
JWT_REFRESH_SECRET=<hex_32_byte>
GOOGLE_CLIENT_ID=<dari Google Cloud Console>
GOOGLE_CLIENT_SECRET=<dari Google Cloud Console>
GOOGLE_REDIRECT_URI=https://<nama-proyek>-<hash>.vercel.app/api/auth/google/callback
CLIENT_URL=https://<nama-proyek>-<hash>.vercel.app
```

> ⚠️ **Vercel otomatis set `NODE_ENV=production` dan `VERCEL=1`** — tidak perlu manual.

> **Generate JWT secrets:**
> `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` (jalankan 2x, beda hasil)

### 6.5 Deploy + Migrasi
1. Klik **Deploy** di Vercel → tunggu build selesai (~1-3 menit) → dapat URL `https://...vercel.app`
2. **Migrasi database** — dari terminal lokal, arahkan ke Neon:
   ```bash
   DATABASE_URL="<Connection string Neon>" NODE_ENV=production npm run db:migrate
   ```
   (Schema dibuat langsung di Neon)

### 6.6 Update Google redirect URI (PENTING)
1. Buka [Google Cloud Console](https://console.cloud.google.com) → **Credentials** → Client ID kamu
2. Tambahkan ke **Authorized redirect URIs**:
   ```
   https://<nama-proyek>.vercel.app/api/auth/google/callback
   ```
3. Jika app masih berstatus **"Testing"**, tambahkan email kamu sebagai **Test user** (atau klik **Publish** agar semua bisa login)

### 6.7 Test
Buka URL Vercel kamu → login Google → dashboard muncul. ✅

> 🔁 **Auto-deploy**: Setiap push ke `main` di GitHub, Vercel otomatis rebuild + redeploy.

### 6.6 Test
Buka `https://<app-nama>.onrender.com` → login Google → dashboard.

---

## 📦 Struktur Folder

```
├── server/                    # Backend Express
│   ├── index.js              # Entry point
│   ├── app.js                # Express setup (routes, static, SPA)
│   ├── config.js             # Environment validation
│   ├── db/
│   │   ├── schema.sql        # PostgreSQL schema
│   │   └── pool.js           # Connection pool
│   ├── middleware/
│   │   ├── auth.js           # requireAuth / optionalAuth
│   │   └── error.js          # Error handler + async wrapper
│   ├── routes/
│   │   ├── auth.routes.js    # Google OAuth
│   │   ├── tasks.routes.js   # Task CRUD
│   │   └── analytics.routes.js
│   ├── services/
│   │   └── google.service.js # OAuth2 client (fetch)
│   └── utils/
│       └── token.js          # JWT + cookies
├── scripts/
│   └── migrate.js            # DB migration runner
└── src/                      # Frontend React
    ├── pages/
    │   ├── Login.jsx
    │   ├── Dashboard.jsx
    │   └── (App.jsx root todo)
    ├── context/
    │   ├── AuthContext.jsx
    │   └── DarkModeContext.jsx
    ├── components/
    │   ├── PrivateRoutes.jsx
    │   ├── ImportBanner.jsx
    │   └── ... (Task CRUD components)
    └── api/
        └── client.js         # fetch wrapper + refresh retry
```

---

## 🛠 Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `DATABASE_URL tidak ditemukan` | Pastikan `.env` ada di root project |
| `relation "users" does not exist` (42P01) | Database baru belum dimigrasi. Jalankan `npm run db:migrate` dengan `DATABASE_URL` database tersebut |
| `SELF_SIGNED_CERT_IN_CHAIN` | `sslmode` di URL menimpa opsi SSL. Sudah ditangani `server/db/connection.js`; pastikan kode terbaru sudah ter-deploy |
| `connect ECONNREFUSED 5432` | Pastikan PostgreSQL berjalan |
| `Invalid state parameter` | Hapus history browser / refresh |
| Login redirect loop | Cek `GOOGLE_REDIRECT_URI` persis dengan yang di-register Google |
| `AUTH_EXPIRED` terus | Token 15m habis, refresh otomatis. Jika gagal, login ulang |
| Blank setelah login | Pastikan `CLIENT_URL` benar |