// ==========================================
// MIDDLEWARE: requireAuth
// Melindungi route API - memerlukan autentikasi
// ==========================================

import { verifyAccessToken } from "../utils/token.js";

export function requireAuth(req, res, next) {
  try {
    // Ambil access token dari cookie
    const token = req.cookies.access_token; // httpOnly cookie dari login

    if (!token) {
      // Tidak ada token sama sekali
      return res.status(401).json({ code: "AUTH_REQUIRED", message: "Harus login" });
    }

    // Verifikasi token dan dapatkan userId
    // verifyAccessToken melempar jika token invalid / expired / malformed
    const userId = verifyAccessToken(token);

    req.userId = userId; // Simpan userId di request untuk handler berikutnya

    next(); // Lanjut ke route handler
  } catch (err) {
    // Token invalid / expired
    // Kode AUTH_EXPIRED dipakai client untuk trigger refresh;
    // kode ini harus konsisten dengan yang diperiksa di api/client.js (401 + code AUTH_EXPIRED)
    return res.status(401).json({ code: "AUTH_EXPIRED", message: "Sesi berakhir" });
  }
}

// ==========================================
// MIDDLEWARE: optionalAuth
// Autentikasi opsional - tidak error jika tidak login
// ==========================================

import { verifyAccessToken as verify } from "../utils/token.js";

export function optionalAuth(req, res, next) {
  try {
    const token = req.cookies.access_token;
    if (token) {
      const userId = verify(token);
      req.userId = userId;
    }
  } catch {
    // Abaikan jika token invalid - biarkan tanpa auth
  }
  next();
}
