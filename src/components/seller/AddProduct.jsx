/**
 * components/seller/AddProduct.jsx
 * Form to upload a new jewelry product to Firestore + Cloudinary.
 *
 * ══════════════════════════════════════════════════════════
 * CLOUDINARY SETUP REQUIRED (one-time):
 *   1. Log in to https://cloudinary.com/console
 *   2. Go to Settings → Upload
 *   3. Scroll to "Upload presets" → click "Add upload preset"
 *   4. Set Preset name: dahabnow_products
 *   5. Set Signing mode: Unsigned
 *   6. Save
 * Without this preset, image uploads will fail with 401.
 * ══════════════════════════════════════════════════════════
 */

import { useState }    from "react";
import { motion }      from "framer-motion";
import { FiCheckCircle } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db }          from "../../firebase/config";
import { useAuth }     from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import GoldSpinner     from "../common/GoldSpinner";

const CLOUDINARY_CLOUD  = "db97lfv7s";
const CLOUDINARY_PRESET = "dahabnow_products";

const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_PRESET);
  formData.append("cloud_name", CLOUDINARY_CLOUD);
  const res  = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
    { method: "POST", body: formData }
  );
  const data = await res.json();
  if (!data.secure_url) throw new Error("Upload failed");
  return data.secure_url;
};

const S = {
  section: { fontFamily: "'Tajawal', sans-serif", maxWidth: "620px" },
  title: { fontSize: "1.3rem", fontWeight: 800, color: "#FFFFFF", margin: "0 0 1.5rem" },
  label: { display: "block", fontSize: "0.84rem", fontWeight: 600, color: "rgba(255,255,255,0.75)", marginBottom: "0.35rem" },
  input: {
    width: "100%", padding: "0.68rem 0.9rem",
    backgroundColor: "rgba(69,90,100,0.7)",
    border: "1.5px solid rgba(212,175,55,0.25)", borderRadius: "9px",
    color: "#FFFFFF", fontFamily: "'Tajawal', sans-serif", fontSize: "0.93rem",
    outline: "none", boxSizing: "border-box", marginBottom: "1rem",
    transition: "border-color 0.2s",
  },
  textarea: {
    width: "100%", padding: "0.68rem 0.9rem", resize: "vertical", minHeight: "85px",
    backgroundColor: "rgba(69,90,100,0.7)",
    border: "1.5px solid rgba(212,175,55,0.25)", borderRadius: "9px",
    color: "#FFFFFF", fontFamily: "'Tajawal', sans-serif", fontSize: "0.93rem",
    outline: "none", boxSizing: "border-box", marginBottom: "1rem",
  },
  select: {
    width: "100%", padding: "0.68rem 0.9rem",
    backgroundColor: "rgba(69,90,100,0.7)",
    border: "1.5px solid rgba(212,175,55,0.25)", borderRadius: "9px",
    color: "#FFFFFF", fontFamily: "'Tajawal', sans-serif", fontSize: "0.93rem",
    outline: "none", marginBottom: "1rem", cursor: "pointer",
  },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  uploadZone: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", gap: "8px",
    backgroundColor: "rgba(212,175,55,0.07)",
    border: "2px dashed rgba(212,175,55,0.4)", borderRadius: "12px",
    padding: "1.5rem", cursor: "pointer",
    marginBottom: "1rem", transition: "background 0.2s",
  },
  preview: { width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "10px", marginBottom: "1rem" },
  toggle: { display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginBottom: "1.25rem" },
  toggleTrack: (on) => ({
    width: "46px", height: "25px", borderRadius: "13px",
    backgroundColor: on ? "#4ADE80" : "#455A64",
    position: "relative", transition: "background-color 0.25s", flexShrink: 0,
    border: "1px solid rgba(255,255,255,0.1)",
  }),
  toggleThumb: (on) => ({
    position: "absolute", top: "2px",
    left: on ? "21px" : "2px",
    width: "19px", height: "19px",
    borderRadius: "50%", backgroundColor: "#FFFFFF",
    transition: "left 0.25s", boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
  }),
  submitBtn: {
    width: "100%", padding: "0.9rem",
    backgroundColor: "#FFD700", color: "#263238",
    border: "none", borderRadius: "11px",
    fontFamily: "'Tajawal', sans-serif", fontSize: "1rem", fontWeight: 800,
    cursor: "pointer", marginTop: "0.5rem", letterSpacing: "0.04em",
    transition: "opacity 0.2s",
  },
  successMsg: {
    backgroundColor: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.35)",
    borderRadius: "10px", padding: "0.8rem 1rem", color: "#4ADE80",
    fontSize: "0.92rem", marginBottom: "1rem", textAlign: "center",
  },
  errorMsg: {
    backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.35)",
    borderRadius: "10px", padding: "0.8rem 1rem", color: "#FCA5A5",
    fontSize: "0.92rem", marginBottom: "1rem", textAlign: "center",
  },
  divider: { height: "1px", backgroundColor: "rgba(212,175,55,0.15)", margin: "1.25rem 0" },
  sectionLabel: {
    fontSize: "0.75rem", fontWeight: 700, color: "#D4AF37",
    textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem",
  },
};

const EMPTY_FORM = {
  productName: "", productDescription: "", karat: "24",
  weight: "", isAvailable: true,
};

