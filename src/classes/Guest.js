/**
 * Guest.js
 * Represents an unauthenticated visitor on DahabNow.
 * Guests can browse shops and products but cannot manage anything.
 * Does NOT extend Account — guests have no login credentials.
 */
export class Guest {
  // Guests have no persistent attributes; browsing is stateless.

  constructor() {
    // No initialisation needed for a guest session
  }

  // ─── Methods ─────────────────────────────────────────────────

  /**
   * Browse all approved shops, optionally filtered by city/area.
   * @param {Object} filters - e.g. { city: "Riyadh", area: "Olaya" }
   * @returns {Promise<Array>} Array of shop objects from Firestore
   */
  browseShops(filters = {}) {
    // Delegated to firebase/firestore.js
  }

  /**
   * Search products or shops filtered by gold karat.
   * @param {number} karat - Gold purity (e.g. 18, 21, 24)
   * @returns {Promise<Array>} Filtered product results
   */
  searchByKarat(karat) {
    // Delegated to firebase/firestore.js
  }

  /**
   * Initiate contact with a seller (WhatsApp deep-link or email).
   * @param {string} sellerId       - Seller's UID
   * @param {string} contactMethod  - "whatsapp" | "email"
   */
  contactSeller(sellerId, contactMethod = "whatsapp") {
    // Opens WhatsApp or email link; no Firestore write needed
  }
}
