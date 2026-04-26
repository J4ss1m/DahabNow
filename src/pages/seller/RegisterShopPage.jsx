/**
 * pages/seller/RegisterShopPage.jsx
 * Shop registration page for Google-authenticated sellers.
 *
 * Flow:
 *   1. Validate shop fields
 *   2. Save shop to Firestore /shops with isApproved=false
 *   3. Update user doc → shopApplied: true
 *   4. Show success → redirect to homepage after 3 s
 */

import { useState }            from "react";
import { useNavigate }         from "react-router-dom";
import { motion }              from "framer-motion";
import { useTranslation }      from "react-i18next";
import { doc, setDoc, addDoc, collection, serverTimestamp, updateDoc } from "firebase/firestore";
import { db }                  from "../../firebase/config";
import { useLanguage }         from "../../context/LanguageContext";
import { useAuth }             from "../../context/AuthContext";
import DahabNowLogo            from "../../components/common/DahabNowLogo";
import GoldSpinner             from "../../components/common/GoldSpinner";

/* ── Cities list ─────────────────────────────────────────────── */
const CITIES = [
  { value: "Riyadh",  key: "cityRiyadh"  },
  { value: "Jeddah",  key: "cityJeddah"  },
  { value: "Madinah", key: "cityMadinah" },
  { value: "Mecca",   key: "cityMecca"   },
  { value: "Dammam",  key: "cityDammam"  },
];

/* ── Styles ──────────────────────────────────────────────────── */
const S = {
  page: {
    minHeight:       "100vh",
    backgroundColor: "#263238",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    padding:         "1.5rem",
    fontFamily:      "'Tajawal', sans-serif",
  },
  card: {
    backgroundColor: "#455A64",
    borderRadius:    "20px",
    border:          "1.5px solid #D4AF37",
    padding:         "2.5rem 2rem",
    width:           "100%",
    maxWidth:        "520px",
    boxShadow:       "0 8px 48px rgba(0,0,0,0.45)",
  },
  logoWrap: {
    display:       "flex",
    flexDirection: "column",
    alignItems:    "center",
    gap:           "10px",
    marginBottom:  "1.5rem",
  },
  appName: {
    fontSize:    "1.05rem",
    fontWeight:  700,
    color:       "#D4AF37",
    margin:      0,
  },
  title: {
    fontSize:     "1.4rem",
    fontWeight:   700,
    color:        "#FFFFFF",
    textAlign:    "center",
    marginBottom: "1.75rem",
    margin:       0,
  },
  sectionTitle: {
    fontSize:      "0.82rem",
    fontWeight:    700,
    color:         "#D4AF37",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    margin:        "1.5rem 0 0.75rem",
  },
  label: {
    display:      "block",
    fontSize:     "0.87rem",
    fontWeight:   600,
    color:        "rgba(255,255,255,0.8)",
    marginBottom: "0.35rem",
  },
  fieldWrap: {
    marginBottom: "1rem",
    position:     "relative",
  },
  input: {
    width:           "100%",
    padding:         "0.76rem 1rem",
    backgroundColor: "rgba(38,50,56,0.75)",
    border:          "1.5px solid rgba(212,175,55,0.3)",
    borderRadius:    "10px",
    color:           "#FFFFFF",
    fontFamily:      "'Tajawal', sans-serif",
    fontSize:        "0.94rem",
    outline:         "none",
    boxSizing:       "border-box",
    transition:      "border-color 0.2s",
  },
  inputFocus: {
    borderColor: "#D4AF37",
  },
  select: {
    width:           "100%",
    padding:         "0.76rem 1rem",
    backgroundColor: "rgba(38,50,56,0.75)",
    border:          "1.5px solid rgba(212,175,55,0.3)",
    borderRadius:    "10px",
    color:           "#FFFFFF",
    fontFamily:      "'Tajawal', sans-serif",
    fontSize:        "0.94rem",
    outline:         "none",
    boxSizing:       "border-box",
    cursor:          "pointer",
    appearance:      "none",
    WebkitAppearance: "none",
  },
  row: {
    display:             "grid",
    gridTemplateColumns: "1fr 1fr",
    gap:                 "1rem",
  },
  ctaBtn: {
    width:          "100%",
    padding:        "0.9rem",
    backgroundColor:"#FFD700",
    color:          "#263238",
    border:         "none",
    borderRadius:   "12px",
    fontFamily:     "'Tajawal', sans-serif",
    fontSize:       "1rem",
    fontWeight:     800,
    cursor:         "pointer",
    marginTop:      "1.5rem",
    letterSpacing:  "0.06em",
    transition:     "opacity 0.2s, transform 0.15s",
  },
  errorBox: {
    backgroundColor: "rgba(239,68,68,0.12)",
    border:          "1px solid rgba(239,68,68,0.45)",
    borderRadius:    "10px",
    padding:         "0.7rem 1rem",
    color:           "#FCA5A5",
    fontSize:        "0.88rem",
    marginBottom:    "1rem",
    textAlign:       "center",
  },
  successBox: {
    backgroundColor: "rgba(212,175,55,0.1)",
    border:          "1.5px solid #D4AF37",
    borderRadius:    "12px",
    padding:         "1.2rem 1.5rem",
    color:           "#D4AF37",
    fontSize:        "1rem",
    fontWeight:      600,
    textAlign:       "center",
    marginTop:       "1rem",
  },
};

/* ── Field component ─────────────────────────────────────────── */
function Field({ id, label, children }) {
  return (
    <div style={S.fieldWrap}>
      <label htmlFor={id} style={S.label}>{label}</label>
      {children}
    </div>
  );
}

