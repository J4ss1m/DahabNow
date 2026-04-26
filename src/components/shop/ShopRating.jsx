import { useState } from "react";
import { FiStar } from "react-icons/fi";

const GOLD = "#D4AF37";
const EMPTY = "rgba(255,255,255,0.2)";

function ShopRating({
  averageRating = 0,
  totalRatings = 0,
  userRating = null,
  isLoggedIn = false,
  onRate,
  dir = "ltr",
}) {
  const [hovered, setHovered] = useState(0);

  const hasUserRated = typeof userRating === "number" && userRating >= 1;
  const interactive = isLoggedIn && !hasUserRated && typeof onRate === "function";
  const displayRating = hasUserRated ? userRating : averageRating;
  const visualRating = interactive && hovered ? hovered : displayRating;

  return (
    <div dir={dir} style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.28rem" }}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.round(visualRating || 0);
          const color = filled ? GOLD : EMPTY;

          if (!interactive) {
            return (
              <span key={star} style={{ color, display: "inline-flex", alignItems: "center" }}>
                <FiStar size="1rem" style={{ fill: filled ? GOLD : "none" }} />
              </span>
            );
          }

          return (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => onRate(star)}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                margin: 0,
                cursor: "pointer",
                color,
                display: "inline-flex",
                alignItems: "center",
              }}
              aria-label={`rate-${star}`}
            >
              <FiStar size="1rem" style={{ fill: filled ? GOLD : "none" }} />
            </button>
          );
        })}

        {totalRatings > 0 && (
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.82rem", marginInlineStart: "0.25rem" }}>
            {averageRating.toFixed(1)}
          </span>
        )}
      </div>

      <p style={{ margin: 0, color: "rgba(255,255,255,0.55)", fontSize: "0.82rem" }}>
        {totalRatings} users rated this shop
      </p>
    </div>
  );
}

export default ShopRating;
