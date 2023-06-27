// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBvARUJXQwD4HYi2tDhLqScTEjF5-VC1c8",
  authDomain: "lendsqr-fp-decision-model.firebaseapp.com",
  projectId: "lendsqr-fp-decision-model",
  storageBucket: "lendsqr-fp-decision-model.appspot.com",
  messagingSenderId: "640926661344",
  appId: "1:640926661344:web:2d96c72c5ee19df09b2e85",
  measurementId: "G-R10652HE9Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app); 