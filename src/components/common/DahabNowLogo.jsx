/**
 * components/common/DahabNowLogo.jsx
 * Reusable logo SVG — two interlinked geometric rings in DahabNow gold.
 * Accepts optional size and className props for flexibility.
 * Features: subtle pulse animation and gold glow on hover.
 */

import { useState } from "react";
import { motion } from "framer-motion";

/**
 * @param {number} size      - Width and height of the SVG (default 40)
 * @param {string} className - Extra CSS classes
 * @param {boolean} animated - Enable animations (default true)
 */
function DahabNowLogo({ size = 40, className = "", animated = true }) {
  const [isHovered, setIsHovered] = useState(false);

  const svgElement = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-label="DahabNow Logo"
      role="img"
    >
      <path
        d="M15 20C15 14.477 19.477 10 25 10C30.523 10 35 14.477 35 20C35 25.523 30.523 30 25 30"
        stroke="#D4AF37"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M25 20C25 25.523 20.523 30 15 30C9.477 30 5 25.523 5 20C5 14.477 9.477 10 15 10"
        stroke="#D4AF37"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );

  if (!animated) {
    return svgElement;
  }

  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        display: "inline-block",
        boxShadow: isHovered
          ? "0 0 20px rgba(212, 175, 55, 0.6), inset 0 0 10px rgba(212, 175, 55, 0.2)"
          : "0 0 10px rgba(212, 175, 55, 0.3)",
        borderRadius: "50%",
        transition: "box-shadow 0.3s ease",
      }}
    >
      {svgElement}
    </motion.div>
  );
}

export default DahabNowLogo;
