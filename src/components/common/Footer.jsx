/**
 * components/common/Footer.jsx — Phase 7
 * Proper footer with logo, quick links, and tech credit.
 * Background: #1a2428  |  Gold top border  |  Fully responsive  |  RTL/LTR
 */

import { useTranslation } from "react-i18next";
import { useNavigate }    from "react-router-dom";
import { useLanguage }    from "../../context/LanguageContext";
import DahabNowLogo       from "./DahabNowLogo";

const GOLD = "#D4AF37";

function Footer() {
  const { t }        = useTranslation();
  const { language } = useLanguage();
  const navigate     = useNavigate();
  const dir          = language === "ar" ? "rtl" : "ltr";

  const links = [
    { label: t("footerHome"),     path: "/"         },
    { label: t("footerServices"), path: "/#services" },
    { label: t("footerLogin"),    path: "/login"     },
  ];

  return (
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
                onClick={() => navigate(l.path)}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontFamily: "'Tajawal', sans-serif", fontSize: "0.88rem", cursor: "pointer", textAlign: "start", padding: 0, transition: "color 0.18s" }}
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
  );
}

export default Footer;
