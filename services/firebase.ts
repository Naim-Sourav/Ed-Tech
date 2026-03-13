import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getMessaging } from "firebase/messaging"; // নতুন যুক্ত করা হয়েছে

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXXaWWoFqn6MpH6IWSm6CGaqUJzAmzbzA",
  authDomain: "dopamine-quiz.firebaseapp.com",
  projectId: "dopamine-quiz",
  storageBucket: "dopamine-quiz.firebasestorage.app",
  messagingSenderId: "822531459966",
  appId: "1:822531459966:web:8e7d2385090e997eb1c12f",
  measurementId: "G-6TWRMVGB18",
  databaseURL: "https://dopamine-quiz-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

// নোটিফিকেশন পাঠানোর জন্য messaging ইনিশিয়ালাইজ ও এক্সপোর্ট করা হলো
export const messaging = getMessaging(app);

export default app;
