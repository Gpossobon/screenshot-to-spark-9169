import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// Web config is public by design; access is controlled by firestore.rules.
const firebaseConfig = {
  apiKey: "AIzaSyBOjBW8-roL3XqZ6J6jGbMJBA6Dz89PzFI",
  authDomain: "mousetrapraceuniritter.firebaseapp.com",
  projectId: "mousetrapraceuniritter",
  storageBucket: "mousetrapraceuniritter.firebasestorage.app",
  messagingSenderId: "31052037817",
  appId: "1:31052037817:web:afe305d26febef9c1f6568",
};

let app: FirebaseApp | undefined;
function firebaseApp() {
  app ??= getApps()[0] ?? initializeApp(firebaseConfig);
  return app;
}
export const fbAuth = (): Auth => getAuth(firebaseApp());
export const fbDb = (): Firestore => getFirestore(firebaseApp());
