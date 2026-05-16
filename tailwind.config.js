/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#09090b",
        "ink-soft": "#18181b",
        lemon: "#f4f4f5",
        coral: "#a1a1aa",
        mint: "#d4d4d8",
        paper: "#fafafa"
      },
      boxShadow: {
        glow: "0 18px 50px rgba(0,0,0,0.28)"
      }
    }
  },
  plugins: []
};
