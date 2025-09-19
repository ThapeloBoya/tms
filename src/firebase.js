// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC0pBwAm-anbyNpK_jDVI-c9rgHZqy42ak",
  authDomain: "tmst-c7b72.firebaseapp.com",
  projectId: "tmst-c7b72",
  storageBucket: "tmst-c7b72.firebasestorage.app",
  messagingSenderId: "356286973486",
  appId: "1:356286973486:web:a4eebbae88276ac22141bf",
  measurementId: "G-M4YC91BKW9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);