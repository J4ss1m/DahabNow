/**
 * components/header/Header.jsx
 * Fixed responsive header — fully integrated Phase 6:
 *   • SearchResults dropdown (debounced)
 *   • NotificationsPanel with unread dot
 *   • Location picker → URL params ?city=&area=
 *   • Favorites link, Account dropdown (role-based)
 *   • Language toggle, Mobile hamburger menu
 */

import { useState, useRef, useEffect }  from "react";
import { motion, AnimatePresence }       from "framer-motion";
import { useTranslation }                from "react-i18next";
import { useNavigate, useLocation }      from "react-router-dom";
import { useAuth }                       from "../../context/AuthContext";
import { useLanguage }                   from "../../context/LanguageContext";
import { useFavorites }                  from "../../context/FavoritesContext";
import { signOut }                       from "firebase/auth";
import { auth }                          from "../../firebase/config";
import DahabNowLogo                      from "../common/DahabNowLogo";
import SearchResults                     from "../common/SearchResults";
import NotificationsPanel, { BellButton } from "./NotificationsPanel";

/* ── Design tokens ───────────────────────────────────────────── */
const BG   = "#263238";
const CARD = "#455A64";
const GOLD = "#D4AF37";

/* ── Cities / Areas ──────────────────────────────────────────── */
const CITIES = ["Riyadh", "Jeddah", "Madinah", "Mecca", "Dammam"];
const CITY_AREAS = {
  Riyadh: ["Al Olaya","Al Malaz","Al Rahmaniyah","Al Murabba","Al Naseem"],
  Jeddah: ["Al Balad","Al Hamra","Al Rawdah","Al Safa","Al Andalus"],
  Madinah:["Al Haram","Quba","Al Aqiq","Al Aziziyah","Al Khalidiyah"],
  Mecca:  ["Al Haram","Ajyad","Al Aziziyah","Mina","Arafat"],
  Dammam: ["Al Faisaliyah","Al Shatea","Al Nuzha","Al Badia","Al Hamra"],
};

