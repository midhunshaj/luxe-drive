import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCPG73kax70KwIrrjaNUIH9jvTtqEFDKSs",
  authDomain: "luxe-drive-3c429.firebaseapp.com",
  projectId: "luxe-drive-3c429",
  storageBucket: "luxe-drive-3c429.firebasestorage.app",
  messagingSenderId: "444742182056",
  appId: "1:444742182056:web:5bbc9642f04ddd7451ce9d",
  measurementId: "G-RJ5J9KZMND"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth for use in our pages
export const auth = getAuth(app);
export default app;
