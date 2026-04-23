/**
 * pages/guest/HomePage.jsx
 * Full homepage — assembles Header, HeroSlider, GoldPriceCard,
 * ShopGrid, ServicesHub, and Footer in order.
 *
 * The Header is fixed at 68px height so we add paddingTop to the content.
 * Reads the ?search= query param from the URL to pass into ShopGrid.
 */

import { useLocation }  from "react-router-dom";
import { useLanguage }  from "../../context/LanguageContext";
import Header           from "../../components/header/Header";
import HeroSlider       from "../../components/home/HeroSlider";
import GoldPriceCard    from "../../components/home/GoldPriceCard";
import ShopGrid         from "../../components/home/ShopGrid";
import ServicesHub      from "../../components/home/ServicesHub";
import Footer           from "../../components/common/Footer";
import ScrollToTopButton from "../../components/common/ScrollToTopButton";

function HomePage() {
  const location     = useLocation();
  const { language } = useLanguage();
  const dir          = language === "ar" ? "rtl" : "ltr";

  const params      = new URLSearchParams(location.search);
  const searchQuery = params.get("search") || "";

  return (
    <div style={{ backgroundColor: "#263238", minHeight: "100vh" }} dir={dir}>
      <Header />
      <div style={{ paddingTop: "68px" }}>
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
