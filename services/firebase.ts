
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBXXaWWoFqn6MpH6IWSm6CGaqUJzAmzbzA",
  authDomain: "dopamine-quiz.firebaseapp.com",
  projectId: "dopamine-quiz",
  storageBucket: "dopamine-quiz.firebasestorage.app",
  messagingSenderId: "822531459966",
  appId: "1:822531459966:web:8e7d2385090e997eb1c12f",
  measurementId: "G-6TWRMVGB18",
  databaseURL: "https://dopamine-quiz-default-rtdb.asia-southeast1.firebasedatabase.app" 
};

// Note: Replace databaseURL with your actual Firebase Realtime Database URL if different.
// Usually found in Firebase Console -> Realtime Database -> Data tab.

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export default app;
