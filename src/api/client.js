// ==========================================
// API CLIENT
// Pembungkus fetch untuk semua request ke backend
// Mengirim cookie otomatis + handel refresh token saat 401
// ==========================================

// Fungsi fetch dasar dengan credentials (kirim cookie)
async function baseFetch(path, options = {}) {
  // Kirim request dengan cookie otomatis (important utk httpOnly token)
  const res = await fetch(`/api${path}`, {
    ...options, // Spread options (method, body, dll)
    credentials: "include", // Kirim cookies setiap request
    headers: {
      "Content-Type": "application/json", // Format JSON
      ...options.headers, // Opsi header tambahan
    },
  });

  // Parse JSON response
  const data = res.status === 204 ? null : await res.json().catch(() => null); // 204 = no content

  // Jika sesi berakhir (401 AUTH_EXPIRED), coba refresh sekali
  if (res.status === 401 && data?.code === "AUTH_EXPIRED") {
    const refreshSuccess = await tryRefresh(); // Coba dapat access baru

    if (refreshSuccess) {
      // Refresh sukses — ulangi request original
      const retryRes = await fetch(`/api${path}`, {
        ...options, // Options sama
        credentials: "include", // Kirim cookies (termasuk yang baru)
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });
      const retryData = retryRes.status === 204 ? null : await retryRes.json().catch(() => null);
      return { status: retryRes.status, data: retryData }; // Kembalikan hasil retry
    }

    // Refresh gagal (sesi benar-benar habis)
    window.dispatchEvent(new CustomEvent("auth-expired")); // Emit event → AuthContext logout
    return { status: 401, data }; // Kembalikan 401
  }

  return { status: res.status, data }; // Kembalikan hasil normal
}

// Fungsi refresh token (dipanggil saat 401)
async function tryRefresh() {
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST", // POST refresh endpoint
      credentials: "include", // Kirim refresh cookie
    });
    return res.ok; // true jika sukses
  } catch {
    return false; // Gagal
  }
}

// ==========================================
// EKSPOR API METHODS
// ==========================================

// GET helper
export const get = (path) => baseFetch(path, { method: "GET" });

// POST helper
export const post = (path, body) =>
  baseFetch(path, { method: "POST", body: JSON.stringify(body) });

// PATCH helper
export const patch = (path, body) =>
  baseFetch(path, { method: "PATCH", body: JSON.stringify(body) });

// DELETE helper
export const del = (path) => baseFetch(path, { method: "DELETE" });

// ==========================================
// EKSPOR fungsi khusus auth
// ==========================================

// Login via Google: redirect ke endpoint auth (browser mengikuti redirect ke Google)
export const loginWithGoogle = () => {
  window.location.href = "/api/auth/google"; // Full page redirect (tanpa fetch)
};

// Logout: panggil endpoint, lalu emit event
export const logout = async () => {
  await baseFetch("/auth/logout", { method: "POST" }); // Revoke session
  window.dispatchEvent(new CustomEvent("auth-expired")); // Emit event logout
};

// Ambil user saat ini
export const getMe = () => get("/auth/me"); // GET /api/auth/me