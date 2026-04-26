/**
 * pages/guest/HomePage.jsx
 * Full homepage — assembles Header, HeroSlider, GoldPriceCard,
 * ShopGrid, ServicesHub, and Footer in order.
 *
 * The Header is fixed at 68px height so we add paddingTop to the content.
 * Reads the ?search= query param from the URL to pass into ShopGrid.
 * Theme aware with floating particles animation.
 */

import { useLocation, useNavigate }  from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiShoppingBag } from "react-icons/fi";
import { useLanguage }  from "../../context/LanguageContext";
import { useTheme }     from "../../context/ThemeContext";
import { useAuth }      from "../../context/AuthContext";
import Header           from "../../components/header/Header";
import HeroSlider       from "../../components/home/HeroSlider";
import GoldPriceCard    from "../../components/home/GoldPriceCard";
import ShopGrid         from "../../components/home/ShopGrid";
import ServicesHub      from "../../components/home/ServicesHub";
import Footer           from "../../components/common/Footer";
import ScrollToTopButton from "../../components/common/ScrollToTopButton";

function HomePage() {
  const location     = useLocation();
  const navigate     = useNavigate();
  const { t }        = useTranslation();
  const { language } = useLanguage();
  const { theme }    = useTheme();
  const { currentUser } = useAuth();
  const dir          = language === "ar" ? "rtl" : "ltr";

  const params      = new URLSearchParams(location.search);
  const searchQuery = params.get("search") || "";

  const showShopBanner = currentUser && currentUser.role === "user" && !currentUser.shopApplied;

  // Theme-aware colors
  const bgColor = theme === "dark" ? "#263238" : "#F5F0E8";
  const goldColor = "#D4AF37";

  return (
    <div style={{ backgroundColor: bgColor, minHeight: "100vh", position: "relative", transition: "background-color 0.3s ease" }} dir={dir}>
      {/* Floating particles background */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: "4px",
              height: "4px",
              backgroundColor: "rgba(212, 175, 55, 0.3)",
              borderRadius: "50%",
              left: `${Math.random() * 100}%`,
              top: "100%",
              animation: `float-up ${15 + Math.random() * 10}s linear infinite`,
              opacity: 0.6,
              animationDelay: `${i * 1.5}s`,
            }}
          />
        ))}
      </div>

      {/* CSS Keyframe for floating animation */}
      <style>{`
        @keyframes float-up {
          0% {
            transform: translateY(0px);
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100vh);
            opacity: 0;
          }
        }
      `}</style>

      {/* Content wrapper with relative positioning */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <Header />
        <div style={{ paddingTop: "68px" }}>
        {showShopBanner && (
          <div style={{
            backgroundColor: theme === "dark" ? "rgba(212,175,55,0.1)" : "rgba(212,175,55,0.08)",
            border: "1px solid rgba(212,175,55,0.3)",
            padding: "0.75rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}>
            <p style={{ color: theme === "dark" ? "#FFFFFF" : "#263238", margin: 0, fontSize: "0.95rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
              <FiShoppingBag size={18} /> {t("doYouHaveShop")}
            </p>
            <button
              onClick={() => navigate("/register-shop")}
              style={{
                backgroundColor: "#FFD700",
                color: "#263238",
                border: "none",
                borderRadius: "8px",
                padding: "0.5rem 1.25rem",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Tajawal', sans-serif",
              }}
            >
              {t("registerMyShop")}
            </button>
          </div>
        )}
        <HeroSlider />
        <GoldPriceCard />
        <ShopGrid searchQuery={searchQuery} />
        <ServicesHub />
        <Footer />
        </div>
      </div>
      <ScrollToTopButton />
    </div>
  );
}

export default HomePage;
