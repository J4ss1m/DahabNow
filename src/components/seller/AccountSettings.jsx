/**
 * components/seller/AccountSettings.jsx
 * Inline settings — update profile fields and change password.
 * Updates: Firebase Auth displayName + Firestore users/{uid} document.
 */

import { useState }    from "react";
import { motion }      from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db }    from "../../firebase/config";
import { useAuth }     from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

/* ── Style tokens ────────────────────────────────────────────── */
const S = {
  section: { fontFamily: "'Tajawal', sans-serif", maxWidth: "640px" },
  title:   { fontSize: "1.3rem", fontWeight: 800, color: "#FFFFFF", margin: "0 0 1.5rem" },
  card: {
    backgroundColor: "#455A64", borderRadius: "14px",
    border: "1px solid rgba(212,175,55,0.2)", padding: "1.5rem",
    marginBottom: "1.25rem", boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
  },
  cardTitle: {
    fontSize: "0.78rem", fontWeight: 700, color: "#D4AF37",
    textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem",
  },
  row: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" },
  fieldWrap: { display: "flex", flexDirection: "column", gap: "0.3rem", marginBottom: "0.25rem" },
  label:  { fontSize: "0.84rem", fontWeight: 600, color: "rgba(255,255,255,0.7)" },
  input: {
    padding: "0.65rem 0.9rem",
    backgroundColor: "rgba(38,50,56,0.75)",
    border: "1.5px solid rgba(212,175,55,0.25)", borderRadius: "9px",
    color: "#FFFFFF", fontFamily: "'Tajawal', sans-serif", fontSize: "0.93rem",
    outline: "none", transition: "border-color 0.2s",
  },
  saveBtn: {
    marginTop: "1rem", padding: "0.65rem 1.6rem",
    backgroundColor: "#FFD700", color: "#263238",
    border: "none", borderRadius: "9px",
    fontFamily: "'Tajawal', sans-serif", fontSize: "0.92rem", fontWeight: 700,
    cursor: "pointer", transition: "opacity 0.2s",
  },
  successMsg: {
    backgroundColor: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.35)",
    borderRadius: "8px", padding: "0.6rem 0.9rem", color: "#4ADE80",
    fontSize: "0.86rem", marginTop: "0.75rem", textAlign: "center",
  },
  errorMsg: {
    backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.35)",
    borderRadius: "8px", padding: "0.6rem 0.9rem", color: "#FCA5A5",
    fontSize: "0.86rem", marginTop: "0.75rem", textAlign: "center",
  },
};

/* ── Reusable input field ────────────────────────────────────── */
function InputField({ label, value, onChange, type = "text", disabled }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={S.fieldWrap}>
      <label style={S.label}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...S.input,
          borderColor: focused ? "#D4AF37" : "rgba(212,175,55,0.25)",
          opacity: disabled ? 0.6 : 1,
        }}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ACCOUNT SETTINGS
   ══════════════════════════════════════════════════════════════ */
