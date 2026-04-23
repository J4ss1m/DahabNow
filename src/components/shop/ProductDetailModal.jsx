/**
 * components/shop/ProductDetailModal.jsx
 * Full-screen product detail overlay with contact actions.
 * Opens via scale-up Framer Motion animation.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useTranslation }          from "react-i18next";
import { useLanguage }             from "../../context/LanguageContext";

/* ── Format WhatsApp URL ────────────────────────────────────── */
const toWAUrl = (num) => {
  if (!num) return null;
  const cleaned = num.replace(/\D/g, "");
  const full = cleaned.startsWith("966") ? cleaned
             : cleaned.startsWith("0")   ? "966" + cleaned.slice(1)
             : "966" + cleaned;
  return `https://wa.me/${full}`;
};

const S = {
  overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1500, padding: "1rem", overflowY: "auto" },
  modal: { backgroundColor: "#263238", border: "1.5px solid rgba(212,175,55,0.3)", borderRadius: "20px", width: "100%", maxWidth: "820px", overflow: "hidden", position: "relative", boxShadow: "0 16px 64px rgba(0,0,0,0.6)", fontFamily: "'Tajawal', sans-serif" },
  closeBtn: { position: "absolute", top: "1rem", insetInlineEnd: "1rem", background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "8px", color: "rgba(255,255,255,0.7)", fontSize: "1.1rem", cursor: "pointer", width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  imgPlaceholder: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem", backgroundColor: "rgba(69,90,100,0.6)" },
  label: { fontSize: "0.72rem", fontWeight: 700, color: "#D4AF37", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "3px" },
  value: { fontSize: "0.97rem", color: "#FFFFFF", marginBottom: "1rem" },
  karatBadge: { display: "inline-block", backgroundColor: "rgba(212,175,55,0.15)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.4)", borderRadius: "20px", padding: "2px 12px", fontSize: "0.82rem", fontWeight: 700 },
  waBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "0.72rem 1.2rem", backgroundColor: "#25D366", border: "none", borderRadius: "10px", color: "#FFFFFF", fontFamily: "'Tajawal', sans-serif", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", textDecoration: "none", flex: 1 },
  emailBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "0.72rem 1.2rem", backgroundColor: "rgba(212,175,55,0.15)", border: "1.5px solid #D4AF37", borderRadius: "10px", color: "#D4AF37", fontFamily: "'Tajawal', sans-serif", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", textDecoration: "none", flex: 1 },
  priceNote: { backgroundColor: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "10px", padding: "0.75rem 1rem", fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", marginTop: "0.5rem", lineHeight: 1.5 },
};

function ProductDetailModal({ product, shop, onClose, dir }) {
  const { t } = useTranslation();

  const waUrl    = toWAUrl(shop?.contactWhatsApp);
  const emailUrl = shop?.contactEmail ? `mailto:${shop.contactEmail}` : null;

  const handleDownload = () => {
    if (product?.productPicture) {
      const link = document.createElement('a');
      link.href = product.productPicture;
      link.download = `${product.productName || 'product'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleAsk = () => {
    if (waUrl && product) {
      const message = encodeURIComponent(`مرحباً، أريد أن أسأل عن المنتج: ${product.productName}`);
      window.open(`${waUrl}?text=${message}`, '_blank');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="pd-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={S.overlay}
        onClick={onClose}
      />
      <motion.div
        key="pd-modal"
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.88 }}
        transition={{ duration: 0.28, ease: [0.34, 1.2, 0.64, 1] }}
        style={{ ...S.overlay, backgroundColor: "transparent" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={S.modal} dir={dir}>
          {/* Close */}
          <button style={S.closeBtn} onClick={onClose}>✕</button>

          <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
            {/* Image */}
            <div style={{ flex: "0 0 300px", minHeight: "280px", backgroundColor: "rgba(38,50,56,0.5)" }}>
              {product.productPicture
                ? <img src={product.productPicture} alt={product.productName} style={S.img} />
                : <div style={S.imgPlaceholder}>💎</div>
              }
            </div>

            {/* Details */}
            <div style={{ flex: 1, minWidth: "260px", padding: "1.75rem" }}>
              {/* Karat + availability */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                <span style={S.karatBadge}>{product.karat}K</span>
                <span style={{ ...S.karatBadge, backgroundColor: product.isAvailable ? "rgba(74,222,128,0.12)" : "rgba(239,68,68,0.12)", color: product.isAvailable ? "#4ADE80" : "#FCA5A5", border: `1px solid ${product.isAvailable ? "rgba(74,222,128,0.3)" : "rgba(239,68,68,0.3)"}` }}>
                  {product.isAvailable ? t("productAvailableStatus") : t("productUnavailableStatus")}
                </span>
              </div>

              {/* Name */}
              <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#FFFFFF", margin: "0 0 0.5rem" }}>
                {product.productName}
              </h2>

              {/* Weight */}
              <div style={{ marginBottom: "1rem" }}>
                <div style={S.label}>{t("productWeight")}</div>
                <div style={S.value}>{product.weight}g</div>
              </div>

              {/* Description */}
              {product.productDescription && (
                <div style={{ marginBottom: "1rem" }}>
                  <div style={S.label}>{t("productDescription")}</div>
                  <div style={{ ...S.value, color: "rgba(255,255,255,0.75)", lineHeight: 1.55, fontSize: "0.92rem" }}>
                    {product.productDescription}
                  </div>
                </div>
              )}

              {/* Price note */}
              <div style={S.priceNote}>💡 {t("productPriceNote")}</div>

              {/* Contact buttons */}
              {(waUrl || emailUrl) && (
                <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginTop: "1.25rem" }}>
                  {waUrl && (
                    <a href={waUrl} target="_blank" rel="noreferrer" style={S.waBtn}>
                      📱 {t("shopContactWhatsApp")}
                    </a>
                  )}
                  {emailUrl && (
                    <a href={emailUrl} style={S.emailBtn}>
                      ✉️ {t("shopContactEmail")}
                    </a>
                  )}
                </div>
              )}

              {/* Additional actions */}
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginTop: "1rem" }}>
                {product?.productPicture && (
                  <button onClick={handleDownload} style={S.emailBtn}>
                    ⬇️ {t("downloadImage")}
                  </button>
                )}
                {waUrl && (
                  <button onClick={handleAsk} style={S.waBtn}>
                    💬 {t("askAboutProduct")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ProductDetailModal;
