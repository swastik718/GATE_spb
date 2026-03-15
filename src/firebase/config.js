import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// IMPORTANT: Replace these with actual Firebase configuration from the Console
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "event-management-sys-dbcee.firebaseapp.com",
  projectId: "event-management-sys-dbcee",
  storageBucket: "event-management-sys-dbcee.firebasestorage.app",
  messagingSenderId: "522768531784",
  appId: "1:522768531784:web:9ce0c5ba6b1a1d3147b37d",
  measurementId: "G-YHS5V4WQXT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
