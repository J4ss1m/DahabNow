/**
 * components/admin/ShopManagement.jsx
 * All approved shops — area assignment and suspend.
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db }           from "../../firebase/config";
import { useLanguage }  from "../../context/LanguageContext";
import { useToast }     from "../common/Toast";
import GoldSpinner      from "../common/GoldSpinner";

const CITY_AREAS = {
  Riyadh:  ["Al Olaya","Al Malaz","Al Rahmaniyah","Al Murabba","Al Naseem"],
  Jeddah:  ["Al Balad","Al Hamra","Al Rawdah","Al Safa","Al Andalus"],
  Madinah: ["Al Haram","Quba","Al Aqiq","Al Aziziyah","Al Khalidiyah"],
  Mecca:   ["Al Haram","Ajyad","Al Aziziyah","Mina","Arafat"],
  Dammam:  ["Al Faisaliyah","Al Shatea","Al Nuzha","Al Badia","Al Hamra"],
};

const S = {
  th: { padding: "0.65rem 1rem", textAlign: "start", fontSize: "0.78rem", fontWeight: 700, color: "#D4AF37", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" },
  td: { padding: "0.85rem 1rem", color: "#FFFFFF", fontSize: "0.9rem", verticalAlign: "middle" },
  select: { padding: "0.45rem 0.7rem", backgroundColor: "rgba(38,50,56,0.8)", border: "1px solid rgba(212,175,55,0.35)", borderRadius: "7px", color: "#FFFFFF", fontFamily: "'Tajawal', sans-serif", fontSize: "0.85rem", outline: "none", cursor: "pointer" },
  suspendBtn: { padding: "0.45rem 1rem", backgroundColor: "rgba(244,67,54,0.15)", border: "1px solid rgba(244,67,54,0.4)", borderRadius: "7px", color: "#F87171", fontFamily: "'Tajawal', sans-serif", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" },
  assignBtn: { padding: "0.45rem 1rem", backgroundColor: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.4)", borderRadius: "7px", color: "#D4AF37", fontFamily: "'Tajawal', sans-serif", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" },
};

function ShopManagement() {
  const { t }         = useTranslation();
  const { language }  = useLanguage();
  const { showToast } = useToast();
  const dir           = language === "ar" ? "rtl" : "ltr";

  const [shops,        setShops]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [areaSelects,  setAreaSelects]  = useState({}); // { shopId: selectedArea }
  const [busyShop,     setBusyShop]     = useState(null);

  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true);
      try {
        const q    = query(collection(db, "shops"), where("isApproved", "==", true));
        const snap = await getDocs(q);
        setShops(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchShops();
  }, []);

  const handleAssignArea = async (shopId, area) => {
    if (!area) return;
    setBusyShop(shopId);
    try {
      await updateDoc(doc(db, "shops", shopId), { shopArea: area });
      setShops((prev) => prev.map((s) => s.id === shopId ? { ...s, shopArea: area } : s));
      showToast(t("shopMgmtAreaAssigned"), "success");
    } catch { showToast(t("toastError"), "error"); }
    finally { setBusyShop(null); }
  };

  const handleSuspend = async (shopId) => {
    setBusyShop(shopId);
    try {
      await updateDoc(doc(db, "shops", shopId), { isApproved: false });
      setShops((prev) => prev.filter((s) => s.id !== shopId));
      showToast(t("shopMgmtSuspended"), "info");
    } catch { showToast(t("toastError"), "error"); }
    finally { setBusyShop(null); }
  };

  return (
    <section style={{ fontFamily: "'Tajawal', sans-serif" }} dir={dir}>
      <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#FFFFFF", margin: "0 0 1.5rem" }}>
        {t("shopMgmtTitle")}
      </h2>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <GoldSpinner fullScreen={false} size={48} />
        </div>
      ) : shops.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", padding: "3rem" }}>{t("shopMgmtEmpty")}</p>
      ) : (
        <div style={{ overflowX: "auto", borderRadius: "14px", border: "1px solid rgba(212,175,55,0.2)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
            <thead>
              <tr style={{ backgroundColor: "rgba(212,175,55,0.08)", borderBottom: "1px solid rgba(212,175,55,0.15)" }}>
                <th style={S.th}>{t("shopNameLabel")}</th>
                <th style={S.th}>{t("shopMgmtSellerName")}</th>
                <th style={S.th}>{t("myShopCity")}</th>
                <th style={S.th}>{t("myShopArea")}</th>
                <th style={S.th}>{t("shopMgmtActions")}</th>
              </tr>
            </thead>
            <tbody>
              {shops.map((shop, i) => {
                const areas      = CITY_AREAS[shop.shopCity] || [];
                const isBusy     = busyShop === shop.id;
                const selArea    = areaSelects[shop.id] ?? "";
                return (
                  <motion.tr
                    key={shop.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                      backgroundColor: i % 2 === 0 ? "rgba(69,90,100,0.3)" : "rgba(69,90,100,0.1)",
                    }}
                  >
                    <td style={S.td}><strong>{shop.shopName}</strong></td>
                    <td style={S.td}>{shop.sellerName || "—"}</td>
                    <td style={S.td}>{shop.shopCity}</td>
                    <td style={S.td}>{shop.shopArea || "—"}</td>
                    <td style={{ ...S.td, minWidth: "260px" }}>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                        {/* Area dropdown */}
                        {areas.length > 0 && (
                          <>
                            <select
                              value={selArea}
                              onChange={(e) => setAreaSelects((p) => ({ ...p, [shop.id]: e.target.value }))}
                              style={S.select}
                              disabled={isBusy}
                            >
                              <option value="">{t("shopMgmtSelectArea")}</option>
                              {areas.map((a) => <option key={a} value={a}>{a}</option>)}
                            </select>
                            <button
                              disabled={!selArea || isBusy}
                              onClick={() => handleAssignArea(shop.id, selArea)}
                              style={{ ...S.assignBtn, opacity: (!selArea || isBusy) ? 0.5 : 1 }}
                            >
                              {t("shopMgmtAssignArea")}
                            </button>
                          </>
                        )}
                        {/* Suspend */}
                        <button disabled={isBusy} onClick={() => handleSuspend(shop.id)} style={S.suspendBtn}>
                          {t("shopMgmtSuspend")}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default ShopManagement;