function AccountSettings({ currentUser, userProfile }) {
  const { t }        = useTranslation();
  const { language } = useLanguage();
  const dir          = language === "ar" ? "rtl" : "ltr";

  /* ── Profile state ───────────────────────────────────────── */
  const [profile, setProfile] = useState({
    accountName:     userProfile?.accountName     || "",
    sellerNumber:    userProfile?.sellerNumber     || "",
    contactWhatsApp: userProfile?.contactWhatsApp || "",
    sellerEmail:     userProfile?.sellerEmail      || "",
  });
  const [profileSaving,  setProfileSaving]  = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError,   setProfileError]   = useState("");

  /* ── Password state ──────────────────────────────────────── */
  const [pw, setPw] = useState({ current: "", newPw: "", confirm: "" });
  const [pwSaving,  setPwSaving]  = useState(false);
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError,   setPwError]   = useState("");
  const [showPw,    setShowPw]    = useState(false);

  /* ── Save profile ────────────────────────────────────────── */
  const saveProfile = async () => {
    setProfileError(""); setProfileSuccess("");
    if (!profile.accountName.trim()) { setProfileError(t("errorRequiredField")); return; }
    setProfileSaving(true);
    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        accountName:     profile.accountName.trim(),
        sellerNumber:    profile.sellerNumber.trim(),
        contactWhatsApp: profile.contactWhatsApp.trim(),
        sellerEmail:     profile.sellerEmail.trim(),
      });
      setProfileSuccess(t("settingsSaved"));
    } catch (e) {
      console.error("[AccountSettings] profile:", e);
      setProfileError(t("errorGeneric"));
    } finally {
      setProfileSaving(false);
    }
  };

  /* ── Change password ─────────────────────────────────────── */
  const changePassword = async () => {
    setPwError(""); setPwSuccess("");
    if (!pw.current)          { setPwError(t("errorRequiredField")); return; }
    if (!pw.newPw)            { setPwError(t("errorRequiredField")); return; }
    if (pw.newPw.length < 8)  { setPwError(t("errorPasswordLength")); return; }
    if (pw.newPw !== pw.confirm) { setPwError(t("errorPasswordMismatch")); return; }

    setPwSaving(true);
    try {
      // Re-authenticate first
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        pw.current
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, pw.newPw);
      setPwSuccess(t("settingsPasswordChanged"));
      setPw({ current: "", newPw: "", confirm: "" });
    } catch (e) {
      console.error("[AccountSettings] password:", e);
      if (e.code === "auth/wrong-password" || e.code === "auth/invalid-credential") {
        setPwError(t("errorInvalidCredentials"));
      } else if (e.code === "auth/requires-recent-login") {
        setPwError(t("settingsReqLogin"));
      } else {
        setPwError(t("settingsPasswordError"));
      }
    } finally {
      setPwSaving(false);
    }
  };

  const setP = (key) => (e) => setProfile((p) => ({ ...p, [key]: e.target.value }));
  const setPwField = (key) => (e) => setPw((p) => ({ ...p, [key]: e.target.value }));

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={S.section}
      dir={dir}
    >
      <h2 style={S.title}>{t("accountSettingsTitle")}</h2>

      {/* ── Profile Card ──────────────────────────────────── */}
      <div style={S.card}>
        <p style={S.cardTitle}>◆ {t("settingsDisplayName")}</p>

        <div style={S.row}>
          <InputField
            label={t("settingsDisplayName")}
            value={profile.accountName}
            onChange={setP("accountName")}
            disabled={profileSaving}
          />
          <InputField
            label={t("settingsContactEmail")}
            value={profile.sellerEmail}
            onChange={setP("sellerEmail")}
            type="email"
            disabled={profileSaving}
          />
        </div>
        <div style={S.row}>
          <InputField
            label={t("settingsPhone")}
            value={profile.sellerNumber}
            onChange={setP("sellerNumber")}
            disabled={profileSaving}
          />
          <InputField
            label={t("settingsWhatsApp")}
            value={profile.contactWhatsApp}
            onChange={setP("contactWhatsApp")}
            disabled={profileSaving}
          />
        </div>

        <button
          style={{ ...S.saveBtn, opacity: profileSaving ? 0.65 : 1 }}
          onClick={saveProfile}
          disabled={profileSaving}
        >
          {profileSaving ? t("loading") : t("settingsSave")}
        </button>

        {profileSuccess && <div style={S.successMsg}>{profileSuccess}</div>}
        {profileError   && <div style={S.errorMsg}>{profileError}</div>}
      </div>

      {/* ── Password Card ─────────────────────────────────── */}
      <div style={S.card}>
        <p style={S.cardTitle}>◆ {t("settingsChangePassword")}</p>

        <InputField
          label={t("settingsCurrentPassword")}
          value={pw.current}
          onChange={setPwField("current")}
          type={showPw ? "text" : "password"}
          disabled={pwSaving}
        />
        <div style={S.row}>
          <InputField
            label={t("settingsNewPassword")}
            value={pw.newPw}
            onChange={setPwField("newPw")}
            type={showPw ? "text" : "password"}
            disabled={pwSaving}
          />
          <InputField
            label={t("settingsConfirmNewPw")}
            value={pw.confirm}
            onChange={setPwField("confirm")}
            type={showPw ? "text" : "password"}
            disabled={pwSaving}
          />
        </div>

        {/* Show/hide toggle */}
        <button
          type="button"
          onClick={() => setShowPw((v) => !v)}
          style={{
            background: "none", border: "none", color: "#D4AF37",
            fontFamily: "'Tajawal', sans-serif", fontSize: "0.85rem",
            fontWeight: 600, cursor: "pointer", padding: 0, marginBottom: "0.5rem",
          }}
        >
          {showPw ? t("hidePassword") : t("showPassword")}
        </button>

        <button
          style={{ ...S.saveBtn, opacity: pwSaving ? 0.65 : 1, display: "block" }}
          onClick={changePassword}
          disabled={pwSaving}
        >
          {pwSaving ? t("loading") : t("settingsChangePassword")}
        </button>

        {pwSuccess && <div style={S.successMsg}>{pwSuccess}</div>}
        {pwError   && <div style={S.errorMsg}>{pwError}</div>}
      </div>
    </motion.section>
  );
}

export default AccountSettings;
