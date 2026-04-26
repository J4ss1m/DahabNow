import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FiTrash2 } from "react-icons/fi";
import { useTranslation } from "react-i18next";

const CARD = "#455A64";
const GOLD = "#D4AF37";
const WHITE = "#FFFFFF";

const calculateValue = (weight, karat, livePrices) => {
  const pricePerGram = livePrices?.[karat] || 0;
  return weight * pricePerGram;
};

function PortfolioCard({ portfolio, livePrices, onAddItem, onDeletePortfolio, onDeleteItem }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const items = portfolio.items || [];

  const totals = useMemo(() => {
    const totalsByKarat = { 18: { weight: 0, value: 0 }, 21: { weight: 0, value: 0 }, 22: { weight: 0, value: 0 }, 24: { weight: 0, value: 0 } };
    items.forEach((item) => {
      const itemValue = calculateValue(item.weight, item.karat, livePrices);
      totalsByKarat[item.karat].weight += item.weight;
      totalsByKarat[item.karat].value += itemValue;
    });
    return totalsByKarat;
  }, [items, livePrices]);

  const grandTotal = useMemo(
    () => items.reduce((sum, item) => sum + calculateValue(item.weight, item.karat, livePrices), 0),
    [items, livePrices]
  );

  const handleDeletePortfolio = () => {
    if (window.confirm(t("portfolioDeleteConfirm"))) {
      onDeletePortfolio(portfolio.portfolioId);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      style={{ backgroundColor: CARD, borderRadius: "18px", border: "1px solid rgba(212,175,55,0.2)", padding: "1.5rem", color: WHITE, fontFamily: "'Tajawal',sans-serif", boxShadow: "0 18px 40px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <p style={{ color: GOLD, fontSize: "0.95rem", fontWeight: 700, margin: "0 0 0.35rem" }}>{portfolio.portfolioName}</p>
          <p style={{ color: "rgba(255,255,255,0.65)", margin: 0 }}>{items.length} {t("portfolioItems")}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.65)", margin: "0 0 0.35rem" }}>{t("portfolioGrandTotal")}</p>
          <p style={{ fontSize: "1.35rem", fontWeight: 800, color: GOLD, margin: 0 }}>{grandTotal.toFixed(2)} SAR</p>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
        <button onClick={() => setExpanded((prev) => !prev)} style={{ flex: "1 1 160px", backgroundColor: "rgba(255,255,255,0.08)", color: WHITE, border: "1px solid rgba(255,255,255,0.12)", borderRadius: "12px", padding: "0.85rem 1rem", cursor: "pointer", fontWeight: 700 }}>
          {expanded ? t("portfolioCollapse") : t("portfolioExpand")}
        </button>
        <button onClick={() => onAddItem(portfolio.portfolioId)} style={{ flex: "1 1 160px", backgroundColor: "#FFD700", color: "#263238", border: "none", borderRadius: "12px", padding: "0.85rem 1rem", cursor: "pointer", fontWeight: 700 }}>
          {t("portfolioAddItem")}
        </button>
        <button onClick={handleDeletePortfolio} style={{ flex: "1 1 160px", backgroundColor: "rgba(239,68,68,0.12)", color: "#FCA5A5", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "12px", padding: "0.85rem 1rem", cursor: "pointer", fontWeight: 700 }}>
          {t("portfolioDelete")}
        </button>
      </div>

      {expanded && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "520px" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "rgba(255,255,255,0.55)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <th style={{ padding: "0.8rem 0" }}>{t("portfolioItemName")}</th>
                  <th style={{ padding: "0.8rem 0" }}>{t("portfolioKarat")}</th>
                  <th style={{ padding: "0.8rem 0" }}>{t("portfolioWeight")}</th>
                  <th style={{ padding: "0.8rem 0" }}>{t("portfolioEstimatedValue")}</th>
                  <th style={{ padding: "0.8rem 0" }}> </th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: "1rem 0", color: "rgba(255,255,255,0.55)" }}>{t("portfolioNoItems")}</td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const value = calculateValue(item.weight, item.karat, livePrices);
                    return (
                      <tr key={item.itemId} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                        <td style={{ padding: "0.85rem 0", color: WHITE }}>{item.itemName}</td>
                        <td style={{ padding: "0.85rem 0", color: "rgba(255,255,255,0.75)" }}>{item.karat}K</td>
                        <td style={{ padding: "0.85rem 0", color: "rgba(255,255,255,0.75)" }}>{item.weight.toFixed(2)}g</td>
                        <td style={{ padding: "0.85rem 0", color: "rgba(255,255,255,0.75)" }}>{value.toFixed(2)} SAR</td>
                        <td style={{ padding: "0.85rem 0" }}>
                          <button onClick={() => onDeleteItem(portfolio.portfolioId, item.itemId)} style={{ backgroundColor: "rgba(239,68,68,0.12)", color: "#FCA5A5", border: "none", borderRadius: "10px", padding: "0.45rem 0.75rem", cursor: "pointer", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                            <FiTrash2 size="1rem" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1rem" }}>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.9rem", margin: "0 0 0.8rem" }}>{t("portfolioTotalPerKarat")}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem" }}>
              {Object.entries(totals).map(([karat, summary]) => (
                <div key={karat} style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "14px", padding: "0.85rem" }}>
                  <p style={{ color: "rgba(255,255,255,0.55)", margin: 0, fontSize: "0.82rem" }}>{karat}K</p>
                  <p style={{ color: WHITE, fontWeight: 700, margin: "0.4rem 0 0" }}>{summary.weight.toFixed(2)}g</p>
                  <p style={{ color: GOLD, margin: "0.4rem 0 0", fontWeight: 700 }}>{summary.value.toFixed(2)} SAR</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.95rem" }}>{t("portfolioGrandTotal")}</span>
              <span style={{ color: GOLD, fontWeight: 900, fontSize: "1.4rem" }}>{grandTotal.toFixed(2)} SAR</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default PortfolioCard;
