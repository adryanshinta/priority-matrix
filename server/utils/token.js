// ==========================================
// IMPORT MODULES & DEPENDENCIES
// ==========================================
import jwt from "jsonwebtoken"; // Library JWT untuk sign & verify token
import { createHash, randomBytes } from "crypto"; // Kriptografi: sha256 hash & random byte generator

// ==========================================
// KONSTANTA JWT
// ==========================================
const ACCESS_EXPIRY = "15m"; // Access token berlaku 15 menit
const REFRESH_EXPIRY = 30 * 24 * 60 * 60; // Refresh token berlaku 30 hari (dalam detik)

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

// ==========================================
// COOKIE OPTIONS
// ==========================================

// Opsi cookie untuk access & refresh token
export const cookieOptions = {
  httpOnly: true, // Tidak bisa diakses JavaScript (proteksi XSS)
  sameSite: "lax", // Proteksi CSRF (hanya kirim di request top-level same-site)
  secure: process.env.NODE_ENV === "production", // Hanya HTTPS di production
  path: "/", // Berlaku di seluruh path
};

// ==========================================
// SET & CLEAR COOKIE HELPER
// ==========================================

// Set cookie token ke respons
export const setTokenCookies = (res, accessToken, refreshToken) => {
  res.cookie("access_token", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 }); // Access cookie 15 menit
  res.cookie("refresh_token", refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 }); // Refresh cookie 30 hari
};

// Hapus cookie token dari respons (untuk logout)
export const clearTokenCookies = (res) => {
  res.clearCookie("access_token", cookieOptions); // Hapus access cookie
  res.clearCookie("refresh_token", cookieOptions); // Hapus refresh cookie
};