import { useCallback, useEffect, useState } from "react";
import { collection, doc, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";

const LOCAL_STORAGE_KEY = "dahabnow_portfolios";

const parseLocalPortfolios = (value) => {
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((portfolio) => ({
      portfolioId: portfolio.portfolioId || `portfolio-${Date.now()}`,
      portfolioName: portfolio.portfolioName || "",
      createdAt: portfolio.createdAt || new Date().toISOString(),
      items: Array.isArray(portfolio.items) ? portfolio.items : [],
    }));
  } catch {
    return [];
  }
};

const getPortfolioCollection = (uid) => collection(doc(db, "users", uid), "portfolios");

const readLocalPortfolios = () => {
  return parseLocalPortfolios(localStorage.getItem(LOCAL_STORAGE_KEY));
};

const writeLocalPortfolios = (portfolios) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(portfolios));
};

export function usePortfolios() {
  const { currentUser, loading: authLoading } = useAuth();
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRemotePortfolios = useCallback(async () => {
    if (!currentUser) return [];
    const snap = await getDocs(getPortfolioCollection(currentUser.uid));
    return snap.docs.map((docSnap) => ({
      portfolioId: docSnap.id,
      ...docSnap.data(),
      items: Array.isArray(docSnap.data().items) ? docSnap.data().items : [],
    }));
  }, [currentUser]);

  const saveRemotePortfolio = useCallback(
    async (portfolio) => {
      if (!currentUser) return;
      await setDoc(doc(getPortfolioCollection(currentUser.uid), portfolio.portfolioId), portfolio);
    },
    [currentUser]
  );

  const removeRemotePortfolio = useCallback(
    async (portfolioId) => {
      if (!currentUser) return;
      await deleteDoc(doc(getPortfolioCollection(currentUser.uid), portfolioId));
    },
    [currentUser]
  );

  useEffect(() => {
    const initialize = async () => {
      if (authLoading) return;
      setLoading(true);

      if (currentUser) {
        const localPortfolios = readLocalPortfolios();
        if (localPortfolios.length > 0) {
          await Promise.all(localPortfolios.map((portfolio) => saveRemotePortfolio(portfolio)));
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
        const remotePortfolios = await loadRemotePortfolios();
        setPortfolios(remotePortfolios);
      } else {
        setPortfolios(readLocalPortfolios());
      }

      setLoading(false);
    };

    initialize();
  }, [authLoading, currentUser, loadRemotePortfolios, saveRemotePortfolio]);

  const persistPortfolios = useCallback(
    async (nextPortfolios) => {
      setPortfolios(nextPortfolios);
      if (currentUser) {
        await Promise.all(nextPortfolios.map((portfolio) => saveRemotePortfolio(portfolio)));
      } else {
        writeLocalPortfolios(nextPortfolios);
      }
    },
    [currentUser, saveRemotePortfolio]
  );

  const createPortfolio = useCallback(
    async (portfolioName) => {
      const newPortfolio = {
        portfolioId: crypto?.randomUUID?.() || `portfolio-${Date.now()}`,
        portfolioName,
        createdAt: new Date().toISOString(),
        items: [],
      };
      const nextPortfolios = [...portfolios, newPortfolio];
      await persistPortfolios(nextPortfolios);
      return newPortfolio;
    },
    [persistPortfolios, portfolios]
  );

  const deletePortfolio = useCallback(
    async (portfolioId) => {
      const next = portfolios.filter((portfolio) => portfolio.portfolioId !== portfolioId);
      setPortfolios(next);
      if (currentUser) {
        await removeRemotePortfolio(portfolioId);
      } else {
        writeLocalPortfolios(next);
      }
    },
    [currentUser, portfolios, removeRemotePortfolio]
  );

  const addItem = useCallback(
    async (portfolioId, item) => {
      const next = portfolios.map((portfolio) => {
        if (portfolio.portfolioId !== portfolioId) return portfolio;
        return {
          ...portfolio,
          items: [
            ...portfolio.items,
            {
              itemId: crypto?.randomUUID?.() || `item-${Date.now()}`,
              ...item,
            },
          ],
        };
      });
      await persistPortfolios(next);
    },
    [portfolios, persistPortfolios]
  );

  const deleteItem = useCallback(
    async (portfolioId, itemId) => {
      const next = portfolios.map((portfolio) => {
        if (portfolio.portfolioId !== portfolioId) return portfolio;
        return {
          ...portfolio,
          items: portfolio.items.filter((item) => item.itemId !== itemId),
        };
      });
      await persistPortfolios(next);
    },
    [portfolios, persistPortfolios]
  );

  return {
    portfolios,
    loading,
    createPortfolio,
    deletePortfolio,
    addItem,
    deleteItem,
  };
}

export default usePortfolios;
