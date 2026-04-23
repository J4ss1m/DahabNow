/**
 * components/seller/MyProducts.jsx
 * Displays a grid of the seller's products fetched from Firestore.
 * Supports availability toggle, edit modal, and delete with confirmation.
 */

import { useState, useEffect }     from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation }          from "react-i18next";
import {
  collection, query, where,
  getDocs, doc, deleteDoc, updateDoc,
} from "firebase/firestore";
import { db }               from "../../firebase/config";
import { useLanguage }      from "../../context/LanguageContext";
import GoldSpinner          from "../common/GoldSpinner";
import EditProductModal     from "./EditProductModal";

/* ── Delete Confirm Dialog ───────────────────────────────────── */
function DeleteConfirm({ onConfirm, onCancel, dir }) {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.65)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1200, padding: "1.25rem",
        }}
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.88, opacity: 0 }}
          transition={{ duration: 0.22 }}
          style={{
            backgroundColor: "#263238", border: "1.5px solid rgba(239,68,68,0.4)",
            borderRadius: "16px", padding: "1.75rem", maxWidth: "380px",
            width: "100%", textAlign: "center", fontFamily: "'Tajawal', sans-serif",
          }}
          onClick={(e) => e.stopPropagation()}
          dir={dir}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🗑️</div>
          <p style={{ color: "#FFFFFF", fontSize: "1rem", fontWeight: 600, margin: "0 0 1.25rem" }}>
            {t("productDeleteConfirm")}
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <button
              onClick={onCancel}
              style={{
                padding: "0.65rem 1.4rem", borderRadius: "9px",
                backgroundColor: "transparent", border: "1px solid rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.7)", fontFamily: "'Tajawal', sans-serif",
                fontSize: "0.9rem", cursor: "pointer",
              }}
            >
              {t("productDeleteNo")}
            </button>
            <button
              onClick={onConfirm}
              style={{
                padding: "0.65rem 1.4rem", borderRadius: "9px",
                backgroundColor: "#EF4444", border: "none",
                color: "#FFFFFF", fontFamily: "'Tajawal', sans-serif",
                fontSize: "0.9rem", fontWeight: 700, cursor: "pointer",
              }}
            >
              {t("productDeleteYes")}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Product Card ────────────────────────────────────────────── */
function ProductCard({ product, productId, index, onEdit, onDelete, onToggleAvailability }) {
  const { t } = useTranslation();
  const [hov, setHov] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay: index * 0.06 }}
      style={{
        backgroundColor: hov ? "#506070" : "#455A64",
        border: `1px solid ${hov ? "#D4AF37" : "rgba(212,175,55,0.2)"}`,
        borderRadius: "14px",
        overflow: "hidden",
        transition: "background-color 0.2s, border-color 0.2s",
        fontFamily: "'Tajawal', sans-serif",
        boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Image */}
      <div style={{
        width: "100%", height: "160px", overflow: "hidden",
        backgroundColor: "rgba(38,50,56,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {product.productPicture ? (
          <img
            src={product.productPicture}
            alt={product.productName}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: "2.5rem", opacity: 0.4 }}>💎</span>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "1rem" }}>
        {/* Name */}
        <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "#FFFFFF", margin: "0 0 0.35rem", lineHeight: 1.3 }}>
          {product.productName}
        </p>

        {/* Karat + Weight */}
        <p style={{ fontSize: "0.82rem", color: "#D4AF37", margin: "0 0 0.75rem" }}>
          {product.karat}K · {product.weight}g
        </p>

        {/* Availability toggle */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.9rem", cursor: "pointer" }}
          onClick={() => onToggleAvailability(productId, !product.isAvailable)}
        >
          <div style={{
            width: "38px", height: "20px", borderRadius: "10px",
            backgroundColor: product.isAvailable ? "#4ADE80" : "#455A64",
            position: "relative", transition: "background-color 0.25s",
            border: "1px solid rgba(255,255,255,0.1)",
          }}>
            <div style={{
              position: "absolute", top: "1px",
              left: product.isAvailable ? "18px" : "1px",
              width: "16px", height: "16px", borderRadius: "50%",
              backgroundColor: "#FFFFFF", transition: "left 0.25s",
            }} />
          </div>
          <span style={{
            fontSize: "0.82rem", fontWeight: 600,
            color: product.isAvailable ? "#4ADE80" : "#FCA5A5",
          }}>
            {product.isAvailable ? t("productAvailable") : t("productUnavailable")}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => onEdit(product, productId)}
            style={{
              flex: 1, padding: "0.5rem", borderRadius: "8px",
              backgroundColor: "rgba(212,175,55,0.15)",
              border: "1px solid rgba(212,175,55,0.35)",
              color: "#D4AF37", fontFamily: "'Tajawal', sans-serif",
              fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
            }}
          >
            ✏️ {t("productEdit")}
          </button>
          <button
            onClick={() => onDelete(productId)}
            style={{
              flex: 1, padding: "0.5rem", borderRadius: "8px",
              backgroundColor: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#FCA5A5", fontFamily: "'Tajawal', sans-serif",
              fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
            }}
          >
            🗑️ {t("productDelete")}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MY PRODUCTS
   ══════════════════════════════════════════════════════════════ */
