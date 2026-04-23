/**
 * firebase/firestore.js
 * Firestore database helper functions for DahabNow.
 *
 * Collections used across the platform:
 *   - users        → { uid, name, email, role, isApproved, createdAt }
 *   - shops        → { shopId, sellerId, shopName, shopCity, shopArea, ... }
 *   - products     → { productId, shopId, name, karat, weight, imageUrl, ... }
 *   - areas        → { areaId, areaName, cityName, shopIds[] }
 *   - messages     → { messageId, senderId, recipientId, shopId, content, ... }
 *   - notifications→ { notificationId, recipientId, title, message, isRead, ... }
 *   - favorites    → { favoriteId, userId, shopId, savedAt }
 *   - advertisements → { adId, sellerId, imageUrl, isApproved, startDate, endDate }
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

// ─── Users ───────────────────────────────────────────────────

/**
 * Create a new user document in the users collection.
 * Called immediately after successful Firebase Auth registration.
 * @param {string} uid  - Firebase Auth UID
 * @param {Object} data - { name, email, role, ... }
 */
export const createUserDocument = (uid, data) =>
  setDoc(doc(db, "users", uid), { ...data, createdAt: serverTimestamp() });

/**
 * Get a single user document by UID.
 * @param {string} uid
 * @returns {Promise<DocumentSnapshot>}
 */
export const getUserById = (uid) => getDoc(doc(db, "users", uid));

/**
 * Update fields of an existing user document.
 * @param {string} uid
 * @param {Object} data
 */
export const updateUser = (uid, data) =>
  updateDoc(doc(db, "users", uid), data);

// ─── Shops ───────────────────────────────────────────────────

/**
 * Add a new shop document.
 * @param {Object} shopData
 * @returns {Promise<DocumentReference>}
 */
export const addShop = (shopData) =>
  addDoc(collection(db, "shops"), { ...shopData, createdAt: serverTimestamp() });

/**
 * Get all approved shops (for guest browsing).
 * @returns {Promise<QuerySnapshot>}
 */
export const getApprovedShops = () =>
  getDocs(query(collection(db, "shops"), where("isApproved", "==", true)));

/**
 * Get a single shop by Firestore document ID.
 * @param {string} shopId
 * @returns {Promise<DocumentSnapshot>}
 */
export const getShopById = (shopId) => getDoc(doc(db, "shops", shopId));

/**
 * Update a shop document.
 * @param {string} shopId
 * @param {Object} data
 */
export const updateShop = (shopId, data) =>
  updateDoc(doc(db, "shops", shopId), data);

// ─── Products ────────────────────────────────────────────────

/**
 * Add a product to a shop's product gallery.
 * @param {Object} productData - Includes shopId, name, karat, weight, imageUrl, etc.
 * @returns {Promise<DocumentReference>}
 */
export const addProduct = (productData) =>
  addDoc(collection(db, "products"), {
    ...productData,
    createdAt: serverTimestamp(),
  });

/**
 * Get all products for a given shop.
 * @param {string} shopId
 * @returns {Promise<QuerySnapshot>}
 */
export const getProductsByShop = (shopId) =>
  getDocs(query(collection(db, "products"), where("shopId", "==", shopId)));

/**
 * Update a product document.
 * @param {string} productId
 * @param {Object} data
 */
export const updateProduct = (productId, data) =>
  updateDoc(doc(db, "products", productId), data);

/**
 * Delete a product document.
 * @param {string} productId
 */
export const deleteProduct = (productId) =>
  deleteDoc(doc(db, "products", productId));

// ─── Sellers (admin management) ──────────────────────────────

/**
 * Approve a seller by setting isApproved=true and status='approved'.
 * @param {string} sellerId - Seller UID
 */
export const approveSeller = (sellerId) =>
  updateDoc(doc(db, "users", sellerId), {
    isApproved: true,
    status: "approved",
  });

/**
 * Reject a seller by setting isApproved=false and status='rejected'.
 * @param {string} sellerId
 * @param {string} reason
 */
export const rejectSeller = (sellerId, reason = "") =>
  updateDoc(doc(db, "users", sellerId), {
    isApproved: false,
    status: "rejected",
    rejectionReason: reason,
  });

/**
 * Get all sellers with pending approval.
 * @returns {Promise<QuerySnapshot>}
 */
export const getPendingSellers = () =>
  getDocs(
    query(
      collection(db, "users"),
      where("role", "==", "seller"),
      where("status", "==", "pending")
    )
  );
