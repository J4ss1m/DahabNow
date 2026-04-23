/**
 * components/home/ServicesHub.jsx — Phase 7
 * ChartModal: Day/Week/Month tabs + price-change %
 * ZakatModal: detailed Nisab / total value / amount rows
 * Portfolio: Coming Soon
 */

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useLanguage }    from "../../context/LanguageContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useLiveGoldPrice } from "../../hooks/useLiveGoldPrice";

const BG = "#263238", CARD = "#455A64", GOLD = "#D4AF37", CTA = "#FFD700", WHITE = "#FFFFFF";

/* ── Nisab thresholds per karat (in grams) ── */
const NISAB_BY_KARAT = { 24: 85, 22: 92.7, 21: 97.1, 18: 113.3 };

/* ── Mock price for Zakat calculation (SAR/g for 24K) ── */
const PRICE_24K = 568.14;

/* ── Generate 7 day base data ONCE using real price ── */
const generateWeekData = (basePrice) => {
  const data = [];
  let price = basePrice * 0.97;
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    price += (Math.random() - 0.48) * (basePrice * 0.005);
    data.push({
      date: date.toLocaleDateString("en-SA", { month: "short", day: "numeric" }),
      price: parseFloat(price.toFixed(2)),
    });
  }
  // Last point is always the real current price
  data[data.length - 1].price = basePrice;
  return data;
};

const overlay = { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.72)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200, padding: "1.25rem" };
const modal   = { backgroundColor: "#2d3f47", borderRadius: "18px", border: "1.5px solid rgba(212,175,55,0.4)", padding: "2rem", width: "100%", minHeight: "450px", boxShadow: "0 16px 56px rgba(0,0,0,0.6)", fontFamily: "'Tajawal',sans-serif", position: "relative", maxHeight: "92vh", overflowY: "auto", overflow: "visible" };
const closeBtn = { position: "absolute", top: "1rem", insetInlineEnd: "1rem", background: "none", border: "none", color: "rgba(255,255,255,0.55)", fontSize: "1.2rem", cursor: "pointer", padding: "4px 8px", borderRadius: "6px" };
const LBL = { display: "block", fontSize: "0.88rem", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "0.35rem" };
const INP = { width: "100%", padding: "0.72rem 1rem", backgroundColor: "rgba(38,50,56,0.8)", border: "1.5px solid rgba(212,175,55,0.3)", borderRadius: "10px", color: WHITE, fontFamily: "'Tajawal',sans-serif", fontSize: "0.95rem", outline: "none", boxSizing: "border-box", marginBottom: "1rem" };
const SEL = { ...INP, cursor: "pointer" };

function ModalWrap({ onClose, children, wide }) {
  return (
    <>
      <motion.div key="bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={overlay} onClick={onClose} />
      <motion.div key="mm" initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.88 }} transition={{ duration: 0.27, ease: [0.34, 1.2, 0.64, 1] }} style={{ ...overlay, backgroundColor: "transparent" }} onClick={e => e.stopPropagation()}>
        <div style={{ ...modal, maxWidth: wide ? "680px" : "540px" }}>{children}</div>
      </motion.div>
    </>
  );
}

/* ── Chart Modal ── */
function ChartModal({ onClose, dir }) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  
  // Get real gold prices
  const { prices, lastUpdate } = useLiveGoldPrice();
  const currentPrice24K = prices?.[24] || 568.14;
  
  // Generate 7 day data ONCE and store in ref
  const weekDataRef = useRef(null);
  const [chartData, setChartData] = useState([]);
  
  useEffect(() => {
    if (prices && !weekDataRef.current) {
      weekDataRef.current = generateWeekData(currentPrice24K);
      setChartData(weekDataRef.current);
    }
  }, [prices, currentPrice24K]);
  
  // Update last data point every 60 seconds with latest real price
  useEffect(() => {
    if (weekDataRef.current && prices) {
      const updatedData = [...weekDataRef.current];
      updatedData[6].price = currentPrice24K;
      setChartData(updatedData);
    }
  }, [currentPrice24K, prices]);
  
  const formatTime = (d) => {
    if (!d) return "";
    return d.toLocaleTimeString(language === "ar" ? "ar-SA" : "en-US", {
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  };

  return (
    <ModalWrap onClose={onClose} wide>
      <button style={closeBtn} onClick={onClose}>✕</button>
      <div dir={dir} style={{ minHeight: "400px" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: GOLD, margin: "0 0 0.6rem" }}>📊 {t("chartModalTitle")}</h2>
        
        {/* Current price prominently */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <p style={{ fontSize: "1.9rem", fontWeight: 800, color: GOLD, margin: 0, lineHeight: 1 }}>
            {currentPrice24K.toFixed(2)} <span style={{ fontSize: "0.82rem", fontWeight: 400 }}>{t("chartUnit")}</span>
          </p>
          <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", margin: "0.2rem 0 0" }}>
            {t("goldPriceLastUpdated")}: {formatTime(lastUpdate)}
          </p>
        </div>
        
        {/* Single chart */}
        <div style={{ height: "320px", width: "100%" }}>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 8, right: 10, left: -14, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
              <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.38)", fontSize: 10 }} interval={0} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.38)", fontSize: 10 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ backgroundColor: BG, border: `1px solid ${GOLD}`, borderRadius: "8px", fontFamily: "'Tajawal',sans-serif", color: WHITE, fontSize: "0.83rem" }} labelStyle={{ color: GOLD, fontWeight: 700 }} formatter={v => [`${v} ${t("chartUnit")}`, t("chartPrice")]} />
              <Line type="monotone" dataKey="price" stroke="#D4AF37" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#D4AF37" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <p style={{ textAlign: "center", fontSize: "0.7rem", color: "rgba(255,255,255,0.28)", marginTop: "0.8rem", lineHeight: 1.5 }}>
          {language === "ar" 
            ? "الرسم البياني يعرض اتجاهات تقديرية. الأسعار المباشرة أعلاه مجلوبة من بيانات السوق الحقيقية."
            : "Chart shows estimated price trends. Live prices shown above are fetched from real market data."
          }
        </p>
      </div>
    </ModalWrap>
  );
}

