/**
 * components/admin/PlatformStats.jsx
 * Platform statistics with animated count-up numbers.
 */

import { useState, useEffect, useRef } from "react";
import { motion }       from "framer-motion";
import { useTranslation } from "react-i18next";
import { FiUsers, FiShoppingBag, FiStar, FiClock } from "react-icons/fi";
import { collection, query, where, getCountFromServer } from "firebase/firestore";
import { db }           from "../../firebase/config";
import { useLanguage }  from "../../context/LanguageContext";
import GoldSpinner      from "../common/GoldSpinner";

/* ── Animated count-up number ───────────────────────────────── */
function CountUp({ target, duration = 1600 }) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (target === 0) return;
    const start = performance.now();
    const tick  = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      setValue(Math.floor(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return <>{value.toLocaleString()}</>;
}

/* ── Stat card ──────────────────────────────────────────────── */
function StatCard({ icon, labelKey, value, loading, index }) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      style={{
        flex:            "1 1 200px",
        backgroundColor: "#455A64",
        border:          "1.5px solid rgba(212,175,55,0.3)",
        borderRadius:    "16px",
        padding:         "1.75rem 1.5rem",
        textAlign:       "center",
        boxShadow:       "0 2px 16px rgba(0,0,0,0.25)",
      }}
    >
      <div style={{ fontSize: "2.2rem", marginBottom: "0.6rem" }}>{icon}</div>
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", margin: "0.5rem 0" }}>
          <GoldSpinner fullScreen={false} size={32} />
        </div>
      ) : (
        <div style={{ fontSize: "2.6rem", fontWeight: 900, color: "#D4AF37", lineHeight: 1, margin: "0.25rem 0 0.6rem", fontFamily: "'Tajawal', sans-serif" }}>
          <CountUp target={value} />
        </div>
      )}
      <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.9rem", fontWeight: 600, margin: 0, fontFamily: "'Tajawal', sans-serif" }}>
        {t(labelKey)}
      </p>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
function PlatformStats() {
  const { t }        = useTranslation();
  const { language } = useLanguage();
  const dir          = language === "ar" ? "rtl" : "ltr";

  const [stats,   setStats]   = useState({ sellers: 0, shops: 0, products: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [sellersSnap, shopsSnap, productsSnap, pendingSnap] = await Promise.all([
          getCountFromServer(query(collection(db, "users"), where("role", "==", "seller"))),
          getCountFromServer(query(collection(db, "shops"), where("isApproved", "==", true))),
          getCountFromServer(collection(db, "products")),
          getCountFromServer(query(collection(db, "users"), where("role", "==", "seller"), where("isApproved", "==", false))),
        ]);
        setStats({
          sellers:  sellersSnap.data().count,
          shops:    shopsSnap.data().count,
          products: productsSnap.data().count,
          pending:  pendingSnap.data().count,
        });
      } catch (e) {
        console.error("[PlatformStats]", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { icon: <FiUsers size={32} />, labelKey: "statsTotalSellers",   value: stats.sellers  },
    { icon: <FiShoppingBag size={32} />, labelKey: "statsApprovedShops",  value: stats.shops    },
    { icon: <FiStar size={32} />, labelKey: "statsTotalProducts",  value: stats.products },
    { icon: <FiClock size={32} />, labelKey: "statsPendingApprovals", value: stats.pending },
  ];

  return (
    <section style={{ fontFamily: "'Tajawal', sans-serif" }} dir={dir}>
      <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#FFFFFF", margin: "0 0 1.5rem" }}>
        {t("statsTitle")}
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem" }}>
        {cards.map((c, i) => (
          <StatCard key={c.labelKey} {...c} loading={loading} index={i} />
        ))}
      </div>
    </section>
  );
}

export default PlatformStats;
