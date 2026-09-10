# ==========================================
# RENDER ENVIRONMENT VARIABLES
# Salin nilai-nilai ini ke Render dashboard (Web Service → Environment)
# JANGAN commit file ini — hanya untuk referensi salin-paste
# ==========================================

# Mode production
NODE_ENV=production

# PostgreSQL URL dari Render (New → PostgreSQL → Internal Database URL)
DATABASE_URL=postgres://<USER>:<PASSWORD>@<REGION>.sql.render.com:<PORT>/<DB_NAME>

# JWT Secrets — generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# (masing-masing beda!)
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

# Google OAuth — dari Google Cloud Console
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Redirect URI PRODUCTION (ganti <nama-app> dengan nama web service Render kamu)
GOOGLE_REDIRECT_URI=https://<nama-app>.onrender.com/api/auth/google/callback

# URL frontend production
CLIENT_URL=https://<nama-app>.onrender.com