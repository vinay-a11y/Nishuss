import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD1P-LOQpBAhbqSKPFGVTythOco6FI08hQ",
  authDomain: "briyani-fe26c.firebaseapp.com",
  databaseURL: "https://briyani-fe26c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "briyani-fe26c",
  storageBucket: "briyani-fe26c.firebasestorage.app",
  messagingSenderId: "265449095944",
  appId: "1:265449095944:web:32a2ee9c4683cc583722bd"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);