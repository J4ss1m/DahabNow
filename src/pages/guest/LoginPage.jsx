/**
 * pages/guest/LoginPage.jsx
 * Firebase-authenticated login page for DahabNow.
 *
 * Flow:
 *   1. User submits email + password
 *   2. Firebase Auth signInWithEmailAndPassword
 *   3. Read role from Firestore /users/{uid}
 *   4. Redirect:  admin → /admin | seller → /seller | unknown → /register
 *   5. Show bilingual error on wrong credentials
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion }            from "framer-motion";
import { useTranslation }    from "react-i18next";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../../firebase/config";
import { useLanguage }               from "../../context/LanguageContext";
import DahabNowLogo                  from "../../components/common/DahabNowLogo";
import ForgotPassword                from "../../components/common/ForgotPassword";
import GoldSpinner                   from "../../components/common/GoldSpinner";

/* ── Map Firebase error codes → i18n keys ────────────────── */
const mapFirebaseError = (code) => {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "errorInvalidCredentials";
    case "auth/invalid-email":
      return "errorInvalidEmail";
    case "auth/network-request-failed":
      return "errorNetworkRequest";
    default:
      return "errorGeneric";
  }
};

/* ── Shared inline style tokens ─────────────────────────── */
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
    maxWidth:        "440px",
    boxShadow:       "0 8px 48px rgba(0,0,0,0.45)",
  },
  logoWrap: {
    display:        "flex",
    flexDirection:  "column",
    alignItems:     "center",
    gap:            "10px",
    marginBottom:   "1.75rem",
  },
  appName: {
    fontSize:    "1.1rem",
    fontWeight:  700,
    color:       "#D4AF37",
    letterSpacing: "0.04em",
    margin:      0,
  },
  title: {
    fontSize:     "1.45rem",
    fontWeight:   700,
    color:        "#FFFFFF",
    textAlign:    "center",
    marginBottom: "1.75rem",
    margin:       0,
  },
  label: {
    display:       "block",
    fontSize:      "0.88rem",
    fontWeight:    600,
    color:         "rgba(255,255,255,0.8)",
    marginBottom:  "0.4rem",
  },
  inputWrap: {
    position:      "relative",
    marginBottom:  "1.1rem",
  },
  input: {
    width:           "100%",
    padding:         "0.78rem 1rem",
    backgroundColor: "rgba(38,50,56,0.75)",
    border:          "1.5px solid rgba(212,175,55,0.35)",
    borderRadius:    "10px",
    color:           "#FFFFFF",
    fontFamily:      "'Tajawal', sans-serif",
    fontSize:        "0.95rem",
    outline:         "none",
    boxSizing:       "border-box",
    transition:      "border-color 0.2s",
  },
  inputFocused: {
    borderColor: "#D4AF37",
  },
  toggleBtn: {
    position:        "absolute",
    top:             "50%",
    transform:       "translateY(-50%)",
    background:      "none",
    border:          "none",
    color:           "#D4AF37",
    cursor:          "pointer",
    fontSize:        "0.82rem",
    fontFamily:      "'Tajawal', sans-serif",
    fontWeight:      600,
    padding:         "0 0.75rem",
  },
  ctaBtn: {
    width:           "100%",
    padding:         "0.9rem",
    backgroundColor: "#FFD700",
    color:           "#263238",
    border:          "none",
    borderRadius:    "12px",
    fontFamily:      "'Tajawal', sans-serif",
    fontSize:        "1rem",
    fontWeight:      800,
    cursor:          "pointer",
    marginTop:       "0.5rem",
    letterSpacing:   "0.07em",
    transition:      "opacity 0.2s, transform 0.15s",
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
  footer: {
    textAlign:  "center",
    marginTop:  "1.4rem",
    fontSize:   "0.9rem",
    color:      "rgba(255,255,255,0.65)",
  },
  link: {
    color:          "#D4AF37",
    fontWeight:     700,
    textDecoration: "none",
    marginInlineStart: "0.3rem",
  },
  forgotLink: {
    display:        "block",
    textAlign:      "end",
    color:          "#D4AF37",
    fontSize:       "0.87rem",
    fontWeight:     600,
    cursor:         "pointer",
    background:     "none",
    border:         "none",
    fontFamily:     "'Tajawal', sans-serif",
    padding:        0,
    marginTop:      "0.1rem",
    marginBottom:   "1.1rem",
  },
  divider: {
    height:          "1.5px",
    backgroundColor: "rgba(212,175,55,0.2)",
    margin:          "1.5rem 0",
    borderRadius:    "1px",
  },
};

