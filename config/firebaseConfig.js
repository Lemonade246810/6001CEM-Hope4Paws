// firebaseConfig.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { collection, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Correct bucket for Expo Go uploads (web-based)
const firebaseConfig = {
  apiKey: "AIzaSyDZ7k_kVitXHka20oyoMMe3XPgRCAXR55k",
  authDomain: "fir-hope4paws.firebaseapp.com",
  projectId: "fir-hope4paws",
  storageBucket: "fir-hope4paws.firebasestorage.app",
  messagingSenderId: "968368813393",
  appId: "1:968368813393:web:1e59d8612da3f86cd08f70"
};

// Prevent duplicate initialization
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Auth (also protected from duplicates)
export const auth =
  getApps().length === 1
    ? initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      })
    : getAuth(app);

// Firestore
export const db = getFirestore(app);

// Storage
export const storage = getStorage(app);

// Optional refs
export const userRef = collection(db, "users");
export const animalsRef = collection(db, "Animals");
