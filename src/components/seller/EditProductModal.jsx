/**
 * components/seller/EditProductModal.jsx
 * Slide-up modal for editing an existing product.
 * Pre-fills form with current product data.
 * Optionally uploads a new image to Cloudinary before saving.
 */

import { useState }        from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation }  from "react-i18next";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db }              from "../../firebase/config";
import { useLanguage }     from "../../context/LanguageContext";
import GoldSpinner         from "../common/GoldSpinner";

const CLOUDINARY_CLOUD = "db97lfv7s";
const CLOUDINARY_PRESET = "dahabnow_products";

const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_PRESET);
  formData.append("cloud_name", CLOUDINARY_CLOUD);
  const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method: "POST", body: formData });
  const data = await res.json();
  if (!data.secure_url) throw new Error("Upload failed");
  return data.secure_url;
};

const S = {
  overlay: {
    position:        "fixed",
    inset:           0,
    backgroundColor: "rgba(0,0,0,0.65)",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    zIndex:          1100,
    padding:         "0",
  },
  modal: {
    backgroundColor: "#263238",
    borderTop:       "2px solid #D4AF37",
    borderRadius:    "20px 20px 0 0",
    padding:         "2rem 1.5rem",
    width:           "100%",
    maxWidth:        "560px",
    maxHeight:       "85vh",
    overflowY:       "auto",
    fontFamily:      "'Tajawal', sans-serif",
    boxSizing:       "border-box",
  },
  title: { fontSize: "1.15rem", fontWeight: 800, color: "#FFFFFF", margin: "0 0 1.5rem" },
  label: { display: "block", fontSize: "0.84rem", fontWeight: 600, color: "rgba(255,255,255,0.75)", marginBottom: "0.35rem" },
  input: {
    width: "100%", padding: "0.68rem 0.9rem",
    backgroundColor: "rgba(69,90,100,0.7)",
    border: "1.5px solid rgba(212,175,55,0.3)",
    borderRadius: "9px", color: "#FFFFFF",
    fontFamily: "'Tajawal', sans-serif", fontSize: "0.93rem",
    outline: "none", boxSizing: "border-box", marginBottom: "1rem", transition: "border-color 0.2s",
  },
  textarea: {
    width: "100%", padding: "0.68rem 0.9rem", resize: "vertical", minHeight: "80px",
    backgroundColor: "rgba(69,90,100,0.7)",
    border: "1.5px solid rgba(212,175,55,0.3)",
    borderRadius: "9px", color: "#FFFFFF",
    fontFamily: "'Tajawal', sans-serif", fontSize: "0.93rem",
    outline: "none", boxSizing: "border-box", marginBottom: "1rem",
  },
  select: {
    width: "100%", padding: "0.68rem 0.9rem",
    backgroundColor: "rgba(69,90,100,0.7)",
    border: "1.5px solid rgba(212,175,55,0.3)",
    borderRadius: "9px", color: "#FFFFFF",
    fontFamily: "'Tajawal', sans-serif", fontSize: "0.93rem",
    outline: "none", marginBottom: "1rem", cursor: "pointer",
  },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  uploadBtn: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
    backgroundColor: "rgba(212,175,55,0.1)",
    border: "1.5px dashed rgba(212,175,55,0.5)",
    borderRadius: "10px", padding: "0.75rem",
    color: "#D4AF37", fontFamily: "'Tajawal', sans-serif",
    fontSize: "0.9rem", fontWeight: 600, cursor: "pointer",
    width: "100%", boxSizing: "border-box", marginBottom: "1rem",
  },
  preview: { width: "100%", maxHeight: "180px", objectFit: "cover", borderRadius: "10px", marginBottom: "1rem" },
  toggle: {
    display: "flex", alignItems: "center", gap: "10px",
    cursor: "pointer", marginBottom: "1rem",
  },
  toggleTrack: (on) => ({
    width: "44px", height: "24px", borderRadius: "12px",
    backgroundColor: on ? "#4ADE80" : "#455A64",
    position: "relative", transition: "background-color 0.25s", flexShrink: 0,
    border: "1px solid rgba(255,255,255,0.1)",
  }),
  toggleThumb: (on) => ({
    position: "absolute", top: "2px",
    left: on ? "20px" : "2px",
    width: "18px", height: "18px",
    borderRadius: "50%", backgroundColor: "#FFFFFF",
    transition: "left 0.25s", boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
  }),
  saveBtn: {
    width: "100%", padding: "0.85rem",
    backgroundColor: "#FFD700", color: "#263238",
    border: "none", borderRadius: "10px",
    fontFamily: "'Tajawal', sans-serif", fontSize: "1rem", fontWeight: 800,
    cursor: "pointer", marginTop: "0.5rem", transition: "opacity 0.2s",
  },
  cancelBtn: {
    width: "100%", padding: "0.75rem",
    backgroundColor: "transparent",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "10px", color: "rgba(255,255,255,0.6)",
    fontFamily: "'Tajawal', sans-serif", fontSize: "0.93rem",
    cursor: "pointer", marginTop: "0.5rem",
  },
  errorMsg: {
    backgroundColor: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.4)",
    borderRadius: "9px", padding: "0.65rem 1rem", color: "#FCA5A5",
    fontSize: "0.88rem", marginBottom: "1rem", textAlign: "center",
  },
  successMsg: {
    backgroundColor: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.35)",
    borderRadius: "9px", padding: "0.65rem 1rem", color: "#4ADE80",
    fontSize: "0.88rem", marginBottom: "1rem", textAlign: "center",
  },
};

