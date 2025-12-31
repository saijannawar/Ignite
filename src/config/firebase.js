// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // 1. Import Auth Tools
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC1GPtXXUJ2D0etvB314vYyC3lOqRWQT0g",
  authDomain: "ignite-2a546.firebaseapp.com",
  projectId: "ignite-2a546",
  storageBucket: "ignite-2a546.firebasestorage.app",
  messagingSenderId: "704262396246",
  appId: "1:704262396246:web:56ef3064b30f731f30def7",
  measurementId: "G-87H35V2QDT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 2. Export the services so your app can use them
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider(); // Needed for Google Login
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;