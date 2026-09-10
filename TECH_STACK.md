# 📚 Tech Stack — PriorityMatrix Todo

Dokumentasi lengkap teknologi yang digunakan dalam proyek.

## 🎯 Overview

**Aplikasi**: Sistem manajemen tugas berbasis **Eisenhower Matrix** (4 kuadran prioritas) dengan fitur Google OAuth, analytics dashboard, dan database PostgreSQL.

**Arsitektur**: Monorepo — satu backend Express (serverless-ready) + satu frontend React, di-deploy ke Vercel + Neon.

---

## 🖥️ Frontend (React SPA)

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| React | 18.3.x | UI library, Functional Components + Hooks |
| Vite | 5.x | Build tool, dev server, HMR |
| Tailwind CSS | 3.4.x | CSS utility-first, custom sage palette |
| React Router | 6.x | Navigasi SPA (tanpa reload) |
| Recharts | 2.x | Chart components (area, bar, line) |

### Struktur Frontend

```
src/
├── api/
│   └── client.js            # Fetch wrapper + auto-refresh token
├── components/
│   ├── AvatarImage.jsx      # Avatar dengan fallback inisial
│   ├── Header.jsx           # Navbar responsif + dark mode toggle
│   ├── ImportBanner.jsx     # Migrasi localStorage → server
│   ├── PrivateRoutes.jsx    # Guard halaman ber-login
│   ├── TaskCard.jsx         # Card tugas individual
│   ├── TaskForm.jsx         # Form tambah tugas
│   ├── ProductivityIndicator.jsx  # KPI tiles + progress bar
│   └── QuadrantGrid.jsx     # Grid 4 kuadran Eisenhower
├── context/
│   ├── AuthContext.jsx      # State auth, login, logout
│   └── DarkModeContext.jsx  # Preferensi tema (tersimpan DB)
├── pages/
│   ├── Login.jsx            # Google OAuth button
│   └── Dashboard.jsx        # Analytics: filters, KPI, 3 charts
├── App.jsx                  # Root component, state management, CRUD
└── main.jsx                 # Entry point (BrowserRouter + providers)
```

### Styling

- **Palette**: Sage green (`#8B9A6E`) — fresh, minimal, anak muda
- **Dark mode**: Toggle di header, tersimpan per-user di PostgreSQL
- **Responsive**: Mobile-first (`sm:`, `md:`, `lg:` breakpoint)

---

## ⚙️ Backend (Express.js)

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| Node.js | 22.x | Runtime environment |
| Express | 4.x | Web framework, REST API |
| pg | 8.x | PostgreSQL client (Pool) |
| jsonwebtoken | 9.x | JWT access (15m) + refresh (30d) |
| cookie-parser | 1.x | Parse httpOnly cookies |
| dotenv | 16.x | Environment variable management |

### Struktur Backend

```
server/
├── index.js                 # Bootstrap, listen
├── app.js                   # Express app (middleware, routes, SPA fallback)
├── config.js                # Env validation + getClientOrigin helper
├── db/
│   ├── pool.js              # PostgreSQL Pool (SSL otomatis)
│   └── schema.sql           # DDL users, tasks, refresh_tokens
├── middleware/
│   ├── auth.js              # requireAuth + optionalAuth JWT
│   └── error.js             # asyncHandler + errorHandler
├── routes/
│   ├── auth.routes.js       # Google OAuth flow (redirect, callback, refresh, logout)
│   ├── tasks.routes.js      # CRUD tasks + import endpoint
│   └── analytics.routes.js  # Analytics series, quadrants, rate trend
├── services/
│   └── google.service.js    # OAuth2 consent URL, code exchange, userinfo
└── utils/
    └── token.js             # JWT sign/verify, sha256, cookie helpers
```

### Autentikasi

- **Google OAuth2** (manual, tanpa Passport)
  - `GET /api/auth/google` → redirect ke Google consent
  - `GET /api/auth/google/callback` → exchange code, set JWT cookies
  - `POST /api/auth/refresh` → rotate refresh token
  - `POST /api/auth/logout` → revoke refresh token
- **JWT Access**: 15 menit, httpOnly cookie
- **JWT Refresh**: 30 hari, httpOnly cookie, rotasi per refresh
- **Hash token**: SHA-256 hex di database (token asli tidak tersimpan)

### Database Schema

**`users`**
- `id UUID PK` — gen_random_uuid()
- `google_id TEXT UNIQUE` — dari Google OAuth
- `email TEXT UNIQUE`
- `name, avatar_url, dark_mode`
- `created_at, updated_at`

**`tasks`**
- `id UUID PK`
- `user_id UUID FK`
- `title, quadrant (q1-q4), completed`
- `created_at, completed_at (nullable)` — linchpin analytics
- `updated_at`
- Partial index on `completed_at` untuk query analytics cepat

**`refresh_tokens`**
- `id UUID PK`
- `user_id UUID FK`, `token_hash TEXT UNIQUE`, `expires_at`
- `revoked_at` — soft delete

---

## 📊 Analytics