function MyProducts({ shopId, currentUser }) {
  const { t }        = useTranslation();
  const { language } = useLanguage();
  const dir          = language === "ar" ? "rtl" : "ltr";

  const [products,      setProducts]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [editProduct,   setEditProduct]   = useState(null); // { product, productId }
  const [deleteId,      setDeleteId]      = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState("");

  const fetchProducts = async () => {
    if (!shopId) return;
    setLoading(true);
    try {
      const q    = query(collection(db, "products"), where("shopId", "==", shopId));
      const snap = await getDocs(q);
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("[MyProducts]", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [shopId]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, "products", deleteId));
      setProducts((p) => p.filter((x) => x.id !== deleteId));
      setDeleteSuccess(t("productDeleted"));
      setTimeout(() => setDeleteSuccess(""), 3000);
    } catch (e) { console.error(e); }
    finally { setDeleteId(null); }
  };

  const handleToggleAvailability = async (productId, newVal) => {
    try {
      await updateDoc(doc(db, "products", productId), { isAvailable: newVal });
      setProducts((p) => p.map((x) => x.id === productId ? { ...x, isAvailable: newVal } : x));
    } catch (e) { console.error(e); }
  };

  return (
    <section style={{ fontFamily: "'Tajawal', sans-serif" }} dir={dir}>
      <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#FFFFFF", margin: "0 0 1.25rem" }}>
        {t("myProductsTitle")}
      </h2>

      {deleteSuccess && (
        <div style={{
          backgroundColor: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.35)",
          borderRadius: "9px", padding: "0.65rem 1rem", color: "#4ADE80",
          fontSize: "0.88rem", marginBottom: "1rem", textAlign: "center",
        }}>
          {deleteSuccess}
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem 0" }}>
          <GoldSpinner fullScreen={false} size={48} />
        </div>
      ) : products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: "center", padding: "3rem 1rem" }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>💎</div>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.97rem" }}>
            {t("myProductsEmpty")}
          </p>
        </motion.div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "1rem",
        }}>
          {products.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              productId={p.id}
              index={i}
              onEdit={(prod, id) => setEditProduct({ product: prod, productId: id })}
              onDelete={(id) => setDeleteId(id)}
              onToggleAvailability={handleToggleAvailability}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <DeleteConfirm
          dir={dir}
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {/* Edit modal */}
      {editProduct && (
        <EditProductModal
          product={editProduct.product}
          productId={editProduct.productId}
          dir={dir}
          onClose={() => setEditProduct(null)}
          onSaved={fetchProducts}
        />
      )}
    </section>
  );
}

export default MyProducts;