function AddProduct({ shopId, currentUser }) {
  const { t }        = useTranslation();
  const { language } = useLanguage();
  const dir          = language === "ar" ? "rtl" : "ltr";

  const [form,      setForm]      = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [preview,   setPreview]   = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [success,   setSuccess]   = useState("");
  const [error,     setError]     = useState("");

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  };

  const validate = () => {
    if (!form.productName.trim()) return t("errorRequiredField");
    if (!form.weight || isNaN(parseFloat(form.weight))) return t("errorRequiredField");
    if (!imageFile) return t("addProductImageRequired");
    if (!shopId)    return t("addProductShopNotFound");
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");

    const err = validate();
    if (err) { setError(err); return; }

    try {
      // 1 — Upload image
      setUploading(true);
      const imageUrl = await uploadToCloudinary(imageFile);
      setUploading(false);

      // 2 — Save to Firestore
      setSaving(true);
      await addDoc(collection(db, "products"), {
        shopId,
        sellerId:           currentUser.uid,
        productName:        form.productName.trim(),
        productDescription: form.productDescription.trim(),
        productPicture:     imageUrl,
        karat:              parseInt(form.karat),
        weight:             parseFloat(form.weight),
        isAvailable:        form.isAvailable,
        createdAt:          serverTimestamp(),
      });

      setSuccess(t("addProductSuccess"));
      setForm(EMPTY_FORM);
      setImageFile(null);
      setPreview("");
    } catch (err) {
      console.error("[AddProduct]", err);
      if (err.message === "Upload failed") {
        setError(t("addProductErrorUpload"));
      } else {
        setError(t("errorGeneric"));
      }
    } finally {
      setUploading(false);
      setSaving(false);
    }
  };

  const busy = uploading || saving;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{ ...S.section }}
      dir={dir}
    >
      <h2 style={S.title}>{t("addProductTitle")}</h2>

      {/* Status messages */}
      {success && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} style={S.successMsg}>
          <FiCheckCircle size="1rem" style={{ marginInlineEnd: "0.4rem" }} /> {success}
        </motion.div>
      )}
      {error && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} style={S.errorMsg}>
          {error}
        </motion.div>
      )}

      {/* Spinner overlay */}
      {busy && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
          <GoldSpinner fullScreen={false} size={32} />
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>
            {uploading ? t("addProductUploading") : t("addProductSaving")}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Product details */}
        <p style={S.sectionLabel}>◆ {t("productName")}</p>
        <input
          style={S.input}
          placeholder={t("addProductNamePlaceholder")}
          value={form.productName}
          onChange={set("productName")}
          disabled={busy}
        />

        <p style={S.sectionLabel}>◆ {t("productDescription")}</p>
        <textarea
          style={S.textarea}
          placeholder={t("addProductDescPlaceholder")}
          value={form.productDescription}
          onChange={set("productDescription")}
          disabled={busy}
        />

        <div style={S.row}>
          <div>
            <p style={S.sectionLabel}>◆ {t("productKarat")}</p>
            <select style={S.select} value={form.karat} onChange={set("karat")} disabled={busy}>
              <option value="" disabled>{t("addProductSelectKarat")}</option>
              <option value="18">18K</option>
              <option value="21">21K</option>
              <option value="22">22K</option>
              <option value="24">24K</option>
            </select>
          </div>
          <div>
            <p style={S.sectionLabel}>◆ {t("productWeight")}</p>
            <input
              style={S.input}
              type="number" min="0" step="0.01"
              placeholder={t("addProductWeightPlaceholder")}
              value={form.weight}
              onChange={set("weight")}
              disabled={busy}
            />
          </div>
        </div>

        {/* Availability toggle */}
        <p style={S.sectionLabel}>◆ {t("productAvailability")}</p>
        <div style={S.toggle} onClick={() => !busy && setForm((p) => ({ ...p, isAvailable: !p.isAvailable }))}>
          <div style={S.toggleTrack(form.isAvailable)}>
            <div style={S.toggleThumb(form.isAvailable)} />
          </div>
          <span style={{ color: form.isAvailable ? "#4ADE80" : "#FCA5A5", fontWeight: 600, fontSize: "0.92rem" }}>
            {form.isAvailable ? t("productAvailable") : t("productUnavailable")}
          </span>
        </div>

        {/* Image upload */}
        <p style={S.sectionLabel}>◆ {t("productImage")}</p>
        {preview ? (
          <>
            <img src={preview} alt="preview" style={S.preview} />
            <label style={S.uploadBtn}>
              📷 {t("addProductChangeImage")}
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} disabled={busy} />
            </label>
          </>
        ) : (
          <label style={{
            ...S.uploadZone,
            cursor: busy ? "not-allowed" : "pointer",
          }}>
            <span style={{ fontSize: "2rem" }}>📷</span>
            <span style={{ color: "#D4AF37", fontWeight: 600, fontSize: "0.9rem" }}>{t("addProductUploadImage")}</span>
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} disabled={busy} />
          </label>
        )}

        {/* Submit */}
        <motion.button
          type="submit"
          style={{ ...S.submitBtn, opacity: busy ? 0.65 : 1 }}
          whileHover={!busy ? { scale: 1.01, opacity: 0.92 } : {}}
          whileTap={!busy ? { scale: 0.97 } : {}}
          disabled={busy}
        >
          {busy ? "..." : t("addProductSubmit")}
        </motion.button>
      </form>
    </motion.section>
  );
}

export default AddProduct;
