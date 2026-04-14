import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDb3FjfOyXLrWq1tadMv8NIlTyH5u-gEUM",
  authDomain: "disney-bracket1.firebaseapp.com",
  projectId: "disney-bracket1",
  storageBucket: "disney-bracket1.firebasestorage.app",
  messagingSenderId: "495239904339",
  appId: "1:495239904339:web:aafbc5c45a323cf67adaa6",
  measurementId: "G-H0LGMVP8LJ",
  databaseURL: "https://disney-bracket1-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();
