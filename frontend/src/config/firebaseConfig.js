import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC80Z306GUY8F8gxySlHo19735pPxPkcXU",
  authDomain: "lecturerreportingapp-18bae.firebaseapp.com",
  projectId: "lecturerreportingapp-18bae",
  storageBucket: "lecturerreportingapp-18bae.firebasestorage.app",
  messagingSenderId: "570929243252",
  appId: "1:570929243252:web:bbf07fb0e88e36374b1d21"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