/* ── Zakat Modal ── */
function ZakatModal({ onClose, dir }) {
  const { t }  = useTranslation();
  const [w, setW]   = useState("");
  const [k, setK]   = useState("21");
  const [res, setRes] = useState(null);
  
  const nisab = NISAB_BY_KARAT[k] || 85;
  const kf = { "24": 1, "22": 22/24, "21": 21/24, "18": 18/24 };
  const ppg = parseFloat((PRICE_24K * (kf[k] ?? 1)).toFixed(2));
  const ZAKAT_RATE = 0.025;

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

/* ── Service Box ── */
function ServiceBox({ icon, titleKey, descKey, ctaKey, onClick, comingSoon }) {
  const { t } = useTranslation();
  const [hov, setHov] = useState(false);
  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}
      style={{ flex: "1 1 260px", backgroundColor: hov ? "#506070" : CARD, border: `1px solid ${hov ? GOLD : "rgba(212,175,55,0.2)"}`, borderRadius: "16px", padding: "1.75rem 1.5rem", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "0.85rem", cursor: comingSoon ? "default" : "pointer", transition: "background-color 0.2s, border-color 0.2s", fontFamily: "'Tajawal',sans-serif", boxShadow: hov ? "0 8px 28px rgba(212,175,55,0.15)" : "0 2px 12px rgba(0,0,0,0.2)" }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={!comingSoon ? onClick : undefined}>
      <div style={{ fontSize: "2.5rem", lineHeight: 1, padding: "0.6rem", backgroundColor: "rgba(212,175,55,0.1)", borderRadius: "12px" }}>{icon}</div>
      <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: WHITE, margin: 0 }}>{t(titleKey)}</h3>
      <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.55 }}>{t(descKey)}</p>
      {comingSoon
        ? <span style={{ fontSize: "0.8rem", fontWeight: 700, backgroundColor: "rgba(212,175,55,0.1)", color: GOLD, borderRadius: "20px", padding: "4px 14px", marginTop: "auto" }}>{t("serviceComingSoon")}</span>
        : <button style={{ marginTop: "auto", backgroundColor: CTA, color: BG, border: "none", borderRadius: "9px", padding: "0.55rem 1.2rem", fontFamily: "'Tajawal',sans-serif", fontSize: "0.88rem", fontWeight: 700, cursor: "pointer" }}>{t(ctaKey)}</button>
      }
    </motion.div>
  );
}

/* ── Services Hub ── */
function ServicesHub() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const dir = language === "ar" ? "rtl" : "ltr";
  const [modal, setModal] = useState(null);

  return (
    <section style={{ padding: "2rem 1.5rem 3.5rem", fontFamily: "'Tajawal',sans-serif" }} dir={dir}>
      <div style={{ marginBottom: "2rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(1.3rem,3vw,1.75rem)", fontWeight: 800, color: WHITE, margin: "0 0 0.4rem" }}>{t("servicesTitle")}</h2>
        <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.55)", margin: 0 }}>{t("servicesSubtitle")}</p>
        <div style={{ width: "48px", height: "3px", backgroundColor: GOLD, borderRadius: "2px", margin: "0.9rem auto 0" }} />
      </div>
      <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", maxWidth: "900px", margin: "0 auto" }}>
        <ServiceBox icon="📊" titleKey="servicePriceChartTitle" descKey="servicePriceChartDesc" ctaKey="serviceOpenChart"  onClick={() => setModal("chart")} />
        <ServiceBox icon="🕌" titleKey="serviceZakatTitle"      descKey="serviceZakatDesc"      ctaKey="serviceCalculate" onClick={() => setModal("zakat")} />
        <ServiceBox icon="💼" titleKey="servicePortfolioTitle"  descKey="servicePortfolioDesc"  ctaKey="serviceCreatePortfolio" onClick={() => navigate("/portfolio")} />
      </div>
      <AnimatePresence>
        {modal === "chart" && <ChartModal key="chart" onClose={() => setModal(null)} dir={dir} />}
        {modal === "zakat" && <ZakatModal key="zakat" onClose={() => setModal(null)} dir={dir} />}
      </AnimatePresence>
    </section>
  );
}

export default ServicesHub;
