// ==========================================
// MIDDLEWARE: asyncHandler
// Membungkus async route handler agar error otomatis diteruskan ke error handler
// ==========================================

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next); // Tangkap promise rejection → next(err)

// ==========================================
// MIDDLEWARE: errorHandler
// Handler error sentral untuk semua route
// ==========================================

// eslint-disable-next-line no-unused-vars -- next diperlukan agar Express mengenali ini sebagai error handler
export function errorHandler(err, req, res, next) {
  // Log error di server console
  console.error("❌ Error:", err.message);

  // Response error ke client
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Terjadi kesalahan pada server", // Pesan error
      code: err.code || "INTERNAL_ERROR", // Kode error
    },
  });
}
