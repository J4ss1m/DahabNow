import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const overlay = { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.72)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1300, padding: "1.25rem" };
const modal = { width: "100%", maxWidth: "480px", backgroundColor: "#455A64", borderRadius: "18px", padding: "2rem", boxShadow: "0 18px 48px rgba(0,0,0,0.45)", position: "relative", color: "#FFFFFF", fontFamily: "'Tajawal',sans-serif", maxHeight: "85vh", overflowY: "auto" };
const input = { width: "100%", padding: "0.95rem 1rem", borderRadius: "12px", border: "1px solid rgba(212,175,55,0.3)", backgroundColor: "rgba(255,255,255,0.06)", color: "#FFFFFF", outline: "none", fontSize: "0.95rem", marginBottom: "1rem" };
const button = { width: "100%", padding: "0.95rem", borderRadius: "12px", border: "none", backgroundColor: "#FFD700", color: "#263238", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem" };

function CreatePortfolioModal({ onClose, onCreate }) {
  const { t } = useTranslation();
  const [portfolioName, setPortfolioName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!portfolioName.trim()) {
      setError(t("errorRequiredField"));
      return;
    }

    onCreate(portfolioName.trim());
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
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#D4AF37", margin: "0 0 1rem" }}>{t("portfolioCreate")}</h2>
        <input
          type="text"
          value={portfolioName}
          onChange={(e) => { setPortfolioName(e.target.value); setError(""); }}
          placeholder={t("portfolioName")}
          style={input}
        />
        {error && <p style={{ color: "#F87171", margin: "0 0 1rem", fontSize: "0.9rem" }}>{error}</p>}
        <button style={button} onClick={handleSubmit}>{t("portfolioCreate2")}</button>
      </motion.div>
    </div>
  );
}

export default CreatePortfolioModal;
