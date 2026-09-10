// ==========================================
// IMPORT MODULES & DEPENDENCIES
// ==========================================
import app from "./app.js"; // Express app instance
import { config } from "./config.js"; // Konfigurasi env

// ==========================================
// START SERVER
// ==========================================
// Jalankan Express di port yang dikonfigurasi
app.listen(config.port, () => {
  console.log(`🚀 Server berjalan di http://localhost:${config.port}`);
  console.log(`   Mode: ${config.env}`);
  console.log(`   Client URL: ${config.clientUrl}`);
});