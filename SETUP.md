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

## 🚢 DEPLOY KE RENDER (Production)

Rencana: **1 Web Service** (Express + built Vite) + **1 Managed Postgres**.

### 6.1 Push repo ke GitHub
```bash
git init
git add .
git commit -m "PriorityMatrix v2: OAuth + backend + analytics"
gh repo create priority-matrix --public --push
```

### 6.2 Buat Postgres di Render
1. [render.com](https://render.com) → **New** → **PostgreSQL**
2. Beri nama → **Create**
3. Salin **Internal Database URL** (bukan external)

### 6.3 Buat Web Service
1. **New** → **Web Service** → connect repo GitHub
2. Konfigurasi:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node server/index.js`
3. **Environment Variables** — tambahkan semua dari `.env`:
   ```
   NODE_ENV=production
   DATABASE_URL=<Internal DB URL dari 6.2>
   JWT_ACCESS_SECRET=<hex_1>
   JWT_REFRESH_SECRET=<hex_2>
   GOOGLE_CLIENT_ID=<dari_google_cloud>
   GOOGLE_CLIENT_SECRET=<dari_google_cloud>
   GOOGLE_REDIRECT_URI=https://<app-nama>.onrender.com/api/auth/google/callback
   CLIENT_URL=https://<app-nama>.onrender.com
   ```
4. **Deploy**

### 6.4 Jalankan migrasi di production
Render Service shell / local:
```bash
DATABASE_URL=<Internal_URL> NODE_ENV=production npm run db:migrate
```

### 6.5 Update Google redirect URI (PENTING)
1. Kembali ke **Google Cloud Console** → Credentials → Client ID kamu
2. Tambahkan ke **Authorized redirect URIs**:
   ```
   https://<app-nama>.onrender.com/api/auth/google/callback
   ```
3. Jika app masih "Testing", tambahkan test user atau **Publish** app

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
| `connect ECONNREFUSED 5432` | Pastikan PostgreSQL berjalan |
| `Invalid state parameter` | Hapus history browser / refresh |
| Login redirect loop | Cek `GOOGLE_REDIRECT_URI` persis dengan yang di-register Google |
| `AUTH_EXPIRED` terus | Token 15m habis, refresh otomatis. Jika gagal, login ulang |
| Blank setelah login | Pastikan `CLIENT_URL` benar |