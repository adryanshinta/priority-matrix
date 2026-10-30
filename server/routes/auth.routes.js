// ==========================================
// ROUTER: Autentikasi
// Google OAuth flow + refresh/logout + sinkronisasi profil
// ==========================================

import { Router } from "express";
import { randomBytes } from "crypto";
import { query } from "../db/pool.js";
import { getClientOrigin } from "../config.js";
import {
  buildConsentURL,
  exchangeCode,
  getUserInfo,
} from "../services/google.service.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  generateJti,
  setTokenCookies,
  clearTokenCookies,
} from "../utils/token.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/error.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

const router = Router();

// ── Helper: terbitkan sesi (access + refresh token) untuk user ─────────────────
async function issueSession(res, userId) {
  const accessToken = signAccessToken(userId); // Access token umur pendek
  const jti = generateJti(); // ID unik refresh token
  const refreshToken = signRefreshToken(userId, jti); // Refresh token umur panjang

  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, now() + interval '30 days')`,
    [userId, hashToken(refreshToken)], // Simpan hanya hash token
  );

  setTokenCookies(res, accessToken, refreshToken); // Set cookie httpOnly
}

// ── Helper: ambil profil publik user ─────────────────────────────────────────
async function getUserProfile(userId) {
  const result = await query(
    `SELECT id, email, name, avatar_url, dark_mode, created_at FROM users WHERE id = $1`,
    [userId],
  );
  return result.rows[0] || null;
}

// ── GET /api/auth/google ──────────────────────────────────────────────────────
// Mulai flow OAuth: redirect ke halaman consent Google dengan state CSRF random.
// State disimpan di cookie httpOnly agar tidak bisa dimanipulasi klien,
// lalu dicocokkan saat callback tiba.
router.get("/google", (req, res) => {
  const state = randomBytes(16).toString("hex");

  res.cookie("oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" || process.env.VERCEL === "1",
    maxAge: 10 * 60 * 1000, // 10 menit
    path: "/",
  });

  res.redirect(buildConsentURL(state));
});

// ── GET /api/auth/google/callback ─────────────────────────────────────────────
// Redirect URI Google: terima code, tukar token, buat/sinkronisasi user,
// issue token, redirect kembali ke aplikasi.
router.get(
  "/google/callback",
  asyncHandler(async (req, res) => {
    const { code, state, error } = req.query;
    const storedState = req.cookies.oauth_state;

    // User menolak izin / error dari Google
    if (error) {
      return res.redirect(`${getClientOrigin(req)}/login?error=denied`);
    }

    // State harus ada & cocok. Tidak cocok → redirect flow tidak valid.
    if (!state || !storedState || state !== storedState) {
      if (req.cookies.oauth_state) {
        res.clearCookie("oauth_state", { path: "/" });
      }
      return res.status(400).json({
        code: "INVALID_STATE",
        message: "Sesi login tidak valid. Silakan coba lagi.",
      });
    }

    // State hanya dipakai sekali
    res.clearCookie("oauth_state", { path: "/" });

    // Tukar authorization code dengan token Google
    const tokens = await exchangeCode(code);
    const userInfo = await getUserInfo(tokens.access_token);

    // Upsert user berdasarkan email — kunci penggabungan akun.
    // Jika email sudah terdaftar via password, akun yang sama tetap dipakai
    // dan google_id ditautkan.
    // Catatan: Postgres mewajibkan conflict target untuk DO UPDATE,
    // jadi kita targetkan kolom email (unique).
    let userId;
    try {
      const upsertResult = await query(
        `INSERT INTO users (google_id, email, name, avatar_url)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO UPDATE
         SET google_id = COALESCE(users.google_id, EXCLUDED.google_id),
             name = EXCLUDED.name,
             avatar_url = EXCLUDED.avatar_url,
             updated_at = now()
         RETURNING id`,
        [userInfo.id, userInfo.email, userInfo.name, userInfo.picture || null],
      );
      userId = upsertResult.rows[0].id;
    } catch (err) {
      // Fallback: konflik pada google_id (mis. email di Google berubah).
      // Pakai akun Google yang sudah ada dan sinkronkan profilnya.
      if (err.code === "23505") {
        const existing = await query(
          `UPDATE users
           SET name = $2, avatar_url = $3, updated_at = now()
           WHERE google_id = $1
           RETURNING id`,
          [userInfo.id, userInfo.name, userInfo.picture || null],
        );
        if (existing.rows.length === 0) throw err;
        userId = existing.rows[0].id;
      } else {
        throw err;
      }
    }

    await issueSession(res, userId); // Terbitkan sesi

    res.redirect(getClientOrigin(req));
  }),
);

// ── POST /api/auth/register ───────────────────────────────────────────────────
// Daftar akun dengan email/username + password.
// Jika email sudah terdaftar via Google OAuth (belum punya password),
// password ditautkan ke akun yang sama agar OAuth & password jadi satu akun.
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, email, username, password } = req.body || {};

    // ── Validasi input ────────────────────────────────────────────────────────
    if (!name || !String(name).trim()) {
      return res.status(400).json({ code: "INVALID_INPUT", message: "Nama wajib diisi" });
    }

    const normalizedEmail = String(email || "").trim().toLowerCase();
    // Validasi format email sederhana yang memadai
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ code: "INVALID_INPUT", message: "Format email tidak valid" });
    }

    if (!password || String(password).length < 8) {
      return res
        .status(400)
        .json({ code: "WEAK_PASSWORD", message: "Password minimal 8 karakter" });
    }

    // Username opsional: normalisasi (lowercase, hanya alfanumerik + underscore)
    const rawUsername = String(username || "").trim().toLowerCase();
    if (rawUsername && !/^[a-z0-9_]{3,20}$/.test(rawUsername)) {
      return res.status(400).json({
        code: "INVALID_USERNAME",
        message: "Username 3-20 karakter (huruf, angka, underscore)",
      });
    }
    const normalizedUsername = rawUsername || null;

    const passwordHash = await hashPassword(String(password)); // Hash sekali

    // ── Cek apakah email sudah terdaftar ─────────────────────────────────────
    const existing = await query(
      `SELECT id, password_hash FROM users WHERE lower(email) = $1`,
      [normalizedEmail],
    );

    let userId;

    if (existing.rows.length > 0) {
      // Email sudah ada. Jika sudah punya password → tolak (akun milik orang lain).
      if (existing.rows[0].password_hash) {
        return res
          .status(409)
          .json({ code: "EMAIL_TAKEN", message: "Email sudah terdaftar. Silakan masuk." });
      }

      // Akun OAuth-only → tautkan password ke akun yang sama
      userId = existing.rows[0].id;

      if (normalizedUsername) {
        const takenUsername = await query(
          `SELECT id FROM users WHERE lower(username) = $1 AND id <> $2`,
          [normalizedUsername, userId],
        );
        if (takenUsername.rows.length > 0) {
          return res
            .status(409)
            .json({ code: "USERNAME_TAKEN", message: "Username sudah dipakai" });
        }
      }

      await query(
        `UPDATE users
         SET password_hash = $1,
             username = COALESCE($2, username),
             name = CASE WHEN name IS NULL OR name = '' THEN $3 ELSE name END,
             updated_at = now()
         WHERE id = $4`,
        [passwordHash, normalizedUsername, String(name).trim(), userId],
      );
    } else {
      // Email baru → buat akun password baru
      if (normalizedUsername) {
        const takenUsername = await query(
          `SELECT id FROM users WHERE lower(username) = $1`,
          [normalizedUsername],
        );
        if (takenUsername.rows.length > 0) {
          return res
            .status(409)
            .json({ code: "USERNAME_TAKEN", message: "Username sudah dipakai" });
        }
      }

      try {
        const inserted = await query(
          `INSERT INTO users (email, username, password_hash, name)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          [normalizedEmail, normalizedUsername, passwordHash, String(name).trim()],
        );
        userId = inserted.rows[0].id;
      } catch (err) {
        // 23505 = unique_violation (balapan request / email sudah dipakai)
        if (err.code === "23505") {
          return res
            .status(409)
            .json({ code: "EMAIL_TAKEN", message: "Email sudah terdaftar. Silakan masuk." });
        }
        throw err;
      }
    }

    await issueSession(res, userId); // Langsung login setelah daftar

    const user = await getUserProfile(userId);
    res.status(201).json({ ok: true, user });
  }),
);

