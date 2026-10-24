// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

console.log("Firebase connected successfully to TerraLog!");

// --- 1. SIDEBAR MENU CONTROLS ---
const sidebar = document.getElementById("sidebar");
const openSidebarBtn = document.getElementById("openSidebar");
const closeSidebarBtn = document.getElementById("closeSidebar");

if (openSidebarBtn && sidebar) {
  openSidebarBtn.addEventListener("click", () => {
    sidebar.classList.add("active");
  });
}

if (closeSidebarBtn && sidebar) {
  closeSidebarBtn.addEventListener("click", () => {
    sidebar.classList.remove("active");
  });
}

// --- 2. POP-UP MODAL CONTROLS (+ Sighting) ---
const modalOverlay = document.getElementById("modalOverlay");
const openModalBtn = document.getElementById("openModalBtn");
const openModalSidebar = document.getElementById("openModalSidebar");
const cancelModal = document.getElementById("cancelModal");

if (openModalBtn && modalOverlay) {
  openModalBtn.addEventListener("click", () => {
    modalOverlay.style.display = "flex";
  });
}

if (openModalSidebar && modalOverlay) {
  openModalSidebar.addEventListener("click", (e) => {
    e.preventDefault();
    modalOverlay.style.display = "flex";
    if (sidebar) sidebar.classList.remove("active");
  });
}

if (cancelModal && modalOverlay) {
  cancelModal.addEventListener("click", () => {
    modalOverlay.style.display = "none";
  });
}

// --- 3. SAVE SIGHTING DIRECTLY TO FIRESTORE ---
const sightingForm = document.getElementById("sightingForm");

if (sightingForm) {
  sightingForm.addEventListener("submit", async function(event) {
    event.preventDefault(); // Stops page from refreshing

    try {
      const explorerName = document.getElementById("explorerName").value;
      const category = document.getElementById("sightingCategory").value;
      const commonName = document.getElementById("commonName").value;
      const speciesName = document.getElementById("speciesName").value;
      const vibeMeter = document.getElementById("vibeMeter").value;
      const familyField = document.getElementById("familyField").value;
      const photoFile = document.getElementById("sightingPhoto").files[0];

      let imageUrl = "";

      // Convert image file into a direct data string (No Storage bucket needed!)
      if (photoFile) {
        imageUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(photoFile);
        });
      }

      // Save everything right into your Firestore database
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
      
      sightingForm.reset();
      if (modalOverlay) {
        modalOverlay.style.display = "none";
      }

    } catch (error) {
      console.error("Error saving sighting: ", error);
      alert("Oops! Failed to save. Check F12 console for details.");
    }
  });
}