/**
 * context/AuthContext.jsx  (Phase 2 — updated)
 * Provides the current authenticated user, their role, full profile,
 * and approval status to all child components via React Context.
 *
 * Firestore users document schema:
 *   {
 *     accountId:      string   (Firebase Auth UID)
 *     accountName:    string
 *     role:           "admin" | "seller" | "guest"
 *     sellerEmail:    string   (seller only)
 *     sellerNumber:   string   (seller only)
 *     contactWhatsApp:string   (seller only)
 *     isApproved:     boolean  (seller only; true for admins by default)
 *     status:         "pending" | "approved" | "rejected"
 *     createdAt:      Timestamp
 *   }
 */

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc }        from "firebase/firestore";
import { auth, db }           from "../firebase/config";

// ─── Context Definition ──────────────────────────────────────

const AuthContext = createContext(null);

// ─── Provider ────────────────────────────────────────────────

export function AuthProvider({ children }) {
  /** @type {import("firebase/auth").User | null} */
  const [currentUser, setCurrentUser] = useState(null);

  /** @type {"admin" | "seller" | "guest"} */
  const [userRole, setUserRole] = useState("guest");

  /**
   * Full Firestore profile document (null for unauthenticated guests).
   * Contains accountName, role, isApproved, sellerEmail, etc.
   * @type {Object | null}
   */
  const [userProfile, setUserProfile] = useState(null);

  /** Whether the current seller is approved by admin */
  const [isApproved, setIsApproved] = useState(false);

  /** True while the initial onAuthStateChanged check is pending */
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef  = doc(db, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();

            setUserRole(data.role ?? "guest");
            setIsApproved(data.isApproved ?? false);
            setUserProfile({
              accountId:       firebaseUser.uid,
              accountName:     data.accountName ?? "",
              role:            data.role ?? "guest",
              sellerEmail:     data.sellerEmail ?? "",
              sellerNumber:    data.sellerNumber ?? "",
              contactWhatsApp: data.contactWhatsApp ?? "",
              isApproved:      data.isApproved ?? false,
              status:          data.status ?? "pending",
              permissions:     data.permissions ?? null,
            });
          } else {
            // Auth user exists but no Firestore record (edge case)
            setUserRole("guest");
            setIsApproved(false);
            setUserProfile(null);
          }
        } catch (err) {
          console.error("[AuthContext] Error fetching user profile:", err);
          setUserRole("guest");
          setIsApproved(false);
          setUserProfile(null);
        }

        setCurrentUser(firebaseUser);
      } else {
        // Signed out
        setCurrentUser(null);
        setUserRole("guest");
        setIsApproved(false);
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,  // Firebase Auth User | null
    userRole,     // "admin" | "seller" | "guest"
    userProfile,  // Full Firestore document data | null
    isApproved,   // boolean — seller approval status
    loading,      // boolean — true during initial auth check
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Custom Hook ─────────────────────────────────────────────

/**
 * @returns {{ currentUser, userRole, userProfile, isApproved, loading }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return context;
}
