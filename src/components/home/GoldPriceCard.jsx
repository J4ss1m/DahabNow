/**
 * components/home/GoldPriceCard.jsx
 * Real-time gold price display for 24K / 22K / 21K / 18K.
 *
 * Data source:  https://api.metals.live/v1/spot/gold
 * Response:     [{ "gold": <USD per troy oz> }]
 * Conversion:   SAR/g = (USD/oz × 3.75) / 31.1035   × (karat/24)
 * Refresh rate: every 60 seconds
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence }      from "framer-motion";
import { useTranslation }               from "react-i18next";
import { useLanguage }                  from "../../context/LanguageContext";
import { useLiveGoldPrice }             from "../../hooks/useLiveGoldPrice";

/* ── Constants ───────────────────────────────────────────────── */
const KARATS = [24, 22, 21, 18];

/* ── Shimmer overlay ─────────────────────────────────────────── */
function Shimmer() {
  return (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: "100%" }}
      transition={{ duration: 0.85, ease: "easeInOut" }}
      style={{
        position:   "absolute",
        inset:      0,
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
        borderRadius: "inherit",
        pointerEvents: "none",
      }}
    />
  );
}

/* ── Single karat card ───────────────────────────────────────── */
function KaratCard({ karat, price, prevPrice, shimmer }) {
  const { t } = useTranslation();
  const up     = prevPrice !== null && price > prevPrice;
  const down   = prevPrice !== null && price < prevPrice;
  const arrow  = up ? "▲" : down ? "▼" : "●";
  const color  = up ? "#4ADE80" : down ? "#F87171" : "rgba(255,255,255,0.5)";

  return (
    <motion.div
      layout
      style={{
        position:        "relative",
        flex:            "1 1 0",
        minWidth:        "130px",
        backgroundColor: "#455A64",
        borderRadius:    "14px",
        border:          "1px solid rgba(212,175,55,0.25)",
        padding:         "1.2rem 1rem",
        textAlign:       "center",
        fontFamily:      "'Tajawal', sans-serif",
        overflow:        "hidden",
        boxShadow:       "0 2px 12px rgba(0,0,0,0.25)",
      }}
    >
      {shimmer && <Shimmer />}

      {/* Karat label */}
      <div style={{
        fontSize:    "0.82rem",
        fontWeight:  600,
        color:       "#D4AF37",
        marginBottom: "0.5rem",
        letterSpacing: "0.08em",
      }}>
        {karat}K
      </div>

      {/* Price */}
      <div style={{
        fontSize:   "clamp(1.25rem, 2.5vw, 1.55rem)",
        fontWeight: 800,
        color:      "#FFFFFF",
        marginBottom: "0.35rem",
        lineHeight: 1,
      }}>
        {price !== null ? price.toFixed(2) : "—"}
      </div>

      {/* SAR unit */}
      <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.55)", marginBottom: "0.5rem" }}>
        {t("goldPriceSubtitle", { karat })}
      </div>

      {/* Direction arrow */}
      <div style={{ fontSize: "0.9rem", color, fontWeight: 700 }}>
        {arrow}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   GOLD PRICE CARD
   ══════════════════════════════════════════════════════════════ */
function GoldPriceCard() {
  const { t }        = useTranslation();
  const { language } = useLanguage();
  const dir          = language === "ar" ? "rtl" : "ltr";

  const { prices, prevPrices, lastUpdate, isError } = useLiveGoldPrice();
  const [shimmer, setShimmer] = useState(false);

  useEffect(() => {
    if (!prices) return;
    setShimmer(true);
    const id = setTimeout(() => setShimmer(false), 900);
    return () => clearTimeout(id);
  }, [prices]);

  const formatTime = (d) => {
    if (!d) return "";
    return d.toLocaleTimeString(language === "ar" ? "ar-SA" : "en-US", {
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  };

  return (
    <section
      id="prices"
      style={{
        padding:    "2.5rem 1.5rem",
        fontFamily: "'Tajawal', sans-serif",
      }}
      dir={dir}
    >
      {/* Section header */}
      <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
        <h2 style={{
          fontSize:   "clamp(1.3rem, 3vw, 1.75rem)",
          fontWeight: 800,
          color:      "#FFFFFF",
          margin:     "0 0 0.4rem",
        }}>
          {t("goldPriceTitle")}
          {" "}
          <span style={{
            display:      "inline-block",
            width:        "10px",
            height:       "10px",
            borderRadius: "50%",
            backgroundColor: "#4ADE80",
            verticalAlign: "middle",
            animation:    "pulse 2s ease-in-out infinite",
          }} />
        </h2>
        <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.45)", margin: 0 }}>
          {t("goldPriceLastUpdated")}: {lastUpdate ? formatTime(lastUpdate) : "--:--:--"}
          {isError && (
            <span style={{ color: "#F87171", marginInlineStart: "0.5rem" }}>
              ({t("goldPriceError")})
            </span>
          )}
        </p>
      </div>

      {/* Loading state */}
      {!prices ? (
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: "0.95rem" }}>
          {t("goldPriceLoading")}
        </p>
      ) : (
        <div style={{
          display:   "flex",
          gap:       "1rem",
          flexWrap:  "wrap",
          maxWidth:  "860px",
          margin:    "0 auto",
        }}>
          {KARATS.map((k) => (
            <KaratCard
              key={k}
              karat={k}
              price={prices[k]}
              prevPrice={prevPrices ? prevPrices[k] : null}
              shimmer={shimmer}
            />
          ))}
        </div>
      )}

      {/* Pulse keyframe */}
      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(74,222,128,0.5); }
          50%       { box-shadow: 0 0 0 6px rgba(74,222,128,0); }
        }
      `}</style>
    </section>
  );
}

export default GoldPriceCard;
