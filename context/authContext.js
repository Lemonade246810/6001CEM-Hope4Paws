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

  // Update local user data (used for Edit Profile)
  const setUserData = (newData) => {
    setUser((prev) => ({ ...prev, ...newData }));
  };

  // ---------------------------------------------------------------------------
  // Run default account creation ONCE per project
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const setupDefaults = async () => {
      try {
        await ensureAdmin();
        await ensureVolunteer();
      } catch (error) {
        console.log("⚠️ Default setup skipped:", error.message);
      }
    };
    setupDefaults();
  }, []);

  // Admin account seed
  const ensureAdmin = async () => {
    const email = "sulaiman@hope4paws.com";
    const password = "hopeadmin123";

    try {
      const adminUser = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", adminUser.user.uid), {
        username: "Sulaiman Sidek",
        email,
        role: "admin",
        userId: adminUser.user.uid,
        phone: "",
        profileImage: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        createdAt: new Date(),
      });

      console.log("✅ Default admin created!");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        console.log("ℹ️ Admin already exists.");
      }
    }
  };

  // Volunteer account seed
  const ensureVolunteer = async () => {
    const email = "volunteer@hope4paws.com";
    const password = "hopevol123";

    try {
      const volUser = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", volUser.user.uid), {
        username: "Default Volunteer",
        email,
        role: "volunteer",
        isAvailable: true,
        userId: volUser.user.uid,
        phone: "",
        profileImage: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        createdAt: new Date(),
      });

      console.log("✅ Default volunteer created!");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        console.log("ℹ️ Volunteer already exists.");
      }
    }
  };

  // Fetch Firestore user details
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

  // Auth state listener
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
      if (e.code.includes("invalid-email")) msg = "Invalid email address.";
      if (e.code.includes("wrong-password")) msg = "Wrong password.";
      if (e.code.includes("user-not-found")) msg = "User not found.";
      return { success: false, msg };
    }
  };

  // Registration
  const register = async (email, password, username) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(res.user, {
        displayName: username,
        photoURL: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
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
      if (e.code.includes("weak-password")) msg = "Password too weak.";
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

// Hook
export const useAuth = () => useContext(AuthContext);
