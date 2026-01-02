// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // 1. Import Auth Tools
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBZ2Fckkk_vYE_ItmmYq6U82ZHj41M3ZMM",
  authDomain: "ignite-8ad50.firebaseapp.com",
  projectId: "ignite-8ad50",
  storageBucket: "ignite-8ad50.firebasestorage.app",
  messagingSenderId: "806280061234",
  appId: "1:806280061234:web:9abd17a5aacad32b00372b",
  measurementId: "G-DTTK1QGMXE"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider(); 
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
