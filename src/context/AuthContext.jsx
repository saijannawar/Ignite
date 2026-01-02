// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut 
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'admin' or 'client'
  const [loading, setLoading] = useState(true);

  // --- 1. GOOGLE SIGN IN + DB CREATION ---
  const googleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user document exists in Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // If NO document, create one with default data
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          role: "client", // Default role
          createdAt: serverTimestamp(),
          phoneNumber: user.phoneNumber || ""
        });
        setUserRole("client");
      } else {
        // If document exists, just set the role in state
        setUserRole(userSnap.data().role);
      }
      
      return user;
    } catch (error) {
      console.error("Google Sign In Error:", error);
      throw error;
    }
  };

  // --- 2. LOGOUT FUNCTION ---
  const logout = () => {
    return signOut(auth);
  };

  // --- 3. SESSION LISTENER (For Page Refresh) ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, fetch their role to keep state consistent
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        } else {
          setUserRole("client");
        }
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    loading,
    googleSignIn, // ✅ Exposed for Login Page
    logout        // ✅ Exposed for Navbar/Profile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};