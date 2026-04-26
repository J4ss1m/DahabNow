/**
 * components/common/Footer.jsx — Phase 7
 * Proper footer with logo, quick links, tech credit, and Contact Us modal.
 * Background: #1a2428  |  Gold top border  |  Fully responsive  |  RTL/LTR
 */

import { useState }       from "react";
import { useTranslation } from "react-i18next";
import { useNavigate }    from "react-router-dom";
import { useLanguage }    from "../../context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import DahabNowLogo       from "./DahabNowLogo";

const GOLD = "#D4AF37";
const BG   = "#263238";
const CARD = "#455A64";
const WHITE= "#FFFFFF";

/* ── Contact Us Modal ────────────────────────────────────────── */
function ContactModal({ onClose, dir }) {
  const { t } = useTranslation();

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position:        "fixed",
          inset:           0,
          backgroundColor: "rgba(0,0,0,0.65)",
          zIndex:          1200,
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
          padding:         "1.25rem",
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.28, ease: [0.34, 1.2, 0.64, 1] }}
        onClick={(e) => e.stopPropagation()}
        dir={dir}
        style={{
          position:        "fixed",
          top:             "50%",
          left:            "50%",
          transform:       "translate(-50%, -50%)",
          backgroundColor: CARD,
          borderRadius:    "18px",
          border:          `1.5px solid rgba(212,175,55,0.4)`,
          padding:         "2rem",
          width:           "100%",
          maxWidth:        "420px",
          boxShadow:       "0 12px 48px rgba(0,0,0,0.55)",
          fontFamily:      "'Tajawal', sans-serif",
          zIndex:          1201,
        }}
      >
        <button
          onClick={onClose}
          style={{
            position:       "absolute",
            top:            "1rem",
            insetInlineEnd: "1rem",
            background:     "none",
            border:         "none",
            color:          "rgba(255,255,255,0.55)",
            fontSize:       "1.3rem",
            cursor:         "pointer",
            lineHeight:     1,
          }}
        >
          ✕
        </button>

        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: GOLD, margin: "0 0 1.25rem" }}>
          {t("contactUsTitle")}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
          <a
            href="https://wa.me/966500183775"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              backgroundColor: "rgba(38,50,56,0.6)",
              padding: "1rem", borderRadius: "12px",
              textDecoration: "none", color: WHITE,
              border: "1px solid rgba(255,255,255,0.1)",
              transition: "border-color 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = GOLD}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
          >
            <span style={{ fontSize: "1.5rem" }}>📱</span>
            <div>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>{t("contactWhatsApp")}</p>
              <p style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, direction: "ltr" }}>050 018 3775</p>
            </div>
          </a>

          <a
            href="https://wa.me/966578006021"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              backgroundColor: "rgba(38,50,56,0.6)",
              padding: "1rem", borderRadius: "12px",
              textDecoration: "none", color: WHITE,
              border: "1px solid rgba(255,255,255,0.1)",
              transition: "border-color 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = GOLD}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
          >
            <span style={{ fontSize: "1.5rem" }}>📱</span>
            <div>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>{t("contactWhatsApp")}</p>
              <p style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, direction: "ltr" }}>057 800 6021</p>
            </div>
          </a>

          <a
            href="mailto:saadsmy2912@gmail.com"
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              backgroundColor: "rgba(38,50,56,0.6)",
              padding: "1rem", borderRadius: "12px",
              textDecoration: "none", color: WHITE,
              border: "1px solid rgba(255,255,255,0.1)",
              transition: "border-color 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = GOLD}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
          >
            <span style={{ fontSize: "1.5rem" }}>✉️</span>
            <div>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>{t("contactEmail")}</p>
              <p style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700 }}>saadsmy2912@gmail.com</p>
            </div>
          </a>

          <a
            href="mailto:jjjassim559@gmail.com"
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              backgroundColor: "rgba(38,50,56,0.6)",
              padding: "1rem", borderRadius: "12px",
              textDecoration: "none", color: WHITE,
              border: "1px solid rgba(255,255,255,0.1)",
              transition: "border-color 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = GOLD}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
          >
            <span style={{ fontSize: "1.5rem" }}>✉️</span>
            <div>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>{t("contactEmail")}</p>
              <p style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700 }}>jjjassim559@gmail.com</p>
            </div>
          </a>
        </div>

        <p style={{ margin: 0, fontSize: "0.9rem", color: "rgba(255,255,255,0.7)", textAlign: "center", lineHeight: 1.5 }}>
          {t("contactUsDesc")}
        </p>
      </motion.div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════ */

