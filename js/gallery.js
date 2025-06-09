// Variables globales pour la galerie
let allNFTs = [];
let filteredNFTs = [];
let currentPage = 1;
let itemsPerPage = 12;
let currentView = 'grid'; // 'grid' ou 'list'

// Initialisation de la galerie
document.addEventListener('DOMContentLoaded', function() {
    initializeGallery();
});

// Fonction d'initialisation principale
function initializeGallery() {
    setupEventListeners();
    loadGalleryNFTs();
    setupMobileMenu();
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Recherche
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
    
    // Filtres
    const filters = ['form-filter', 'behavior-filter', 'color-filter'];
    filters.forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.addEventListener('change', handleFilters);
        }
    });
    
    // Bouton effacer filtres
    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }
    
    // Options de vue
    const gridViewBtn = document.getElementById('grid-view');
    const listViewBtn = document.getElementById('list-view');
    
    if (gridViewBtn) {
        gridViewBtn.addEventListener('click', () => setView('grid'));
    }
    
    if (listViewBtn) {
        listViewBtn.addEventListener('click', () => setView('list'));
    }
}

// Chargement des NFTs pour la galerie
async function loadGalleryNFTs() {
    showLoadingState();
    
    try {
        const response = await fetch('data/nfts.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        allNFTs = await response.json();
        filteredNFTs = [...allNFTs];
        
        if (allNFTs.length === 0) {
            showEmptyState();
        } else {
            displayNFTs();
            updateResultsCount();
            setupPagination();
        }
        
    } catch (error) {
        console.error('Erreur lors du chargement des NFTs:', error);
        showErrorState();
    }
}

// Affichage des états
function showLoadingState() {
    hideAllStates();
    const loadingState = document.getElementById('loading-state');
    if (loadingState) {
        loadingState.style.display = 'flex';
    }
}

function showEmptyState() {
    hideAllStates();
    const emptyState = document.getElementById('empty-state');
    if (emptyState) {
        emptyState.style.display = 'block';
    }
}

function showErrorState() {
    hideAllStates();
    const errorState = document.getElementById('error-state');
    if (errorState) {
        errorState.style.display = 'block';
    }
}

function hideAllStates() {
    const states = ['loading-state', 'empty-state', 'error-state'];
    states.forEach(stateId => {
        const element = document.getElementById(stateId);
        if (element) {
            element.style.display = 'none';
        }
    });
}

// Affichage des NFTs
function displayNFTs() {
    hideAllStates();
    
    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) return;
    
    // Calculer les éléments à afficher pour la page actuelle
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const nftsToShow = filteredNFTs.slice(startIndex, endIndex);
    
    if (nftsToShow.length === 0) {
        showEmptyState();
        return;
    }
    
    galleryGrid.innerHTML = nftsToShow.map(nft => createNFTCard(nft)).join('');
    
    // Appliquer la vue actuelle
    galleryGrid.className = `gallery-grid ${currentView}-view`;
    
    // Ajouter les écouteurs d'événements pour les cartes
    setupCardEventListeners();
}

// Création d'une carte NFT
function createNFTCard(nft) {
    const formattedDate = formatDate(nft.created_at);
    const truncatedDescription = truncateText(nft.description, 120);
    
    // Extraire les attributs principaux
    const mainAttributes = nft.attributes.slice(0, 3);
    
    return `
        <div class="nft-card" data-nft-id="${nft.id}">
            <div class="nft-image-container">
                <img src="${nft.media.preview_gif}" 
                     alt="${nft.name}" 
                     class="nft-image"
                     loading="lazy"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDMwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjMUExQTFBIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2NjY2IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkltYWdlIG5vbiBkaXNwb25pYmxlPC90ZXh0Pgo8L3N2Zz4K'">
                <div class="nft-overlay">
                    <div class="overlay-actions">
                        <a href="nft-details.html?id=${nft.id}" class="overlay-btn">Voir Détails</a>
                        <a href="${nft.media.viewer_html}" target="_blank" class="overlay-btn">Expérience</a>
                    </div>
                </div>
            </div>
            <div class="nft-content">
                <h3 class="nft-title">${nft.name}</h3>
                <p class="nft-description">${truncatedDescription}</p>
                <div class="nft-attributes">
                    ${mainAttributes.map(attr => `
                        <span class="attribute-tag">${attr.trait_type}: ${attr.value}</span>
                    `).join('')}
                </div>
                <div class="nft-meta">
                    <span class="nft-id">#${nft.id}</span>
                    <span class="nft-date">${formattedDate}</span>
                </div>
            </div>
        </div>
    `;
}

// Configuration des écouteurs pour les cartes
function setupCardEventListeners() {
    const nftCards = document.querySelectorAll('.nft-card');
    
    nftCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Éviter la navigation si on clique sur un lien
            if (e.target.tagName === 'A') return;
            
            const nftId = this.dataset.nftId;
            if (nftId) {
                window.location.href = `nft-details.html?id=${nftId}`;
            }
        });
    });
}

