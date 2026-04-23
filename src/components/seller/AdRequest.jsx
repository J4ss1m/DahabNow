/**
 * components/seller/AdRequest.jsx
 * Sellers request ad promotion from admin.
 * One active request at a time (status="pending").
 * Saves to Firestore adRequests collection.
 */

import { useState, useEffect } from "react";
import { motion }              from "framer-motion";
import { useTranslation }      from "react-i18next";
import {
  collection, addDoc, query, where,
  getDocs, serverTimestamp,
} from "firebase/firestore";
import { db }          from "../../firebase/config";
import { useLanguage } from "../../context/LanguageContext";

const AD_TYPES = [
  { value: "hero",     key: "adTypeHero"     },
  { value: "notif",    key: "adTypeNotif"    },
  { value: "featured", key: "adTypeFeatured" },
];

const S = {
  section: { fontFamily: "'Tajawal', sans-serif", maxWidth: "580px" },
  title:   { fontSize: "1.3rem", fontWeight: 800, color: "#FFFFFF", margin: "0 0 0.4rem" },
  sub:     { fontSize: "0.92rem", color: "rgba(255,255,255,0.5)", margin: "0 0 1.5rem" },
  label:   { display: "block", fontSize: "0.84rem", fontWeight: 600, color: "rgba(255,255,255,0.75)", marginBottom: "0.35rem" },
  select: {
    width: "100%", padding: "0.7rem 0.9rem",
    backgroundColor: "rgba(69,90,100,0.7)",
    border: "1.5px solid rgba(212,175,55,0.25)", borderRadius: "9px",
    color: "#FFFFFF", fontFamily: "'Tajawal', sans-serif", fontSize: "0.93rem",
    outline: "none", marginBottom: "1rem", cursor: "pointer",
  },
  textarea: {
    width: "100%", padding: "0.7rem 0.9rem", resize: "vertical", minHeight: "110px",
    backgroundColor: "rgba(69,90,100,0.7)",
    border: "1.5px solid rgba(212,175,55,0.25)", borderRadius: "9px",
    color: "#FFFFFF", fontFamily: "'Tajawal', sans-serif", fontSize: "0.93rem",
    outline: "none", boxSizing: "border-box", marginBottom: "1.25rem",
  },
  submitBtn: {
    width: "100%", padding: "0.85rem",
    backgroundColor: "#FFD700", color: "#263238",
    border: "none", borderRadius: "10px",
    fontFamily: "'Tajawal', sans-serif", fontSize: "1rem", fontWeight: 800,
    cursor: "pointer", transition: "opacity 0.2s",
  },
  statusCard: {
    backgroundColor: "#455A64", border: "1px solid rgba(212,175,55,0.3)",
    borderRadius: "14px", padding: "1.25rem",
    marginBottom: "1.5rem",
  },
  statusRow: { display: "flex", alignItems: "center", gap: "10px" },
  badge: (color) => ({
    display: "inline-block",
    backgroundColor: color + "22",
    color, border: `1px solid ${color}55`,
    borderRadius: "20px", padding: "3px 12px",
    fontSize: "0.8rem", fontWeight: 700,
  }),
  successMsg: {
    backgroundColor: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.35)",
    borderRadius: "9px", padding: "0.7rem 1rem", color: "#4ADE80",
    fontSize: "0.88rem", marginBottom: "1rem", textAlign: "center",
  },
  errorMsg: {
    backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.35)",
    borderRadius: "9px", padding: "0.7rem 1rem", color: "#FCA5A5",
    fontSize: "0.88rem", marginBottom: "1rem", textAlign: "center",
  },
};

function AdRequest({ shop, shopId, currentUser }) {
  const { t }        = useTranslation();
  const { language } = useLanguage();
  const dir          = language === "ar" ? "rtl" : "ltr";

  const [adType,  setAdType]  = useState("");
  const [message, setMessage] = useState("");
  const [active,  setActive]  = useState(null); // existing pending request
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState("");
  const [error,   setError]   = useState("");

  // Check for existing pending/approved request
  useEffect(() => {
    const checkActive = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const q    = query(
          collection(db, "adRequests"),
          where("sellerId", "==", currentUser.uid),
          where("status", "==", "pending")
        );
        const snap = await getDocs(q);
        setActive(snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() });
      } catch (e) {
        console.error("[AdRequest]", e);
      } finally {
        setLoading(false);
      }
    };
    checkActive();
  }, [currentUser, success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!adType)          { setError(t("errorRequiredField")); return; }
    if (!message.trim())  { setError(t("errorRequiredField")); return; }

    setSaving(true);
    try {
      await addDoc(collection(db, "adRequests"), {
        sellerId:  currentUser.uid,
        shopId,
        shopName:  shop?.shopName || "",
        adType,
        message:   message.trim(),
        status:    "pending",
        createdAt: serverTimestamp(),
      });
      setSuccess(t("adRequestSuccess"));
      setAdType("");
      setMessage("");
    } catch (e) {
      console.error("[AdRequest]", e);
      setError(t("adRequestError"));
    } finally {
      setSaving(false);
    }
  };

  const statusColor = (s) =>
    s === "pending" ? "#D4AF37" : s === "approved" ? "#4ADE80" : "#F87171";

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={S.section}
      dir={dir}
    >
      <h2 style={S.title}>{t("adRequestTitle")}</h2>
      <p style={S.sub}>{t("adRequestSubtitle")}</p>

      {/* Active request status */}
      {!loading && active && (
        <div style={S.statusCard}>
          <p style={{ margin: "0 0 0.5rem", fontWeight: 700, color: "#FFFFFF", fontSize: "0.92rem" }}>
            {t("adRequestStatus")}
          </p>
          <div style={S.statusRow}>
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
              {AD_TYPES.find((a) => a.value === active.adType) ? t(AD_TYPES.find((a) => a.value === active.adType).key) : active.adType}
            </span>
            <span style={S.badge(statusColor(active.status))}>
              {t(active.status)}
            </span>
          </div>
          <p style={{ margin: "0.75rem 0 0", fontSize: "0.82rem", color: "rgba(255,255,255,0.45)" }}>
            {t("adRequestPending")}
          </p>
        </div>
      )}

      {success && <div style={S.successMsg}>{success}</div>}
      {error   && <div style={S.errorMsg}>{error}</div>}

      {/* Show form only if no active request */}
      {!active && !loading && (
        <form onSubmit={handleSubmit} noValidate>
          <label style={S.label}>{t("adTypeLabel")}</label>
          <select value={adType} onChange={(e) => setAdType(e.target.value)} style={S.select} disabled={saving}>
            <option value="" disabled>{t("adSelectType")}</option>
            {AD_TYPES.map((a) => (
              <option key={a.value} value={a.value}>{t(a.key)}</option>
            ))}
          </select>

          <label style={S.label}>{t("adMessageLabel")}</label>
          <textarea
            style={S.textarea}
            placeholder={t("adMessagePlaceholder")}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={saving}
          />

          <motion.button
            type="submit"
            style={{ ...S.submitBtn, opacity: saving ? 0.65 : 1 }}
            whileHover={!saving ? { scale: 1.01, opacity: 0.9 } : {}}
            whileTap={!saving ? { scale: 0.97 } : {}}
            disabled={saving}
          >
            {saving ? t("loading") : t("adRequestSubmit")}
          </motion.button>
        </form>
      )}
    </motion.section>
  );
}

export default AdRequest;