// ── POST /api/auth/login ──────────────────────────────────────────────────────
// Login manual memakai email ATAU username + password.
// Akun Google yang sudah menautkan password juga bisa masuk lewat sini.
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { identifier, password } = req.body || {};

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ code: "INVALID_INPUT", message: "Email/username dan password wajib diisi" });
    }

    const id = String(identifier).trim();

    // Cari berdasarkan email atau username (case-insensitive)
    const result = await query(
      `SELECT id, password_hash FROM users
       WHERE lower(email) = lower($1)
          OR (username IS NOT NULL AND lower(username) = lower($1))
       LIMIT 1`,
      [id],
    );

    const account = result.rows[0];

    // Verifikasi password. Pesan error disamakan agar tidak membocorkan
    // akun mana yang ada.
    if (!account || !(await verifyPassword(String(password), account.password_hash))) {
      return res
        .status(401)
        .json({ code: "INVALID_CREDENTIALS", message: "Email/username atau password salah" });
    }

    await issueSession(res, account.id); // Terbitkan sesi

    const user = await getUserProfile(account.id);
    res.json({ ok: true, user });
  }),
);

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
// Ambil profil user yang sedang login.
// Autentikasi bersifat opsional agar halaman login bisa memeriksa
// apakah user sudah memiliki sesi aktif.
router.get(
  "/me",
  optionalAuth,
  asyncHandler(async (req, res) => {
    if (!req.userId) {
      return res.status(401).json({ code: "AUTH_REQUIRED", message: "Harus login" });
    }

    const result = await query(
      `SELECT id, email, name, avatar_url, dark_mode, created_at FROM users WHERE id = $1`,
      [req.userId],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ code: "AUTH_REQUIRED", message: "User tidak ditemukan" });
    }

    res.json({ user: result.rows[0] });
  }),
);

