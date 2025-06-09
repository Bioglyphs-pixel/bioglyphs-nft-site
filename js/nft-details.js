// Variables globales pour les détails NFT
let currentNFT = null;
let allNFTs = [];
let isVideoMode = true;

// Initialisation de la page de détails
document.addEventListener('DOMContentLoaded', function() {
    initializeNFTDetails();
});

// Fonction d'initialisation principale
function initializeNFTDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const nftId = urlParams.get('id');
    
    if (!nftId) {
        showErrorState();
        return;
    }
    
    loadNFTDetails(nftId);
    setupEventListeners();
    setupMobileMenu();
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Boutons d'action
    const shareBtn = document.getElementById('share-btn');
    const favoriteBtn = document.getElementById('favorite-btn');
    const playBtn = document.getElementById('play-btn');
    const toggleMediaBtn = document.getElementById('toggle-media');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const downloadMetadataBtn = document.getElementById('download-metadata');
    
    if (shareBtn) {
        shareBtn.addEventListener('click', openShareModal);
    }
    
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', toggleFavorite);
    }
    
    if (playBtn) {
        playBtn.addEventListener('click', playVideo);
    }
    
    if (toggleMediaBtn) {
        toggleMediaBtn.addEventListener('click', toggleMediaType);
    }
    
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }
    
    if (downloadMetadataBtn) {
        downloadMetadataBtn.addEventListener('click', downloadMetadata);
    }
    
    // Modal de partage
    const closeShareModal = document.getElementById('close-share-modal');
    const shareModal = document.getElementById('share-modal');
    
    if (closeShareModal) {
        closeShareModal.addEventListener('click', closeShareModalHandler);
    }
    
    if (shareModal) {
        shareModal.addEventListener('click', function(e) {
            if (e.target === shareModal) {
                closeShareModalHandler();
            }
        });
    }
    
    // Gestion du lecteur vidéo
    const video = document.getElementById('nft-video');
    if (video) {
        video.addEventListener('loadstart', function() {
            document.querySelector('.media-container').classList.remove('loaded');
        });
        
        video.addEventListener('loadeddata', function() {
            document.querySelector('.media-container').classList.add('loaded');
        });
        
        video.addEventListener('play', function() {
            const overlay = document.querySelector('.video-overlay');
            if (overlay) {
                overlay.style.display = 'none';
            }
        });
        
        video.addEventListener('pause', function() {
            const overlay = document.querySelector('.video-overlay');
            if (overlay) {
                overlay.style.display = 'flex';
            }
        });
    }
}

