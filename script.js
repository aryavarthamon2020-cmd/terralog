// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const openModalSidebar = document.getElementById("openModalSidebar");

if (openSidebarBtn && sidebar) {
  openSidebarBtn.addEventListener("click", () => {
    sidebar.classList.add("active");
    sidebar.style.display = "block";
    sidebar.style.transform = "translateX(0)";
  });
}

if (closeSidebarBtn && sidebar) {
  closeSidebarBtn.addEventListener("click", () => {
    sidebar.classList.remove("active");
    sidebar.style.transform = "translateX(-100%)";
  });
}

// --- 2. POP-UP MODAL CONTROLS (+ Sighting) ---
const modalOverlay = document.getElementById("modalOverlay");
const openModalBtn = document.getElementById("openModalBtn");
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
    if (sidebar) {
      sidebar.classList.remove("active");
      sidebar.style.transform = "translateX(-100%)";
    }
  });
}

if (cancelModal && modalOverlay) {
  cancelModal.addEventListener("click", () => {
    modalOverlay.style.display = "none";
  });
}

// --- 3. FETCH & DISPLAY LIVE FEED FROM DATABASE ---
async function loadSightings() {
  const container = document.getElementById("contentContainer");
  if (!container) return;

  container.innerHTML = "<p style='text-align:center; padding:20px; color:#555;'>Loading nature logs from cloud...</p>";

  try {
    const q = query(collection(db, "sightings"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      container.innerHTML = "<p style='text-align:center; padding:40px; color:#666;'>No sightings yet. Click '+ Sighting' to publish your first one! 🌿</p>";
      return;
    }

    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; padding: 20px;">';

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      html += `
        <div style="background: white; border-radius: 12px; padding: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e0e0e0;">
          ${data.imageUrl ? `<img src="${data.imageUrl}" alt="Wildlife photo" style="width: 100%; height: 180px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">` : ''}
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="background: #e8f5e9; color: #2e7d32; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; text-transform: uppercase;">${data.category || 'Nature'}</span>
            <span style="font-size: 12px; color: #666;">Vibe: ${data.vibeMeter || 'N/A'}</span>
          </div>
          <h3 style="margin: 5px 0 2px 0; font-size: 18px; color: #222;">${data.commonName || 'Untitled'}</h3>
          <p style="margin: 0 0 10px 0; font-size: 13px; color: #666; font-style: italic;">${data.speciesName || ''}</p>
          ${data.familyField ? `<p style="margin: 0 0 8px 0; font-size: 12px; color: #555;"><strong>Family:</strong> ${data.familyField}</p>` : ''}
          <hr style="border: none; border-top: 1px solid #eee; margin: 10px 0;">
          <p style="margin: 0; font-size: 12px; color: #888;">Explorer: <strong>${data.explorerName || 'Anonymous'}</strong></p>
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;

  } catch (error) {
    console.error("Error loading sightings:", error);
    container.innerHTML = "<p style='text-align:center; color:red; padding:20px;'>Failed to load feed. Check F12 console.</p>";
  }
}

// Load feed automatically when page opens
loadSightings();

// --- 4. SAVE SIGHTING TO CLOUD & REFRESH FEED ---
const sightingForm = document.getElementById("sightingForm");

if (sightingForm) {
  sightingForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    try {
      const explorerName = document.getElementById("explorerName").value;
      const category = document.getElementById("sightingCategory").value;
      const commonName = document.getElementById("commonName").value;
      const speciesName = document.getElementById("speciesName").value;
      const vibeMeter = document.getElementById("vibeMeter").value;
      const familyField = document.getElementById("familyField").value;
      const photoFile = document.getElementById("sightingPhoto").files[0];

      let imageUrl = "";

      if (photoFile) {
        imageUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(photoFile);
        });
      }

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

      loadSightings();

    } catch (error) {
      console.error("Error saving sighting: ", error);
      alert("Oops! Failed to save. Check F12 console for details.");
    }
  });
}