// ── POST /api/auth/refresh ────────────────────────────────────────────────────
// Rotasi refresh token: tukar refresh token lama dengan access token baru
// + refresh token baru, lalu revoke token lama.
router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({ code: "AUTH_REQUIRED", message: "Tidak ada sesi" });
    }

    try {
      const payload = verifyRefreshToken(refreshToken);

      const stored = await query(
        `SELECT id, user_id FROM refresh_tokens
         WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > now()`,
        [hashToken(refreshToken)],
      );

      if (stored.rows.length === 0) {
        return res.status(401).json({ code: "AUTH_EXPIRED", message: "Sesi berakhir" });
      }

      // Revoke token lama
      await query(`UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1`, [
        stored.rows[0].id,
      ]);

      // Issue token baru
      const newAccessToken = signAccessToken(stored.rows[0].user_id);
      const newJti = generateJti();
      const newRefreshToken = signRefreshToken(stored.rows[0].user_id, newJti);

      await query(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, now() + interval '30 days')`,
        [stored.rows[0].user_id, hashToken(newRefreshToken)],
      );

      setTokenCookies(res, newAccessToken, newRefreshToken);

      res.json({ ok: true });
    } catch {
      return res.status(401).json({ code: "AUTH_EXPIRED", message: "Sesi berakhir" });
    }
  }),
);

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
// Revoke refresh token + hapus cookie.
router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refresh_token;

    if (refreshToken) {
      await query(
        `UPDATE refresh_tokens SET revoked_at = now()
         WHERE token_hash = $1 AND revoked_at IS NULL`,
        [hashToken(refreshToken)],
      );
    }

    clearTokenCookies(res);

    // httpOnly cookie sudah dihapus, tapi pastikan respons tidak di-cache
    res.set("Cache-Control", "no-store");
    res.json({ ok: true });
  }),
);

// ── PATCH /api/auth/me ────────────────────────────────────────────────────────
// Update profil user (misal: sinkronisasi dark mode).
router.patch(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { dark_mode } = req.body;

    // Hanya terima boolean eksplisit
    if (typeof dark_mode === "boolean") {
      await query(
        `UPDATE users SET dark_mode = $1, updated_at = now() WHERE id = $2`,
        [dark_mode, req.userId],
      );
    }

    // Kembalikan state terbaru agar client bisa memvalidasi hasil sinkronisasi
    const user = await query(`SELECT dark_mode FROM users WHERE id = $1`, [req.userId]);

    if (user.rows.length === 0) {
      return res.status(401).json({ code: "AUTH_REQUIRED", message: "User tidak ditemukan" });
    }

    res.json({ ok: true, dark_mode: user.rows[0].dark_mode });
  }),
);

export default router;
