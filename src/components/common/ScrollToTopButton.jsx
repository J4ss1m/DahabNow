/**
 * components/common/ScrollToTopButton.jsx
 * Appears after scrolling 300px down, smooth scrolls to top on click
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToTop}
          style={{
            position: "fixed",
            bottom: "2rem",
            insetInlineEnd: "2rem",
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "#D4AF37",
            color: "#263238",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.3rem",
            fontWeight: 700,
            boxShadow: "0 4px 16px rgba(212,175,55,0.4)",
            zIndex: 999,
          }}
          aria-label="Scroll to top"
        >
          ↑
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default ScrollToTopButton;
