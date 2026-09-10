// ==========================================
// IMPORT MODULES & DEPENDENCIES
// ==========================================
import { Router } from "express"; // Router Express untuk kelompok route
import { randomBytes } from "crypto"; // Generator byte acak untuk state
import { query } from "../db/pool.js"; // Pool + helper query database
import { config } from "../config.js"; // Konfigurasi env
import { buildConsentURL, exchangeCode, getUserInfo } from "../services/google.service.js"; // Google OAuth functions
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  generateJti,
  setTokenCookies,
  clearTokenCookies,
} from "../utils/token.js"; // Utilitas token JWT
import { requireAuth, optionalAuth } from "../middleware/auth.js"; // Middleware autentikasi
import { asyncHandler } from "../middleware/error.js"; // Pembungkus async handler

// ==========================================
// ROUTER INSTANCE
// ==========================================
const router = Router(); // Buat router Express baru

// ==========================================
// ROUTE: GET /api/auth/google
// Memulai flow Google OAuth: redirect ke halaman consent Google
// ==========================================
router.get(
  "/google",
  (req, res) => {
    // Generate state acak untuk proteksi CSRF
    const state = randomBytes(16).toString("hex"); // Byte hex acak, tidak bisa diprediksi

    // Simpan state di httpOnly cookie (10 menit)
    res.cookie("oauth_state", state, {
      httpOnly: true, // Tidak bisa diakses JavaScript
      sameSite: "lax", // Proteksi CSRF
      secure: process.env.NODE_ENV === "production", // HTTPS di produksi (Vercel)
      maxAge: 10 * 60 * 1000, // 10 menit
      path: "/", // Berlaku di seluruh path
    });

    // Redirect ke halaman consent Google dengan state
    res.redirect(buildConsentURL(state)); // Google akan meminta user login & izin
  },
);

