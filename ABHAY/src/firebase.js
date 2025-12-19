// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBMtxd5jPH5Y3WFkVWiZ2PgCRKRAOWilEY",
  authDomain: "ask-buildease.firebaseapp.com",
  projectId: "ask-buildease",
  storageBucket: "ask-buildease.firebasestorage.app",
  messagingSenderId: "776216331972",
  appId: "1:776216331972:web:617355b818b57905e7ab91",
  measurementId: "G-ED0RCD2GPV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only in browser environment
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, analytics };

