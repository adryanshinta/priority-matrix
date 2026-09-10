// ==========================================
// VERCEL SERVERLESS ENTRY POINT
// Vercel memanggil function ini untuk setiap request.
// Express app dijadikan handler serverless langsung.
// ==========================================
import app from "../server/app.js"; // Express app (semua route API)

// Ekspor app sebagai default handler serverless Vercel
// Vercel Node runtime menerima Express app langsung karena
// app adalah function (req, res) — cocok dengan signature serverless.
export default app;