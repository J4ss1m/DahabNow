/**
 * components/admin/ContentManagement.jsx
 * Post global notifications + manage featured shops.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMegaphone, FiClipboard, FiStar } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import {
  collection, query, where, getDocs, addDoc,
  deleteDoc, doc, updateDoc, orderBy, onSnapshot, serverTimestamp,
} from "firebase/firestore";
import { db }           from "../../firebase/config";
import { useAuth }      from "../../context/AuthContext";
import { useLanguage }  from "../../context/LanguageContext";
import { useToast }     from "../common/Toast";
import GoldSpinner      from "../common/GoldSpinner";

const S = {
  card: { backgroundColor: "#455A64", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "16px", padding: "1.5rem", marginBottom: "1.5rem" },
  sectionTitle: { fontSize: "1rem", fontWeight: 700, color: "#D4AF37", marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: "1px solid rgba(212,175,55,0.15)" },
  label: { display: "block", fontSize: "0.82rem", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "0.3rem" },
  input: { width: "100%", padding: "0.65rem 0.9rem", backgroundColor: "rgba(38,50,56,0.75)", border: "1.5px solid rgba(212,175,55,0.25)", borderRadius: "9px", color: "#FFFFFF", fontFamily: "'Tajawal', sans-serif", fontSize: "0.92rem", outline: "none", boxSizing: "border-box", marginBottom: "1rem" },
  textarea: { width: "100%", padding: "0.65rem 0.9rem", resize: "vertical", minHeight: "90px", backgroundColor: "rgba(38,50,56,0.75)", border: "1.5px solid rgba(212,175,55,0.25)", borderRadius: "9px", color: "#FFFFFF", fontFamily: "'Tajawal', sans-serif", fontSize: "0.92rem", outline: "none", boxSizing: "border-box", marginBottom: "1rem" },
  submitBtn: { padding: "0.7rem 1.6rem", backgroundColor: "#FFD700", color: "#263238", border: "none", borderRadius: "9px", fontFamily: "'Tajawal', sans-serif", fontSize: "0.92rem", fontWeight: 700, cursor: "pointer", transition: "opacity 0.2s" },
  notifRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", padding: "0.75rem 0", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  deleteBtn: { padding: "0.35rem 0.8rem", backgroundColor: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "7px", color: "#FCA5A5", fontFamily: "'Tajawal', sans-serif", fontSize: "0.8rem", cursor: "pointer", flexShrink: 0 },
  toggle: (on) => ({ display: "inline-flex", alignItems: "center", gap: "6px", padding: "0.35rem 0.9rem", borderRadius: "20px", border: "none", cursor: "pointer", fontFamily: "'Tajawal', sans-serif", fontSize: "0.82rem", fontWeight: 700, backgroundColor: on ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.08)", color: on ? "#D4AF37" : "rgba(255,255,255,0.5)", transition: "all 0.2s" }),
};

function ContentManagement() {
  const { t }           = useTranslation();
  const { language }    = useLanguage();
  const { currentUser } = useAuth();
  const { showToast }   = useToast();
  const dir             = language === "ar" ? "rtl" : "ltr";

  const [title,      setTitle]      = useState("");
  const [body,       setBody]       = useState("");
  const [posting,    setPosting]    = useState(false);
  const [notifs,     setNotifs]     = useState([]);
  const [notifsLoad, setNotifsLoad] = useState(true);
  const [shops,      setShops]      = useState([]);
  const [shopsLoad,  setShopsLoad]  = useState(true);

  /* ── Load notifications (real-time) ─────────────────────── */
  useEffect(() => {
    const q = query(collection(db, "notifications"), where("type", "==", "news"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setNotifs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setNotifsLoad(false);
    });
    return () => unsub();
  }, []);

  /* ── Load approved shops ─────────────────────────────────── */
  useEffect(() => {
    const fetchShops = async () => {
      const q    = query(collection(db, "shops"), where("isApproved", "==", true));
      const snap = await getDocs(q);
      setShops(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setShopsLoad(false);
    };
    fetchShops();
  }, []);

  /* ── Post notification ───────────────────────────────────── */
  const handlePost = async () => {
    if (!title.trim() || !body.trim()) return;
    setPosting(true);
    try {
      await addDoc(collection(db, "notifications"), {
        title:     title.trim(),
        content:   body.trim(),
        type:      "news",
        createdAt: serverTimestamp(),
        createdBy: currentUser?.uid,
      });
      setTitle(""); setBody("");
      showToast(t("contentNewsSuccess"), "success");
    } catch { showToast(t("toastError"), "error"); }
    finally { setPosting(false); }
  };

  /* ── Delete notification ─────────────────────────────────── */
  const handleDeleteNotif = async (id) => {
    try {
      await deleteDoc(doc(db, "notifications", id));
      showToast(t("toastDeleteOk"), "info");
    } catch { showToast(t("toastError"), "error"); }
  };

  /* ── Toggle featured ─────────────────────────────────────── */
  const handleToggleFeatured = async (shopId, current) => {
    try {
      await updateDoc(doc(db, "shops", shopId), { isFeatured: !current });
      setShops((prev) => prev.map((s) => s.id === shopId ? { ...s, isFeatured: !current } : s));
      showToast(t("contentFeaturedUpdated"), "success");
    } catch { showToast(t("toastError"), "error"); }
  };

  const fmt = (ts) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString(language === "ar" ? "ar-SA" : "en-US");
  };

  return (
    <section style={{ fontFamily: "'Tajawal', sans-serif", maxWidth: "800px" }} dir={dir}>
      <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#FFFFFF", margin: "0 0 1.5rem" }}>
        {t("contentMgmtTitle")}
      </h2>

      {/* ── Post news ─────────────────────────────────────── */}
      <div style={S.card}>
        <p style={S.sectionTitle}><FiMegaphone size={18} /> {t("contentPostNews")}</p>
        <label style={S.label}>{t("contentNewsTitle")}</label>
        <input style={S.input} placeholder={t("contentNewsTitlePlaceholder")} value={title} onChange={(e) => setTitle(e.target.value)} />
        <label style={S.label}>{t("contentNewsBody")}</label>
        <textarea style={S.textarea} placeholder={t("contentNewsBodyPlaceholder")} value={body} onChange={(e) => setBody(e.target.value)} />
        <button style={{ ...S.submitBtn, opacity: posting ? 0.65 : 1 }} onClick={handlePost} disabled={posting || !title.trim() || !body.trim()}>
          {posting ? t("loading") : t("contentNewsSubmit")}
        </button>
      </div>

      {/* ── Current notifications ──────────────────────────── */}
      <div style={S.card}>
        <p style={S.sectionTitle}><FiClipboard size={18} /> {t("contentCurrentNotifs")}</p>
        {notifsLoad ? <GoldSpinner fullScreen={false} size={36} /> :
          notifs.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.9rem" }}>{t("contentNewsEmpty")}</p>
          ) : (
            <AnimatePresence>
              {notifs.map((n) => (
                <motion.div key={n.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={S.notifRow}>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: "#FFFFFF", fontWeight: 700, margin: "0 0 0.25rem", fontSize: "0.92rem" }}>{n.title}</p>
                    <p style={{ color: "rgba(255,255,255,0.55)", margin: "0 0 0.2rem", fontSize: "0.84rem" }}>{n.content}</p>
                    <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.78rem" }}>{fmt(n.createdAt)}</span>
                  </div>
                  <button style={S.deleteBtn} onClick={() => handleDeleteNotif(n.id)}>{t("contentNewsDelete")}</button>
                </motion.div>
              ))}
            </AnimatePresence>
          )
        }
      </div>

      {/* ── Featured shops ────────────────────────────────── */}
      <div style={S.card}>
        <p style={S.sectionTitle}><FiStar size={18} /> {t("contentFeaturedShops")}</p>
        {shopsLoad ? <GoldSpinner fullScreen={false} size={36} /> :
          shops.map((shop) => (
            <div key={shop.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.65rem 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div>
                <span style={{ color: "#FFFFFF", fontWeight: 600, fontSize: "0.92rem" }}>{shop.shopName}</span>
                <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.82rem", marginInlineStart: "8px" }}>{shop.shopCity}</span>
              </div>
              <button style={S.toggle(!!shop.isFeatured)} onClick={() => handleToggleFeatured(shop.id, !!shop.isFeatured)}>
                {shop.isFeatured ? <><FiStar size={16} /> {t("contentFeaturedOn")}</> : <><FiStar size={16} style={{ opacity: 0.35 }} /> {t("contentFeaturedOff")}</>}
              </button>
            </div>
          ))
        }
      </div>
    </section>
  );
}

export default ContentManagement;
