// ==========================================
// IMPORT MODULES & DEPENDENCIES
// ==========================================

import jwt from "jsonwebtoken";
import { createHash, randomBytes } from "crypto";

// ==========================================
// KONSTANTA JWT
// ==========================================

const ACCESS_EXPIRY = "15m"; // Access token berlaku 15 menit
const REFRESH_EXPIRY = 30 * 24 * 60 * 60; // Refresh token berlaku 30 hari (dalam detik)

// ==========================================
// KETENTUAN COOKIE PENTING
// - httpOnly: benar — hindari XSS mengambil token
// - sameSite: 'strict' adalah baseline terkuat untuk CSRF, tapi 'lax'
//   perlu untuk flow OAuth redirect dari domain Google.
// - secure: harus aktif di production. Di development lokal (non-HTTPS)
//   cookie tetap dikirim, tapi kita hindari secure:true yang bisa
//   membuat browser menolak cookie di HTTP lokal.
// ==========================================

// Opsi cookie untuk access & refresh token
// secure di set hanya jika lingkungan production ATAU Vercel (serverless hostname HTTPS).
// Pada development lokal, tetap izinkan cookie dikirim di HTTP.
export const cookieOptions = {
  httpOnly: true, // Tidak bisa diakses JavaScript (proteksi XSS)
  sameSite: "lax", // Proteksi CSRF; diperlukan agar redirect OAuth dari Google bekerja
  secure: process.env.NODE_ENV === "production" || process.env.VERCEL === "1", // HTTPS wajib di production
  path: "/", // Berlaku di seluruh path
  // Penting: jangan set domain eksplisit kecuali diperlukan (misal subdomain).
  // Tanpa domain, browser mengikat cookie ke origin yang mengeluarkan cookie.
};

// Set cookie token ke respons
// maxAge dalam detik, tapi Express mengharapkan milidetik — gunakan ms.
export const setTokenCookies = (res, accessToken, refreshToken) => {
  res.cookie("access_token", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 menit
    httpOnly: true,
  });

  res.cookie("refresh_token", refreshToken, {
    ...cookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 hari
    httpOnly: true,
  });
};

// Hapus cookie token dari respons (untuk logout)
export const clearTokenCookies = (res) => {
  // Hapus cookie dengan parameter yang sama seperti saat pembuatan,
  // termasuk secure/sameSite, agar browser bisa mencocokkan cookie yang tepat.
  res.clearCookie("access_token", cookieOptions);
  res.clearCookie("refresh_token", cookieOptions);
};

// ==========================================
// JWT SIGN & VERIFY
// ==========================================

// Buat access token (umur pendek, untuk autentikasi setiap request)
export const signAccessToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY }); // Payload user id, sign dengan access secret

// Buat refresh token (umur panjang, untuk mendapatkan access baru)
export const signRefreshToken = (userId, jti) =>
  jwt.sign({ sub: userId, jti }, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY }); // Payload user id + unik id, sign dengan refresh secret

// Verifikasi access token, kembalikan userId
export const verifyAccessToken = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET); // Verify signature
  return decoded.sub; // Kembalikan subject (user id)
};

// Verifikasi refresh token, kembalikan payload
export const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET); // Verify signature, kembalikan decoded payload

// ==========================================
// SHA-256 HELPER
// ==========================================

// Hash token menjadi sha256 hex (untuk penyimpanan aman di database)
export const hashToken = (token) => createHash("sha256").update(token).digest("hex"); // Hash 1 arah, tidak bisa dibalik

// ==========================================
// UNIQUE ID GENERATOR
// ==========================================

// Buat JTI (JWT ID) acak untuk refresh token
export const generateJti = () => randomBytes(16).toString("hex"); // 16 byte hex acak
