/**
 * components/header/NotificationsPanel.jsx
 * Slide-down notifications panel for the header bell icon.
 * Reads from Firestore notifications collection, latest 10.
 * Mark-all-read stored in localStorage to avoid extra writes.
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence }     from "framer-motion";
import { useTranslation }              from "react-i18next";
import { FiBell, FiClock }             from "react-icons/fi";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db }          from "../../firebase/config";
import { useLanguage } from "../../context/LanguageContext";

const GOLD = "#D4AF37";
const READ_KEY = "dahabnow_notif_readAt";

/* ── Time-ago helper ────────────────────────────────────────── */
function timeAgo(ts, t) {
  if (!ts) return "";
  const d   = ts.toDate ? ts.toDate() : new Date(ts);
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60)  return t("notifJustNow");
  if (sec < 3600)  return `${Math.floor(sec / 60)} ${t("notifMinutesAgo")}`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} ${t("notifHoursAgo")}`;
  return `${Math.floor(sec / 86400)} ${t("notifDaysAgo")}`;
}

const S = {
  panel: { position: "absolute", top: "calc(100% + 10px)", insetInlineEnd: 0, width: "320px", backgroundColor: "#2d3f47", border: "1.5px solid rgba(212,175,55,0.3)", borderRadius: "16px", boxShadow: "0 8px 36px rgba(0,0,0,0.5)", zIndex: 1600, fontFamily: "'Tajawal', sans-serif", overflow: "hidden" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.9rem 1rem 0.7rem", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  title: { fontWeight: 700, color: "#FFFFFF", fontSize: "0.92rem", margin: 0 },
  markBtn: { background: "none", border: "none", color: GOLD, fontFamily: "'Tajawal', sans-serif", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", padding: "2px 0" },
  body: { maxHeight: "340px", overflowY: "auto" },
  item: (unread) => ({ padding: "0.75rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.04)", borderInlineStart: unread ? `3px solid ${GOLD}` : "3px solid transparent", backgroundColor: unread ? "rgba(212,175,55,0.05)" : "transparent", cursor: "default" }),
  itemTitle: { fontSize: "0.88rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "3px" },
  itemPreview: { fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.4, marginBottom: "4px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  itemTime: { fontSize: "0.73rem", color: "rgba(255,255,255,0.3)" },
  empty: { padding: "2rem 1rem", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "0.88rem" },
};

/* ── Bell icon with red dot ─────────────────────────────────── */
export function BellButton({ onClick, hasUnread }) {
  return (
    <button onClick={onClick} style={{ position: "relative", background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontSize: "1.2rem" }}>🔔</span>
      {hasUnread && (
        <span style={{ position: "absolute", top: "2px", insetInlineEnd: "2px", width: "8px", height: "8px", backgroundColor: "#EF4444", borderRadius: "50%", border: "1.5px solid #263238" }} />
      )}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
   NOTIFICATIONS PANEL
   ══════════════════════════════════════════════════════════════ */
function NotificationsPanel({ onClose }) {
  const { t }        = useTranslation();
  const { language } = useLanguage();
  const dir          = language === "ar" ? "rtl" : "ltr";

  const [notifs,    setNotifs]   = useState([]);
  const [loading,   setLoading]  = useState(true);
  const [readTime,  setReadTime] = useState(() => {
    const raw = localStorage.getItem(READ_KEY);
    return raw ? parseInt(raw) : 0;
  });
  const panelRef = useRef(null);

  /* ── Real-time listener ─────────────────────────────────── */
  useEffect(() => {
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"), limit(10));
    const unsub = onSnapshot(q, (snap) => {
      setNotifs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  /* ── Close on outside click ─────────────────────────────── */
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const markAllRead = () => {
    const now = Date.now();
    localStorage.setItem(READ_KEY, String(now));
    setReadTime(now);
  };

  const isUnread = (notif) => {
    if (!notif.createdAt) return false;
    const created = notif.createdAt.toDate ? notif.createdAt.toDate().getTime() : new Date(notif.createdAt).getTime();
    return created > readTime;
  };

  const hasUnread = notifs.some(isUnread);

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
      animate={{ opacity: 1, y: 0, scaleY: 1 }}
      exit={{ opacity: 0, y: -10, scaleY: 0.95 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      style={S.panel}
      dir={dir}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div style={S.header}>
        <p style={S.title}><FiBell size={20} /> {t("notifTitle")}</p>
        {hasUnread && (
          <button style={S.markBtn} onClick={markAllRead}>{t("notifMarkRead")}</button>
        )}
      </div>

      {/* Body */}
      <div style={S.body}>
        {loading ? (
          <div style={S.empty}><FiClock size={28} /></div>
        ) : notifs.length === 0 ? (
          <div style={S.empty}>{t("notifEmpty")}</div>
        ) : (
          notifs.map((n) => {
            const unread = isUnread(n);
            return (
              <div key={n.id} style={S.item(unread)}>
                <div style={S.itemTitle}>{n.title}</div>
                <div style={S.itemPreview}>{n.content}</div>
                <div style={S.itemTime}>{timeAgo(n.createdAt, t)}</div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

export { NotificationsPanel };
export default NotificationsPanel;
