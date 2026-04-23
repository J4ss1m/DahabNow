/**
 * Seller.js
 * Represents a shop owner on the DahabNow platform.
 * Extends Account — inherits login, logout, changePassword.
 */
import { Account } from "./Account";

export class Seller extends Account {
  #sellerEmail;
  #sellerNumber;
  #contactWhatsApp;
  #contactEmail;
  #isApproved;

  /**
   * @param {string}  accountId       - Unique user ID (Firebase Auth UID)
   * @param {string}  accountName     - Seller's display name
   * @param {string}  hashedPassword  - Hashed password
   * @param {string}  sellerEmail     - Seller's email address
   * @param {string}  sellerNumber    - Seller's phone number
   * @param {string}  contactWhatsApp - WhatsApp number for customer contact
   * @param {string}  contactEmail    - Public-facing email for customer contact
   * @param {boolean} isApproved      - Whether the admin has approved this seller
   */
  constructor(
    accountId,
    accountName,
    hashedPassword,
    sellerEmail,
    sellerNumber,
    contactWhatsApp,
    contactEmail,
    isApproved = false
  ) {
    super(accountId, accountName, hashedPassword);
    this.#sellerEmail = sellerEmail;
    this.#sellerNumber = sellerNumber;
    this.#contactWhatsApp = contactWhatsApp;
    this.#contactEmail = contactEmail;
    this.#isApproved = isApproved;
  }

  // ─── Getters ────────────────────────────────────────────────
  getSellerEmail()     { return this.#sellerEmail; }
  getSellerNumber()    { return this.#sellerNumber; }
  getContactWhatsApp() { return this.#contactWhatsApp; }
  getContactEmail()    { return this.#contactEmail; }
  getIsApproved()      { return this.#isApproved; }

  // ─── Methods ─────────────────────────────────────────────────

  /**
   * Register a new shop for this seller.
   * @param {Object} shopData - Shop details to write to Firestore
   */
  registerShop(shopData) {
    // Delegated to firebase/firestore.js
  }

  /**
   * Add a new product to the seller's shop gallery.
   * @param {Object} productData - Product details including image URL
   */
  addProduct(productData) {
    // Delegated to firebase/firestore.js
  }

  /**
   * Update an existing product's details.
   * @param {string} productId    - Firestore document ID of the product
   * @param {Object} updatedData  - Fields to update
   */
  updateProduct(productId, updatedData) {
    // Delegated to firebase/firestore.js
  }

  /**
   * Delete a product from the shop gallery.
   * @param {string} productId - Firestore document ID of the product
   */
  deleteProduct(productId) {
    // Delegated to firebase/firestore.js
  }
}
