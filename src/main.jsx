// ==========================================
// IMPORT MODULES & DEPENDENCIES
// ==========================================
import React from "react"; // React library
import ReactDOM from "react-dom/client"; // ReactDOM client (React 18+)
import { BrowserRouter, Routes, Route } from "react-router-dom"; // Router + routes
import App from "./App"; // Komponen utama (halaman todo)
import Login from "./pages/Login"; // Halaman login Google
import Dashboard from "./pages/Dashboard"; // Halaman dashboard analytics
import PrivateRoutes from "./components/PrivateRoutes"; // Guard halaman ber-login
import { DarkModeProvider } from "./context/DarkModeContext"; // Provider dark mode
import { AuthProvider } from "./context/AuthContext"; // Provider autentikasi
import "./index.css"; // Tailwind CSS directives

// Cari root element di HTML
const rootElement = document.getElementById("root");

// Render aplikasi dengan seluruh provider dan router
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {/* DarkMode dulu (AuthContext membacanya) */}
    <DarkModeProvider>
      {/* Auth setelah DarkMode */}
      <AuthProvider>
        {/* Router untuk navigasi */}
        <BrowserRouter>
          {/* Definisi routes */}
          <Routes>
            {/* Public route: halaman login (tanpa guard) */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes: butuh login */}
            <Route element={<PrivateRoutes />}>
              <Route path="/" element={<App />} /> {/* Halaman todo utama */}
              <Route path="/dashboard" element={<Dashboard />} /> {/* Dashboard analytics */}
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </DarkModeProvider>
  </React.StrictMode>
);