function Footer() {
  const { t }        = useTranslation();
  const { language } = useLanguage();
  const navigate     = useNavigate();
  const dir          = language === "ar" ? "rtl" : "ltr";

  const [isContactOpen, setIsContactOpen] = useState(false);

  const links = [
    { label: t("footerHome"),     path: "/",         isAction: false },
    { label: t("footerServices"), path: "/#services", isAction: false },
    { label: t("footerLogin"),    path: "/login",    isAction: false },
    { label: t("contactUs"),      path: "#contact",  isAction: true  },
  ];

  return (
    <>
      <footer
        dir={dir}
        style={{
          backgroundColor: "#1a2428",
          borderTop:       `2px solid rgba(212,175,55,0.25)`,
          padding:         "2.5rem 1.5rem 1.5rem",
          fontFamily:      "'Tajawal', sans-serif",
        }}
      >
        {/* ── Main row ─────────────────────────────────────────── */}
        <div style={{
          maxWidth:      "1100px",
          margin:        "0 auto",
          display:       "flex",
          gap:           "2rem",
          flexWrap:      "wrap",
          justifyContent:"space-between",
          alignItems:    "flex-start",
          marginBottom:  "2rem",
        }}>

          {/* Left — Logo + tagline */}
          <div style={{ flex: "1 1 220px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.75rem" }}>
              <DahabNowLogo size={32} />
              <span style={{ color: GOLD, fontWeight: 900, fontSize: "1.15rem" }}>DahabNow</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.88rem", margin: 0, lineHeight: 1.6, maxWidth: "240px" }}>
              {t("footerTagline")}
            </p>
          </div>

          {/* Center — Quick links */}
          <div style={{ flex: "1 1 160px" }}>
            <p style={{ color: GOLD, fontWeight: 700, fontSize: "0.88rem", margin: "0 0 0.9rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>
              {t("footerLinks")}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {links.map((l) => (
                <button
                  key={l.path}
                  onClick={() => {
                    if (l.isAction) {
                      setIsContactOpen(true);
                    } else {
                      navigate(l.path);
                    }
                  }}
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontFamily: "'Tajawal', sans-serif", fontSize: "0.88rem", cursor: "pointer", textAlign: "start", padding: 0, transition: "color 0.18s", width: "fit-content" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = GOLD}
                  onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right — Tech credit */}
          <div style={{ flex: "1 1 180px", display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: dir === "rtl" ? "flex-end" : "flex-start" }}>
            <p style={{ color: GOLD, fontWeight: 700, fontSize: "0.88rem", margin: "0 0 0.3rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Stack
            </p>
            {["React + Vite", "Firebase Firestore", "Framer Motion", "Cloudinary"].map((tech) => (
              <span key={tech} style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.82rem" }}>· {tech}</span>
            ))}
          </div>
        </div>

        {/* ── Project Info Section ──────────────────────────────── */}
        <div style={{
          maxWidth: "1100px",
          margin: "0 auto 2.5rem",
          backgroundColor: CARD,
          border: `1.5px solid rgba(212,175,55,0.3)`,
          borderRadius: "16px",
          padding: "1.5rem 2rem",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
        }}>
          {/* Subtle Islamic Geometric Pattern Background */}
          <div style={{
            position: "absolute",
            inset: 0,
            opacity: 0.04,
            pointerEvents: "none",
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, ${GOLD} 20px, ${GOLD} 21px), repeating-linear-gradient(-45deg, transparent, transparent 20px, ${GOLD} 20px, ${GOLD} 21px)`
          }} />
          
          {/* Top Row: Project Name & University */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem", position: "relative", zIndex: 1 }}>
            <div>
              <h3 style={{ margin: "0 0 0.4rem", color: GOLD, fontSize: "1.5rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {t("projectName")}
              </h3>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", fontSize: "0.95rem" }}>
                {t("courseName")}: <span style={{ color: WHITE, fontWeight: 700 }}>{t("softwareEngineering")}</span>
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", backgroundColor: "rgba(0,0,0,0.25)", padding: "0.6rem 1.25rem", borderRadius: "12px", border: "1px solid rgba(212,175,55,0.15)" }}>
              <DahabNowLogo size={26} />
              <span style={{ color: GOLD, fontWeight: 800, fontSize: "1rem" }}>{t("universityName")}</span>
            </div>
          </div>

          {/* Bottom Row: Students & Instructor */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.5rem" }}>
            <div>
              <p style={{ margin: "0 0 0.3rem", color: "rgba(255,255,255,0.45)", fontSize: "0.8rem", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>{t("student")} 1</p>
              <p style={{ margin: "0 0 0.15rem", color: GOLD, fontWeight: 800, fontSize: "1.05rem" }}>{t("student1Name")}</p>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.55)", fontSize: "0.85rem", fontFamily: "monospace" }}>{t("universityId")}: 452032893</p>
            </div>
            <div>
              <p style={{ margin: "0 0 0.3rem", color: "rgba(255,255,255,0.45)", fontSize: "0.8rem", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>{t("student")} 2</p>
              <p style={{ margin: "0 0 0.15rem", color: GOLD, fontWeight: 800, fontSize: "1.05rem" }}>{t("student2Name")}</p>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.55)", fontSize: "0.85rem", fontFamily: "monospace" }}>{t("universityId")}: 443058203</p>
            </div>
            <div>
              <p style={{ margin: "0 0 0.3rem", color: "rgba(255,255,255,0.45)", fontSize: "0.8rem", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>{t("courseInstructor")}</p>
              <p style={{ margin: 0, color: GOLD, fontWeight: 800, fontSize: "1.05rem" }}>{t("instructorName")}</p>
            </div>
          </div>
        </div>

        {/* ── Divider ─────────────────────────────────────────── */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.25rem", maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.8rem", margin: 0 }}>
            {t("footerCopyright")}
          </p>
          <p style={{ color: "rgba(255,255,255,0.22)", fontSize: "0.78rem", margin: 0 }}>
            {t("footerPoweredBy")}
          </p>
        </div>
      </footer>

      {/* ── Render Contact Modal ────────────────────────────── */}
      <AnimatePresence>
        {isContactOpen && (
          <ContactModal onClose={() => setIsContactOpen(false)} dir={dir} />
        )}
      </AnimatePresence>
    </>
  );
}

export default Footer;
