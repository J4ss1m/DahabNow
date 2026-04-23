/**
 * i18n/i18nConfig.js
 * Initialises react-i18next for DahabNow.
 * Import this file once at the top of main.jsx so i18next is ready globally.
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import ar from "./ar.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    lng:            "ar",         // Default language: Arabic
    fallbackLng:    "en",         // Fall back to English if a key is missing in Arabic
    interpolation: {
      escapeValue: false,         // React already escapes values
    },
  });

export default i18n;
