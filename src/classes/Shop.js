/**
 * Shop.js
 * Represents a gold jewelry shop registered on DahabNow.
 * Each shop belongs to one seller and is assigned to a city area by the admin.
 */
export class Shop {
  #shopId;
  #shopName;
  #shopCity;
  #shopArea;
  #shopAddress;
  #contactWhatsApp;
  #contactEmail;

  /**
   * @param {string} shopId          - Firestore document ID
   * @param {string} shopName        - Display name of the shop
   * @param {string} shopCity        - City where the shop is located
   * @param {string} shopArea        - Neighbourhood / area within the city
   * @param {string} shopAddress     - Full address string
   * @param {string} contactWhatsApp - WhatsApp number for customer inquiries
   * @param {string} contactEmail    - Email for customer inquiries
   */
  constructor(
    shopId,
    shopName,
    shopCity,
    shopArea,
    shopAddress,
    contactWhatsApp,
    contactEmail
  ) {
    this.#shopId = shopId;
    this.#shopName = shopName;
    this.#shopCity = shopCity;
    this.#shopArea = shopArea;
    this.#shopAddress = shopAddress;
    this.#contactWhatsApp = contactWhatsApp;
    this.#contactEmail = contactEmail;
  }

  // ─── Getters ────────────────────────────────────────────────
  getShopId()          { return this.#shopId; }
  getShopName()        { return this.#shopName; }
  getShopCity()        { return this.#shopCity; }
  getShopArea()        { return this.#shopArea; }
  getShopAddress()     { return this.#shopAddress; }
  getContactWhatsApp() { return this.#contactWhatsApp; }
  getContactEmail()    { return this.#contactEmail; }

  // ─── Methods ─────────────────────────────────────────────────

  /**
   * Return a plain object with all public shop information.
   * @returns {Object} Shop info object
   */
  getShopInfo() {
    return {
      shopId:          this.#shopId,
      shopName:        this.#shopName,
      shopCity:        this.#shopCity,
      shopArea:        this.#shopArea,
      shopAddress:     this.#shopAddress,
      contactWhatsApp: this.#contactWhatsApp,
      contactEmail:    this.#contactEmail,
    };
  }

  /**
   * Fetch all products belonging to this shop from Firestore.
   * @returns {Promise<Array>} Array of product documents
   */
  getProducts() {
    // Delegated to firebase/firestore.js
  }
}
