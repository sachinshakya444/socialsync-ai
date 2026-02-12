// client/src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // <-- Nayi Line

// Aapka wahi purana Config (Isme ched-chaad mat karna)
const firebaseConfig = {
    apiKey: "AIzaSyA4QktGeSEpeU7I1ecbu3rZmdi8HsrupaM",
    authDomain: "socialsync-ai-9d39f.firebaseapp.com",
    projectId: "socialsync-ai-9d39f",
    storageBucket: "socialsync-ai-9d39f.firebasestorage.app",
    messagingSenderId: "803990759522",
    appId: "1:803990759522:web:bdd863a0feeb1fcc35493b"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // <-- Database Export
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error("Login Failed:", error);
  }
};

export const logout = () => signOut(auth);