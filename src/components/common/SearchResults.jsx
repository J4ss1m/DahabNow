/**
 * components/common/SearchResults.jsx
 * Dropdown search results panel — debounced, grouped into Shops + Products.
 * Used inside the Header search bar.
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence }          from "framer-motion";
import { useTranslation }                   from "react-i18next";
import { useNavigate }                      from "react-router-dom";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db }       from "../../firebase/config";
import { useLanguage } from "../../context/LanguageContext";

const S = {
  panel: { position: "absolute", top: "calc(100% + 8px)", insetInlineStart: 0, insetInlineEnd: 0, backgroundColor: "#2d3f47", border: "1.5px solid rgba(212,175,55,0.3)", borderRadius: "14px", boxShadow: "0 8px 32px rgba(0,0,0,0.45)", zIndex: 2000, overflow: "hidden", fontFamily: "'Tajawal', sans-serif", maxHeight: "380px", overflowY: "auto" },
  sectionLabel: { padding: "0.6rem 1rem 0.3rem", fontSize: "0.72rem", fontWeight: 700, color: "#D4AF37", textTransform: "uppercase", letterSpacing: "0.08em" },
  item: (hov) => ({ display: "flex", alignItems: "center", gap: "10px", padding: "0.6rem 1rem", cursor: "pointer", backgroundColor: hov ? "rgba(212,175,55,0.1)" : "transparent", transition: "background 0.15s", borderBottom: "1px solid rgba(255,255,255,0.04)" }),
  shopIcon: { width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "rgba(212,175,55,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", fontWeight: 700, color: "#D4AF37", flexShrink: 0 },
  prodIcon: { width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "rgba(69,90,100,0.8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", flexShrink: 0 },
  name: { fontSize: "0.88rem", fontWeight: 600, color: "#FFFFFF" },
  sub: { fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", marginTop: "1px" },
  empty: { padding: "1.2rem 1rem", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "0.88rem" },
  divider: { height: "1px", backgroundColor: "rgba(255,255,255,0.06)", margin: "0 1rem" },
};

function SearchResults({ query: searchQ, onClose }) {
  const { t }        = useTranslation();
  const { language } = useLanguage();
  const navigate     = useNavigate();

  const [shops,    setShops]    = useState([]);
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [hoverId,  setHoverId]  = useState(null);

  /* ── Debounced search ───────────────────────────────────── */
  useEffect(() => {
    if (!searchQ || searchQ.trim().length < 2) {
      setShops([]); setProducts([]); return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const lower = searchQ.toLowerCase().trim();
        // Firestore doesn't support LIKE, so we use >= / <= trick for prefix search
        const end = lower.slice(0, -1) + String.fromCharCode(lower.charCodeAt(lower.length - 1) + 1);

        const [shopSnap, prodSnap] = await Promise.all([
          getDocs(query(collection(db, "shops"), where("isApproved", "==", true), where("shopName", ">=", lower), where("shopName", "<", end), limit(5))),
          getDocs(query(collection(db, "products"), where("isAvailable", "==", true), where("productName", ">=", lower), where("productName", "<", end), limit(5))),
        ]);

        setShops(shopSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setProducts(prodSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error("[SearchResults]", e); }
      finally { setLoading(false); }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQ]);

  const goToShop = (shopId) => {
    navigate(`/shop/${shopId}`);
    onClose();
  };

  const goToProduct = (product) => {
    navigate(`/shop/${product.shopId}`);
    onClose();
  };

  const hasResults = shops.length > 0 || products.length > 0;

  if (!searchQ || searchQ.trim().length < 2) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      style={S.panel}
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      {loading ? (
        <div style={S.empty}>{t("searchLoading")}</div>
      ) : !hasResults ? (
        <div style={S.empty}>{t("searchNoResults")}</div>
      ) : (
        <>
          {/* Shops section */}
          {shops.length > 0 && (
            <>
              <div style={S.sectionLabel}>🏪 {t("searchShopsSection")}</div>
              {shops.map((shop) => (
                <div key={shop.id} style={S.item(hoverId === shop.id)} onMouseEnter={() => setHoverId(shop.id)} onMouseLeave={() => setHoverId(null)} onClick={() => goToShop(shop.id)}>
                  <div style={S.shopIcon}>{(shop.shopName || "?").charAt(0)}</div>
                  <div>
                    <div style={S.name}>{shop.shopName}</div>
                    <div style={S.sub}>📍 {shop.shopCity}{shop.shopArea ? ` · ${shop.shopArea}` : ""}</div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Divider */}
          {shops.length > 0 && products.length > 0 && <div style={S.divider} />}

          {/* Products section */}
          {products.length > 0 && (
            <>
              <div style={S.sectionLabel}>💎 {t("searchProductsSection")}</div>
              {products.map((prod) => (
                <div key={prod.id} style={S.item(hoverId === prod.id)} onMouseEnter={() => setHoverId(prod.id)} onMouseLeave={() => setHoverId(null)} onClick={() => goToProduct(prod)}>
                  <div style={S.prodIcon}>💎</div>
                  <div>
                    <div style={S.name}>{prod.productName}</div>
                    <div style={S.sub}>{prod.karat}K · {prod.weight}g</div>
                  </div>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </motion.div>
  );
}

export default SearchResults;
