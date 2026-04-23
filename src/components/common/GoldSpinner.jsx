/**
 * components/common/GoldSpinner.jsx
 * Reusable loading spinner — the DahabNow logo rotates continuously.
 * Used in ProtectedRoute, auth flows, and any async data-loading state.
 *
 * Props:
 *   fullScreen {boolean} - If true, centres the spinner on a full dark overlay.
 *                          If false, renders inline (for embedding in cards, etc.)
 *   size       {number}  - Diameter of the logo in px (default 64)
 */

import { motion } from "framer-motion";
import DahabNowLogo from "./DahabNowLogo";

function GoldSpinner({ fullScreen = true, size = 64 }) {
  const spinner = (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 1.4,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
      aria-label="Loading"
      role="status"
    >
      <DahabNowLogo size={size} />
    </motion.div>
  );

  if (!fullScreen) return spinner;

  return (
    <div
      style={{
        position:        "fixed",
        inset:           0,
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        backgroundColor: "#263238",
        zIndex:          9999,
      }}
    >
      {spinner}
    </div>
  );
}

export default GoldSpinner;
