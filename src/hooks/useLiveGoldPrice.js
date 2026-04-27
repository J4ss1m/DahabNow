/**
 * hooks/useLiveGoldPrice.js
 * Custom hook to fetch live gold prices.
 * Returns prices for 24K, 22K, 21K, 18K in SAR/gram
 * Updates every 60 seconds
 */

import { useState, useEffect, useRef } from "react";

const DEFAULT_USD_TO_SAR = 3.75;
const TROY_OUNCE_TO_GRAM = 31.1035;

// Fallback prices (SAR/g) if API fails
const FALLBACK_PRICES = { 24: 568.14, 22: 520.80, 21: 497.12, 18: 426.10 };

const convertToSARperGram = (pricePerOzUSD, usdToSarRate) => {
  return (pricePerOzUSD / TROY_OUNCE_TO_GRAM) * usdToSarRate;
};

const calculateKaratPrices = (spotUsd, usdToSarRate) => {
  const price24K = convertToSARperGram(spotUsd, usdToSarRate);
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
      // 1) Get live XAU spot in USD/oz (cache-busted + no-store)
      const spotRes = await fetch(
        `https://api.metals.live/v1/spot/gold?ts=${Date.now()}`,
        { cache: "no-store" }
      );
      if (!spotRes.ok) throw new Error("Spot API error");
      const spotData = await spotRes.json();
      const spotUsd = Array.isArray(spotData) ? spotData[0]?.gold : spotData?.gold;
      if (!spotUsd || isNaN(spotUsd)) throw new Error("Invalid spot data");

      // 2) Get live USD -> SAR rate for Saudi-localized pricing
      let usdToSarRate = DEFAULT_USD_TO_SAR;
      try {
        const fxRes = await fetch(
          `https://open.er-api.com/v6/latest/USD?ts=${Date.now()}`,
          { cache: "no-store" }
        );
        if (fxRes.ok) {
          const fxData = await fxRes.json();
          const sar = fxData?.rates?.SAR;
          if (sar && !isNaN(sar)) usdToSarRate = Number(sar);
        }
      } catch {
        // Keep default peg if FX endpoint is temporarily unavailable
      }

      const next = calculateKaratPrices(spotUsd, usdToSarRate);
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
