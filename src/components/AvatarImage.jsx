// ==========================================
// COMPONENT: AvatarImage
// Avatar pengguna yang robust:
// - Tampil avatar Google jika berhasil
// - Fallback ke inisial nama jika gambar gagal / tidak ada
// - Tidak pernah menampilkan "broken image" icon
// ==========================================
import { useState } from "react"; // State untuk tracking error gambar

export default function AvatarImage({ user, size = "md" }) {
  // State foto avatar gagal dimuat (default: belum gagal)
  const [imgFailed, setImgFailed] = useState(false); // false = coba tampilkan gambar

  // Ambil inisial dari nama user (1-2 huruf pertama)
  const initials = getInitials(user.name || "?"); // Fallback "?" jika nama kosong

  // Ukuran avatar sesuai prop (sm=small, md=medium, lg=large)
  const sizeClass =
    size === "sm"
      ? "w-6 h-6 text-[10px]" // Ukuran kecil
      : size === "lg"
        ? "w-12 h-12 text-base" // Ukuran besar
        : "w-8 h-8 text-xs"; // Ukuran medium (default)

  // ==========================================
  // RENDER
  // ==========================================

  // Jika ada avatar URL DAN gambar belum gagal → tampilkan <img>
  if (user.avatar_url && !imgFailed) {
    return (
      <img
        src={user.avatar_url} // URL avatar dari Google
        alt={user.name} // Teks alternatif (nama user)
        onError={() => setImgFailed(true)} // Jika gambar gagal → aktifkan fallback
        referrerPolicy="no-referrer" // Penting: Google avatar tolak hotlink tanpa ini
        className={`${sizeClass} shrink-0 rounded-full border-2 border-slate-200 dark:border-slate-600 object-cover`}
      />
    );
  }

  // Fallback: lingkaran dengan inisial nama (selalu tampil, tanpa broken image)
  return (
    <div
      className={`${sizeClass} shrink-0 rounded-full bg-gradient-to-br from-sage-500 to-sage-700 text-white font-bold flex items-center justify-center select-none`}
    >
      {initials} {/* Inisial user */}
    </div>
  );
}

// ==========================================
// HELPER: getInitials
// Mengambil 2 huruf pertama dari nama untuk fallback avatar
// ==========================================
function getInitials(name) {
  // Pecah nama per kata, ambil huruf pertama tiap kata
  const parts = name.split(" ").filter(Boolean); // Buang spasi kosong

  if (parts.length === 0) return "?"; // Nama kosong → "?"
  if (parts.length === 1) return parts[0][0].toUpperCase(); // 1 kata → huruf pertama
  return (parts[0][0] + parts[1][0]).toUpperCase(); // 2+ kata → huruf pertama 2 kata
}