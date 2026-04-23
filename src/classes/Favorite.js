/**
 * Favorite.js
 * Represents a saved shop bookmark by a guest (stored in localStorage)
 * or by a logged-in user (stored in Firestore).
 */
export class Favorite {
  #favoriteId;
  #userId;     // UID of the user (or "guest" for anonymous saves)
  #shopId;     // Firestore document ID of the saved shop
  #savedAt;    // Date — when the bookmark was created

  /**
   * @param {string} favoriteId - Unique identifier for this bookmark
   * @param {string} userId     - Owner's UID
   * @param {string} shopId     - Bookmarked shop's Firestore ID
   * @param {Date}   savedAt    - Timestamp of the save action
   */
  constructor(favoriteId, userId, shopId, savedAt = new Date()) {
    this.#favoriteId = favoriteId;
    this.#userId = userId;
    this.#shopId = shopId;
    this.#savedAt = savedAt;
  }

  // ─── Getters ────────────────────────────────────────────────
  getFavoriteId() { return this.#favoriteId; }
  getUserId()     { return this.#userId; }
  getShopId()     { return this.#shopId; }
  getSavedAt()    { return this.#savedAt; }

  // ─── Methods ─────────────────────────────────────────────────

  /**
   * Save the favorite to Firestore (for authenticated users).
   */
  save() {
    // Delegated to firebase/firestore.js
  }

  /**
   * Remove the favorite from Firestore.
   */
  remove() {
    // Delegated to firebase/firestore.js
  }

  /**
   * Return a plain object for Firestore writes.
   * @returns {Object}
   */
  toFirestoreObject() {
    return {
      favoriteId: this.#favoriteId,
      userId:     this.#userId,
      shopId:     this.#shopId,
      savedAt:    this.#savedAt,
    };
  }
}
