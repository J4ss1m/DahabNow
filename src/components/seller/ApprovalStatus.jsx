/**
 * components/seller/ApprovalStatus.jsx
 * Real-time approval status screen using Firestore onSnapshot.
 * Automatically redirects to seller dashboard when status changes to "approved".
 */

import { useEffect, useState } from "react";
import { motion }              from "framer-motion";
import { useTranslation }      from "react-i18next";
import { useNavigate }         from "react-router-dom";
import { doc, onSnapshot }     from "firebase/firestore";
import { db }                  from "../../firebase/config";
import { useAuth }             from "../../context/AuthContext";
import { useLanguage }         from "../../context/LanguageContext";
import DahabNowLogo            from "../common/DahabNowLogo";

const S = {
  page:  { minHeight: "100vh", backgroundColor: "#263238", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", fontFamily: "'Tajawal', sans-serif" },
  card:  { backgroundColor: "#455A64", border: "1.5px solid rgba(212,175,55,0.35)", borderRadius: "20px", padding: "2.5rem 2rem", width: "100%", maxWidth: "460px", textAlign: "center", boxShadow: "0 8px 40px rgba(0,0,0,0.45)" },
  icon:  { fontSize: "3.5rem", lineHeight: 1, marginBottom: "1rem" },
  title: { fontSize: "1.3rem", fontWeight: 800, color: "#FFFFFF", margin: "0 0 0.75rem" },
  msg:   { fontSize: "0.95rem", color: "rgba(255,255,255,0.65)", margin: "0 0 1.5rem", lineHeight: 1.6 },
  badge: (color) => ({ display: "inline-block", backgroundColor: color + "22", color, border: `1px solid ${color}55`, borderRadius: "20px", padding: "3px 14px", fontSize: "0.8rem", fontWeight: 700, marginBottom: "1.25rem" }),
  reapplyBtn: { backgroundColor: "#FFD700", color: "#263238", border: "none", borderRadius: "10px", padding: "0.8rem 2rem", fontFamily: "'Tajawal', sans-serif", fontSize: "0.95rem", fontWeight: 700, cursor: "pointer" },
  refresh: { fontSize: "0.78rem", color: "rgba(255,255,255,0.35)", margin: "1rem 0 0" },
};

function ApprovalStatus() {
  const { t }           = useTranslation();
  const { language }    = useLanguage();
  const { currentUser } = useAuth();
  const navigate        = useNavigate();
  const dir             = language === "ar" ? "rtl" : "ltr";

  const [status, setStatus] = useState("pending");

  /* ── Real-time listener ─────────────────────────────────── */
  useEffect(() => {
    if (!currentUser) return;
    const unsub = onSnapshot(
      doc(db, "users", currentUser.uid),
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        const newStatus = data.status ?? "pending";
        setStatus(newStatus);
        // Auto-redirect when approved
        if (data.isApproved === true && newStatus === "approved") {
          window.location.reload();
        }
      },
      (err) => console.error("[ApprovalStatus]", err)
    );
    return () => unsub();
  }, [currentUser]);

  const isPending  = status === "pending";
  const isRejected = status === "rejected";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} style={S.page} dir={dir}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={S.card}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.25rem" }}>
          <DahabNowLogo size={52} />
        </div>

        <div style={S.icon}>{isPending ? "⏳" : "❌"}</div>

        <div style={S.badge(isPending ? "#D4AF37" : "#EF4444")}>
          {isPending ? t("pending") : t("rejected")}
        </div>

        <h1 style={S.title}>
          {isPending ? t("approvalPendingTitle") : t("approvalRejectedTitle")}
        </h1>

        <p style={S.msg}>
          {isPending ? t("approvalPendingMsg") : t("approvalRejectedMsg")}
        </p>

        {isRejected && (
          <button style={S.reapplyBtn} onClick={() => navigate("/register")}>
            {t("approvalReapply")}
          </button>
        )}

        {isPending && (
          <p style={S.refresh}>🔴 {t("approvalAutoRefresh")}</p>
        )}
      </motion.div>
    </motion.div>
  );
}

export default ApprovalStatus;
