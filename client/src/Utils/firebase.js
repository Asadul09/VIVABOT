
import { initializeApp } from "firebase/app";
import { getAuth,GoogleAuthProvider  } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewiq-95038.firebaseapp.com",
  projectId: "interviewiq-95038",
  storageBucket: "interviewiq-95038.firebasestorage.app",
  messagingSenderId: "627302468750",
  appId: "1:627302468750:web:758585d964f9a3bea94ddf"
};


const app = initializeApp(firebaseConfig);


const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export { auth, provider };