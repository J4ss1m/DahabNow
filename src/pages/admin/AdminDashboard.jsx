/**
 * pages/admin/AdminDashboard.jsx
 * Full admin dashboard with sidebar + mobile tabs.
 * Role guard: redirects non-admins to /.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation }      from "react-i18next";
import { useNavigate }         from "react-router-dom";
import { FiHome, FiClipboard, FiShoppingBag, FiFileText, FiMegaphone, FiBarChart2 } from "react-icons/fi";
import { useAuth }             from "../../context/AuthContext";
import { useLanguage }         from "../../context/LanguageContext";
import VerificationQueue       from "../../components/admin/VerificationQueue";
import ShopManagement          from "../../components/admin/ShopManagement";
import ContentManagement       from "../../components/admin/ContentManagement";
import AdRequestsManagement    from "../../components/admin/AdRequestsManagement";
import PlatformStats           from "../../components/admin/PlatformStats";
import GoldSpinner             from "../../components/common/GoldSpinner";
import DahabNowLogo            from "../../components/common/DahabNowLogo";
import ScrollToTopButton        from "../../components/common/ScrollToTopButton";

const TABS = [
  { id: "verif",   icon: <FiClipboard size={18} />, key: "tabVerificationQueue" },
  { id: "shops",   icon: <FiShoppingBag size={18} />, key: "tabShopManagement"    },
  { id: "content", icon: <FiFileText size={18} />, key: "tabContentManagement" },
  { id: "ads",     icon: <FiMegaphone size={18} />, key: "tabAdRequestsMgmt"    },
  { id: "stats",   icon: <FiBarChart2 size={18} />, key: "tabPlatformStats"     },
];

const BG   = "#263238";
const CARD = "#455A64";
const GOLD = "#D4AF37";

/* ── Sidebar ─────────────────────────────────────────────────── */
function Sidebar({ activeTab, onSelect, dir }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <aside style={{ width: "220px", flexShrink: 0, backgroundColor: CARD, borderInlineEnd: "1px solid rgba(212,175,55,0.2)", display: "flex", flexDirection: "column", padding: "1.5rem 0", fontFamily: "'Tajawal', sans-serif", minHeight: "100%" }}>
      <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 1.25rem 1.5rem", background: "none", border: "none", color: "inherit", cursor: "pointer" }}>
        <DahabNowLogo size={28} />
        <span style={{ color: GOLD, fontWeight: 800, fontSize: "0.95rem" }}>DahabNow</span>
      </button>
      <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: "8px", margin: "0 1.25rem 1rem", padding: "0.65rem 0.85rem", backgroundColor: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.25)", borderRadius: "14px", color: GOLD, fontWeight: 700, cursor: "pointer", fontFamily: "'Tajawal', sans-serif" }}>
        <FiHome size={18} /> {t("headerHome")}
      </button>
      <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 1.25rem", marginBottom: "0.5rem" }}>
        {t("adminDashboard")}
      </p>
      <nav style={{ flex: 1 }}>
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => onSelect(tab.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "0.7rem 1.25rem", background: active ? "rgba(212,175,55,0.12)" : "none", border: "none", borderInlineStart: active ? `3px solid ${GOLD}` : "3px solid transparent", color: active ? GOLD : "rgba(255,255,255,0.65)", fontFamily: "'Tajawal', sans-serif", fontSize: "0.9rem", fontWeight: active ? 700 : 500, cursor: "pointer", textAlign: "start", transition: "all 0.18s" }}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#FFFFFF"; } }}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; } }}
            >
              <span style={{ fontSize: "1rem" }}>{tab.icon}</span>
              {t(tab.key)}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

/* ── Mobile tab bar ──────────────────────────────────────────── */
function MobileTabBar({ activeTab, onSelect }) {
  const { t } = useTranslation();
  return (
    <div style={{ display: "flex", overflowX: "auto", backgroundColor: CARD, borderBottom: "1px solid rgba(212,175,55,0.2)", scrollbarWidth: "none" }}>
      {TABS.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button key={tab.id} onClick={() => onSelect(tab.id)} style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", padding: "0.5rem 0.85rem", background: "none", border: "none", borderBottom: active ? `2px solid ${GOLD}` : "2px solid transparent", color: active ? GOLD : "rgba(255,255,255,0.55)", fontFamily: "'Tajawal', sans-serif", fontSize: "0.7rem", fontWeight: active ? 700 : 400, cursor: "pointer", whiteSpace: "nowrap" }}>
            <span style={{ fontSize: "1rem" }}>{tab.icon}</span>
            {t(tab.key)}
          </button>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ADMIN DASHBOARD
   ══════════════════════════════════════════════════════════════ */
function AdminDashboard() {
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const { language }  = useLanguage();
  const { t }         = useTranslation();
  const navigate      = useNavigate();
  const dir           = language === "ar" ? "rtl" : "ltr";

  const [activeTab, setActiveTab] = useState("verif");
  const [isMobile,  setIsMobile]  = useState(window.innerWidth < 768);

  // Responsive
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // Role guard
  useEffect(() => {
    if (!authLoading && userProfile && userProfile.role !== "admin") {
      navigate("/", { replace: true });
    }
  }, [authLoading, userProfile, navigate]);

  if (authLoading) return <GoldSpinner fullScreen />;

  const renderTab = () => {
    switch (activeTab) {
      case "verif":   return <VerificationQueue />;
      case "shops":   return <ShopManagement />;
      case "content": return <ContentManagement />;
      case "ads":     return <AdRequestsManagement />;
      case "stats":   return <PlatformStats />;
      default:        return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, fontFamily: "'Tajawal', sans-serif", display: "flex", flexDirection: "column" }} dir={dir}>
      {/* Top bar */}
      <header style={{ height: "56px", backgroundColor: CARD, borderBottom: `1.5px solid ${GOLD}`, display: "flex", alignItems: "center", padding: "0 1.25rem", gap: "12px", flexShrink: 0 }}>
        {isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <DahabNowLogo size={26} />
            <span style={{ color: GOLD, fontWeight: 800, fontSize: "0.9rem" }}>DahabNow</span>
          </div>
        )}
        <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "rgba(255,255,255,0.55)", marginInlineStart: "auto" }}>
          🛡️ {t("adminDashboard")} — {userProfile?.accountName || currentUser?.email}
        </span>
      </header>

      {isMobile && <MobileTabBar activeTab={activeTab} onSelect={setActiveTab} />}

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar desktop */}
        {!isMobile && (
          <motion.div initial={{ x: dir === "rtl" ? 30 : -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.35 }} style={{ display: "flex", flexDirection: "column" }}>
            <Sidebar activeTab={activeTab} onSelect={setActiveTab} dir={dir} />
          </motion.div>
        )}

        {/* Main content */}
        <main style={{ flex: 1, overflowY: "auto", padding: isMobile ? "1.25rem 1rem" : "2rem", minWidth: 0 }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <ScrollToTopButton />
    </div>
  );
}

export default AdminDashboard;
