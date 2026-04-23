import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";
import Header from "../../components/header/Header";
import ScrollToTopButton from "../../components/common/ScrollToTopButton";
import CreatePortfolioModal from "../../components/portfolio/CreatePortfolioModal";
import AddItemModal from "../../components/portfolio/AddItemModal";
import PortfolioCard from "../../components/portfolio/PortfolioCard";
import { usePortfolios } from "../../hooks/usePortfolios";
import { useLiveGoldPrice } from "../../hooks/useLiveGoldPrice";
import GoldSpinner from "../../components/common/GoldSpinner";

function PortfolioPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const dir = language === "ar" ? "rtl" : "ltr";
  const { portfolios, loading, createPortfolio, deletePortfolio, addItem, deleteItem } = usePortfolios();
  const { prices } = useLiveGoldPrice();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activePortfolioId, setActivePortfolioId] = useState(null);

  const livePrices = prices ?? { 24: 0, 22: 0, 21: 0, 18: 0 };

  const handleCreate = async (portfolioName) => {
    await createPortfolio(portfolioName);
  };

  const handleAddItem = async (portfolioId, item) => {
    await addItem(portfolioId, item);
    setActivePortfolioId(null);
  };

  const handleCloseAddItem = () => {
    setActivePortfolioId(null);
  };

  return (
    <div style={{ backgroundColor: "#263238", minHeight: "100vh", fontFamily: "'Tajawal',sans-serif" }} dir={dir}>
      <Header />
      <div style={{ paddingTop: "88px", maxWidth: "1000px", margin: "0 auto", padding: "88px 1.5rem 3rem" }}>
        <div style={{ marginBottom: "2rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 800, color: "#D4AF37", margin: 0 }}>{t("portfolioTitle")}</h1>
            <p style={{ color: "rgba(255,255,255,0.65)", margin: "0.65rem 0 0", maxWidth: "720px", lineHeight: 1.7 }}>{t("portfolioSubtitle")}</p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            style={{ backgroundColor: "#FFD700", color: "#263238", border: "none", borderRadius: "14px", padding: "0.95rem 1.5rem", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem" }}
          >
            {t("portfolioCreate")}
          </button>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
            <GoldSpinner fullScreen={false} size={56} />
          </div>
        ) : portfolios.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: "center", padding: "4rem 1rem", color: "#FFFFFF" }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🥇</div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 0.75rem" }}>{t("portfolioEmpty")}</h2>
            <p style={{ color: "rgba(255,255,255,0.6)", margin: "0 0 1.5rem", lineHeight: 1.7 }}>{t("portfolioEmptyDesc")}</p>
            <button
              onClick={() => setIsCreateOpen(true)}
              style={{ backgroundColor: "#FFD700", color: "#263238", border: "none", borderRadius: "14px", padding: "0.95rem 1.5rem", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem" }}
            >
              {t("portfolioCreate")}
            </button>
          </motion.div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem" }}>
            {portfolios.map((portfolio) => (
              <PortfolioCard
                key={portfolio.portfolioId}
                portfolio={portfolio}
                livePrices={livePrices}
                onAddItem={() => setActivePortfolioId(portfolio.portfolioId)}
                onDeletePortfolio={deletePortfolio}
                onDeleteItem={deleteItem}
              />
            ))}
          </div>
        )}
      </div>

      <ScrollToTopButton />

      {isCreateOpen && (
        <CreatePortfolioModal
          onClose={() => setIsCreateOpen(false)}
          onCreate={handleCreate}
        />
      )}

      {activePortfolioId && (
        <AddItemModal
          onClose={handleCloseAddItem}
          onAdd={handleAddItem}
          portfolioId={activePortfolioId}
          livePrices={livePrices}
          portfolioName={portfolios.find((p) => p.portfolioId === activePortfolioId)?.portfolioName || ""}
        />
      )}
    </div>
  );
}

export default PortfolioPage;
