/**
 * components/common/ForgotPassword.jsx
 * Modal dialog for sending a Firebase password reset email.
 *
 * Props:
 *   isOpen    {boolean}  - Controls visibility
 *   onClose   {Function} - Called when the user dismisses the modal
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase/config";

/* ── Inline style tokens ─────────────────────────────────── */
const styles = {
  overlay: {
    position:        "fixed",
    inset:           0,
    backgroundColor: "rgba(0,0,0,0.65)",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    zIndex:          1000,
    padding:         "1rem",
  },
  card: {
    backgroundColor: "#455A64",
    borderRadius:    "16px",
    border:          "1px solid #D4AF37",
    padding:         "2rem",
    width:           "100%",
    maxWidth:        "420px",
    boxShadow:       "0 8px 40px rgba(0,0,0,0.5)",
  },
  title: {
    fontFamily:  "'Tajawal', sans-serif",
    fontSize:    "1.3rem",
    fontWeight:  700,
    color:       "#FFFFFF",
    marginBottom: "0.5rem",
  },
  desc: {
    fontFamily:  "'Tajawal', sans-serif",
    fontSize:    "0.9rem",
    color:       "rgba(255,255,255,0.7)",
    marginBottom: "1.5rem",
  },
  input: {
    width:           "100%",
    padding:         "0.75rem 1rem",
    backgroundColor: "rgba(38,50,56,0.7)",
    border:          "1.5px solid rgba(212,175,55,0.3)",
    borderRadius:    "10px",
    color:           "#FFFFFF",
    fontFamily:      "'Tajawal', sans-serif",
    fontSize:        "0.95rem",
    outline:         "none",
    marginBottom:    "1.25rem",
    boxSizing:       "border-box",
    transition:      "border-color 0.2s",
  },
  button: {
    width:           "100%",
    padding:         "0.85rem",
    backgroundColor: "#FFD700",
    color:           "#263238",
    border:          "none",
    borderRadius:    "10px",
    fontFamily:      "'Tajawal', sans-serif",
    fontSize:        "1rem",
    fontWeight:      700,
    cursor:          "pointer",
    marginBottom:    "0.75rem",
    transition:      "opacity 0.2s, transform 0.15s",
  },
  closeBtn: {
    width:           "100%",
    padding:         "0.7rem",
    backgroundColor: "transparent",
    color:           "#D4AF37",
    border:          "1px solid #D4AF37",
    borderRadius:    "10px",
    fontFamily:      "'Tajawal', sans-serif",
    fontSize:        "0.95rem",
    fontWeight:      600,
    cursor:          "pointer",
    transition:      "background-color 0.2s",
  },
  success: {
    backgroundColor: "rgba(212,175,55,0.12)",
    border:          "1px solid #D4AF37",
    borderRadius:    "8px",
    padding:         "0.75rem 1rem",
    color:           "#D4AF37",
    fontFamily:      "'Tajawal', sans-serif",
    fontSize:        "0.9rem",
    marginBottom:    "1rem",
  },
  error: {
    backgroundColor: "rgba(239,68,68,0.12)",
    border:          "1px solid rgba(239,68,68,0.5)",
    borderRadius:    "8px",
    padding:         "0.75rem 1rem",
    color:           "#FCA5A5",
    fontFamily:      "'Tajawal', sans-serif",
    fontSize:        "0.9rem",
    marginBottom:    "1rem",
  },
};

function ForgotPassword({ isOpen, onClose }) {
  const { t } = useTranslation();
  const [email, setEmail]       = useState("");
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);
  const [loading, setLoading]   = useState(false);

  /* ── Validate email format ───────────────────────────────── */
  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  /* ── Send reset email ────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError(t("errorRequiredField"));
      return;
    }
    if (!validateEmail(email)) {
      setError(t("errorInvalidEmail"));
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccess(true);
    } catch (err) {
      console.error("[ForgotPassword]", err);
      setError(t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  /* ── Reset state when modal closes ──────────────────────── */
  const handleClose = () => {
    setEmail("");
    setError("");
    setSuccess(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="fp-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={styles.overlay}
            onClick={handleClose}
          />

          {/* Modal card */}
          <motion.div
            key="fp-card"
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 20 }}
            transition={{ duration: 0.3, ease: [0.34, 1.2, 0.64, 1] }}
            style={{ ...styles.overlay, backgroundColor: "transparent" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.card}>
              <h2 style={styles.title}>{t("forgotPasswordTitle")}</h2>
              <p style={styles.desc}>{t("forgotPasswordDesc")}</p>

              {success ? (
                <div style={styles.success}>{t("resetEmailSent")}</div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  {error && <div style={styles.error}>{error}</div>}

                  <input
                    id="forgot-email"
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.input}
                    autoComplete="email"
                    disabled={loading}
                  />

                  <button
                    type="submit"
                    style={{
                      ...styles.button,
                      opacity: loading ? 0.7 : 1,
                    }}
                    disabled={loading}
                  >
                    {loading ? t("loading") : t("sendResetLink")}
                  </button>
                </form>
              )}

              <button
                type="button"
                style={styles.closeBtn}
                onClick={handleClose}
              >
                {t("closeModal")}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ForgotPassword;
