/**
 * components/home/HeroSlider.jsx — Phase 7 fix
 *
 * Always shows 3 default slides.
 * Approved adRequests are interleaved BETWEEN the defaults — never replacing them.
 * Interleave pattern (n = number of approved ads):
 *   0 ads → [D1, D2, D3]
 *   1 ad  → [D1, A1, D2, D3]
 *   2 ads → [D1, A1, D2, A2, D3]
 *   3+ads → [D1, A1, D2, A2, D3, A3, ...]
 *
 * Phase 6 fix kept: exit animation has pointerEvents: "none"
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence }  from "framer-motion";
import { useTranslation }           from "react-i18next";
import { FiStar, FiShoppingBag, FiTrendingUp } from "react-icons/fi";
import { useNavigate }              from "react-router-dom";
import { useLanguage }              from "../../context/LanguageContext";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db }                       from "../../firebase/config";
import iuLogo                       from "../../assets/iu-logo.png";
import DahabNowLogo                 from "../common/DahabNowLogo";

/* ── Decorative ring (pointer-events off, purely visual) ─────── */
const Ring = ({ x, y, size, opacity }) => (
  <div style={{ position: "absolute", left: x, top: y, width: size, height: size, borderRadius: "50%", border: "1.5px solid rgba(212,175,55,0.18)", opacity, pointerEvents: "none" }} />
);

/* ── 3 permanent default slides ──────────────────────────────── */
const DEFAULTS = [
  {
    isAd:      false,
    titleKey:  "heroSlide1Title",
    subKey:    "heroSlide1Subtitle",
    ctaKey:    "heroCta",
    ctaPath:   "#shops",
    gradient:  "linear-gradient(135deg,#1a2430 0%,#263238 40%,#1c2e25 100%)",
    icon:      <FiStar size={28} />,
  },
  {
    isAd:      false,
    titleKey:  "heroSlide2Title",
    subKey:    "heroSlide2Subtitle",
    ctaKey:    "heroCtaSell",
    ctaPath:   "/register",
    gradient:  "linear-gradient(135deg,#1e2a22 0%,#263238 45%,#232030 100%)",
    icon:      <FiShoppingBag size={28} />,
  },
  {
    isAd:      false,
    titleKey:  "heroSlide3Title",
    subKey:    "heroSlide3Subtitle",
    ctaKey:    "heroCtaPrice",
    ctaPath:   "#prices",
    gradient:  "linear-gradient(135deg,#1e2030 0%,#263238 45%,#2a1e1e 100%)",
    icon:      <FiTrendingUp size={28} />,
  },
  {
    isAd:           false,
    isProjectSlide: true,
    titleKey:       "projectName",
    subKey:         "softwareEngineering",
    ctaKey:         "footerServices",
    ctaPath:        "#services",
    gradient:       "linear-gradient(135deg,#1a2024 0%,#263238 50%,#202621 100%)",
    icon:           "",
  },
];

/* ── Build interleaved slide list ────────────────────────────── */
function buildSlides(adSlides) {
  // No ads → just the 3 defaults
  if (!adSlides || adSlides.length === 0) return DEFAULTS;

  const result = [];
  // Insert each ad between consecutive defaults
  // [D1] [A0] [D2] [A1] [D3] [A2] [A3] ...
  DEFAULTS.forEach((def, i) => {
    result.push(def);
    if (adSlides[i]) result.push(adSlides[i]);
  });
  // Any remaining ads (more than 3) go at the end
  for (let i = DEFAULTS.length; i < adSlides.length; i++) {
    result.push(adSlides[i]);
  }
  return result;
}

/* ══════════════════════════════════════════════════════════════
   HERO SLIDER
   ══════════════════════════════════════════════════════════════ */
