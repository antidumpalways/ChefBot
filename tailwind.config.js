/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['var(--font-inter)', 'Inter', 'sans-serif'],
        'lora': ['var(--font-lora)', 'Lora', 'serif'],
        'dm-serif-display': ['var(--font-dm-serif-display)', 'DM Serif Display', 'serif'],
        'roboto-condensed': ['var(--font-roboto-condensed)', 'Roboto Condensed', 'sans-serif'],
        'poppins': ['var(--font-poppins)', 'Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          // ChefBot Pro - Minimalis Profesional Modern (Sensay Style)
          "primary": "#1A1A1A",           // Hitam pekat - profesional, modern
          "primary-focus": "#2A2A2A",     // Hitam lebih terang untuk hover
          "primary-content": "#FFFFFF",   // Putih untuk konten di atas primary
          "secondary": "#6B7280",         // Abu-abu modern - untuk elemen sekunder
          "secondary-focus": "#9CA3AF",   // Abu-abu lebih terang untuk hover
          "secondary-content": "#FFFFFF", // Putih untuk konten di atas secondary
          "accent": "#3B82F6",            // Biru modern - untuk aksen dan CTA
          "accent-focus": "#60A5FA",      // Biru lebih terang untuk hover
          "accent-content": "#FFFFFF",    // Putih untuk konten di atas accent
          "neutral": "#6B7280",           // Abu-abu untuk teks deskripsi
          "neutral-focus": "#9CA3AF",     // Abu-abu lebih terang untuk hover
          "neutral-content": "#FFFFFF",   // Putih untuk konten di atas neutral
          "base-100": "#FFFFFF",          // Putih bersih - latar belakang utama
          "base-200": "#F9FAFB",          // Abu-abu sangat terang - latar belakang kartu
          "base-300": "#E5E7EB",          // Abu-abu terang untuk border
          "base-content": "#1A1A1A",      // Hitam untuk teks utama
          "info": "#3B82F6",              // Biru untuk info
          "info-focus": "#60A5FA",        // Biru lebih terang untuk hover
          "info-content": "#FFFFFF",      // Putih untuk konten info
          "success": "#10B981",           // Hijau modern untuk success
          "success-focus": "#34D399",     // Hijau lebih terang untuk hover
          "success-content": "#FFFFFF",   // Putih untuk konten success
          "warning": "#F59E0B",           // Kuning modern untuk warning
          "warning-focus": "#FBBF24",     // Kuning lebih terang untuk hover
          "warning-content": "#1A1A1A",   // Hitam untuk konten warning
          "error": "#EF4444",             // Merah modern untuk error
          "error-focus": "#F87171",       // Merah lebih terang untuk hover
          "error-content": "#FFFFFF"      // Putih untuk konten error
        },
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          // Dark theme - Minimalis Profesional Modern
          "primary": "#FFFFFF",           // Putih untuk dark mode - kontras tinggi
          "primary-focus": "#E5E7EB",     // Putih lebih gelap untuk hover
          "primary-content": "#1A1A1A",   // Hitam untuk konten di atas primary
          "secondary": "#9CA3AF",         // Abu-abu untuk elemen sekunder
          "secondary-focus": "#D1D5DB",   // Abu-abu lebih terang untuk hover
          "secondary-content": "#1A1A1A", // Hitam untuk konten di atas secondary
          "accent": "#3B82F6",            // Biru modern untuk aksen
          "accent-focus": "#60A5FA",      // Biru lebih terang untuk hover
          "accent-content": "#FFFFFF",    // Putih untuk konten di atas accent
          "neutral": "#9CA3AF",           // Abu-abu untuk teks
          "neutral-focus": "#D1D5DB",     // Abu-abu lebih terang untuk hover
          "neutral-content": "#FFFFFF",   // Putih untuk konten di atas neutral
          "base-100": "#1A1A1A",          // Hitam pekat untuk background
          "base-200": "#2A2A2A",          // Abu-abu gelap untuk kartu
          "base-300": "#3A3A3A",          // Abu-abu lebih terang untuk border
          "base-content": "#FFFFFF",      // Putih untuk teks di dark mode
        },
      },
    ],
  },
};
