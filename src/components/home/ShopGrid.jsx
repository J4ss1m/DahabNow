/**
 * components/home/ShopGrid.jsx
 * Shop grid with:
 *   • Featured shops first (isFeatured badge)
 *   • Location filter via URL ?city= & ?area= params
 *   • Text search via ?search= param
 *   • Product count per shop
 *   • Verified badge on all approved shops
 */

import { useState, useEffect, useMemo } from "react";
import { motion }                        from "framer-motion";
import { useTranslation }                from "react-i18next";
import { FiShoppingBag } from "react-icons/fi";
import { useLocation, useNavigate }      from "react-router-dom";
import {
  collection, query, where, getDocs, getCountFromServer,
} from "firebase/firestore";
import { db }          from "../../firebase/config";
import { useLanguage } from "../../context/LanguageContext";
import GoldSpinner     from "../common/GoldSpinner";
import ShopCard from "./ShopCard";

const GOLD = "#D4AF37";

/* ── Fetch product count for a shop ─────────────────────────── */
async function fetchProductCount(shopId) {
  try {
    const snap = await getCountFromServer(
      query(collection(db, "products"), where("shopId", "==", shopId), where("isAvailable", "==", true))
    );
    return snap.data().count;
  } catch { return 0; }
}

/* ── Shop Card ───────────────────────────────────────────────── */
function ShopCardLegacy({ shop, index, productCount }) {
  const { t, i18n }         = useTranslation();
  const navigate      = useNavigate();
  const [hov, setHov] = useState(false);

  const goToShop = () => {
    console.log("Card clicked, navigating to:", `/shop/${shop.id}`);
    // Primary: React Router navigation
    navigate(`/shop/${shop.id}`);
    // Fallback: hard navigation in case router context has any issue
    // (remove this line once confirmed working)
    // window.location.href = `/shop/${shop.id}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay: index * 0.07 }}
      onClick={goToShop}
      style={{
        backgroundColor: hov ? "#506070" : "#455A64",
        border:          `1px solid ${hov ? GOLD : "rgba(212,175,55,0.2)"}`,
        borderRadius:    "16px",
        padding:         "1.25rem",
        cursor:          "pointer",
        transition:      "background-color 0.2s, border-color 0.2s",
        fontFamily:      "'Tajawal', sans-serif",
        boxShadow:       hov ? "0 6px 24px rgba(212,175,55,0.15)" : "0 2px 12px rgba(0,0,0,0.2)",
        position:        "relative",
        overflow:        "hidden",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Featured badge */}
      {shop.isFeatured && (
        <div style={{ position: "absolute", top: "10px", insetInlineEnd: "10px", backgroundColor: GOLD, color: "#263238", borderRadius: "20px", padding: "2px 10px", fontSize: "0.72rem", fontWeight: 800, pointerEvents: "none", display: "flex", alignItems: "center", gap: "6px" }}>
          <FiStar size="1rem" /> {t("shopFeatured")}
        </div>
      )}

      {/* Avatar */}
      <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "rgba(212,175,55,0.15)", border: "1.5px solid rgba(212,175,55,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", fontWeight: 800, color: GOLD, marginBottom: "0.85rem", pointerEvents: "none", overflow: "hidden" }}>
        {shop.shopPicture ? (
          <img src={shop.shopPicture} alt={i18n.language === 'ar' && shop.shopNameAr ? shop.shopNameAr : shop.shopName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          ((i18n.language === 'ar' && shop.shopNameAr ? shop.shopNameAr : shop.shopName) || "?").charAt(0).toUpperCase()
        )}
      </div>

      {/* Name */}
      <p style={{ fontSize: "1rem", fontWeight: 700, color: "#FFFFFF", margin: "0 0 0.3rem", pointerEvents: "none" }}>{i18n.language === 'ar' && shop.shopNameAr ? shop.shopNameAr : shop.shopName}</p>

      {/* Location */}
      <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.55)", margin: "0 0 0.5rem", pointerEvents: "none", display: "flex", alignItems: "center", gap: "6px" }}>
        <FiMapPin size="1rem" style={{ display: "inline-flex", verticalAlign: "middle" }} /> {i18n.language === 'ar' && shop.shopCityAr ? shop.shopCityAr : shop.shopCity}{(i18n.language === 'ar' && shop.shopAreaAr) || shop.shopArea ? ` · ${i18n.language === 'ar' && shop.shopAreaAr ? shop.shopAreaAr : shop.shopArea}` : ""}
      </p>

      {/* Product count */}
      {productCount !== undefined && (
        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", margin: "0 0 0.75rem", pointerEvents: "none", display: "flex", alignItems: "center", gap: "6px" }}>
          <FiBox size="1rem" style={{ display: "inline-flex", verticalAlign: "middle" }} /> {productCount} {t("shopProductsCount")}
        </p>
      )}

      {/* Badges */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "0.9rem", pointerEvents: "none" }}>
        {shop.isApproved && shop.sellerId !== "imported" && (
          <span style={{ backgroundColor: "rgba(212,175,55,0.12)", color: GOLD, border: "1px solid rgba(212,175,55,0.3)", borderRadius: "20px", padding: "2px 10px", fontSize: "0.75rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <FiCheckCircle size="0.9rem" style={{ display: "inline-flex", verticalAlign: "middle" }} /> {t("shopVerified")}
          </span>
        )}
      </div>

      {/* External Link */}
      {(() => {
        const url = shop?.locationLink;
        if (!url) return null;
        const isGmaps = url.toLowerCase().includes("google.com/maps") || url.toLowerCase().includes("goo.gl/maps") || url.toLowerCase().includes("maps.google") || url.toLowerCase().includes("maps.app.goo");
        return (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", width: "100%", padding: "0.55rem", backgroundColor: "rgba(212,175,55,0.1)", border: `1px solid rgba(212,175,55,0.3)`, borderRadius: "9px", color: GOLD, fontFamily: "'Tajawal', sans-serif", fontSize: "0.85rem", fontWeight: 700, textDecoration: "none", marginBottom: "0.6rem", transition: "all 0.2s", boxSizing: "border-box" }}
          >
            {isGmaps ? <><FiMapPin size="1rem" style={{ display: "inline-flex", verticalAlign: "middle" }} /> {t("shopLocationButton")}</> : <><FiLink size="1rem" style={{ display: "inline-flex", verticalAlign: "middle" }} /> {t("visitWebsite")}</>}
          </a>
        );
      })()}

      {/* CTA button — explicit onClick with stopPropagation */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          console.log("Button clicked, navigating to:", `/shop/${shop.id}`);
          navigate(`/shop/${shop.id}`);
        }}
        style={{ width: "100%", padding: "0.55rem", backgroundColor: hov ? "#FFD700" : "transparent", border: `1.5px solid ${hov ? "#FFD700" : "rgba(212,175,55,0.4)"}`, borderRadius: "9px", color: hov ? "#263238" : GOLD, fontFamily: "'Tajawal', sans-serif", fontSize: "0.88rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
      >
        {t("shopViewCollection")}
      </button>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SHOP GRID
   ══════════════════════════════════════════════════════════════ */
function ShopGrid() {
  const { t, i18n }        = useTranslation();
  const { language } = useLanguage();
  const location     = useLocation();
  const navigate     = useNavigate();
  const dir          = language === "ar" ? "rtl" : "ltr";

  // Read URL params
  const params      = new URLSearchParams(location.search);
  const cityFilter  = params.get("city")   || "";
  const areaFilter  = params.get("area")   || "";
  const searchQuery = params.get("search") || "";

  const [allShops,     setAllShops]     = useState([]);
  const [productCounts,setProductCounts]= useState({});
  const [shopRatings,  setShopRatings]  = useState({});
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");

  const setCityFilter = (city) => {
    const newParams = new URLSearchParams(location.search);
    if (city) {
      newParams.set("city", city);
    } else {
      newParams.delete("city");
    }
    newParams.delete("area");
    navigate({ search: newParams.toString() });
  };

  const setAreaFilter = (area) => {
    const newParams = new URLSearchParams(location.search);
    if (area) {
      newParams.set("area", area);
    } else {
      newParams.delete("area");
    }
    navigate({ search: newParams.toString() });
  };

  const CITIES = ["Jeddah", "Riyadh", "Khubar", "Dammam", "Mecca", "Madina"];

  const uniqueAreas = useMemo(() => {
    if (!cityFilter) return [];
    const areas = new Set(allShops.filter(s => s.shopCity === cityFilter).map(s => s.shopArea).filter(Boolean));
    return Array.from(areas).sort();
  }, [allShops, cityFilter]);

  /* ── Fetch all approved shops once ─────────────────────── */
  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true); setError("");
      try {
        const q    = query(collection(db, "shops"), where("isApproved", "==", true));
        const snap = await getDocs(q);
        const raw  = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Featured first
        const featured = raw.filter((s) => s.isFeatured);
        const rest     = raw.filter((s) => !s.isFeatured);
        const ordered  = [...featured, ...rest];
        setAllShops(ordered);

        // Fetch product counts in parallel
        const counts = {};
        await Promise.all(ordered.map(async (shop) => {
          counts[shop.id] = await fetchProductCount(shop.id);
        }));
        setProductCounts(counts);

        const ratingSnap = await getDocs(collection(db, "ratings"));
        const aggregate = {};
        ratingSnap.forEach((d) => {
          const r = d.data();
          if (!r?.shopId || typeof r.rating !== "number") return;
          if (!aggregate[r.shopId]) aggregate[r.shopId] = { sum: 0, count: 0 };
          aggregate[r.shopId].sum += r.rating;
          aggregate[r.shopId].count += 1;
        });

        const normalized = {};
        Object.keys(aggregate).forEach((id) => {
          normalized[id] = {
            avg: aggregate[id].sum / aggregate[id].count,
            count: aggregate[id].count,
          };
        });
        setShopRatings(normalized);
      } catch (e) {
        console.error("[ShopGrid]", e);
        setError(t("errorLoadingShops"));
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, []); // fetch once — filter client-side

  /* ── Client-side filter ─────────────────────────────────── */
  const displayed = useMemo(() => {
    let list = [...allShops];
    if (cityFilter)   list = list.filter((s) => s.shopCity === cityFilter);
    if (areaFilter)   list = list.filter((s) => s.shopArea === areaFilter);
    if (searchQuery)  list = list.filter((s) => (s.shopName || "").toLowerCase().includes(searchQuery.toLowerCase()) || (s.shopArea || "").toLowerCase().includes(searchQuery.toLowerCase()));
    return list;
  }, [allShops, cityFilter, areaFilter, searchQuery]);

  return (
    <section style={{ padding: "1.5rem 1.5rem 2.5rem", fontFamily: "'Tajawal', sans-serif" }} dir={dir}>
      {/* Section header */}
      <div style={{ marginBottom: "1.75rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(1.3rem,3vw,1.75rem)", fontWeight: 800, color: "#FFFFFF", margin: "0 0 0.4rem" }}>
          {cityFilter ? `🏙️ ${t(`city${cityFilter}`) !== `city${cityFilter}` ? t(`city${cityFilter}`) : cityFilter}${areaFilter ? ` · ${areaFilter}` : ""}` : t("shopsTitle")}
        </h2>
        <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.55)", margin: 0 }}>{t("shopsSubtitle")}</p>
        <div style={{ width: "48px", height: "3px", backgroundColor: GOLD, borderRadius: "2px", margin: "0.9rem auto 0" }} />
      </div>

      {/* ── Filters ─────────────────────────────────────────── */}
      {!loading && !error && allShops.length > 0 && (
        <div style={{ marginBottom: "2rem", maxWidth: "1200px", margin: "0 auto 2rem" }}>
          {/* Cities */}
          <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.5rem", scrollbarWidth: "none" }}>
            <button
              onClick={() => setCityFilter("")}
              style={{ flexShrink: 0, padding: "0.6rem 1.25rem", borderRadius: "20px", border: `1.5px solid ${!cityFilter ? "#FFD700" : "rgba(255,255,255,0.2)"}`, backgroundColor: !cityFilter ? "#FFD700" : "rgba(255,255,255,0.05)", color: !cityFilter ? "#263238" : "rgba(255,255,255,0.8)", fontFamily: "'Tajawal', sans-serif", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
            >
              {t("filterAllCities")}
            </button>
            {CITIES.map(city => (
              <button
                key={city}
                onClick={() => setCityFilter(city)}
                style={{ flexShrink: 0, padding: "0.6rem 1.25rem", borderRadius: "20px", border: `1.5px solid ${cityFilter === city ? "#FFD700" : "rgba(255,255,255,0.2)"}`, backgroundColor: cityFilter === city ? "#FFD700" : "rgba(255,255,255,0.05)", color: cityFilter === city ? "#263238" : "rgba(255,255,255,0.8)", fontFamily: "'Tajawal', sans-serif", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
              >
                {t(`city${city}`) !== `city${city}` ? t(`city${city}`) : city}
              </button>
            ))}
          </div>

          {/* Areas */}
          {cityFilter && uniqueAreas.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingTop: "0.75rem", paddingBottom: "0.5rem", scrollbarWidth: "none" }}>
              <button
                onClick={() => setAreaFilter("")}
                style={{ flexShrink: 0, padding: "0.5rem 1rem", borderRadius: "20px", border: `1px solid ${!areaFilter ? "#FFD700" : "rgba(255,255,255,0.15)"}`, backgroundColor: !areaFilter ? "rgba(212,175,55,0.15)" : "transparent", color: !areaFilter ? "#FFD700" : "rgba(255,255,255,0.6)", fontFamily: "'Tajawal', sans-serif", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
              >
                {t("filterAllAreas")}
              </button>
              {uniqueAreas.map(area => {
                const matchedShop = allShops.find(s => s.shopArea === area);
                const displayArea = i18n.language === 'ar' && matchedShop && matchedShop.shopAreaAr ? matchedShop.shopAreaAr : area;
                return (
                  <button
                    key={area}
                    onClick={() => setAreaFilter(area)}
                    style={{ flexShrink: 0, padding: "0.5rem 1rem", borderRadius: "20px", border: `1px solid ${areaFilter === area ? "#FFD700" : "rgba(255,255,255,0.15)"}`, backgroundColor: areaFilter === area ? "rgba(212,175,55,0.15)" : "transparent", color: areaFilter === area ? "#FFD700" : "rgba(255,255,255,0.6)", fontFamily: "'Tajawal', sans-serif", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
                  >
                    {displayArea}
                  </button>
                );
              })}
            </motion.div>
          )}
        </div>
      )}

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <GoldSpinner fullScreen={false} size={52} />
        </div>
      )}

      {error && <p style={{ color: "#FCA5A5", textAlign: "center" }}>{error}</p>}

      {!loading && !error && displayed.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "3rem 1rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}><FiShoppingBag size={42} /></div>
          <h3 style={{ color: "#FFFFFF", margin: "0 0 0.5rem", fontSize: "1.1rem" }}>{t("shopsEmpty")}</h3>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.9rem" }}>{t("shopsEmptyDesc")}</p>
        </motion.div>
      )}

      {!loading && !error && displayed.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem", maxWidth: "1200px", margin: "0 auto" }}>
          {displayed.map((shop, i) => (
            <ShopCard
              key={shop.id}
              shop={shop}
              index={i}
              productCount={productCounts[shop.id]}
              ratingData={shopRatings[shop.id]}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default ShopGrid;
