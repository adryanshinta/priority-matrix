// ==========================================
// IMPORT MODULES & DEPENDENCIES
// ==========================================
import { verifyAccessToken } from "../utils/token.js"; // Fungsi verifikasi access token

// ==========================================
// MIDDLEWARE: requireAuth
// Melindungi route API - memerlukan autentikasi
// ==========================================
export function requireAuth(req, res, next) {
  try {
    // Ambil access token dari cookie
    const token = req.cookies.access_token; // httpOnly cookie dari login

    if (!token) {
      // Jika tidak ada token
      return res.status(401).json({ code: "AUTH_REQUIRED", message: "Harus login" }); // Response 401
    }

    // Verifikasi token dan dapatkan userId
    const userId = verifyAccessToken(token); // throw jika token invalid/expired

    req.userId = userId; // Simpan userId di request untuk handler berikutnya

    next(); // Lanjut ke route handler
  } catch (err) {
    // Token invalid / expired
    return res.status(401).json({ code: "AUTH_EXPIRED", message: "Sesi berakhir" }); // Response 401 dengan kode khusus
  }
}

// ==========================================
// MIDDLEWARE: optionalAuth
// Autentikasi opsional - tidak error jika tidak login
// ==========================================
export function optionalAuth(req, res, next) {
  try {
    const token = req.cookies.access_token; // Ambil token dari cookie
    if (token) {
      const userId = verifyAccessToken(token); // Verifikasi jika ada
      req.userId = userId; // Set userId
    }
  } catch {
    // Abaikan jika token invalid - biarkan tanpa auth
  }
  next(); // Lanjut ke route handler
}