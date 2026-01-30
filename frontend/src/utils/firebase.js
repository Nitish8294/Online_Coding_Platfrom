import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
         apiKey: "AIzaSyDrQtkIHpzNI8IAfX4RZrgBVN2rOh3AN6g",
         authDomain: "leetcode-ee8be.firebaseapp.com",
         projectId: "leetcode-ee8be",
         storageBucket: "leetcode-ee8be.firebasestorage.app",
         messagingSenderId: "1025476825722",
         appId: "1:1025476825722:web:ba5f2b4f922e38fef261c3",
         measurementId: "G-ND4NDPL1S7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Service Exports
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { analytics };
