/**
 * SystemAdmin.js
 * Represents a platform administrator on DahabNow.
 * Extends Account — inherits login, logout, changePassword.
 * Has elevated privileges: can approve/reject sellers and assign shops to areas.
 */
import { Account } from "./Account";

export class SystemAdmin extends Account {
  /**
   * @param {string} accountId      - Unique admin UID
   * @param {string} accountName    - Admin's display name
   * @param {string} hashedPassword - Hashed password
   */
  constructor(accountId, accountName, hashedPassword) {
    super(accountId, accountName, hashedPassword);
  }

  // ─── Methods ─────────────────────────────────────────────────

  /**
   * Approve a seller's registration, setting isApproved = true in Firestore.
   * @param {string} sellerId - Firestore UID of the seller to approve
   */
  approveSeller(sellerId) {
    // Delegated to firebase/firestore.js
  }

  /**
   * Reject a seller's registration, setting status = 'rejected' in Firestore.
   * @param {string} sellerId - Firestore UID of the seller to reject
   * @param {string} reason   - Optional rejection reason message
   */
  rejectSeller(sellerId, reason = "") {
    // Delegated to firebase/firestore.js
  }

  /**
   * Assign an approved shop to a specific city area.
   * @param {string} shopId - Firestore document ID of the shop
   * @param {string} areaId - Firestore document ID of the area
   */
  assignShopToArea(shopId, areaId) {
    // Delegated to firebase/firestore.js
  }
}
