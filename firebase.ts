import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDjOp1PdnFL5J_YJXGWUnZD-HekZ1NK068",
  authDomain: "autoguyanav2.firebaseapp.com",
  projectId: "autoguyanav2",
  storageBucket: "autoguyanav2.firebasestorage.app",
  messagingSenderId: "466784081040",
  appId: "1:466784081040:web:43740cde68d27fff88b415",
  measurementId: "G-48ZL67DSJK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);