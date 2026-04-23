/**
 * pages/guest/FavoritesPage.jsx
 * Saved shops page — reads from FavoritesContext (localStorage or Firestore).
 * Shows same shop cards as homepage with remove button.
 */

import { useState, useEffect }     from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation }          from "react-i18next";
import { useNavigate }             from "react-router-dom";
import { doc, getDoc }             from "firebase/firestore";
import { db }                      from "../../firebase/config";
import { useFavorites }            from "../../context/FavoritesContext";
import { useLanguage }             from "../../context/LanguageContext";
import { useToast }                from "../../components/common/Toast";
import Header                      from "../../components/header/Header";
import GoldSpinner                 from "../../components/common/GoldSpinner";
import ScrollToTopButton           from "../../components/common/ScrollToTopButton";

const GOLD = "#D4AF37";

/* ── Favorite Shop Card ──────────────────────────────────────── */
function FavCard({ shop, index, onRemove }) {
  const { t }     = useTranslation();
  const navigate  = useNavigate();
  const [hov, setHov] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      style={{ backgroundColor: hov ? "#506070" : "#455A64", border: `1px solid ${hov ? GOLD : "rgba(212,175,55,0.2)"}`, borderRadius: "16px", padding: "1.25rem", fontFamily: "'Tajawal', sans-serif", transition: "background-color 0.2s, border-color 0.2s" }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Avatar */}
      <div style={{ width: "44px", height: "44px", borderRadius: "10px", backgroundColor: "rgba(212,175,55,0.15)", border: "1.5px solid rgba(212,175,55,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 800, color: GOLD, marginBottom: "0.75rem" }}>
        {(shop.shopName || "?").charAt(0).toUpperCase()}
      </div>
      <p style={{ fontSize: "1rem", fontWeight: 700, color: "#FFFFFF", margin: "0 0 0.3rem" }}>{shop.shopName}</p>
      <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", margin: "0 0 1rem" }}>📍 {shop.shopCity}{shop.shopArea ? ` · ${shop.shopArea}` : ""}</p>

      {/* Verified badge */}
      {shop.isApproved && (
        <span style={{ backgroundColor: "rgba(212,175,55,0.12)", color: GOLD, border: "1px solid rgba(212,175,55,0.3)", borderRadius: "20px", padding: "2px 10px", fontSize: "0.75rem", fontWeight: 700, display: "inline-block", marginBottom: "1rem" }}>
          ✓ {t("shopVerified")}
        </span>
      )}

      <div style={{ display: "flex", gap: "0.6rem" }}>
        <button onClick={() => navigate(`/shop/${shop.id}`)} style={{ flex: 1, padding: "0.55rem", backgroundColor: "#FFD700", color: "#263238", border: "none", borderRadius: "9px", fontFamily: "'Tajawal', sans-serif", fontSize: "0.88rem", fontWeight: 700, cursor: "pointer" }}>
          {t("favoriteView")}
        </button>
        <button onClick={() => onRemove(shop.id)} style={{ padding: "0.55rem 0.9rem", backgroundColor: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "9px", color: "#FCA5A5", fontFamily: "'Tajawal', sans-serif", fontSize: "0.88rem", cursor: "pointer" }}>
          🗑️
        </button>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   FAVORITES PAGE
   ══════════════════════════════════════════════════════════════ */
function FavoritesPage() {
  const { t }                       = useTranslation();
  const { language }                = useLanguage();
  const { favorites, toggleFavorite } = useFavorites();
  const { showToast }               = useToast();
  const navigate                    = useNavigate();
  const dir                         = language === "ar" ? "rtl" : "ltr";

  const [shops,   setShops]   = useState([]);
  const [loading, setLoading] = useState(true);

  /* ── Resolve shop IDs → shop documents ─────────────────── */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const ids = [...favorites];
      if (ids.length === 0) { setShops([]); setLoading(false); return; }
      try {
        const shopDocs = await Promise.all(
          ids.map(async (id) => {
            const snap = await getDoc(doc(db, "shops", id));
            return snap.exists() ? { id: snap.id, ...snap.data() } : null;
          })
        );
        setShops(shopDocs.filter(Boolean));
      } catch (e) { console.error("[FavoritesPage]", e); }
      finally { setLoading(false); }
    };
    load();
  }, [favorites]);

  const handleRemove = (shopId) => {
    toggleFavorite(shopId);
    showToast(t("favRemoved"), "info");
  };

  return (
    <div style={{ backgroundColor: "#263238", minHeight: "100vh", fontFamily: "'Tajawal', sans-serif" }} dir={dir}>
      <Header />

      <div style={{ paddingTop: "88px", maxWidth: "1000px", margin: "0 auto", padding: "88px 1.5rem 3rem" }}>
        {/* Title */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "0.4rem" }}>
            <span style={{ fontSize: "1.6rem" }}>❤️</span>
            <h1 style={{ fontSize: "clamp(1.3rem,3vw,1.75rem)", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>{t("favoritesTitle")}</h1>
          </div>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.95rem", margin: 0 }}>{t("favoritesSubtitle")}</p>
          <div style={{ width: "48px", height: "3px", backgroundColor: GOLD, borderRadius: "2px", marginTop: "0.9rem" }} />
        </div>

        {loading && (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: "4rem" }}>
            <GoldSpinner fullScreen={false} size={52} />
          </div>
        )}

        {!loading && shops.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", padding: "4rem 1rem" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🤍</div>
            <h3 style={{ color: "#FFFFFF", fontSize: "1.15rem", fontWeight: 700, margin: "0 0 0.5rem" }}>{t("favoritesEmpty")}</h3>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.92rem", margin: "0 0 1.5rem" }}>{t("favoritesEmptyDesc")}</p>
            <button onClick={() => navigate("/")} style={{ backgroundColor: "#FFD700", color: "#263238", border: "none", borderRadius: "10px", padding: "0.75rem 2rem", fontFamily: "'Tajawal', sans-serif", fontSize: "0.95rem", fontWeight: 700, cursor: "pointer" }}>
              {t("heroCta")}
            </button>
          </motion.div>
        )}

        {!loading && shops.length > 0 && (
          <motion.div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
            <AnimatePresence>
              {shops.map((shop, i) => (
                <FavCard key={shop.id} shop={shop} index={i} onRemove={handleRemove} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
      <ScrollToTopButton />
    </div>
  );
}

export default FavoritesPage;