// Chargement des détails du NFT
async function loadNFTDetails(nftId) {
    try {
        const response = await fetch('data/nfts.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        allNFTs = await response.json();
        currentNFT = allNFTs.find(nft => nft.id === nftId);
        
        if (!currentNFT) {
            showErrorState();
            return;
        }
        
        displayNFTDetails();
        loadRelatedNFTs();
        updatePageMeta();
        
    } catch (error) {
        console.error('Erreur lors du chargement du NFT:', error);
        showErrorState();
    }
}

// Affichage des détails du NFT
function displayNFTDetails() {
    hideLoadingState();
    
    // Mise à jour du titre et de l'ID
    document.getElementById('nft-title').textContent = currentNFT.name;
    document.getElementById('nft-id').textContent = `#${currentNFT.id}`;
    document.getElementById('breadcrumb-title').textContent = currentNFT.name;
    
    // Mise à jour de la description
    document.getElementById('nft-description').textContent = currentNFT.description;
    
    // Configuration des médias
    setupMedia();
    
    // Affichage des attributs
    displayAttributes();
    
    // Mise à jour des détails techniques
    updateTechnicalDetails();
    
    // Configuration des liens
    setupLinks();
    
    // Vérifier les favoris
    updateFavoriteButton();
    
    // Afficher le contenu
    document.getElementById('nft-details').style.display = 'block';
}

// Configuration des médias (vidéo et GIF)
function setupMedia() {
    const video = document.getElementById('nft-video');
    const videoSource = document.getElementById('video-source');
    const gif = document.getElementById('nft-gif');
    
    if (video && videoSource) {
        videoSource.src = currentNFT.media.animation_url;
        video.poster = currentNFT.media.preview_gif;
        video.load();
    }
    
    if (gif) {
        gif.src = currentNFT.media.preview_gif;
        gif.alt = currentNFT.name;
    }
    
    // Initialiser en mode vidéo
    showVideoMode();
}

// Affichage des attributs
function displayAttributes() {
    const attributesGrid = document.getElementById('nft-attributes');
    if (!attributesGrid || !currentNFT.attributes) return;
    
    attributesGrid.innerHTML = currentNFT.attributes.map(attr => `
        <div class="attribute-item">
            <div class="attribute-type">${attr.trait_type}</div>
            <div class="attribute-value">${attr.value}</div>
        </div>
    `).join('');
}

// Mise à jour des détails techniques
function updateTechnicalDetails() {
    const creationDate = document.getElementById('creation-date');
    const updateDate = document.getElementById('update-date');
    
    if (creationDate) {
        creationDate.textContent = formatDate(currentNFT.created_at);
    }
    
    if (updateDate) {
        updateDate.textContent = formatDate(currentNFT.updated_at);
    }
}

// Configuration des liens
function setupLinks() {
    // Boutons d'action principaux
    const viewerBtn = document.getElementById('viewer-btn');
    const openseaBtn = document.getElementById('opensea-btn');
    
    if (viewerBtn) {
        viewerBtn.href = currentNFT.media.viewer_html;
    }
    
    if (openseaBtn) {
        openseaBtn.href = currentNFT.opensea_url || '#';
        if (!currentNFT.opensea_url) {
            openseaBtn.style.opacity = '0.5';
            openseaBtn.style.pointerEvents = 'none';
        }
    }
    
    // Liens IPFS
    const ipfsLinks = {
        'ipfs-video': currentNFT.media.animation_url,
        'ipfs-gif': currentNFT.media.preview_gif,
        'ipfs-viewer': currentNFT.media.viewer_html,
        'ipfs-metadata': currentNFT.media.metadata_json
    };
    
    Object.entries(ipfsLinks).forEach(([id, url]) => {
        const link = document.getElementById(id);
        if (link) {
            link.href = url;
        }
    });
}

// Chargement des NFTs similaires
function loadRelatedNFTs() {
    const relatedGrid = document.getElementById('related-grid');
    if (!relatedGrid) return;
    
    // Trouver des NFTs similaires basés sur les attributs
    const relatedNFTs = findSimilarNFTs(currentNFT, allNFTs, 3);
    
    if (relatedNFTs.length === 0) {
        relatedGrid.innerHTML = `
            <div class="no-related">
                <p>Aucun NFT similaire trouvé.</p>
            </div>
        `;
        return;
    }
    
    relatedGrid.innerHTML = relatedNFTs.map(nft => `
        <div class="related-card" onclick="goToNFT('${nft.id}')">
            <img src="${nft.media.preview_gif}" 
                 alt="${nft.name}" 
                 class="related-image"
                 loading="lazy"
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDI1MCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMUExQTFBIi8+Cjx0ZXh0IHg9IjEyNSIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2NjY2IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiPkltYWdlIG5vbiBkaXNwb25pYmxlPC90ZXh0Pgo8L3N2Zz4K'">
            <div class="related-content">
                <h4 class="related-title">${nft.name}</h4>
                <p class="related-description">${truncateText(nft.description, 80)}</p>
            </div>
        </div>
    `).join('');
}

// Trouver des NFTs similaires
function findSimilarNFTs(targetNFT, allNFTs, maxResults) {
    const otherNFTs = allNFTs.filter(nft => nft.id !== targetNFT.id);
    
    // Calculer la similarité basée sur les attributs
    const similarities = otherNFTs.map(nft => {
        let score = 0;
        const targetAttrs = targetNFT.attributes || [];
        const nftAttrs = nft.attributes || [];
        
        targetAttrs.forEach(targetAttr => {
            const matchingAttr = nftAttrs.find(attr => 
                attr.trait_type === targetAttr.trait_type && 
                attr.value === targetAttr.value
            );
            if (matchingAttr) {
                score += 1;
            }
        });
        
        return { nft, score };
    });
    
    // Trier par score de similarité et prendre les meilleurs
    return similarities
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults)
        .map(item => item.nft);
}

// Gestion des états d'affichage
function hideLoadingState() {
    const loadingState = document.getElementById('loading-state');
    if (loadingState) {
        loadingState.style.display = 'none';
    }
}

function showErrorState() {
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    
    if (loadingState) {
        loadingState.style.display = 'none';
    }
    
    if (errorState) {
        errorState.style.display = 'block';
    }
}

// Gestion du lecteur vidéo
function playVideo() {
    const video = document.getElementById('nft-video');
    if (video) {
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    }
}

function toggleMediaType() {
    const videoContainer = document.getElementById('nft-video').parentElement;
    const gifContainer = document.getElementById('gif-container');
    const toggleBtn = document.getElementById('toggle-media');
    const toggleText = document.getElementById('media-toggle-text');
    
    if (isVideoMode) {
        // Passer au mode GIF
        videoContainer.style.display = 'none';
        gifContainer.style.display = 'block';
        toggleText.textContent = 'Voir la vidéo';
        isVideoMode = false;
    } else {
        // Passer au mode vidéo
        videoContainer.style.display = 'block';
        gifContainer.style.display = 'none';
        toggleText.textContent = 'Voir l\'aperçu GIF';
        isVideoMode = true;
    }
}

function showVideoMode() {
    const videoContainer = document.getElementById('nft-video').parentElement;
    const gifContainer = document.getElementById('gif-container');
    const toggleText = document.getElementById('media-toggle-text');
    
    videoContainer.style.display = 'block';
    gifContainer.style.display = 'none';
    toggleText.textContent = 'Voir l\'aperçu GIF';
    isVideoMode = true;
}

