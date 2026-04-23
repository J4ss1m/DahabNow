/**
 * Advertisement.js
 * Represents a hero slider or promotional ad on DahabNow.
 * Sellers can request ads; admins approve and schedule them.
 */
export class Advertisement {
  #adId;
  #sellerId;       // UID of the seller who owns this ad
  #imageUrl;       // Firebase Storage URL for the ad banner
  #linkUrl;        // Optional deep-link to a shop or product page
  #title;
  #isApproved;     // boolean — admin must approve before display
  #startDate;      // Date — when the ad goes live
  #endDate;        // Date — when the ad expires

  /**
   * @param {string}  adId       - Firestore document ID
   * @param {string}  sellerId   - Owner seller's UID
   * @param {string}  imageUrl   - Banner image URL
   * @param {string}  linkUrl    - Click-through destination URL
   * @param {string}  title      - Ad headline / label
   * @param {boolean} isApproved - Admin approval status
   * @param {Date}    startDate  - Display start date
   * @param {Date}    endDate    - Display end date
   */
  constructor(
    adId,
    sellerId,
    imageUrl,
    linkUrl = "",
    title = "",
    isApproved = false,
    startDate = new Date(),
    endDate = new Date()
  ) {
    this.#adId = adId;
    this.#sellerId = sellerId;
    this.#imageUrl = imageUrl;
    this.#linkUrl = linkUrl;
    this.#title = title;
    this.#isApproved = isApproved;
    this.#startDate = startDate;
    this.#endDate = endDate;
  }

  // ─── Getters ────────────────────────────────────────────────
  getAdId()       { return this.#adId; }
  getSellerId()   { return this.#sellerId; }
  getImageUrl()   { return this.#imageUrl; }
  getLinkUrl()    { return this.#linkUrl; }
  getTitle()      { return this.#title; }
  getIsApproved() { return this.#isApproved; }
  getStartDate()  { return this.#startDate; }
  getEndDate()    { return this.#endDate; }

  // ─── Methods ─────────────────────────────────────────────────

  /**
   * Check whether the ad is currently active (approved & within date range).
   * @returns {boolean}
   */
  isActive() {
    const now = new Date();
    return this.#isApproved && now >= this.#startDate && now <= this.#endDate;
  }

  /**
   * Return a plain object for Firestore writes.
   * @returns {Object}
   */
  toFirestoreObject() {
    return {
      adId:       this.#adId,
      sellerId:   this.#sellerId,
      imageUrl:   this.#imageUrl,
      linkUrl:    this.#linkUrl,
      title:      this.#title,
      isApproved: this.#isApproved,
      startDate:  this.#startDate,
      endDate:    this.#endDate,
    };
  }
}