function HeroSlider() {
  const { t }        = useTranslation();
  const { language } = useLanguage();
  const navigate     = useNavigate();
  const dir          = language === "ar" ? "rtl" : "ltr";

  // Start with defaults immediately — no loading blank
  const [slides,    setSlides]    = useState(DEFAULTS);
  const [current,  setCurrent]   = useState(0);
  const [direction,setDirection] = useState(1);

  /* ── Fetch hero slides first, fallback to approved ads/defaults ── */
  useEffect(() => {
    let cancelled = false;
    const fetchSlides = async () => {
      try {
        const heroQ = query(
          collection(db, "heroSlides"),
          where("isActive", "==", true),
          orderBy("order", "asc")
        );
        const heroSnap = await getDocs(heroQ);
        if (cancelled) return;

        if (!heroSnap.empty) {
          const heroSlides = heroSnap.docs.map((d) => {
            const a = d.data();
            return {
              isAd: false,
              title: a.title || "",
              subtitle: a.subtitle || "",
              buttonText: a.buttonText || "",
              buttonLink: a.buttonLink || "",
              backgroundColor: a.backgroundColor || "#263238",
              textColor: a.textColor || "#FFFFFF",
              gradient: `linear-gradient(135deg, ${a.backgroundColor || "#263238"} 0%, #263238 100%)`,
              icon: <FiStar size={24} />,
            };
          });
          setSlides(heroSlides);
          setCurrent(0);
          return;
        }

        const adQ = query(collection(db, "adRequests"), where("status", "==", "approved"));
        const adSnap = await getDocs(adQ);
        if (cancelled) return;
        if (!adSnap.empty) {
          const adSlides = adSnap.docs.map((d) => {
            const a = d.data();
            return {
              isAd:      true,
              shopId:    a.shopId   || "",
              shopName:  a.shopName || "Shop",
              adMessage: a.adMessage || a.message || "",
              gradient:  "linear-gradient(135deg,#1a2b1a 0%,#263238 45%,#2b1e0a 100%)",
              icon:      <FiStar size={24} />,
            };
          });
          setSlides(buildSlides(adSlides));
          setCurrent(0);
        }
      } catch (err) {
        console.error("[HeroSlider] fetch slides:", err);
      }
    };
    fetchSlides();
    return () => { cancelled = true; };
  }, []);

  /* ── Auto-advance every 5 s ─────────────────────────────────── */
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((p) => (p + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides]);

  const goTo = (idx) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  };

  /* ── CTA click handler ──────────────────────────────────────── */
  const handleCta = (slide) => {
    if (slide.isAd) {
      navigate(`/shop/${slide.shopId}`);
    } else if (slide.buttonLink) {
      if (slide.buttonLink.startsWith("#")) {
        const el = document.getElementById(slide.buttonLink.slice(1));
        if (el) el.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate(slide.buttonLink);
      }
    } else if (slide.ctaPath && slide.ctaPath.startsWith("#")) {
      // Smooth scroll to anchor
      const el = document.getElementById(slide.ctaPath.slice(1));
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else if (slide.ctaPath) {
      navigate(slide.ctaPath);
    }
  };

  const slide = slides[current];

  return (
    <section
      style={{ position: "relative", width: "100%", height: "clamp(380px,60vh,560px)", overflow: "hidden", fontFamily: "'Tajawal',sans-serif" }}
      dir={dir}
    >
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          initial={{ opacity: 0, x: direction * 60 }}
          animate={{ opacity: 1, x: 0, pointerEvents: "auto" }}
          exit={{ opacity: 0, x: direction * -60, pointerEvents: "none" }}   /* ← Phase 6 fix */
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            position:       "absolute",
            inset:          0,
            background:     slide.gradient,
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            justifyContent: "center",
            textAlign:      "center",
            padding:        "2rem 1.5rem",
            pointerEvents:  "auto",
          }}
        >
          {slide.isProjectSlide ? (
            <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "800px" }}>
              {/* Islamic geometric background specific to this slide */}
              <div style={{ position: "absolute", inset: "-100px", pointerEvents: "none", opacity: 0.05, backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, #D4AF37 20px, #D4AF37 21px), repeating-linear-gradient(-45deg, transparent, transparent 20px, #D4AF37 20px, #D4AF37 21px)`, zIndex: -1 }} />
              
              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <DahabNowLogo size={36} />
                  <span style={{ color: "#D4AF37", fontWeight: 900, fontSize: "1.4rem", letterSpacing: "0.05em" }}>DahabNow</span>
                </div>
                <div style={{ width: "2px", height: "30px", backgroundColor: "rgba(212,175,55,0.3)" }} />
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <img src={iuLogo} alt="Islamic University of Madinah" style={{ width: "80px", height: "80px", objectFit: "contain" }} />
                  <span style={{ color: "#FFFFFF", fontWeight: 700, fontSize: "1rem", maxWidth: "150px", textAlign: "start", lineHeight: 1.2 }}>{t("universityName")}</span>
                </div>
              </div>

              <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ color: "#D4AF37", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 800, margin: "0 0 0.5rem" }}>
                {t("projectName")}
              </motion.h1>
              
              <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ color: "rgba(255,255,255,0.8)", fontSize: "1.1rem", margin: "0 0 2rem" }}>
                {t("courseName")}: <strong style={{ color: "#FFFFFF" }}>{t("softwareEngineering")}</strong>
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1.5rem", width: "100%", borderTop: "1px solid rgba(212,175,55,0.2)", borderBottom: "1px solid rgba(212,175,55,0.2)", padding: "1.5rem 0" }}>
                <div style={{ flex: "1 1 200px" }}>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", textTransform: "uppercase", margin: "0 0 0.3rem" }}>{t("student")} 1</p>
                  <p style={{ color: "#D4AF37", fontWeight: 800, fontSize: "1.1rem", margin: "0 0 0.2rem" }}>{t("student1Name")}</p>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", margin: 0, fontFamily: "monospace" }}>{t("universityId")}: 452032893</p>
                </div>
                <div style={{ width: "1px", backgroundColor: "rgba(212,175,55,0.2)" }} />
                <div style={{ flex: "1 1 200px" }}>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", textTransform: "uppercase", margin: "0 0 0.3rem" }}>{t("student")} 2</p>
                  <p style={{ color: "#D4AF37", fontWeight: 800, fontSize: "1.1rem", margin: "0 0 0.2rem" }}>{t("student2Name")}</p>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", margin: 0, fontFamily: "monospace" }}>{t("universityId")}: 443058203</p>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ marginTop: "1.5rem" }}>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", textTransform: "uppercase", margin: "0 0 0.3rem" }}>{t("courseInstructor")}</p>
                <p style={{ color: "#D4AF37", fontWeight: 800, fontSize: "1.2rem", margin: 0 }}>{t("instructorName")}</p>
              </motion.div>
            </div>
          ) : (
            <>
              {/* Ambient rings */}
              <Ring x="-80px" y="-80px" size="320px" opacity={0.4} />
              <Ring x="60%"   y="-40px" size="220px" opacity={0.3} />
              <Ring x="10%"   y="60%"   size="180px" opacity={0.25} />
              <Ring x="75%"   y="55%"   size="260px" opacity={0.2} />

              {/* Gold accent line */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                style={{ width: "60px", height: "3px", backgroundColor: "#D4AF37", borderRadius: "2px", marginBottom: "1.25rem", transformOrigin: dir === "rtl" ? "right" : "left" }}
              />

              {/* Icon */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                style={{ fontSize: "3rem", marginBottom: "0.75rem", lineHeight: 1 }}
              >
                {slide.icon}
              </motion.div>

              {/* Ad badge */}
              {slide.isAd && (
                <motion.span
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  style={{ backgroundColor: "rgba(212,175,55,0.18)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.4)", borderRadius: "20px", padding: "3px 14px", fontSize: "0.78rem", fontWeight: 700, marginBottom: "0.6rem", display: "inline-block" }}
                >
                  <FiStar size={16} /> {t("adSlideLabel")}
                </motion.span>
              )}

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                style={{ fontSize: "clamp(1.5rem,4vw,2.5rem)", fontWeight: 800, color: "#FFFFFF", margin: "0 0 0.75rem", lineHeight: 1.2, maxWidth: "700px" }}
              >
                {slide.isAd ? slide.shopName : (slide.title || t(slide.titleKey))}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                style={{ fontSize: "clamp(0.92rem,2.2vw,1.15rem)", color: "rgba(255,255,255,0.72)", margin: "0 0 1.75rem", maxWidth: "560px", lineHeight: 1.55 }}
              >
                {slide.isAd ? slide.adMessage : (slide.subtitle || t(slide.subKey))}
              </motion.p>

              {/* CTA button */}
              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.45 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleCta(slide)}
                style={{ backgroundColor: "#FFD700", color: "#263238", border: "none", borderRadius: "12px", padding: "0.8rem 2rem", fontSize: "1rem", fontWeight: 800, cursor: "pointer", fontFamily: "'Tajawal',sans-serif", letterSpacing: "0.04em" }}
              >
                {slide.isAd ? t("viewShop") : (slide.buttonText || t(slide.ctaKey))}
              </motion.button>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Dot navigation */}
      {slides.length > 1 && (
        <div style={{ position: "absolute", bottom: "1.25rem", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "10px", zIndex: 10 }}>
          {slides.map((s, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              style={{
                width:           i === current ? "28px" : s.isAd ? "12px" : "10px",
                height:          "10px",
                borderRadius:    "5px",
                backgroundColor: i === current ? "#FFD700" : s.isAd ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.38)",
                border:          "none",
                cursor:          "pointer",
                padding:         0,
                transition:      "width 0.3s ease, background-color 0.3s ease",
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default HeroSlider;
