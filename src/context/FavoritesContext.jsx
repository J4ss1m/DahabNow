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
  favoriteProducts: [],
  toggleFavoriteProduct: _noop,
  isFavoriteProduct: () => false,
});
const LS_KEY = "dahabnow_favorites";
const LS_PRODUCTS_KEY = "dahabnow_fav_products";

export function FavoritesProvider({ children }) {
  const { currentUser } = useAuth();
  const [favorites, setFavorites] = useState(new Set());
  const [favoriteProducts, setFavoriteProducts] = useState([]);

  /* ── Load on mount / user change ───────────────────────── */
  useEffect(() => {
    const load = async () => {
      if (currentUser) {
        try {
          const snap = await getDoc(doc(db, "users", currentUser.uid));
          const arr  = snap.data()?.favorites ?? [];
          const productArr = snap.data()?.favoriteProducts ?? [];
          setFavorites(new Set(arr));
          setFavoriteProducts(Array.isArray(productArr) ? productArr : []);
        } catch (e) { console.error("[FavoritesContext]", e); }
      } else {
        const raw = localStorage.getItem(LS_KEY);
        const rawProducts = localStorage.getItem(LS_PRODUCTS_KEY);
        setFavorites(new Set(raw ? JSON.parse(raw) : []));
        setFavoriteProducts(rawProducts ? JSON.parse(rawProducts) : []);
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

  /* ── Toggle product favorites ───────────────────────────── */
  const toggleFavoriteProduct = useCallback(async (productId) => {
    if (!productId) return;

    const wasFav = favoriteProducts.includes(productId);
    const next   = wasFav
      ? favoriteProducts.filter((id) => id !== productId)
      : [...favoriteProducts, productId];

    setFavoriteProducts(next);

    if (currentUser) {
      try {
        await updateDoc(doc(db, "users", currentUser.uid), {
          favoriteProducts: wasFav ? arrayRemove(productId) : arrayUnion(productId),
        });
      } catch (e) { console.error("[FavoritesContext] toggle product:", e); }
    } else {
      localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(next));
    }
  }, [favoriteProducts, currentUser]);

  const isFavoriteProduct = useCallback(
    (productId) => favoriteProducts.includes(productId),
    [favoriteProducts]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        favoriteProducts,
        toggleFavoriteProduct,
        isFavoriteProduct,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  // Returns safe defaults if called outside provider — never throws
  return useContext(FavoritesContext);
}
