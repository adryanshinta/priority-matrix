// ==========================================
// IMPORT MODULES & DEPENDENCIES
// ==========================================
import { Router } from "express"; // Router Express untuk kelompok route
import { query } from "../db/pool.js"; // Pool + helper query database
import { requireAuth } from "../middleware/auth.js"; // Middleware autentikasi
import { asyncHandler } from "../middleware/error.js"; // Pembungkus async handler

// ==========================================
// ROUTER INSTANCE
// ==========================================
const router = Router(); // Buat router Express baru

// Semua route analytics memerlukan autentikasi
router.use(requireAuth); // apply middleware

// ==========================================
// ROUTE: GET /api/analytics
// Analytics lengkap: series per hari/minggu, distribusi kuadran, totals, rate trend
// Query params: ?range=7|30|90  &  group=day|week
// ==========================================
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const userId = req.userId; // ID user yang login

    // Parse & validasi parameter range
    const range = parseInt(req.query.range) || 7; // Default 7 hari
    const validRanges = [7, 30, 90]; // Range yang didukung
    const safeRange = validRanges.includes(range) ? range : 7; // Fallback ke 7

    // Parse & validasi parameter group (day/week)
    const group = req.query.group === "week" ? "week" : "day"; // Default day

    // ==========================================
    // 1. SERIES: Task selesai per periode
    // generate_series membuat daftar tanggal lengkap (zero-filled)
    // ==========================================
    let seriesQuery;
    let seriesParams;

    if (group === "day") {
      // Kelompokkan per hari
      seriesQuery = `
        SELECT d::date AS date, COUNT(t.id)::int AS completed
        FROM generate_series(
          CURRENT_DATE - ($1::int - 1), CURRENT_DATE, '1 day'
        ) AS d
        LEFT JOIN tasks t
          ON date_trunc('day', t.completed_at)::date = d::date
          AND t.user_id = $2 AND t.completed
        GROUP BY d ORDER BY d`;
      seriesParams = [safeRange, userId]; // Parameter: range + user
    } else {
      // Kelompokkan per minggu
      seriesQuery = `
        SELECT date_trunc('week', d)::date AS date, COUNT(t.id)::int AS completed
        FROM generate_series(
          CURRENT_DATE - (($1::int - 1)::int), CURRENT_DATE, '1 day'
        ) AS d
        LEFT JOIN tasks t
          ON date_trunc('week', t.completed_at)::date = date_trunc('week', d)::date
          AND t.user_id = $2 AND t.completed
        GROUP BY date_trunc('week', d) ORDER BY 1`;
      seriesParams = [safeRange, userId]; // Parameter: range + user
    }

    const seriesResult = await query(seriesQuery, seriesParams); // Jalankan query series

    // ==========================================
    // 2. QUADRANTS: Distribusi per kuadran
    // ==========================================
    const quadrantsResult = await query(
      `SELECT quadrant, COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE completed)::int AS completed
       FROM tasks WHERE user_id = $1 GROUP BY quadrant`,
      [userId],
    );

    // Zero-fill: pastikan semua 4 kuadran selalu ada di response
    const quadrants = ["q1", "q2", "q3", "q4"].map((q) => {
      const found = quadrantsResult.rows.find((row) => row.quadrant === q); // Cari di hasil DB
      return {
        quadrant: q, // Nama kuadran
        total: found ? found.total : 0, // Total task (default 0)
        completed: found ? found.completed : 0, // Task selesai (default 0)
      };
    });

    // ==========================================
    // 3. TOTALS: Total & rata-rata per hari
    // ==========================================
    const totalsResult = await query(
      `SELECT COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE completed)::int AS completed
       FROM tasks WHERE user_id = $1`,
      [userId],
    );

    const totals = totalsResult.rows[0]; // { total, completed }
    const avgPerDay = safeRange > 0 ? (totals.completed / safeRange).toFixed(1) : "0.0"; // Rata-rata selesai/hari

    // ==========================================
    // 4. RATE TREND: Persentase selesai per periode
    // Hitung create vs complete per hari untuk rate harian
    // ==========================================
    const trendQuery = `
      WITH days AS (
        SELECT generate_series(
          CURRENT_DATE - $1::int + 1, CURRENT_DATE, '1 day'
        )::date AS day
      )
      SELECT days.day::date AS date,
        (SELECT COUNT(*) FROM tasks t
          WHERE t.user_id = $2 AND date_trunc('day', t.created_at)::date = days.day
        )::int AS created,
        (SELECT COUNT(*) FROM tasks t
          WHERE t.user_id = $2 AND t.completed
            AND date_trunc('day', t.completed_at)::date = days.day
        )::int AS completed
      FROM days ORDER BY days.day`;

    const trendResult = await query(trendQuery, [safeRange, userId]); // Jalankan query trend

    // Hitung persentase rate per hari (created vs completed)
    const rateTrend = trendResult.rows.map((row) => ({
      date: row.date, // Tanggal
      rate: row.created > 0 ? Math.round((row.completed / row.created) * 100) : 0, // Rate % (0 jika tidak ada)
    }));

    // ==========================================
    // RESPONSE GABUNGAN
    // ==========================================
    res.json({
      range: safeRange, // Range yang dipakai
      group, // Grup (day/week)
      series: seriesResult.rows, // Task selesai per periode
      quadrants, // Distribusi 4 kuadran
      totals: {
        total: totals.total, // Total semua task
        completed: totals.completed, // Total selesai
        avgPerDay, // Rata-rata per hari
      },
      rateTrend, // Tren persentase selesai
    });
  }),
);

// ==========================================
// EKSPOR ROUTER
// ==========================================
export default router; // Gunakan di app.js