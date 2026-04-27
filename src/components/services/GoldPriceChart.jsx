import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18nt";
import { useLanguage } from "../../context/LanguageContext";
import { useLiveGoldPrice } from "../../hooks/useLiveGoldPrice";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FiBarChart2, FiX } from "react-icons/fi";

/* ── Constants ── */
const BG = "#263238", GOLD = "#D4AF37";

const generateChartData = (currentPrice) => {
  const days = ["Day 1","Day 2","Day 3","Day 4","Day 5","Day 6","Today"];
  return days.map((day, i) => ({
    day,
    price: parseFloat(
      (currentPrice * (0.97 + (i * 0.005) + (Math.random() * 0.006))).toFixed(2)
    )
  }));
};

/* ── Styles ── */
const overlay = { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.72)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200, padding: "1.25rem" };
const modal = { backgroundColor: "#2d3f47", borderRadius: "18px", border: "1.5px solid rgba(212,175,55,0.4)", padding: "2rem", width: "100%", minHeight: "450px", boxShadow: "0 16px 56px rgba(0,0,0,0.6)", fontFamily: "'Tajawal',sans-serif", position: "relative", maxHeight: "92vh", overflowY: "auto", overflow: "visible" };
const closeBtn = { position: "absolute", top: "1rem", insetInlineEnd: "1rem", background: "none", border: "none", color: "rgba(255,255,255,0.55)", fontSize: "1.2rem", cursor: "pointer", padding: "4px 8px", borderRadius: "6px" };

function ModalWrap({ onClose, children, wide }) {
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
        style={{ ...modal, maxWidth: wide ? "680px" : "540px" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function GoldPriceChart({ onClose, dir }) {
  const { t } = useTranslation();
  const { language } = useLanguage();

  // Get real gold prices
  const { prices, lastUpdate } = useLiveGoldPrice();
  const currentPrice24K = prices?.[24] || 568.14;

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (prices) {
      setChartData(generateChartData(currentPrice24K));
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
      <button style={closeBtn} onClick={onClose}><FiX size={18} /></button>
      <div dir={dir} style={{ minHeight: "400px" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: GOLD, margin: "0 0 0.6rem", display: "inline-flex", alignItems: "center", gap: "0.45rem" }}><FiBarChart2 size={20} /> {t("chartModalTitle")} ({currentPrice24K.toFixed(2)} {t("chartUnit")})</h2>

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
              <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.38)", fontSize: 10 }} interval={0} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.38)", fontSize: 10 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ backgroundColor: BG, border: `1px solid ${GOLD}`, borderRadius: "8px", fontFamily: "'Tajawal',sans-serif", color: "#FFFFFF", fontSize: "0.83rem" }} labelStyle={{ color: GOLD, fontWeight: 700 }} formatter={v => [`${v} ${t("chartUnit")}`, t("chartPrice")]} />
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

export default GoldPriceChart;