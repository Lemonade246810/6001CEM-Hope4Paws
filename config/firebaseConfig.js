import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { collection, getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDZ7k_kVitXHka20oyoMMe3XPgRCAXR55k",
  authDomain: "fir-hope4paws.firebaseapp.com",
  projectId: "fir-hope4paws",
  storageBucket: "fir-hope4paws.firebasestorage.app",
  messagingSenderId: "968368813393",
  appId: "1:968368813393:web:1e59d8612da3f86cd08f70",
};

// Initialize
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app);
}

export { auth };

// Firestore / Storage / Functions
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, "asia-southeast1");

// Optional references
export const userRef = collection(db, "users");
export const animalsRef = collection(db, "Animals");