// Gestion de la recherche
function handleSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    applyFilters();
}

// Gestion des filtres
function handleFilters() {
    applyFilters();
}

// Application des filtres
function applyFilters() {
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase().trim() || '';
    const formFilter = document.getElementById('form-filter')?.value || '';
    const behaviorFilter = document.getElementById('behavior-filter')?.value || '';
    const colorFilter = document.getElementById('color-filter')?.value || '';
    
    filteredNFTs = allNFTs.filter(nft => {
        // Filtre de recherche
        const matchesSearch = !searchTerm || 
            nft.name.toLowerCase().includes(searchTerm) ||
            nft.description.toLowerCase().includes(searchTerm) ||
            nft.id.toLowerCase().includes(searchTerm);
        
        // Filtre de forme
        const matchesForm = !formFilter || 
            nft.attributes.some(attr => 
                attr.trait_type === 'Form' && attr.value === formFilter
            );
        
        // Filtre de comportement
        const matchesBehavior = !behaviorFilter || 
            nft.attributes.some(attr => 
                attr.trait_type === 'Behavior' && attr.value === behaviorFilter
            );
        
        // Filtre de couleur
        const matchesColor = !colorFilter || 
            nft.attributes.some(attr => 
                attr.trait_type === 'Color Scheme' && attr.value === colorFilter
            );
        
        return matchesSearch && matchesForm && matchesBehavior && matchesColor;
    });
    
    // Réinitialiser à la première page
    currentPage = 1;
    
    // Mettre à jour l'affichage
    updateResultsCount();
    displayNFTs();
    setupPagination();
}

// Effacer tous les filtres
function clearAllFilters() {
    // Effacer la recherche
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Effacer les filtres
    const filters = ['form-filter', 'behavior-filter', 'color-filter'];
    filters.forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.value = '';
        }
    });
    
    // Réappliquer les filtres (qui seront vides)
    applyFilters();
}

// Mise à jour du compteur de résultats
function updateResultsCount() {
    const resultsCount = document.getElementById('results-count');
    if (!resultsCount) return;
    
    const total = filteredNFTs.length;
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, total);
    
    if (total === 0) {
        resultsCount.textContent = 'Aucun résultat trouvé';
    } else if (total <= itemsPerPage) {
        resultsCount.textContent = `${total} NFT${total > 1 ? 's' : ''} trouvé${total > 1 ? 's' : ''}`;
    } else {
        resultsCount.textContent = `${startIndex}-${endIndex} sur ${total} NFTs`;
    }
}

// Configuration de la pagination
function setupPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(filteredNFTs.length / itemsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Bouton précédent
    paginationHTML += `
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} 
                onclick="goToPage(${currentPage - 1})">
            ← Précédent
        </button>
    `;
    
    // Numéros de page
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="goToPage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="pagination-info">...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                    onclick="goToPage(${i})">
                ${i}
            </button>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="pagination-info">...</span>`;
        }
        paginationHTML += `<button class="pagination-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`;
    }
    
    // Bouton suivant
    paginationHTML += `
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} 
                onclick="goToPage(${currentPage + 1})">
            Suivant →
        </button>
    `;
    
    pagination.innerHTML = paginationHTML;
}

// Navigation vers une page
function goToPage(page) {
    const totalPages = Math.ceil(filteredNFTs.length / itemsPerPage);
    
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    displayNFTs();
    updateResultsCount();
    setupPagination();
    
    // Scroll vers le haut de la galerie
    const galleryContent = document.querySelector('.gallery-content');
    if (galleryContent) {
        galleryContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Changement de vue
function setView(view) {
    if (view !== 'grid' && view !== 'list') return;
    
    currentView = view;
    
    // Mettre à jour les boutons
    const gridBtn = document.getElementById('grid-view');
    const listBtn = document.getElementById('list-view');
    
    if (gridBtn && listBtn) {
        gridBtn.classList.toggle('active', view === 'grid');
        listBtn.classList.toggle('active', view === 'list');
    }
    
    // Mettre à jour l'affichage
    displayNFTs();
    
    // Sauvegarder la préférence
    localStorage.setItem('bioglyphs-view-preference', view);
}

// Fonction utilitaire de debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Fonction utilitaire pour formater les dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Fonction utilitaire pour tronquer le texte
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Configuration du menu mobile (réutilise la fonction de main.js)
function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!hamburger || !navMenu) return;
    
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Fermer le menu lors du clic sur un lien
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Restaurer les préférences au chargement
document.addEventListener('DOMContentLoaded', function() {
    const savedView = localStorage.getItem('bioglyphs-view-preference');
    if (savedView && (savedView === 'grid' || savedView === 'list')) {
        currentView = savedView;
        setView(savedView);
    }
});

// Export des fonctions pour utilisation globale
window.GalleryApp = {
    loadGalleryNFTs,
    clearAllFilters,
    goToPage,
    setView,
    allNFTs,
    filteredNFTs
};

