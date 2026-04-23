/**
 * components/admin/AdRequestsManagement.jsx
 * View and moderate seller ad requests — onSnapshot real-time.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { collection, onSnapshot, doc, updateDoc, orderBy, query, addDoc, serverTimestamp } from "firebase/firestore";
import { db }           from "../../firebase/config";
import { useLanguage }  from "../../context/LanguageContext";
import { useToast }     from "../common/Toast";
import GoldSpinner      from "../common/GoldSpinner";

const FILTERS   = ["all", "pending", "approved", "rejected"];
const AD_TYPE_KEYS = { hero: "adTypeHero", notif: "adTypeNotif", featured: "adTypeFeatured" };

const statusColor = (s) =>
  s === "pending" ? "#D4AF37" : s === "approved" ? "#4ADE80" : "#F87171";

const S = {
  filterBtn: (active) => ({
    padding: "0.45rem 1.1rem", borderRadius: "20px",
    backgroundColor: active ? "#D4AF37" : "rgba(255,255,255,0.07)",
    color: active ? "#263238" : "rgba(255,255,255,0.65)",
    border: "none", fontFamily: "'Tajawal', sans-serif",
    fontSize: "0.85rem", fontWeight: active ? 700 : 500,
    cursor: "pointer", transition: "all 0.18s",
  }),
  card: { backgroundColor: "#455A64", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "14px", padding: "1.2rem", boxShadow: "0 2px 10px rgba(0,0,0,0.2)" },
  badge: (s) => ({ display: "inline-block", backgroundColor: statusColor(s) + "22", color: statusColor(s), border: `1px solid ${statusColor(s)}55`, borderRadius: "20px", padding: "2px 12px", fontSize: "0.78rem", fontWeight: 700 }),
  approveBtn: { padding: "0.5rem 1.1rem", backgroundColor: "#4CAF50", border: "none", borderRadius: "8px", color: "#FFFFFF", fontFamily: "'Tajawal', sans-serif", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" },
  rejectBtn:  { padding: "0.5rem 1.1rem", backgroundColor: "#F44336", border: "none", borderRadius: "8px", color: "#FFFFFF", fontFamily: "'Tajawal', sans-serif", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" },
};

function AdRequestsManagement() {
  const { t }         = useTranslation();
  const { language }  = useLanguage();
  const { showToast } = useToast();
  const dir           = language === "ar" ? "rtl" : "ltr";

  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("all");
  const [busy,     setBusy]     = useState(null);

  /* ── Real-time listener ─────────────────────────────────── */
  useEffect(() => {
    const q = query(collection(db, "adRequests"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const updateStatus = async (id, status) => {
    setBusy(id);
    try {
      await updateDoc(doc(db, "adRequests", id), { status });
      
      // Create notification for approved ads
      if (status === "approved") {
        const req = requests.find(r => r.id === id);
        if (req) {
          await addDoc(collection(db, "notifications"), {
            title: `${req.shopName} is now featured`,
            content: req.message || req.adMessage || "",
            type: "featured",
            shopId: req.shopId,
            createdAt: serverTimestamp(),
          });
        }
      }
      
      showToast(status === "approved" ? t("adMgmtApproveSuccess") : t("adMgmtRejectSuccess"), status === "approved" ? "success" : "info");
    } catch { showToast(t("toastError"), "error"); }
    finally { setBusy(null); }
  };

  const fmt = (ts) => {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString(language === "ar" ? "ar-SA" : "en-US");
  };

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);

  const filterLabel = { all: t("adMgmtAll"), pending: t("adMgmtPending"), approved: t("adMgmtApproved"), rejected: t("adMgmtRejected") };

  return (
    <section style={{ fontFamily: "'Tajawal', sans-serif" }} dir={dir}>
      <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#FFFFFF", margin: "0 0 1.25rem" }}>
        {t("adMgmtTitle")}
      </h2>

      {/* Filter bar */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {FILTERS.map((f) => (
          <button key={f} style={S.filterBtn(filter === f)} onClick={() => setFilter(f)}>
            {filterLabel[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <GoldSpinner fullScreen={false} size={48} />
        </div>
      ) : filtered.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", padding: "3rem" }}>{t("adMgmtEmpty")}</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <AnimatePresence>
            {filtered.map((req, i) => (
              <motion.div key={req.id}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ delay: i * 0.05 }} style={S.card}
              >
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <div>
                    <span style={{ color: "#FFFFFF", fontWeight: 700, fontSize: "0.97rem" }}>{req.shopName}</span>
                    <span style={{ marginInlineStart: "10px", color: "#D4AF37", fontSize: "0.85rem" }}>
                      {t(AD_TYPE_KEYS[req.adType] || "adTypeHero")}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={S.badge(req.status)}>{t(req.status) || req.status}</span>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem" }}>{fmt(req.createdAt)}</span>
                  </div>
                </div>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.88rem", margin: "0 0 1rem", lineHeight: 1.5 }}>
                  {req.message}
                </p>
                {req.status === "pending" && (
                  <div style={{ display: "flex", gap: "0.6rem" }}>
                    <button style={{ ...S.approveBtn, opacity: busy === req.id ? 0.6 : 1 }} disabled={busy === req.id} onClick={() => updateStatus(req.id, "approved")}>
                      ✓ {t("adMgmtApprove")}
                    </button>
                    <button style={{ ...S.rejectBtn, opacity: busy === req.id ? 0.6 : 1 }} disabled={busy === req.id} onClick={() => updateStatus(req.id, "rejected")}>
                      ✕ {t("adMgmtReject")}
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}

export default AdRequestsManagement;
