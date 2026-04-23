/**
 * firebase/auth.js
 * Firebase Authentication helper functions for DahabNow.
 * All auth operations (sign in, sign up, sign out) are centralised here.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * HOW TO CREATE THE ADMIN ACCOUNT (manual one-time setup)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Step 1: Go to https://console.firebase.google.com → your project
 * Step 2: Authentication → Users → "Add user"
 *         Email: admin@dahabnow.com   (or any email you choose)
 *         Password: choose a strong password
 *         Copy the generated UID.
 *
 * Step 3: Firestore Database → Collection "users" → Add document
 *         Document ID: <paste the UID from Step 2>
 *
 *         Fields to add:
 *         {
 *           accountId:    "<uid>"          (string)
 *           accountName:  "Admin"          (string)
 *           role:         "admin"          (string)
 *           permissions:  "full"           (string)
 *           isApproved:   true             (boolean)
 *           status:       "approved"       (string)
 *           createdAt:    <server timestamp>
 *         }
 *
 * Step 4: In Firestore Security Rules make sure that only authenticated
 *         users with role="admin" can read the /users collection broadly.
 *         (Example rules will be added in the Firebase Security phase.)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "./config";

// ─── Registration ────────────────────────────────────────────

/**
 * Register a new seller with email and password.
 * After registration, create the Firestore user document via firestore.js.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<UserCredential>}
 */
export const registerUser = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

// ─── Login ───────────────────────────────────────────────────

/**
 * Sign in an existing user with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<UserCredential>}
 */
export const loginUser = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

// ─── Logout ──────────────────────────────────────────────────

/**
 * Sign out the currently authenticated user.
 * @returns {Promise<void>}
 */
export const logoutUser = () => signOut(auth);

// ─── Password Management ─────────────────────────────────────

/**
 * Update the authenticated user's password.
 * Requires recent login (Firebase re-authentication may be needed).
 * @param {User}   user        - Firebase Auth user object
 * @param {string} newPassword
 * @returns {Promise<void>}
 */
export const changeUserPassword = (user, newPassword) =>
  updatePassword(user, newPassword);

/**
 * Send a password-reset email to the provided address.
 * @param {string} email
 * @returns {Promise<void>}
 */
export const resetPassword = (email) =>
  sendPasswordResetEmail(auth, email);
