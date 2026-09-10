// ==========================================
// IMPORT MODULES & DEPENDENCIES
// ==========================================
import { config } from "../config.js"; // Ambil konfigurasi env

// ==========================================
// GOOGLE OAUTH SERVICE
// Implementasi manual OAuth2 flow tanpa library Passport
// Menggunakan fetch bawaan Node.js 18+
// ==========================================

// Konstanta URL Google API
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"; // URL halaman consent Google
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"; // URL tukar code menjadi token
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"; // URL ambil profil user

// ==========================================
// 1. BUILD CONSENT URL
// Membuat URL halaman consent Google untuk redirect
// ==========================================
export function buildConsentURL(state) {
  // Parameter query untuk OAuth2 authorization request
  const params = new URLSearchParams({
    client_id: config.googleClientId, // Client ID aplikasi
    redirect_uri: config.googleRedirectUri, // URI callback yang didaftarkan
    response_type: "code", // Request authorization code
    scope: "openid email profile", // Scope: profil & email pengguna
    state: state, // State acak untuk proteksi CSRF
    access_type: "offline", // Izinkan dapat refresh token
    prompt: "select_account", // Selalu minta pilih akun
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`; // Gabungkan URL consent
}

// ==========================================
// 2. EXCHANGE CODE
// Menukar authorization code menjadi access token
// ==========================================
export async function exchangeCode(code) {
  // Buat body request token exchange
  const body = new URLSearchParams({
    code, // Authorization code dari callback
    client_id: config.googleClientId, // Client ID
    client_secret: config.googleClientSecret, // Client Secret
    redirect_uri: config.googleRedirectUri, // Redirect URI harus sama persis
    grant_type: "authorization_code", // Grant type untuk exchange code
  });

  // Kirim POST request ke Google token endpoint
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST", // HTTP POST
    headers: { "Content-Type": "application/x-www-form-urlencoded" }, // Form-encoded body
    body, // Body request
  });

  if (!res.ok) {
    // Jika Google mengembalikan error
    const err = await res.text();
    throw new Error(`Google token exchange gagal: ${err}`); // Lempar error detail
  }

  return res.json(); // Kembalikan { access_token, id_token, refresh_token }
}

// ==========================================
// 3. GET USER INFO
// Mengambil profil pengguna Google menggunakan access token
// ==========================================
export async function getUserInfo(accessToken) {
  // Kirim GET request ke Google userinfo endpoint
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` }, // Bearer token autentikasi
  });

  if (!res.ok) {
    // Jika Google mengembalikan error
    throw new Error(`Google userinfo gagal: ${res.status}`); // Lempar error status
  }

  return res.json(); // Kembalikan { id, email, name, picture }
}