function EditProductModal({ product, productId, onClose, onSaved, dir }) {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    productName:        product.productName        || "",
    productDescription: product.productDescription || "",
    karat:              String(product.karat)      || "24",
    weight:             String(product.weight)     || "",
    isAvailable:        product.isAvailable        ?? true,
    productPicture:     product.productPicture     || "",
  });
  const [newFile,   setNewFile]   = useState(null);
  const [preview,   setPreview]   = useState(product.productPicture || "");
  const [uploading, setUploading] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setNewFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    setError(""); setSuccess("");
    if (!form.productName.trim()) { setError(t("errorRequiredField")); return; }
    if (!form.weight || isNaN(parseFloat(form.weight))) { setError(t("errorRequiredField")); return; }

    setSaving(true);
    let imageUrl = form.productPicture;

    try {
      if (newFile) {
        setUploading(true);
        imageUrl = await uploadToCloudinary(newFile);
        setUploading(false);
      }
      await updateDoc(doc(db, "products", productId), {
        productName:        form.productName.trim(),
        productDescription: form.productDescription.trim(),
        karat:              parseInt(form.karat),
        weight:             parseFloat(form.weight),
        isAvailable:        form.isAvailable,
        productPicture:     imageUrl,
        updatedAt:          serverTimestamp(),
      });
      setSuccess(t("editProductSuccess"));
      setTimeout(() => { onSaved(); onClose(); }, 1200);
    } catch (e) {
      console.error("[EditProductModal]", e);
      setError(t("errorGeneric"));
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="edit-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={S.overlay}
        onClick={onClose}
      />
      <motion.div
        key="edit-modal"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ ...S.overlay, backgroundColor: "transparent" }}
        onClick={(e) => e.stopPropagation()}
        dir={dir}
      >
        <div style={S.modal}>
          <h2 style={S.title}>{t("editProductTitle")}</h2>

          {(uploading || saving) && (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
              <GoldSpinner fullScreen={false} size={36} />
            </div>
          )}
          {error   && <div style={S.errorMsg}>{error}</div>}
          {success && <div style={S.successMsg}>{success}</div>}

          {/* Product Name */}
          <label style={S.label}>{t("productName")}</label>
          <input style={S.input} value={form.productName} onChange={set("productName")} />

          {/* Description */}
          <label style={S.label}>{t("productDescription")}</label>
          <textarea style={S.textarea} value={form.productDescription} onChange={set("productDescription")} />

          {/* Karat + Weight */}
          <div style={S.row}>
            <div>
              <label style={S.label}>{t("productKarat")}</label>
              <select style={S.select} value={form.karat} onChange={set("karat")}>
                <option value="18">18K</option>
                <option value="21">21K</option>
                <option value="22">22K</option>
                <option value="24">24K</option>
              </select>
            </div>
            <div>
              <label style={S.label}>{t("productWeight")}</label>
              <input style={S.input} type="number" min="0" step="0.01" value={form.weight} onChange={set("weight")} />
            </div>
          </div>

          {/* Availability toggle */}
          <div style={S.toggle} onClick={() => setForm((p) => ({ ...p, isAvailable: !p.isAvailable }))}>
            <div style={S.toggleTrack(form.isAvailable)}>
              <div style={S.toggleThumb(form.isAvailable)} />
            </div>
            <span style={{ color: form.isAvailable ? "#4ADE80" : "#FCA5A5", fontWeight: 600, fontSize: "0.9rem" }}>
              {form.isAvailable ? t("productAvailable") : t("productUnavailable")}
            </span>
          </div>

          {/* Image */}
          {preview && <img src={preview} alt="preview" style={S.preview} />}
          <label style={S.uploadBtn}>
            📷 {preview ? t("addProductChangeImage") : t("addProductUploadImage")}
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
          </label>

          {/* Actions */}
          <button style={{ ...S.saveBtn, opacity: saving || uploading ? 0.7 : 1 }} onClick={handleSave} disabled={saving || uploading}>
            {saving ? t("loading") : t("editProductSave")}
          </button>
          <button style={S.cancelBtn} onClick={onClose}>{t("editProductCancel")}</button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default EditProductModal;
