/**
 * pages/guest/ShopPage.jsx
 * Full individual shop page — /shop/:shopId
 *
 * Fixed for Phase 6 stability:
 *   • useParams + useNavigate from react-router-dom ✓
 *   • Firestore fetch uses collection "shops" ✓
 *   • Handles shop-not-found with error UI (not silent redirect) ✓
 *   • Safe useFavorites / useToast with fallbacks ✓
 *   • console.log at top for debug ✓
 *   • All imports verified ✓
 */

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiMapPin, FiPhone, FiMail, FiLink, FiHeart, FiCheckCircle, FiStore } from "react-icons/fi";
import {
  doc, getDoc,
  collection, query, where, getDocs,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useLanguage } from "../../context/LanguageContext";
import { useFavorites } from "../../context/FavoritesContext";
import GoldSpinner from "../../components/common/GoldSpinner";
import ProductDetailModal from "../../components/shop/ProductDetailModal";
import Header from "../../components/header/Header";
import ScrollToTopButton from "../../components/common/ScrollToTopButton";

/* ── Optional toast (safe — falls back silently if context missing) ─── */
let _useToast = null;
try {
  // Dynamic require avoids crashing if ToastProvider is not mounted
  _useToast = require("../../components/common/Toast").useToast;
} catch { /* ignore */ }

function useToastSafe() {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    if (_useToast) return _useToast();
  } catch { /* noop */ }
  return { showToast: () => { } };
}

/* ── WhatsApp URL ─────────────────────────────────────────────── */
const toWAUrl = (num) => {
  if (!num) return null;
  const c = num.replace(/\D/g, "");
  if (!c) return null;
  const f = c.startsWith("966") ? c
    : c.startsWith("0") ? "966" + c.slice(1)
      : "966" + c;
  return `https://wa.me/${f}`;
};

/* ── Design tokens ───────────────────────────────────────────── */
const GOLD = "#D4AF37";
const BG = "#263238";
const CARD = "#455A64";

const KARATS = ["All", "18", "21", "22", "24"];
const SORT_KEYS = { newest: "Newest", weight_asc: "WeightLow", weight_desc: "WeightHigh" };

