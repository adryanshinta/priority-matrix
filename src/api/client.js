// ==========================================
// API CLIENT
// Pembungkus fetch untuk semua request ke backend
// Mengirim cookie otomatis + handel refresh token saat 401
// ==========================================

const API_BASE = "/api";

// Fungsi fetch dasar dengan credentials (kirim cookie)
async function baseFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;

  const res = await fetch(url, {
    ...options,
    credentials: "include", // Kirim cookies setiap request
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = res.status === 204 ? null : await res.json().catch(() => null);

  // Jika sesi berakhir (401 AUTH_EXPIRED), coba refresh sekali
  if (res.status === 401 && data?.code === "AUTH_EXPIRED") {
    const refreshSuccess = await tryRefresh();

    if (refreshSuccess) {
      // Refresh sukses — ulangi request original
      const retryRes = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });
      const retryData = retryRes.status === 204 ? null : await retryRes.json().catch(() => null);

      if (!retryRes.ok) {
        // Refresh berhasil tapi request masih gagal (misal izin berubah)
        window.dispatchEvent(new CustomEvent("auth-expired"));
        return { status: retryRes.status, data: retryData };
      }

      return { status: retryRes.status, data: retryData };
    }

    // Refresh gagal (sesi benar-benar habis)
    window.dispatchEvent(new CustomEvent("auth-expired"));
    return { status: 401, data };
  }

  return { status: res.status, data };
}

// Coba ambil access token baru melalui refresh token.
// Dipanggil otomatis oleh baseFetch saat server membalas 401 AUTH_EXPIRED.
async function tryRefresh() {
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    // refresh berhasil jika server merespons OK;
    // respons body diabaikan karena cookie access/refresh yang baru
    // sudah diset oleh server.
    return res.ok;
  } catch {
    return false;
  }
}

// ==========================================
// EKSPOR API METHODS
// ==========================================

export const get = (path) => baseFetch(path, { method: "GET" });

export const post = (path, body) =>
  baseFetch(path, { method: "POST", body: JSON.stringify(body) });

export const patch = (path, body) =>
  baseFetch(path, { method: "PATCH", body: JSON.stringify(body) });

export const del = (path) => baseFetch(path, { method: "DELETE" });

// ==========================================
// EKSPOR fungsi khusus auth
// ==========================================

// Redirect ke halaman consent Google.
// Menggunakan full-page redirect karena browser harus berinteraksi
// dengan server Google; ini adalah pola standar OAuth 2.0.
export const loginWithGoogle = () => {
  window.location.href = "/api/auth/google";
};

// Hapus sesi di server dan beritahu aplikasi agar keluar.
// Endpoint mengembalikan JSON, tetapi cookie dihapus oleh server,
// dan aplikasi bereaksi lewat event "auth-expired".
export const logout = async () => {
  await baseFetch("/auth/logout", { method: "POST" });
  window.dispatchEvent(new CustomEvent("auth-expired"));
};

// Ambil profil user yang sedang login.
// Jika tidak ada sesi, akan mengembalikan status 401.
export const getMe = () => get("/auth/me");

// Login manual menggunakan email ATAU username + password.
// Mengembalikan { status, data } agar pemanggil bisa menampilkan pesan error.
export const loginWithPassword = (identifier, password) =>
  post("/auth/login", { identifier, password });

// Daftar akun baru dengan email + password.
// Jika email sudah punya akun OAuth, password akan ditautkan ke akun yang sama.
export const registerUser = ({ name, email, username, password }) =>
  post("/auth/register", { name, email, username, password });