function RegisterShopPage() {
  const { t }        = useTranslation();
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const navigate     = useNavigate();

  const dir = language === "ar" ? "rtl" : "ltr";

  /* ── Form state ────────────────────────────────────────────── */
  const [form, setForm] = useState({
    shopName:    "",
    shopCity:    "",
    shopArea:    "",
    shopAddress: "",
    whatsapp:    "",
    email:       "",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState("");

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  /* ── Validation ─────────────────────────────────────────────── */
  const validate = () => {
    const { shopName, shopCity, shopArea, shopAddress, whatsapp, email } = form;

    if (!shopName.trim() || !shopCity || !shopArea.trim() || !shopAddress.trim() ||
        !whatsapp.trim() || !email.trim())
      return t("errorRequiredField");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return t("errorInvalidEmail");

    return null;
  };

  /* ── Submit ─────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    try {
      // Save shop to /shops
      await addDoc(collection(db, "shops"), {
        sellerId:    currentUser.uid,
        shopName:    form.shopName.trim(),
        shopCity:    form.shopCity,
        shopArea:    form.shopArea.trim(),
        shopAddress: form.shopAddress.trim(),
        contactWhatsApp: form.whatsapp.trim(),
        contactEmail: form.email.trim(),
        isApproved:  false,
        createdAt:   serverTimestamp(),
      });

      // Update user doc → shopApplied: true
      await updateDoc(doc(db, "users", currentUser.uid), {
        shopApplied: true,
      });

      // Show success & redirect after 3 s
      setSuccess(true);
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      console.error("[RegisterShopPage]", err);
      setError(t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not logged in
  if (!currentUser) {
    navigate("/login");
    return null;
  }

  if (loading) return <GoldSpinner />;

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={S.page}
      dir={dir}
    >
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={S.card}
      >
        {/* Logo */}
        <div style={S.logoWrap}>
          <DahabNowLogo size={52} />
          <p style={S.appName}>DahabNow</p>
        </div>

        {/* Title */}
        <h1 style={{ ...S.title, marginBottom: "0.5rem" }}>
          {t("registerShopTitle")}
        </h1>

        {/* Success state */}
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={S.successBox}
          >
            <FiCheckCircle size="1.8rem" style={{ marginBottom: "0.5rem", color: "#4ADE80" }} />
            <p style={{ margin: 0 }}>{t("shopApplicationPending")}</p>
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem", opacity: 0.75 }}>
              {t("redirectingHome")}
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {/* Error banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                style={S.errorBox}
              >
                {error}
              </motion.div>
            )}

            {/* ── Shop Details ─────────────────────────────── */}
            <p style={S.sectionTitle}>◆ {t("shopDetails")}</p>

            <Field id="reg-shopname" label={t("shopNameLabel")}>
              <input
                id="reg-shopname"
                type="text"
                placeholder={t("shopNamePlaceholder")}
                value={form.shopName}
                onChange={set("shopName")}
                onFocus={() => setFocused("shopName")}
                onBlur={() => setFocused("")}
                style={{ ...S.input, ...(focused === "shopName" ? S.inputFocus : {}) }}
              />
            </Field>

            {/* City + Area row */}
            <div style={S.row}>
              <Field id="reg-city" label={t("shopCityLabel")}>
                <select
                  id="reg-city"
                  value={form.shopCity}
                  onChange={set("shopCity")}
                  style={S.select}
                >
                  <option value="" disabled>{t("selectCity")}</option>
                  {CITIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {t(c.key)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field id="reg-area" label={t("shopAreaLabel")}>
                <input
                  id="reg-area"
                  type="text"
                  placeholder={t("shopAreaPlaceholder")}
                  value={form.shopArea}
                  onChange={set("shopArea")}
                  onFocus={() => setFocused("shopArea")}
                  onBlur={() => setFocused("")}
                  style={{ ...S.input, ...(focused === "shopArea" ? S.inputFocus : {}) }}
                />
              </Field>
            </div>

            <Field id="reg-address" label={t("shopAddressLabel")}>
              <input
                id="reg-address"
                type="text"
                placeholder={t("shopAddressPlaceholder")}
                value={form.shopAddress}
                onChange={set("shopAddress")}
                onFocus={() => setFocused("shopAddress")}
                onBlur={() => setFocused("")}
                style={{ ...S.input, ...(focused === "shopAddress" ? S.inputFocus : {}) }}
              />
            </Field>

            {/* Contact row */}
            <div style={S.row}>
              <Field id="reg-whatsapp" label={t("whatsappLabel")}>
                <input
                  id="reg-whatsapp"
                  type="tel"
                  placeholder={t("whatsappPlaceholder")}
                  value={form.whatsapp}
                  onChange={set("whatsapp")}
                  onFocus={() => setFocused("whatsapp")}
                  onBlur={() => setFocused("")}
                  style={{ ...S.input, ...(focused === "whatsapp" ? S.inputFocus : {}) }}
                />
              </Field>
              <Field id="reg-email" label={t("emailLabel")}>
                <input
                  id="reg-email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  value={form.email}
                  onChange={set("email")}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused("")}
                  style={{ ...S.input, ...(focused === "email" ? S.inputFocus : {}) }}
                  autoComplete="email"
                />
              </Field>
            </div>

            {/* CTA */}
            <motion.button
              type="submit"
              style={S.ctaBtn}
              whileHover={{ opacity: 0.9, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
            >
              {t("submitShopApplication")}
            </motion.button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

export default RegisterShopPage;