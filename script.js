// Import Firebase SDKs from the official web connection
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// Your exact Firebase configuration keys
const firebaseConfig = {
  apiKey: "AIzaSyB0_DBqOmPpzKU67xfI6HXddip_9IYCY78",
  authDomain: "terralog-684a4.firebaseapp.com",
  projectId: "terralog-684a4",
  storageBucket: "terralog-684a4.firebasestorage.app",
  messagingSenderId: "330849219534",
  appId: "1:330849219534:web:2fffd7f36bfa114044f19f",
  measurementId: "G-QNPY67WL34"
};

// Initialize Firebase connection
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

console.log("Firebase connected successfully to TerraLog!");