/* ── Account dropdown ─────────────────────────────────────────── */
function AccountDropdown({ currentUser, userProfile, dir, t, onClose }) {
  const navigate = useNavigate();
  const role = userProfile?.role;
  const items = [];
  if (role === "seller") items.push({ label: t("headerDashboard"), path: "/seller" });
  if (role === "admin")  items.push({ label: t("headerDashboard"), path: "/admin"  });
  items.push({ label: t("logout"), action: async () => { await signOut(auth); onClose(); navigate("/"); } });

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scaleY: 0.9 }} animate={{ opacity: 1, y: 0, scaleY: 1 }}
      exit={{ opacity: 0, y: -8, scaleY: 0.9 }} transition={{ duration: 0.18 }}
      style={{ position: "absolute", top: "calc(100% + 8px)", insetInlineEnd: 0, minWidth: "170px", backgroundColor: "#2d3f47", border: "1.5px solid rgba(212,175,55,0.3)", borderRadius: "12px", padding: "0.4rem 0", boxShadow: "0 8px 28px rgba(0,0,0,0.45)", zIndex: 1600, fontFamily: "'Tajawal', sans-serif" }}
      dir={dir}
    >
      <div style={{ padding: "0.5rem 1rem 0.4rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <p style={{ color: GOLD, fontSize: "0.82rem", fontWeight: 700, margin: 0 }}>{currentUser?.email}</p>
      </div>
      {items.map((item) => (
        <button key={item.label} onClick={() => { item.action ? item.action() : (navigate(item.path), onClose()); }}
          style={{ display: "block", width: "100%", padding: "0.6rem 1rem", background: "none", border: "none", color: "#FFFFFF", fontFamily: "'Tajawal', sans-serif", fontSize: "0.88rem", textAlign: "start", cursor: "pointer", transition: "background 0.15s" }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(212,175,55,0.1)"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
        >{item.label}</button>
      ))}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   HEADER
   ══════════════════════════════════════════════════════════════ */
function Header() {
  const { t }                      = useTranslation();
  const { language, toggleLanguage } = useLanguage();
  const { currentUser, userProfile } = useAuth();
  const { favorites }              = useFavorites();
  const navigate                   = useNavigate();
  const location                   = useLocation();
  const dir                        = language === "ar" ? "rtl" : "ltr";

  const [searchQ,      setSearchQ]      = useState("");
  const [showSearch,   setShowSearch]   = useState(false);
  const [showNotif,    setShowNotif]    = useState(false);
  const [showAccount,  setShowAccount]  = useState(false);
  const [showLocPicker,setShowLocPicker]= useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [notifUnread,  setNotifUnread]  = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);

  const searchRef  = useRef(null);
  const notifRef   = useRef(null);
  const accountRef = useRef(null);

  /* ── Parse URL params for location ───────────────────────── */
  const params = new URLSearchParams(location.search);
  const activeCity = params.get("city") || "";
  const activeArea = params.get("area") || "";

  /* ── Check unread notifications on mount ─────────────────── */
  useEffect(() => {
    const readAt = parseInt(localStorage.getItem("dahabnow_notif_readAt") || "0");
    setNotifUnread(Date.now() - readAt > 3600_000); // simplified: unread if >1h since last read
  }, []);

  /* ── Close dropdowns on outside click ────────────────────── */
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current  && !searchRef.current.contains(e.target))  setShowSearch(false);
      if (notifRef.current   && !notifRef.current.contains(e.target))   setShowNotif(false);
      if (accountRef.current && !accountRef.current.contains(e.target)) setShowAccount(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Location change → update URL ────────────────────────── */
  const setCity = (city) => {
    const p = new URLSearchParams();
    if (city) p.set("city", city);
    navigate({ pathname: "/", search: p.toString() });
    setShowLocPicker(false);
  };
  const setArea = (area) => {
    const p = new URLSearchParams();
    if (activeCity) p.set("city", activeCity);
    if (area) p.set("area", area);
    navigate({ pathname: "/", search: p.toString() });
    setShowLocPicker(false);
  };

  /* ── Search submit ───────────────────────────────────────── */
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQ.trim()) return;
    navigate({ pathname: "/", search: `?search=${encodeURIComponent(searchQ.trim())}` });
    setShowSearch(false);
  };

  const favCount = favorites.size;
  const isHome   = location.pathname === "/";
  const isDashboardPage = location.pathname.startsWith("/seller") || location.pathname.startsWith("/admin");

  useEffect(() => {
    if (isDashboardPage) {
      setHeaderVisible(true);
      return;
    }

    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setHeaderVisible(false);
      } else {
        setHeaderVisible(true);
      }
      lastScrollY = currentScrollY;
    };

    const handlePointerMove = (event) => {
      if (event.clientY <= 60) {
        setHeaderVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pointermove", handlePointerMove);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [isDashboardPage]);

  /* ── Shared icon button style ─────────────────────────────── */
  const iconBtn = { background: "none", border: "none", cursor: "pointer", padding: "4px 6px", color: "rgba(255,255,255,0.75)", fontSize: "1rem", display: "flex", alignItems: "center", gap: "4px", fontFamily: "'Tajawal', sans-serif", borderRadius: "8px", transition: "background 0.15s" };

  return (
    <>
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, height: "68px", backgroundColor: CARD, borderBottom: `1.5px solid rgba(212,175,55,0.3)`, zIndex: 1500, display: "flex", alignItems: "center", padding: "0 1rem", gap: "0.6rem", fontFamily: "'Tajawal', sans-serif", transform: headerVisible ? "translateY(0)" : "translateY(-100%)", transition: "transform 0.22s ease" }} dir={dir}>

        {/* Logo */}
        <button onClick={() => navigate("/")} style={{ ...iconBtn, gap: "8px", flexShrink: 0 }}>
          <DahabNowLogo size={30} />
          <span style={{ color: GOLD, fontWeight: 900, fontSize: "1.05rem", display: window.innerWidth < 400 ? "none" : "block" }}>DahabNow</span>
        </button>

        {/* Search bar (desktop) */}
        <div ref={searchRef} style={{ position: "relative", flex: 1, maxWidth: "380px", display: window.innerWidth < 640 ? "none" : "block" }}>
          <form onSubmit={handleSearchSubmit}>
            <input
              value={searchQ}
              onChange={(e) => { setSearchQ(e.target.value); setShowSearch(true); }}
              onFocus={() => setShowSearch(true)}
              placeholder={t("searchPlaceholder")}
              style={{ width: "100%", padding: "0.5rem 1rem 0.5rem 2.2rem", backgroundColor: "rgba(38,50,56,0.75)", border: "1.5px solid rgba(212,175,55,0.2)", borderRadius: "22px", color: "#FFFFFF", fontFamily: "'Tajawal', sans-serif", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
            />
            <span style={{ position: "absolute", top: "50%", insetInlineStart: "0.75rem", transform: "translateY(-50%)", fontSize: "0.85rem", opacity: 0.5, pointerEvents: "none" }}>🔍</span>
          </form>
          <AnimatePresence>
            {showSearch && searchQ.trim().length >= 2 && (
              <SearchResults query={searchQ} onClose={() => { setShowSearch(false); setSearchQ(""); }} />
            )}
          </AnimatePresence>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Language toggle */}
        <button onClick={toggleLanguage} style={{ ...iconBtn, fontSize: "0.82rem", fontWeight: 700, color: GOLD, border: `1px solid rgba(212,175,55,0.35)`, borderRadius: "20px", padding: "3px 12px" }}>
          {t("language")}
        </button>

        {userProfile?.role === "seller" && (
          <button onClick={() => navigate("/seller")} style={{ padding: "0.45rem 1rem", backgroundColor: "transparent", border: `1.5px solid ${GOLD}`, borderRadius: "20px", color: GOLD, fontFamily: "'Tajawal', sans-serif", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}>
            {t("headerMyDashboard")}
          </button>
        )}
        {userProfile?.role === "admin" && (
          <button onClick={() => navigate("/admin")} style={{ padding: "0.45rem 1rem", backgroundColor: "transparent", border: `1.5px solid ${GOLD}`, borderRadius: "20px", color: GOLD, fontFamily: "'Tajawal', sans-serif", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}>
            {t("headerAdminPanel")}
          </button>
        )}

        {/* Location (desktop) */}
        <div style={{ position: "relative", display: window.innerWidth < 900 ? "none" : "block" }}>
          <button onClick={() => setShowLocPicker((v) => !v)} style={{ ...iconBtn, fontSize: "0.82rem", color: activeCity ? GOLD : "rgba(255,255,255,0.65)" }}>
            📍 {activeCity || t("locationAll")}
          </button>
          <AnimatePresence>
            {showLocPicker && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                style={{ position: "absolute", top: "calc(100% + 8px)", insetInlineStart: 0, width: "200px", backgroundColor: "#2d3f47", border: "1.5px solid rgba(212,175,55,0.3)", borderRadius: "12px", padding: "0.4rem 0", boxShadow: "0 8px 28px rgba(0,0,0,0.45)", zIndex: 1600 }}
                dir={dir}
              >
                <button onClick={() => setCity("")} style={{ ...iconBtn, width: "100%", justifyContent: "flex-start", padding: "0.5rem 1rem", borderRadius: 0, color: !activeCity ? GOLD : "rgba(255,255,255,0.65)" }}>
                  {t("locationAll")}
                </button>
                {CITIES.map((c) => (
                  <div key={c}>
                    <button onClick={() => setCity(c)} style={{ ...iconBtn, width: "100%", justifyContent: "flex-start", padding: "0.5rem 1rem", borderRadius: 0, color: activeCity === c ? GOLD : "rgba(255,255,255,0.65)", fontWeight: activeCity === c ? 700 : 400 }}>
                      {c}
                    </button>
                    {activeCity === c && CITY_AREAS[c]?.map((a) => (
                      <button key={a} onClick={() => setArea(a)} style={{ ...iconBtn, width: "100%", justifyContent: "flex-start", padding: "0.35rem 1rem 0.35rem 1.75rem", borderRadius: 0, fontSize: "0.8rem", color: activeArea === a ? GOLD : "rgba(255,255,255,0.5)" }}>
                        {a}
                      </button>
                    ))}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications bell */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <BellButton hasUnread={notifUnread} onClick={() => { setShowNotif((v) => !v); setNotifUnread(false); }} />
          <AnimatePresence>
            {showNotif && <NotificationsPanel key="np" onClose={() => setShowNotif(false)} />}
          </AnimatePresence>
        </div>

        {/* Favorites */}
        <button onClick={() => navigate("/favorites")} style={{ ...iconBtn, position: "relative" }}>
          <span style={{ fontSize: "1.2rem" }}>❤️</span>
          {favCount > 0 && (
            <span style={{ position: "absolute", top: 0, insetInlineEnd: 0, backgroundColor: GOLD, color: "#263238", borderRadius: "50%", width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 800 }}>
              {favCount > 9 ? "9+" : favCount}
            </span>
          )}
        </button>

        {/* Account */}
        {currentUser ? (
          <div ref={accountRef} style={{ position: "relative" }}>
            <button onClick={() => setShowAccount((v) => !v)} style={{ ...iconBtn, backgroundColor: showAccount ? "rgba(212,175,55,0.1)" : "transparent" }}>
              <span style={{ fontSize: "1.2rem" }}>👤</span>
            </button>
            <AnimatePresence>
              {showAccount && (
                <AccountDropdown key="acc" currentUser={currentUser} userProfile={userProfile} dir={dir} t={t} onClose={() => setShowAccount(false)} />
              )}
            </AnimatePresence>
          </div>
        ) : (
          <button onClick={() => navigate("/login")} style={{ padding: "0.45rem 1.1rem", backgroundColor: "#FFD700", color: "#263238", border: "none", borderRadius: "20px", fontFamily: "'Tajawal', sans-serif", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}>
            {t("login")}
          </button>
        )}

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen((v) => !v)} style={{ ...iconBtn, display: window.innerWidth >= 640 ? "none" : "flex", fontSize: "1.2rem" }}>
          {mobileOpen ? "✕" : "☰"}
        </button>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ position: "fixed", top: "68px", left: 0, right: 0, backgroundColor: CARD, borderBottom: "1px solid rgba(212,175,55,0.2)", zIndex: 1400, padding: "0.75rem 1rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}
            dir={dir}
          >
            {/* Mobile search */}
            <div style={{ position: "relative" }}>
              <form onSubmit={(e) => { handleSearchSubmit(e); setMobileOpen(false); }}>
                <input value={searchQ} onChange={(e) => { setSearchQ(e.target.value); setShowSearch(true); }} onFocus={() => setShowSearch(true)} placeholder={t("searchPlaceholder")} style={{ width: "100%", padding: "0.55rem 1rem", backgroundColor: "rgba(38,50,56,0.75)", border: "1.5px solid rgba(212,175,55,0.2)", borderRadius: "22px", color: "#FFFFFF", fontFamily: "'Tajawal', sans-serif", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }} />
              </form>
              <AnimatePresence>
                {showSearch && searchQ.trim().length >= 2 && (
                  <SearchResults query={searchQ} onClose={() => { setShowSearch(false); setSearchQ(""); setMobileOpen(false); }} />
                )}
              </AnimatePresence>
            </div>
            {/* Mobile location */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button onClick={() => { setCity(""); setMobileOpen(false); }} style={{ padding: "0.35rem 0.8rem", borderRadius: "20px", border: "none", backgroundColor: !activeCity ? GOLD : "rgba(255,255,255,0.1)", color: !activeCity ? "#263238" : "#FFFFFF", fontFamily: "'Tajawal', sans-serif", fontSize: "0.8rem", cursor: "pointer" }}>
                {t("locationAll")}
              </button>
              {CITIES.map((c) => (
                <button key={c} onClick={() => { setCity(c); setMobileOpen(false); }} style={{ padding: "0.35rem 0.8rem", borderRadius: "20px", border: "none", backgroundColor: activeCity === c ? GOLD : "rgba(255,255,255,0.1)", color: activeCity === c ? "#263238" : "#FFFFFF", fontFamily: "'Tajawal', sans-serif", fontSize: "0.8rem", cursor: "pointer" }}>
                  {c}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Header;