function toggleFullscreen() {
    const mediaContainer = document.querySelector('.media-container');
    
    if (!document.fullscreenElement) {
        mediaContainer.requestFullscreen().catch(err => {
            console.error('Erreur lors du passage en plein écran:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

// Gestion des favoris
function toggleFavorite() {
    const favoriteBtn = document.getElementById('favorite-btn');
    if (!favoriteBtn || !currentNFT) return;
    
    const favorites = getFavorites();
    const isFavorite = favorites.includes(currentNFT.id);
    
    if (isFavorite) {
        // Retirer des favoris
        const newFavorites = favorites.filter(id => id !== currentNFT.id);
        localStorage.setItem('bioglyphs-favorites', JSON.stringify(newFavorites));
        favoriteBtn.textContent = '♡';
        favoriteBtn.classList.remove('active');
    } else {
        // Ajouter aux favoris
        favorites.push(currentNFT.id);
        localStorage.setItem('bioglyphs-favorites', JSON.stringify(favorites));
        favoriteBtn.textContent = '♥';
        favoriteBtn.classList.add('active');
    }
}

function getFavorites() {
    const favorites = localStorage.getItem('bioglyphs-favorites');
    return favorites ? JSON.parse(favorites) : [];
}

function updateFavoriteButton() {
    const favoriteBtn = document.getElementById('favorite-btn');
    if (!favoriteBtn || !currentNFT) return;
    
    const favorites = getFavorites();
    const isFavorite = favorites.includes(currentNFT.id);
    
    if (isFavorite) {
        favoriteBtn.textContent = '♥';
        favoriteBtn.classList.add('active');
    } else {
        favoriteBtn.textContent = '♡';
        favoriteBtn.classList.remove('active');
    }
}

// Gestion du partage
function openShareModal() {
    const shareModal = document.getElementById('share-modal');
    const shareUrlInput = document.getElementById('share-url-input');
    
    if (shareModal && shareUrlInput) {
        shareUrlInput.value = window.location.href;
        shareModal.style.display = 'flex';
    }
}

function closeShareModalHandler() {
    const shareModal = document.getElementById('share-modal');
    if (shareModal) {
        shareModal.style.display = 'none';
    }
}

function shareToTwitter() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Découvrez ce magnifique NFT Bioglyph : ${currentNFT.name}`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
}

function shareToFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}

function copyToClipboard() {
    const shareUrlInput = document.getElementById('share-url-input');
    if (shareUrlInput) {
        shareUrlInput.select();
        document.execCommand('copy');
        
        // Feedback visuel
        const copyBtn = document.querySelector('.copy-btn');
        if (copyBtn) {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copié !';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        }
    }
}

// Téléchargement des métadonnées
function downloadMetadata() {
    if (!currentNFT) return;
    
    const metadata = {
        ...currentNFT,
        downloaded_at: new Date().toISOString(),
        source: window.location.origin
    };
    
    const blob = new Blob([JSON.stringify(metadata, null, 2)], {
        type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentNFT.id}_metadata.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Navigation vers un autre NFT
function goToNFT(nftId) {
    window.location.href = `nft-details.html?id=${nftId}`;
}

// Mise à jour des métadonnées de la page
function updatePageMeta() {
    if (!currentNFT) return;
    
    // Titre de la page
    document.title = `${currentNFT.name} - Bioglyphs`;
    
    // Meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.content = `${currentNFT.name} - ${truncateText(currentNFT.description, 150)}`;
    }
    
    // Open Graph tags (pour le partage sur les réseaux sociaux)
    updateOrCreateMetaTag('property', 'og:title', currentNFT.name);
    updateOrCreateMetaTag('property', 'og:description', currentNFT.description);
    updateOrCreateMetaTag('property', 'og:image', currentNFT.media.preview_gif);
    updateOrCreateMetaTag('property', 'og:url', window.location.href);
    updateOrCreateMetaTag('property', 'og:type', 'website');
    
    // Twitter Card tags
    updateOrCreateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateOrCreateMetaTag('name', 'twitter:title', currentNFT.name);
    updateOrCreateMetaTag('name', 'twitter:description', currentNFT.description);
    updateOrCreateMetaTag('name', 'twitter:image', currentNFT.media.preview_gif);
}

function updateOrCreateMetaTag(attribute, name, content) {
    let tag = document.querySelector(`meta[${attribute}="${name}"]`);
    if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, name);
        document.head.appendChild(tag);
    }
    tag.content = content;
}

// Fonctions utilitaires
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

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

// Gestion des erreurs globales
window.addEventListener('error', function(e) {
    console.error('Erreur JavaScript:', e.error);
});

// Export des fonctions pour utilisation globale
window.NFTDetailsApp = {
    currentNFT,
    goToNFT,
    shareToTwitter,
    shareToFacebook,
    copyToClipboard,
    downloadMetadata
};

