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
      // Bayangan kartu bertingkat untuk kesan profesional
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px -6px rgba(15, 23, 42, 0.10)",
        "card-hover": "0 2px 4px rgba(15, 23, 42, 0.05), 0 12px 28px -10px rgba(15, 23, 42, 0.18)",
      },
      // Keyframes animasi
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-down": {
          "0%": { opacity: "0", transform: "translateY(-6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-up-in": {
          "0%": { opacity: "0", transform: "translateY(24px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "check-pop": {
          "0%": { transform: "scale(0.7)" },
          "55%": { transform: "scale(1.18)" },
          "100%": { transform: "scale(1)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      // Utility animasi
      animation: {
        "fade-in": "fade-in 0.35s ease-out both",
        "fade-in-up": "fade-in-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in-down": "fade-in-down 0.25s ease-out both",
        "scale-in": "scale-in 0.22s ease-out both",
        "slide-up-in": "slide-up-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
        "check-pop": "check-pop 0.28s ease-out",
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [], // Placeholder untuk plugin Tailwind tambahan
};