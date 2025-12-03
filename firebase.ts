
import * as firebaseApp from "firebase/app";
import { getFirestore } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";

// Config is now pulled from environment variables (Vercel or .env.local)
// The VITE_ prefix is required for Vite to expose these to the client
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let db: Firestore | null = null;

// Initialize Firebase only if the API key is present in the environment
if (firebaseConfig.apiKey) {
  try {
    const app = firebaseApp.initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase connected successfully");
  } catch (error) {
    console.error("Error initializing Firebase:", error);
  }
} else {
  console.log("Firebase config not found in environment variables. Using local demo data.");
}

export { db };
