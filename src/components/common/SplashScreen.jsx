/**
 * components/common/SplashScreen.jsx
 * Full-screen intro animation shown once on first visit.
 *
 * Behaviour:
 *   - Checks localStorage "dahabnow_splashSeen" key
 *   - If not seen: shows logo + brand name for 2.5 s then fades out
 *   - Sets the key so future visits skip the splash
 *   - Calls onComplete() when the exit animation finishes so App can unmount it
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DahabNowLogo from "./DahabNowLogo";

/**
 * @param {Function} onComplete - Called after the splash exits (parent unmounts this)
 */
function SplashScreen({ onComplete }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Start exit after 2.5 s
    const timer = setTimeout(() => {
      setVisible(false);
      localStorage.setItem("dahabnow_splashSeen", "true");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{
            position:        "fixed",
            inset:           0,
            backgroundColor: "#263238",
            display:         "flex",
            flexDirection:   "column",
            alignItems:      "center",
            justifyContent:  "center",
            zIndex:          9999,
            gap:             "20px",
          }}
        >
          {/* Logo: scale + fade in */}
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <DahabNowLogo size={90} />
          </motion.div>

          {/* Brand name: slide up + fade in, slightly delayed */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.55, ease: "easeOut" }}
            style={{
              fontFamily: "'Tajawal', sans-serif",
              fontSize:   "2.2rem",
              fontWeight: 800,
              color:      "#D4AF37",
              letterSpacing: "0.04em",
              margin:     0,
            }}
          >
            DahabNow
          </motion.h1>

          {/* Subtle golden underline bar */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.5, ease: "easeOut" }}
            style={{
              width:           80,
              height:          3,
              backgroundColor: "#D4AF37",
              borderRadius:    2,
              transformOrigin: "left center",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SplashScreen;
