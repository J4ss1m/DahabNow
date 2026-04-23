/**
 * pages/guest/HomePage.jsx
 * Full homepage — assembles Header, HeroSlider, GoldPriceCard,
 * ShopGrid, ServicesHub, and Footer in order.
 *
 * The Header is fixed at 68px height so we add paddingTop to the content.
 * Reads the ?search= query param from the URL to pass into ShopGrid.
 */

import { useLocation, useNavigate }  from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage }  from "../../context/LanguageContext";
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
  const { currentUser } = useAuth();
  const dir          = language === "ar" ? "rtl" : "ltr";

  const params      = new URLSearchParams(location.search);
  const searchQuery = params.get("search") || "";

  const showShopBanner = currentUser && currentUser.role === "user" && !currentUser.shopApplied;

  return (
    <div style={{ backgroundColor: "#263238", minHeight: "100vh" }} dir={dir}>
      <Header />
      <div style={{ paddingTop: "68px" }}>
        {showShopBanner && (
          <div style={{
            backgroundColor: "rgba(212,175,55,0.1)",
            border: "1px solid rgba(212,175,55,0.3)",
            padding: "0.75rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}>
            <p style={{ color: "#FFFFFF", margin: 0, fontSize: "0.95rem" }}>
              🏪 {t("doYouHaveShop")}
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
      <ScrollToTopButton />
    </div>
  );
}

export default HomePage;
