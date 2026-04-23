/**
 * main.jsx
 * Application entry point for DahabNow.
 *
 * Mount order:
 *   1. i18n initialised (must run before any component renders translated text)
 *   2. Global CSS applied
 *   3. React tree wrapped with AuthProvider and LanguageProvider
 *   4. App rendered into #root
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// ── i18n (must be imported before any component that uses useTranslation) ──
import "./i18n/i18nConfig";

// ── Global Styles ───────────────────────────────────────────────────────────
import "./styles/globals.css";

// ── Context Providers ──────────────────────────────────────────────────────
import { AuthProvider }     from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";

// ── Root Component ─────────────────────────────────────────────────────────
import App from "./App";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* LanguageProvider must wrap AuthProvider so direction is set before auth spinner renders */}
    <LanguageProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </LanguageProvider>
  </StrictMode>
);
