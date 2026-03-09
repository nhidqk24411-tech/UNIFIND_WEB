
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDyvHM1yEzCQGkmwNIcPUfvnpzdj44B1P4",
  authDomain: "unifind-ai.firebaseapp.com",
  databaseURL: "https://unifind-ai-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "unifind-ai",
  storageBucket: "unifind-ai.firebasestorage.app",
  messagingSenderId: "973756073892",
  appId: "1:973756073892:web:5010c54012dfc07273a331",
  measurementId: "G-GQC2KN7ZE7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
