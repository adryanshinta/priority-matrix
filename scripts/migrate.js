// ==========================================
// IMPORT MODULES & DEPENDENCIES
// ==========================================
import "dotenv/config"; // Load variabel environment dari file .env
import { readFileSync } from "fs"; // Baca file schema.sql dari disk
import { dirname, join } from "path"; // Utilitas path untuk resolusi direktori
import { fileURLToPath } from "url"; // Konversi URL file ke path (ESM)
import pg from "pg"; // PostgreSQL client
import { buildConnectionConfig } from "../server/db/connection.js"; // Normalisasi URL + SSL

// ==========================================
// VARIABEL KONFIGURASI PATH
// ==========================================
const __dirname = dirname(fileURLToPath(import.meta.url)); // Direktori file ini
const schemaPath = join(__dirname, "..", "server", "db", "schema.sql"); // Path schema.sql

// ==========================================
// FUNGSI UTAMA: JALANKAN MIGRASI
// ==========================================
async function runMigration() {
  // Baca isi schema.sql dari disk
  const schema = readFileSync(schemaPath, "utf8");

  // Validasi: pastikan DATABASE_URL terisi
  if (!process.env.DATABASE_URL) {
    console.error("ERROR: DATABASE_URL tidak ditemukan. Salin .env.example ke .env dan isi nilainya.");
    process.exit(1); // Keluar dengan kode error
  }

  // Buat client PostgreSQL baru.
  // buildConnectionConfig menormalkan URL (membuang `sslmode`) agar opsi SSL
  // yang kita tentukan tidak ditimpa oleh pg-connection-string.
  const client = new pg.Client(buildConnectionConfig(process.env.DATABASE_URL));

  try {
    // Konek ke database
    await client.connect();
    console.log("✅ Terhubung ke database");

    // Eksekusi seluruh isi schema.sql
    await client.query(schema);
    console.log("✅ Schema berhasil dibuat / sudah ada");

    // Verifikasi: hitung jumlah tabel yang terbuat
    const result = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
    );
    console.log(`📋 Tabel yang tersedia: ${result.rows.map((r) => r.table_name).join(", ")}`);
  } catch (err) {
    // Tangani error koneksi / query
    console.error("❌ Gagal menjalankan migrasi:", err.message);
    process.exit(1); // Keluar dengan kode error
  } finally {
    // Selalu tutup koneksi apakah sukses atau gagal
    await client.end();
    console.log("👋 Koneksi database ditutup");
  }
}

// Jalankan migrasi
runMigration();