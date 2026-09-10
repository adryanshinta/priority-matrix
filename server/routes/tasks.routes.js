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

// Semua route di file ini memerlukan autentikasi
router.use(requireAuth); // apply middleware ke seluruh route di bawah

// ==========================================
// ROUTE: GET /api/tasks
// Mengambil semua task milik user yang login
// ==========================================
router.get(
  "/",
  asyncHandler(async (req, res) => {
    // Query task berdasarkan user_id, urut dari terbaru
    const result = await query(
      `SELECT id, title, quadrant, completed, created_at, completed_at
       FROM tasks WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.userId], // Filter hanya milik user ini
    );

    res.json({ tasks: result.rows }); // Kembalikan daftar task
  }),
);

// ==========================================
// ROUTE: POST /api/tasks
// Membuat task baru
// ==========================================
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { title, quadrant } = req.body; // Ambil data dari body request

    // Validasi input
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Judul tugas wajib diisi" }); // Judul kosong
    }

    // Validasi kuadran (hanya q1-q4 yang diterima)
    const validQuadrants = ["q1", "q2", "q3", "q4"];
    if (!validQuadrants.includes(quadrant)) {
      return res.status(400).json({ message: "Kuadran tidak valid" }); // Kuadran salah
    }

    // Insert task baru ke database, kembalikan data task
    const result = await query(
      `INSERT INTO tasks (user_id, title, quadrant)
       VALUES ($1, $2, $3) RETURNING id, title, quadrant, completed, created_at, completed_at`,
      [req.userId, title.trim(), quadrant], // Parameter SQL
    );

    res.status(201).json({ task: result.rows[0] }); // Kembalikan task yang dibuat (status 201 = created)
  }),
);

// ==========================================
// ROUTE: PATCH /api/tasks/:id
// Update task (toggle completed) — analitis: set/clear completed_at
// ==========================================
router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params; // ID task dari URL
    const { completed } = req.body; // Status baru (boolean)

    // Pastikan task milik user ini (WHERE user_id)
    const result = await query(
      // SQL: update completed + set completed_at (now() jika selesai, NULL jika belum)
      `UPDATE tasks
       SET completed = $1,
           completed_at = CASE WHEN $1 THEN now() ELSE NULL END,
           updated_at = now()
       WHERE id = $2 AND user_id = $3
       RETURNING id, title, quadrant, completed, created_at, completed_at`,
      [completed, id, req.userId], // Parameter SQL
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task tidak ditemukan" }); // Task bukan milik user / tidak ada
    }

    res.json({ task: result.rows[0] }); // Kembalikan task yang diupdate
  }),
);

// ==========================================
// ROUTE: DELETE /api/tasks/:id
// Menghapus task
// ==========================================
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params; // ID task dari URL

    // Hapus task milik user ini
    const result = await query(
      `DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id`, // Hanya milik user
      [id, req.userId], // Parameter SQL
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task tidak ditemukan" }); // Bukan milik user / tidak ada
    }

    res.json({ ok: true }); // Response sukses
  }),
);

// ==========================================
// ROUTE: POST /api/tasks/import
// Impor task dari localStorage ke account (migrasi satu kali)
// ==========================================
router.post(
  "/import",
  asyncHandler(async (req, res) => {
    const { tasks } = req.body; // Array task dari localStorage

    // Validasi format
    if (!Array.isArray(tasks)) {
      return res.status(400).json({ message: "Format tasks harus array" });
    }

    const inserted = []; // Kumpulan hasil insert

    // Loop setiap task yang akan diimpor
    for (const task of tasks) {
      const { title, quadrant, completed, clientId } = task; // Ambil field task

      // Skip task tanpa judul
      if (!title || !title.trim()) continue;

      // Konversi clientId (Date.now() ms) menjadi timestamp SQL
      // Jika clientId berupa angka ms, gunakan sebagai created_at (preserve history)
      let createdAt;
      if (typeof clientId === "number" && clientId > 1000000000000) {
        // Date.now() menghasilkan angka ~1.7 triliun
        createdAt = new Date(clientId); // Konversi ms → Date
      } else {
        createdAt = new Date(); // Fallback: waktu sekarang
      }

      // Insert task dengan history original
      const result = await query(
        `INSERT INTO tasks (user_id, title, quadrant, completed, created_at, completed_at)
         VALUES ($1, $2, $3, $4, $5, CASE WHEN $4 THEN now() ELSE NULL END)
         RETURNING id, title, quadrant, completed, created_at, completed_at`,
        [req.userId, title.trim(), quadrant || "q1", completed || false, createdAt], // Parameter SQL
      );

      inserted.push(result.rows[0]); // Tambahkan ke hasil
    }

    res.status(201).json({ tasks: inserted, imported: inserted.length }); // Kembalikan jumlah import
  }),
);

// ==========================================
// EKSPOR ROUTER
// ==========================================
export default router; // Gunakan di app.js