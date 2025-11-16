import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebaseConfig";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(undefined);

  const setUserData = (newData) => {
    setUser((prev) => ({ ...prev, ...newData }));
  };

  // Fetch Firestore user document
  const fetchUserData = async (uid) => {
    try {
      const snap = await getDoc(doc(db, "users", uid));
      if (!snap.exists()) return null;

      return { userId: uid, ...snap.data() };
    } catch (error) {
      console.error("❌ Fetch user error:", error);
      return null;
    }
  };

  // Listen to Firebase Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await fetchUserData(firebaseUser.uid);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return unsub;
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const userData = await fetchUserData(res.user.uid);

      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, userData };
    } catch (e) {
      let msg = "Login failed.";
      if (e.code.includes("invalid-email")) msg = "Invalid email.";
      if (e.code.includes("wrong-password")) msg = "Wrong password.";
      if (e.code.includes("user-not-found")) msg = "User not found.";
      return { success: false, msg };
    }
  };

  // Register (normal user only)
  const register = async (email, password, username) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(res.user, {
        displayName: username,
      });

      const newUser = {
        userId: res.user.uid,
        username,
        email,
        role: "user",
        phone: "",
        profileImage: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        createdAt: new Date(),
      };

      await setDoc(doc(db, "users", res.user.uid), newUser);

      setUser(newUser);
      setIsAuthenticated(true);

      return { success: true, data: newUser };
    } catch (e) {
      let msg = "Registration failed.";
      if (e.code.includes("email-already-in-use")) msg = "Email already in use.";
      if (e.code.includes("weak-password")) msg = "Weak password.";
      return { success: false, msg };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (e) {
      return { success: false, msg: e.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        logout,
        setUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
