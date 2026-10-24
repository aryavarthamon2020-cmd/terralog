// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// Your Firebase configuration keys
const firebaseConfig = {
  apiKey: "AIzaSyB0_DBqOmPpzKU67xfI6HXddip_9IYCY78",
  authDomain: "terralog-684a4.firebaseapp.com",
  projectId: "terralog-684a4",
  storageBucket: "terralog-684a4.firebasestorage.app",
  messagingSenderId: "330849219534",
  appId: "1:330849219534:web:2fffd7f36bfa114044f19f",
  measurementId: "G-QNPY67WL34"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

console.log("Firebase connected successfully to TerraLog!");

// Handle form submission and save to Cloud Firestore & Storage
const sightingForm = document.getElementById("sightingForm");

if (sightingForm) {
  sightingForm.addEventListener("submit", async function(event) {
    event.preventDefault(); // Stops the page from refreshing

    try {
      // Grab values from your exact HTML form IDs
      const explorerName = document.getElementById("explorerName").value;
      const category = document.getElementById("sightingCategory").value;
      const commonName = document.getElementById("commonName").value;
      const speciesName = document.getElementById("speciesName").value;
      const vibeMeter = document.getElementById("vibeMeter").value;
      const familyField = document.getElementById("familyField").value;
      const photoFile = document.getElementById("sightingPhoto").files[0];

      let imageUrl = "";

      // If a photo was selected, upload it to Firebase Storage
      if (photoFile) {
        const storageRef = ref(storage, `nature_photos/${Date.now()}_${photoFile.name}`);
        const snapshot = await uploadBytes(storageRef, photoFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      // Save all details into your Firestore database
      await addDoc(collection(db, "sightings"), {
        explorerName: explorerName,
        category: category,
        commonName: commonName,
        speciesName: speciesName,
        vibeMeter: vibeMeter,
        familyField: familyField,
        imageUrl: imageUrl,
        createdAt: new Date()
      });

      alert("Sighting published to the cloud successfully! 🌿");
      
      // Reset form and close modal popup
      sightingForm.reset();
      const modalOverlay = document.getElementById("modalOverlay");
      if (modalOverlay) {
        modalOverlay.style.display = "none";
      }

    } catch (error) {
      console.error("Error saving sighting: ", error);
      alert("Oops! Failed to save. Check F12 console for details.");
    }
  });
}