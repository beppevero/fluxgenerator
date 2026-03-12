import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAxaOkLqolRVhk5I1x2irwCkrla1ok6YJc",
  authDomain: "quotygenerator.firebaseapp.com",
  projectId: "quotygenerator",
  storageBucket: "quotygenerator.firebasestorage.app",
  messagingSenderId: "1057153155273",
  appId: "1:1057153155273:web:73901c969a2c177cd18d18"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);