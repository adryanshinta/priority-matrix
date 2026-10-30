// ==========================================
// UTIL: Password Hashing (scrypt)
// Menggunakan modul crypto bawaan Node.js agar tanpa dependency tambahan.
// Format penyimpanan: scrypt$<salt-hex>$<hash-hex>
// ==========================================

import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCallback); // Versi Promise dari scrypt

const SALT_BYTES = 16; // Panjang salt (byte)
const KEY_LENGTH = 64; // Panjang kunci turunan (byte)

// Hash password menjadi string yang aman disimpan di database.
export async function hashPassword(password) {
  const salt = randomBytes(SALT_BYTES).toString("hex"); // Salt acak unik per user
  const derived = await scrypt(password, salt, KEY_LENGTH); // Turunkan kunci
  return `scrypt$${salt}$${derived.toString("hex")}`; // Gabung skema + salt + hash
}

// Verifikasi password terhadap hash tersimpan.
// Mengembalikan false untuk hash kosong/format tidak dikenal.
export async function verifyPassword(password, stored) {
  if (!stored || typeof stored !== "string") return false;

  const [scheme, salt, hash] = stored.split("$"); // Pisahkan komponen
  if (scheme !== "scrypt" || !salt || !hash) return false;

  const derived = await scrypt(password, salt, KEY_LENGTH); // Turunkan ulang dengan salt sama
  const expected = Buffer.from(hash, "hex"); // Hash tersimpan → Buffer

  // timingSafeEqual melempar jika panjang beda → cek dulu
  if (expected.length !== derived.length) return false;

  return timingSafeEqual(expected, derived); // Perbandingan konstan-waktu (anti timing attack)
}
