import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBrccFhhBIBPQnylNvcgaDku3BpUzI-9PY",
  authDomain: "dahabnow.firebaseapp.com",
  projectId: "dahabnow",
  storageBucket: "dahabnow.firebasestorage.app",
  messagingSenderId: "76790850589",
  appId: "1:76790850589:web:ca31b256f34f2a14d5d2f4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);