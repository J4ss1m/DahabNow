import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const overlay = { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.72)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1300, padding: "1.25rem" };
const modal = { width: "100%", maxWidth: "520px", backgroundColor: "#455A64", borderRadius: "18px", padding: "2rem", boxShadow: "0 18px 48px rgba(0,0,0,0.45)", position: "relative", color: "#FFFFFF", fontFamily: "'Tajawal',sans-serif" };
const input = { width: "100%", padding: "0.95rem 1rem", borderRadius: "12px", border: "1px solid rgba(212,175,55,0.3)", backgroundColor: "rgba(255,255,255,0.06)", color: "#FFFFFF", outline: "none", fontSize: "0.95rem", marginBottom: "1rem" };
const button = { width: "100%", padding: "0.95rem", borderRadius: "12px", border: "none", backgroundColor: "#FFD700", color: "#263238", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem" };

const calculateValue = (weight, karat, livePrices) => {
  const pricePerGram = livePrices?.[karat] || 0;
  return weight * pricePerGram;
};

function AddItemModal({ onClose, onAdd, portfolioName, livePrices, portfolioId }) {
  const { t } = useTranslation();
  const [itemName, setItemName] = useState("");
  const [karat, setKarat] = useState("24");
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");

  const estimatedValue = useMemo(() => {
    const parsedWeight = parseFloat(weight);
    if (!parsedWeight || isNaN(parsedWeight)) return 0;
    return calculateValue(parsedWeight, Number(karat), livePrices);
  }, [karat, livePrices, weight]);

  const handleSubmit = () => {
    if (!itemName.trim() || !weight || Number(weight) <= 0) {
      setError(t("errorRequiredField"));
      return;
    }

    onAdd(portfolioId, {
      itemName: itemName.trim(),
      karat: Number(karat),
      weight: Number(weight),
    });
    onClose();
  };

  return (
    <div style={overlay} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.22 }}
        style={modal}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", color: "rgba(255,255,255,0.65)", fontSize: "1.2rem", cursor: "pointer" }}>✕</button>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#D4AF37", margin: "0 0 1rem" }}>{t("portfolioAddItem")}</h2>
        <p style={{ color: "rgba(255,255,255,0.65)", marginBottom: "1rem" }}>{portfolioName}</p>
        <input
          type="text"
          value={itemName}
          onChange={(e) => { setItemName(e.target.value); setError(""); }}
          placeholder={t("portfolioItemName")}
          style={input}
        />
        <select value={karat} onChange={(e) => setKarat(e.target.value)} style={input}>
          <option value="24">24K</option>
          <option value="22">22K</option>
          <option value="21">21K</option>
          <option value="18">18K</option>
        </select>
        <input
          type="number"
          min="0"
          step="0.01"
          value={weight}
          onChange={(e) => { setWeight(e.target.value); setError(""); }}
          placeholder={t("portfolioWeight")}
          style={input}
        />
        <div style={{ marginBottom: "1rem", color: "rgba(255,255,255,0.65)", fontSize: "0.95rem" }}>
          {t("portfolioEstimatedValue")}: <strong>{estimatedValue.toFixed(2)} SAR</strong>
        </div>
        {error && <p style={{ color: "#F87171", margin: "0 0 1rem", fontSize: "0.9rem" }}>{error}</p>}
        <button style={button} onClick={handleSubmit}>{t("portfolioAddItem")}</button>
      </motion.div>
    </div>
  );
}

export default AddItemModal;