### Fitur
- **Tugas selesai per hari/minggu** — zero-filled via `generate_series`
- **Distribusi kuadran** — 4 bar chart (warna identity)
- **Tren completion rate** — line chart 0-100%
- **KPI tiles** — total, selesai, rate, rata-rata/hari
- **Filter**: range (7/30/90 hari), group (day/week)

### Query SQL
- Partial index `idx_tasks_user_completed` untuk `completed_at`
- `generate_series(CURRENT_DATE - N, CURRENT_DATE, '1 day')` untuk zero-fill

---

## 🗄️ Database

| Provider | Produk | Tier |
|----------|--------|------|
| **Neon** | PostgreSQL managed | Free tier |

### Fitur Neon
- Serverless, auto-suspend
- SSL enforced (`rejectUnauthorized: false`)
- Connection string format: `postgresql://user:pass@region.neon.tech/db`

---

## ☁️ Deployment (Production)

### Layanan
| Layanan | Fungsi |
|---------|--------|
| **Vercel** | Hosting SPA + Express serverless (`api/index.js`) |
| **Neon** | PostgreSQL managed |
| **GitHub** | Repository + auto-deploy trigger |

### Vercel Serverless
- `api/index.js` → Express app sebagai Vercel handler
- `vercel.json` → rewrites `/api/*` → serverless, `/` → SPA
- Build: `npm run build` (Vite) + Vercel deteksi otomatis
- Env variables: `DATABASE_URL`, `JWT_*`, `GOOGLE_*`, `CLIENT_URL`

### Auto-deploy
- Setiap push ke `main` branch → Vercel otomatis rebuild + redeploy
- URL production: `https://<nama-proyek>.vercel.app`

---

## 🔐 Autentikasi — Google OAuth

### Flow
1. User klik "Masuk dengan Google" → redirect ke Google consent
2. Google callback → exchange code → userinfo → upsert user → set JWT cookies
3. Setiap request API → access token cookie (verifikasi)
4. Token expired → refresh token rotasi (baru, revoke lama)
5. Logout → revoke refresh token + hapus cookies

### Keamanan
- **httpOnly cookies** → tidak bisa diakses JavaScript (XSS-safe)
- **SameSite=Lax** → CSRF protection
- **State parameter** → CSRF proteksi di OAuth flow
- **SHA-256 hash** → refresh token tidak tersimpan plaintext

---

## 🎨 Design System

### Palette: Sage Green
| Role | Hex |
|------|-----|
| Primary | `#8B9A6E` (sage-500) |
| Light bg | `#f2f5ec` (sage-50) |
| Card bg | `#e4e9d9` (sage-100) |
| Hover | `#b3c092` (sage-300) |
| Text active | `#5d6a48` (sage-700) |
| Dark text | `#38402f` (sage-900) |

### Kuadran (Identity, bukan brand)
| Kuadran | Warna | Makna |
|---------|-------|-------|
| Q1 | `#ef4444` (red) | Do First |
| Q2 | `#3b82f6` (blue) | Schedule |
| Q3 | `#c98500` (amber) | Delegate |
| Q4 | `#10a5a5` (aqua) | Eliminate |

---

## 📁 Struktur Repo

```
web-claude-test/
├── server/                  # Backend Express
├── src/                     # React frontend
├── api/                     # Vercel serverless entry
├── scripts/                 # DB migration runner
├── dist/                    # Vite build output
├── .env.example             # Template env (git-tracked)
├── .env                     # Env secrets (git-ignored)
├── .gitignore               # Files yang tidak di-commit
├── tailwind.config.js       # Tailwind + sage palette
├── vite.config.js           # Vite + proxy ke Express
├── vercel.json              # Vercel rewrites
├── SETUP.md                 # Panduan setup + deploy
├── TECH_STACK.md            # Dokumentasi ini
└── README.md                (opsional)
```

---

## 📝 Catatan Pengembangan

### API_INTEGRATION_POINT
Semua marker `// TODO: API_INTEGRATION_POINT` masih utuh di `src/App.jsx` sebagai referensi pengembangan. Marker ini menunjukkan titik-titik di mana implementation seharusnya sudah terhubung ke database, tapi untuk kebutuhan current sudah terhubung langsung ke API.

### Migrasi LocalStorage
- Import banner muncul saat user punya data localStorage & belum login
- Data mapper ke server dengan `created_at` preserved dari `clientId` (Date.now())
- Setelah import, `localStorage` dihapus, flag `priority_tasks_imported` diset

### Code Comments
- Setiap baris kode punya komentar dalam Bahasa Indonesia (sesuai PRD instruksi)
- Komentar menjelaskan alur logika, bukan mengulang kode

---

## 🔗 Referensi

- [PRD.md](PRD.md) — Product Requirement Document asli
- [SETUP.md](SETUP.md) — Panduan setup & deployment
- [RENDER_ENV.md](RENDER_ENV.md) — Template environment variables (Render)

---

## 📜 Lisensi

Proyek ini proprietary — semua hak cipta milik Adryan Syah (2026).
