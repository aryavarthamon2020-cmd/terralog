const sidebar = document.getElementById('sidebar');
const openSidebarBtn = document.getElementById('openSidebar');
const closeSidebarBtn = document.getElementById('closeSidebar');
const contentContainer = document.getElementById('contentContainer');
const searchInput = document.getElementById('searchInput');
const heroBanner = document.getElementById('heroBanner');

const modalOverlay = document.getElementById('modalOverlay');
const openModalBtn = document.getElementById('openModalBtn');
const openModalSidebar = document.getElementById('openModalSidebar');
const cancelModal = document.getElementById('cancelModal');
const sightingForm = document.getElementById('sightingForm');

const feedTabBtn = document.getElementById('feedTabBtn');
const rankTabBtn = document.getElementById('rankTabBtn');

let currentView = 'feed'; // 'feed' or 'leaderboard'
let currentCategory = 'all';
let searchQuery = '';

// Sidebar Controls
openSidebarBtn.addEventListener('click', () => sidebar.classList.add('open'));
closeSidebarBtn.addEventListener('click', () => sidebar.classList.remove('open'));

// Modal Controls
openModalBtn.addEventListener('click', () => modalOverlay.style.display = 'flex');
openModalSidebar.addEventListener('click', (e) => {
    e.preventDefault();
    sidebar.classList.remove('open');
    modalOverlay.style.display = 'flex';
});
cancelModal.addEventListener('click', () => modalOverlay.style.display = 'none');

// Rotating Hero Background Photos (Using your macro files 01bug.png & 02ant.png)
const backgrounds = ['01bug.png', '02ant.png'];
let bgIndex = 0;

function switchHeroBackground() {
    const currentImg = backgrounds[bgIndex];
    heroBanner.style.backgroundImage = `url('${currentImg}')`;
    bgIndex = (bgIndex + 1) % backgrounds.length;
}

switchHeroBackground();
setInterval(switchHeroBackground, 10000);

// Search Bar Listener
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderContent();
});

// Tab Buttons (Live Feed vs Rankings)
feedTabBtn.addEventListener('click', () => {
    feedTabBtn.classList.add('active-tab');
    rankTabBtn.classList.remove('active-tab');
    currentView = 'feed';
    renderContent();
});

rankTabBtn.addEventListener('click', () => {
    rankTabBtn.classList.add('active-tab');
    feedTabBtn.classList.remove('active-tab');
    currentView = 'leaderboard';
    renderContent();
});

// Sidebar Category Navigation
const menuItems = document.querySelectorAll('.sidebar-menu .menu-item[data-view]');
menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        menuItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        currentView = item.getAttribute('data-view');
        currentCategory = item.getAttribute('data-category');
        
        if (currentView === 'leaderboard') {
            rankTabBtn.classList.add('active-tab');
            feedTabBtn.classList.remove('active-tab');
        } else {
            feedTabBtn.classList.add('active-tab');
            rankTabBtn.classList.remove('active-tab');
        }
        
        sidebar.classList.remove('open');
        renderContent();
    });
});

// Initial Community Sightings
let sightings = [
    {
        id: 1,
        explorer: 'Vasudev',
        category: 'insects',
        image: '01bug.png',
        commonName: 'Rainbow Leaf Beetle',
        speciesName: 'Chrysolina americana',
        vibeMeter: 'chill',
        familyField: 'Chrysomelidae'
    },
    {
        id: 2,
        explorer: 'Rahul',
        category: 'insects',
        image: '02ant.png',
        commonName: 'Red Weaver Ant',
        speciesName: 'Oecophylla smaragdina',
        vibeMeter: 'caution',
        familyField: 'Formicidae'
    }
];

// Handle Form Submission for New Sightings
sightingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const explorer = document.getElementById('explorerName').value;
    const category = document.getElementById('sightingCategory').value;
    const photoInput = document.getElementById('sightingPhoto');
    const commonName = document.getElementById('commonName').value;
    const speciesName = document.getElementById('speciesName').value;
    const vibeMeter = document.getElementById('vibeMeter').value;
    const familyField = document.getElementById('familyField').value;

    const file = photoInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const newSighting = {
            id: Date.now(),
            explorer,
            category,
            image: event.target.result,
            commonName,
            speciesName,
            vibeMeter,
            familyField
        };

        sightings.unshift(newSighting);
        renderContent();

        sightingForm.reset();
        modalOverlay.style.display = 'none';
    };

    reader.readAsDataURL(file);
});

// Explorer Gamified Ranks
function getExplorerTitle(count) {
    if (count > 15) return '👑 Eco Grandmaster';
    if (count > 10) return '🦅 Master Naturalist';
    if (count > 5) return '🧭 Trailblazer';
    if (count > 2) return '🌿 Field Scout';
    return '🌱 Sprout';
}

// Render Content
function renderContent() {
    contentContainer.innerHTML = '';

    if (currentView === 'leaderboard') {
        renderLeaderboard();
        return;
    }

    const filtered = sightings.filter(item => {
        const matchesCategory = currentCategory === 'all' || item.category === currentCategory;
        const matchesSearch = item.commonName.toLowerCase().includes(searchQuery) || 
                              item.speciesName.toLowerCase().includes(searchQuery) ||
                              item.explorer.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        contentContainer.innerHTML = `<p style="color: #64748b; font-size: 13px; text-align: center; margin-top: 40px;">No observations found. Tap "+ Sighting" to add one!</p>`;
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'feed-grid';

    filtered.forEach(item => {
        let vibeText = "🟢 Chill";
        let vibeClass = "vibe-chill";
        if (item.vibeMeter === 'caution') {
            vibeText = "🟡 Caution";
            vibeClass = "vibe-caution";
        } else if (item.vibeMeter === 'spicy') {
            vibeText = "🔴 Spicy";
            vibeClass = "vibe-spicy";
        }

        const card = document.createElement('div');
        card.className = 'bio-card';
        card.innerHTML = `
            <div class="image-wrapper">
                <img src="${item.image}" alt="${item.commonName}">
                <div class="vibe-badge ${vibeClass}">${vibeText}</div>
            </div>
            <div class="bio-card-content">
                <div class="common-name">${item.commonName}</div>
                <div class="binomial-name">${item.speciesName || 'Species unclassified'}</div>
                <div class="taxonomy-info">
                    <span>Family: ${item.familyField || 'N/A'}</span>
                    <span style="color: #34d399;">By ${item.explorer}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    contentContainer.appendChild(grid);
}

// Render Leaderboard / Rankings
function renderLeaderboard() {
    const counts = {};
    sightings.forEach(s => {
        counts[s.explorer] = (counts[s.explorer] || 0) + 1;
    });

    const sortedExplorers = Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    const wrapper = document.createElement('div');
    wrapper.className = 'leaderboard-container';

    if (sortedExplorers.length === 0) {
        wrapper.innerHTML = `<p style="color: #64748b; font-size: 13px; text-align: center; margin-top: 40px;">No rankings yet. Start uploading sightings!</p>`;
    } else {
        sortedExplorers.forEach((exp, index) => {
            const title = getExplorerTitle(exp.count);
            const row = document.createElement('div');
            row.className = 'leaderboard-card';
            row.innerHTML = `
                <div class="rank-info">
                    <div class="rank-number">#${index + 1}</div>
                    <div class="explorer-details">
                        <h3>${exp.name}</h3>
                        <div class="explorer-title">${title}</div>
                    </div>
                </div>
                <div class="upload-count">${exp.count} Sightings</div>
            `;
            wrapper.appendChild(row);
        });
    }

    contentContainer.appendChild(wrapper);
}

// Initial Run
renderContent();