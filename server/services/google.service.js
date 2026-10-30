// ==========================================
// Google OAuth Service
// Implementasi manual OAuth2 flow tanpa Passport.
// Menggunakan fetch bawaan Node.js 18+.
// ==========================================

import { config, assertGoogleConfigured } from "../config.js";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

// ── 1. BUILD CONSENT URL ──────────────────────────────────────────────────────
export function buildConsentURL(state) {
  assertGoogleConfigured();

  const params = new URLSearchParams({
    client_id: config.googleClientId,
    redirect_uri: config.googleRedirectUri,
    response_type: "code",
    scope: "openid email profile",
    state: state,
    access_type: "offline",
    prompt: "select_account",
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

// ── 2. EXCHANGE CODE ──────────────────────────────────────────────────────────
export async function exchangeCode(code) {
  assertGoogleConfigured();

  const redirectUri = config.googleRedirectUri;
  if (!redirectUri) {
    throw new Error("GOOGLE_REDIRECT_URI tidak diatur");
  }

  const body = new URLSearchParams({
    code,
    client_id: config.googleClientId,
    client_secret: config.googleClientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google token exchange gagal: ${res.status} ${err}`);
  }

  const payload = await res.json();

  if (!payload.access_token) {
    throw new Error("Google token exchange tidak mengandung access_token");
  }

  return payload;
}

// ── 3. GET USER INFO ──────────────────────────────────────────────────────────
export async function getUserInfo(accessToken) {
  assertGoogleConfigured();

  if (!accessToken) {
    throw new Error("accessToken wajib diisi untuk mengambil profil Google");
  }

  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Google userinfo gagal: ${res.status}`);
  }

  const payload = await res.json();

  if (!payload.id || !payload.email) {
    throw new Error("Google userinfo tidak mengandung id atau email");
  }

  return payload;
}
