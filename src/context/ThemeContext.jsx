/**
 * context/ThemeContext.jsx
 * Light/Dark theme context with localStorage persistence.
 */

import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  const [isLoading, setIsLoading] = useState(true);

  /* ── Initialize from localStorage ────────────────────── */
  useEffect(() => {
    const saved = localStorage.getItem("dahabnow_theme");
    if (saved && (saved === "light" || saved === "dark")) {
      setTheme(saved);
    } else {
      // Default: dark mode
      setTheme("dark");
      localStorage.setItem("dahabnow_theme", "dark");
    }
    setIsLoading(false);
  }, []);

  /* ── Toggle theme and save ───────────────────────────── */
  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === "dark" ? "light" : "dark";
      localStorage.setItem("dahabnow_theme", newTheme);
      return newTheme;
    });
  };

  if (isLoading) {
    return null; // Or a minimal splash screen
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

/* ── Theme color scheme ──────────────────────────────── */
export const themeColors = {
  dark: {
    bg: "#263238",
    card: "#455A64",
    text: "#FFFFFF",
    gold: "#D4AF37",
    border: "rgba(212,175,55,0.3)",
    textSecondary: "rgba(255,255,255,0.65)",
  },
  light: {
    bg: "#F5F0E8",
    card: "#FFFFFF",
    text: "#263238",
    gold: "#D4AF37",
    border: "#E0D5C0",
    textSecondary: "rgba(38,50,56,0.65)",
  },
};
