/**
 * Account.js
 * Base class for all logged-in users in DahabNow.
 * Seller and SystemAdmin both extend this class.
 */
export class Account {
  // Private fields using ES2022 class field syntax
  #accountId;
  #accountName;
  #hashedPassword;

  /**
   * @param {string} accountId      - Unique identifier from Firestore / Firebase Auth
   * @param {string} accountName    - Display name of the account holder
   * @param {string} hashedPassword - Hashed password (stored server-side; kept here for OOP purity)
   */
  constructor(accountId, accountName, hashedPassword) {
    this.#accountId = accountId;
    this.#accountName = accountName;
    this.#hashedPassword = hashedPassword;
  }

  // ─── Getters ────────────────────────────────────────────────
  getAccountId() {
    return this.#accountId;
  }

  getAccountName() {
    return this.#accountName;
  }

  // ─── Methods ─────────────────────────────────────────────────

  /**
   * Authenticate the user via Firebase Auth.
   * Concrete implementation lives in auth.js; this is the interface stub.
   */
  login() {
    // Implemented by subclasses or delegated to firebase/auth.js
  }

  /**
   * Sign the user out via Firebase Auth.
   */
  logout() {
    // Delegated to firebase/auth.js
  }

  /**
   * Change account password through Firebase Auth.
   * @param {string} newPassword
   */
  changePassword(newPassword) {
    // Delegated to firebase/auth.js
  }
}
