// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAl4JC2Y3dm2cBXOGiVotntkelF6mTg0oM",
  authDomain: "videokuvaajat-b7fe0.firebaseapp.com",
  projectId: "videokuvaajat-b7fe0",
  storageBucket: "videokuvaajat-b7fe0.firebasestorage.app",
  messagingSenderId: "233139786180",
  appId: "1:233139786180:web:d21b434baba0ad55b25491",
  measurementId: "G-70V10SL168",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const analytics = getAnalytics(app);