// ==========================================
// ROUTE: GET /api/auth/google/callback
// Redirect URI Google: menerima code, menukar jadi token, membuat user, set cookie
// ==========================================
router.get(
  "/google/callback",
  asyncHandler(async (req, res) => {
    const { code, state, error } = req.query; // Ambil parameter dari query string
    const storedState = req.cookies.oauth_state; // State yang tersimpan di cookie

    // Validasi CSRF: state harus cocok dengan yang dikirim sebelumnya
    if (error) {
      // User menolak izin di halaman Google
      return res.redirect(`${config.clientUrl}/login?error=denied`); // Redirect ke login dengan pesan
    }

    if (!state || !storedState || state !== storedState) {
      // State tidak cocok / cookie hilang (stale flow)
      // Bukan potensi attack serius — redirect ke login dengan pesan halus
      // (bukan 400 keras yang membuat user bingung)
      return res.redirect(`${config.clientUrl}/login?error=stale`); // Kembali ke login
    }

    // Hapus cookie state setelah digunakan (sekali pakai)
    res.clearCookie("oauth_state", { path: "/" });

    // Tukar authorization code menjadi token
    const tokens = await exchangeCode(code); // Dapatkan access_token & id_token

    // Ambil profil pengguna dari Google
    const userInfo = await getUserInfo(tokens.access_token); // { id, email, name, picture }

    // Upsert user: cari berdasarkan google_id, buat jika belum ada
    const upsertResult = await query(
      // SQL: sisipkan user baru, jika google_id sudah ada update data sesuai kebutuhan (ON CONFLICT)
      `INSERT INTO users (google_id, email, name, avatar_url)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (google_id) DO UPDATE
       SET name = EXCLUDED.name, avatar_url = EXCLUDED.avatar_url, updated_at = now()
       RETURNING id`,
      [userInfo.id, userInfo.email, userInfo.name, userInfo.picture || null], // Parameter SQL
    );

    const userId = upsertResult.rows[0].id; // Ambil user id hasil upsert

    // ==========================================
    // ISSUE TOKENS
    // ==========================================
    // Buat access token (15 menit) & refresh token (30 hari)
    const accessToken = signAccessToken(userId); // Untuk autentikasi request berikutnya
    const jti = generateJti(); // Unique ID refresh token
    const refreshToken = signRefreshToken(userId, jti); // Untuk mendapatkan access baru

    // Simpan hash refresh token di database (untuk rotasi & revoke)
    await query(
      // SQL: simpan hash token, user, expiry 30 hari
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, now() + interval '30 days')`,
      [userId, hashToken(refreshToken)], // Parameter: user id + hash token
    );

    // Set cookie access & refresh token
    setTokenCookies(res, accessToken, refreshToken); // httpOnly, sameSite lax

    // Redirect ke dashboard setelah login sukses
    res.redirect(config.clientUrl); // Ke root app
  }),
);

// ==========================================
// ROUTE: GET /api/auth/me
// Mengambil profil user yang sedang login (opsional auth)
// ==========================================
router.get(
  "/me",
  optionalAuth,
  asyncHandler(async (req, res) => {
    // Jika tidak ada user yang login
    if (!req.userId) {
      return res.status(401).json({ code: "AUTH_REQUIRED", message: "Harus login" });
    }

    // Ambil profil user dari database
    const result = await query(
      `SELECT id, email, name, avatar_url, dark_mode, created_at FROM users WHERE id = $1`,
      [req.userId],
    );

    // Jika user tidak ditemukan (misal akun dihapus)
    if (result.rows.length === 0) {
      return res.status(401).json({ code: "AUTH_REQUIRED", message: "User tidak ditemukan" });
    }

    res.json({ user: result.rows[0] }); // Kembalikan profil user
  }),
);

// ==========================================
// ROUTE: POST /api/auth/refresh
// Menukar refresh token menjadi access token baru (rotasi)
// ==========================================
router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refresh_token; // Ambil refresh token dari cookie

    if (!refreshToken) {
      // Jika tidak ada refresh token
      return res.status(401).json({ code: "AUTH_REQUIRED", message: "Tidak ada sesi" });
    }

    try {
      // Verifikasi signature refresh token
      const payload = verifyRefreshToken(refreshToken); // throw jika invalid/expired

      // Cari refresh token di database (harus ada, belum revoked, belum expired)
      const stored = await query(
        `SELECT id, user_id FROM refresh_tokens
         WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > now()`,
        [hashToken(refreshToken)], // Cari berdasarkan hash
      );

      if (stored.rows.length === 0) {
        // Token tidak ditemukan / revoked / expired
        return res.status(401).json({ code: "AUTH_EXPIRED", message: "Sesi berakhir" });
      }

      // Token valid — rotasi: revoke token lama
      await query(`UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1`, [stored.rows[0].id]);

      // Buat access token baru
      const newAccessToken = signAccessToken(stored.rows[0].user_id);

      // Rotasi refresh token: buat token baru + simpan di database
      const jti = generateJti(); // JTI baru
      const newRefreshToken = signRefreshToken(stored.rows[0].user_id, jti); // Refresh token baru
      await query(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, now() + interval '30 days')`,
        [stored.rows[0].user_id, hashToken(newRefreshToken)], // Simpan hash token baru
      );

      // Set cookie baru
      setTokenCookies(res, newAccessToken, newRefreshToken); // httpOnly cookies

      res.json({ ok: true }); // Response sukses
    } catch {
      // Token invalid/expired signature
      return res.status(401).json({ code: "AUTH_EXPIRED", message: "Sesi berakhir" });
    }
  }),
);

// ==========================================
// ROUTE: POST /api/auth/logout
// Logout: revoke refresh token + hapus cookie
// ==========================================
router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refresh_token; // Ambil refresh token dari cookie

    if (refreshToken) {
      // Revoke refresh token di database (tandai revoked_at)
      await query(
        `UPDATE refresh_tokens SET revoked_at = now()
         WHERE token_hash = $1 AND revoked_at IS NULL`,
        [hashToken(refreshToken)], // Cari berdasarkan hash
      );
    }

    clearTokenCookies(res); // Hapus access & refresh cookie

    res.json({ ok: true }); // Response sukses
  }),
);

// ==========================================
// ROUTE: PATCH /api/auth/me
// Update profil user (contoh: sinkronisasi dark mode)
// ==========================================
router.patch(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { dark_mode } = req.body; // Ambil field yang bisa diupdate

    // Sinkronkan preferensi dark mode ke database
    if (typeof dark_mode === "boolean") {
      await query(`UPDATE users SET dark_mode = $1, updated_at = now() WHERE id = $2`, [
        dark_mode, // Nilai baru dark mode
        req.userId, // ID user yang login
      ]);
    }

    res.json({ ok: true }); // Response sukses
  }),
);

// ==========================================
// EKSPOR ROUTER
// ==========================================
export default router; // Gunakan di app.js