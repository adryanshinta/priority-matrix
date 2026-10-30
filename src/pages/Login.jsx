// ==========================================
// IMPORT MODULES & DEPENDENCIES
// ==========================================
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  GoogleIcon,
  MailIcon,
  LockIcon,
  UserIcon,
  EyeIcon,
  EyeOffIcon,
  ShieldIcon,
  AlertIcon,
  TargetIcon,
  CheckIcon,
} from "../components/Icons";

// ==========================================
// COMPONENT: Login
// Halaman autentikasi dengan dua metode:
//   1. Google OAuth
//   2. Login manual (email/username + password) atau daftar akun baru
// Akun dengan email sama akan digabung menjadi satu (OAuth & password).
// ==========================================
export default function Login() {
  const { login, loginWithPassword, register, user, loading } = useAuth();
  const navigate = useNavigate();

  const [method, setMethod] = useState("google"); // "google" | "password"
  const [mode, setMode] = useState("login"); // "login" | "register"

  const [identifier, setIdentifier] = useState(""); // Email atau username
  const [password, setPassword] = useState(""); // Password
  const [showPassword, setShowPassword] = useState(false); // Toggle lihat password

  const [name, setName] = useState(""); // Nama lengkap (daftar)
  const [email, setEmail] = useState(""); // Email (daftar)
  const [username, setUsername] = useState(""); // Username opsional (daftar)
  const [confirmPassword, setConfirmPassword] = useState(""); // Konfirmasi password

  const [errorMessage, setErrorMessage] = useState(""); // Pesan error
  const [submitting, setSubmitting] = useState(false); // Status proses

  // Redirect jika sudah login
  useEffect(() => {
    if (!loading && user) {
      navigate("/", { replace: true });
    }
  }, [loading, user, navigate]);

  // Baca pesan error dari query string (mis. Google redirect ?error=denied)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "denied") {
      setErrorMessage("Login dibatalkan. Silakan coba lagi.");
    } else if (params.get("error") === "stale") {
      setErrorMessage("Sesi login kedaluwarsa. Silakan coba lagi.");
    }
  }, []);

  // Jangan render saat loading atau sudah login (redirect ditangani effect)
  if (loading || user) return null;

  // ── Submit login / daftar ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (mode === "register") {
      // Validasi sisi klien sebelum kirim ke server
      if (!name.trim()) return setErrorMessage("Nama wajib diisi");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
        return setErrorMessage("Format email tidak valid");
      if (password.length < 8) return setErrorMessage("Password minimal 8 karakter");
      if (password !== confirmPassword) return setErrorMessage("Konfirmasi password tidak cocok");

      setSubmitting(true);
      try {
        const { ok, data } = await register({
          name: name.trim(),
          email: email.trim(),
          username: username.trim() || undefined,
          password,
        });
        if (!ok) {
          setErrorMessage(data?.message || "Gagal mendaftar. Coba lagi.");
        }
      } catch {
        setErrorMessage("Tidak dapat terhubung ke server.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Mode login
    if (!identifier.trim() || !password) {
      return setErrorMessage("Email/username dan password wajib diisi");
    }

    setSubmitting(true);
    try {
      const { ok, data } = await loginWithPassword(identifier.trim(), password);
      if (!ok) {
        setErrorMessage(data?.message || "Email/username atau password salah");
      }
    } catch {
      setErrorMessage("Tidak dapat terhubung ke server.");
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // RENDER UI
  // ==========================================
  return (
    <div className="min-h-screen flex items-center justify-center bg-sage-50 bg-gradient-to-br from-sage-100 via-sage-50 to-sage-200/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        {/* Logo & branding */}
        <div className="text-center mb-7 animate-fade-in-up">
          <div className="w-14 h-14 bg-gradient-to-br from-sage-500 to-sage-700 rounded-2xl grid place-items-center shadow-lg mx-auto mb-4">
            <TargetIcon className="w-7 h-7 text-white" strokeWidth={2.1} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Priority<span className="text-gradient-sage">Matrix</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Fokus pada prioritas, tingkatkan produktivitas
          </p>
        </div>

        {/* Card utama */}
        <div className="bg-white/85 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 dark:border-slate-700/60 p-5 sm:p-7 animate-fade-in-up">
          {/* Pilihan metode */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/50 rounded-xl p-1 mb-5">
            <button
              type="button"
              onClick={() => {
                setMethod("google");
                setErrorMessage("");
              }}
              className={`flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                method === "google"
                  ? "bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white"
              }`}
            >
              Google
            </button>
            <button
              type="button"
              onClick={() => {
                setMethod("password");
                setErrorMessage("");
              }}
              className={`flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                method === "password"
                  ? "bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white"
              }`}
            >
              Email & Password
            </button>
          </div>

          {/* ===== METODE GOOGLE ===== */}
          {method === "google" && (
            <div className="animate-fade-in">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">
                Selamat Datang
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                Masuk untuk mengelola tugas dan melihat analitikmu
              </p>

              <button
                onClick={login}
                className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.99]"
              >
                <GoogleIcon className="w-5 h-5" />
                Masuk dengan Google
              </button>

              <p className="mt-5 flex items-start gap-2 text-xs text-slate-400 dark:text-slate-500">
                <ShieldIcon className="w-4 h-4 shrink-0 mt-px" />
                Login menggunakan akun Google kamu. Data tersimpan aman.
              </p>
            </div>
          )}

          {/* ===== METODE EMAIL & PASSWORD ===== */}
          {method === "password" && (
            <div className="animate-fade-in">
              {/* Toggle login / daftar */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    {mode === "login" ? "Masuk" : "Buat Akun"}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {mode === "login"
                      ? "Gunakan email atau username kamu"
                      : "Email yang sama dengan akun Google akan digabung otomatis"}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {mode === "register" && (
                  <Field
                    icon={<UserIcon className="w-4 h-4" />}
                    label="Nama Lengkap"
                    value={name}
                    onChange={setName}
                    placeholder="Nama kamu"
                    autoComplete="name"
                  />
                )}

                {mode === "register" ? (
                  <Field
                    icon={<MailIcon className="w-4 h-4" />}
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="nama@email.com"
                    autoComplete="email"
                  />
                ) : (
                  <Field
                    icon={<MailIcon className="w-4 h-4" />}
                    label="Email / Username"
                    value={identifier}
                    onChange={setIdentifier}
                    placeholder="nama@email.com atau username"
                    autoComplete="username"
                  />
                )}

                {mode === "register" && (
                  <Field
                    icon={<UserIcon className="w-4 h-4" />}
                    label="Username (opsional)"
                    value={username}
                    onChange={setUsername}
                    placeholder="huruf, angka, underscore"
                    autoComplete="off"
                  />
                )}

                {/* Password dengan toggle lihat */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <LockIcon className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === "register" ? "Minimal 8 karakter" : "Password"}
                      autoComplete={mode === "register" ? "new-password" : "current-password"}
                      className="w-full pl-10 pr-11 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="w-4 h-4" />
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {mode === "register" && (
                  <Field
                    icon={<LockIcon className="w-4 h-4" />}
                    label="Konfirmasi Password"
                    type="password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="Ulangi password"
                    autoComplete="new-password"
                  />
                )}

                {/* Pesan error */}
                {errorMessage && (
                  <p className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg py-2 px-3 animate-fade-in">
                    <AlertIcon className="w-4 h-4 shrink-0" />
                    {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sage-500 to-sage-600 hover:from-sage-600 hover:to-sage-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-card-hover disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
                >
                  {submitting
                    ? "Memproses..."
                    : mode === "login"
                      ? "Masuk"
                      : "Daftar & Masuk"}
                </button>
              </form>

              {/* Beralih login/daftar */}
              <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
                {mode === "login" ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "login" ? "register" : "login");
                    setErrorMessage("");
                  }}
                  className="font-semibold text-sage-700 dark:text-sage-300 hover:underline"
                >
                  {mode === "login" ? "Daftar sekarang" : "Masuk di sini"}
                </button>
              </p>

              {/* Catatan penggabungan akun */}
              <p className="mt-4 flex items-start gap-2 text-xs text-slate-400 dark:text-slate-500">
                <CheckIcon className="w-4 h-4 shrink-0 mt-px text-sage-500" />
                Satu email = satu akun. Login Google & password dengan email yang sama
                akan menyatu.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// SUB-COMPONENT: Field
// Input dengan ikon di kiri dan label di atas.
// ==========================================
function Field({
  icon,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all"
        />
      </div>
    </div>
  );
}
