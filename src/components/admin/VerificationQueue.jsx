/**
 * components/admin/VerificationQueue.jsx
 * Real-time pending sellers — onSnapshot + writeBatch approve/reject.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiAlertTriangle, FiCheck, FiX } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { collection, query, where, onSnapshot, writeBatch, doc, getDocs } from "firebase/firestore";
import { db }           from "../../firebase/config";
import { useLanguage }  from "../../context/LanguageContext";
import { useToast }     from "../common/Toast";
import GoldSpinner      from "../common/GoldSpinner";

const S = {
  card: {
    backgroundColor: "#455A64", border: "1px solid rgba(212,175,55,0.2)",
    borderRadius: "16px", padding: "1.4rem", boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
  },
  infoLabel: { fontSize: "0.72rem", fontWeight: 700, color: "#D4AF37", textTransform: "uppercase", letterSpacing: "0.07em" },
  infoValue: { fontSize: "0.9rem", color: "#FFFFFF", marginTop: "2px" },
  approveBtn: {
    padding: "0.6rem 1.4rem", borderRadius: "9px",
    backgroundColor: "#4CAF50", border: "none",
    color: "#FFFFFF", fontFamily: "'Tajawal', sans-serif",
    fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", transition: "opacity 0.2s",
  },
  rejectBtn: {
    padding: "0.6rem 1.4rem", borderRadius: "9px",
    backgroundColor: "#F44336", border: "none",
    color: "#FFFFFF", fontFamily: "'Tajawal', sans-serif",
    fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", transition: "opacity 0.2s",
  },
};

function RejectConfirm({ name, onConfirm, onCancel, dir }) {
  const { t } = useTranslation();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200, padding: "1.25rem" }}
      onClick={onCancel}
    >
      <motion.div initial={{ scale: 0.88 }} animate={{ scale: 1 }} exit={{ scale: 0.88 }}
        style={{ backgroundColor: "#263238", border: "1.5px solid rgba(244,67,54,0.4)", borderRadius: "16px", padding: "1.75rem", maxWidth: "360px", width: "100%", textAlign: "center", fontFamily: "'Tajawal', sans-serif" }}
        onClick={(e) => e.stopPropagation()} dir={dir}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}><FiAlertTriangle size="2.5rem" /></div>
        <p style={{ color: "#FFFFFF", fontSize: "1rem", fontWeight: 600, margin: "0 0 0.4rem" }}>{t("verifRejectConfirm")}</p>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.88rem", margin: "0 0 1.25rem" }}>{name}</p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <button onClick={onCancel} style={{ padding: "0.65rem 1.4rem", borderRadius: "9px", backgroundColor: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)", fontFamily: "'Tajawal', sans-serif", cursor: "pointer" }}>
            {t("productDeleteNo")}
          </button>
          <button onClick={onConfirm} style={S.rejectBtn}>{t("verifReject")}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function VerificationQueue() {
  const { t }         = useTranslation();
  const { language }  = useLanguage();
  const { showToast } = useToast();
  const dir           = language === "ar" ? "rtl" : "ltr";

  const [sellers,    setSellers]    = useState([]);
  const [shops,      setShops]      = useState({});
  const [loading,    setLoading]    = useState(true);
  const [busy,       setBusy]       = useState(null);
  const [rejectInfo, setRejectInfo] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "seller"), where("isApproved", "==", false));
    const unsub = onSnapshot(q, async (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setSellers(list);
      setLoading(false);
      const shopMap = {};
      await Promise.all(list.map(async (s) => {
        const sq = query(collection(db, "shops"), where("sellerId", "==", s.id));
        const snp = await getDocs(sq);
        if (!snp.empty) shopMap[s.id] = { id: snp.docs[0].id, ...snp.docs[0].data() };
      }));
      setShops(shopMap);
    });
    return () => unsub();
  }, []);

  const handleApprove = async (seller) => {
    const shop = shops[seller.id];
    setBusy(seller.id);
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, "users", seller.id), { isApproved: true, status: "approved", role: "seller" });
      if (shop) batch.update(doc(db, "shops", shop.id), { isApproved: true });
      await batch.commit();
      showToast(t("toastApproveOk"), "success");
    } catch { showToast(t("toastError"), "error"); }
    finally { setBusy(null); }
  };

  const handleReject = async (seller) => {
    const shop = shops[seller.id];
    setBusy(seller.id);
    setRejectInfo(null);
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, "users", seller.id), { isApproved: false, status: "rejected" });
      if (shop) batch.update(doc(db, "shops", shop.id), { isApproved: false, status: "rejected" });
      await batch.commit();
      showToast(t("toastRejectOk"), "info");
    } catch { showToast(t("toastError"), "error"); }
    finally { setBusy(null); }
  };

  const fmt = (ts) => {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString(language === "ar" ? "ar-SA" : "en-US");
  };

  return (
    <section style={{ fontFamily: "'Tajawal', sans-serif" }} dir={dir}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>{t("verifQueueTitle")}</h2>
        {!loading && sellers.length > 0 && (
          <span style={{ backgroundColor: "rgba(212,175,55,0.15)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.4)", borderRadius: "20px", padding: "2px 12px", fontSize: "0.82rem", fontWeight: 700 }}>
            {sellers.length} {t("verifPendingCount")}
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <GoldSpinner fullScreen={false} size={48} />
        </div>
      ) : sellers.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "4rem 1rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}><FiCheck size="3rem" /></div>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.97rem" }}>{t("verifQueueEmpty")}</p>
        </motion.div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {sellers.map((seller, i) => {
            const shop   = shops[seller.id];
            const isBusy = busy === seller.id;
            return (
              <motion.div key={seller.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
                  <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "#FFFFFF" }}>{seller.accountName}</span>
                  <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)" }}>{t("verifRegisteredOn")}: {fmt(seller.createdAt)}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "0.9rem", marginBottom: "1.25rem" }}>
                  {[
                    [t("emailLabel"), seller.sellerEmail],
                    [t("phoneLabel"), seller.sellerNumber],
                    [t("shopNameLabel"), shop?.shopName],
                    [t("shopCityLabel"), shop?.shopCity],
                    [t("shopAreaLabel"), shop?.shopArea],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div style={S.infoLabel}>{label}</div>
                      <div style={S.infoValue}>{value || "—"}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  <button disabled={isBusy} onClick={() => handleApprove(seller)} style={{ ...S.approveBtn, opacity: isBusy ? 0.6 : 1 }}>
                    <FiCheck size="1rem" style={{ marginInlineEnd: "0.35rem" }} /> {isBusy ? t("verifApproving") : t("verifApprove")}
                  </button>
                  <button disabled={isBusy} onClick={() => setRejectInfo({ seller, name: seller.accountName })} style={{ ...S.rejectBtn, opacity: isBusy ? 0.6 : 1 }}>
                    <FiX size="1rem" style={{ marginInlineEnd: "0.35rem" }} /> {t("verifReject")}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {rejectInfo && (
          <RejectConfirm key="rc" name={rejectInfo.name} dir={dir}
            onConfirm={() => handleReject(rejectInfo.seller)}
            onCancel={() => setRejectInfo(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}

export default VerificationQueue;
