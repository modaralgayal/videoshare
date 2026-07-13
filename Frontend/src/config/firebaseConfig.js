import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAl4JC2Y3dm2cBXOGiVotntkelF6mTg0oM",
  authDomain: "videokuvaajat-b7fe0.firebaseapp.com",
  projectId: "videokuvaajat-b7fe0",
  storageBucket: "videokuvaajat-b7fe0.firebasestorage.app",
  messagingSenderId: "233139786180",
  appId: "1:233139786180:web:d21b434baba0ad55b25491",
  measurementId: "G-70V10SL168",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
