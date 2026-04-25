/**
 * components/seller/MyShop.jsx
 * Displays the seller's shop details and allows inline editing.
 * Receives shop data as props from SellerDashboard (already fetched).
 */

import { useState }   from "react";
import { motion }     from "framer-motion";
import { useTranslation } from "react-i18next";
import { doc, updateDoc } from "firebase/firestore";
import { db }         from "../../firebase/config";
import { useLanguage } from "../../context/LanguageContext";

const CITIES = ["Riyadh", "Jeddah", "Madinah", "Mecca", "Dammam"];
const CLOUDINARY_CLOUD  = "db97lfv7s";
const CLOUDINARY_PRESET = "dahabnow_products";

const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_PRESET);
  formData.append("cloud_name", CLOUDINARY_CLOUD);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!data.secure_url) throw new Error("Upload failed");
  return data.secure_url;
};

/* ── Shared styles ───────────────────────────────────────────── */
const S = {
  section: { fontFamily: "'Tajawal', sans-serif" },
  header: {
    display:        "flex",
    alignItems:     "center",
    justifyContent: "space-between",
    flexWrap:       "wrap",
    gap:            "0.75rem",
    marginBottom:   "1.5rem",
  },
  title: { fontSize: "1.3rem", fontWeight: 800, color: "#FFFFFF", margin: 0 },
  card: {
    backgroundColor: "#455A64",
    borderRadius:    "16px",
    border:          "1px solid rgba(212,175,55,0.2)",
    padding:         "1.75rem",
    boxShadow:       "0 2px 16px rgba(0,0,0,0.25)",
  },
  row: {
    display:      "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap:          "1rem",
    marginBottom: "1rem",
  },
  field: { display: "flex", flexDirection: "column", gap: "0.25rem" },
  label: { fontSize: "0.78rem", fontWeight: 700, color: "#D4AF37", letterSpacing: "0.06em", textTransform: "uppercase" },
  value: { fontSize: "0.97rem", color: "#FFFFFF", fontWeight: 500 },
  input: {
    width:           "100%",
    padding:         "0.65rem 0.9rem",
    backgroundColor: "rgba(38,50,56,0.75)",
    border:          "1.5px solid rgba(212,175,55,0.3)",
    borderRadius:    "9px",
    color:           "#FFFFFF",
    fontFamily:      "'Tajawal', sans-serif",
    fontSize:        "0.93rem",
    outline:         "none",
    boxSizing:       "border-box",
    transition:      "border-color 0.2s",
  },
  select: {
    width:           "100%",
    padding:         "0.65rem 0.9rem",
    backgroundColor: "rgba(38,50,56,0.75)",
    border:          "1.5px solid rgba(212,175,55,0.3)",
    borderRadius:    "9px",
    color:           "#FFFFFF",
    fontFamily:      "'Tajawal', sans-serif",
    fontSize:        "0.93rem",
    outline:         "none",
    cursor:          "pointer",
  },
  editBtn: {
    backgroundColor: "transparent",
    border:          "1.5px solid #D4AF37",
    borderRadius:    "9px",
    color:           "#D4AF37",
    padding:         "0.5rem 1.2rem",
    fontFamily:      "'Tajawal', sans-serif",
    fontSize:        "0.88rem",
    fontWeight:      700,
    cursor:          "pointer",
    transition:      "background 0.18s, color 0.18s",
  },
  saveBtn: {
    backgroundColor: "#FFD700",
    border:          "none",
    borderRadius:    "9px",
    color:           "#263238",
    padding:         "0.6rem 1.4rem",
    fontFamily:      "'Tajawal', sans-serif",
    fontSize:        "0.9rem",
    fontWeight:      700,
    cursor:          "pointer",
    transition:      "opacity 0.18s",
  },
  cancelBtn: {
    backgroundColor: "transparent",
    border:          "1px solid rgba(255,255,255,0.2)",
    borderRadius:    "9px",
    color:           "rgba(255,255,255,0.6)",
    padding:         "0.6rem 1.2rem",
    fontFamily:      "'Tajawal', sans-serif",
    fontSize:        "0.9rem",
    cursor:          "pointer",
  },
  badge: {
    display:         "inline-flex",
    alignItems:      "center",
    gap:             "5px",
    backgroundColor: "rgba(212,175,55,0.15)",
    border:          "1px solid rgba(212,175,55,0.4)",
    borderRadius:    "20px",
    padding:         "3px 12px",
    fontSize:        "0.8rem",
    fontWeight:      700,
    color:           "#D4AF37",
  },
  successMsg: {
    backgroundColor: "rgba(74,222,128,0.1)",
    border:          "1px solid rgba(74,222,128,0.35)",
    borderRadius:    "9px",
    color:           "#4ADE80",
    padding:         "0.65rem 1rem",
    fontSize:        "0.88rem",
    marginBottom:    "1rem",
    textAlign:       "center",
  },
  errorMsg: {
    backgroundColor: "rgba(239,68,68,0.1)",
    border:          "1px solid rgba(239,68,68,0.35)",
    borderRadius:    "9px",
    color:           "#FCA5A5",
    padding:         "0.65rem 1rem",
    fontSize:        "0.88rem",
    marginBottom:    "1rem",
    textAlign:       "center",
  },
  divider: {
    height:          "1px",
    backgroundColor: "rgba(212,175,55,0.15)",
    margin:          "1.25rem 0",
  },
};

/* ── Editable field row ─────────────────────────────────────── */
function FieldRow({ label, value, editMode, type = "text", children }) {
  return (
    <div style={S.field}>
      <span style={S.label}>{label}</span>
      {editMode ? children : <span style={S.value}>{value || "—"}</span>}
    </div>
  );
}

