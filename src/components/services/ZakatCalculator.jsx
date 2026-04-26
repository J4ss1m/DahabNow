import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

/* ── Constants ── */
const NISAB_BY_KARAT = { 24: 85, 22: 92.7, 21: 97.1, 18: 113.3 };
const PRICE_24K = 568.14;
const ZAKAT_RATE = 0.025;

/* ── Styles ── */
const BG = "#263238", CARD = "#455A64", GOLD = "#D4AF37", CTA = "#FFD700", WHITE = "#FFFFFF";
const overlay = { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.72)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200, padding: "1.25rem" };
const modal = { backgroundColor: "#2d3f47", borderRadius: "18px", border: "1.5px solid rgba(212,175,55,0.4)", padding: "2rem", width: "100%", minHeight: "450px", boxShadow: "0 16px 56px rgba(0,0,0,0.6)", fontFamily: "'Tajawal',sans-serif", position: "relative", maxHeight: "85vh", overflowY: "auto" };
const closeBtn = { position: "absolute", top: "1rem", insetInlineEnd: "1rem", background: "none", border: "none", color: "rgba(255,255,255,0.55)", fontSize: "1.2rem", cursor: "pointer", padding: "4px 8px", borderRadius: "6px" };
const LBL = { display: "block", fontSize: "0.88rem", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "0.35rem" };
const INP = { width: "100%", padding: "0.72rem 1rem", backgroundColor: "rgba(38,50,56,0.8)", border: "1.5px solid rgba(212,175,55,0.3)", borderRadius: "10px", color: WHITE, fontFamily: "'Tajawal',sans-serif", fontSize: "0.95rem", outline: "none", boxSizing: "border-box", marginBottom: "1rem" };
const SEL = { ...INP, cursor: "pointer" };

function ModalWrap({ onClose, children }) {
  return (
    <motion.div
      key="bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={overlay}
      onClick={onClose}
    >
      <motion.div
        key="mm"
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.88 }}
        transition={{ duration: 0.27, ease: [0.34, 1.2, 0.64, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{ ...modal, maxWidth: "540px" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function ZakatCalculator({ onClose, dir }) {
  const { t } = useTranslation();
  const [w, setW] = useState("");
  const [k, setK] = useState("21");
  const [res, setRes] = useState(null);

  const nisab = NISAB_BY_KARAT[k] || 85;
  const kf = { "24": 1, "22": 22/24, "21": 21/24, "18": 18/24 };
  const ppg = parseFloat((PRICE_24K * (kf[k] ?? 1)).toFixed(2));

  const calc = () => {
    const ww = parseFloat(w);
    if (!ww || isNaN(ww) || ww <= 0) return;
    const tv = ww * ppg, nv = nisab * ppg, ob = ww >= nisab;
    setRes({ tv, nv, ob, za: ob ? tv * ZAKAT_RATE : 0 });
  };

  const fmt = n => n.toLocaleString("en-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <ModalWrap onClose={onClose}>
      <button style={closeBtn} onClick={onClose}>✕</button>
      <div dir={dir}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: GOLD, margin: "0 0 0.7rem" }}>🕌 {t("zakatModalTitle")}</h2>
        <div style={{ backgroundColor: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "10px", padding: "0.7rem 1rem", marginBottom: "1.1rem" }}>
          <p style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.62)", margin: 0, lineHeight: 1.5 }}>ℹ️ {t("zakatExplanation")}</p>
        </div>
        <label style={LBL}>{t("zakatKaratLabel")}</label>
        <select value={k} onChange={e => { setK(e.target.value); setRes(null); }} style={SEL}>
          <option value="24">24K</option><option value="22">22K</option><option value="21">21K</option><option value="18">18K</option>
        </select>

        {/* Display current nisab threshold */}
        <div style={{ backgroundColor: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "10px", padding: "0.65rem 0.9rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}>Nisab for {k}K gold is {nisab}g</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: "rgba(38,50,56,0.5)", border: "1px solid rgba(212,175,55,0.18)", borderRadius: "10px", padding: "0.55rem 1rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.5)" }}>{t("zakatPricePerGram")}</span>
          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: GOLD }}>{ppg} {t("zakatSAR")}</span>
        </div>
        <label style={LBL}>{t("zakatWeightLabel")}</label>
        <input type="number" min="0" step="0.01" placeholder={t("zakatWeightPlaceholder")} value={w} onChange={e => { setW(e.target.value); setRes(null); }} style={INP} />
        <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.38)", margin: "0 0 1rem" }}>{t("zakatNisab")}</p>
        <button onClick={calc} style={{ width: "100%", padding: "0.82rem", backgroundColor: CTA, color: BG, border: "none", borderRadius: "10px", fontFamily: "'Tajawal',sans-serif", fontSize: "1rem", fontWeight: 700, cursor: "pointer" }}>{t("zakatCalculateBtn")}</button>
        <AnimatePresence mode="wait">
          {res && (
            <motion.div key="r" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginTop: "1.1rem" }}>
              {[[ t("zakatTotalValue"), fmt(res.tv) ], [`Nisab (${nisab}g)`, fmt(res.nv)]].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ fontSize: "0.86rem", color: "rgba(255,255,255,0.55)" }}>{l}</span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 700, color: WHITE }}>{v} {t("zakatSAR")}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontSize: "0.86rem", color: "rgba(255,255,255,0.55)" }}>{t("zakatAmount")}</span>
                <span style={{ backgroundColor: res.ob ? "rgba(74,222,128,0.12)" : "rgba(239,68,68,0.12)", color: res.ob ? "#4ADE80" : "#FCA5A5", border: `1px solid ${res.ob ? "rgba(74,222,128,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: "20px", padding: "2px 11px", fontSize: "0.8rem", fontWeight: 700 }}>
                  {res.ob ? t("zakatObligatory") : t("zakatNotObligatory")}
                </span>
              </div>
              {res.ob && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ backgroundColor: "rgba(212,175,55,0.1)", border: `1.5px solid ${GOLD}`, borderRadius: "12px", padding: "1rem", textAlign: "center", marginTop: "1rem" }}>
                  <p style={{ margin: "0 0 0.25rem", fontSize: "0.78rem", color: "rgba(255,255,255,0.45)" }}>{t("zakatResult")}</p>
                  <p style={{ margin: 0, fontSize: "1.9rem", fontWeight: 900, color: GOLD }}>{fmt(res.za)}</p>
                  <p style={{ margin: "0.2rem 0 0", fontSize: "0.78rem", color: "rgba(255,255,255,0.35)" }}>{t("zakatSAR")} · 2.5%</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ModalWrap>
  );
}

export default ZakatCalculator;