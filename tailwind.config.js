/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // Scan file index.html untuk class Tailwind
    "./src/**/*.{js,ts,jsx,tsx}", // Scan semua file JSX/TSX di folder src
  ],
  darkMode: "class", // Aktifkan dark mode berbasis class (toggle class "dark" di <html>)
  theme: {
    extend: {
      // ==========================================
      // PALETTE SAGE — warna fresh & minimalis (anak muda)
      // Warna utama brand: sage hijau kalem #8B9A6E
      // ==========================================
      colors: {
        sage: {
          50: "#f2f5ec", // Paling terang: background halus
          100: "#e4e9d9", // Background cards
          200: "#ccd5b8", // Border / divider
          300: "#b3c092", // Hover / aksen lembut
          400: "#9aa87a", // Intermediate
          500: "#8B9A6E", // PRIMARY: sage utama (dari user)
          600: "#74835a", // Hover tombol utama
          700: "#5d6a48", // Teks kuat / aktif
          800: "#4a5440", // Teks gelap sage
          900: "#38402f", // Paling gelap
        },
        // Aksen pelengkap friendly (analogous di colour wheel)
        cream: "#faf9f4", // Background netral hangat (bukan putih murni)
        clay: {
          500: "#c98a6b", // Aksen terracotta lembut (pemanis)
          600: "#b57756", // Hover clay
        },
      },
      // Animasi halus untuk feel modern
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)", // Overshoot lembut
      },
    },
  },
  plugins: [], // Placeholder untuk plugin Tailwind tambahan
};