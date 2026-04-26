/**
 * pages/seller/SellerDashboard.jsx
 * Main seller dashboard — sidebar navigation + content area.
 *
 * Access flow:
 *   1. Must be role=seller (enforced by ProtectedRoute)
 *   2. If isApproved=false → show ApprovalStatus
 *   3. If isApproved=true  → show full dashboard
 *
 * Fetches the seller's shop once and passes it down to all tabs.
 *
 * Firestore Security Rules reference (apply in Firebase console):
 * ──────────────────────────────────────────────────────────────
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *
 *     // users — owner only
 *     match /users/{uid} {
 *       allow read, write: if request.auth.uid == uid;
 *     }
 *
 *     // shops — public read, owner write
 *     match /shops/{shopId} {
 *       allow read: if true;
 *       allow write: if request.auth != null
 *         && resource.data.sellerId == request.auth.uid;
 *     }
 *
 *     // products — public read, owner seller write
 *     match /products/{productId} {
 *       allow read: if true;
 *       allow write: if request.auth != null
 *         && request.resource.data.sellerId == request.auth.uid;
 *     }
 *
 *     // adRequests — owner + admin only
 *     match /adRequests/{reqId} {
 *       allow read, write: if request.auth != null
 *         && (resource.data.sellerId == request.auth.uid
 *             || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
 *     }
 *
 *     // notifications — recipient only
 *     match /notifications/{nId} {
 *       allow read, write: if request.auth != null
 *         && resource.data.recipientId == request.auth.uid;
 *     }
 *   }
 * }
 * ──────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation }      from "react-i18next";
import { useNavigate }        from "react-router-dom";
import { FiHome, FiShoppingBag, FiStar, FiPlus, FiBell, FiSettings } from "react-icons/fi";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db }                  from "../../firebase/config";
import { useAuth }             from "../../context/AuthContext";
import { useLanguage }         from "../../context/LanguageContext";

// Components
import ApprovalStatus   from "../../components/seller/ApprovalStatus";
import MyShop           from "../../components/seller/MyShop";
import MyProducts       from "../../components/seller/MyProducts";
import AddProduct       from "../../components/seller/AddProduct";
import AdRequest        from "../../components/seller/AdRequest";
import AccountSettings  from "../../components/seller/AccountSettings";
import GoldSpinner      from "../../components/common/GoldSpinner";
import DahabNowLogo     from "../../components/common/DahabNowLogo";
import ScrollToTopButton from "../../components/common/ScrollToTopButton";

/* ── Sidebar nav items ───────────────────────────────────────── */
const TABS = [
  { id: "myShop",           icon: <FiShoppingBag size={18} />, key: "tabMyShop"          },
  { id: "myProducts",       icon: <FiStar size={18} />, key: "tabMyProducts"       },
  { id: "addProduct",       icon: <FiPlus size={18} />, key: "tabAddProduct"       },
  { id: "adRequests",       icon: <FiBell size={18} />, key: "tabAdRequests"       },
  { id: "accountSettings",  icon: <FiSettings size={18} />, key: "tabAccountSettings"  },
];

/* ── Colours ─────────────────────────────────────────────────── */
const BG    = "#263238";
const CARD  = "#455A64";
const GOLD  = "#D4AF37";
const WHITE = "#FFFFFF";

const SIDEBAR_W = 220; // px desktop

