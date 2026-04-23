/**
 * GoldPrice.js
 * Handles live gold price data and Zakat calculation for DahabNow.
 *
 * Live price API note:
 *   A free Gold API (e.g. https://www.goldapi.io or MetalPriceAPI) can be
 *   integrated in fetchGoldPrice(). The SAR price per gram is derived from
 *   the XAU/USD spot price × USD→SAR exchange rate ÷ 31.1035 (troy oz → g).
 *
 * Zakat rule:
 *   Minimum nisab threshold = 85g of gold (Hanafi/standard calculation).
 *   Zakat due = 2.5% of the total gold value if weight ≥ 85g.
 */
export class GoldPrice {
  #goldPriceRealTime;  // float — price per gram in SAR
  #lastUpdated;        // Date — timestamp of last successful fetch

  /**
   * @param {number} goldPriceRealTime - Initial price per gram in SAR (float)
   * @param {Date}   lastUpdated       - Timestamp of last price refresh
   */
  constructor(goldPriceRealTime = 0, lastUpdated = new Date()) {
    this.#goldPriceRealTime = goldPriceRealTime;
    this.#lastUpdated = lastUpdated;
  }

  // ─── Getters ────────────────────────────────────────────────
  getGoldPriceRealTime() { return this.#goldPriceRealTime; }
  getLastUpdated()       { return this.#lastUpdated; }

  // ─── Methods ─────────────────────────────────────────────────

  /**
   * Fetch the latest gold price from an external API and update internal state.
   * Prices are returned in SAR per gram.
   * @returns {Promise<number>} Updated price per gram in SAR
   */
  async fetchGoldPrice() {
    try {
      // TODO: Replace with actual Gold API endpoint and API key
      // Example endpoint: `https://api.goldapi.io/api/XAU/SAR`
      // const response = await fetch("GOLD_API_ENDPOINT", {
      //   headers: { "x-access-token": "YOUR_GOLD_API_KEY" }
      // });
      // const data = await response.json();
      // const pricePerOz = data.price; // SAR per troy oz
      // this.#goldPriceRealTime = pricePerOz / 31.1035; // convert to per gram
      // this.#lastUpdated = new Date();

      // Placeholder: return a static fallback price until API is wired
      this.#goldPriceRealTime = 220.5; // example SAR/g for 24K
      this.#lastUpdated = new Date();
      return this.#goldPriceRealTime;
    } catch (error) {
      console.error("[GoldPrice] Failed to fetch gold price:", error);
      throw error;
    }
  }

  /**
   * Calculate Zakat due for a given weight of gold.
   * Returns 0 if the weight is below the nisab threshold (85g).
   *
   * @param {number} weight - Weight of gold in grams
   * @returns {number} Zakat amount in SAR
   */
  calculateZakat(weight) {
    const NISAB_THRESHOLD_GRAMS = 85;
    const ZAKAT_RATE = 0.025; // 2.5%

    if (weight < NISAB_THRESHOLD_GRAMS) {
      return 0; // Below nisab — no Zakat due
    }

    const totalValue = weight * this.#goldPriceRealTime;
    return totalValue * ZAKAT_RATE;
  }
}
