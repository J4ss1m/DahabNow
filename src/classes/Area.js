/**
 * Area.js
 * Represents a geographic area (neighbourhood) within a Saudi city on DahabNow.
 * Admins create areas and assign shops to them.
 */
export class Area {
  #areaId;
  #areaName;    // e.g. "Al-Olaya", "Al-Malaz"
  #cityName;    // e.g. "Riyadh", "Jeddah", "Dammam"
  #shopIds;     // Array<string> — IDs of shops assigned to this area

  /**
   * @param {string}   areaId   - Firestore document ID
   * @param {string}   areaName - Neighbourhood / district name
   * @param {string}   cityName - Parent city name
   * @param {string[]} shopIds  - Firestore IDs of shops in this area
   */
  constructor(areaId, areaName, cityName, shopIds = []) {
    this.#areaId = areaId;
    this.#areaName = areaName;
    this.#cityName = cityName;
    this.#shopIds = shopIds;
  }

  // ─── Getters ────────────────────────────────────────────────
  getAreaId()   { return this.#areaId; }
  getAreaName() { return this.#areaName; }
  getCityName() { return this.#cityName; }
  getShopIds()  { return [...this.#shopIds]; } // return a copy to protect encapsulation

  // ─── Methods ─────────────────────────────────────────────────

  /**
   * Add a shop ID to this area's shop list.
   * @param {string} shopId - Firestore ID of the shop to add
   */
  addShop(shopId) {
    if (!this.#shopIds.includes(shopId)) {
      this.#shopIds.push(shopId);
    }
  }

  /**
   * Remove a shop ID from this area's shop list.
   * @param {string} shopId - Firestore ID of the shop to remove
   */
  removeShop(shopId) {
    this.#shopIds = this.#shopIds.filter((id) => id !== shopId);
  }

  /**
   * Return a plain object for Firestore writes.
   * @returns {Object}
   */
  toFirestoreObject() {
    return {
      areaId:   this.#areaId,
      areaName: this.#areaName,
      cityName: this.#cityName,
      shopIds:  this.#shopIds,
    };
  }
}
