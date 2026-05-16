/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101820",
        "ink-soft": "#1b2b34",
        lemon: "#f7c948",
        coral: "#ff6b6b",
        mint: "#2ec4b6",
        paper: "#fff7e8"
      },
      boxShadow: {
        glow: "0 18px 50px rgba(0,0,0,0.22)"
      }
    }
  },
  plugins: []
};
