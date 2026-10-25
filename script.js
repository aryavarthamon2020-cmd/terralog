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

console.log("TerraLog initialized successfully!");

// --- 1. SIDEBAR NAVIGATION CONTROLS ---
const sidebar = document.getElementById("sidebar");
const openSidebarBtn = document.getElementById("openSidebar");
const closeSidebarBtn = document.getElementById("closeSidebar");

if (openSidebarBtn && sidebar) {
  openSidebarBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    sidebar.classList.add("active");
  });
}

if (closeSidebarBtn && sidebar) {
  closeSidebarBtn.addEventListener("click", () => {
    sidebar.classList.remove("active");
  });
}

window.addEventListener("click", (e) => {
  if (sidebar && sidebar.classList.contains("active")) {
    if (!sidebar.contains(e.target) && !openSidebarBtn.contains(e.target)) {
      sidebar.classList.remove("active");
    }
  }
});

// --- 2. MODAL CONTROLS (+ Sighting) ---
const modalOverlay = document.getElementById("modalOverlay");
const openModalBtn = document.getElementById("openModalBtn");
const cancelModal = document.getElementById("cancelModal");

if (openModalBtn && modalOverlay) {
  openModalBtn.addEventListener("click", () => {
    modalOverlay.style.display = "flex";
  });
}

if (cancelModal && modalOverlay) {
  cancelModal.addEventListener("click", () => {
    modalOverlay.style.display = "none";
  });
}

// --- 3. RANKINGS MODAL CONTROLS ---
const rankingsModal = document.getElementById("rankingsModal");
const openRankingsBtn = document.getElementById("openRankingsBtn");
const closeRankingsBtn = document.getElementById("closeRankingsBtn");
const rankingsContainer = document.getElementById("rankingsContainer");

if (openRankingsBtn && rankingsModal) {
  openRankingsBtn.addEventListener("click", async () => {
    rankingsModal.style.display = "flex";
    await loadRankings();
  });
}

if (closeRankingsBtn && rankingsModal) {
  closeRankingsBtn.addEventListener("click", () => {
    rankingsModal.style.display = "none";
  });
}

async function loadRankings() {
  rankingsContainer.innerHTML = "<p style='text-align:center; color:#94a3b8;'>Calculating leaderboard...</p>";
  try {
    const querySnapshot = await getDocs(collection(db, "sightings"));
    if (querySnapshot.empty) {
      rankingsContainer.innerHTML = "<p style='text-align:center; color:#94a3b8;'>No rankings available yet. Be the first explorer to log a sighting!</p>";
      return;
    }

    const counts = {};
    querySnapshot.forEach(doc => {
      const data = doc.data();
      const name = data.explorerName || "Anonymous Explorer";
      counts[name] = (counts[name] || 0) + 1;
    });

    const sortedExplorers = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    let html = "";
    sortedExplorers.forEach(([name, count], index) => {
      let badge = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🏅";
      html += `
        <div class="rank-item">
          <div>
            <span style="font-weight:bold; color:#86efac; margin-right:10px;">${badge} #${index + 1}</span>
            <span style="color:#f8fafc; font-weight:600;">${name}</span>
          </div>
          <div style="background:#166534; color:#86efac; padding:4px 10px; border-radius:12px; font-size:12px; font-weight:bold;">
            ${count} ${count === 1 ? 'Sighting' : 'Sightings'}
          </div>
        </div>
      `;
    });
    rankingsContainer.innerHTML = html;
  } catch (error) {
    console.error("Error loading rankings:", error);
    rankingsContainer.innerHTML = "<p style='text-align:center; color:#f87171;'>Failed to load rankings.</p>";
  }
}

// --- 4. CATEGORY MODAL & FILTERING FROM SIDEBAR ---
const categoryModal = document.getElementById("categoryModal");
const closeCategoryBtn = document.getElementById("closeCategoryBtn");
const categoryContainer = document.getElementById("categoryContainer");
const categoryModalTitle = document.getElementById("categoryModalTitle");

const categoryLinks = document.querySelectorAll("#categoryList a");
categoryLinks.forEach(link => {
  link.addEventListener("click", async (e) => {
    e.preventDefault();
    const selectedCat = link.getAttribute("data-category");
    if (sidebar) sidebar.classList.remove("active");
    
    categoryModalTitle.textContent = `${selectedCat} Sightings`;
    categoryModal.style.display = "flex";
    await loadCategorySightings(selectedCat);
  });
});