function LoginPage() {
  const { t }        = useTranslation();
  const { language } = useLanguage();
  const navigate     = useNavigate();

  const [email,          setEmail]          = useState("");
  const [password,       setPassword]       = useState("");
  const [showPassword,   setShowPassword]   = useState(false);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState("");
  const [forgotOpen,     setForgotOpen]     = useState(false);
  const [emailFocused,   setEmailFocused]   = useState(false);
  const [pwFocused,      setPwFocused]      = useState(false);

  const dir = language === "ar" ? "rtl" : "ltr";

  /* ── Validation ─────────────────────────────────────────── */
  const validate = () => {
    if (!email.trim())    return t("errorRequiredField");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return t("errorInvalidEmail");
    if (!password)        return t("errorRequiredField");
    if (password.length < 8) return t("errorPasswordLength");
    return null;
  };

  /* ── Submit ─────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const uid = credential.user.uid;

      // Read role from Firestore
      const userSnap = await getDoc(doc(db, "users", uid));
      if (userSnap.exists()) {
        const role = userSnap.data().role;
        if (role === "admin")  return navigate("/admin");
        if (role === "seller") return navigate("/seller");
      }
      // No Firestore doc or unrecognised role → send to register
      navigate("/register");
    } catch (err) {
      console.error("[LoginPage] Auth error:", err);
      setError(t(mapFirebaseError(err.code)));
    } finally {
      setLoading(false);
    }
  };

  /* ── Google Login ───────────────────────────────────────── */
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user document exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        // Create new user document with role "user"
        await setDoc(doc(db, "users", user.uid), {
          accountId: user.uid,
          accountName: user.displayName || "User",
          role: "user",
          sellerEmail: user.email,
          isApproved: false,
          createdAt: serverTimestamp(),
          loginMethod: "google",
        });
        // New user → go to homepage
        navigate("/");
      } else {
        // Existing user → redirect based on role
        const data = userDoc.data();
        if (data.role === "admin") navigate("/admin");
        else if (data.role === "seller") navigate("/seller");
        else navigate("/");
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError(t("googleLoginError"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <GoldSpinner />;

  return (
    <>
      <ForgotPassword isOpen={forgotOpen} onClose={() => setForgotOpen(false)} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45 }}
        style={S.page}
        dir={dir}
      >
        {/* ── Card ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={S.card}
        >
          {/* Logo */}
          <div style={S.logoWrap}>
            <DahabNowLogo size={56} />
            <p style={S.appName}>DahabNow</p>
          </div>

          {/* Title */}
          <h1 style={{ ...S.title, marginBottom: "1.5rem" }}>
            {t("loginTitle")}
          </h1>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              style={S.errorBox}
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div style={S.inputWrap}>
              <label htmlFor="login-email" style={S.label}>
                {t("emailLabel")}
              </label>
              <input
                id="login-email"
                type="email"
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={()  => setEmailFocused(false)}
                style={{
                  ...S.input,
                  ...(emailFocused ? S.inputFocused : {}),
                }}
                autoComplete="email"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div style={S.inputWrap}>
              <label htmlFor="login-password" style={S.label}>
                {t("passwordLabel")}
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPwFocused(true)}
                  onBlur={()  => setPwFocused(false)}
                  style={{
                    ...S.input,
                    paddingInlineEnd: "4.5rem",
                    ...(pwFocused ? S.inputFocused : {}),
                  }}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    ...S.toggleBtn,
                    insetInlineEnd: 0,
                    insetInlineStart: "unset",
                  }}
                  aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                >
                  {showPassword ? t("hidePassword") : t("showPassword")}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <button
              type="button"
              style={S.forgotLink}
              onClick={() => setForgotOpen(true)}
            >
              {t("forgotPassword")}
            </button>

            {/* CTA */}
            <motion.button
              type="submit"
              style={S.ctaBtn}
              whileHover={{ opacity: 0.9, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              disabled={loading}
            >
              {t("loginButton")}
            </motion.button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1rem 0" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.15)" }} />
            <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>
              {t("orAuthorizeWith")}
            </span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.15)" }} />
          </div>

          {/* Google button */}
          <button onClick={handleGoogleLogin} style={{
            width: "100%",
            padding: "0.75rem",
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "1.5px solid rgba(255,255,255,0.2)",
            borderRadius: "10px",
            color: "#FFFFFF",
            fontFamily: "'Tajawal', sans-serif",
            fontSize: "0.95rem",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            transition: "all 0.2s",
          }}>
            {/* Google SVG icon */}
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            {t("continueWithGoogle")}
          </button>

          {/* Divider */}
          <div style={S.divider} />

          {/* Sign-up link */}
          <p style={S.footer}>
            {t("noAccount")}
            <Link to="/register" style={S.link}>
              {t("signUp")}
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </>
  );
}

export default LoginPage;