/* ── Product Card ────────────────────────────────────────────── */
function ProductCard({ product, index, onClick }) {
  const { t } = useTranslation();
  const [hov, setHov] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        backgroundColor: hov ? "#506070" : CARD,
        border: `1px solid ${hov ? GOLD : "rgba(212,175,55,0.2)"}`,
        borderRadius: "14px", overflow: "hidden", cursor: "pointer",
        transition: "background 0.2s, border-color 0.2s",
        boxShadow: hov ? "0 6px 24px rgba(212,175,55,0.15)" : "0 2px 10px rgba(0,0,0,0.2)",
        fontFamily: "'Tajawal', sans-serif",
      }}
    >
      <div style={{ width: "100%", height: "160px", backgroundColor: "rgba(38,50,56,0.5)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {product.productPicture
          ? <img src={product.productPicture} alt={product.productName} style={{ width: "100%", height: "100%", objectFit: "cover", transform: hov ? "scale(1.06)" : "scale(1)", transition: "transform 0.3s" }} />
          : <span style={{ fontSize: "2.5rem", opacity: 0.4 }}><FiBox size={40} /></span>
        }
      </div>
      <div style={{ padding: "0.9rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px", marginBottom: "0.4rem" }}>
          <p style={{ fontSize: "0.93rem", fontWeight: 700, color: "#FFFFFF", margin: 0, lineHeight: 1.3 }}>{product.productName}</p>
          <span style={{ flexShrink: 0, backgroundColor: "rgba(212,175,55,0.15)", color: GOLD, border: "1px solid rgba(212,175,55,0.35)", borderRadius: "20px", padding: "1px 9px", fontSize: "0.75rem", fontWeight: 700 }}>
            {product.karat}K
          </span>
        </div>
        <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", margin: 0 }}>{product.weight}g</p>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SHOP PAGE
   ══════════════════════════════════════════════════════════════ */
function ShopPage() {
  /* ── 1. Params — MUST come first ───────────────────────── */
  const { shopId } = useParams();

  // Debug log — confirms component is mounting and shopId is captured
  console.log("[ShopPage] rendering, shopId:", shopId);

  /* ── 2. All hooks ────────────────────────────────────────── */
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { language } = useLanguage();
  const { toggleFavorite, isFavorite } = useFavorites(); // never throws
  const { showToast } = useToastSafe();
  const dir = language === "ar" ? "rtl" : "ltr";

  /* ── 3. State ─────────────────────────────────────────────── */
  const [shop, setShop] = useState(null);
  const [shopError, setShopError] = useState("");
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [karatFilter, setKaratFilter] = useState("All");
  const [searchQ, setSearchQ] = useState("");
  const [sort, setSort] = useState("newest");

  /* ── 4. Fetch shop from Firestore "shops" collection ──────── */
  useEffect(() => {
    if (!shopId) {
      setShopError("No shop ID in URL.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchShop = async () => {
      console.log("[ShopPage] fetching shop document:", shopId);
      setLoading(true);
      setShopError("");
      try {
        const shopRef = doc(db, "shops", shopId);   // ← collection = "shops"
        const shopSnap = await getDoc(shopRef);

        if (cancelled) return;

        console.log("[ShopPage] shop exists:", shopSnap.exists(), "data:", shopSnap.data());

        if (!shopSnap.exists()) {
          setShopError(t("shopNotFound"));
          setLoading(false);
          return;
        }

        const data = shopSnap.data();

        // If shop is explicitly rejected/suspended, show error
        if (data.isApproved === false) {
          setShopError(t("shopNotFound"));
          setLoading(false);
          return;
        }

        setShop({ id: shopSnap.id, ...data });
      } catch (err) {
        console.error("[ShopPage] fetchShop error:", err);
        if (!cancelled) setShopError(t("shopLoadError") || "Failed to load shop.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchShop();
    return () => { cancelled = true; };
  }, [shopId]);

  /* ── 5. Fetch products ────────────────────────────────────── */
  useEffect(() => {
    if (!shopId) { setProductsLoading(false); return; }
    let cancelled = false;

    const fetchProducts = async () => {
      console.log("[ShopPage] fetching products for shop:", shopId);
      setProductsLoading(true);
      try {
        const q = query(
          collection(db, "products"),
          where("shopId", "==", shopId),
          where("isAvailable", "==", true)
        );
        const snap = await getDocs(q);
        if (!cancelled) {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          console.log("[ShopPage] products loaded:", list.length);
          setProducts(list);
        }
      } catch (err) {
        console.error("[ShopPage] fetchProducts error:", err);
      } finally {
        if (!cancelled) setProductsLoading(false);
      }
    };

    fetchProducts();
    return () => { cancelled = true; };
  }, [shopId]);

  /* ── 6. Filter + sort products client-side ────────────────── */
  const displayed = useMemo(() => {
    let list = [...products];
    if (karatFilter !== "All") list = list.filter((p) => String(p.karat) === karatFilter);
    if (searchQ.trim()) list = list.filter((p) => (p.productName || "").toLowerCase().includes(searchQ.toLowerCase()));
    if (sort === "weight_asc") list.sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0));
    if (sort === "weight_desc") list.sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
    if (sort === "newest") list.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
    return list;
  }, [products, karatFilter, searchQ, sort]);

  /* ── 7. Favorite toggle ───────────────────────────────────── */
  const handleFavorite = () => {
    const wasSaved = isFavorite(shopId);
    toggleFavorite(shopId);
    showToast(wasSaved ? t("favRemoved") : t("favAdded"), "info");
  };

  /* ── 8. Render helpers ────────────────────────────────────── */
  const waUrl = toWAUrl(shop?.contactWhatsApp);
  const emailUrl = shop?.contactEmail ? `mailto:${shop.contactEmail}` : null;
  const locationUrl = (shop?.locationLink || "").trim();
  const isGmaps = Boolean(locationUrl) && (
    locationUrl.toLowerCase().includes("google.com/maps") ||
    locationUrl.toLowerCase().includes("goo.gl/maps") ||
    locationUrl.toLowerCase().includes("maps.google") ||
    locationUrl.toLowerCase().includes("maps.app.goo")
  );
  const searchTerms = `${shop?.shopName || ""} ${shop?.shopArea || ""} ${shop?.shopCity || ""}`.trim() || `${shop?.shopName || shop?.shopCity || "shop"}`;
  const mapSearchQuery = encodeURIComponent(searchTerms);
  const mapLink = isGmaps && locationUrl
    ? locationUrl
    : `https://www.google.com/maps/search/${mapSearchQuery}`;
  const saved = isFavorite(shopId);

  /* ── Loading state ────────────────────────────────────────── */
  if (loading) {
    return (
      <div style={{ backgroundColor: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <GoldSpinner fullScreen={false} size={52} />
      </div>
    );
  }

  /* ── Error / not found state ──────────────────────────────── */
  if (shopError || !shop) {
    return (
      <div style={{ backgroundColor: BG, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Tajawal', sans-serif", padding: "2rem" }}>
        <FiStore size="3rem" style={{ color: GOLD, marginBottom: "1rem" }} />
        <h2 style={{ color: "#FFFFFF", margin: "0 0 0.5rem" }}>{shopError || t("shopNotFound")}</h2>
        <button onClick={() => navigate("/")} style={{ marginTop: "1.5rem", backgroundColor: "#FFD700", color: "#263238", border: "none", borderRadius: "10px", padding: "0.75rem 2rem", fontFamily: "'Tajawal', sans-serif", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer" }}>
          ← {t("home")}
        </button>
      </div>
    );
  }

  /* ── Full page ────────────────────────────────────────────── */
  return (
    <div style={{ backgroundColor: BG, minHeight: "100vh", fontFamily: "'Tajawal', sans-serif" }} dir={dir}>
      <Header />

      <div style={{ paddingTop: "68px" }}>
        {/* ── Shop Hero ──────────────────────────────────────── */}
        <section style={{ background: "linear-gradient(135deg, #1c2b31 0%, #263238 60%, #2d3f47 100%)", padding: "2.5rem 1.5rem 2rem", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", insetInlineEnd: "-60px", top: "-60px", width: "240px", height: "240px", borderRadius: "50%", border: "2px solid rgba(212,175,55,0.08)", pointerEvents: "none" }} />

          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            {/* Avatar */}
            <div style={{ width: "64px", height: "64px", borderRadius: "16px", backgroundColor: "rgba(212,175,55,0.15)", border: "2px solid rgba(212,175,55,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", fontWeight: 800, color: GOLD, marginBottom: "1rem", overflow: "hidden" }}>
              {shop.shopPicture ? (
                <img src={shop.shopPicture} alt={i18n.language === 'ar' && shop.shopNameAr ? shop.shopNameAr : shop.shopName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                ((i18n.language === 'ar' && shop.shopNameAr ? shop.shopNameAr : shop.shopName) || "?").charAt(0).toUpperCase()
              )}
            </div>

            {/* Name + verified badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "0.4rem" }}>
              <h1 style={{ fontSize: "clamp(1.5rem,4vw,2.2rem)", fontWeight: 900, color: GOLD, margin: 0 }}>
                {i18n.language === 'ar' && shop.shopNameAr ? shop.shopNameAr : shop.shopName}
              </h1>
              {shop.isApproved && shop.sellerId !== "imported" && (
                <span style={{ backgroundColor: "rgba(212,175,55,0.15)", color: GOLD, border: "1px solid rgba(212,175,55,0.4)", borderRadius: "20px", padding: "3px 12px", fontSize: "0.8rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                  <FiCheckCircle size="0.85rem" /> {t("shopVerifiedBadge")}
                </span>
              )}
            </div>

            {/* City / area */}
            <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.55)", margin: "0 0 1.25rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
              <FiMapPin size="0.95rem" /> {i18n.language === 'ar' && shop.shopCityAr ? shop.shopCityAr : shop.shopCity}{(i18n.language === 'ar' && shop.shopAreaAr) || shop.shopArea ? ` · ${i18n.language === 'ar' && shop.shopAreaAr ? shop.shopAreaAr : shop.shopArea}` : ""}
            </p>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              {waUrl && (
                <a href={waUrl} target="_blank" rel="noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "0.6rem 1.2rem", backgroundColor: "#25D366", border: "none", borderRadius: "10px", color: "#FFFFFF", fontFamily: "'Tajawal', sans-serif", fontSize: "0.9rem", fontWeight: 700, textDecoration: "none" }}>
                  <FiPhone size="1rem" /> {t("shopContactWhatsApp")}
                </a>
              )}
              {emailUrl && (
                <a href={emailUrl}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "0.6rem 1.2rem", backgroundColor: "rgba(212,175,55,0.15)", border: `1.5px solid ${GOLD}`, borderRadius: "10px", color: GOLD, fontFamily: "'Tajawal', sans-serif", fontSize: "0.9rem", fontWeight: 700, textDecoration: "none" }}>
                  <FiMail size="1rem" /> {t("shopContactEmail")}
                </a>
              )}
              <a href={mapLink} target="_blank" rel="noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "0.6rem 1.2rem", backgroundColor: "rgba(212,175,55,0.15)", border: `1.5px solid ${GOLD}`, borderRadius: "10px", color: GOLD, fontFamily: "'Tajawal', sans-serif", fontSize: "0.9rem", fontWeight: 700, textDecoration: "none" }}>
                <FiMapPin size="1rem" /> {t("shopMapLocation")}
              </a>
              {locationUrl && !isGmaps && (
                <a href={locationUrl} target="_blank" rel="noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "0.6rem 1.2rem", backgroundColor: "rgba(212,175,55,0.15)", border: `1.5px solid ${GOLD}`, borderRadius: "10px", color: GOLD, fontFamily: "'Tajawal', sans-serif", fontSize: "0.9rem", fontWeight: 700, textDecoration: "none" }}>
                  <FiLink size="1rem" /> {t("visitWebsite")}
                </a>
              )}
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={handleFavorite}
                style={{ padding: "0.6rem 1.2rem", backgroundColor: saved ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.08)", border: `1.5px solid ${saved ? GOLD : "rgba(255,255,255,0.2)"}`, borderRadius: "10px", color: saved ? GOLD : "rgba(255,255,255,0.7)", fontFamily: "'Tajawal', sans-serif", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer" }}
              >
                <FiHeart size="1rem" style={{ marginInlineEnd: "0.35rem", color: saved ? GOLD : "inherit" }} /> {saved ? t("shopSaved") : t("shopSaveFavorite")}
              </motion.button>
            </div>
          </div>
        </section>

        {/* ── Filter Bar ─────────────────────────────────────── */}
        <div style={{ backgroundColor: CARD, borderBottom: "1px solid rgba(212,175,55,0.15)", padding: "0.85rem 1.5rem" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
            {/* Karat pills */}
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              {KARATS.map((k) => (
                <button key={k} onClick={() => setKaratFilter(k)}
                  style={{ padding: "0.35rem 0.9rem", borderRadius: "20px", border: "none", backgroundColor: karatFilter === k ? GOLD : "rgba(255,255,255,0.08)", color: karatFilter === k ? "#263238" : "rgba(255,255,255,0.65)", fontFamily: "'Tajawal', sans-serif", fontSize: "0.82rem", fontWeight: karatFilter === k ? 700 : 400, cursor: "pointer", transition: "all 0.18s" }}>
                  {k === "All" ? t("shopFilterAll") : `${k}K`}
                </button>
              ))}
            </div>

            {/* Search */}
            <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
              placeholder={t("shopSearchProducts")}
              style={{ flex: 1, minWidth: "160px", padding: "0.45rem 0.9rem", backgroundColor: "rgba(38,50,56,0.75)", border: "1.5px solid rgba(212,175,55,0.25)", borderRadius: "20px", color: "#FFFFFF", fontFamily: "'Tajawal', sans-serif", fontSize: "0.88rem", outline: "none" }}
            />

            {/* Sort */}
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              style={{ padding: "0.45rem 0.9rem", backgroundColor: "rgba(38,50,56,0.75)", border: "1.5px solid rgba(212,175,55,0.25)", borderRadius: "20px", color: "#FFFFFF", fontFamily: "'Tajawal', sans-serif", fontSize: "0.88rem", outline: "none", cursor: "pointer" }}>
              {Object.entries(SORT_KEYS).map(([val, key]) => (
                <option key={val} value={val}>{t("shopSort" + key)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Products Grid ──────────────────────────────────── */}
        <section style={{ padding: "1.5rem", maxWidth: "900px", margin: "0 auto" }}>
          {productsLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
              <GoldSpinner fullScreen={false} size={48} />
            </div>
          ) : displayed.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "4rem 1rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}><FiBox size={42} /></div>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.97rem" }}>{t("shopNoProducts")}</p>
            </motion.div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
              {displayed.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} onClick={() => setSelectedProduct(p)} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Product Detail Modal ───────────────────────────────── */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailModal
            key="pdm"
            product={selectedProduct}
            shop={shop}
            dir={dir}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>
      
      <ScrollToTopButton />
    </div>
  );
}

export default ShopPage;
