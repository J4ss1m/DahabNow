/**
 * context/LanguageContext.jsx
 * Manages the active UI language (Arabic / English) for DahabNow.
 *
 * Behaviour:
 *   - Default language is Arabic ("ar")
 *   - Arabic → sets document dir="rtl" automatically
 *   - English → sets document dir="ltr" automatically
 *   - Persists user's preference to localStorage so it survives page reloads
 *   - Also calls i18next.changeLanguage() to keep translations in sync
 */

import { createContext, useContext, useEffect, useState } from "react";
import i18n from "../i18n/i18nConfig";

// ─── Context Definition ──────────────────────────────────────

const LanguageContext = createContext(null);

// ─── Provider ────────────────────────────────────────────────

/**
 * Wrap your app root with <LanguageProvider> to make language state
 * available everywhere via the useLanguage() hook.
 */
export function LanguageProvider({ children }) {
  // Restore persisted preference, default to Arabic
  const [language, setLanguage] = useState(
    () => localStorage.getItem("dahabnow_lang") ?? "ar"
  );

  // Apply direction and i18n language whenever language changes
  useEffect(() => {
    const dir = language === "ar" ? "rtl" : "ltr";

    // Set document direction for RTL/LTR layout
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", language);

    // Sync i18next
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }

    // Persist preference
    localStorage.setItem("dahabnow_lang", language);
  }, [language]);

  /**
   * Toggle between Arabic and English.
   */
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "ar" ? "en" : "ar"));
  };

  const value = {
    language,       // "ar" | "en"
    toggleLanguage, // () => void
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// ─── Custom Hook ─────────────────────────────────────────────

/**
 * Access the LanguageContext from any functional component.
 * @returns {{ language: string, toggleLanguage: Function }}
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a <LanguageProvider>");
  }
  return context;
}
