// ==========================================
// KONFIGURASI KONEKSI DATABASE
// Dipakai oleh pool runtime, serverless Vercel, dan script migrasi.
// ==========================================

// Production runtime (termasuk Vercel serverless) wajib SSL.
const isProduction =
  process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

// Sejak pg-connection-string v2.7, parameter `sslmode` di DATABASE_URL diparse
// menjadi objek `ssl` yang MENIMPA opsi `ssl` dari kode. Mulai v2.12,
// `sslmode=require` diperlakukan seperti `verify-full`, sehingga rantai
// sertifikat self-signed (Supabase/Neon/pooler internal) ditolak dengan
// SELF_SIGNED_CERT_IN_CHAIN.
//
// Karena itu parameter SSL dibuang dari URL, lalu opsi `ssl` ditentukan di sini.
const SSL_QUERY_PARAMS = ["sslmode", "ssl", "uselibpqcompat"];

export function buildConnectionConfig(rawUrl = process.env.DATABASE_URL) {
  let connectionString = rawUrl;
  let urlRequestsSsl = false;

  if (rawUrl) {
    try {
      const parsed = new URL(rawUrl);
      const sslMode = parsed.searchParams.get("sslmode");

      // `sslmode=disable` berarti URL memang tidak meminta SSL.
      urlRequestsSsl =
        parsed.searchParams.get("ssl") === "true" ||
        (sslMode !== null && sslMode !== "disable");

      for (const param of SSL_QUERY_PARAMS) {
        parsed.searchParams.delete(param);
      }

      connectionString = parsed.toString();
    } catch {
      // URL tidak valid: biarkan `pg` yang melaporkan errornya.
      connectionString = rawUrl;
    }
  }

  const config = { connectionString };

  if (isProduction || urlRequestsSsl) {
    config.ssl = { rejectUnauthorized: false };
  }

  return config;
}

export { isProduction };
