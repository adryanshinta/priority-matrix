// ==========================================
// DATABASE POOL
// Pool koneksi PostgreSQL untuk seluruh aplikasi
// ==========================================

import "dotenv/config";
import pg from "pg";
import { buildConnectionConfig } from "./connection.js";

const { Pool } = pg;

// Normalisasi DATABASE_URL + opsi SSL di connection.js.
// Penting: `sslmode` pada URL tidak boleh dibiarkan karena bisa menimpa
// opsi SSL kita dan memicu error SELF_SIGNED_CERT_IN_CHAIN.
export const pool = new Pool(buildConnectionConfig());

// Helper query yang bisa dipakai di route/Service.
export const query = (text, params) => pool.query(text, params);
