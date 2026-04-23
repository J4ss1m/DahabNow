/**
 * Product.js
 * Represents a gold jewelry item listed in a shop's gallery on DahabNow.
 */
export class Product {
  #productId;
  #productName;
  #productDescription;
  #productPicture;   // String URL pointing to Firebase Storage image
  #karat;            // int — e.g. 18 | 21 | 24
  #weight;           // float — weight in grams
  #isAvailable;      // boolean — whether item is in stock

  /**
   * @param {string}  productId          - Firestore document ID
   * @param {string}  productName        - Display name of the item
   * @param {string}  productDescription - Detailed description
   * @param {string}  productPicture     - Firebase Storage download URL
   * @param {number}  karat              - Gold purity (18 | 21 | 24)
   * @param {number}  weight             - Weight in grams (float)
   * @param {boolean} isAvailable        - Stock availability flag
   */
  constructor(
    productId,
    productName,
    productDescription,
    productPicture,
    karat,
    weight,
    isAvailable = true
  ) {
    this.#productId = productId;
    this.#productName = productName;
    this.#productDescription = productDescription;
    this.#productPicture = productPicture;
    this.#karat = karat;
    this.#weight = weight;
    this.#isAvailable = isAvailable;
  }

  // ─── Getters ────────────────────────────────────────────────
  getProductId()          { return this.#productId; }
  getProductName()        { return this.#productName; }
  getProductDescription() { return this.#productDescription; }
  getProductPicture()     { return this.#productPicture; }
  getKarat()              { return this.#karat; }
  getWeight()             { return this.#weight; }
  getIsAvailable()        { return this.#isAvailable; }

  // ─── Methods ─────────────────────────────────────────────────

  /**
   * Return a plain object with all product details.
   * @returns {Object} Product details object
   */
  getProductDetails() {
    return {
      productId:          this.#productId,
      productName:        this.#productName,
      productDescription: this.#productDescription,
      productPicture:     this.#productPicture,
      karat:              this.#karat,
      weight:             this.#weight,
      isAvailable:        this.#isAvailable,
    };
  }

  /**
   * Check whether the product is currently available for purchase.
   * @returns {boolean}
   */
  checkAvailability() {
    return this.#isAvailable;
  }
}
