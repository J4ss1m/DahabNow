/**
 * hooks/useLiveGoldPrice.js
 * Custom hook to fetch live gold prices from api.metals.live
 * Returns prices for 24K, 22K, 21K, 18K in SAR/gram
 * Updates every 60 seconds
 */

import { useState, useEffect, useRef } from "react";

const USD_TO_SAR = 3.75;
const TROY_OUNCE_TO_GRAM = 31.1035;

// Fallback prices (SAR/g) if API fails
const FALLBACK_PRICES = { 24: 568.14, 22: 520.80, 21: 497.12, 18: 426.10 };

const convertToSARperGram = (pricePerOzUSD) => {
  return (pricePerOzUSD / TROY_OUNCE_TO_GRAM) * USD_TO_SAR;
};

const calculateKaratPrices = (spotUsd) => {
  const price24K = convertToSARperGram(spotUsd);
  return {
    24: parseFloat(price24K.toFixed(2)),
    22: parseFloat((price24K * (22 / 24)).toFixed(2)),
    21: parseFloat((price24K * (21 / 24)).toFixed(2)),
    18: parseFloat((price24K * (18 / 24)).toFixed(2)),
  };
};

export function useLiveGoldPrice() {
  const [prices, setPrices] = useState(null);
  const [prevPrices, setPrevPrices] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isError, setIsError] = useState(false);
  const prevRef = useRef(null);

  const fetchPrices = async () => {
    try {
      const res = await fetch(
        "https://www.goldapi.io/api/XAU/USD",
        {
          headers: {
            "x-access-token": "goldapi-demo",
            "Content-Type": "application/json"
          }
        }
      );
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const spotUsd = data.price_gram_24k * TROY_OUNCE_TO_GRAM;
      if (!spotUsd || isNaN(spotUsd)) throw new Error("Invalid data");
      const next = calculateKaratPrices(spotUsd);
      setPrevPrices(prevRef.current);
      prevRef.current = next;
      setPrices(next);
      setLastUpdate(new Date());
      setIsError(false);
    } catch (err) {
      if (!prevRef.current) {
        setPrices(FALLBACK_PRICES);
        prevRef.current = FALLBACK_PRICES;
      }
      setIsError(true);
    }
  };

  useEffect(() => {
    fetchPrices();
    const id = setInterval(fetchPrices, 60000);
    return () => clearInterval(id);
  }, []);

  return { prices, prevPrices, lastUpdate, isError };
}

export default useLiveGoldPrice;
