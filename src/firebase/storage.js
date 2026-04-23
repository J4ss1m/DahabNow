/**
 * firebase/storage.js
 * Firebase Storage helper functions for DahabNow.
 * Used to upload and delete product images and advertisement banners.
 */

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./config";

// ─── Upload ──────────────────────────────────────────────────

/**
 * Upload a product image to Firebase Storage.
 * Path format: products/{shopId}/{fileName}
 *
 * @param {File}   file   - The image File object from a file input
 * @param {string} shopId - Owning shop's Firestore ID (used for path namespacing)
 * @returns {Promise<string>} Public download URL of the uploaded image
 */
export const uploadProductImage = async (file, shopId) => {
  const storageRef = ref(storage, `products/${shopId}/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
};

/**
 * Upload an advertisement banner to Firebase Storage.
 * Path format: advertisements/{sellerId}/{fileName}
 *
 * @param {File}   file     - The banner image File object
 * @param {string} sellerId - Owning seller's UID
 * @returns {Promise<string>} Public download URL
 */
export const uploadAdBanner = async (file, sellerId) => {
  const storageRef = ref(storage, `advertisements/${sellerId}/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
};

// ─── Delete ──────────────────────────────────────────────────

/**
 * Delete a file from Firebase Storage by its full storage path (not URL).
 * Example path: "products/shopId123/1234567890_ring.jpg"
 *
 * @param {string} storagePath - Full path within Firebase Storage bucket
 * @returns {Promise<void>}
 */
export const deleteStorageFile = (storagePath) => {
  const fileRef = ref(storage, storagePath);
  return deleteObject(fileRef);
};
