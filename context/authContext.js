import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebaseConfig";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(undefined);

  // Create default admin + volunteer accounts once
  useEffect(() => {
    const setupDefaults = async () => {
      try {
        await Promise.all([ensureAdmin(), ensureVolunteer()]);
      } catch (error) {
        console.log("⚠️ Default account setup skipped:", error.message);
      }
    };
    setupDefaults();
  }, []);

  // Default admin account
  const ensureAdmin = async () => {
    const adminEmail = "sulaiman@hope4paws.com";
    const adminPassword = "hopeadmin123";

    try {
      const adminUser = await createUserWithEmailAndPassword(
        auth,
        adminEmail,
        adminPassword
      );

      await setDoc(doc(db, "users", adminUser.user.uid), {
        username: "Sulaiman Sidek",
        email: adminEmail,
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

  // Default volunteer account
  const ensureVolunteer = async () => {
    const volEmail = "volunteer@hope4paws.com";
    const volPassword = "hopevol123";

    try {
      const volUser = await createUserWithEmailAndPassword(
        auth,
        volEmail,
        volPassword
      );

      await setDoc(doc(db, "users", volUser.user.uid), {
        username: "Default Volunteer",
        email: volEmail,
        role: "volunteer",
        userId: volUser.user.uid,
        phone: "",
        isAvailable: true,
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

  // Firestore user data fetcher
  const fetchUserData = async (uid) => {
    try {
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) return null;
      return { userId: uid, ...snap.data() };
    } catch (error) {
      console.error("❌ Fetch user error:", error);
      return null;
    }
  };

  // Auth listener
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

  // Login function
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
      else if (e.code.includes("wrong-password")) msg = "Wrong password.";
      else if (e.code.includes("user-not-found")) msg = "User not found.";
      return { success: false, msg };
    }
  };

  // Register function (fixed & complete)
  const register = async (email, password, username) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      // update Firebase Auth profile name
      await updateProfile(res.user, {
        displayName: username,
        photoURL: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      });

      const newUser = {
        userId: res.user.uid,
        username,
        email,
        phone: "",
        role: "user",
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
      else if (e.code.includes("weak-password")) msg = "Password too weak.";
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
      value={{ user, isAuthenticated, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside provider");
  return ctx;
};
