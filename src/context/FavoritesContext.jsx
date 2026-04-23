/**
 * context/FavoritesContext.jsx
 * Global favorites state — localStorage for guests, Firestore array for logged-in users.
 * Provides: isFavorite(shopId), toggleFavorite(shopId), favorites (Set)
 */

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db }       from "../firebase/config";
import { useAuth }  from "./AuthContext";

const _noop = () => {};
const FavoritesContext = createContext({
  favorites:      new Set(),
  toggleFavorite: _noop,
  isFavorite:     () => false,
});
const LS_KEY = "dahabnow_favorites";

export function FavoritesProvider({ children }) {
  const { currentUser } = useAuth();
  const [favorites, setFavorites] = useState(new Set());

  /* ── Load on mount / user change ───────────────────────── */
  useEffect(() => {
    const load = async () => {
      if (currentUser) {
        try {
          const snap = await getDoc(doc(db, "users", currentUser.uid));
          const arr  = snap.data()?.favorites ?? [];
          setFavorites(new Set(arr));
        } catch (e) { console.error("[FavoritesContext]", e); }
      } else {
        const raw = localStorage.getItem(LS_KEY);
        setFavorites(new Set(raw ? JSON.parse(raw) : []));
      }
    };
    load();
  }, [currentUser]);

  /* ── Toggle ─────────────────────────────────────────────── */
  const toggleFavorite = useCallback(async (shopId) => {
    const wasFav = favorites.has(shopId);
    const next   = new Set(favorites);
    if (wasFav) next.delete(shopId);
    else        next.add(shopId);
    setFavorites(next);

    if (currentUser) {
      try {
        await updateDoc(doc(db, "users", currentUser.uid), {
          favorites: wasFav ? arrayRemove(shopId) : arrayUnion(shopId),
        });
      } catch (e) { console.error("[FavoritesContext] toggle:", e); }
    } else {
      localStorage.setItem(LS_KEY, JSON.stringify([...next]));
    }
  }, [favorites, currentUser]);

  const isFavorite = useCallback((shopId) => favorites.has(shopId), [favorites]);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  // Returns safe defaults if called outside provider — never throws
  return useContext(FavoritesContext);
}