function MyShop({ shop, shopId }) {
  const { t }    = useTranslation();
  const { language } = useLanguage();
  const dir      = language === "ar" ? "rtl" : "ltr";

  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState("");
  const [error,   setError]   = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [preview, setPreview] = useState(shop?.shopPicture || "");

  // Editable form state — initialise from shop prop
  const [form, setForm] = useState({
    shopName:        shop?.shopName        || "",
    shopCity:        shop?.shopCity        || "",
    shopArea:        shop?.shopArea        || "",
    shopAddress:     shop?.shopAddress     || "",
    contactWhatsApp: shop?.contactWhatsApp || "",
    contactEmail:    shop?.contactEmail    || "",
    shopPicture:     shop?.shopPicture     || "",
    locationLink:    shop?.locationLink    || "",
  });

  if (!shop) {
    return <p style={{ color: "rgba(255,255,255,0.5)", padding: "2rem" }}>{t("myShopNoShop")}</p>;
  }

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handlePictureSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploadingImage(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm((prev) => ({ ...prev, shopPicture: url }));
      setPreview(url);
    } catch (err) {
      console.error("[MyShop] picture upload error:", err);
      setError(t("errorGeneric"));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setError(""); setSuccess("");
    if (!form.shopName.trim()) { setError(t("errorRequiredField")); return; }
    setSaving(true);
    try {
      await updateDoc(doc(db, "shops", shopId), { ...form });
      setSuccess(t("myShopSaved"));
      setEditing(false);
    } catch (e) {
      console.error("[MyShop] save error:", e);
      setError(t("errorGeneric"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{ ...S.section, maxWidth: "800px" }}
      dir={dir}
    >
      {/* Header */}
      <div style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <h2 style={S.title}>{t("myShopTitle")}</h2>
          {shop.isApproved && shop.sellerId !== "imported" && (
            <span style={S.badge}>✓ {t("myShopVerified")}</span>
          )}
        </div>

        {!editing ? (
          <button
            style={S.editBtn}
            onClick={() => { setEditing(true); setSuccess(""); setError(""); }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#D4AF37"; e.currentTarget.style.color = "#263238"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#D4AF37"; }}
          >
            ✏️ {t("myShopEdit")}
          </button>
        ) : (
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <button style={S.cancelBtn} onClick={() => { setEditing(false); setError(""); setSuccess(""); }}>
              {t("myShopCancel")}
            </button>
            <button style={{ ...S.saveBtn, opacity: saving ? 0.7 : 1 }} onClick={handleSave} disabled={saving}>
              {saving ? t("loading") : t("myShopSave")}
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      {success && <div style={S.successMsg}>{success}</div>}
      {error   && <div style={S.errorMsg}>{error}</div>}

      {/* Card */}
      <div style={S.card}>
        <div style={S.row}>
          <FieldRow label={t("myShopName")} value={form.shopName} editMode={editing}>
            <input style={S.input} value={form.shopName} onChange={set("shopName")} />
          </FieldRow>
          <FieldRow label={t("myShopCity")} value={form.shopCity} editMode={editing}>
            <select style={S.select} value={form.shopCity} onChange={set("shopCity")}>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </FieldRow>
        </div>

        <div style={S.divider} />

        <div style={S.row}>
          <FieldRow label={t("myShopArea")} value={form.shopArea} editMode={editing}>
            <input style={S.input} value={form.shopArea} onChange={set("shopArea")} />
          </FieldRow>
          <FieldRow label={t("myShopAddress")} value={form.shopAddress} editMode={editing}>
            <input style={S.input} value={form.shopAddress} onChange={set("shopAddress")} />
          </FieldRow>
        </div>

        <div style={S.divider} />

        <div style={S.row}>
          <FieldRow label={t("shopPicture")} value={form.shopPicture} editMode={editing}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {preview ? (
                <img src={preview} alt={t("shopPicture")} style={{ width: "100%", maxHeight: "180px", objectFit: "cover", borderRadius: "12px", border: "1px solid rgba(212,175,55,0.25)" }} />
              ) : (
                <div style={{ width: "100%", minHeight: "110px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.04)", border: "1px dashed rgba(212,175,55,0.3)", borderRadius: "12px", color: "rgba(255,255,255,0.45)", fontSize: "0.95rem" }}>
                  {t("shopPicture")}
                </div>
              )}
              <label style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0.65rem 1rem", backgroundColor: "rgba(212,175,55,0.15)", border: "1.5px solid rgba(212,175,55,0.35)", borderRadius: "10px", color: "#D4AF37", cursor: editing ? "pointer" : "not-allowed", fontWeight: 700, fontSize: "0.93rem" }}>
                {uploadingImage ? t("loading") : t("shopPicture")}
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={handlePictureSelect} disabled={!editing} />
              </label>
            </div>
          </FieldRow>
          <FieldRow label={t("shopLocationLink")} value={form.locationLink} editMode={editing}>
            <input style={S.input} value={form.locationLink} onChange={set("locationLink")} placeholder="https://maps.app.goo.gl/..." />
          </FieldRow>
        </div>

        <div style={S.divider} />

        <div style={S.row}>
          <FieldRow label={t("myShopWhatsApp")} value={form.contactWhatsApp} editMode={editing}>
            <input style={S.input} value={form.contactWhatsApp} onChange={set("contactWhatsApp")} />
          </FieldRow>
          <FieldRow label={t("myShopEmail")} value={form.contactEmail} editMode={editing}>
            <input style={S.input} type="email" value={form.contactEmail} onChange={set("contactEmail")} />
          </FieldRow>
        </div>
      </div>
    </motion.section>
  );
}

export default MyShop;
