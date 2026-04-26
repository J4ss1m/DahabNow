/**
 * components/common/Toast.jsx
 * Global toast notification system — context + hook + renderer.
 *
 * Usage:
 *   1. Wrap app with <ToastProvider>
 *   2. In any component: const { showToast } = useToast();
 *      showToast("message", "success" | "error" | "info");
 *
 * The toast list renders in a fixed portal at top-right.
 * Each toast auto-dismisses after 3 seconds.
 */

import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheckCircle, FiX, FiInfo } from "react-icons/fi";

/* ── Context ─────────────────────────────────────────────────── */
const ToastContext = createContext(null);

/* ── Type → colour map ───────────────────────────────────────── */
const TYPE_STYLES = {
  success: { bg: "rgba(74,222,128,0.15)",  border: "rgba(74,222,128,0.5)",  color: "#4ADE80", icon: FiCheckCircle },
  error:   { bg: "rgba(239,68,68,0.15)",   border: "rgba(239,68,68,0.5)",   color: "#F87171", icon: FiX },
  info:    { bg: "rgba(212,175,55,0.15)",  border: "rgba(212,175,55,0.5)",  color: "#D4AF37", icon: FiInfo },
};

let _id = 0;

/* ══════════════════════════════════════════════════════════════
   PROVIDER
   ══════════════════════════════════════════════════════════════ */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info") => {
    const id = ++_id;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Fixed toast portal */}
      <div style={{
        position:    "fixed",
        top:         "80px",
        insetInlineEnd: "1rem",
        zIndex:      9999,
        display:     "flex",
        flexDirection: "column",
        gap:         "0.6rem",
        maxWidth:    "340px",
        width:       "calc(100% - 2rem)",
        pointerEvents: "none",
      }}>
        <AnimatePresence>
          {toasts.map((toast) => {
            const ts = TYPE_STYLES[toast.type] || TYPE_STYLES.info;
            const Icon = ts.icon;
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 60 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                style={{
                  backgroundColor: ts.bg,
                  border:          `1px solid ${ts.border}`,
                  borderRadius:    "12px",
                  padding:         "0.75rem 1rem",
                  display:         "flex",
                  alignItems:      "center",
                  gap:             "10px",
                  fontFamily:      "'Tajawal', sans-serif",
                  fontSize:        "0.9rem",
                  color:           "#FFFFFF",
                  boxShadow:       "0 4px 20px rgba(0,0,0,0.4)",
                  pointerEvents:   "all",
                  cursor:          "pointer",
                  backdropFilter:  "blur(8px)",
                }}
                onClick={() => dismiss(toast.id)}
              >
                <span style={{ color: ts.color, fontWeight: 700, fontSize: "1rem", flexShrink: 0, display: "inline-flex", alignItems: "center" }}>
                  <Icon />
                </span>
                <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

/* ── Hook ────────────────────────────────────────────────────── */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

export default ToastProvider;
