import * as firebaseApp from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

// --- STEP 1: PASTE YOUR FIREBASE CONFIG HERE ---
// Get this from: Firebase Console -> Project Settings -> General -> Your apps
const firebaseConfig = {
  apiKey: "AIzaSyCzTDCw_-1NmP3_lVCX4sxLvBV_a8vw3Jc",
  authDomain: "highwindracing.firebaseapp.com",
  projectId: "highwindracing",
  storageBucket: "highwindracing.firebasestorage.app",
  messagingSenderId: "468007576996",
  appId: "1:468007576996:web:df6bcf67e0ddd329dd8d31"
};

let db: Firestore | null = null;

// Initialize Firebase only if the user has updated the config
// This prevents the "Blank Page" crash by falling back gracefully if config is missing
if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
  try {
    const app = firebaseApp.initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase connected successfully");
  } catch (error) {
    console.error("Error initializing Firebase:", error);
  }
} else {
  console.log("Firebase config not set. Using local demo data.");
}

export { db };