if (closeCategoryBtn && categoryModal) {
  closeCategoryBtn.addEventListener("click", () => {
    categoryModal.style.display = "none";
  });
}

async function loadCategorySightings(categoryName) {
  categoryContainer.innerHTML = "<p style='text-align:center; color:#94a3b8; padding:20px;'>Filtering logs...</p>";
  try {
    const q = query(collection(db, "sightings"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    const filtered = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      if (data.category === categoryName) {
        filtered.push(data);
      }
    });

    if (filtered.length === 0) {
      categoryContainer.innerHTML = `<p style='text-align:center; color:#94a3b8; padding:30px;'>No logs found under '${categoryName}' yet.</p>`;
      return;
    }

    let html = '<div class="feed-grid">';
    filtered.forEach(data => {
      html += `
        <div class="sighting-card">
          ${data.imageUrl ? `<img src="${data.imageUrl}" alt="Wildlife photo" style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">` : ''}
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="background: #166534; color: #86efac; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; text-transform: uppercase;">${data.category}</span>
            <span style="font-size: 11px; color: #cbd5e1;">Vibe: ${data.vibeMeter || 'N/A'}</span>
          </div>
          <h3 style="margin: 4px 0 2px 0; font-size: 16px; color: #fff;">${data.commonName || 'Untitled'}</h3>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8; font-style: italic;">${data.speciesName || ''}</p>
          ${data.familyField ? `<p style="margin: 0 0 6px 0; font-size: 12px; color: #cbd5e1;"><strong>Family:</strong> ${data.familyField}</p>` : ''}
          <hr style="border: none; border-top: 1px solid #166534; margin: 8px 0;">
          <p style="margin: 0; font-size: 11px; color: #94a3b8;">Explorer: <strong>${data.explorerName || 'Anonymous'}</strong></p>
        </div>
      `;
    });
    html += '</div>';
    categoryContainer.innerHTML = html;
  } catch (error) {
    console.error("Error loading category sightings:", error);
    categoryContainer.innerHTML = "<p style='text-align:center; color:#f87171;'>Failed to load filtered logs.</p>";
  }
}

// --- 5. FETCH & DISPLAY MAIN LIVE FEED ---
async function loadSightings() {
  const container = document.getElementById("contentContainer");
  if (!container) return;

  container.innerHTML = "<p style='text-align:center; padding:20px; color:#94a3b8;'>Loading nature logs from cloud...</p>";

  try {
    const q = query(collection(db, "sightings"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      container.innerHTML = "<p style='text-align:center; padding:40px; color:#cbd5e1;'>No sightings yet. Click '+ Sighting' to publish your first one! 🌿</p>";
      return;
    }

    let html = '<div class="feed-grid">';

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      html += `
        <div class="sighting-card">
          ${data.imageUrl ? `<img src="${data.imageUrl}" alt="Wildlife photo" style="width: 100%; height: 180px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">` : ''}
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="background: #166534; color: #86efac; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; text-transform: uppercase;">${data.category || 'Nature'}</span>
            <span style="font-size: 12px; color: #cbd5e1;">Vibe: ${data.vibeMeter || 'N/A'}</span>
          </div>
          <h3 style="margin: 5px 0 2px 0; font-size: 18px; color: #fff;">${data.commonName || 'Untitled'}</h3>
          <p style="margin: 0 0 10px 0; font-size: 13px; color: #94a3b8; font-style: italic;">${data.speciesName || ''}</p>
          ${data.familyField ? `<p style="margin: 0 0 8px 0; font-size: 12px; color: #cbd5e1;"><strong>Family:</strong> ${data.familyField}</p>` : ''}
          <hr style="border: none; border-top: 1px solid #166534; margin: 10px 0;">
          <p style="margin: 0; font-size: 12px; color: #94a3b8;">Explorer: <strong>${data.explorerName || 'Anonymous'}</strong></p>
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;

  } catch (error) {
    console.error("Error loading sightings:", error);
    container.innerHTML = "<p style='text-align:center; color:#f87171; padding:20px;'>Failed to load feed. Check F12 console.</p>";
  }
}

loadSightings();

// --- 6. SAVE SIGHTING TO CLOUD & REFRESH ---
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