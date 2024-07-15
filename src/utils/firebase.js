// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE,
  authDomain: "pixelpen-83235.firebaseapp.com",
  projectId: "pixelpen-83235",
  storageBucket: "pixelpen-83235.appspot.com",
  messagingSenderId: "241648058855",
  appId: "1:241648058855:web:8feba4f3965eb0f5817d42"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);