/* ── Sidebar ──────────────────────────────────────────────────  */
function Sidebar({ activeTab, onSelect, dir }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <aside style={{
      width:           `${SIDEBAR_W}px`,
      flexShrink:      0,
      backgroundColor: CARD,
      borderInlineEnd: `1px solid rgba(212,175,55,0.2)`,
      display:         "flex",
      flexDirection:   "column",
      padding:         "1.5rem 0",
      fontFamily:      "'Tajawal', sans-serif",
      minHeight:       "100%",
    }}>
      {/* Logo */}
      <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 1.25rem 1.5rem", background: "none", border: "none", color: "inherit", cursor: "pointer" }}>
        <DahabNowLogo size={28} />
        <span style={{ color: GOLD, fontWeight: 800, fontSize: "0.95rem" }}>DahabNow</span>
      </button>
      <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: "8px", margin: "0 1.25rem 1rem", padding: "0.65rem 0.85rem", backgroundColor: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.25)", borderRadius: "14px", color: GOLD, fontWeight: 700, cursor: "pointer", fontFamily: "'Tajawal', sans-serif" }}>
        <FiHome size={18} /> {t("headerHome")}
      </button>

      {/* Label */}
      <p style={{
        fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.4)",
        letterSpacing: "0.1em", textTransform: "uppercase",
        padding: "0 1.25rem", marginBottom: "0.5rem",
      }}>
        {t("sellerDashboard")}
      </p>

      {/* Nav items */}
      <nav style={{ flex: 1 }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelect(tab.id)}
              style={{
                width:           "100%",
                display:         "flex",
                alignItems:      "center",
                gap:             "10px",
                padding:         "0.7rem 1.25rem",
                background:      isActive ? "rgba(212,175,55,0.12)" : "none",
                border:          "none",
                borderInlineStart: isActive ? `3px solid ${GOLD}` : "3px solid transparent",
                color:           isActive ? GOLD : "rgba(255,255,255,0.65)",
                fontFamily:      "'Tajawal', sans-serif",
                fontSize:        "0.9rem",
                fontWeight:      isActive ? 700 : 500,
                cursor:          "pointer",
                textAlign:       "start",
                transition:      "background 0.18s, color 0.18s",
              }}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = WHITE; } }}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; } }}
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
    <div style={{
      display:         "flex",
      overflowX:       "auto",
      backgroundColor: CARD,
      borderBottom:    `1px solid rgba(212,175,55,0.2)`,
      padding:         "0.25rem 0",
      fontFamily:      "'Tajawal', sans-serif",
      scrollbarWidth:  "none",
    }}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            style={{
              flexShrink: 0,
              display:    "flex",
              flexDirection: "column",
              alignItems: "center",
              gap:        "2px",
              padding:    "0.5rem 0.9rem",
              background: "none",
              border:     "none",
              borderBottom: isActive ? `2px solid ${GOLD}` : "2px solid transparent",
              color:      isActive ? GOLD : "rgba(255,255,255,0.55)",
              fontFamily: "'Tajawal', sans-serif",
              fontSize:   "0.72rem",
              fontWeight: isActive ? 700 : 400,
              cursor:     "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>{tab.icon}</span>
            {t(tab.key)}
          </button>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SELLER DASHBOARD
   ══════════════════════════════════════════════════════════════ */
function SellerDashboard() {
  const { currentUser, userProfile, isApproved, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const dir          = language === "ar" ? "rtl" : "ltr";

  const [activeTab, setActiveTab] = useState("myShop");
  const [shop,      setShop]      = useState(null);
  const [shopId,    setShopId]    = useState(null);
  const [shopLoading, setShopLoading] = useState(true);
  const [isMobile,  setIsMobile]  = useState(window.innerWidth < 768);

  // Responsive
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Fetch seller's shop once
  useEffect(() => {
    if (!currentUser || !isApproved) { setShopLoading(false); return; }
    const fetchShop = async () => {
      setShopLoading(true);
      try {
        const q    = query(collection(db, "shops"), where("sellerId", "==", currentUser.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setShopId(snap.docs[0].id);
          setShop(snap.docs[0].data());
        }
      } catch (e) {
        console.error("[SellerDashboard] fetchShop:", e);
      } finally {
        setShopLoading(false);
      }
    };
    fetchShop();
  }, [currentUser, isApproved]);

  // Auth still loading
  if (authLoading) return <GoldSpinner fullScreen />;

  // Not approved — show status screen
  if (!isApproved) return <ApprovalStatus />;

  // Shop data still loading
  if (shopLoading) return <GoldSpinner fullScreen />;

  /* ── Tab content ─────────────────────────────────────────── */
  const renderTab = () => {
    switch (activeTab) {
      case "myShop":
        return <MyShop shop={shop} shopId={shopId} />;
      case "myProducts":
        return <MyProducts shopId={shopId} currentUser={currentUser} />;
      case "addProduct":
        return <AddProduct shopId={shopId} currentUser={currentUser} />;
      case "adRequests":
        return <AdRequest shop={shop} shopId={shopId} currentUser={currentUser} />;
      case "accountSettings":
        return <AccountSettings currentUser={currentUser} userProfile={userProfile} />;
      default:
        return null;
    }
  };

  /* ── Layout ──────────────────────────────────────────────── */
  return (
    <div
      style={{
        minHeight:       "100vh",
        backgroundColor: BG,
        fontFamily:      "'Tajawal', sans-serif",
        display:         "flex",
        flexDirection:   "column",
      }}
      dir={dir}
    >
      {/* ── Top bar ───────────────────────────────────────── */}
      <header style={{
        height:          "56px",
        backgroundColor: CARD,
        borderBottom:    `1.5px solid ${GOLD}`,
        display:         "flex",
        alignItems:      "center",
        padding:         "0 1.25rem",
        gap:             "12px",
        flexShrink:      0,
      }}>
        {isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <DahabNowLogo size={26} />
            <span style={{ color: GOLD, fontWeight: 800, fontSize: "0.9rem" }}>DahabNow</span>
          </div>
        )}
        <span style={{
          fontSize:    "0.88rem",
          fontWeight:  600,
          color:       "rgba(255,255,255,0.55)",
          marginInlineStart: "auto",
        }}>
          👤 {userProfile?.accountName || currentUser?.email}
        </span>
      </header>

      {/* ── Mobile tab bar ────────────────────────────────── */}
      {isMobile && (
        <MobileTabBar activeTab={activeTab} onSelect={setActiveTab} />
      )}

      {/* ── Body: sidebar + content ───────────────────────── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Sidebar (desktop only) */}
        {!isMobile && (
          <motion.div
            initial={{ x: dir === "rtl" ? 30 : -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.35 }}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <Sidebar activeTab={activeTab} onSelect={setActiveTab} dir={dir} />
          </motion.div>
        )}

        {/* Main content */}
        <main style={{
          flex:       1,
          overflowY:  "auto",
          padding:    isMobile ? "1.25rem 1rem" : "2rem 2rem",
          minWidth:   0,
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <ScrollToTopButton />
    </div>
  );
}

export default SellerDashboard;
