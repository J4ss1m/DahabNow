import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FiStar, FiMapPin, FiBox, FiCheckCircle, FiLink } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const GOLD = "#D4AF37";

function ShopCard({ shop, index, productCount, ratingData }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [hov, setHov] = useState(false);

  const goToShop = () => {
    navigate(`/shop/${shop.id}`);
  };

  const avg = ratingData?.avg ?? 0;
  const count = ratingData?.count ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay: index * 0.07 }}
      onClick={goToShop}
      style={{
        backgroundColor: hov ? "#506070" : "#455A64",
        border: `1px solid ${hov ? GOLD : "rgba(212,175,55,0.2)"}`,
        borderRadius: "16px",
        padding: "1.25rem",
        cursor: "pointer",
        transition: "background-color 0.2s, border-color 0.2s",
        fontFamily: "'Tajawal', sans-serif",
        boxShadow: hov ? "0 6px 24px rgba(212,175,55,0.15)" : "0 2px 12px rgba(0,0,0,0.2)",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {shop.isFeatured && (
        <div style={{ position: "absolute", top: "10px", insetInlineEnd: "10px", backgroundColor: GOLD, color: "#263238", borderRadius: "20px", padding: "2px 10px", fontSize: "0.72rem", fontWeight: 800, pointerEvents: "none", display: "flex", alignItems: "center", gap: "6px" }}>
          <FiStar size="1rem" /> {t("shopFeatured")}
        </div>
      )}

      <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "rgba(212,175,55,0.15)", border: "1.5px solid rgba(212,175,55,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", fontWeight: 800, color: GOLD, marginBottom: "0.85rem", pointerEvents: "none", overflow: "hidden" }}>
        {shop.shopPicture ? (
          <img src={shop.shopPicture} alt={i18n.language === "ar" && shop.shopNameAr ? shop.shopNameAr : shop.shopName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          ((i18n.language === "ar" && shop.shopNameAr ? shop.shopNameAr : shop.shopName) || "?").charAt(0).toUpperCase()
        )}
      </div>

      <p style={{ fontSize: "1rem", fontWeight: 700, color: "#FFFFFF", margin: "0 0 0.3rem", pointerEvents: "none" }}>{i18n.language === "ar" && shop.shopNameAr ? shop.shopNameAr : shop.shopName}</p>

      {count > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.22rem", marginBottom: "0.45rem", pointerEvents: "none" }}>
          {[1, 2, 3, 4, 5].map((star) => {
            const filled = star <= Math.round(avg);
            return (
              <span key={star} style={{ color: filled ? GOLD : "rgba(255,255,255,0.2)", display: "inline-flex", alignItems: "center" }}>
                <FiStar size="0.85rem" style={{ fill: filled ? GOLD : "none" }} />
              </span>
            );
          })}
          <span style={{ color: "rgba(255,255,255,0.58)", fontSize: "0.78rem", marginInlineStart: "0.25rem" }}>
            {avg.toFixed(1)}
          </span>
        </div>
      )}

      <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.55)", margin: "0 0 0.5rem", pointerEvents: "none", display: "flex", alignItems: "center", gap: "6px" }}>
        <FiMapPin size="1rem" style={{ display: "inline-flex", verticalAlign: "middle" }} /> {i18n.language === "ar" && shop.shopCityAr ? shop.shopCityAr : shop.shopCity}{(i18n.language === "ar" && shop.shopAreaAr) || shop.shopArea ? ` · ${i18n.language === "ar" && shop.shopAreaAr ? shop.shopAreaAr : shop.shopArea}` : ""}
      </p>

      {productCount !== undefined && (
        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", margin: "0 0 0.75rem", pointerEvents: "none", display: "flex", alignItems: "center", gap: "6px" }}>
          <FiBox size="1rem" style={{ display: "inline-flex", verticalAlign: "middle" }} /> {productCount} {t("shopProductsCount")}
        </p>
      )}

      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "0.9rem", pointerEvents: "none" }}>
        {shop.isApproved && shop.sellerId !== "imported" && (
          <span style={{ backgroundColor: "rgba(212,175,55,0.12)", color: GOLD, border: "1px solid rgba(212,175,55,0.3)", borderRadius: "20px", padding: "2px 10px", fontSize: "0.75rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <FiCheckCircle size="0.9rem" style={{ display: "inline-flex", verticalAlign: "middle" }} /> {t("shopVerified")}
          </span>
        )}
      </div>

      {(() => {
        const url = shop?.locationLink;
        if (!url) return null;
        const lowered = url.toLowerCase();
        const isGmaps = lowered.includes("google.com/maps") || lowered.includes("goo.gl/maps") || lowered.includes("maps.google") || lowered.includes("maps.app.goo");
        return (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", width: "100%", padding: "0.55rem", backgroundColor: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "9px", color: GOLD, fontFamily: "'Tajawal', sans-serif", fontSize: "0.85rem", fontWeight: 700, textDecoration: "none", marginBottom: "0.6rem", transition: "all 0.2s", boxSizing: "border-box" }}
          >
            {isGmaps ? <><FiMapPin size="1rem" style={{ display: "inline-flex", verticalAlign: "middle" }} /> {t("shopLocationButton")}</> : <><FiLink size="1rem" style={{ display: "inline-flex", verticalAlign: "middle" }} /> {t("visitWebsite")}</>}
          </a>
        );
      })()}

      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/shop/${shop.id}`);
        }}
        style={{ width: "100%", padding: "0.55rem", backgroundColor: hov ? "#FFD700" : "transparent", border: `1.5px solid ${hov ? "#FFD700" : "rgba(212,175,55,0.4)"}`, borderRadius: "9px", color: hov ? "#263238" : GOLD, fontFamily: "'Tajawal', sans-serif", fontSize: "0.88rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
      >
        {t("shopViewCollection")}
      </button>
    </motion.div>
  );
}

export default ShopCard;
